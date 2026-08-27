// B"H
// State bridge: the spark logic is now split into small vessels.
export { normalize, normalizeAll } from "./state/normalize.js";
export { createEntry, seedEntries } from "./state/entries.js";
export { stage, isDormant, describe } from "./state/lifecycle.js";
export { fulfill, tend, relight } from "./state/mutations.js";
export { stats, filtered, oracle, constellations } from "./state/selectors.js";
