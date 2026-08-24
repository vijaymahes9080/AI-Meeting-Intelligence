"""
Risk Analyzer Module
Evaluates risks, downstream bottleneck cascades, assumption fragility, and computes risk severity levels.
"""
from typing import Dict, List, Any

class RiskNode:
    def __init__(self, id: str, title: str, severity: str, impact_chain: str,
                 mitigation: str, meeting_id: str, status: str = "ACTIVE"):
        self.id = id
        self.title = title
        self.severity = severity # LOW, MEDIUM, HIGH, CRITICAL
        self.impact_chain = impact_chain
        self.mitigation = mitigation
        self.meeting_id = meeting_id
        self.status = status

    def get_score(self) -> int:
        scores = {"LOW": 25, "MEDIUM": 50, "HIGH": 75, "CRITICAL": 100}
        return scores.get(self.severity.upper(), 50)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "severity": self.severity,
            "score": self.get_score(),
            "impactChain": self.impact_chain,
            "mitigation": self.mitigation,
            "meetingId": self.meeting_id,
            "status": self.status
        }

class RiskAnalyzer:
    def __init__(self):
        self.risks: Dict[str, RiskNode] = {}

    def add_risk(self, risk_data: Dict[str, Any]) -> RiskNode:
        node = RiskNode(
            id=risk_data.get("id"),
            title=risk_data.get("title", ""),
            severity=risk_data.get("severity", "MEDIUM"),
            impact_chain=risk_data.get("impactChain", ""),
            mitigation=risk_data.get("mitigation", ""),
            meeting_id=risk_data.get("meetingId", ""),
            status=risk_data.get("status", "ACTIVE")
        )
        self.risks[node.id] = node
        return node

    def compute_organization_risk_score(self) -> Dict[str, Any]:
        if not self.risks:
            return {"overallScore": 0, "status": "NOMINAL", "criticalCount": 0, "highCount": 0}
        
        active_risks = [r for r in self.risks.values() if r.status == "ACTIVE"]
        if not active_risks:
            return {"overallScore": 15, "status": "STABLE", "criticalCount": 0, "highCount": 0}
            
        total_score = sum(r.get_score() for r in active_risks)
        avg_score = total_score / len(active_risks)
        critical_count = sum(1 for r in active_risks if r.severity == "CRITICAL")
        high_count = sum(1 for r in active_risks if r.severity == "HIGH")

        status = "STABLE"
        if critical_count > 0 or avg_score >= 70:
            status = "CRITICAL"
        elif high_count > 0 or avg_score >= 50:
            status = "ELEVATED"

        return {
            "overallScore": round(avg_score, 1),
            "status": status,
            "criticalCount": critical_count,
            "highCount": high_count,
            "activeRisksCount": len(active_risks)
        }

    def to_dict(self) -> List[Dict[str, Any]]:
        return [r.to_dict() for r in self.risks.values()]
