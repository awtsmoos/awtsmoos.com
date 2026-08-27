// B"H
const { esc } = require("./Shell.js");

/** B"H: A tiny SVG constellation so the treasury is seen as a living graph. */
function graphPanel(graph = {}) {
  const nodes = normalizeNodes(graph.nodes);
  const edges = Array.isArray(graph.edges) ? graph.edges : [];
  return `<section class="awt-card awt-graph-card"><h2>Interactive Treasury Graph</h2><p>${esc(nodes.length)} nodes · ${esc(edges.length)} edges</p>${svg(nodes, edges)}${legend(nodes)}</section>`;
}
function normalizeNodes(nodes = []) {
  const fallback = ["balance", "budgets", "market", "agents", "providers", "reputation"];
  const src = Array.isArray(nodes) && nodes.length ? nodes : fallback.map(id => ({ id }));
  return src.slice(0, 12).map((node, index) => ({ id: String(node.id || node.name || `node_${index}`), label: String(node.label || node.id || node.name || `node ${index}`), index }));
}
function point(index, total) {
  const angle = (Math.PI * 2 * index) / Math.max(1, total) - Math.PI / 2;
  return { x: 180 + Math.cos(angle) * 125, y: 160 + Math.sin(angle) * 105 };
}
function svg(nodes, edges) {
  const pts = new Map(nodes.map((n, i) => [n.id, point(i, nodes.length)]));
  return `<svg class="awt-graph" viewBox="0 0 360 320" role="img" aria-label="Treasury graph">${edgeLines(edges, pts)}${nodes.map(n => nodeCircle(n, pts.get(n.id))).join("")}</svg>`;
}
function edgeLines(edges, pts) {
  return edges.map(edge => {
    const from = pts.get(String(edge.from || edge.source));
    const to = pts.get(String(edge.to || edge.target));
    if (!from || !to) return "";
    return `<line class="awt-edge" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"></line>`;
  }).join("");
}
function nodeCircle(node, p) {
  return `<a href="#${esc(node.id)}"><circle class="awt-node" cx="${p.x}" cy="${p.y}" r="23"></circle><text x="${p.x}" y="${p.y + 4}" text-anchor="middle">${esc(node.label.slice(0, 7))}</text></a>`;
}
function legend(nodes) {
  return `<div class="awt-graph-legend">${nodes.map(n => `<span id="${esc(n.id)}">${esc(n.label)}</span>`).join("")}</div>`;
}
module.exports = { graphPanel };
