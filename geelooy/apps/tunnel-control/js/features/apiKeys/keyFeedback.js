// B"H

import { $, jsonText } from "../../lib/dom.js";

/**
 * B"H
 * Chapter 370: Feedback Became A Cup Instead Of A Flood.
 */
export function feedback(text, data = null) {
  const box = $("keysBox");
  if (!box) return;
  box.textContent = data ? `${text}\n\n${JSON.stringify(data, null, 2)}` : text;
}

export function showKeyJson(payload) {
  jsonText("keysBox", payload);
}
