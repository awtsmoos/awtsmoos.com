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

function card(title, children) {
  return h("article", { classes: ["panel", "stack", "awt-mesh-card"], children: [h("h3", { text: title }), ...children] });
}

function mini(label, value) {
  return h("div", { classes: ["awt-metric"], children: [h("span", { text: label }), h("strong", { text: String(value) })] });
}

function graphView(graph) {
  return h("div", {
    classes: ["awt-mesh-graph"],
    children: graph.nodes.map(node => h("div", {
      classes: ["awt-mesh-node", `awt-mesh-node-${node.type}`],
      children: [
        h("strong", { text: node.label || node.id }),
        h("span", { text: node.type || "node" })
      ]
    }))
  });
}

function mountList(mounts) {
  return h("div", {
    classes: ["awt-mesh-list"],
    children: mounts.map(mount => h("div", { classes: ["awt-mesh-row"], children: [h("strong", { text: mount.path }), h("span", { text: mount.type })] }))
  });
}

function timelineList(events) {
  return h("div", {
    classes: ["awt-mesh-list"],
    children: (events.length ? events : [{ summary: "No timeline events yet.", type: "idle" }]).map(event => h("div", {
      classes: ["awt-mesh-row"],
      children: [h("strong", { text: event.summary }), h("span", { text: event.type })]
    }))
  });
}

function virtualFileList() {
  const out = h("pre", { text: "Select a virtual file." });

  return card("Virtual filesystem", [
    h("div", {
      classes: ["awt-mesh-list"],
      children: listVirtualFiles("/").map(entry => {
        const button = h("button", { classes: ["awt-command-item"], text: `${entry.path} · ${entry.bytes}b` });
        button.addEventListener("click", () => {
          const read = readVirtualFile(entry.path);
          out.textContent = read.ok ? read.content : read.error;
        });
        return button;
      })
    }),
    out
  ]);
}

function projectionList(title, entries) {
  return card(title, [
    h("div", {
      classes: ["awt-mesh-list"],
      children: entries.map(entry => h("div", {
        classes: ["awt-mesh-row"],
        children: [h("strong", { text: entry.path }), h("span", { text: entry.type || (entry.enabled ? "enabled" : "disabled") })]
      }))
    })
  ]);
}

function intentRunner() {
  const out = h("pre", { text: "No intent routed yet." });
  const select = h("select", {
    children: ["files.list", "files.read", "semantic.search", "workflow.run", "browser.inspect"].map(intent => h("option", { attrs: { value: intent }, text: intent }))
  });
  const input = h("input", { attrs: { placeholder: "payload / query", value: "README" } });
  const button = h("button", { text: "Route intent" });

  button.addEventListener("click", async () => {
    const payload = select.value.includes("search") ? { q: input.value } : { path: input.value || "/README.awt" };
    out.textContent = JSON.stringify(await routeIntent(select.value, payload), null, 2);
  });

  return card("Intent router", [select, input, button, out]);
}

function splitComparison(runtimes) {
  const [left, right] = runtimes;
  return card("Split runtime comparison", [
    h("div", { classes: ["two-grid"], children: [
      h("pre", { text: JSON.stringify(left || {}, null, 2) }),
      h("pre", { text: JSON.stringify(right || {}, null, 2) })
    ]})
  ]);
}

/**
 * B"H
 * Creates the runtime mesh surface.
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

  return h("section", {
    classes: ["awt-mesh-panel", "stack"],
    attrs: { id: "awtRuntimeMeshPanel" },
    children: [
      h("div", { classes: ["page-head"], children: [h("p", { classes: ["eyebrow"], text: "Runtime Mesh" }), h("h2", { text: "Reality compositor" })] }),
      h("div", { classes: ["awt-dashboard-metrics"], children: [mini("Runtimes", runtimes.length), mini("Nodes", graph.nodes.length), mini("Mounts", mounts.length), mini("Events", timeline.length)] }),
      card("Runtime graph", [graphView(graph)]),
      card("Runtime health", [h("pre", { text: JSON.stringify(health, null, 2) })]),
      card("Mounted realities", [mountList(mounts)]),
      virtualFileList(),
      projectionList("Semantic projection", buildSemanticProjection(active)),
      projectionList("Browser projection", buildBrowserProjection(active)),
      card("Timeline", [timelineList(timeline), h("pre", { text: JSON.stringify(replayPlan, null, 2) })]),
      intentRunner(),
      splitComparison(runtimes)
    ]
  });
}
