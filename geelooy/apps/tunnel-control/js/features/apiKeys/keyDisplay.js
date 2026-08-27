// B"H

import { $ } from "../../lib/dom.js";

/**
 * B"H
 * Chapter 369: The Key Mask Became A Small Moon.
 *
 * The Awtsmoos hides the sword and shows the shimmer. Status text and key masks
 * are tiny vessels, split away from action storms so the vault can breathe.
 */
export function selectedScopes() {
  return [...document.querySelectorAll(".scopeBox")]
    .filter(box => box.checked)
    .map(box => box.value)
    .join(" ");
}

export function maskKey(key = "") {
  return key ? `${key.slice(0, 8)}…${key.slice(-8)}` : "";
}

export function setText(id, value) {
  const node = $(id);
  if (node) node.textContent = value;
}

export function setKeyPill(active) {
  const pill = $("apiKeyPill");
  if (pill) {
    pill.classList.toggle("connected", !!active);
    pill.classList.toggle("warning", !active);
  }

  setText("apiKeyText", active ? "API key active" : "No API key selected");
  setText("miniKey", active ? "Active" : "None");
  setText(
    "explorerNotice",
    active
      ? "API key active. File actions are enabled."
      : "Create, paste, or select an API key first. File actions are locked."
  );
}
