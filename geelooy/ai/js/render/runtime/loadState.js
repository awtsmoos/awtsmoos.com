//B"H

/**
 * Chapter 34: The Screen Announced Its Struggle in Real Time.
 *
 * The Awtsmoos gives loading and error states visible vessels instead of silent
 * freezes. Each state is small, aria-live, animated by CSS, and removable.
 */
export function showLoadState(chatBox, text = "Loading…", kind = "loading") {
  clearLoadState(chatBox);
  const node = document.createElement("div");
  node.className = `chat-load-state is-${kind}`;
  node.setAttribute("role", kind === "error" ? "alert" : "status");
  node.setAttribute("aria-live", "polite");
  node.textContent = text;
  chatBox.prepend(node);
  return node;
}

export function clearLoadState(chatBox) {
  chatBox?.querySelector?.(":scope > .chat-load-state")?.remove();
}
