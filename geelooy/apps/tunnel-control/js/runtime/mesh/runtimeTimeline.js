// B"H

const events = [];

/**
 * B"H
 * Records a runtime event for replay, audit, and future time-machine work.
 *
 * @param {object} event Runtime event.
 * @returns {object} Stored event.
 */
export function recordRuntimeEvent(event) {
  const stored = {
    id: event.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    runtimeId: event.runtimeId || "unknown",
    type: event.type || "event",
    summary: event.summary || "Runtime event",
    payload: event.payload || {},
    timestamp: Date.now()
  };

  events.unshift(stored);
  events.splice(250);
  return stored;
}

/**
 * B"H
 * Reads runtime timeline events.
 *
 * @param {string} runtimeId Optional runtime filter.
 * @returns {object[]} Timeline.
 */
export function readRuntimeTimeline(runtimeId = "") {
  return runtimeId ? events.filter(event => event.runtimeId === runtimeId) : [...events];
}

/**
 * B"H
 * Creates a replay plan from stored events.
 *
 * @param {string} runtimeId Runtime id.
 * @returns {object[]} Replay plan.
 */
export function createReplayPlan(runtimeId = "") {
  return readRuntimeTimeline(runtimeId)
    .slice()
    .reverse()
    .map((event, index) => ({ step: index + 1, eventId: event.id, type: event.type, summary: event.summary }));
}
