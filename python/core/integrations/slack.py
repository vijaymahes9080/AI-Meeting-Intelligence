"""
Slack Integration Module
Constructs Slack Block Kit payloads for interactive decision approvals and actionable task assignments.
"""
from typing import Dict, List, Any

class SlackIntegration:
    @staticmethod
    def build_decision_approval_blocks(decision: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"🧠 Decision Recorded: {decision.get('chosenOption', 'New Decision')}"
                    }
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*Title:*\n{decision.get('title')}"},
                        {"type": "mrkdwn", "text": f"*Decision Maker:*\n{decision.get('decisionMaker')}"},
                        {"type": "mrkdwn", "text": f"*Rationale:*\n{decision.get('rationale')}"},
                        {"type": "mrkdwn", "text": f"*Status:*\n`{decision.get('status', 'APPROVED')}`"}
                    ]
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {"type": "plain_text", "text": "✅ Acknowledge"},
                            "style": "primary",
                            "value": f"ack_{decision.get('id')}"
                        },
                        {
                            "type": "button",
                            "text": {"type": "plain_text", "text": "🔍 Trace Decision"},
                            "value": f"trace_{decision.get('id')}"
                        }
                    ]
                }
            ]
        }
