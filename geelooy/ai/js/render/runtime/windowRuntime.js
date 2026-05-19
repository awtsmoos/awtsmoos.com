//B"H
import { WINDOW, BUFFER } from "./renderConstants.js";
import { recordWeight } from "./recordWeight.js";

export function syncWindowGates(renderer, end) {
  const earlier = renderer.windowStart > 0;
  const later = end < renderer.records.length;
  setGate(renderer.topSpacer, earlier, earlier ? `↑ Load earlier messages` : "");
  setGate(renderer.bottomSpacer, later, later ? `↓ Load later messages` : "");
}

export function pruneTopRenderedShells(renderer) {
  let shells = [...renderer.chatBox.querySelectorAll(":scope > .message-shell")];
  while (visibleWeight(renderer, shells) > WINDOW + BUFFER && shells.length > 1) {
    const shell = shells.shift();
    const record = renderer.byId.get(shell?.dataset?.messageId);
    if (record) record.shell = null;
    shell?.remove();
  }
  const overflow = renderer.records.length > shells.length;
  setGate(renderer.topSpacer, overflow, overflow ? "↑ Load earlier messages" : "");
}

export function weightedEnd(records = [], start = 0) {
  let index = start;
  let weight = 0;
  while (index < records.length && weight < WINDOW + BUFFER) {
    weight += recordWeight(records[index]);
    index++;
  }
  return Math.max(index, Math.min(records.length, start + 1));
}

function visibleWeight(renderer, shells) {
  return shells.reduce((sum, shell) => sum + recordWeight(renderer.byId.get(shell?.dataset?.messageId)), 0);
}

function setGate(button, visible, text) {
  button.textContent = text;
  button.hidden = !visible;
  button.disabled = !visible;
  button.tabIndex = visible ? 0 : -1;
  button.setAttribute("aria-hidden", visible ? "false" : "true");
}
