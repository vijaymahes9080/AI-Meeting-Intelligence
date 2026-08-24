"""
Sentiment & Psychological Safety Analyzer Module
Measures conversational tone, alignment coefficient, speaker balance, and constructive friction.
"""
from typing import Dict, List, Any

class SentimentAnalyzer:
    def __init__(self):
        self.sentiment_weights = {
            "positive": ["agree", "excellent", "approved", "unblocked", "great", "ready"],
            "constructive": ["evaluate", "spec", "consider", "alternative", "benchmark"],
            "friction": ["delay", "bottleneck", "cannot", "misunderstanding", "conflict", "slip"]
        }

    def analyze_meeting(self, meeting_data: Dict[str, Any]) -> Dict[str, Any]:
        transcript = meeting_data.get("transcript", "")
        lines = transcript.split("\n")
        
        speaker_stats = {}
        total_words = 0
        positive_count = 0
        friction_count = 0

        for line in lines:
            if ":" not in line:
                continue
            speaker, text = line.split(":", 1)
            speaker = speaker.strip()
            words = text.split()
            word_count = len(words)
            total_words += word_count

            if speaker not in speaker_stats:
                speaker_stats[speaker] = {"words": 0, "contributions": 0}
            speaker_stats[speaker]["words"] += word_count
            speaker_stats[speaker]["contributions"] += 1

            text_lower = text.lower()
            for p in self.sentiment_weights["positive"]:
                if p in text_lower:
                    positive_count += 1
            for f in self.sentiment_weights["friction"]:
                if f in text_lower:
                    friction_count += 1

        # Psychological safety score (0 - 100)
        alignment_score = max(30, min(95, 70 + (positive_count * 5) - (friction_count * 4)))
        
        return {
            "meetingId": meeting_data.get("id"),
            "alignmentScore": alignment_score,
            "sentimentStatus": "CONSTRUCTIVE" if alignment_score >= 65 else "TENSE",
            "speakerDistribution": {
                s: round((d["words"] / max(1, total_words)) * 100, 1) 
                for s, d in speaker_stats.items()
            },
            "constructiveFrictionPoints": friction_count,
            "positiveConsensusMoments": positive_count
        }
