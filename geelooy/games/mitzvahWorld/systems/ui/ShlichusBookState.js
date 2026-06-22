// B"H
/** @file ShlichusBookState.js @description Tiny state vessel for the collapsible shlichus scroll book. */
const state = { open:false, updatedAt:0 };
const QUEST_IDS = Object.freeze(["uiQuestTracker", "uiQuestMarkers", "uiQuestProgress"]);
function panel(id) { return document.getElementById(id); }
export function setShlichusBookOpen(open) { state.open = !!open; state.updatedAt = Date.now(); document.body.classList.toggle("scrollBookOpen", state.open); for (const id of QUEST_IDS) { const el = panel(id); if (!el) continue; el.classList.toggle("scrollBookOpen", state.open); el.classList.toggle("mitzvahCollapsed", !state.open); } return { ...state }; }
export function toggleShlichusBook() { return setShlichusBookOpen(!state.open); }
export function shlichusBookState() { return { ...state, questIds:[...QUEST_IDS] }; }
globalThis.__AWTSMOOS_SHLICHUS_BOOK__ = { open:setShlichusBookOpen, toggle:toggleShlichusBook, state:shlichusBookState };
export default { setShlichusBookOpen, toggleShlichusBook, shlichusBookState };
