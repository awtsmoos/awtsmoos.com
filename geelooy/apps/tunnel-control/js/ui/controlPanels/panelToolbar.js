// B"H

import { rememberCollapsed } from "./panelStorage.js";

/**
 * B"H
 * Chapter 384: The Toolbar Split Into Icon, Focus, And Fold.
 */
function iconFor(text) {
  const t = String(text || "").toLowerCase();

  if (t.includes("setup") || t.includes("root")) return "🧭";
  if (t.includes("api") || t.includes("key")) return "🔑";
  if (t.includes("file") || t.includes("explorer") || t.includes("project")) return "📁";
  if (t.includes("usage") || t.includes("rate")) return "📊";
  if (t.includes("terminal") || t.includes("command")) return "⌁";
  if (t.includes("chrome") || t.includes("browser")) return "🌐";
  if (t.includes("docs") || t.includes("instruction")) return "📜";
  if (t.includes("account") || t.includes("login")) return "👤";

  return "✦";
}

function textSpan(value) {
  const span = document.createElement("span");
  span.textContent = value;
  return span;
}

export function makeToolbarTitle(title) {
  const left = document.createElement("div");
  left.className = "awt-section-title";
  left.append(textSpan(iconFor(title)), textSpan(title));
  return left;
}

export function makeFocusButton(el) {
  const focus = document.createElement("button");
  focus.className = "awt-jump-btn";
  focus.type = "button";
  focus.textContent = "Focus";
  focus.addEventListener("click", () => {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  return focus;
}

export function makeCollapseButton(el, id, collapsed) {
  const collapse = document.createElement("button");
  collapse.className = "awt-collapse-btn";
  collapse.type = "button";
  collapse.textContent = collapsed ? "Expand" : "Collapse";
  collapse.addEventListener("click", () => {
    const next = el.dataset.collapsed !== "true";
    el.dataset.collapsed = next ? "true" : "false";
    collapse.textContent = next ? "Expand" : "Collapse";
    rememberCollapsed(id, next);
  });
  return collapse;
}
