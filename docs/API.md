# 📡 AI Meeting Intelligence — REST API Reference

## Endpoints

### 1. Retrieve Full Organizational State
- **URL:** `GET /api/state`
- **Response:** Complete graph state with meetings, decisions, tasks, risks, and automations.

### 2. "Why Did We Decide This?" Query Engine
- **URL:** `POST /api/query/why`
- **Payload:** `{"question": "Why did we choose PostgreSQL?"}`
- **Response:**
```json
{
  "headline": "PostgreSQL was chosen for strict ACID transactions...",
  "details": {
    "decision": "Adopt PostgreSQL",
    "rationale": "ACID compliance for billing engine...",
    "alternatives": ["MongoDB", "MySQL"],
    "decisionMakers": "Sarah & Elena"
  },
  "graphBreadcrumbs": [...]
}
```

### 3. Process Real-Time Meeting Transcript
- **URL:** `POST /api/meetings/process`
- **Payload:** `{"title": "Title", "transcript": "...", "attendees": ["..."]}`

### 4. Dispatch Integration Action
- **URL:** `POST /api/automations/dispatch`
- **Payload:** `{"actionId": "act-jira-101"}`
