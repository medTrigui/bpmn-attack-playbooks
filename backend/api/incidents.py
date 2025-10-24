"""
Incidents API endpoints
Manages incident execution and tracking
"""

from flask import Blueprint, jsonify, request
from database import db
from models.incident import Incident
from models.task_execution import TaskExecution
from models.evidence import Evidence
from models.timeline_event import TimelineEvent
from datetime import datetime
import xml.etree.ElementTree as ET
from pathlib import Path

incidents_bp = Blueprint('incidents', __name__)

# Path to playbooks
PLAYBOOKS_DIR = Path(__file__).parent.parent.parent / 'playbook-examples'

def parse_bpmn_tasks(bpmn_xml):
    """Extract tasks from BPMN XML for execution tracking"""
    try:
        root = ET.fromstring(bpmn_xml)
        tasks = []
        
        # Find all task elements
        task_elements = root.findall('.//{http://www.omg.org/spec/BPMN/20100524/MODEL}task')
        
        for task_elem in task_elements:
            task_data = {
                'task_id': task_elem.get('id'),
                'task_name': task_elem.get('name', 'Unnamed Task'),
                'task_type': 'task'
            }
            
            # Extract extension elements (IRP metadata and ATT&CK mappings)
            ext_elements = task_elem.find('.//{http://www.omg.org/spec/BPMN/20100524/MODEL}extensionElements')
            if ext_elements is not None:
                # Extract IRP metadata
                for child in ext_elements:
                    tag_name = child.tag.split('}')[-1] if '}' in child.tag else child.tag
                    
                    if 'metadata' in tag_name.lower():
                        for meta_child in child:
                            meta_tag = meta_child.tag.split('}')[-1] if '}' in meta_child.tag else meta_child.tag
                            meta_tag = meta_tag.replace('irp:', '')
                            
                            if meta_tag == 'phase':
                                task_data['phase'] = meta_child.text
                            elif meta_tag == 'role':
                                task_data['role'] = meta_child.text
                            elif meta_tag == 'tool':
                                task_data['tool'] = meta_child.text
                            elif meta_tag == 'priority':
                                task_data['priority'] = meta_child.text
                            elif meta_tag == 'estimatedTime':
                                task_data['estimated_time'] = meta_child.text
                    
                    # Extract ATT&CK mappings
                    if 'mapping' in tag_name.lower():
                        if 'attack_techniques' not in task_data:
                            task_data['attack_techniques'] = []
                            task_data['attack_tactics'] = []
                        
                        for attack_child in child:
                            attack_tag = attack_child.tag.split('}')[-1] if '}' in attack_child.tag else attack_child.tag
                            
                            if 'technique' in attack_tag.lower():
                                tech_id = attack_child.get('id')
                                if tech_id:
                                    task_data['attack_techniques'].append(tech_id)
                            elif 'tactic' in attack_tag.lower():
                                if attack_child.text:
                                    task_data['attack_tactics'].append(attack_child.text)
            
            tasks.append(task_data)
        
        return tasks
    except Exception as e:
        print(f"Error parsing BPMN: {e}")
        return []

@incidents_bp.route('/', methods=['GET'])
def list_incidents():
    """List all incidents with optional filtering"""
    status = request.args.get('status')  # active, completed, cancelled, on-hold
    severity = request.args.get('severity')  # low, medium, high, critical
    assigned_to = request.args.get('assigned_to')
    
    query = Incident.query
    
    if status:
        query = query.filter_by(status=status)
    if severity:
        query = query.filter_by(severity=severity)
    if assigned_to:
        query = query.filter_by(assigned_to=assigned_to)
    
    incidents = query.order_by(Incident.created_at.desc()).all()
    
    return jsonify({
        'count': len(incidents),
        'incidents': [incident.to_dict() for incident in incidents]
    })

@incidents_bp.route('/<int:incident_id>', methods=['GET'])
def get_incident(incident_id):
    """Get specific incident with all related data"""
    incident = Incident.query.get_or_404(incident_id)
    
    # Get related data
    tasks = TaskExecution.query.filter_by(incident_id=incident_id).all()
    evidence = Evidence.query.filter_by(incident_id=incident_id).all()
    timeline = TimelineEvent.query.filter_by(incident_id=incident_id).order_by(TimelineEvent.timestamp.desc()).all()
    
    return jsonify({
        'incident': incident.to_dict(),
        'tasks': [task.to_dict() for task in tasks],
        'evidence': [e.to_dict() for e in evidence],
        'timeline': [event.to_dict() for event in timeline]
    })

@incidents_bp.route('/', methods=['POST'])
def create_incident():
    """Create new incident from a playbook"""
    data = request.get_json()
    
    if not data or 'playbook_id' not in data:
        return jsonify({'error': 'playbook_id is required'}), 400
    
    playbook_id = data['playbook_id']
    
    # Load playbook BPMN
    playbook_path = PLAYBOOKS_DIR / f"{playbook_id}.bpmn"
    if not playbook_path.exists():
        return jsonify({'error': f'Playbook {playbook_id} not found'}), 404
    
    try:
        with open(playbook_path, 'r', encoding='utf-8') as f:
            bpmn_xml = f.read()
        
        # Parse tasks from BPMN
        tasks = parse_bpmn_tasks(bpmn_xml)
        
        # Create incident
        incident = Incident(
            title=data.get('title', f'Incident - {playbook_id}'),
            description=data.get('description', ''),
            playbook_id=playbook_id,
            playbook_name=data.get('playbook_name', playbook_id.replace('-', ' ').title()),
            status='active',
            severity=data.get('severity', 'medium'),
            assigned_to=data.get('assigned_to'),
            assigned_team=data.get('assigned_team'),
            incident_type=data.get('incident_type'),
            affected_systems=data.get('affected_systems', []),
            total_tasks=len(tasks),
            completed_tasks=0,
            started_at=datetime.utcnow()
        )
        
        db.session.add(incident)
        db.session.flush()  # Get incident ID
        
        # Create task executions
        for task_data in tasks:
            task_exec = TaskExecution(
                incident_id=incident.id,
                task_id=task_data.get('task_id'),
                task_name=task_data.get('task_name'),
                task_type=task_data.get('task_type', 'task'),
                status='pending',
                phase=task_data.get('phase'),
                role=task_data.get('role'),
                tool=task_data.get('tool'),
                priority=task_data.get('priority'),
                estimated_time=task_data.get('estimated_time'),
                attack_techniques=task_data.get('attack_techniques', []),
                attack_tactics=task_data.get('attack_tactics', [])
            )
            db.session.add(task_exec)
        
        # Create initial timeline event
        timeline_event = TimelineEvent(
            incident_id=incident.id,
            event_type='incident_created',
            title='Incident Created',
            description=f'Incident created from playbook: {playbook_id}',
            timestamp=datetime.utcnow(),
            performed_by=data.get('created_by', 'system'),
            severity='info',
            category='initialization'
        )
        db.session.add(timeline_event)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'incident': incident.to_dict(),
            'tasks_created': len(tasks)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@incidents_bp.route('/<int:incident_id>', methods=['PUT'])
def update_incident(incident_id):
    """Update incident details"""
    incident = Incident.query.get_or_404(incident_id)
    data = request.get_json()
    
    # Update allowed fields
    if 'title' in data:
        incident.title = data['title']
    if 'description' in data:
        incident.description = data['description']
    if 'status' in data:
        old_status = incident.status
        incident.status = data['status']
        
        # Add timeline event for status change
        timeline_event = TimelineEvent(
            incident_id=incident.id,
            event_type='status_changed',
            title=f'Status changed from {old_status} to {data["status"]}',
            timestamp=datetime.utcnow(),
            performed_by=data.get('updated_by', 'user'),
            severity='info'
        )
        db.session.add(timeline_event)
        
        # Update completion timestamp if completed
        if data['status'] == 'completed' and not incident.completed_at:
            incident.completed_at = datetime.utcnow()
    
    if 'severity' in data:
        incident.severity = data['severity']
    if 'assigned_to' in data:
        incident.assigned_to = data['assigned_to']
    if 'assigned_team' in data:
        incident.assigned_team = data['assigned_team']
    if 'notes' in data:
        incident.notes = data['notes']
    if 'final_report' in data:
        incident.final_report = data['final_report']
    
    incident.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'incident': incident.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@incidents_bp.route('/<int:incident_id>', methods=['DELETE'])
def delete_incident(incident_id):
    """Delete an incident (soft delete by setting status to cancelled)"""
    incident = Incident.query.get_or_404(incident_id)
    
    # Add timeline event
    timeline_event = TimelineEvent(
        incident_id=incident.id,
        event_type='incident_deleted',
        title='Incident Deleted',
        timestamp=datetime.utcnow(),
        performed_by=request.args.get('deleted_by', 'user'),
        severity='warning'
    )
    db.session.add(timeline_event)
    
    incident.status = 'cancelled'
    incident.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'message': f'Incident {incident_id} cancelled'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@incidents_bp.route('/<int:incident_id>/tasks/<int:task_id>', methods=['PUT'])
def update_task_status(incident_id, task_id):
    """Update task execution status"""
    task = TaskExecution.query.filter_by(id=task_id, incident_id=incident_id).first_or_404()
    data = request.get_json()
    
    old_status = task.status
    
    # Update task fields
    if 'status' in data:
        task.status = data['status']
        
        # Update timestamps based on status
        if data['status'] == 'in_progress' and not task.started_at:
            task.started_at = datetime.utcnow()
        elif data['status'] == 'completed' and not task.completed_at:
            task.completed_at = datetime.utcnow()
            
            # Update incident completed tasks count
            incident = Incident.query.get(incident_id)
            incident.completed_tasks += 1
    
    if 'assigned_to' in data:
        task.assigned_to = data['assigned_to']
    if 'notes' in data:
        task.notes = data['notes']
    if 'findings' in data:
        task.findings = data['findings']
    if 'actions_taken' in data:
        task.actions_taken = data['actions_taken']
    if 'blocked_reason' in data:
        task.blocked_reason = data['blocked_reason']
    
    # Add timeline event
    timeline_event = TimelineEvent(
        incident_id=incident_id,
        task_execution_id=task_id,
        event_type=f'task_{data.get("status", old_status)}',
        title=f'Task "{task.task_name}" status: {old_status} → {data.get("status", old_status)}',
        timestamp=datetime.utcnow(),
        performed_by=data.get('updated_by', 'user'),
        severity='info',
        category=task.phase
    )
    db.session.add(timeline_event)
    
    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'task': task.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@incidents_bp.route('/<int:incident_id>/timeline', methods=['GET'])
def get_timeline(incident_id):
    """Get incident timeline"""
    timeline = TimelineEvent.query.filter_by(
        incident_id=incident_id
    ).order_by(TimelineEvent.timestamp.desc()).all()
    
    return jsonify({
        'incident_id': incident_id,
        'count': len(timeline),
        'events': [event.to_dict() for event in timeline]
    })

@incidents_bp.route('/<int:incident_id>/evidence', methods=['POST'])
def add_evidence(incident_id):
    """Add evidence to an incident"""
    incident = Incident.query.get_or_404(incident_id)
    data = request.get_json()
    
    if not data or 'title' not in data or 'evidence_type' not in data:
        return jsonify({'error': 'title and evidence_type are required'}), 400
    
    evidence = Evidence(
        incident_id=incident_id,
        task_execution_id=data.get('task_execution_id'),
        evidence_type=data['evidence_type'],
        title=data['title'],
        description=data.get('description'),
        content=data.get('content'),
        url=data.get('url'),
        collected_by=data.get('collected_by'),
        source_system=data.get('source_system'),
        tags=','.join(data.get('tags', [])) if isinstance(data.get('tags'), list) else data.get('tags'),
        severity=data.get('severity', 'informational')
    )
    
    db.session.add(evidence)
    
    # Add timeline event
    timeline_event = TimelineEvent(
        incident_id=incident_id,
        event_type='evidence_added',
        title=f'Evidence added: {data["title"]}',
        description=data.get('description'),
        timestamp=datetime.utcnow(),
        performed_by=data.get('collected_by', 'user'),
        severity='info'
    )
    db.session.add(timeline_event)
    
    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'evidence': evidence.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@incidents_bp.route('/statistics', methods=['GET'])
def get_statistics():
    """Get incident statistics"""
    total_incidents = Incident.query.count()
    active_incidents = Incident.query.filter_by(status='active').count()
    completed_incidents = Incident.query.filter_by(status='completed').count()
    
    # Calculate average completion time
    completed = Incident.query.filter(
        Incident.status == 'completed',
        Incident.started_at.isnot(None),
        Incident.completed_at.isnot(None)
    ).all()
    
    avg_duration = 0
    if completed:
        durations = [(inc.completed_at - inc.started_at).total_seconds() / 3600 for inc in completed]
        avg_duration = sum(durations) / len(durations)
    
    return jsonify({
        'total_incidents': total_incidents,
        'active_incidents': active_incidents,
        'completed_incidents': completed_incidents,
        'average_completion_hours': round(avg_duration, 2),
        'by_severity': {
            'critical': Incident.query.filter_by(severity='critical').count(),
            'high': Incident.query.filter_by(severity='high').count(),
            'medium': Incident.query.filter_by(severity='medium').count(),
            'low': Incident.query.filter_by(severity='low').count()
        }
    })

