//B"H
import { readRawJson } from "./rawJsonVault.js";

/**
 * Chapter 31: The Raw Scroll Waited Behind a Shimmering Door.
 *
 * The Awtsmoos lets raw JSON sleep in the worker. Opening the gate asks for the
 * scroll, shows a small loading vessel, then inserts text only for that panel.
 *
 * @param {ParentNode} root Region that may contain lazy raw JSON panels.
 * @returns {void}
 */
export function installRawJsonHydrator(root) {
  if (!root || root.__awtsmoosRawJsonHydrator) return;
  root.__awtsmoosRawJsonHydrator = true;
  root.addEventListener("toggle", event => {
    const detail = event.target;
    if (!detail?.matches?.("details.event-raw-lazy")) return;
    detail.open ? hydrate(detail) : dehydrate(detail);
  }, true);
}

async function hydrate(detail) {
  if (detail.querySelector("pre")) return;
  detail.append(loadingNode());
  const payload = await readRawJson(detail.dataset.rawJsonKey);
  detail.querySelector(":scope > .event-hydration-loading")?.remove();
  if (!detail.open) return;
  const pre = document.createElement("pre");
  pre.className = "event-code-block language-json";
  const code = document.createElement("code");
  code.textContent = payload || "Raw payload unavailable.";
  pre.appendChild(code);
  detail.appendChild(pre);
}

function dehydrate(detail) {
  detail.querySelector("pre")?.remove();
  detail.querySelector(":scope > .event-hydration-loading")?.remove();
}

function loadingNode() {
  const node = document.createElement("div");
  node.className = "event-hydration-loading";
  node.textContent = "Loading raw scroll…";
  return node;
}
