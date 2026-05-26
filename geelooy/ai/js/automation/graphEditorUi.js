//B"H
import { nodeEditor, nodeOptions, createGraphNode } from "./graphNodeUi.js";

/**
 * Blender-like automation graph panel shell.
 * The heavy node rendering lives in graphNodeUi.js so this file stays small.
 */
export function renderGraphFields(graph = {}) {
  const nodes = graph.nodes || [];
  return `<section class="automation-graph-panel">
    <h2>Automation Graph Studio</h2>
    <p class="panel-note">Build multi-worker orchestration as JSON: session workers, memory, compile, conditions, delays, jumps, archives, and stop gates.</p>
    <div class="graph-toolbar">
      ${button("add-session", "+ Session")}${button("add-send", "+ Send")}${button("add-condition", "+ Condition")}
      ${button("add-memory", "+ Memory")}${button("add-compile", "+ Compile")}${button("add-archive", "+ Archive")}
      ${button("add-delay", "+ Delay")}${button("add-jump", "+ Jump")}${button("add-stop", "+ Stop")}
      ${button("load-example", "Load Studio Example")}${button("reset", "Reset")}${button("save-forms", "Save Forms")}
      ${button("save-json", "Save JSON")}${button("download-json", "Download JSON")}
    </div>
    <label class="automation-field graph-start-field">Start node <select data-graph-start>${nodeOptions(nodes, graph.start)}</select></label>
    <div class="graph-mini-map">${nodes.map(node => `<span class="mini-node mini-${safe(node.type)}">${escapeText(node.id)}</span>`).join("")}</div>
    <div class="graph-canvas">${nodes.map((node, index) => nodeEditor(node, index, nodes)).join("")}</div>
    <label class="automation-field graph-json-field">Graph JSON<textarea data-graph-json rows="16">${escapeText(JSON.stringify(graph, null, 2))}</textarea></label>
    <div class="automation-status" id="graph-status">graph ready: ${nodes.length} node(s)</div>
  </section>`;
}

export function captureGraphFormsFromRoot(root, graph = {}) {
  const start = root.querySelector("[data-graph-start]")?.value || graph.start;
  const nodes = [...root.querySelectorAll("[data-graph-node]")].map(captureNode);
  return { version: 2, name: graph.name || "Awtsmoos Automation Studio", start, nodes };
}

export { createGraphNode };

function captureNode(card) {
  const node = {};
  card.querySelectorAll("[data-node-field]").forEach(input => {
    node[input.dataset.nodeField] = input.type === "checkbox" ? input.checked : input.value;
  });
  return node;
}
function button(action, label) { return `<button type="button" data-graph-action="${action}">${label}</button>`; }
function safe(value) { return String(value || "node").replace(/[^a-z0-9_-]/gi, "-"); }
function escapeText(value) { return String(value ?? "").replace(/[&<>]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;" }[c])); }
