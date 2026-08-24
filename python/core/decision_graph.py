"""
Decision Graph Module
Represents decisions, alternatives considered, rationale, decision-makers, stakeholders, and downstream consequences.
"""
from typing import Dict, List, Any, Optional

class DecisionNode:
    def __init__(self, id: str, title: str, chosen_option: str, alternatives: List[str],
                 rationale: str, decision_maker: str, stakeholders: List[str],
                 meeting_id: str, status: str = "APPROVED", consequences: Optional[List[str]] = None):
        self.id = id
        self.title = title
        self.chosen_option = chosen_option
        self.alternatives = alternatives or []
        self.rationale = rationale
        self.decision_maker = decision_maker
        self.stakeholders = stakeholders or []
        self.meeting_id = meeting_id
        self.status = status
        self.consequences = consequences or []
        self.dependencies = []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "chosenOption": self.chosen_option,
            "alternatives": self.alternatives,
            "rationale": self.rationale,
            "decisionMaker": self.decision_maker,
            "stakeholders": self.stakeholders,
            "meetingId": self.meeting_id,
            "status": self.status,
            "consequences": self.consequences,
            "dependencies": self.dependencies
        }

class DecisionGraph:
    def __init__(self):
        self.decisions: Dict[str, DecisionNode] = {}
        self.edges: List[Dict[str, str]] = []

    def add_decision(self, decision_data: Dict[str, Any]) -> DecisionNode:
        node = DecisionNode(
            id=decision_data.get("id"),
            title=decision_data.get("title", ""),
            chosen_option=decision_data.get("chosenOption", ""),
            alternatives=decision_data.get("alternatives", []),
            rationale=decision_data.get("rationale", ""),
            decision_maker=decision_data.get("decisionMaker", ""),
            stakeholders=decision_data.get("stakeholders", []),
            meeting_id=decision_data.get("meetingId", ""),
            status=decision_data.get("status", "APPROVED"),
            consequences=decision_data.get("consequences", [])
        )
        self.decisions[node.id] = node
        return node

    def link_decisions(self, source_id: str, target_id: str, relation: str = "INFLUENCES"):
        if source_id in self.decisions and target_id in self.decisions:
            self.edges.append({
                "source": source_id,
                "target": target_id,
                "relation": relation
            })
            self.decisions[target_id].dependencies.append(source_id)

    def get_decision(self, decision_id: str) -> Optional[Dict[str, Any]]:
        if decision_id in self.decisions:
            return self.decisions[decision_id].to_dict()
        return None

    def get_traceability(self, decision_id: str) -> Optional[Dict[str, Any]]:
        if decision_id not in self.decisions:
            return None
        dec = self.decisions[decision_id]
        return {
            "decision": dec.title,
            "chosenOption": dec.chosen_option,
            "rationale": dec.rationale,
            "decisionMakers": dec.decision_maker,
            "stakeholders": dec.stakeholders,
            "alternativesEvaluated": dec.alternatives,
            "consequences": dec.consequences,
            "meetingOrigin": dec.meeting_id
        }

    def to_dict(self) -> Dict[str, Any]:
        return {
            "nodes": [d.to_dict() for d in self.decisions.values()],
            "edges": self.edges
        }
