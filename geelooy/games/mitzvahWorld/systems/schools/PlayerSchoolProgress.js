// B"H
import PLAYER_SCHOOL_CHECKLIST from "./PlayerSchoolChecklist.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
const KEY = "awtsmoosPlayerSchoolProgress";
function readRaw(win = globalThis.window) { try { return JSON.parse(win?.localStorage?.getItem?.(KEY) || "{}"); } catch { return {}; } }
export function getSchoolProgress(win = globalThis.window) { const raw = readRaw(win); return PLAYER_SCHOOL_CHECKLIST.map(item => ({ ...item, done:Boolean(raw[item.id]), completedAt:raw[item.id] || null })); }
export function setSchoolDone(id, done = true, win = globalThis.window) { const raw = readRaw(win); if (done) raw[id] = Date.now(); else delete raw[id]; try { win?.localStorage?.setItem?.(KEY, JSON.stringify(raw)); } catch {} return getSchoolProgress(win); }
export function schoolSummary(win = globalThis.window) { const list = getSchoolProgress(win); return { total:list.length, done:list.filter(x => x.done).length, remaining:list.filter(x => !x.done).map(x => x.id) }; }
export default getSchoolProgress;
