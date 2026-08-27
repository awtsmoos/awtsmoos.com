//B"H
import { nodeEditor, nodeOptions, createGraphNode } from "./graphNodeUi.js";

/**
 * Chapter 113: The Graph Became A Small Table Instead Of A Storm.
 *
 * The advanced nodes still exist, but the first view now teaches one simple
 * truth: automation usually means choosing the next prompt. The studio offers a
 * calm recipe, clear drag/drop instructions, and then the node list for people
 * who want to go deeper.
 */
export function renderGraphFields(graph = {}) {
  const nodes = graph.nodes || [];
  return `<section class="automation-graph-panel">
    <h2>Simple Automation Graph</h2>
    <div class="graph-help-card">
      <b>Simple mode:</b> put prompts in the Automation tab. Choose “cycle” or “random.”
      <ol>
        <li>Turn automation on for this chat only.</li>
        <li>Pick one prompt, cycle prompts, or random prompts.</li>
        <li>Advanced graph nodes below can change the prompt after each answer.</li>
      </ol>
      <p>Drag later: cards are ordered top to bottom. For now use “Next node” fields to connect them.</p>
    </div>
    <div class="graph-toolbar">
      ${button("add-send", "+ Send Prompt")}${button("add-delay", "+ Wait")}${button("add-condition", "+ If Text")}${button("add-stop", "+ Stop")}
      ${button("load-example", "Load simple example")}${button("reset", "Reset")}${button("save-forms", "Save")}${button("download-json", "Download JSON")}
    </div>
    <label class="automation-field graph-start-field">Start node <select data-graph-start>${nodeOptions(nodes, graph.start)}</select></label>
    <div class="graph-mini-map">${nodes.map(node => `<span class="mini-node mini-${safe(node.type)}">${escapeText(node.id)}</span>`).join("")}</div>
    <div class="graph-canvas" data-graph-dropzone="nodes">${nodes.map((node, index) => nodeEditor(node, index, nodes)).join("")}</div>
    <details class="graph-json-details"><summary>Advanced JSON editor</summary><label class="automation-field graph-json-field">Graph JSON<textarea data-graph-json rows="14">${escapeText(JSON.stringify(graph, null, 2))}</textarea></label><button type="button" data-graph-action="save-json">Save JSON</button></details>
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
