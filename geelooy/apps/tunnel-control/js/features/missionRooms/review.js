// B"H

/** B"H: Review queue is derived from write-ish events until backend review actions exist. */
export function reviewItems(state) {
  return (state.events || []).filter(isReviewable).slice(-40).reverse().map(event => ({ event, id: event.id, file: event.payload?.path || event.payload?.file || event.payload?.target || "unknown", status: localReviewStatus(state, event.id), title: event.title || event.type }));
}

export function setReview(state, eventId, status) {
  state.reviewDecisions = { ...(state.reviewDecisions || {}), [eventId]: status };
}

function localReviewStatus(state, eventId) {
  return state.reviewDecisions?.[eventId] || "pending";
}

function isReviewable(event = {}) {
  return /write|patch|replace|diff|change/i.test(`${event.type} ${event.title} ${event.payload?.action || ""}`);
}
