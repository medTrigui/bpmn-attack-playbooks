const BPMN_NS = 'http://www.omg.org/spec/BPMN/20100524/MODEL';
const ATTACK_NS = 'http://attack.mitre.org/bpmn/extension';
const IRP_NS = 'http://incident-response/bpmn/extension';

const TASK_TAGS = ['task', 'userTask', 'manualTask', 'serviceTask', 'scriptTask', 'businessRuleTask'];

const splitAttribute = (value) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const mergeUnique = (existing, additions) => {
  const seen = new Set(existing);
  additions.forEach((item) => {
    if (!seen.has(item)) {
      existing.push(item);
      seen.add(item);
    }
  });
  return existing;
};

const getTaskNodes = (doc) => {
  const nodes = [];
  TASK_TAGS.forEach((tag) => {
    const found = doc.getElementsByTagNameNS(BPMN_NS, tag);
    nodes.push(...Array.from(found));
  });
  return Array.from(new Set(nodes));
};

const gatherAttackDataFromExtensions = (taskNode) => {
  const techniques = [];
  const tactics = [];

  const techniqueNodes = taskNode.getElementsByTagNameNS(ATTACK_NS, 'technique');
  Array.from(techniqueNodes).forEach((node) => {
    const techId = (node.getAttribute('id') || node.textContent || '').trim();
    if (techId) {
      techniques.push(techId);
    }
  });

  const tacticNodes = taskNode.getElementsByTagNameNS(ATTACK_NS, 'tactic');
  Array.from(tacticNodes).forEach((node) => {
    const tacticName = (node.textContent || '').trim();
    if (tacticName) {
      tactics.push(tacticName);
    }
  });

  return { techniques, tactics };
};

const gatherIrMetadataFromExtensions = (taskNode) => {
  const metadata = {};
  const metadataNodes = taskNode.getElementsByTagNameNS(IRP_NS, 'metadata');

  Array.from(metadataNodes).forEach((metadataNode) => {
    Array.from(metadataNode.children).forEach((child) => {
      const key = child.localName;
      const value = (child.textContent || '').trim();

      if (!value) return;

      switch ((key || '').toLowerCase()) {
        case 'phase':
          metadata.phase = value;
          break;
        case 'role':
          metadata.role = value;
          break;
        case 'tool':
          metadata.tool = value;
          break;
        case 'priority':
          metadata.priority = value;
          break;
        case 'estimatedtime':
          metadata.estimatedTime = value;
          break;
        case 'evidence':
          metadata.evidence = value;
          break;
        case 'notes':
          metadata.notes = value;
          break;
        default:
          break;
      }
    });
  });

  return metadata;
};

export const normalizeBpmnExtensions = (bpmnXml) => {
  if (typeof DOMParser === 'undefined' || typeof XMLSerializer === 'undefined') {
    return bpmnXml;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(bpmnXml, 'text/xml');

    if (doc.getElementsByTagName('parsererror').length > 0) {
      return bpmnXml;
    }

    const serializer = new XMLSerializer();
    const taskNodes = getTaskNodes(doc);

    taskNodes.forEach((task) => {
      const attrTechniques = splitAttribute(task.getAttributeNS(ATTACK_NS, 'techniques'));
      const attrTactics = splitAttribute(task.getAttributeNS(ATTACK_NS, 'tactics'));

      const extensionAttack = gatherAttackDataFromExtensions(task);
      const mergedTechniques = mergeUnique(attrTechniques.slice(), extensionAttack.techniques);
      const mergedTactics = mergeUnique(attrTactics.slice(), extensionAttack.tactics);

      if (mergedTechniques.length > 0) {
        task.setAttributeNS(ATTACK_NS, 'attack:techniques', mergedTechniques.join(','));
      }
      if (mergedTactics.length > 0) {
        task.setAttributeNS(ATTACK_NS, 'attack:tactics', mergedTactics.join(','));
      }

      const attrPhase = task.getAttributeNS(IRP_NS, 'phase');
      const attrRole = task.getAttributeNS(IRP_NS, 'role');
      const attrTool = task.getAttributeNS(IRP_NS, 'tool');
      const attrPriority = task.getAttributeNS(IRP_NS, 'priority');
      const attrEstimated = task.getAttributeNS(IRP_NS, 'estimatedTime');
      const attrEvidence = task.getAttributeNS(IRP_NS, 'evidence');
      const attrNotes = task.getAttributeNS(IRP_NS, 'notes');

      const irMetadata = gatherIrMetadataFromExtensions(task);

      if (!attrPhase && irMetadata.phase) {
        task.setAttributeNS(IRP_NS, 'irp:phase', irMetadata.phase);
      }
      if (!attrRole && irMetadata.role) {
        task.setAttributeNS(IRP_NS, 'irp:role', irMetadata.role);
      }
      if (!attrTool && irMetadata.tool) {
        task.setAttributeNS(IRP_NS, 'irp:tool', irMetadata.tool);
      }
      if (!attrPriority && irMetadata.priority) {
        task.setAttributeNS(IRP_NS, 'irp:priority', irMetadata.priority);
      }
      if (!attrEstimated && irMetadata.estimatedTime) {
        task.setAttributeNS(IRP_NS, 'irp:estimatedTime', irMetadata.estimatedTime);
      }
      if (!attrEvidence && irMetadata.evidence) {
        task.setAttributeNS(IRP_NS, 'irp:evidence', irMetadata.evidence);
      }
      if (!attrNotes && irMetadata.notes) {
        task.setAttributeNS(IRP_NS, 'irp:notes', irMetadata.notes);
      }
    });

    return serializer.serializeToString(doc);
  } catch (error) {
    console.error('Failed to normalize BPMN extensions:', error);
    return bpmnXml;
  }
};

export const BPMN_CONSTANTS = {
  BPMN_NS,
  ATTACK_NS,
  IRP_NS,
};


