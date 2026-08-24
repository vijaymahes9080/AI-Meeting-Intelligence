"""
Meeting Cost & ROI Optimization Engine
Calculates the precise financial dollar cost of organizational meetings and measures Decision Velocity / Cost Ratio.
"""
from typing import Dict, List, Any

class MeetingROIEngine:
    def __init__(self):
        # Estimated default hourly rates per role
        self.role_hourly_rates = {
            "Director": 180,
            "Architect": 150,
            "Lead": 130,
            "Engineer": 100,
            "QA": 85,
            "DevOps": 110,
            "Default": 100
        }

    def compute_meeting_cost(self, duration_minutes: int, attendees: List[str], decisions_count: int, tasks_count: int) -> Dict[str, Any]:
        total_hourly_rate = 0
        for att in attendees:
            rate = self.role_hourly_rates["Default"]
            for role, r_rate in self.role_hourly_rates.items():
                if role.lower() in att.lower():
                    rate = r_rate
                    break
            total_hourly_rate += rate

        hours = duration_minutes / 60.0
        total_dollar_cost = round(total_hourly_rate * hours, 2)
        cost_per_decision = round(total_dollar_cost / max(1, decisions_count), 2)
        
        # Efficiency Score (decisions & tasks delivered per dollar spent)
        output_units = (decisions_count * 2.5) + (tasks_count * 1.0)
        efficiency_score = min(100, int((output_units / max(1, total_dollar_cost / 100)) * 25))

        return {
            "durationMinutes": duration_minutes,
            "attendeesCount": len(attendees),
            "estimatedDollarCost": total_dollar_cost,
            "costPerDecision": cost_per_decision,
            "efficiencyScore": efficiency_score,
            "roiRating": "HIGH" if efficiency_score >= 70 else "MODERATE" if efficiency_score >= 40 else "LOW"
        }
