// B"H
/** @file BankRuntime.js @description Storehouse/bank state for the village. */
export function ensureBank(olam) { const p = olam?.player || olam?.chossid || olam; p.bankState ||= { slots: [] }; return p.bankState; }
export function openBank(olam) { const payload = { open: true, bank: ensureBank(olam) }; olam?.ayshPeula?.("ui event", "bankPanel", payload); return payload; }
export default { ensureBank, openBank };
