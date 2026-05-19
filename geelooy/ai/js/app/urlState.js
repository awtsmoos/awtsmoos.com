//B"H
/** @returns {string|null} Current conversation id from the URL vessel. */
export function getConversationId() {
  return new URLSearchParams(location.search).get("awtsmoosConversation");
}

/**
 * Rewrites the query without dragging old mismatched keys behind it.
 * @param {Record<string,string|null|undefined>} params - Values to reveal.
 */
export function updateSearchParams(params) {
  const current = new URLSearchParams(location.search);
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") current.delete(key);
    else current.set(key, value);
  }
  const query = current.toString();
  history.pushState({}, "", location.pathname + (query ? `?${query}` : ""));
}
