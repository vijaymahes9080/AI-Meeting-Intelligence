/**
 * Interactive Graph Visualizers (D3.js Force Simulation & Hierarchical DAGs)
 */

class GraphVisualizer {
  constructor() {
    this.simulation = null;
    this.svg = null;
    this.g = null;
  }

  renderKnowledgeGraph(containerId, graphData, onNodeClick) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const svg = d3.select(`#${containerId}`)
      .append('svg')
      .attr('id', 'knowledge-graph-svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Zoom setup
    const g = svg.append('g');
    svg.call(d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => g.attr('transform', event.transform)));

    this.svg = svg;
    this.g = g;

    // Color mapper for node types
    const colorMap = {
      'Project': '#6366F1',
      'Person': '#06B6D4',
      'Decision': '#10B981',
      'Task': '#F59E0B',
      'Risk': '#F43F5E',
      'Technology': '#8B5CF6',
      'Meeting': '#EC4899'
    };

    const nodes = graphData.nodes.map(d => ({ ...d }));
    const edges = graphData.edges.map(d => ({ ...d }));

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id(d => d.id).distance(90))
      .force('charge', d3.forceManyBody().strength(-240))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(32));

    this.simulation = simulation;

    // Arrow markers
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(255,255,255,0.3)');

    // Edges
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(edges)
      .enter().append('line')
      .attr('stroke', 'rgba(255, 255, 255, 0.15)')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrow)');

    // Edge labels
    const edgeLabels = g.append('g')
      .attr('class', 'edge-labels')
      .selectAll('text')
      .data(edges)
      .enter().append('text')
      .attr('font-size', '9px')
      .attr('fill', '#64748B')
      .attr('text-anchor', 'middle')
      .text(d => d.type);

    // Nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }))
      .on('click', (event, d) => {
        if (onNodeClick) onNodeClick(d);
      });

    // Node circles with glow
    node.append('circle')
      .attr('r', d => d.type === 'Project' ? 22 : 16)
      .attr('fill', d => colorMap[d.type] || '#94A3B8')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 1.5)
      .attr('filter', 'drop-shadow(0 0 8px rgba(255,255,255,0.2))');

    // Node text labels
    node.append('text')
      .attr('dy', 28)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#F8FAFC')
      .text(d => d.label.length > 18 ? d.label.slice(0, 16) + '...' : d.label);

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      edgeLabels
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
  }

  renderDecisionTree(containerId, decisions) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = `<div style="display: flex; flex-direction: column; gap: 20px;">`;
    decisions.forEach((d, idx) => {
      html += `
        <div class="glass-card" style="border-left: 4px solid var(--accent-emerald);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <div>
              <span class="tag tag-emerald" style="margin-bottom: 6px; display: inline-block;">Decision #${idx + 1}</span>
              <h3 style="font-size: 16px; font-weight: 700; color: #FFFFFF;">${d.title}</h3>
            </div>
            <span class="tag tag-purple">Origin: ${d.meetingId}</span>
          </div>
          
          <div style="background: var(--bg-tertiary); padding: 14px; border-radius: var(--radius-md); margin-bottom: 12px;">
            <div style="font-size: 11px; text-transform: uppercase; color: var(--accent-cyan); font-weight: 700;">Chosen Option & Rationale</div>
            <div style="font-weight: 600; color: #F8FAFC; margin-top: 2px;">${d.chosenOption}</div>
            <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">${d.rationale}</div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; font-size: 12px;">
            <div>
              <span style="color: var(--text-faint);">Alternatives Evaluated:</span>
              <div style="font-weight: 600; color: var(--accent-amber);">${d.alternatives ? d.alternatives.join(', ') : 'None'}</div>
            </div>
            <div>
              <span style="color: var(--text-faint);">Decision Maker:</span>
              <div style="font-weight: 600; color: var(--text-main);">${d.decisionMaker}</div>
            </div>
            <div>
              <span style="color: var(--text-faint);">Downstream Impact:</span>
              <div style="font-weight: 600; color: var(--accent-rose);">${d.consequences ? d.consequences[0] : 'Normal execution'}</div>
            </div>
          </div>
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  }

  renderTaskDAG(containerId, tasks) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = `<div style="display: flex; flex-direction: column; gap: 16px;">`;
    tasks.forEach(t => {
      const priorityClass = t.priority === 'CRITICAL' ? 'tag-rose' : t.priority === 'HIGH' ? 'tag-amber' : 'tag-cyan';
      const statusColor = t.status === 'COMPLETED' ? '#10B981' : t.status === 'BLOCKED' ? '#F43F5E' : '#06B6D4';
      
      html += `
        <div class="glass-card" style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background: ${statusColor}; box-shadow: 0 0 10px ${statusColor};"></div>
            <div>
              <div style="font-size: 15px; font-weight: 700; color: #FFFFFF;">${t.title}</div>
              <div style="font-size: 12px; color: var(--text-muted); display: flex; gap: 12px; margin-top: 4px;">
                <span>👤 Owner: <strong>${t.owner}</strong></span>
                <span>📅 Deadline: <strong>${t.deadline}</strong></span>
                ${t.dependsOn && t.dependsOn.length ? `<span style="color: var(--accent-amber);">⛓️ Depends on: ${t.dependsOn.join(', ')}</span>` : ''}
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="tag ${priorityClass}">${t.priority}</span>
            <span class="tag" style="background: rgba(255,255,255,0.06);">${t.status}</span>
          </div>
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  }
}

window.GraphVisualizer = new GraphVisualizer();
