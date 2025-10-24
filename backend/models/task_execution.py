"""
TaskExecution model for tracking individual task progress within incidents
"""

from database import db
from datetime import datetime
from sqlalchemy import Text, JSON, ForeignKey
from sqlalchemy.orm import relationship

class TaskExecution(db.Model):
    """Represents execution of a single task within an incident"""
    __tablename__ = 'task_executions'
    
    # Primary key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign key to incident
    incident_id = db.Column(db.Integer, ForeignKey('incidents.id'), nullable=False)
    
    # Task information from BPMN
    task_id = db.Column(db.String(100), nullable=False)  # BPMN element ID
    task_name = db.Column(db.String(200), nullable=False)
    task_type = db.Column(db.String(50))  # task, userTask, serviceTask, etc.
    
    # Execution status
    status = db.Column(
        db.String(20), 
        nullable=False, 
        default='pending'
    )  # pending, in_progress, completed, skipped, blocked, failed
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    
    # Task metadata from BPMN extensions
    phase = db.Column(db.String(50))  # detection, analysis, containment, etc.
    role = db.Column(db.String(100))  # SOC Analyst L1, L2, IR Specialist, etc.
    tool = db.Column(db.String(200))  # Tools used
    priority = db.Column(db.String(20))  # low, medium, high, critical
    estimated_time = db.Column(db.String(50))  # Estimated duration
    
    # ATT&CK mapping
    attack_techniques = db.Column(JSON)  # List of ATT&CK technique IDs
    attack_tactics = db.Column(JSON)  # List of ATT&CK tactics
    
    # Execution details
    assigned_to = db.Column(db.String(100))  # Person executing the task
    actual_duration_minutes = db.Column(db.Integer)  # Actual time taken
    
    # Task output
    notes = db.Column(Text)  # Execution notes
    findings = db.Column(Text)  # What was discovered
    actions_taken = db.Column(Text)  # What actions were performed
    
    # Evidence links
    evidence_collected = db.Column(JSON)  # List of evidence IDs
    
    # Blocking/dependencies
    blocked_reason = db.Column(Text)  # Why task is blocked
    dependencies = db.Column(JSON)  # List of task IDs this depends on
    
    # Relationships
    incident = relationship('Incident', back_populates='task_executions')
    
    def to_dict(self):
        """Convert task execution to dictionary"""
        # Calculate actual duration if started and completed
        actual_duration = None
        if self.started_at and self.completed_at:
            duration = self.completed_at - self.started_at
            actual_duration = int(duration.total_seconds() / 60)  # minutes
        
        return {
            'id': self.id,
            'incident_id': self.incident_id,
            'task_id': self.task_id,
            'task_name': self.task_name,
            'task_type': self.task_type,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'phase': self.phase,
            'role': self.role,
            'tool': self.tool,
            'priority': self.priority,
            'estimated_time': self.estimated_time,
            'attack_techniques': self.attack_techniques or [],
            'attack_tactics': self.attack_tactics or [],
            'assigned_to': self.assigned_to,
            'actual_duration_minutes': actual_duration or self.actual_duration_minutes,
            'notes': self.notes,
            'findings': self.findings,
            'actions_taken': self.actions_taken,
            'evidence_collected': self.evidence_collected,
            'blocked_reason': self.blocked_reason,
            'dependencies': self.dependencies
        }
    
    def __repr__(self):
        return f'<TaskExecution {self.id}: {self.task_name} [{self.status}]>'

