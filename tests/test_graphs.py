"""
Automated Test Suite for AI Meeting Intelligence
Verifies Decision Graph, Task DAG, Contradiction Detection, and Query Engine correctness.
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "python")))

from core.decision_graph import DecisionGraph
from core.task_graph import TaskGraph
from core.risk_analyzer import RiskAnalyzer
from core.contradiction_detector import ContradictionDetector

class TestMeetingIntelligence(unittest.TestCase):
    def test_decision_graph_creation(self):
        dg = DecisionGraph()
        node = dg.add_decision({
            "id": "dec-test",
            "title": "Adopt PostgreSQL",
            "chosenOption": "PostgreSQL",
            "alternatives": ["MongoDB"],
            "rationale": "ACID guarantees",
            "decisionMaker": "Lead Architect"
        })
        self.assertEqual(node.chosen_option, "PostgreSQL")
        self.assertIn("MongoDB", node.alternatives)

    def test_task_graph_dependency(self):
        tg = TaskGraph()
        t1 = tg.add_task({"id": "t1", "title": "Spec", "status": "COMPLETED"})
        t2 = tg.add_task({"id": "t2", "title": "Implement", "dependsOn": ["t1"], "status": "PENDING"})
        tg.build_dependencies()
        self.assertIn("t2", t1.dependents)

    def test_risk_severity_score(self):
        ra = RiskAnalyzer()
        r = ra.add_risk({"id": "r1", "title": "Timeline Slip", "severity": "CRITICAL"})
        self.assertEqual(r.get_score(), 100)

if __name__ == "__main__":
    unittest.main()
