/**
 * Decision Matrix & Tradeoff Radar Chart Visualizer
 * Plots multi-criteria comparative dimensions: Cost, Speed, Risk, Scalability, Team Fit
 */

class DecisionTradeoffRadar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(decisionData) {
    if (!this.container) return;

    const options = [
      { name: "PostgreSQL (Chosen)", cost: 85, speed: 90, risk: 20, scalability: 88, teamFit: 95, color: "#10B981" },
      { name: "MongoDB", cost: 70, speed: 80, risk: 65, scalability: 85, teamFit: 60, color: "#F59E0B" },
      { name: "MySQL", cost: 80, speed: 75, risk: 40, scalability: 75, teamFit: 70, color: "#06B6D4" }
    ];

    let html = `
      <div class="glass-card" style="margin-top: 16px;">
        <h3 style="font-size: 16px; font-weight: 700; color: #FFF; margin-bottom: 12px;">📊 Multi-Criteria Decision Tradeoff Matrix</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
    `;

    options.forEach(opt => {
      html += `
        <div style="background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius-md); border-top: 3px solid ${opt.color};">
          <div style="font-size: 14px; font-weight: 700; color: #FFF; margin-bottom: 8px;">${opt.name}</div>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between;">
              <span>Speed / Throughput:</span>
              <strong style="color: ${opt.color};">${opt.speed}%</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Team Competency:</span>
              <strong style="color: ${opt.color};">${opt.teamFit}%</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Scalability:</span>
              <strong style="color: ${opt.color};">${opt.scalability}%</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Execution Risk:</span>
              <strong style="color: ${opt.risk > 50 ? '#F43F5E' : '#10B981'};">${opt.risk}%</strong>
            </div>
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
    this.container.innerHTML = html;
  }
}

window.DecisionTradeoffRadar = DecisionTradeoffRadar;
