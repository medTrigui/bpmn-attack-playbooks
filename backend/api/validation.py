"""
Validation API endpoints
Validates BPMN playbooks for completeness and correctness
"""

from flask import Blueprint, jsonify, request
import xml.etree.ElementTree as ET

from .bpmn_utils import BPMN_NS, extract_tasks_from_bpmn

validation_bp = Blueprint('validation', __name__)

def validate_bpmn_structure(xml_string):
    """Validate basic BPMN structure"""
    errors = []
    warnings = []
    
    try:
        root = ET.fromstring(xml_string)
    except Exception as e:
        return {
            'valid': False,
            'errors': [f'Invalid XML: {str(e)}'],
            'warnings': []
        }
    
    # Check for start and end events
    start_events = root.findall(f'.//{{{BPMN_NS}}}startEvent')
    end_events = root.findall(f'.//{{{BPMN_NS}}}endEvent')
    
    if not start_events:
        errors.append('No start event found')
    if not end_events:
        errors.append('No end event found')
    
    # Check tasks
    tasks = root.findall(f'.//{{{BPMN_NS}}}task')
    
    if len(tasks) == 0:
        warnings.append('No tasks defined in playbook')
    
    # Check for tasks without names
    unnamed_tasks = [task.get('id') for task in tasks if not task.get('name')]
    if unnamed_tasks:
        warnings.append(f'Tasks without names: {", ".join(unnamed_tasks)}')
    
    # Check for orphaned elements (elements without incoming/outgoing flows)
    all_elements = tasks + start_events + end_events
    for element in all_elements:
        element_id = element.get('id')
        has_incoming = element.find(f'{{{BPMN_NS}}}incoming') is not None
        has_outgoing = element.find(f'{{{BPMN_NS}}}outgoing') is not None
        
        # Start events should have outgoing
        if 'startEvent' in element.tag and not has_outgoing:
            errors.append(f'Start event {element_id} has no outgoing flow')
        
        # End events should have incoming
        if 'endEvent' in element.tag and not has_incoming:
            errors.append(f'End event {element_id} has no incoming flow')
        
        # Tasks should have both
        if 'task' in element.tag:
            if not has_incoming:
                warnings.append(f'Task {element_id} ({element.get("name", "unnamed")}) has no incoming flow')
            if not has_outgoing:
                warnings.append(f'Task {element_id} ({element.get("name", "unnamed")}) has no outgoing flow')
    
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings
    }

def validate_attack_mappings(xml_string):
    """Validate ATT&CK technique mappings"""
    errors = []
    warnings = []
    
    tasks = extract_tasks_from_bpmn(xml_string)
    tasks_without_attack = []
    for task in tasks:
        if not task.get('attack_techniques'):
            task_id = task.get('task_id')
            task_name = task.get('task_name', 'unnamed')
            tasks_without_attack.append(f'{task_id} ({task_name})')
    
    if tasks_without_attack:
        warnings.append(f'Tasks without ATT&CK mappings: {", ".join(tasks_without_attack)}')
    
    return {
        'errors': errors,
        'warnings': warnings
    }

def validate_ir_metadata(xml_string):
    """Validate IR-specific metadata (roles, tools, evidence)"""
    warnings = []
    
    tasks = extract_tasks_from_bpmn(xml_string)
    
    tasks_without_role = []
    tasks_without_tool = []
    
    for task in tasks:
        task_id = task.get('task_id')
        task_name = task.get('task_name', 'unnamed')
        
        if not task.get('role'):
            tasks_without_role.append(f'{task_id} ({task_name})')
        if not task.get('tool'):
            tasks_without_tool.append(f'{task_id} ({task_name})')
    
    if tasks_without_role:
        warnings.append(f'Tasks without role assignment: {", ".join(tasks_without_role[:3])}{"..." if len(tasks_without_role) > 3 else ""}')
    
    if tasks_without_tool:
        warnings.append(f'Tasks without tool specification: {", ".join(tasks_without_tool[:3])}{"..." if len(tasks_without_tool) > 3 else ""}')
    
    return {'warnings': warnings}

@validation_bp.route('/validate', methods=['POST'])
def validate_playbook():
    """
    Validate a BPMN playbook
    Expects JSON: { "bpmn_xml": "<xml>...</xml>" }
    """
    data = request.get_json()
    
    if not data or 'bpmn_xml' not in data:
        return jsonify({'error': 'Missing "bpmn_xml" in request body'}), 400
    
    bpmn_xml = data['bpmn_xml']
    
    # Run all validation checks
    structure_result = validate_bpmn_structure(bpmn_xml)
    attack_result = validate_attack_mappings(bpmn_xml)
    metadata_result = validate_ir_metadata(bpmn_xml)
    
    # Combine results
    all_errors = structure_result['errors'] + attack_result['errors']
    all_warnings = structure_result['warnings'] + attack_result['warnings'] + metadata_result['warnings']
    
    return jsonify({
        'valid': len(all_errors) == 0,
        'errors': all_errors,
        'warnings': all_warnings,
        'summary': {
            'total_errors': len(all_errors),
            'total_warnings': len(all_warnings),
            'structure_valid': structure_result['valid']
        }
    })

@validation_bp.route('/check-coverage', methods=['POST'])
def check_coverage():
    """
    Check if playbook covers key IR phases
    Expects JSON: { "bpmn_xml": "<xml>...</xml>" }
    """
    data = request.get_json()
    
    if not data or 'bpmn_xml' not in data:
        return jsonify({'error': 'Missing "bpmn_xml" in request body'}), 400
    
    # Define expected IR phases
    ir_phases = [
        'preparation',
        'detection',
        'analysis',
        'containment',
        'eradication',
        'recovery',
        'post-incident'
    ]
    
    bpmn_xml = data['bpmn_xml']
    
    try:
        root = ET.fromstring(bpmn_xml)
        tasks = root.findall('.//{http://www.omg.org/spec/BPMN/20100524/MODEL}task')
        
        # Check which phases are covered
        covered_phases = []
        for phase in ir_phases:
            for task in tasks:
                task_name = task.get('name', '').lower()
                if phase in task_name:
                    covered_phases.append(phase)
                    break
        
        missing_phases = [p for p in ir_phases if p not in covered_phases]
        
        return jsonify({
            'total_phases': len(ir_phases),
            'covered_phases': covered_phases,
            'missing_phases': missing_phases,
            'coverage_percentage': (len(covered_phases) / len(ir_phases)) * 100
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

