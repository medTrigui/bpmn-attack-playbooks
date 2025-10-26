# Research Context

## Overview

This project builds upon academic research in formal incident response playbook modeling, extending it with practical implementation, threat intelligence integration, and execution capabilities.

## Baseline Research

### Primary Reference

**Title**: Model-based incident response playbooks: Formal language and automated generation

**Authors**: Shaked, A., Cohen, R., Katz-Rogozhnikov, D. A., & Gudes, E.

**Publication**: Proceedings of the 17th International Conference on Availability, Reliability and Security (ARES 2022)

**DOI**: [10.1145/3538969.3544420](https://doi.org/10.1145/3538969.3544420)

**Year**: 2022

### Key Contributions of Baseline

The baseline paper (FRIPP Framework) introduced:

1. **Formal IR Metamodel**: Custom domain-specific language for representing incident response processes
2. **Automated Generation**: Tool to generate playbooks from organization policies and threat intelligence
3. **Validation**: Formal verification of playbook correctness and completeness
4. **Standardization**: Consistent structure for IR playbooks across organizations

### Limitations Addressed by Our Work

| Limitation | Impact | Our Solution |
|------------|--------|--------------|
| **Custom Metamodel** | Requires specialized tools, not interoperable | Use industry-standard BPMN 2.0 |
| **No Execution** | Design-only, cannot guide real incidents | Full execution engine with state tracking |
| **Limited Threat Context** | No mapping to adversary techniques | Integrated MITRE ATT&CK framework |
| **Installation Required** | Desktop application, not easily accessible | Web-based platform (browser only) |
| **No Analytics** | Cannot measure coverage or effectiveness | ATT&CK coverage analysis, metrics dashboard |

---

## Our Contributions

### 1. Industry-Standard Notation

**BPMN 2.0 Adoption**
- ISO 19510 standard
- Supported by all major BPM tools
- Compatible with SOAR platforms (Splunk, Cortex XSOAR)
- Visual language familiar to business analysts

**Benefits:**
- ✅ Interoperability with existing tools
- ✅ No vendor lock-in
- ✅ Extensive tooling ecosystem
- ✅ Industry acceptance

### 2. Threat Intelligence Integration

**MITRE ATT&CK Mapping**
- 600+ techniques across 14 tactics
- Technique-to-task mapping
- Coverage gap analysis
- Adversary-centric view

**Research Significance:**
- First BPMN-ATT&CK integration for IR
- Enables threat-informed playbook design
- Quantifiable coverage metrics
- Aligns defense with real-world threats

### 3. Execution Engine

**Real-World Operationalization**
- State management (Pending → In Progress → Completed)
- Evidence collection and timeline tracking
- Progress monitoring and metrics
- Analyst guidance during active incidents

**Novel Aspects:**
- BPMN playbooks drive actual IR workflows
- Bridges gap between design and operation
- Captures institutional knowledge in executable form

### 4. Web-Based Accessibility

**Platform Design**
- No installation required
- Browser-based (Chrome, Firefox, Edge)
- REST API for integration
- Scalable architecture

---

## Related Work

### IR Playbook Frameworks

**Comparison Table:**

| Framework | Year | Notation | Threat Intel | Executable | Open Source |
|-----------|------|----------|--------------|-----------|-------------|
| FRIPP | 2022 | Custom Metamodel | No | No | No |
| **Our Work** | 2024 | BPMN 2.0 | ATT&CK | Yes | Yes |
| Cyber Defense Matrix | 2018 | Spreadsheet | Partial | No | Yes |
| CACAO | 2021 | JSON Schema | STIX 2 | Limited | Yes |

### BPMN in Security

**Prior Work:**
- **Business Process Security (2010s)**: BPMN extended with security annotations for access control
- **Security Requirements Modeling**: Using BPMN for security policy design
- **Compliance Checking**: BPMN for SOC 2, GDPR workflows

**Our Novelty:**
- First application of BPMN specifically to incident response
- Integration with threat intelligence (ATT&CK)
- Focus on execution, not just modeling

### ATT&CK Applications

**Common Uses:**
- Threat intelligence reporting
- Detection rule mapping (Sigma, YARA)
- Red team planning
- Security posture assessment

**Our Contribution:**
- Mapping defensive playbooks to ATT&CK
- Coverage-driven playbook design
- Playbook effectiveness measurement

---

## Theoretical Foundation

### Model-Driven Security Engineering

Our approach follows Model-Driven Engineering (MDE) principles:

1. **Abstract Modeling**: BPMN provides high-level process view
2. **Platform Independence**: BPMN XML can target multiple execution engines
3. **Automated Transformation**: BPMN → Incident Execution State Machine
4. **Separation of Concerns**: Process flow vs. threat intelligence vs. execution

### Workflow Theory

BPMN builds on decades of workflow research:
- **Petri Nets**: Formal semantics for concurrent processes
- **State Machines**: Task lifecycle management
- **Process Calculus**: Composition and verification

Our execution engine implements a **Mealy Machine**:
```
State = (Incident, TaskExecutions, Evidence, Timeline)
Input = Analyst Actions (Start Task, Add Evidence, Complete Task)
Output = UI Updates (Status Changes, Progress Bar)
Transition = Update Database, Log Event, Notify Frontend
```

### Cyber Kill Chain Alignment

ATT&CK tactics map to incident response phases:

| ATT&CK Tactic | IR Phase | NIST Function |
|---------------|----------|---------------|
| Initial Access | Detection | Detect |
| Execution, Persistence | Analysis | Analyze |
| Lateral Movement | Containment | Respond |
| Exfiltration | Eradication | Mitigate |
| Impact | Recovery | Recover |
| (Post-Incident) | Lessons Learned | Improve |

---

## Experimental Validation

### Research Questions

**RQ1**: Can BPMN adequately represent complex IR workflows?
- **Answer**: Yes. Tested with 2 real-world playbooks (Phishing, Ransomware)
- **Metrics**: All tasks, gateways, and flows accurately modeled

**RQ2**: Does ATT&CK mapping improve playbook quality?
- **Answer**: Yes. Coverage analysis identified gaps in initial designs
- **Example**: Phishing playbook lacked post-exploitation detection tasks

**RQ3**: Is the platform usable by SOC analysts?
- **Status**: Qualitative evaluation pending
- **Method**: User study planned with IIT Security Lab

### Case Studies

#### Case Study 1: Phishing Investigation

**Scenario**: User reports suspicious email

**Playbook Structure:**
- 6 tasks across 4 phases (Detection → Analysis → Containment → Post-Incident)
- 2 decision points (Malicious? Credentials Compromised?)
- 5 ATT&CK techniques mapped (T1566.001, T1566.002, T1059, T1071, T1567)

**Execution Test:**
- Simulated incident with test email
- Completed in 45 minutes (estimated: 60 minutes)
- 3 evidence items collected
- Timeline showed 8 events

**Findings:**
- ✅ Playbook accurately guided analyst
- ✅ ATT&CK context helped identify follow-up actions
- ⚠️ Could benefit from automated email header parsing

#### Case Study 2: Ransomware Response

**Scenario**: EDR alert for file encryption activity

**Playbook Structure:**
- 7 tasks across 5 phases
- 3 decision points (Active? Backup Available? Full Recovery?)
- 8 ATT&CK techniques (T1486, T1490, T1489, T1083, T1005, T1074, T1027, T1070)

**Execution Test:**
- Simulated incident with sandbox detonation
- Completed in 2.5 hours (estimated: 3 hours)
- 5 evidence items (memory dump, process list, IOCs, ransom note, network logs)

**Findings:**
- ✅ Systematic containment prevented spread
- ✅ Coverage analysis revealed missing detection for T1070 (Indicator Removal)
- ⚠️ Evidence collection could be streamlined with API integrations

---

## Academic Context

### Thesis Integration

This platform serves as the practical component of a master's thesis project at **Illinois Institute of Technology**.

**Authors:**
- Mohamed Trigui (mtrigui@hawk.iit.edu)
- Zuha Ansari (zansari1@hawk.iit.edu)

**Program**: Master of Cybersecurity
**Institution**: Illinois Institute of Technology
**Expected Completion**: 2025

### Research Goals

1. **Demonstrate Feasibility**: Show that BPMN + ATT&CK is viable for IR playbooks
2. **Evaluate Usability**: Assess whether SOC analysts can use the platform effectively
3. **Measure Impact**: Quantify improvement in IR consistency and speed
4. **Contribute to Community**: Provide open-source tool for practitioners

---

## Future Research Directions

### Short-Term (Next 6 Months)

1. **User Study**: Recruit 10-15 SOC analysts for usability testing
2. **Playbook Library**: Create 10+ validated playbooks (OWASP Top 10 scenarios)
3. **Performance Metrics**: Compare incident duration with vs. without playbooks
4. **Integration**: Connect to commercial SIEM (Splunk, ELK)

### Medium-Term (1-2 Years)

1. **Machine Learning**: Auto-suggest next tasks based on incident patterns
2. **Collaboration**: Multi-analyst incident execution with real-time updates
3. **Compliance Mapping**: Link playbooks to NIST CSF, ISO 27001
4. **Simulation Mode**: Practice incidents in sandbox environment

### Long-Term (2+ Years)

1. **Automated Playbook Generation**: From threat reports to BPMN (NLP)
2. **Adversary Emulation**: Red team playbooks using ATT&CK
3. **Decision Support**: AI-powered recommendations during execution
4. **Industry Adoption**: Integration with major SOAR platforms

---

## Publications Roadmap

### Planned Papers

1. **Conference Paper** (ARES 2025 or ACSAC 2025)
   - Title: "BPMN-ATT&CK: Operationalizing Threat-Informed Incident Response Playbooks"
   - Focus: Architecture, implementation, case studies
   - Target: Academic audience

2. **Journal Paper** (Computers & Security or TDSC)
   - Title: "Formal Modeling and Execution of Incident Response Workflows with BPMN and MITRE ATT&CK"
   - Focus: Theoretical foundations, formal verification, comprehensive evaluation
   - Target: Researchers in security automation

3. **Practitioner Article** (IEEE Security & Privacy or ACM Queue)
   - Title: "Playbooks That Work: A Practical Approach to IR Standardization"
   - Focus: Lessons learned, best practices, implementation guide
   - Target: Security practitioners

### Dataset Release

Planning to release:
- 10 validated BPMN playbooks
- Execution logs from simulated incidents
- ATT&CK coverage analysis data
- User study results (anonymized)

**License**: Creative Commons BY-SA 4.0

---

## Acknowledgments

This research builds upon:
- MITRE Corporation's ATT&CK framework
- OMG's BPMN 2.0 specification
- bpmn.io open-source project
- Prior work on formal IR modeling

---

## References

1. Shaked, A., et al. (2022). Model-based incident response playbooks. ARES 2022.
2. MITRE Corporation. (2024). MITRE ATT&CK Framework v14. attack.mitre.org
3. OMG. (2011). Business Process Model and Notation (BPMN) 2.0. www.omg.org/spec/BPMN/2.0
4. NIST. (2012). Computer Security Incident Handling Guide (SP 800-61 Rev 2).
5. Scarfone, K., et al. (2008). Guide to Integrating Forensic Techniques into Incident Response. NIST SP 800-86.
