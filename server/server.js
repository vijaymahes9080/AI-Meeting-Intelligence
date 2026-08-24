/**
 * AI Meeting Intelligence - Node.js Server
 * Provides REST API parity with the Python engine and serves the web visualizer studio.
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, '..', 'data', 'seedData.json');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

let rawData = fs.readFileSync(DATA_FILE, 'utf-8').replace(/^\uFEFF/, '');
let seedData = JSON.parse(rawData);

function setHeaders(res, contentType = 'application/json') {
  res.setHeader('Content-Type', contentType);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  if (req.method === 'OPTIONS') {
    setHeaders(res);
    res.writeHead(200);
    res.end();
    return;
  }

  // REST API Endpoints
  if (req.method === 'GET' && pathname === '/api/state') {
    setHeaders(res);
    res.writeHead(200);
    res.end(JSON.stringify(seedData));
    return;
  }

  if (req.method === 'POST' && pathname === '/api/query/why') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const { question } = JSON.parse(body || '{}');
      const q = (question || '').toLowerCase();
      let response = {};

      if (q.includes('postgres') || q.includes('database') || q.includes('db')) {
        response = {
          question,
          found: true,
          type: 'DECISION_EXPLANATION',
          headline: 'PostgreSQL was chosen for strict ACID transactions and existing team depth.',
          details: {
            decision: 'Adopt PostgreSQL as Primary Database for Project V2',
            chosenOption: 'PostgreSQL',
            meeting: 'Architecture & Database Selection Review (2026-07-18)',
            meetingId: 'meet-001',
            rationale: 'Project V2 requires strict ACID transaction compliance for multi-tenant billing engine, and the engineering team possesses 5+ years of operational experience with it. JSONB indexing provides document-like flexibility.',
            alternatives: ['MongoDB', 'MySQL'],
            decisionMakers: 'Architecture Review Board (Sarah, Elena)',
            stakeholders: ['Backend Team', 'DevOps Team', 'Data Team'],
            relatedRisks: ['Database Migration & Sharding Complexity (Managed via connection pooling & Citus)'],
            followUpTasks: [
              'Draft PostgreSQL Schema Specification (Sarah - Completed)',
              'Setup PostgreSQL Dockerized Local & Staging Clusters (Arun - Completed)'
            ],
            evidenceQuote: "Sarah: 'We evaluated MongoDB, MySQL, and PostgreSQL. PostgreSQL is our recommended choice because Project V2 demands strict ACID transaction compliance...'"
          },
          graphBreadcrumbs: [
            { label: 'Project V2', type: 'Project' },
            { label: 'PostgreSQL', type: 'Technology' },
            { label: 'Architecture Review (July 18)', type: 'Meeting' },
            { label: 'ACID Compliance', type: 'Rationale' },
            { label: 'Sarah & Elena', type: 'DecisionMakers' }
          ]
        };
      } else if (q.includes('launch') || q.includes('friday') || q.includes('schedule') || q.includes('august 28')) {
        response = {
          question,
          found: true,
          type: 'DECISION_EXPLANATION',
          headline: 'Launch locked for Friday, August 28th to synchronize with Q3 customer renewal milestones.',
          details: {
            decision: 'Project V2 Launch Milestone Scheduled for August 28',
            chosenOption: 'Friday, August 28 (5:00 PM UTC)',
            meeting: 'V2 Sprint Planning & Launch Milestones (2026-08-10)',
            meetingId: 'meet-002',
            rationale: 'Direct alignment with high-value customer renewal cycles and executive Q3 demonstration board commitments.',
            alternatives: ['September 10 (Too late for renewals)', 'August 21 (Rejected in Meeting 3 due to insufficient QA buffer)'],
            decisionMakers: 'Elena (Product Director)',
            stakeholders: ['Executive Team', 'Product', 'QA (Dev)', 'DevOps (Marcus)'],
            relatedRisks: ['Tight Cascade Dependency Risk (Arun API completion -> Dev QA verification -> Production release)'],
            followUpTasks: [
              'Complete Core API Integration Endpoints (Arun - Due Aug 26)',
              'Execute End-to-End QA & Load Testing (Dev - Due Aug 28)',
              'Pair Sarah with Arun for critical path unblocking (Meeting 4)'
            ],
            evidenceQuote: "Elena: 'Arun commits to Wednesday Aug 26, Dev gets Thursday & Friday for QA, and we launch Friday August 28th at 5 PM.'"
          },
          graphBreadcrumbs: [
            { label: 'Project V2', type: 'Project' },
            { label: 'August 28 Target', type: 'Milestone' },
            { label: 'Elena (Product)', type: 'DecisionMaker' },
            { label: 'Arun API -> Dev QA Chain', type: 'Dependency' }
          ]
        };
      } else {
        response = {
          question,
          found: true,
          type: 'DEPENDENCY_EXPLANATION',
          headline: 'API delay was caused by third-party webhook rate-limiting; unblocked by pairing Sarah with Arun.',
          details: {
            decision: 'Pair Architecture Lead (Sarah) with Backend Lead (Arun)',
            chosenOption: 'Implement Redis Rate-Limit Queue immediately',
            meeting: 'Emergency Readiness Alignment (2026-08-23)',
            meetingId: 'meet-004',
            rationale: 'Guarantees Wednesday 2 PM build delivery to QA, preserving the mandatory 48-hour testing window before Friday launch.',
            alternatives: ['Postpone release to Sep 4', 'Ship without webhook support'],
            decisionMakers: 'Elena (Product Director) & Sarah (Lead Architect)',
            stakeholders: ['QA Team (Dev)', 'Backend (Arun)', 'DevOps (Marcus)'],
            relatedRisks: ['Critical: QA Starvation if API delivery slipped beyond Wednesday'],
            followUpTasks: [
              'Redis Webhook Rate-Limit Queue (Sarah & Arun - Completed)',
              'Handover build to QA Wednesday 2:00 PM (Arun - In Progress)'
            ],
            evidenceQuote: "Sarah: 'The Redis rate-limit queue is built and tested. Arun is now back on track to deliver the finalized API endpoints by Wednesday 2 PM.'"
          },
          graphBreadcrumbs: [
            { label: 'API Integration', type: 'Task' },
            { label: 'Webhook Rate Limits', type: 'Risk' },
            { label: 'Sarah + Arun Pairing', type: 'Decision' },
            { label: 'QA 48h Window Preserved', type: 'Outcome' }
          ]
        };
      }

      setHeaders(res);
      res.writeHead(200);
      res.end(JSON.stringify(response));
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/meetings/process') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const newMeet = JSON.parse(body || '{}');
      newMeet.id = `meet-00${seedData.meetings.length + 1}`;
      newMeet.date = new Date().toISOString().split('T')[0];
      newMeet.time = '10:30 AM';
      newMeet.summary = `Processed intelligence from ${newMeet.title}`;
      newMeet.decisions = newMeet.decisions || [
        {
          id: `dec-00${seedData.meetings.length + 1}`,
          title: `Action Directive for ${newMeet.title}`,
          chosenOption: 'Approved Strategy',
          alternatives: ['Status Quo'],
          rationale: 'Extracted from live meeting consensus.',
          decisionMaker: 'Team Lead',
          stakeholders: ['Engineering', 'Product'],
          meetingId: newMeet.id,
          status: 'APPROVED',
          consequences: ['Execution begins immediately']
        }
      ];
      newMeet.tasks = newMeet.tasks || [
        {
          id: `task-0${seedData.meetings.length + 9}`,
          title: `Implement key findings from ${newMeet.title}`,
          owner: 'Arun',
          deadline: '2026-09-02',
          status: 'IN_PROGRESS',
          dependsOn: [],
          priority: 'HIGH',
          meetingId: newMeet.id
        }
      ];
      newMeet.risks = newMeet.risks || [
        {
          id: `risk-00${seedData.meetings.length + 1}`,
          title: `Execution monitoring for ${newMeet.title}`,
          severity: 'LOW',
          impactChain: 'Minor resource adjustment',
          mitigation: 'Weekly checkpoint',
          meetingId: newMeet.id
        }
      ];

      seedData.meetings.push(newMeet);
      setHeaders(res);
      res.writeHead(200);
      res.end(JSON.stringify(newMeet));
    });
    return;
  }

  // Static File Serving
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 AI Meeting Intelligence Server running at http://localhost:${PORT}`);
  console.log(`🧠 Web Intelligence Studio: http://localhost:${PORT}\n`);
});
