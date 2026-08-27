//B"H

export const NODE_TYPES = ["session", "send", "condition", "memory", "compile", "archive", "delay", "jump", "stop"];

export function createGraphNode(type, index) {
  const id = `${type}-${index + 1}`;
  return {
    id, type, label: `${type} ${index + 1}`, role: defaultRole(type), model: "auto",
    match: "", negate: false, regex: false, flags: "i", delayMs: type === "delay" ? 1000 : 0,
    maxTurns: 0, inputKeys: "lastReply", outputKey: type === "session" ? id : "",
    archiveQuery: "", archiveTag: type === "archive" || type === "send" || type === "session" ? "graph" : "",
    prompt: defaultPrompt(type), instructions: defaultInstructions(type), compileTemplate: "{{lastReply}}",
    onTrue: "", onFalse: "", next: ""
  };
}

export function nodeEditor(node, index, list = []) {
  return `<article class="graph-node graph-node-${attr(node.type)}" data-graph-node>
    <div class="graph-node-head"><strong>${text(node.label || node.id)}</strong><span>${text(node.type)}</span><button type="button" data-graph-action="delete:${attr(node.id)}">×</button></div>
    <div class="graph-node-grid">
      ${nodeInput("id", "ID", node.id)}${nodeSelect("type", "Type", node.type, NODE_TYPES)}${nodeInput("label", "Label", node.label)}
      ${nodeInput("role", "Worker role", node.role || "")}${nodeInput("model", "Model", node.model || "auto")}${nodeInput("outputKey", "Save output as", node.outputKey || "")}
      ${nodeInput("inputKeys", "Inputs / memory keys", node.inputKeys || "")}${nodeInput("archiveTag", "Archive tag", node.archiveTag)}${nodeInput("archiveQuery", "Archive query/ref", node.archiveQuery || "")}
      ${nodeInput("match", node.regex ? "Regex" : "Contains text", node.match)}${nodeCheckbox("regex", "Use regex", node.regex)}${nodeInput("flags", "Regex flags", node.flags || "i")}
      ${nodeInput("delayMs", "Delay ms", node.delayMs || 0)}${nodeInput("maxTurns", "Max turns at node", node.maxTurns || 0)}${nodeCheckbox("negate", "Negate condition", node.negate)}
      ${nodeSelect("onTrue", "On true", node.onTrue, ["", ...list.map(n => n.id)])}${nodeSelect("onFalse", "On false", node.onFalse, ["", ...list.map(n => n.id)])}${nodeSelect("next", "Next", node.next, ["", ...list.map(n => n.id)])}
    </div>
    <label class="automation-field graph-node-prompt">Prompt<textarea data-node-field="prompt" rows="4">${text(node.prompt || "")}</textarea></label>
    <label class="automation-field graph-node-prompt">Instructions<textarea data-node-field="instructions" rows="3">${text(node.instructions || "")}</textarea></label>
    <label class="automation-field graph-node-prompt">Compile template<textarea data-node-field="compileTemplate" rows="3">${text(node.compileTemplate || "")}</textarea></label>
    <p>${text(describeNode(node))}</p>
  </article>`;
}

export function nodeOptions(nodes = [], selected = "") {
  return nodes.map(node => `<option value="${attr(node.id)}" ${node.id === selected ? "selected" : ""}>${text(node.label || node.id)}</option>`).join("");
}

function defaultRole(type) { return type === "session" ? "specialized worker" : ""; }
function defaultPrompt(type) { return type === "session" || type === "send" ? "{{settings.prompt}}" : ""; }
function defaultInstructions(type) { return type === "session" ? "Act as one focused specialist in a larger Awtsmoos production pipeline." : ""; }
function describeNode(node) {
  if (node.type === "session") return `${node.role || "worker"} → saves ${node.outputKey || "reply"}`;
  if (node.type === "compile") return `compile template then ${node.next || "stop"}`;
  if (node.type === "memory") return `load memory ${node.inputKeys || node.archiveQuery || ""}`;
  if (node.type === "condition") return `${node.negate ? "unless" : "if"} last message ${node.regex ? "matches" : "contains"} "${node.match}" → ${node.onTrue || "?"} / ${node.onFalse || "?"}`;
  if (node.type === "send") return `send: ${node.prompt || "settings prompt"}`;
  if (node.type === "archive") return `archive as ${node.archiveTag || node.id} then ${node.next || "stop"}`;
  if (node.type === "delay") return `wait ${node.delayMs || 0}ms then ${node.next || "stop"}`;
  if (node.type === "jump") return `jump to ${node.next || "stop"}`;
  return "stop";
}
function nodeInput(name, labelText, value = "") { return `<label class="automation-field">${labelText}<input data-node-field="${name}" value="${attr(value)}"></label>`; }
function nodeCheckbox(name, labelText, value = false) { return `<label class="automation-field graph-toggle"><input data-node-field="${name}" type="checkbox" ${value ? "checked" : ""}> ${labelText}</label>`; }
function nodeSelect(name, labelText, value, values) { return `<label class="automation-field">${labelText}<select data-node-field="${name}">${values.map(item => `<option value="${attr(item)}" ${item === value ? "selected" : ""}>${text(item || "—")}</option>`).join("")}</select></label>`; }
function attr(value) { return String(value ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function text(value) { return String(value ?? "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
