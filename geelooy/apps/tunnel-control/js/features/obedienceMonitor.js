// B"H

import { h } from "../ui/core/html.js";

/**
 * B"H
 * Chapter 823: The agents stood before the question they tried to outrun.
 */
export function obedienceMonitor() {
  return h("section", { classes: ["pane", "awt-obedience"], attrs: { "data-pane": "obedienceMonitor" }, children: [head(), grid(), guide()] });
}

function head() {
  return h("div", { classes: ["page-head"], children: [
    h("p", { classes: ["eyebrow"], text: "AGENT OBEDIENCE" }),
    h("h2", { text: "Protocol monitor" }),
    h("p", { text: "Shows the live rules agents must obey: answer the forced choice, join rooms, hold claims, heartbeat, and verify before claiming completion." })
  ] });
}

function grid() {
  return h("div", { classes: ["awt-obedience-grid"], children: [
    card("Forced choice", "B - continue with proof", "Agents must answer before unrelated actions."),
    card("Room binding", "Mission room required", "Agents should discover and join rooms before coordination work."),
    card("Claims", "Claim before write", "Prevent overlapping edits across sessions."),
    card("Heartbeat", "Refresh presence", "Stale agents should lose leadership and claims."),
    card("Response focus", "One main thing", "Tunnel responses should show only the next required action."),
    card("Diagnostics", "guidanceDebug=true", "Raw protocol detail stays opt-in.")
  ] });
}

function guide() {
  return h("article", { classes: ["panel", "stack"], children: [
    h("h3", { text: "Block message" }),
    h("pre", { text: "BEFORE YOU GO ON FIRST ANSWER THIS MULTIPLE CHOICE: B - CONTINUE WITH PROOF." })
  ] });
}

function card(title, value, note) {
  return h("article", { classes: ["awt-obedience-card"], children: [
    h("span", { text: title }),
    h("strong", { text: value }),
    h("p", { text: note })
  ] });
}

export function mountObedienceMonitor() {}
