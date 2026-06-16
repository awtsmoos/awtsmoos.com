// B"H

/**
 * B"H
 * Chapter: The tree became visible as branches of action-light.
 */
function mermaid(tree = {}) {
  const lines = ["flowchart TD"];
  for (const node of tree.nodes || []) {
    const id = safeId(node.id);
    const label = `${node.id}\\n${node.action || node.type || "note"}\\n${node.status || "planned"}`;
    lines.push(`  ${id}["${escapeLabel(label)}"]`);
    if (node.parentId) lines.push(`  ${safeId(node.parentId)} --> ${id}`);
  }
  return lines.join("\n");
}

function html(tree = {}) {
  const cards = (tree.nodes || []).map(node => `<article class="${node.status || "planned"}"><span>${esc(node.status || "planned")}</span><h2>${esc(node.id)}</h2><p>${esc(node.action || node.type || "note")}</p><dl><dt>Estimate</dt><dd>${esc(node.estimatedPerutas || 0)} perutas</dd><dt>Decision</dt><dd>${esc(node.budgetDecision || "")}</dd><dt>Output</dt><dd>${esc(node.outputRef || node.resultRef || "")}</dd></dl></article>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(tree.title || "Awtsmoos Command Tree")}</title>${style()}</head><body><main><header><p>B\"H · CommandTree</p><h1>${esc(tree.title || tree.treeId || "Awtsmoos Command Tree")}</h1><p>${esc(tree.goal || "")}</p></header><section>${cards}</section><pre>${esc(mermaid(tree))}</pre></main></body></html>`;
}

function safeId(value) { return String(value || "node").replace(/[^a-zA-Z0-9_]/g, "_"); }
function escapeLabel(value) { return String(value || "").replace(/"/g, "'"); }
function esc(value) { return String(value ?? "").replace(/[&<>\"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[ch])); }
function style() { return `<style>body{margin:0;background:#06101f;color:#edf7ff;font-family:Inter,system-ui,sans-serif}main{max-width:1180px;margin:auto;padding:28px}header{border:1px solid #6ce8ff55;border-radius:28px;padding:28px;background:radial-gradient(circle at top right,#244d7e,transparent 42%),linear-gradient(135deg,#07182f,#141d3b)}h1{font-size:clamp(2rem,7vw,5rem);line-height:.9;letter-spacing:-.06em}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;margin-top:18px}article{border:1px solid #ffffff18;border-radius:22px;padding:16px;background:#ffffff0b}article.ok{border-color:#69ffb455}article.skipped{border-color:#ffe06a55}article.failed{border-color:#ff788855}span{display:inline-block;border-radius:999px;padding:5px 9px;background:#72e9ff1c;color:#8cecff;font-weight:900}pre{white-space:pre-wrap;overflow:auto;margin-top:18px;border:1px solid #ffffff18;border-radius:22px;padding:16px;color:#ffe08a;background:#0005}</style>`; }

module.exports = { html, mermaid };
