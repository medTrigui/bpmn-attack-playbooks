# Research Context

## Project Overview

**Title**: Operationalizing Incident Response Playbooks with BPMN and MITRE ATT&CK Integration

**Research Goal**: Extend model-based incident response playbooks to make them executable, operationalizable, and mapped to adversary behavior through MITRE ATT&CK framework.

## Baseline Work

**Paper**: "Model-based incident response playbooks"  
**Authors**: Avi Shaked, Yulia Cherdantseva, Pete Burnap (2022)  
**Repository**: https://github.com/CardiffUniCOMSC/SecMoF  
**Tool**: FRIPP (Formalized Response to Incidents Process Playbook)

### Baseline Contributions

1. **Metamodel Design**: Identified 7 key concepts for IR playbooks (tasks, resources, references, roles, etc.)
2. **Formalization**: Moved IR playbooks from text to structured model
3. **Visual Gaps**: Used visual indicators (red question marks) to show incomplete playbooks
4. **Design Tool**: Eclipse-based modeling tool for creating playbooks

### Baseline Limitations

1. **Custom Format**: Proprietary metamodel, not industry-standard
2. **No Adversary Mapping**: No connection to MITRE ATT&CK or threat intelligence
3. **Design Only**: Tool creates models but doesn't execute them
4. **Limited Tool Support**: Eclipse plugin, not web-accessible
5. **No Automation**: Cannot integrate with SOAR platforms

## Our Innovation

### Core Contributions

1. **BPMN Standard Adoption**
   - Uses BPMN 2.0 (ISO 19510 standard)
   - Compatible with existing business process tools
   - Exportable to SOAR platforms (Camunda, Pega, etc.)

2. **MITRE ATT&CK Integration**
   - Each task maps to specific ATT&CK techniques
   - Enables coverage analysis across ATT&CK matrix
   - Identifies gaps in defensive capabilities
   - Links defensive actions to adversary behavior

3. **Operationalization**
   - Playbooks are executable workflows
   - Can guide analysts through incidents
   - Tracks evidence collection
   - Generates timeline reports

4. **Web-Based Platform**
   - Accessible from any browser
   - No installation required (except server)
   - Modern UI with real-time validation
   - Collaborative potential

### Technical Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│  ┌─────────────────────────────────┐   │
│  │   BPMN Editor (bpmn-js)         │   │
│  │   - Visual playbook design       │   │
│  │   - Task property editing        │   │
│  │   - ATT&CK technique selection   │   │
│  └─────────────────────────────────┘   │
└─────────────┬───────────────────────────┘
              │ REST API
┌─────────────▼───────────────────────────┐
│         Backend (Flask)                 │
│  ┌─────────────────────────────────┐   │
│  │   ATT&CK Data Service           │   │
│  │   - Technique queries            │   │
│  │   - Coverage analysis            │   │
│  │   - Matrix generation            │   │
│  ├─────────────────────────────────┤   │
│  │   Playbook Management           │   │
│  │   - CRUD operations              │   │
│  │   - BPMN XML parsing             │   │
│  │   - Metadata extraction          │   │
│  ├─────────────────────────────────┤   │
│  │   Validation Engine             │   │
│  │   - Structure validation         │   │
│  │   - ATT&CK mapping checks        │   │
│  │   - IR phase coverage            │   │
│  └─────────────────────────────────┘   │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│    MITRE ATT&CK STIX Data              │
│    (enterprise-attack.json)             │
└─────────────────────────────────────────┘
```

### Extended Metamodel

**BPMN Extensions:**

1. **attack:** namespace - ATT&CK mappings
   - technique ID, name
   - tactic
   - subtechniques

2. **irp:** namespace - IR metadata
   - phase (NIST lifecycle)
   - role assignment
   - tool/platform
   - evidence types
   - priority
   - estimated time
   - notes

**Validation Levels:**

1. **Structural**: BPMN flow correctness
2. **Semantic**: ATT&CK mapping completeness
3. **Operational**: IR phase coverage

## Research Questions Addressed

### RQ1: Can IR playbooks be operationalized using industry standards?

**Answer**: Yes, BPMN 2.0 provides sufficient expressiveness for IR workflows while maintaining compatibility with existing process automation tools.

**Evidence**: 
- Ransomware response playbook with 8 tasks, full lifecycle coverage
- Phishing investigation playbook with 7 tasks, multi-tactic coverage
- Both validated and exportable to SOAR platforms

### RQ2: How can playbooks be mapped to adversary behavior?

**Answer**: By extending BPMN with ATT&CK technique IDs at the task level, creating bidirectional mapping between defensive actions and offensive techniques.

**Evidence**:
- Every task in example playbooks has ATT&CK mapping
- Coverage analysis shows which techniques are addressed
- Gap analysis identifies missing defensive capabilities

### RQ3: What is the value of ATT&CK-integrated playbooks?

**Value Propositions**:
1. **Coverage Visibility**: See which ATT&CK tactics/techniques you can respond to
2. **Gap Identification**: Find blind spots in IR capabilities
3. **Threat-Informed Defense**: Build playbooks based on threat intelligence
4. **Metrics**: Measure IR program maturity by ATT&CK coverage
5. **Prioritization**: Focus playbook development on high-priority techniques

## Evaluation Plan

### Phase 1: Technical Validation (Complete)
- ✓ BPMN editor functional
- ✓ ATT&CK data integration working
- ✓ Validation engine operational
- ✓ Example playbooks created

### Phase 2: Usability Testing (Future)
- Test with SOC analysts
- Measure playbook creation time
- Assess ATT&CK mapping accuracy
- Gather qualitative feedback

### Phase 3: Real-World Deployment (Future)
- Deploy in operational SOC
- Track playbook usage during incidents
- Measure time-to-response improvements
- Validate coverage analysis predictions

## Expected Outcomes

### Academic Contributions

1. **Novel Metamodel**: First BPMN-based IR playbook metamodel with ATT&CK integration
2. **Tool Implementation**: Open-source reference implementation
3. **Empirical Data**: Usage metrics from SOC deployment
4. **Coverage Framework**: Method for analyzing IR capability vs. threat landscape

### Practical Impact

1. **SOC Operations**: Structured, repeatable incident response
2. **Training**: New analysts follow playbooks to learn procedures
3. **Automation**: SOAR platforms execute playbooks automatically
4. **Reporting**: Generate consistent incident reports
5. **Continuous Improvement**: Measure and improve IR capabilities

## Publication Strategy

### Target Venues

**Primary**: 
- ARES (continuation of baseline work)
- ACM CCS Workshop on Cyber Security Operations

**Secondary**:
- IEEE Security & Privacy
- USENIX Security (poster/demo)

### Paper Structure

1. **Introduction**: IR challenges, need for formalization
2. **Related Work**: FRIPP, CACAO, RE&CT, SOAR platforms
3. **Approach**: BPMN + ATT&CK integration
4. **Implementation**: Tool architecture
5. **Evaluation**: Usability study + SOC deployment
6. **Discussion**: Benefits, limitations, future work

## Timeline

- **Weeks 1-2** (Current): Infrastructure setup ✓
- **Weeks 3-4**: Execution engine, playbook runner
- **Weeks 5-6**: Analytics, coverage visualization
- **Weeks 7-8**: Additional example playbooks
- **Weeks 9-10**: Usability testing with practitioners
- **Weeks 11-12**: Refinements based on feedback
- **Week 13+**: Paper writing and submission

## References

1. Shaked, A., Cherdantseva, Y., & Burnap, P. (2022). Model-based incident response playbooks. ARES 2022.
2. MITRE ATT&CK Framework. https://attack.mitre.org/
3. OASIS CACAO Playbooks. https://www.oasis-open.org/committees/cacao/
4. NIST SP 800-61 Rev. 2: Computer Security Incident Handling Guide
5. OMG BPMN 2.0 Specification. https://www.omg.org/spec/BPMN/2.0/

## Contact

For questions about this research project, please refer to the GitHub repository or academic supervisor.

