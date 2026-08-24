# 🧠 AI Meeting Intelligence

> **“Don’t just record what people said. Understand what the organization decided, what must happen next, why it matters, and what could go wrong.”**

**AI Meeting Intelligence** transforms passive meeting recordings and transcripts into an active, searchable **organizational intelligence graph and execution layer**.

---

## 🌟 Core Intelligence Layers

| Intelligence Layer | What it Creates & Manages | Key Output |
| :--- | :--- | :--- |
| **🌐 Decision Graph** | Decisions, alternatives considered, decision-makers, rationale, downstream impacts | Traceable decision histories |
| **📊 Task Graph** | Action items, owners, deadlines, critical paths, blockers, status | Dependency-aware execution plans |
| **🧠 Knowledge Graph** | Entities (people, projects, products, customers, technologies, concepts) & relationships | Interconnected organizational memory |
| **⚠️ Risk Analysis** | Proactive risk detection, unresolved issues, assumptions, conflicts, missed dependencies | Early warning indicators & severity scores |
| **⚡ Follow-up Automation** | Automated action items, reminders, calendar events, ticket creation, status checks | Zero-friction meeting-to-execution pipeline |

---

## 🚀 Advanced Capabilities

### 1. 🔄 Continuous Meeting Memory
Unlike standard transcription tools that treat each meeting in isolation, AI Meeting Intelligence constructs a persistent timeline and context graph across meetings:
- **Meeting 1:** Project requirements discussed & scoped
- **Meeting 2:** Architecture & database selected
- **Meeting 3:** Implementation timeline delayed
- **Meeting 4:** Risk escalated with mitigation path

### 2. 🔍 Decision Traceability
Trace any strategic or technical decision back through its complete lifecycle:
```text
Decision ➔ Rationale ➔ Key Stakeholders ➔ Evidence ➔ Alternatives Considered ➔ Consequences
```

### 3. 🚨 Contradiction & Conflict Detection
AI constantly cross-references statements against historical and cross-functional facts:
- **Schedule Conflicts:** e.g., *"Launch on Sep 10"* (Meeting A) vs *"Launch on Sep 5"* (Meeting B).
- **Information Conflicts:** e.g., *"API is complete"* (Person A) vs *"Three endpoints unresolved"* (Person B).

### 4. ⚡ Meeting-to-Execution Pipeline
```
[ Meeting / Audio / Documents ]
               ↓
     [ AI Understanding ]
  ┌────────────┼────────────┐
  ↓            ↓            ↓
[ Decision ] [ Task  ] [ Risk      ]
[ Graph    ] [ Graph ] [ Analysis  ]
  └────────────┬────────────┘
               ↓
    [ Automated Actions ]
               ↓
    [ Project Execution ]
```

### 5. 💡 Killer Feature: *"Why Did We Decide This?"*
Ask natural language questions about past decisions:
> **"Why did we choose PostgreSQL for Project X?"**

**Response:**
* **Decision:** PostgreSQL
* **Meeting:** Architecture Review – July 18
* **Reason:** Strict ACID transaction requirements + existing team depth
* **Alternatives Evaluated:** MongoDB, MySQL
* **Decision-makers:** Architecture & Data Teams
* **Identified Risks:** Sharding/migration complexity
* **Follow-up:** Database schema migration task assigned to Data Eng

---

## 🏗️ Architecture & Modules

```
├── core/
│   ├── ingestion/         # Audio, video, and transcript parsers
│   ├── intelligence/      # NLP, LLM extraction & reasoning pipelines
│   ├── graph/             # Decision, Task & Knowledge graph engines
│   ├── risk/              # Risk evaluation & contradiction detection
│   └── automation/        # Action triggers, calendar & issue tracking integrations
├── api/                   # REST / GraphQL / WebSocket APIs
└── web/                   # Interactive UI & Graph Visualizer
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
