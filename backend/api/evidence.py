"""
Evidence API
Handles uploading, linking, and viewing evidence during incident response
"""

from flask import Blueprint, request, jsonify, send_file, abort
from werkzeug.utils import secure_filename
from pathlib import Path
import hashlib
import uuid
import os

from database import db
from models.evidence import Evidence

evidence_bp = Blueprint("evidence", __name__)

# Local directory for storing uploaded files
EVIDENCE_DIR = Path(__file__).parent.parent / "data" / "evidence"
EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {"txt", "log", "png", "jpg", "jpeg", "pdf", "zip", "json", "csv"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def hash_file(file_path):
    """Calculate SHA256 hash of a file"""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


@evidence_bp.route("/", methods=["POST"])
def create_evidence():
    """
    Upload or link evidence to an incident or task.
    Supports:
      - File upload via multipart/form-data
      - URL or log/text evidence via JSON
    """
    try:
        # Handle file upload
        if "file" in request.files:
            file = request.files["file"]
            if not file or file.filename == "":
                return jsonify({"error": "No file selected"}), 400

            if not allowed_file(file.filename):
                return jsonify({"error": "File type not allowed"}), 400

            # Form fields
            incident_id = request.form.get("incident_id", type=int)
            task_execution_id = request.form.get("task_execution_id", type=int)
            title = request.form.get("title", file.filename)
            description = request.form.get("description", "")
            collected_by = request.form.get("collected_by", "Unknown")
            severity = request.form.get("severity", "informational")

            filename = secure_filename(file.filename)
            unique_name = f"{uuid.uuid4()}_{filename}"
            file_path = EVIDENCE_DIR / unique_name
            file.save(file_path)

            # Compute metadata
            file_hash = hash_file(file_path)
            file_size = os.path.getsize(file_path)
            mime_type = file.mimetype

            evidence = Evidence(
                incident_id=incident_id,
                task_execution_id=task_execution_id,
                evidence_type="file",
                title=title,
                description=description,
                filename=filename,
                file_path=str(file_path),
                file_size=file_size,
                file_hash=file_hash,
                mime_type=mime_type,
                collected_by=collected_by,
                severity=severity,
            )
            db.session.add(evidence)
            db.session.commit()

            return jsonify({"message": "File evidence uploaded", "evidence": evidence.to_dict()}), 201

        # Handle URL or text-based evidence
        if request.is_json:
            data = request.get_json()
            incident_id = data.get("incident_id")
            task_execution_id = data.get("task_execution_id")
            evidence_type = data.get("evidence_type", "url")
            title = data.get("title", "New Evidence")
            description = data.get("description", "")
            url = data.get("url")
            content = data.get("content")
            collected_by = data.get("collected_by", "Unknown")
            severity = data.get("severity", "informational")

            evidence = Evidence(
                incident_id=incident_id,
                task_execution_id=task_execution_id,
                evidence_type=evidence_type,
                title=title,
                description=description,
                url=url,
                content=content,
                collected_by=collected_by,
                severity=severity,
            )
            db.session.add(evidence)
            db.session.commit()

            return jsonify({"message": "Evidence created", "evidence": evidence.to_dict()}), 201

        return jsonify({"error": "Invalid request"}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@evidence_bp.route("/incident/<int:incident_id>", methods=["GET"])
def get_evidence_by_incident(incident_id):
    """Retrieve all evidence linked to a given incident"""
    evidence_list = Evidence.query.filter_by(incident_id=incident_id).all()
    return jsonify([e.to_dict() for e in evidence_list])


@evidence_bp.route("/task/<int:task_execution_id>", methods=["GET"])
def get_evidence_by_task(task_execution_id):
    """Retrieve all evidence linked to a specific task execution"""
    evidence_list = Evidence.query.filter_by(task_execution_id=task_execution_id).all()
    return jsonify([e.to_dict() for e in evidence_list])


@evidence_bp.route("/<int:evidence_id>", methods=["DELETE"])
def delete_evidence(evidence_id):
    """Delete an evidence record (and file if stored locally)"""
    evidence = Evidence.query.get(evidence_id)
    if not evidence:
        return jsonify({"error": "Evidence not found"}), 404

    # Remove file from disk if exists
    if evidence.file_path and os.path.exists(evidence.file_path):
        try:
            os.remove(evidence.file_path)
        except OSError:
            pass

    db.session.delete(evidence)
    db.session.commit()
    return jsonify({"message": f"Evidence {evidence_id} deleted"}), 200


@evidence_bp.route("/download/<int:evidence_id>", methods=["GET"])
def download_evidence(evidence_id):
    """Download or view an uploaded evidence file"""
    evidence = Evidence.query.get(evidence_id)
    if not evidence:
        return jsonify({"error": "Evidence not found"}), 404

    if not evidence.file_path or not os.path.exists(evidence.file_path):
        return jsonify({"error": "File not found on server"}), 404

    try:
        return send_file(
            evidence.file_path,
            as_attachment=True,
            download_name=evidence.filename,
            mimetype=evidence.mime_type or "application/octet-stream"
        )
    except Exception as e:
        abort(500, description=f"Error downloading file: {str(e)}")