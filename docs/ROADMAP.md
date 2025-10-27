# Project Roadmap & Status

## Current Status

**Version**: 1.0.0 (MVP Complete)  
**Last Updated**: October 26, 2025  
**Overall Status**: Core Features Operational

---

## What Currently Works

### Backend Services

| Feature | Status | Quality | Notes |
|---------|--------|---------|-------|
| Flask API Server | Working | Production-Ready | Runs on port 5000 |
| CORS Configuration | Working | Production-Ready | Frontend access enabled |
| SQLite Database | Working | Development-Ready | Suitable for <1000 incidents |
| Database Models | Working | Production-Ready | Incident, TaskExecution, Evidence, Timeline |
| Health Check Endpoint | Working | Production-Ready | `/api/health` |

### ATT&CK Integration

| Feature | Status | Quality | Notes |
|---------|--------|---------|-------|
| STIX Data Download | Working | Production-Ready | `download_attack_data.py` script |
| Enterprise ATT&CK | Working | Production-Ready | ~600 techniques loaded |
| Mobile ATT&CK | Working | Production-Ready | Available but not UI exposed |
| ICS ATT&CK | Working | Production-Ready | Available but not UI exposed |
| Get Tactics | Working | Production-Ready | All 14 tactics |
| Get Techniques | Working | Production-Ready | Filterable by tactic |
| Search Techniques | Working | Production-Ready | Fuzzy search |
| Technique Details | Working | Production-Ready | Full STIX data |
| Coverage Analysis | Working | Beta | Basic implementation |

### Playbook Management

| Feature | Status | Quality | Notes |
|---------|--------|---------|-------|
| List Playbooks | ✅ Working | Production-Ready | With metadata extraction |
| Get Playbook | ✅ Working | Production-Ready | Returns full BPMN XML |
| Save Playbook | ✅ Working | Production-Ready | BPMN XML validation |
| Delete Playbook | ✅ Working | Production-Ready | File system deletion |
| Export Playbook | ✅ Working | Production-Ready | Download as .bpmn |
| BPMN Parsing | ✅ Working | Production-Ready | Extracts tasks, ATT&CK mappings |
| Metadata Extraction | ✅ Working | Production-Ready | Task count, technique count |

### Incident Execution

| Feature | Status | Quality | Notes |
|---------|--------|---------|-------|
| Create Incident | ✅ Working | Production-Ready | From playbook template |
| List Incidents | ✅ Working | Production-Ready | Filterable by status/severity |
| Get Incident Details | ✅ Working | Production-Ready | With all tasks |
| Update Incident | ✅ Working | Production-Ready | Status, assignee, etc. |
| Delete Incident | ✅ Working | Production-Ready | Cascade deletion |
| Task State Management | ✅ Working | Production-Ready | Pending → In Progress → Completed |
| Update Task Status | ✅ Working | Production-Ready | With notes, findings, actions |
| Evidence Collection | ✅ Working | Production-Ready | All types supported |
| Timeline Logging | ✅ Working | Production-Ready | Automatic event tracking |
| Progress Calculation | ✅ Working | Production-Ready | Based on completed tasks |

### Evidence System

| Feature | Status | Quality | Notes |
|---------|--------|---------|-------|
| File Upload API | Working | Production-Ready | Allows for all filetypes |
| Evidence Storage | Working | Production-Ready | Stored in SQLite table |
| Evidence-to-Task Linking | Working | Development-Ready | Auto-links selected task |
| Evidence Viewer | Working | Production-Ready | Evidence allows for display |

### Frontend Components

| Component | Status | Quality | Notes |
|-----------|--------|---------|-------|
| App.js (Root) | ✅ Working | Production-Ready | State management |
| BPMNEditor | ✅ Working | Production-Ready | Full diagram editing |
| TaskPropertiesPanel | ✅ Working | Production-Ready | All metadata fields |
| ATTACKPanel | ✅ Working | Production-Ready | Browse and search |
| PlaybookLibrary | ✅ Working | Production-Ready | List, load, delete, export |
| IncidentDashboard | ✅ Working | Production-Ready | Create and list incidents |
| ExecutionView | ✅ Working | Production-Ready | Task execution interface |
| EvidenceViewer | ✅ Working | Beta | Basic implementation |
| API Service | ✅ Working | Production-Ready | Centralized backend calls |

### User Workflows

| Workflow | Status | Notes |
|----------|--------|-------|
| Create New Playbook | ✅ Working | Drag-and-drop BPMN elements |
| Configure Task Properties | ✅ Working | All fields save to BPMN |
| Map ATT&CK Techniques | ✅ Working | Multi-select with tactic filtering |
| Save to Library | ✅ Working | Persistent storage |
| Load Playbook | ✅ Working | Full diagram rendering |
| Validate BPMN | ✅ Working | Syntax checking |
| Export BPMN | ✅ Working | Download XML file |
| Create Incident | ✅ Working | From playbook template |
| Execute Tasks | ✅ Working | Status updates, notes, findings |
| Collect Evidence | ✅ Working | Multiple types |
| View Timeline | ✅ Working | Chronological log |
| Complete Incident | ✅ Working | Status change to completed |

---

## Known Issues

### Critical Issues

None currently identified that block core functionality.

### High Priority Issues

1. **Python 3.13 Incompatibility**
   - **Impact**: Execution engine disabled on Python 3.13
   - **Cause**: SQLAlchemy compatibility issues
   - **Workaround**: Use Python 3.11 or 3.12
   - **Status**: Graceful degradation implemented
   - **Timeline**: Waiting for SQLAlchemy fix

2. **Playbook Loading Requires Frontend Restart**
   - **Impact**: After backend changes, frontend cache causes issues
   - **Cause**: React build cache
   - **Workaround**: Hard refresh (Ctrl+F5) or restart frontend
   - **Status**: Documented in troubleshooting guide
   - **Timeline**: Low priority (dev-only issue)

### Medium Priority Issues

3. **No Multi-User Support**
   - **Impact**: Single analyst per incident
   - **Cause**: No authentication/authorization layer
   - **Workaround**: None (design limitation)
   - **Status**: Planned for v2.0
   - **Timeline**: 3-6 months

4. **Evidence-Task Dependency**
   - **Impact**: Evidence cannot be assigned without an Incident or task
   - **Cause**: No valid task_id
   - **Workaround**: Create a task and add an incident before adding evidence
   - **Status**: Planned for v2.0
   - **Timeline**: 1-2 months

5. **No Real-Time Updates**
   - **Impact**: Must manually refresh to see changes
   - **Cause**: No WebSocket implementation
   - **Workaround**: Click refresh button
   - **Status**: Planned for v2.0
   - **Timeline**: 3-6 months

### Low Priority Issues

6. **Mobile Responsiveness**
   - **Impact**: UI not optimized for phones/tablets
   - **Cause**: Desktop-first design
   - **Workaround**: Use desktop browser
   - **Status**: Deferred (not target use case)
   - **Timeline**: 6+ months

7. **Safari CSS Rendering**
   - **Impact**: Minor visual glitches in BPMN editor
   - **Cause**: Safari WebKit differences
   - **Workaround**: Use Chrome/Firefox
   - **Status**: Low priority
   - **Timeline**: TBD

8. **No Dark Mode**
   - **Impact**: Bright UI in dark environments
   - **Cause**: Not implemented
   - **Workaround**: Browser extensions
   - **Status**: Nice-to-have
   - **Timeline**: TBD

---

## What Doesn't Work Yet

### Missing Features

1. **User Authentication & Authorization**
   - No login system
   - No user roles (admin, analyst, viewer)
   - No access control on incidents

2. **SOAR Platform Integration**
   - No Splunk SOAR connector
   - No Cortex XSOAR integration
   - No webhook support

3. **Advanced Evidence Management**
   - No file upload capability
   - No bulk evidence import
   - No evidence search
   - No chain of custody tracking

4. **Reporting & Analytics**
   - No PDF report generation
   - No incident statistics dashboard
   - No playbook effectiveness metrics
   - No analyst performance tracking

5. **Collaboration Features**
   - No multi-analyst incident execution
   - No comments/annotations
   - No task assignment notifications
   - No real-time updates

6. **Advanced BPMN Features**
   - No sub-processes
   - No event-based gateways
   - No message flows
   - No compensation events

7. **Integration APIs**
   - No SIEM integration (Splunk, ELK)
   - No EDR integration (CrowdStrike, SentinelOne)
   - No ticketing integration (Jira, ServiceNow)
   - No email sending capability

8. **Automated Playbook Features**
   - No script task execution
   - No service task API calls
   - No timer events
   - No conditional routing based on data

---

## Next Steps (Priority Order)

### Immediate (Next 2 Weeks)

**1. User Study Preparation**
- Create 5 additional example playbooks
  - Malware Analysis
  - DDoS Response
  - Data Breach Investigation
  - Insider Threat
  - Web Application Attack

- [ ] Write user study protocol
  - Task scenarios
  - Evaluation criteria
  - Survey questions

- Set up test environment
  - Isolated instance
  - Sample incidents
  - Test data

**2. Documentation Polish**
- Professional README (Complete)
- Architecture documentation (Complete)
- User guide (Complete)
- Research context (Complete)
- Roadmap (this document) (Complete)

**3. Demo Video**
- Script walkthrough
- Record screen capture
- Add narration
- Edit and publish

---

### Short-Term (Next 4-6 Weeks)

**4. Evidence File Upload**
- Design preview capabilities
- [ ] Allow for evidence preview within task
- [ ] Clean up CSS for a unique UI

**5. Reporting Feature**
- [ ] Design incident report template
- [ ] Implement PDF generation (ReportLab or similar)
- [ ] Add timeline visualization
- [ ] Include evidence attachments
- [ ] Create export button in ExecutionView

**6. Mobile ATT&CK & ICS ATT&CK Exposure**
- [ ] Add matrix selector dropdown
- [ ] Update API to filter by matrix
- [ ] Test with mobile-specific techniques
- [ ] Update documentation

**7. Performance Optimization**
- [ ] Profile slow API endpoints
- [ ] Implement API response caching
- [ ] Optimize BPMN parsing
- [ ] Add pagination to incident list
- [ ] Lazy load evidence items

---

### Medium-Term (2-3 Months)

**8. User Authentication System**
- [ ] Design user model (username, email, role)
- [ ] Implement JWT authentication
- [ ] Add login/logout UI
- [ ] Protect API endpoints
- [ ] Add user management panel (admin only)

**9. Multi-User Incident Execution**
- [ ] Add incident collaborators field
- [ ] Implement task assignment
- [ ] Add user activity log
- [ ] Display "currently viewing" indicators
- [ ] Test concurrent edits

**10. SIEM Integration (Splunk)**
- [ ] Research Splunk REST API
- [ ] Design evidence import from Splunk
- [ ] Implement search query builder
- [ ] Test with Splunk Enterprise trial
- [ ] Document setup instructions

**11. Analytics Dashboard**
- [ ] Design metrics (MTTR, task duration, playbook usage)
- [ ] Implement data aggregation queries
- [ ] Create visualization components (charts)
- [ ] Add filtering and date ranges
- [ ] Test with 100+ incidents

---

### Long-Term (4-6 Months)

**12. Real-Time Collaboration**
- [ ] Implement WebSocket server
- [ ] Add real-time incident updates
- [ ] Show active users on incident
- [ ] Sync task status changes
- [ ] Handle conflict resolution

**13. SOAR Integration**
- [ ] Research Splunk SOAR API
- [ ] Implement playbook export to SOAR format
- [ ] Create bidirectional sync
- [ ] Test automated playbook execution
- [ ] Write integration guide

**14. Machine Learning Features**
- [ ] Collect execution data for training
- [ ] Build task duration prediction model
- [ ] Implement "suggested next task" feature
- [ ] Add anomaly detection for incidents
- [ ] Evaluate ML model accuracy

**15. Automated Playbook Generation**
- [ ] Research NLP techniques
- [ ] Build threat report parser
- [ ] Train model on existing playbooks
- [ ] Implement BPMN generation from text
- [ ] User evaluation of generated playbooks

**16. Production Deployment**
- [ ] Migrate to PostgreSQL
- [ ] Set up Docker containers
- [ ] Configure reverse proxy (Nginx)
- [ ] Implement SSL/TLS
- [ ] Set up CI/CD pipeline
- [ ] Deploy to cloud (AWS/Azure/GCP)

---

## Success Metrics

### Short-Term Metrics (by End of Semester)

- 2 validated playbooks (Phishing, Ransomware) - COMPLETE
- 5 additional playbooks created
- 10+ simulated incident executions
- [ ] User study with 10 participants
- [ ] 90%+ user satisfaction score
- [ ] <5 minutes time to create simple playbook
- [ ] <2 hours to execute complex incident

### Medium-Term Metrics (6 Months)

- [ ] 20+ production playbooks
- [ ] 100+ real incident executions
- [ ] Integration with 1 SIEM platform
- [ ] 100+ registered users
- [ ] 95%+ system uptime
- [ ] <2 second API response time
- [ ] Published academic paper

### Long-Term Metrics (1 Year)

- [ ] 50+ production playbooks
- [ ] 1000+ incident executions
- [ ] 3+ SOAR/SIEM integrations
- [ ] 500+ registered users across 10+ organizations
- [ ] Industry adoption (3+ companies)
- [ ] Open-source community (10+ contributors)
- [ ] Cited by 5+ academic papers

---

## Resource Requirements

### Immediate Needs

- Development environment - COMPLETE
- MITRE ATT&CK data access - COMPLETE
- Test environment for user study
- [ ] Screen recording software for demo
- [ ] Participants for user study (10 students/professionals)

### Short-Term Needs

- [ ] Cloud hosting (AWS Free Tier or similar)
- [ ] PDF generation library
- [ ] File storage solution (S3 or equivalent)

### Medium-Term Needs

- [ ] Splunk trial license for integration testing
- [ ] PostgreSQL database hosting
- [ ] SSL certificate
- [ ] Continuous integration service (GitHub Actions)

### Long-Term Needs

- [ ] Production cloud infrastructure
- [ ] Domain name and hosting
- [ ] Security audit
- [ ] Professional support resources

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Python 3.13 breaking changes | Medium | Medium | Document Python 3.11/3.12 requirement |
| Low user adoption | Low | High | Conduct user study, iterate on feedback |
| SOAR integration complexity | High | Medium | Start with one platform, document thoroughly |
| Security vulnerabilities | Medium | High | Regular security audits, input validation |
| Scalability issues | Low | Medium | Plan database migration early |
| Maintenance burden | Medium | Medium | Modular architecture, good documentation |

---

## Conclusion

The BPMN-ATT&CK platform has achieved **MVP status** with all core features operational. The immediate focus is on:

1. **Validation**: User study to assess usability and effectiveness
2. **Documentation**: Comprehensive guides for users and developers
3. **Demonstration**: Professional demo video for thesis defense

The platform is ready for **academic evaluation** and **pilot deployment** in controlled environments. Production deployment with multi-user support and integrations is planned for the next 6 months, pending successful validation and resource availability.

---

**For questions or collaboration:** mtrigui@hawk.iit.edu, zansari1@hawk.iit.edu

