// B"H

import { h } from "../ui/core/html.js";
import { SEFIROS, PROVIDERS, TASKS, AGENTS } from "./dashboardData.js";

/**
 * B"H
 * Chapter 341b: The Palace Learned To Render Councils.
 *
 * These renderers are tiny vessels. The Awtsmoos reveals one UI section at a
 * time: a Tree, rivers of providers, sparks of tasks, and the command chamber.
 */
export function metric(label, value) {
  return h("div", { classes: ["awt-metric"], children: [h("span", { text: label }), h("strong", { text: value })] });
}

export function section(title, tag, child) {
  return h("article", {
    classes: ["panel", "stack"],
    children: [
      h("div", { classes: ["awt-section-title"], children: [h("h3", { text: title }), h("span", { text: tag })] }),
      child
    ]
  });
}

export function kabbalahMap() {
  return h("div", { classes: ["awt-kabbalah-map"], children: SEFIROS.map(sefirah) });
}

export function providerGrid() {
  return h("div", { classes: ["awt-provider-grid"], children: PROVIDERS.map(providerCard) });
}

export function taskList() {
  return h("div", { classes: ["awt-task-list"], children: TASKS.map(taskRow) });
}

export function agentStrip() {
  return h("div", { classes: ["awt-agent-strip"], children: AGENTS.map(agentCard) });
}

export function commandCenter() {
  return h("div", {
    classes: ["awt-command-center"],
    children: [
      h("div", { classes: ["awt-command-message"], attrs: { "data-role": "user" }, text: "Design a system where AI agents can spawn other agents to complete big tasks." }),
      h("div", { classes: ["awt-command-message"], attrs: { "data-role": "agent" }, children: ["I will awaken a non-blocking delegate task.", spawnCard()] }),
      h("div", { classes: ["awt-command-input"], children: [h("span", { text: "Ask Awtsmoos anything..." }), h("button", { attrs: { type: "button" }, text: "➤" })] })
    ]
  });
}

function sefirah([name, small, x, y, color]) {
  return h("div", {
    classes: ["awt-sefirah"],
    attrs: { style: `--x:${x};--y:${y};--c:${color};` },
    children: [name, h("small", { text: small })]
  });
}

function providerCard([id, icon, name, status, label, value]) {
  return h("div", {
    classes: ["awt-provider-card"],
    attrs: { "data-provider": id },
    children: [
      h("div", { classes: ["awt-provider-head"], children: [h("div", { classes: ["awt-provider-seal"], text: icon }), h("span", { classes: ["awt-provider-status"], text: status })] }),
      h("h4", { text: name }),
      h("div", { classes: ["awt-provider-meta"], children: [h("span", { text: label }), h("strong", { text: value })] })
    ]
  });
}

function taskRow([title, agent, pct, state, id]) {
  return h("div", {
    classes: ["awt-task-row"],
    children: [
      h("div", { classes: ["awt-task-icon"], text: "☉" }),
      h("div", { classes: ["awt-task-copy"], children: [h("strong", { text: title }), h("span", { text: `Agent: ${agent} • ${id}` })] }),
      h("div", { classes: ["awt-task-progress"], attrs: { style: `--p:${pct};` }, children: [h("i")] }),
      h("span", { classes: ["awt-task-state"], text: state })
    ]
  });
}

function agentCard([icon, name, provider]) {
  return h("div", { classes: ["awt-agent-card"], children: [h("div", { classes: ["awt-agent-seal"], text: icon }), h("strong", { text: name }), h("span", { text: provider })] });
}

function spawnCard() {
  return h("div", { classes: ["awt-spawn-card"], children: [h("span", { text: "✦" }), h("div", { text: "Task Spawned: Architecture Plan" }), h("code", { text: "running" })] });
}
