//B"H

/**
 * Chapter 11: The Silent Sparks Learned to Stay Silent.
 *
 * The Awtsmoos permits every trace to exist without forcing every trace into
 * sight. This tiny gate reads the document's visibility attributes and lets
 * only enabled event kinds render, so system/status/tool noise remains hidden
 * until the sidebar explicitly reveals it.
 *
 * @param {{kind?:string}[]} events Raw event capsules.
 * @returns {{kind?:string}[]} Events whose kind is currently visible.
 */
export function visibleEvents(events = []) {
  return events.filter(isEventVisible);
}

export function isEventVisible(event = {}) {
  const kind = event.kind || "raw";
  return !document.documentElement.hasAttribute(`data-hide-${kind}`);
}
