"""
Database configuration and initialization
SQLAlchemy setup for incident execution tracking
"""

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
import os
from pathlib import Path

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

def init_db(app):
    """Initialize database with Flask app"""
    # Use SQLite for development, can switch to PostgreSQL for production
    db_path = Path(__file__).parent / 'data' / 'bpmn_playbooks.db'
    db_path.parent.mkdir(exist_ok=True)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL', 
        f'sqlite:///{db_path}'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ECHO'] = False  # Set to True for SQL debugging
    
    db.init_app(app)
    
    with app.app_context():
        # Import all models to ensure they're registered
        from models.incident import Incident
        from models.task_execution import TaskExecution
        from models.evidence import Evidence
        from models.timeline_event import TimelineEvent
        
        # Create all tables
        db.create_all()
        print("Database initialized successfully")
    
    return db

