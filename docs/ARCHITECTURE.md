# 🏗️ AI Meeting Intelligence — Architecture Blueprint

## System Architecture

```
[ Conversation / Transcripts / Speech ]
                   │
                   ▼
       [ Multi-Agent LLM Router ]
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
[ Decision ]   [ Task DAG ]   [ Knowledge ]
[  Graph   ]   [  Engine  ]   [  Graph    ]
    │              │              │
    └──────────────┼──────────────┘
                   ▼
    [ Continuous Memory Core ]
                   │
    ┌──────────────┴──────────────┐
    ▼                             ▼
[ Contradiction Engine ]    [ Risk Radar ]
    │                             │
    └──────────────┬──────────────┘
                   ▼
      [ "Why Did We Decide This?" ]
                   │
                   ▼
   [ Action Integrations Pipeline ]
   (Slack, Jira, GitHub, Google Cal)
```

## Graph Schemas

### 1. Decision Graph
- `DecisionNode`: `{ id, title, chosenOption, alternatives, rationale, decisionMaker, stakeholders, consequences }`
- Edge: `INFLUENCES`

### 2. Task DAG
- `TaskNode`: `{ id, title, owner, deadline, status, dependsOn, priority }`
- Edge: `BLOCKS`

### 3. Knowledge Graph
- Nodes: `Person`, `Project`, `Technology`, `Decision`, `Task`, `Risk`, `Meeting`
- Relations: `OWNS`, `ARCHITECT`, `STORAGE`, `VERIFIES`, `MITIGATES`, `THREATENS`
