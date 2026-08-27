//B"H
const MAX_STEPS = 60;

/** Evaluates the orchestration graph into the next concrete automation action. */
export function evaluateAutomationGraph(graph = {}, context = {}) {
  const nodes = new Map((graph.nodes || []).map(node => [node.id, node]));
  const memory = { ...(context.memory || {}), lastReply: context.lastReply || "" };
  let node = nodes.get(graph.start) || graph.nodes?.[0];
  const visited = new Set();
  for (let step = 0; step < MAX_STEPS && node; step++) {
    if (visited.has(node.id)) return stop(`graph loop detected at ${node.id}`, node);
    visited.add(node.id);
    if (node.type === "stop") return stop(node.label || "graph stopped", node);
    if (Number(node.maxTurns || 0) > 0 && Number(context.turn || 0) > Number(node.maxTurns)) return stop(`node ${node.id} maxTurns reached`, node);
    if (node.type === "condition") { node = nodes.get(conditionMatches(node, context) ? node.onTrue : node.onFalse); continue; }
    if (["delay", "jump", "memory", "archive"].includes(node.type)) { node = nodes.get(node.next); continue; }
    if (node.type === "compile") return compileDecision(node, context, memory);
    if (node.type === "send" || node.type === "session") return sendDecision(node, context, memory);
    return stop(`unknown node type ${node.type}`, node);
  }
  return stop("graph ended without send node");
}

function sendDecision(node, context, memory) {
  return {
    stop: false,
    prompt: template(node.prompt || context.settings?.prompt || "continue", context, memory),
    instructions: template(node.instructions || "", context, memory),
    role: node.role || "",
    model: node.model || "auto",
    archiveTag: node.archiveTag || "",
    delayMs: Number(node.delayMs || 0),
    archiveQuery: node.archiveQuery || "",
    outputKey: node.outputKey || "lastReply",
    next: node.next || "",
    nodeId: node.id,
    nodeType: node.type
  };
}

function compileDecision(node, context, memory) {
  return {
    stop: false,
    prompt: template(node.compileTemplate || node.prompt || "{{lastReply}}", context, memory),
    archiveTag: node.archiveTag || "compiled",
    outputKey: node.outputKey || node.id,
    next: node.next || "",
    nodeId: node.id,
    nodeType: "compile"
  };
}

function conditionMatches(node = {}, context = {}) {
  const needle = String(node.match || "");
  const haystack = String(context.lastReply || "");
  let base = true;
  if (needle && node.regex) { try { base = new RegExp(needle, node.flags || "i").test(haystack); } catch { base = false; } }
  else if (needle) base = haystack.toLowerCase().includes(needle.toLowerCase());
  return node.negate ? !base : base;
}

function template(text = "", context = {}, memory = {}) {
  const values = { "settings.prompt": context.settings?.prompt || "continue", lastReply: context.lastReply || "", conversationId: context.conversationId || "", turn: String(context.turn || "") };
  return String(text).replace(/{{\s*([^}]+?)\s*}}/g, (_, key) => {
    if (key.startsWith("memory.")) return memory[key.slice(7)] ?? "";
    return values[key] ?? "";
  });
}
function stop(reason, node = {}) { return { stop: true, reason, nodeId: node.id || null }; }
