/**
 * AI Meeting Intelligence - Frontend Application Controller
 * Handles REST API sync with automatic relative path fallback for GitHub Pages.
 */

let state = null;
let activeMeetingIndex = 0;
let visualizerInstance = null;

async function fetchState() {
  try {
    const res = await fetch('/api/state');
    if (res.ok) {
      state = await res.json();
      renderAll();
      return;
    }
  } catch (err) {}

  // Fallback for static hosting / GitHub Pages
  try {
    const fallbackRes = await fetch('data/seedData.json');
    if (fallbackRes.ok) {
      state = await fallbackRes.json();
      renderAll();
      return;
    }
  } catch (e) {}

  try {
    const relRes = await fetch('../data/seedData.json');
    if (relRes.ok) {
      state = await relRes.json();
      renderAll();
      return;
    }
  } catch (e) {}
}

function renderAll() {
  if (!state) return;
  renderHeaderMetrics();
  renderMeetingsList();
  renderActiveMeeting(activeMeetingIndex);
  renderDecisionTab();
  renderTaskTab();
  renderKnowledgeGraphTab();
  renderRisksAndContradictions();
  renderAutomations();
}

function renderHeaderMetrics() {
  const totalMeetings = state.meetings ? state.meetings.length : 4;
  let totalDecisions = 0;
  let totalTasks = 0;
  let totalRisks = 0;

  (state.meetings || []).forEach(m => {
    totalDecisions += (m.decisions || []).length;
    totalTasks += (m.tasks || []).length;
    totalRisks += (m.risks || []).length;
  });

  const countEl = document.getElementById('metric-memory-count');
  if (countEl) {
    countEl.innerText = `${totalMeetings} Connected Meetings • ${totalDecisions} Decisions • ${totalTasks} Tasks`;
  }
}

function renderMeetingsList() {
  const listEl = document.getElementById('meeting-selector-list');
  if (!listEl || !state.meetings) return;

  let html = '';
  state.meetings.forEach((m, idx) => {
    const isActive = idx === activeMeetingIndex;
    html += `
      <div class="meeting-item-card ${isActive ? 'active' : ''}" onclick="selectMeeting(${idx})">
        <div class="meeting-meta">
          <span>${m.date}</span>
          <span>${m.attendees ? m.attendees.length : 0} Attendees</span>
        </div>
        <div class="meeting-title">${m.title}</div>
        <div class="meeting-tags">
          <span class="tag tag-cyan">${(m.decisions || []).length} Decisions</span>
          <span class="tag tag-amber">${(m.tasks || []).length} Tasks</span>
          <span class="tag tag-rose">${(m.risks || []).length} Risks</span>
        </div>
      </div>
    `;
  });
  listEl.innerHTML = html;
}

function selectMeeting(index) {
  activeMeetingIndex = index;
  renderMeetingsList();
  renderActiveMeeting(index);
}

function renderActiveMeeting(index) {
  if (!state || !state.meetings) return;
  const meeting = state.meetings[index];
  if (!meeting) return;

  const titleEl = document.getElementById('live-meeting-title');
  const metaEl = document.getElementById('live-meeting-meta');
  if (titleEl) titleEl.innerText = meeting.title;
  if (metaEl) metaEl.innerText = `Date: ${meeting.date} | Time: ${meeting.time} | Attendees: ${meeting.attendees.join(', ')}`;

  const transcriptBox = document.getElementById('live-transcript-box');
  if (transcriptBox) {
    const lines = meeting.transcript.split('\n');
    let html = '';
    lines.forEach(line => {
      if (line.includes(':')) {
        const [speaker, text] = line.split(/:(.+)/);
        html += `<div class="transcript-line"><span class="speaker-tag">${speaker}:</span> ${text}</div>`;
      } else {
        html += `<div class="transcript-line">${line}</div>`;
      }
    });
    transcriptBox.innerHTML = html;
  }

  const decCard = document.getElementById('extracted-decisions');
  const taskCard = document.getElementById('extracted-tasks');
  const riskCard = document.getElementById('extracted-risks');

  if (decCard) {
    let decHtml = '';
    (meeting.decisions || []).forEach(d => {
      decHtml += `
        <div style="background: var(--bg-tertiary); padding: 10px; border-radius: 8px; margin-bottom: 8px;">
          <div style="font-weight: 700; color: #10B981; font-size: 13px;">${d.chosenOption}</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${d.rationale}</div>
        </div>
      `;
    });
    decCard.innerHTML = decHtml || '<div style="color: var(--text-faint); font-size: 12px;">No major decisions recorded.</div>';
  }

  if (taskCard) {
    let taskHtml = '';
    (meeting.tasks || []).forEach(t => {
      taskHtml += `
        <div style="background: var(--bg-tertiary); padding: 10px; border-radius: 8px; margin-bottom: 8px;">
          <div style="font-weight: 700; color: #06B6D4; font-size: 13px;">${t.title}</div>
          <div style="font-size: 12px; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 4px;">
            <span>Owner: <strong>${t.owner}</strong></span>
            <span>Due: <strong>${t.deadline}</strong></span>
          </div>
        </div>
      `;
    });
    taskCard.innerHTML = taskHtml || '<div style="color: var(--text-faint); font-size: 12px;">No explicit action items.</div>';
  }

  if (riskCard) {
    let riskHtml = '';
    (meeting.risks || []).forEach(r => {
      riskHtml += `
        <div style="background: var(--bg-tertiary); padding: 10px; border-radius: 8px; margin-bottom: 8px;">
          <div style="font-weight: 700; color: #F43F5E; font-size: 13px;">⚠️ ${r.title}</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Impact: ${r.impactChain}</div>
        </div>
      `;
    });
    riskCard.innerHTML = riskHtml || '<div style="color: var(--text-faint); font-size: 12px;">No elevated risks.</div>';
  }
}

function renderDecisionTab() {
  if (!state || !state.meetings) return;
  const allDecisions = [];
  state.meetings.forEach(m => {
    (m.decisions || []).forEach(d => allDecisions.push(d));
  });
  window.GraphVisualizer.renderDecisionTree('decision-tree-container', allDecisions);
  
  if (window.DecisionTradeoffRadar) {
    const radar = new window.DecisionTradeoffRadar('decision-tree-container');
    radar.render();
  }
}

function renderTaskTab() {
  if (!state || !state.meetings) return;
  const allTasks = [];
  state.meetings.forEach(m => {
    (m.tasks || []).forEach(t => allTasks.push(t));
  });
  window.GraphVisualizer.renderTaskDAG('task-dag-container', allTasks);
}

function renderKnowledgeGraphTab() {
  const nodes = [
    { id: 'proj-v2', label: 'Project V2', type: 'Project' },
    { id: 'sarah', label: 'Sarah (Lead Architect)', type: 'Person' },
    { id: 'arun', label: 'Arun (Backend Lead)', type: 'Person' },
    { id: 'elena', label: 'Elena (Product Director)', type: 'Person' },
    { id: 'dev', label: 'Dev (QA Lead)', type: 'Person' },
    { id: 'marcus', label: 'Marcus (DevOps)', type: 'Person' },
    { id: 'tech-postgres', label: 'PostgreSQL', type: 'Technology' },
    { id: 'tech-redis', label: 'Redis Queue', type: 'Technology' },
    { id: 'dec-aug28', label: 'Aug 28 Launch Target', type: 'Decision' },
    { id: 'task-api', label: 'API Endpoints', type: 'Task' },
    { id: 'task-qa', label: '48h QA Benchmark', type: 'Task' },
    { id: 'risk-webhook', label: 'Webhook Throttling', type: 'Risk' }
  ];

  const edges = [
    { source: 'sarah', target: 'proj-v2', type: 'ARCHITECT' },
    { source: 'arun', target: 'task-api', type: 'OWNS' },
    { source: 'sarah', target: 'tech-postgres', type: 'SELECTED' },
    { source: 'tech-postgres', target: 'proj-v2', type: 'STORAGE' },
    { source: 'elena', target: 'dec-aug28', type: 'DECIDED' },
    { source: 'task-api', target: 'task-qa', type: 'BLOCKS' },
    { source: 'dev', target: 'task-qa', type: 'VERIFIES' },
    { source: 'sarah', target: 'tech-redis', type: 'BUILT' },
    { source: 'tech-redis', target: 'risk-webhook', type: 'MITIGATES' },
    { source: 'risk-webhook', target: 'task-api', type: 'THREATENS' }
  ];

  window.GraphVisualizer.renderKnowledgeGraph('knowledge-graph-container', { nodes, edges }, (node) => {
    alert(`Entity: ${node.label} (${node.type})\nConnected into organizational memory.`);
  });
}

function renderRisksAndContradictions() {
  const contraContainer = document.getElementById('contradiction-list-container');
  if (contraContainer && state && state.contradictions) {
    let html = '';
    state.contradictions.forEach(c => {
      html += `
        <div class="glass-card" style="border-left: 4px solid var(--accent-amber); margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="font-size: 15px; font-weight: 700; color: #FFFFFF;">🚨 ${c.title}</div>
            <span class="tag tag-amber">${c.status}</span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; font-size: 13px;">
            <div style="background: var(--bg-tertiary); padding: 12px; border-radius: var(--radius-md);">
              <div style="font-size: 11px; color: var(--accent-cyan); font-weight: 700;">Claim A</div>
              <div style="margin-top: 4px; color: #E2E8F0;">${c.statementA}</div>
            </div>
            <div style="background: var(--bg-tertiary); padding: 12px; border-radius: var(--radius-md);">
              <div style="font-size: 11px; color: var(--accent-rose); font-weight: 700;">Claim B</div>
              <div style="margin-top: 4px; color: #E2E8F0;">${c.statementB}</div>
            </div>
          </div>

          <div style="font-size: 13px; color: var(--accent-emerald); background: rgba(16, 185, 129, 0.1); padding: 10px; border-radius: var(--radius-sm);">
            <strong>Resolution:</strong> ${c.resolution}
          </div>
        </div>
      `;
    });
    contraContainer.innerHTML = html;
  }
}

function renderAutomations() {
  const autoContainer = document.getElementById('automations-container');
  if (!autoContainer) return;

  const mockAutomations = [
    { title: 'Create Jira Ticket: Complete Core API Integration Endpoints', assignee: 'Arun', icon: 'icon-jira', target: 'Jira Cloud (PROJ-V2)', status: 'DISPATCHED' },
    { title: 'Schedule Google Calendar: Project V2 Launch Milestone (Aug 28 5:00 PM)', assignee: 'Elena', icon: 'icon-cal', target: 'Google Calendar', status: 'CONFIRMED' },
    { title: 'Slack Notification to #proj-v2-dev: QA Handover Window Locked', assignee: 'Dev & Arun', icon: 'icon-slack', target: 'Slack Channel', status: 'TRIGGERED' }
  ];

  let html = '';
  mockAutomations.forEach(a => {
    html += `
      <div class="automation-item">
        <div class="auto-info">
          <div class="auto-icon ${a.icon}">⚡</div>
          <div>
            <div style="font-size: 14px; font-weight: 700; color: #FFFFFF;">${a.title}</div>
            <div style="font-size: 12px; color: var(--text-muted);">Target: <strong>${a.target}</strong> | Assignee: <strong>${a.assignee}</strong></div>
          </div>
        </div>
        <span class="tag tag-emerald">${a.status}</span>
      </div>
    `;
  });
  autoContainer.innerHTML = html;
}

// "Why Did We Decide This?" AI Query Handler
async function handleWhyQuery(customQuestion) {
  const inputEl = document.getElementById('why-query-input');
  const question = customQuestion || (inputEl ? inputEl.value : '');
  if (!question) return;

  if (inputEl) inputEl.value = question;

  const answerContainer = document.getElementById('why-answer-container');
  if (answerContainer) {
    answerContainer.style.display = 'block';
    answerContainer.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--accent-cyan);">🧠 Tracing organizational knowledge graph across meetings...</div>`;
  }

  try {
    const res = await fetch('/api/query/why', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });

    if (res.ok) {
      const data = await res.json();
      renderAnswer(data);
      return;
    }
  } catch (err) {}

  // Fallback client-side resolver
  resolveQueryInBrowser(question);
}

function resolveQueryInBrowser(question) {
  const q = question.toLowerCase();
  let data = {};

  if (q.includes('postgres') || q.includes('database') || q.includes('db') || q.includes('mongo')) {
    data = {
      headline: "PostgreSQL was chosen for strict ACID transactions and existing team depth.",
      details: {
        decision: "Adopt PostgreSQL as Primary Database for Project V2",
        meeting: "Architecture & Database Selection Review (2026-07-18)",
        rationale: "Project V2 requires strict ACID transaction compliance for multi-tenant billing engine, and the engineering team possesses 5+ years of operational experience with it. JSONB indexing provides document-like flexibility.",
        alternatives: ["MongoDB", "MySQL"],
        decisionMakers: "Architecture Review Board (Sarah, Elena)",
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
    data = {
      headline: "Launch locked for Friday, August 28th to synchronize with Q3 customer renewal milestones.",
      details: {
        decision: "Project V2 Launch Milestone Scheduled for August 28",
        meeting: "V2 Sprint Planning & Launch Milestones (2026-08-10)",
        rationale: "Direct alignment with high-value customer renewal cycles and executive Q3 demonstration board commitments.",
        alternatives: ["September 10 (Too late for renewals)", "August 21 (Rejected in Meeting 3 due to insufficient QA buffer)"],
        decisionMakers: "Elena (Product Director)",
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
    data = {
      headline: "API delay was caused by third-party webhook rate-limiting; unblocked by pairing Sarah with Arun.",
      details: {
        decision: "Pair Architecture Lead (Sarah) with Backend Lead (Arun)",
        meeting: "Emergency Readiness Alignment (2026-08-23)",
        rationale: "Guarantees Wednesday 2 PM build delivery to QA, preserving the mandatory 48-hour testing window before Friday launch.",
        alternatives: ["Postpone release to Sep 4", "Ship without webhook support"],
        decisionMakers: "Elena (Product Director) & Sarah (Lead Architect)",
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

  renderAnswer(data);
}

function renderAnswer(data) {
  const container = document.getElementById('why-answer-container');
  if (!container) return;

  const d = data.details || {};
  let breadcrumbHtml = '';
  (data.graphBreadcrumbs || []).forEach((b, idx) => {
    breadcrumbHtml += `
      <span class="crumb">
        <strong style="color: var(--accent-cyan);">${b.type}:</strong> ${b.label}
      </span>
      ${idx < data.graphBreadcrumbs.length - 1 ? '<span class="crumb-arrow">➔</span>' : ''}
    `;
  });

  container.innerHTML = `
    <div class="answer-card">
      <div class="breadcrumbs">${breadcrumbHtml}</div>
      <div class="answer-headline">${data.headline}</div>

      <div style="background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius-md); margin-bottom: 16px; border-left: 4px solid var(--accent-cyan);">
        <div class="meta-label">Core Rationale</div>
        <div style="font-size: 14px; color: #F1F5F9; line-height: 1.6;">${d.rationale}</div>
      </div>

      <div class="answer-grid">
        <div class="answer-meta-box">
          <div class="meta-label">Decision & Origin</div>
          <div style="font-weight: 700; color: #FFFFFF; margin-bottom: 4px;">${d.decision || d.chosenOption}</div>
          <div style="color: var(--accent-purple); font-size: 12px;">📍 ${d.meeting}</div>
        </div>

        <div class="answer-meta-box">
          <div class="meta-label">Alternatives Considered</div>
          <div style="color: var(--accent-amber); font-weight: 600;">${d.alternatives ? d.alternatives.join(', ') : 'None'}</div>
        </div>

        <div class="answer-meta-box">
          <div class="meta-label">Decision Makers</div>
          <div style="color: #FFFFFF; font-weight: 600;">${d.decisionMakers}</div>
        </div>
      </div>

      ${d.evidenceQuote ? `
        <div style="margin-top: 16px; font-style: italic; font-size: 13px; color: var(--text-muted); background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;">
          💬 <strong>Transcript Evidence:</strong> "${d.evidenceQuote}"
        </div>
      ` : ''}
    </div>
  `;
}

function startAudioSimulation() {
  const canvas = document.getElementById('audio-waveform-canvas');
  if (!canvas) return;
  canvas.style.display = 'block';

  if (!visualizerInstance) {
    visualizerInstance = new window.AudioWaveformVisualizer('audio-waveform-canvas');
  }

  visualizerInstance.startSimulation((phrase) => {
    const liveBox = document.getElementById('live-transcript-box');
    if (liveBox) {
      liveBox.innerHTML += `<div class="transcript-line" style="color: #38BDF8; font-weight: 600;">⚡ [Live Stream] ${phrase}</div>`;
      liveBox.scrollTop = liveBox.scrollHeight;
    }
  });
}

function stopAudioSimulation() {
  if (visualizerInstance) {
    visualizerInstance.stopSimulation();
  }
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  const activeBtn = document.querySelector(`[data-tab="${tabId}"]`);
  const activeContent = document.getElementById(tabId);

  if (activeBtn) activeBtn.classList.add('active');
  if (activeContent) activeContent.classList.add('active');

  if (tabId === 'tab-knowledge') {
    setTimeout(renderKnowledgeGraphTab, 100);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchState();
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });
});
