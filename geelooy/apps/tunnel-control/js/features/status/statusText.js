// B"H

import { $ } from "../../lib/dom.js";

/**
 * B"H
 * Chapter 374: Status Text Learned To Stand Apart.
 */
export function safe(value, fallback = "unknown") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

export function setText(id, value) {
  const node = $(id);
  if (node) node.textContent = value;
}

export function setPill(id, textId, status, text) {
  const pill = $(id);
  const label = $(textId);
  if (!pill || !label) return;

  pill.classList.remove("connected", "warning", "danger", "warn");
  if (status === "good") pill.classList.add("connected");
  else if (status === "bad") pill.classList.add("danger");
  else pill.classList.add("warning");

  label.textContent = text;
}
