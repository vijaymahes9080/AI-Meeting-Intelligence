"""
Master Intelligence Pipeline Module
Ingests transcripts, updates graphs, evaluates risks, detects contradictions, and exposes the unified intelligence system.
"""
import json
import os
from typing import Dict, List, Any
from .decision_graph import DecisionGraph
from .task_graph import TaskGraph
from .knowledge_graph import KnowledgeGraph
from .risk_analyzer import RiskAnalyzer
from .contradiction_detector import ContradictionDetector
from .query_engine import QueryEngine
from .automation_engine import AutomationEngine

class IntelligencePipeline:
    def __init__(self, data_path: str = None):
        self.decision_graph = DecisionGraph()
        self.task_graph = TaskGraph()
        self.knowledge_graph = KnowledgeGraph()
        self.risk_analyzer = RiskAnalyzer()
        self.contradiction_detector = ContradictionDetector()
        self.automation_engine = AutomationEngine()
        self.meetings: List[Dict[str, Any]] = []
        self.raw_data: Dict[str, Any] = {}
        
        if data_path and os.path.exists(data_path):
            self.load_from_json(data_path)
            
        self.query_engine = QueryEngine(
            self.decision_graph,
            self.task_graph,
            self.knowledge_graph,
            self.risk_analyzer,
            self.raw_data
        )

    def load_from_json(self, json_path: str):
        with open(json_path, "r", encoding="utf-8-sig") as f:
            self.raw_data = json.load(f)
            
        # 1. Populate Entities in Knowledge Graph
        org = self.raw_data.get("organization", {})
        proj_name = org.get("project", "Project V2")
        self.knowledge_graph.add_entity("proj-v2", proj_name, "Project", {"status": "ACTIVE"})
        
        # Add Team Members
        for member in org.get("team", []):
            name = member.split(" (")[0]
            role = member.split(" (")[1].replace(")", "") if "(" in member else "Member"
            self.knowledge_graph.add_entity(f"person-{name.lower()}", name, "Person", {"role": role})
            self.knowledge_graph.add_relationship(f"person-{name.lower()}", "proj-v2", "WORKS_ON")

        # 2. Ingest Meetings
        for m in self.raw_data.get("meetings", []):
            self.ingest_meeting(m, auto_dispatch=True)

        # 3. Add Contradictions
        for c in self.raw_data.get("contradictions", []):
            self.contradiction_detector.add_contradiction(c)

    def ingest_meeting(self, meeting: Dict[str, Any], auto_dispatch: bool = True) -> Dict[str, Any]:
        self.meetings.append(meeting)
        m_id = meeting.get("id")
        m_title = meeting.get("title", "Meeting")
        
        # Knowledge Graph Meeting Entity
        self.knowledge_graph.add_entity(m_id, m_title, "Meeting", {
            "date": meeting.get("date"),
            "summary": meeting.get("summary")
        })
        self.knowledge_graph.add_relationship(m_id, "proj-v2", "ASSOCIATED_WITH")

        # Ingest Decisions
        for dec in meeting.get("decisions", []):
            self.decision_graph.add_decision(dec)
            dec_id = dec.get("id")
            self.knowledge_graph.add_entity(dec_id, dec.get("title"), "Decision", {
                "chosen": dec.get("chosenOption"),
                "status": dec.get("status")
            })
            self.knowledge_graph.add_relationship(m_id, dec_id, "PRODUCED_DECISION")
            
            # Link Chosen Option if Tech
            chosen = dec.get("chosenOption", "")
            if "PostgreSQL" in chosen:
                self.knowledge_graph.add_entity("tech-postgres", "PostgreSQL", "Technology")
                self.knowledge_graph.add_relationship(dec_id, "tech-postgres", "SELECTED_TECH")
                self.knowledge_graph.add_relationship("tech-postgres", "proj-v2", "PERSISTENCE_LAYER")

        # Ingest Tasks
        for task in meeting.get("tasks", []):
            self.task_graph.add_task(task)
            t_id = task.get("id")
            self.knowledge_graph.add_entity(t_id, task.get("title"), "Task", {
                "owner": task.get("owner"),
                "priority": task.get("priority"),
                "status": task.get("status")
            })
            self.knowledge_graph.add_relationship(m_id, t_id, "CREATED_TASK")
            owner_name = task.get("owner", "").lower()
            if owner_name:
                self.knowledge_graph.add_relationship(f"person-{owner_name}", t_id, "ASSIGNED_TO")

        # Ingest Risks
        for risk in meeting.get("risks", []):
            self.risk_analyzer.add_risk(risk)
            r_id = risk.get("id")
            self.knowledge_graph.add_entity(r_id, risk.get("title"), "Risk", {
                "severity": risk.get("severity")
            })
            self.knowledge_graph.add_relationship(m_id, r_id, "IDENTIFIED_RISK")

        # Auto-generate automations
        if auto_dispatch:
            self.automation_engine.generate_actions_for_meeting(meeting)

        return {
            "meetingId": m_id,
            "status": "PROCESSED",
            "decisionsCount": len(meeting.get("decisions", [])),
            "tasksCount": len(meeting.get("tasks", [])),
            "risksCount": len(meeting.get("risks", []))
        }

    def process_raw_transcript(self, title: str, transcript: str, attendees: List[str] = None) -> Dict[str, Any]:
        """
        Parses raw meeting text using heuristic / LLM structure and merges into organizational graph.
        """
        import uuid
        from datetime import datetime
        new_id = f"meet-{uuid.uuid4().hex[:6]}"
        
        # Extract structured items from transcript
        decisions = []
        tasks = []
        risks = []

        transcript_lower = transcript.lower()
        if "decide" in transcript_lower or "agreed" in transcript_lower or "approve" in transcript_lower:
            decisions.append({
                "id": f"dec-{uuid.uuid4().hex[:6]}",
                "title": f"Decision from {title}",
                "chosenOption": "Approved Plan",
                "alternatives": ["Status Quo"],
                "rationale": "Extracted from meeting discussion",
                "decisionMaker": attendees[0] if attendees else "Leadership",
                "stakeholders": attendees or ["Team"],
                "meetingId": new_id,
                "status": "APPROVED",
                "consequences": ["Requires implementation"]
            })

        if "will" in transcript_lower or "by " in transcript_lower or "task" in transcript_lower:
            tasks.append({
                "id": f"task-{uuid.uuid4().hex[:6]}",
                "title": f"Follow-up Action from {title}",
                "owner": attendees[1] if attendees and len(attendees) > 1 else "Arun",
                "deadline": "2026-08-30",
                "status": "PENDING",
                "dependsOn": [],
                "priority": "HIGH",
                "meetingId": new_id
            })

        if "risk" in transcript_lower or "delay" in transcript_lower or "issue" in transcript_lower or "conflict" in transcript_lower:
            risks.append({
                "id": f"risk-{uuid.uuid4().hex[:6]}",
                "title": f"Execution Risk identified in {title}",
                "severity": "MEDIUM",
                "impactChain": "Potential timeline slip",
                "mitigation": "Active monitoring and stakeholder sync",
                "meetingId": new_id
            })

        new_meeting = {
            "id": new_id,
            "title": title,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "time": datetime.now().strftime("%I:%M %p"),
            "attendees": attendees or ["Elena", "Arun", "Sarah"],
            "transcript": transcript,
            "summary": f"Processed intelligence from {title}",
            "decisions": decisions,
            "tasks": tasks,
            "risks": risks
        }

        self.ingest_meeting(new_meeting, auto_dispatch=True)
        return new_meeting

    def get_full_state(self) -> Dict[str, Any]:
        return {
            "organization": self.raw_data.get("organization", {}),
            "meetings": self.meetings,
            "decisionsGraph": self.decision_graph.to_dict(),
            "tasksGraph": self.task_graph.to_dict(),
            "knowledgeGraph": self.knowledge_graph.to_dict(),
            "risks": self.risk_analyzer.to_dict(),
            "riskSummary": self.risk_analyzer.compute_organization_risk_score(),
            "contradictions": self.contradiction_detector.to_dict(),
            "automations": self.automation_engine.get_all_actions()
        }
