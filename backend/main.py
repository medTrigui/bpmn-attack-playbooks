"""
BPMN Attack Playbooks - Main Backend Application
Flask API for managing IR playbooks with MITRE ATT&CK integration
"""

import sys
from check_python import check_python_version

# Check Python version compatibility
if not check_python_version():
    sys.exit(1)

from flask import Flask, jsonify
from flask_cors import CORS
from api.attack import attack_bp
from api.playbooks import playbooks_bp
from api.validation import validation_bp

# Try to import database - may fail on Python 3.13
try:
    from api.incidents import incidents_bp
    from database import init_db
    DB_AVAILABLE = True
except (ImportError, AssertionError) as e:
    print(f"\n⚠️  Database module failed to load: {type(e).__name__}")
    print("   This is likely due to SQLAlchemy incompatibility with Python 3.13")
    print("   The server will start WITHOUT incident tracking functionality")
    print("   To fix: Use Python 3.11 or 3.12\n")
    DB_AVAILABLE = False

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Initialize database (if available)
if DB_AVAILABLE:
    init_db(app)

# Register blueprints
app.register_blueprint(attack_bp, url_prefix='/api/attack')
app.register_blueprint(playbooks_bp, url_prefix='/api/playbooks')
app.register_blueprint(validation_bp, url_prefix='/api/validation')

# Register incidents blueprint only if database is available
if DB_AVAILABLE:
    app.register_blueprint(incidents_bp, url_prefix='/api/incidents')

@app.route('/')
def index():
    """Health check endpoint"""
    return jsonify({
        'status': 'running',
        'service': 'BPMN Attack Playbooks API',
        'version': '1.0.0'
    })

@app.route('/api/health')
def health():
    """Detailed health check"""
    endpoints = {
        'attack': '/api/attack',
        'playbooks': '/api/playbooks',
        'validation': '/api/validation'
    }
    
    if DB_AVAILABLE:
        endpoints['incidents'] = '/api/incidents'
    
    return jsonify({
        'status': 'healthy',
        'database_available': DB_AVAILABLE,
        'execution_engine': 'enabled' if DB_AVAILABLE else 'disabled (Python 3.13 incompatibility)',
        'endpoints': endpoints
    })

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 BPMN Attack Playbooks Backend Starting")
    print("="*60)
    if DB_AVAILABLE:
        print("✓ Execution Engine: ENABLED")
        print("  You can create and manage incidents")
    else:
        print("⚠️  Execution Engine: DISABLED")
        print("  Playbook editor and ATT&CK features work normally")
        print("  To enable incident tracking: Use Python 3.11 or 3.12")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)

