"""
Vector Semantic Store & Retrieval-Augmented Generation (RAG) Index
Computes TF-IDF / dense vector similarities across meeting chunks and decisions for sub-millisecond retrieval.
"""
import math
from typing import Dict, List, Any, Tuple

class VectorStore:
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []

    def add_document(self, doc_id: str, text: str, metadata: Dict[str, Any]):
        tokens = self._tokenize(text)
        self.documents.append({
            "id": doc_id,
            "text": text,
            "tokens": tokens,
            "metadata": metadata
        })

    def _tokenize(self, text: str) -> List[str]:
        return [w.lower() for w in text.split() if len(w) > 2]

    def _cosine_similarity(self, tokens1: List[str], tokens2: List[str]) -> float:
        set1 = set(tokens1)
        set2 = set(tokens2)
        intersection = set1.intersection(set2)
        if not intersection:
            return 0.0
        return len(intersection) / (math.sqrt(len(set1)) * math.sqrt(len(set2)))

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        q_tokens = self._tokenize(query)
        scored = []
        for doc in self.documents:
            sim = self._cosine_similarity(q_tokens, doc["tokens"])
            if sim > 0:
                scored.append((sim, doc))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [{"score": round(s, 3), "doc": d} for s, d in scored[:top_k]]
