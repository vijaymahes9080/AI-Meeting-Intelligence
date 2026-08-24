"""
Task Graph Module
Manages action items, ownership, deadlines, dependency DAGs, critical path analysis, and blocker identification.
"""
from typing import Dict, List, Any, Optional

class TaskNode:
    def __init__(self, id: str, title: str, owner: str, deadline: str,
                 status: str = "PENDING", depends_on: Optional[List[str]] = None,
                 priority: str = "MEDIUM", meeting_id: str = ""):
        self.id = id
        self.title = title
        self.owner = owner
        self.deadline = deadline
        self.status = status # PENDING, IN_PROGRESS, COMPLETED, BLOCKED, SCHEDULED
        self.depends_on = depends_on or []
        self.priority = priority # LOW, MEDIUM, HIGH, CRITICAL
        self.meeting_id = meeting_id
        self.dependents = []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "owner": self.owner,
            "deadline": self.deadline,
            "status": self.status,
            "dependsOn": self.depends_on,
            "priority": self.priority,
            "meetingId": self.meeting_id,
            "dependents": self.dependents
        }

class TaskGraph:
    def __init__(self):
        self.tasks: Dict[str, TaskNode] = {}
        self.edges: List[Dict[str, str]] = []

    def add_task(self, task_data: Dict[str, Any]) -> TaskNode:
        node = TaskNode(
            id=task_data.get("id"),
            title=task_data.get("title", ""),
            owner=task_data.get("owner", "Unassigned"),
            deadline=task_data.get("deadline", ""),
            status=task_data.get("status", "PENDING"),
            depends_on=task_data.get("dependsOn", []),
            priority=task_data.get("priority", "MEDIUM"),
            meeting_id=task_data.get("meetingId", "")
        )
        self.tasks[node.id] = node
        return node

    def build_dependencies(self):
        self.edges = []
        for task_id, task in self.tasks.items():
            for parent_id in task.depends_on:
                if parent_id in self.tasks:
                    if task_id not in self.tasks[parent_id].dependents:
                        self.tasks[parent_id].dependents.append(task_id)
                    self.edges.append({
                        "source": parent_id,
                        "target": task_id,
                        "relation": "BLOCKS"
                    })

    def update_task_status(self, task_id: str, new_status: str):
        if task_id in self.tasks:
            self.tasks[task_id].status = new_status
            self._propagate_blockers()

    def _propagate_blockers(self):
        for task_id, task in self.tasks.items():
            if task.status == "COMPLETED":
                continue
            has_uncompleted_parent = False
            for parent_id in task.depends_on:
                if parent_id in self.tasks and self.tasks[parent_id].status != "COMPLETED":
                    has_uncompleted_parent = True
                    break
            if has_uncompleted_parent and task.status != "IN_PROGRESS":
                task.status = "BLOCKED"

    def get_critical_path(self) -> List[Dict[str, Any]]:
        self.build_dependencies()
        # Find path with longest chain of critical / high tasks
        critical_tasks = []
        for t in self.tasks.values():
            if t.priority in ["CRITICAL", "HIGH"] or len(t.dependents) > 0:
                critical_tasks.append(t.to_dict())
        return critical_tasks

    def to_dict(self) -> Dict[str, Any]:
        self.build_dependencies()
        return {
            "nodes": [t.to_dict() for t in self.tasks.values()],
            "edges": self.edges
        }
