"""
Knowledge Graph Module
Builds and maintains the unified organizational knowledge brain:
People <-> Projects <-> Tasks <-> Decisions <-> Technologies <-> Risks <-> Meetings
"""
from typing import Dict, List, Any, Optional

class KnowledgeGraph:
    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.edges: List[Dict[str, Any]] = []

    def add_entity(self, entity_id: str, label: str, entity_type: str, metadata: Optional[Dict[str, Any]] = None):
        if entity_id not in self.nodes:
            self.nodes[entity_id] = {
                "id": entity_id,
                "label": label,
                "type": entity_type, # Person, Project, Technology, Decision, Task, Risk, Meeting
                "metadata": metadata or {}
            }
        else:
            if metadata:
                self.nodes[entity_id]["metadata"].update(metadata)

    def add_relationship(self, source: str, target: str, relationship_type: str, weight: float = 1.0, metadata: Optional[Dict[str, Any]] = None):
        # Prevent duplicates
        for edge in self.edges:
            if edge["source"] == source and edge["target"] == target and edge["type"] == relationship_type:
                return
        self.edges.append({
            "source": source,
            "target": target,
            "type": relationship_type,
            "weight": weight,
            "metadata": metadata or {}
        })

    def get_entity_subgraph(self, entity_id: str, depth: int = 1) -> Dict[str, Any]:
        """Extract localized neighborhood for an entity"""
        if entity_id not in self.nodes:
            return {"nodes": [], "edges": []}
        
        visited_nodes = {entity_id}
        current_layer = {entity_id}
        
        for _ in range(depth):
            next_layer = set()
            for edge in self.edges:
                if edge["source"] in current_layer and edge["target"] not in visited_nodes:
                    visited_nodes.add(edge["target"])
                    next_layer.add(edge["target"])
                elif edge["target"] in current_layer and edge["source"] not in visited_nodes:
                    visited_nodes.add(edge["source"])
                    next_layer.add(edge["source"])
            current_layer = next_layer
        
        subgraph_nodes = [self.nodes[nid] for nid in visited_nodes if nid in self.nodes]
        subgraph_edges = [
            e for e in self.edges 
            if e["source"] in visited_nodes and e["target"] in visited_nodes
        ]
        return {"nodes": subgraph_nodes, "edges": subgraph_edges}

    def search_entities(self, query: str) -> List[Dict[str, Any]]:
        query_lower = query.lower()
        results = []
        for nid, data in self.nodes.items():
            if query_lower in data["label"].lower() or query_lower in nid.lower() or query_lower in data["type"].lower():
                results.append(data)
        return results

    def to_dict(self) -> Dict[str, Any]:
        return {
            "nodes": list(self.nodes.values()),
            "edges": self.edges
        }
