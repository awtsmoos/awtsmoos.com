// B"H
const { nowIso, clone } = require("./state");
function addWorkNode(mission, node = {}) {
  const next = clone(mission); const stamp = nowIso(); const id = node.id || `node_${next.workGraph.length + 1}`;
  next.workGraph.push({ id, title: node.title || "Untitled work", purpose: node.purpose || "Reveal and verify mission work", status: node.status || "discovered", dependsOn: node.dependsOn || [], risks: node.risks || [], verification: node.verification || [], evidenceRefs: node.evidenceRefs || [], createdAt: node.createdAt || stamp, updatedAt: node.updatedAt || stamp });
  next.updatedAt = stamp; return next;
}
function setNodeStatus(mission, id, status, evidenceRefs = []) {
  const next = clone(mission); const node = next.workGraph.find(item => item.id === id);
  if (node) { node.status = status; node.evidenceRefs = Array.from(new Set([...(node.evidenceRefs || []), ...evidenceRefs])); node.updatedAt = nowIso(); }
  next.updatedAt = nowIso(); return next;
}
function activeNodes(mission) { return (mission.workGraph || []).filter(n => !["complete", "blocked", "superseded"].includes(n.status)); }
module.exports = { addWorkNode, setNodeStatus, activeNodes };
