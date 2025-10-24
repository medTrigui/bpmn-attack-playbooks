"""
Incident model for tracking playbook executions
"""

from database import db
from datetime import datetime
from sqlalchemy import Text, JSON
from sqlalchemy.orm import relationship

class Incident(db.Model):
    """Represents an incident being handled using a playbook"""
    __tablename__ = 'incidents'
    
    # Primary key
    id = db.Column(db.Integer, primary_key=True)
    
    # Basic information
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(Text)
    playbook_id = db.Column(db.String(100), nullable=False)  # Reference to BPMN file
    playbook_name = db.Column(db.String(200))
    
    # Status tracking
    status = db.Column(
        db.String(20), 
        nullable=False, 
        default='active'
    )  # active, completed, cancelled, on-hold
    
    severity = db.Column(
        db.String(20), 
        nullable=False, 
        default='medium'
    )  # low, medium, high, critical
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Assignee information
    assigned_to = db.Column(db.String(100))  # User/analyst handling the incident
    assigned_team = db.Column(db.String(100))  # SOC team, IR team, etc.
    
    # Metadata
    incident_type = db.Column(db.String(100))  # ransomware, phishing, data-breach, etc.
    affected_systems = db.Column(JSON)  # List of affected hosts/systems
    attack_techniques = db.Column(JSON)  # ATT&CK techniques observed
    
    # Progress tracking
    total_tasks = db.Column(db.Integer, default=0)
    completed_tasks = db.Column(db.Integer, default=0)
    
    # Notes and findings
    notes = db.Column(Text)
    final_report = db.Column(Text)
    
    # Relationships
    task_executions = relationship('TaskExecution', back_populates='incident', cascade='all, delete-orphan')
    evidence = relationship('Evidence', back_populates='incident', cascade='all, delete-orphan')
    timeline_events = relationship('TimelineEvent', back_populates='incident', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert incident to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'playbook_id': self.playbook_id,
            'playbook_name': self.playbook_name,
            'status': self.status,
            'severity': self.severity,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'assigned_to': self.assigned_to,
            'assigned_team': self.assigned_team,
            'incident_type': self.incident_type,
            'affected_systems': self.affected_systems,
            'attack_techniques': self.attack_techniques,
            'total_tasks': self.total_tasks,
            'completed_tasks': self.completed_tasks,
            'progress_percentage': (self.completed_tasks / self.total_tasks * 100) if self.total_tasks > 0 else 0,
            'notes': self.notes,
            'final_report': self.final_report
        }
    
    def __repr__(self):
        return f'<Incident {self.id}: {self.title} [{self.status}]>'

