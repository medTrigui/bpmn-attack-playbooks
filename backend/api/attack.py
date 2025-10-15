"""
MITRE ATT&CK API endpoints
Provides access to ATT&CK techniques, tactics, and relationships
"""

from flask import Blueprint, jsonify, request
import json
import os
from pathlib import Path

attack_bp = Blueprint('attack', __name__)

# Path to ATT&CK data
DATA_DIR = Path(__file__).parent.parent / 'data' / 'attack_data'
ATTACK_DATA_FILE = DATA_DIR / 'enterprise-attack.json'

def load_attack_data():
    """Load MITRE ATT&CK data from JSON file"""
    if not ATTACK_DATA_FILE.exists():
        return None
    
    with open(ATTACK_DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def parse_attack_objects(data):
    """Parse ATT&CK STIX data into organized structures"""
    if not data:
        return {
            'techniques': [],
            'tactics': [],
            'groups': [],
            'software': []
        }
    
    techniques = []
    tactics = []
    groups = []
    software = []
    
    for obj in data.get('objects', []):
        obj_type = obj.get('type')
        
        if obj_type == 'attack-pattern':
            # This is a technique
            technique = {
                'id': obj.get('external_references', [{}])[0].get('external_id', ''),
                'name': obj.get('name', ''),
                'description': obj.get('description', ''),
                'tactics': [phase['phase_name'] for phase in obj.get('kill_chain_phases', [])],
                'platforms': obj.get('x_mitre_platforms', []),
                'detection': obj.get('x_mitre_detection', ''),
                'is_subtechnique': '.' in obj.get('external_references', [{}])[0].get('external_id', '')
            }
            techniques.append(technique)
            
        elif obj_type == 'x-mitre-tactic':
            tactic = {
                'id': obj.get('external_references', [{}])[0].get('external_id', ''),
                'name': obj.get('name', ''),
                'description': obj.get('description', ''),
                'short_name': obj.get('x_mitre_shortname', '')
            }
            tactics.append(tactic)
            
        elif obj_type == 'intrusion-set':
            group = {
                'id': obj.get('external_references', [{}])[0].get('external_id', ''),
                'name': obj.get('name', ''),
                'description': obj.get('description', ''),
                'aliases': obj.get('aliases', [])
            }
            groups.append(group)
            
        elif obj_type in ['malware', 'tool']:
            sw = {
                'id': obj.get('external_references', [{}])[0].get('external_id', ''),
                'name': obj.get('name', ''),
                'description': obj.get('description', ''),
                'type': obj_type,
                'platforms': obj.get('x_mitre_platforms', [])
            }
            software.append(sw)
    
    return {
        'techniques': techniques,
        'tactics': tactics,
        'groups': groups,
        'software': software
    }

@attack_bp.route('/techniques', methods=['GET'])
def get_techniques():
    """Get all ATT&CK techniques"""
    data = load_attack_data()
    if not data:
        return jsonify({
            'error': 'ATT&CK data not found. Please run download_attack_data.py script.'
        }), 404
    
    parsed = parse_attack_objects(data)
    
    # Optional filtering
    tactic = request.args.get('tactic')
    platform = request.args.get('platform')
    parent_only = request.args.get('parent_only', 'false').lower() == 'true'
    
    techniques = parsed['techniques']
    
    if parent_only:
        techniques = [t for t in techniques if not t['is_subtechnique']]
    
    if tactic:
        techniques = [t for t in techniques if tactic.lower() in [x.lower() for x in t['tactics']]]
    
    if platform:
        techniques = [t for t in techniques if platform.lower() in [x.lower() for x in t['platforms']]]
    
    return jsonify({
        'count': len(techniques),
        'techniques': techniques
    })

@attack_bp.route('/techniques/<technique_id>', methods=['GET'])
def get_technique(technique_id):
    """Get specific technique by ID (e.g., T1486)"""
    data = load_attack_data()
    if not data:
        return jsonify({'error': 'ATT&CK data not found'}), 404
    
    parsed = parse_attack_objects(data)
    technique = next((t for t in parsed['techniques'] if t['id'] == technique_id), None)
    
    if not technique:
        return jsonify({'error': f'Technique {technique_id} not found'}), 404
    
    return jsonify(technique)

@attack_bp.route('/tactics', methods=['GET'])
def get_tactics():
    """Get all ATT&CK tactics"""
    data = load_attack_data()
    if not data:
        return jsonify({'error': 'ATT&CK data not found'}), 404
    
    parsed = parse_attack_objects(data)
    return jsonify({
        'count': len(parsed['tactics']),
        'tactics': parsed['tactics']
    })

@attack_bp.route('/search', methods=['GET'])
def search_techniques():
    """Search techniques by keyword"""
    query = request.args.get('q', '').lower()
    if not query:
        return jsonify({'error': 'Query parameter "q" is required'}), 400
    
    data = load_attack_data()
    if not data:
        return jsonify({'error': 'ATT&CK data not found'}), 404
    
    parsed = parse_attack_objects(data)
    results = [
        t for t in parsed['techniques']
        if query in t['name'].lower() or query in t['description'].lower()
    ]
    
    return jsonify({
        'query': query,
        'count': len(results),
        'results': results
    })

@attack_bp.route('/coverage', methods=['POST'])
def calculate_coverage():
    """
    Calculate ATT&CK coverage for a set of playbooks
    Expects JSON: { "techniques": ["T1486", "T1490", ...] }
    """
    request_data = request.get_json()
    if not request_data or 'techniques' not in request_data:
        return jsonify({'error': 'Missing "techniques" in request body'}), 400
    
    covered_techniques = request_data['techniques']
    
    data = load_attack_data()
    if not data:
        return jsonify({'error': 'ATT&CK data not found'}), 404
    
    parsed = parse_attack_objects(data)
    all_techniques = parsed['techniques']
    
    # Calculate coverage by tactic
    coverage_by_tactic = {}
    for tactic in parsed['tactics']:
        tactic_name = tactic['short_name']
        tactic_techniques = [t for t in all_techniques if tactic_name in t['tactics']]
        covered = [t for t in tactic_techniques if t['id'] in covered_techniques]
        
        coverage_by_tactic[tactic_name] = {
            'total': len(tactic_techniques),
            'covered': len(covered),
            'percentage': (len(covered) / len(tactic_techniques) * 100) if tactic_techniques else 0,
            'covered_techniques': [t['id'] for t in covered]
        }
    
    return jsonify({
        'total_techniques': len(all_techniques),
        'covered_techniques': len(covered_techniques),
        'coverage_percentage': (len(covered_techniques) / len(all_techniques) * 100),
        'coverage_by_tactic': coverage_by_tactic
    })

@attack_bp.route('/matrix', methods=['GET'])
def get_matrix():
    """Get the full ATT&CK matrix organized by tactic"""
    data = load_attack_data()
    if not data:
        return jsonify({'error': 'ATT&CK data not found'}), 404
    
    parsed = parse_attack_objects(data)
    
    matrix = []
    for tactic in parsed['tactics']:
        tactic_name = tactic['short_name']
        techniques = [
            t for t in parsed['techniques']
            if tactic_name in t['tactics'] and not t['is_subtechnique']
        ]
        
        matrix.append({
            'tactic': tactic,
            'techniques': sorted(techniques, key=lambda x: x['id'])
        })
    
    return jsonify({'matrix': matrix})

