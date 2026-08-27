// B"H
// Worker messages are named gates so no string drifts in exile.
export const MSG = Object.freeze({
  START: "start", RESIZE: "resize", ENTRIES: "entries", PLANT: "plant",
  BLESS: "bless", STRIKE: "strike", DEBUG: "debug", PAUSE: "pause",
  STOP: "stop", STATS: "stats"
});
export const message = (type, data = {}) => ({ type, ...data });
