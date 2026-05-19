//B"H
import { WINDOW, BUFFER } from "./renderConstants.js";

/**
 * B"H — The window gates are only visible when they actually open a path.
 * Empty buttons must never sit in the chat like ghost portals, stealing clicks
 * and forcing full chat-window rerenders.
 */
export function syncWindowGates(renderer, end) {
  const earlier = renderer.windowStart > 0;
  const later = end < renderer.records.length;
  setGate(renderer.topSpacer, earlier, earlier ? `↑ Load ${Math.min(WINDOW, renderer.windowStart)} earlier messages` : "");
  setGate(renderer.bottomSpacer, later, later ? `↓ Load ${Math.min(WINDOW, renderer.records.length - end)} later messages` : "");
}

export function pruneTopRenderedShells(renderer) {
  const shells = [...renderer.chatBox.querySelectorAll(":scope > .message-shell")];
  const limit = WINDOW + BUFFER;
  while (shells.length > limit) {
    const shell = shells.shift();
    const record = renderer.byId.get(shell?.dataset?.messageId);
    if (record) record.shell = null;
    shell?.remove();
  }
  const overflow = renderer.records.length > limit;
  setGate(renderer.topSpacer, overflow, overflow ? "↑ Load earlier messages" : "");
}

function setGate(button, visible, text) {
  button.textContent = text;
  button.hidden = !visible;
  button.disabled = !visible;
  button.tabIndex = visible ? 0 : -1;
  button.setAttribute("aria-hidden", visible ? "false" : "true");
}
