"""
BPMN Attack Playbooks - Main Backend Application
Flask API for managing IR playbooks with MITRE ATT&CK integration
"""

from flask import Flask, jsonify
from flask_cors import CORS
from api.attack import attack_bp
from api.playbooks import playbooks_bp
from api.validation import validation_bp

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Register blueprints
app.register_blueprint(attack_bp, url_prefix='/api/attack')
app.register_blueprint(playbooks_bp, url_prefix='/api/playbooks')
app.register_blueprint(validation_bp, url_prefix='/api/validation')

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
    return jsonify({
        'status': 'healthy',
        'endpoints': {
            'attack': '/api/attack',
            'playbooks': '/api/playbooks',
            'validation': '/api/validation'
        }
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

