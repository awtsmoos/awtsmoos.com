//B"H
import { cloneDefaultAutomationGraph } from "./graphDefaults.js";

const KEY = "BH_awtsmoos_ai_automation_graph_v1";

/**
 * Stores the visual automation graph as JSON.
 */
export class AutomationGraphStore {
  constructor(storage = localStorage) { this.storage = storage; }

  load() {
    try { return normalizeGraph(JSON.parse(this.storage.getItem(KEY) || "null") || cloneDefaultAutomationGraph()); }
    catch { return cloneDefaultAutomationGraph(); }
  }

  save(graph) {
    const next = normalizeGraph(graph);
    this.storage.setItem(KEY, JSON.stringify(next));
    return next;
  }

  reset() { return this.save(cloneDefaultAutomationGraph()); }
}

export function normalizeGraph(graph = {}) {
  const fallback = cloneDefaultAutomationGraph();
  const nodes = Array.isArray(graph.nodes) && graph.nodes.length ? graph.nodes.map(normalizeNode) : fallback.nodes;
  const start = graph.start && nodes.some(node => node.id === graph.start) ? graph.start : nodes[0]?.id || fallback.start;
  return { version: Number(graph.version || 2), name: String(graph.name || "Awtsmoos Automation Studio"), start, nodes };
}

function normalizeNode(node = {}, index = 0) {
  const id = String(node.id || `node-${index + 1}`).trim().replace(/\s+/g, "-");
  const type = ["session", "send", "condition", "memory", "compile", "stop", "archive", "delay", "jump"].includes(node.type) ? node.type : "send";
  return {
    id,
    type,
    label: String(node.label || id),
    match: String(node.match || ""),
    negate: Boolean(node.negate),
    regex: Boolean(node.regex),
    flags: String(node.flags || "i"),
    delayMs: Math.max(0, Number(node.delayMs || 0)),
    maxTurns: Math.max(0, Number(node.maxTurns || 0)),
    archiveQuery: String(node.archiveQuery || ""),
    role: String(node.role || ""),
    model: String(node.model || "auto"),
    inputKeys: String(node.inputKeys || ""),
    outputKey: String(node.outputKey || ""),
    prompt: String(node.prompt || ""),
    instructions: String(node.instructions || ""),
    compileTemplate: String(node.compileTemplate || ""),
    archiveTag: String(node.archiveTag || ""),
    onTrue: String(node.onTrue || ""),
    onFalse: String(node.onFalse || ""),
    next: String(node.next || "")
  };
}

export const automationGraphStore = new AutomationGraphStore();
