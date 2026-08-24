"""
Executive Report Exporter Module
Generates governance-ready Markdown and structured JSON executive briefs from meeting graphs.
"""
from typing import Dict, List, Any

class ReportExporter:
    @staticmethod
    def generate_markdown_brief(meeting: Dict[str, Any], decisions: List[Dict[str, Any]], tasks: List[Dict[str, Any]], risks: List[Dict[str, Any]]) -> str:
        md = []
        md.append(f"# 📋 Executive Brief: {meeting.get('title', 'Meeting')}")
        md.append(f"**Date:** {meeting.get('date')} | **Attendees:** {', '.join(meeting.get('attendees', []))}")
        md.append(f"\n## 📌 Executive Summary\n{meeting.get('summary', 'No summary available.')}\n")
        
        md.append("## 🌐 Key Decisions Taken")
        if not decisions:
            md.append("_No major decisions recorded._")
        for d in decisions:
            md.append(f"### {d.get('title')}")
            md.append(f"- **Chosen Option:** `{d.get('chosenOption')}`")
            md.append(f"- **Rationale:** {d.get('rationale')}")
            md.append(f"- **Decision Maker:** {d.get('decisionMaker')}")
            md.append(f"- **Alternatives:** {', '.join(d.get('alternatives', []))}\n")

        md.append("## 📊 Action Items & Deadlines")
        for t in tasks:
            md.append(f"- [ ] **{t.get('title')}** — Owner: `@{t.get('owner')}` (Due: `{t.get('deadline')}`) [{t.get('priority')}]")

        md.append("\n## ⚠️ Identified Risks & Mitigations")
        for r in risks:
            md.append(f"- **{r.get('title')}** ({r.get('severity')}): {r.get('impactChain')} -> _Mitigation:_ {r.get('mitigation')}")

        md.append("\n---\n_Generated automatically by AI Meeting Intelligence System_")
        return "\n".join(md)
