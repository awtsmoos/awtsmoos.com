//B"H
/**
 * Chapter 107: The Scroll Anchor Held The Mountain In Place.
 *
 * Loading earlier messages should reveal history, not shatter the viewport or
 * hurl the reader into another part of the river. We remember the first visible
 * shell and restore its distance after the DOM window is rebuilt.
 */
export function captureWindowScrollAnchor(chatBox) {
  const shell = firstVisibleShell(chatBox);
  if (!shell) return null;
  return { id:shell.dataset.messageId || "", top:shell.getBoundingClientRect().top };
}

export function restoreWindowScrollAnchor(chatBox, anchor) {
  if (!anchor?.id) return;
  const shell = chatBox.querySelector(`.message-shell[data-message-id="${cssEscape(anchor.id)}"]`);
  if (!shell) return;
  const delta = shell.getBoundingClientRect().top - anchor.top;
  chatBox.scrollTop += delta;
}

function firstVisibleShell(chatBox) {
  const boxTop = chatBox.getBoundingClientRect().top;
  return [...chatBox.querySelectorAll(":scope > .message-shell")].find(shell => shell.getBoundingClientRect().bottom >= boxTop) || null;
}

function cssEscape(value) {
  if (globalThis.CSS?.escape) return CSS.escape(value);
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}
