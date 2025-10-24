"""
Evidence model for tracking files, logs, and artifacts collected during incidents
"""

from database import db
from datetime import datetime
from sqlalchemy import Text, ForeignKey
from sqlalchemy.orm import relationship

class Evidence(db.Model):
    """Represents evidence collected during incident response"""
    __tablename__ = 'evidence'
    
    # Primary key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign keys
    incident_id = db.Column(db.Integer, ForeignKey('incidents.id'), nullable=False)
    task_execution_id = db.Column(db.Integer, ForeignKey('task_executions.id'))
    
    # Evidence metadata
    evidence_type = db.Column(
        db.String(50), 
        nullable=False
    )  # file, log, screenshot, url, note, ioc, network-capture, memory-dump
    
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(Text)
    
    # File information (if applicable)
    filename = db.Column(db.String(255))
    file_path = db.Column(db.String(500))  # Path to stored file
    file_size = db.Column(db.Integer)  # Size in bytes
    file_hash = db.Column(db.String(64))  # SHA256 hash
    mime_type = db.Column(db.String(100))
    
    # URL/Link (if applicable)
    url = db.Column(db.String(500))
    
    # Text content (for notes, logs, IOCs)
    content = db.Column(Text)
    
    # Collection metadata
    collected_by = db.Column(db.String(100))
    collected_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    source_system = db.Column(db.String(200))  # Where evidence came from
    
    # Chain of custody
    custody_log = db.Column(Text)  # JSON or text log of custody transfers
    
    # Tags and categorization
    tags = db.Column(db.String(500))  # Comma-separated tags
    severity = db.Column(db.String(20))  # informational, low, medium, high, critical
    
    # Relationships
    incident = relationship('Incident', back_populates='evidence')
    
    def to_dict(self):
        """Convert evidence to dictionary"""
        return {
            'id': self.id,
            'incident_id': self.incident_id,
            'task_execution_id': self.task_execution_id,
            'evidence_type': self.evidence_type,
            'title': self.title,
            'description': self.description,
            'filename': self.filename,
            'file_path': self.file_path,
            'file_size': self.file_size,
            'file_hash': self.file_hash,
            'mime_type': self.mime_type,
            'url': self.url,
            'content': self.content,
            'collected_by': self.collected_by,
            'collected_at': self.collected_at.isoformat() if self.collected_at else None,
            'source_system': self.source_system,
            'tags': self.tags.split(',') if self.tags else [],
            'severity': self.severity
        }
    
    def __repr__(self):
        return f'<Evidence {self.id}: {self.title} [{self.evidence_type}]>'

