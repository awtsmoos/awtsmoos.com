// B"H
/** @file PriceRuntime.js @description Vendor prices with reputation discount hooks. */
function standingDiscount(standing = "stranger") { return ({ friendly:.05, honored:.1, revered:.15, beloved:.2 }[standing] || 0); }
export function priceFor(player, item, mode = "buy", factionId = "village") { const base = Number(item?.price ?? item?.sellValue ?? 1); const standing = player?.reputation?.[factionId]?.standing || "stranger"; const discount = mode === "buy" ? standingDiscount(standing) : 0; const multiplier = mode === "sell" ? .35 : 1 - discount; return Math.max(1, Math.ceil(base * multiplier)); }
export default { priceFor };
