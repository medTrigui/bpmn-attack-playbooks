"""
Playbooks API endpoints
CRUD operations for BPMN playbooks
"""

from flask import Blueprint, jsonify, request, send_file
import json
import os
from pathlib import Path
from datetime import datetime
import xml.etree.ElementTree as ET

playbooks_bp = Blueprint('playbooks', __name__)

# Path to playbooks storage
PLAYBOOKS_DIR = Path(__file__).parent.parent.parent / 'playbook-examples'
PLAYBOOKS_DIR.mkdir(exist_ok=True)

def get_playbook_metadata(bpmn_xml):
    """Extract metadata from BPMN XML"""
    try:
        root = ET.fromstring(bpmn_xml)
        
        # Count elements
        tasks = root.findall('.//{http://www.omg.org/spec/BPMN/20100524/MODEL}task')
        events = root.findall('.//{http://www.omg.org/spec/BPMN/20100524/MODEL}startEvent') + \
                root.findall('.//{http://www.omg.org/spec/BPMN/20100524/MODEL}endEvent')
        gateways = root.findall('.//{http://www.omg.org/spec/BPMN/20100524/MODEL}*Gateway')
        
        # Extract ATT&CK mappings from extension elements
        attack_techniques = []
        for task in tasks:
            for ext in task.findall('.//{http://www.omg.org/spec/BPMN/20100524/MODEL}extensionElements'):
                # Look for our custom attack:technique elements
                for child in ext:
                    if 'technique' in child.tag.lower():
                        tech_id = child.get('id', '')
                        if tech_id:
                            attack_techniques.append(tech_id)
        
        return {
            'task_count': len(tasks),
            'event_count': len(events),
            'gateway_count': len(gateways),
            'attack_techniques': list(set(attack_techniques)),
            'technique_count': len(set(attack_techniques))
        }
    except Exception as e:
        return {
            'task_count': 0,
            'event_count': 0,
            'gateway_count': 0,
            'attack_techniques': [],
            'technique_count': 0,
            'error': str(e)
        }

@playbooks_bp.route('/', methods=['GET'])
def list_playbooks():
    """List all available playbooks"""
    playbooks = []
    
    for file in PLAYBOOKS_DIR.glob('*.bpmn'):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = f.read()
                metadata = get_playbook_metadata(content)
                
                playbooks.append({
                    'id': file.stem,
                    'name': file.stem.replace('-', ' ').replace('_', ' ').title(),
                    'filename': file.name,
                    'size': file.stat().st_size,
                    'modified': datetime.fromtimestamp(file.stat().st_mtime).isoformat(),
                    'metadata': metadata
                })
        except Exception as e:
            print(f"Error reading {file}: {e}")
    
    return jsonify({
        'count': len(playbooks),
        'playbooks': sorted(playbooks, key=lambda x: x['modified'], reverse=True)
    })

@playbooks_bp.route('/<playbook_id>', methods=['GET'])
def get_playbook(playbook_id):
    """Get specific playbook BPMN XML"""
    file_path = PLAYBOOKS_DIR / f"{playbook_id}.bpmn"
    
    if not file_path.exists():
        return jsonify({'error': f'Playbook {playbook_id} not found'}), 404
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            metadata = get_playbook_metadata(content)
            
            return jsonify({
                'id': playbook_id,
                'name': playbook_id.replace('-', ' ').replace('_', ' ').title(),
                'bpmn_xml': content,
                'metadata': metadata
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@playbooks_bp.route('/', methods=['POST'])
def create_playbook():
    """Create or update a playbook"""
    data = request.get_json()
    
    if not data or 'id' not in data or 'bpmn_xml' not in data:
        return jsonify({'error': 'Missing required fields: id, bpmn_xml'}), 400
    
    playbook_id = data['id']
    bpmn_xml = data['bpmn_xml']
    
    # Validate BPMN XML
    try:
        ET.fromstring(bpmn_xml)
    except Exception as e:
        return jsonify({'error': f'Invalid BPMN XML: {str(e)}'}), 400
    
    file_path = PLAYBOOKS_DIR / f"{playbook_id}.bpmn"
    
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(bpmn_xml)
        
        metadata = get_playbook_metadata(bpmn_xml)
        
        return jsonify({
            'success': True,
            'id': playbook_id,
            'message': f'Playbook saved to {file_path.name}',
            'metadata': metadata
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@playbooks_bp.route('/<playbook_id>', methods=['DELETE'])
def delete_playbook(playbook_id):
    """Delete a playbook"""
    file_path = PLAYBOOKS_DIR / f"{playbook_id}.bpmn"
    
    if not file_path.exists():
        return jsonify({'error': f'Playbook {playbook_id} not found'}), 404
    
    try:
        file_path.unlink()
        return jsonify({
            'success': True,
            'message': f'Playbook {playbook_id} deleted'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@playbooks_bp.route('/export/<playbook_id>', methods=['GET'])
def export_playbook(playbook_id):
    """Export playbook as downloadable BPMN file"""
    file_path = PLAYBOOKS_DIR / f"{playbook_id}.bpmn"
    
    if not file_path.exists():
        return jsonify({'error': f'Playbook {playbook_id} not found'}), 404
    
    return send_file(file_path, as_attachment=True, download_name=f"{playbook_id}.bpmn")

