"""
Calendar Sync & iCalendar (ICS) Generator Module
Generates RFC 5545 calendar files and Google Calendar event payloads for meeting milestones and deadlines.
"""
from typing import Dict, List, Any
import datetime

class CalendarSync:
    @staticmethod
    def generate_ics_event(title: str, description: str, start_dt: str, end_dt: str, uid: str) -> str:
        ics = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//AI Meeting Intelligence//EN",
            "CALSCALE:GREGORIAN",
            "BEGIN:VEVENT",
            f"UID:{uid}@ai-meeting-intelligence.internal",
            f"DTSTAMP:{datetime.datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}",
            f"SUMMARY:{title}",
            f"DESCRIPTION:{description}",
            "STATUS:CONFIRMED",
            "END:VEVENT",
            "END:VCALENDAR"
        ]
        return "\r\n".join(ics)
