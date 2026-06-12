// B"H

import { h } from "../../ui/core/html.js";
import { listRuntimes, getActiveRuntime } from "../runtimeRegistry.js";
import { syncRuntimeGraph, readRuntimeGraph } from "./runtimeGraph.js";
import { mountRuntimeDefaults, listRuntimeMounts } from "./runtimeMounts.js";
import { readRuntimeTimeline, createReplayPlan } from "./runtimeTimeline.js";
import { buildSemanticProjection } from "./semanticProjection.js";
import { buildBrowserProjection } from "./browserProjection.js";
import { measureRuntimeMeshHealth } from "./runtimeHealth.js";
import { listVirtualFiles, readVirtualFile } from "./virtualFilesystem.js";
import { routeIntent } from "./intentRouter.js";
import { createJsonReveal } from "./meshJsonToggle.js";
import { createRuntimeHealthCard } from "./meshHealthCard.js";

function card(title, children) {
  return h("article", { classes: ["panel", "stack", "awt-mesh-card"], children: [h("h3", { text: title }), ...children] });
}

function mini(label, value) {
  return h("div", { classes: ["awt-metric"], children: [h("span", { text: label }), h("strong", { text: String(value) })] });
}

function meshRows(entries, empty) {
  const rows = entries.length ? entries : [empty];
  return h("div", { classes: ["awt-mesh-list"], children: rows.map(entry => h("div", { classes: ["awt-mesh-row"], children: [h("strong", { text: entry.path || entry.summary }), h("span", { text: entry.type || entry.status || "idle" })] })) });
}

function graphView(graph) {
  return h("div", { classes: ["awt-mesh-graph"], children: graph.nodes.map(node => h("div", { classes: ["awt-mesh-node", `awt-mesh-node-${node.type}`], children: [h("strong", { text: node.label || node.id }), h("span", { text: node.type || "node" })] })) });
}

function virtualFileList() {
  const out = h("pre", { text: "Select a virtual file." });
  return card("Virtual filesystem", [h("div", { classes: ["awt-mesh-list"], children: listVirtualFiles("/").map(entry => {
    const button = h("button", { classes: ["awt-command-item"], text: `${entry.path} · ${entry.bytes}b` });
    button.addEventListener("click", () => { const read = readVirtualFile(entry.path); out.textContent = read.ok ? read.content : read.error; });
    return button;
  }) }), out]);
}

function projectionList(title, entries) {
  return card(title, [meshRows(entries, { path: "Nothing mounted yet", type: "waiting" })]);
}

function intentRunner() {
  const out = h("pre", { text: "No intent routed yet." });
  const select = h("select", { children: ["files.list", "files.read", "semantic.search", "workflow.run", "browser.inspect"].map(intent => h("option", { attrs: { value: intent }, text: intent })) });
  const input = h("input", { attrs: { placeholder: "payload / query", value: "README" } });
  const button = h("button", { text: "Route intent" });
  button.addEventListener("click", async () => { const payload = select.value.includes("search") ? { q: input.value } : { path: input.value || "/README.awt" }; out.textContent = JSON.stringify(await routeIntent(select.value, payload), null, 2); });
  return card("Intent router", [select, input, button, out]);
}

/**
 * B"H
 * Chapter 22: The runtime mesh opened with cards, not a canyon.
 *
 * The Awtsmoos hides graph, mounts, projections, and timelines until the user
 * selects one runtime. The first surface is now a professional runtime grid.
 *
 * @returns {HTMLElement} Mesh panel.
 */
export function createMeshPanel() {
  const runtimes = listRuntimes();
  const active = getActiveRuntime();
  for (const runtime of runtimes) mountRuntimeDefaults(runtime);
  syncRuntimeGraph(runtimes);
  const graph = readRuntimeGraph();
  const mounts = listRuntimeMounts();
  const timeline = readRuntimeTimeline(active?.id);
  const replayPlan = createReplayPlan(active?.id);
  const health = measureRuntimeMeshHealth(runtimes);
  const detail = h("div", { classes: ["awt-runtime-detail"], attrs: { hidden: "hidden" } });
  const runtimeGrid = h("div", { classes: ["awt-runtime-entry-grid"], children: runtimes.map(runtime => runtimeButton(runtime, detail, graph, mounts, timeline, replayPlan, health, active)) });
  return h("section", { classes: ["awt-mesh-panel", "stack"], attrs: { id: "awtRuntimeMeshPanel" }, children: [
    h("div", { classes: ["page-head"], children: [h("p", { classes: ["eyebrow"], text: "Runtime Mesh" }), h("h2", { text: "Runtime control grid" })] }),
    h("div", { classes: ["awt-dashboard-metrics"], children: [mini("Runtimes", runtimes.length), mini("Nodes", graph.nodes.length), mini("Mounts", mounts.length), mini("Events", timeline.length)] }),
    card("Runtimes", [runtimeGrid]),
    detail
  ] });
}

function runtimeButton(runtime, detail, graph, mounts, timeline, replayPlan, health, active) {
  const button = h("button", { classes: ["awt-runtime-entry"], attrs: { type: "button" }, children: [h("strong", { text: runtime.tunnel?.name || runtime.id }), h("span", { text: runtime.mode || "runtime" }), h("small", { text: runtime.activeRoot || "." })] });
  button.addEventListener("click", () => openRuntimeDetail(detail, runtime, graph, mounts, timeline, replayPlan, health, active));
  return button;
}

function openRuntimeDetail(detail, runtime, graph, mounts, timeline, replayPlan, health, active) {
  detail.removeAttribute("hidden");
  detail.replaceChildren(
    card("Runtime health", [createRuntimeHealthCard([runtime], health)]),
    card("Runtime graph", [graphView(graph), createJsonReveal("runtime graph", graph)]),
    card("Mounted realities", [meshRows(mounts, { path: "No mounts yet", type: "waiting" })]),
    virtualFileList(),
    projectionList("Semantic projection", buildSemanticProjection(active)),
    projectionList("Browser projection", buildBrowserProjection(active)),
    card("Timeline", [meshRows(timeline, { summary: "No timeline events yet", type: "idle" }), createJsonReveal("replay plan", replayPlan)]),
    intentRunner()
  );
  detail.scrollIntoView({ behavior: "smooth", block: "start" });
}
