//B"H

/**
 * Chapter 33: The Thought River Refused To Be Reborn.
 *
 * The Awtsmoos breathes new letters into the stream every instant, yet the
 * opened chamber must not be slain and recreated for every spark. This helper
 * catches the living inner thought window before an outer event-card refresh,
 * lets the shell renew, then returns the same DOM body and appends only the new
 * sparks that arrived at the bottom.
 *
 * @param {Element} node Event entry about to receive fresh envelope HTML.
 * @returns {object|null} Detached DOM state for an opened thought stream.
 */
export function captureThoughtStream(node) {
  const panel = node?.querySelector?.(":scope .thought-envelope-events[open]");
  if (!panel) return null;
  const body = panel.querySelector(":scope > .thought-inner-window");
  return {
    wasOpen: true,
    body: body || null,
    count: Number(panel.dataset.innerCount || 0),
    offset: Number(panel.dataset.thoughtOffset || 0)
  };
}

/**
 * Restores an expanded thought stream after the outer envelope regenerated.
 *
 * @param {Element} node Event entry that now contains fresh envelope HTML.
 * @param {object|null} snapshot Result from captureThoughtStream.
 * @param {object} event Fresh grouped thought-envelope event.
 * @param {(events:Array<object>) => string} renderNested Renders nested event cards.
 * @returns {void}
 */
export function restoreThoughtStream(node, snapshot, event, renderNested) {
  if (!snapshot?.wasOpen) return;
  const panel = node?.querySelector?.(":scope .thought-envelope-events");
  if (!panel) return;
  const inner = Array.isArray(event?.raw?.events) ? event.raw.events : [];
  panel.open = true;
  panel.dataset.innerCount = String(inner.length);
  panel.dataset.thoughtOffset = String(snapshot.offset || 0);
  refreshSummary(panel, inner.length);
  if (snapshot.body) panel.append(snapshot.body);
  appendFreshInnerEvents(panel, snapshot, inner, renderNested);
}

function appendFreshInnerEvents(panel, snapshot, inner, renderNested) {
  const previousCount = Math.max(0, Number(snapshot.count || 0));
  if (!snapshot.body || inner.length <= previousCount) return;
  const fresh = inner.slice(previousCount);
  if (!fresh.length) return;
  snapshot.body.insertAdjacentHTML("beforeend", renderNested(fresh));
}

function refreshSummary(panel, count) {
  const summary = panel.querySelector(":scope > summary");
  if (summary) summary.textContent = `${count} inner event(s)`;
}
