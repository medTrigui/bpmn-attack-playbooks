"""
Shared BPMN parsing utilities.
Extracts task metadata, IR attributes, and ATT&CK mappings from BPMN XML.
"""

from xml.etree import ElementTree as ET
from typing import List, Dict

BPMN_NS = "http://www.omg.org/spec/BPMN/20100524/MODEL"
ATTACK_NS = "http://attack.mitre.org/bpmn/extension"
IRP_NS = "http://incident-response/bpmn/extension"


def _strip_ns(tag: str) -> str:
    """Return tag name without namespace prefix."""
    return tag.split("}", 1)[-1] if "}" in tag else tag


def _split_attr_list(value: str) -> List[str]:
    """Split comma-delimited attribute values into a clean list."""
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]

def _merge_lists(*lists: List[str]) -> List[str]:
    """Merge multiple lists preserving order while removing duplicates."""
    seen = set()
    merged = []
    for lst in lists:
        for item in lst or []:
            key = item.strip()
            if key and key not in seen:
                seen.add(key)
                merged.append(key)
    return merged


def _get_extension_element(task_elem, local_name: str):
    """Return all extension elements that match the provided local name."""
    extension = task_elem.find(f"{{{BPMN_NS}}}extensionElements")
    if extension is None:
        return []
    return [
        child
        for child in list(extension)
        if _strip_ns(child.tag).lower() == local_name.lower()
    ]


def extract_attack_data(task_elem) -> Dict[str, List[str]]:
    """Extract ATT&CK techniques and tactics from task element."""
    techniques = _split_attr_list(task_elem.get(f"{{{ATTACK_NS}}}techniques", ""))
    tactics = _split_attr_list(task_elem.get(f"{{{ATTACK_NS}}}tactics", ""))

    mappings = _get_extension_element(task_elem, "mapping")
    for mapping in mappings:
        for child in list(mapping):
            local = _strip_ns(child.tag).lower()
            if "technique" in local:
                technique_id = child.get("id") or (child.text or "").strip()
                if technique_id:
                    techniques.append(technique_id)
            elif "tactic" in local:
                tactic_name = (child.text or "").strip()
                if tactic_name:
                    tactics.append(tactic_name)

    return {
        "techniques": _merge_lists(techniques),
        "tactics": _merge_lists(tactics),
    }


def extract_ir_metadata(task_elem) -> Dict[str, str]:
    """Extract incident-response specific metadata from attributes and extensions."""
    metadata_map = {
        "phase": "phase",
        "role": "role",
        "tool": "tool",
        "priority": "priority",
        "estimatedtime": "estimated_time",
        "estimated_time": "estimated_time",
        "evidence": "evidence",
        "notes": "notes",
    }

    metadata = {}

    # Attributes
    for attr, key in metadata_map.items():
        value = task_elem.get(f"{{{IRP_NS}}}{attr}")
        if value:
            metadata[key] = value

    # Extension elements (irp:metadata)
    metadata_elements = _get_extension_element(task_elem, "metadata")
    for meta in metadata_elements:
        for child in list(meta):
            local = _strip_ns(child.tag)
            normalized = metadata_map.get(local.lower())
            if normalized:
                text_value = (child.text or "").strip()
                if text_value:
                    metadata[normalized] = text_value

    return metadata


def extract_task_data(task_elem) -> Dict:
    """Return normalized task metadata dictionary."""
    task_data = {
        "task_id": task_elem.get("id"),
        "task_name": task_elem.get("name", "Unnamed Task"),
        "task_type": _strip_ns(task_elem.tag),
    }

    attack = extract_attack_data(task_elem)
    if attack["techniques"]:
        task_data["attack_techniques"] = attack["techniques"]
    if attack["tactics"]:
        task_data["attack_tactics"] = attack["tactics"]

    ir_meta = extract_ir_metadata(task_elem)
    task_data.update(ir_meta)

    return task_data


def iter_task_elements(root) -> List:
    """Yield all task-like BPMN elements from the tree."""
    tasks = []
    for elem in root.iter():
        if elem.tag is None:
            continue
        tag = _strip_ns(elem.tag)
        if tag and tag.lower().endswith("task"):
            tasks.append(elem)
    return tasks


def extract_tasks_from_bpmn(bpmn_xml: str) -> List[Dict]:
    """Parse BPMN XML and return task metadata dictionaries."""
    try:
        root = ET.fromstring(bpmn_xml)
    except ET.ParseError:
        return []

    return [extract_task_data(task) for task in iter_task_elements(root)]


