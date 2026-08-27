// B"H

import { el, text } from "./dom.js";

/**
 * B"H
 * Chapter 404: Agent Thinking Became A Visible Vessel.
 */
export function mountAgentThinking(root) {
  const items = [
    ["Plan", "Trace → change → verify → report"],
    ["Progress", "Beauty layer mounted and listening"],
    ["Risks", "Live browser verification unavailable"],
    ["Verification", "Syntax, imports, CSS braces"]
  ];
  root.append(el("section", { classes: ["awt-agent-thinking"], children: [
    text("h3", "Agent Thinking Panel"),
    ...items.map(([k, v]) => el("div", { classes: ["awt-thinking-row"], children: [text("strong", k), text("span", v)] }))
  ] }));
}
