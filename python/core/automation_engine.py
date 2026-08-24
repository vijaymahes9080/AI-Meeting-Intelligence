"""
Automation Engine Module
Converts meeting tasks and decisions into automated downstream actions:
- Jira / GitHub Issue Tickets
- Slack Broadcast Alerts & Reminders
- Google Calendar Milestones & Deadlines
"""
from typing import Dict, List, Any

class AutomationEngine:
    def __init__(self):
        self.dispatched_actions: List[Dict[str, Any]] = []

    def generate_actions_for_meeting(self, meeting_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        actions = []
        meeting_id = meeting_data.get("id", "meet-new")
        meeting_title = meeting_data.get("title", "Meeting")

        for task in meeting_data.get("tasks", []):
            # 1. Jira Ticket Action
            actions.append({
                "id": f"act-jira-{task.get('id')}",
                "type": "JIRA_TICKET",
                "target": "Jira Cloud",
                "icon": "jira",
                "title": f"Create Ticket: {task.get('title')}",
                "assignee": task.get("owner", "Unassigned"),
                "priority": task.get("priority", "MEDIUM"),
                "dueDate": task.get("deadline", ""),
                "status": "DISPATCHED",
                "payload": {
                    "project": "PROJ-V2",
                    "summary": task.get("title"),
                    "assignee": task.get("owner"),
                    "priority": task.get("priority"),
                    "labels": ["ai-meeting-intelligence", meeting_id]
                }
            })

            # 2. Slack Notification Action
            actions.append({
                "id": f"act-slack-{task.get('id')}",
                "type": "SLACK_ALERT",
                "target": "#proj-v2-dev",
                "icon": "slack",
                "title": f"Notify @{task.get('owner')}: Action item assigned",
                "assignee": task.get("owner"),
                "dueDate": task.get("deadline", ""),
                "status": "QUEUED",
                "payload": {
                    "channel": "#proj-v2-dev",
                    "text": f"📋 *New Action Item from {meeting_title}*:\n*{task.get('title')}*\nOwner: @{task.get('owner')} | Due: {task.get('deadline')}"
                }
            })

        for dec in meeting_data.get("decisions", []):
            # Calendar Event Milestone
            actions.append({
                "id": f"act-cal-{dec.get('id')}",
                "type": "CALENDAR_EVENT",
                "target": "Google Calendar",
                "icon": "calendar",
                "title": f"Sync Decision Milestone: {dec.get('title')}",
                "assignee": dec.get("decisionMaker"),
                "status": "DISPATCHED",
                "payload": {
                    "event": dec.get("title"),
                    "attendees": dec.get("stakeholders", []),
                    "description": f"Decision: {dec.get('chosenOption')}\nRationale: {dec.get('rationale')}"
                }
            })

        self.dispatched_actions.extend(actions)
        return actions

    def get_all_actions(self) -> List[Dict[str, Any]]:
        return self.dispatched_actions
