"""
TimelineEvent model for tracking incident chronology
"""

from database import db
from datetime import datetime
from sqlalchemy import Text, ForeignKey
from sqlalchemy.orm import relationship

class TimelineEvent(db.Model):
    """Represents a timestamped event in the incident timeline"""
    __tablename__ = 'timeline_events'
    
    # Primary key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign keys
    incident_id = db.Column(db.Integer, ForeignKey('incidents.id'), nullable=False)
    task_execution_id = db.Column(db.Integer, ForeignKey('task_executions.id'))
    
    # Event information
    event_type = db.Column(
        db.String(50), 
        nullable=False
    )  # incident_created, task_started, task_completed, evidence_added, 
       # status_changed, note_added, escalation, notification, etc.
    
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(Text)
    
    # Timestamp
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Actor
    performed_by = db.Column(db.String(100))  # Who performed this action
    
    # Event metadata
    severity = db.Column(db.String(20))  # info, warning, critical
    category = db.Column(db.String(50))  # detection, analysis, containment, etc.
    
    # Additional data (JSON)
    event_data = db.Column(Text)  # JSON string for additional event data (renamed from metadata)
    
    # Relationships
    incident = relationship('Incident', back_populates='timeline_events')
    
    def to_dict(self):
        """Convert timeline event to dictionary"""
        return {
            'id': self.id,
            'incident_id': self.incident_id,
            'task_execution_id': self.task_execution_id,
            'event_type': self.event_type,
            'title': self.title,
            'description': self.description,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'performed_by': self.performed_by,
            'severity': self.severity,
            'category': self.category,
            'event_data': self.event_data
        }
    
    def __repr__(self):
        return f'<TimelineEvent {self.id}: {self.event_type} at {self.timestamp}>'

