// B"H
/** @file BuybackRuntime.js @description Remembers recently sold items for solo vendor forgiveness. */
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
export function ensureBuyback(olam) { const p = playerOf(olam); if (!p) return null; p.buyback ||= []; return p.buyback; }
export function noteSoldItem(olam, item, value = 0) { const b = ensureBuyback(olam); if (!b || !item) return false; b.unshift({ item, value, at:Date.now() }); while (b.length > 12) b.pop(); return b[0]; }
export function buybackPayload(olam) { return { items:ensureBuyback(olam) || [] }; }
export default { ensureBuyback, noteSoldItem, buybackPayload };
