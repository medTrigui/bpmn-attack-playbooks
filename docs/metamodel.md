# Extended BPMN Metamodel for Incident Response Playbooks

## Overview

This document defines the extended BPMN metamodel for representing incident response playbooks with integrated MITRE ATT&CK framework support. Our approach builds on standard BPMN 2.0 and adds two custom namespace extensions specifically for incident response and adversary mapping.

## Namespaces

```xml
xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
xmlns:attack="http://attack.mitre.org/bpmn/extension"
xmlns:irp="http://incident-response/bpmn/extension"
```

## Core BPMN Elements

### Standard Elements Used

- **Start Event**: Incident initiation or detection
- **End Event**: Incident closure or handoff
- **Task**: Individual IR action/step
- **Gateway** (Exclusive/Parallel): Decision points and parallel activities
- **Sequence Flow**: Process flow and dependencies

## Extension Elements

### 1. ATT&CK Extension (`attack:`)

Maps incident response tasks to MITRE ATT&CK techniques and tactics.

#### attack:mapping
Container for ATT&CK technique mappings within a task.

```xml
<attack:mapping>
  <attack:technique id="T1486" name="Data Encrypted for Impact"/>
  <attack:tactic>Impact</attack:tactic>
  <attack:subtechnique id="T1486.001" name="..." />
</attack:mapping>
```

**Attributes:**
- **technique@id**: MITRE ATT&CK Technique ID (e.g., T1486)
- **technique@name**: Human-readable technique name
- **tactic**: ATT&CK tactic phase (e.g., Impact, Persistence)
- **subtechnique**: Optional sub-technique specification

### 2. Incident Response Extension (`irp:`)

Contains IR-specific metadata for tasks and processes.

#### irp:metadata
Container for incident response properties.

```xml
<irp:metadata>
  <irp:phase>Containment</irp:phase>
  <irp:role>SOC Analyst L2</irp:role>
  <irp:tool>EDR Console</irp:tool>
  <irp:evidence>Host logs, Network traffic, Memory dump</irp:evidence>
  <irp:priority>high</irp:priority>
  <irp:estimatedTime>30 minutes</irp:estimatedTime>
  <irp:notes>Ensure proper documentation</irp:notes>
</irp:metadata>
```

**Elements:**

| Element | Type | Description | Values |
|---------|------|-------------|--------|
| `phase` | String | NIST IR lifecycle phase | preparation, detection, analysis, containment, eradication, recovery, post-incident |
| `role` | String | Responsible role/position | SOC Analyst L1/L2, Incident Responder, Threat Hunter, Forensics Specialist |
| `tool` | String | Primary tool/platform used | EDR, SIEM, Firewall, Email Gateway, etc. |
| `evidence` | String | Evidence types collected | Logs, artifacts, IOCs, network captures |
| `priority` | Enum | Task priority | low, medium, high, critical |
| `estimatedTime` | String | Expected duration | Free text (e.g., "30 minutes", "2 hours") |
| `notes` | String | Additional instructions | Free text |

## Complete Task Example

```xml
<bpmn:task id="Task_IsolateHost" name="Isolate Infected Host">
  <bpmn:incoming>Flow_1</bpmn:incoming>
  <bpmn:outgoing>Flow_2</bpmn:outgoing>
  
  <bpmn:extensionElements>
    <!-- ATT&CK Mapping -->
    <attack:mapping>
      <attack:technique id="T1486" name="Data Encrypted for Impact"/>
      <attack:tactic>Impact</attack:tactic>
    </attack:mapping>
    
    <!-- IR Metadata -->
    <irp:metadata>
      <irp:phase>Containment</irp:phase>
      <irp:role>SOC Analyst L2</irp:role>
      <irp:tool>EDR Console</irp:tool>
      <irp:evidence>Host logs, Process list, Network connections</irp:evidence>
      <irp:priority>critical</irp:priority>
      <irp:estimatedTime>15 minutes</irp:estimatedTime>
      <irp:notes>
        1. Verify host identity before isolation
        2. Document business impact
        3. Notify CISO if critical system
      </irp:notes>
    </irp:metadata>
  </bpmn:extensionElements>
</bpmn:task>
```

## Validation Rules

### Required Elements
1. Every process must have at least one Start Event
2. Every process must have at least one End Event
3. All tasks must have incoming and outgoing flows (except Start/End events)
4. Tasks should have names

### Recommended Extensions
1. **ATT&CK Mapping**: Every task should map to at least one ATT&CK technique
2. **Role Assignment**: Every task should specify responsible role
3. **Phase Classification**: Tasks should be assigned to IR lifecycle phases
4. **Tool Specification**: Specify tools/platforms for task execution

### Warning Conditions
- Tasks without ATT&CK mappings (visualization: red border)
- Tasks without role assignments (visualization: yellow warning)
- Missing IR phase classification
- Incomplete flow paths

## Comparison with Baseline (FRIPP)

| Aspect | FRIPP (Baseline) | Our Extension |
|--------|------------------|---------------|
| **Base Format** | Custom Eclipse Metamodel | BPMN 2.0 Standard |
| **Tool Support** | Eclipse Plugin | Web-based, any BPMN tool |
| **Adversary Mapping** | None | MITRE ATT&CK integrated |
| **Execution** | Design only | Executable workflows |
| **Export** | Custom format | Standard BPMN XML |
| **Validation** | Visual gaps | Structural + ATT&CK coverage |
| **SOAR Integration** | Not supported | BPMN 2.0 compatible |

## Extension Benefits

### 1. Industry Standard
BPMN is ISO 19510 standard, widely supported by business process tools and SOAR platforms.

### 2. ATT&CK Integration
Direct mapping between defensive actions and adversary techniques enables:
- Coverage analysis
- Gap identification
- Threat-informed defense

### 3. Machine Readable + Executable
Unlike narrative playbooks, BPMN XML can be:
- Parsed by automation tools
- Executed by workflow engines
- Integrated with SOAR platforms

### 4. Interoperability
Standard format enables:
- Import/export between tools
- Sharing playbooks across organizations
- Building playbook libraries

## Future Extensions

### Planned Additions
1. **Temporal Constraints**: SLA and timing requirements
2. **Resource Requirements**: Systems, credentials needed
3. **Dependencies**: External service dependencies
4. **Automation Flags**: Mark tasks as automatable
5. **Success Criteria**: Define measurable outcomes
6. **Decision Points**: Formalized decision logic

### Research Directions
1. **Execution Tracking**: Log actual vs. planned timeline
2. **Effectiveness Metrics**: Measure playbook performance
3. **ML Integration**: Recommend techniques based on IOCs
4. **Automated Validation**: Check against ATT&CK data
5. **Coverage Optimization**: Suggest playbook improvements

## References

- BPMN 2.0 Specification: https://www.omg.org/spec/BPMN/2.0/
- MITRE ATT&CK: https://attack.mitre.org/
- NIST IR Lifecycle: NIST SP 800-61 Rev. 2
- Baseline Paper: Shaked et al. (2022) "Model-based incident response playbooks"

