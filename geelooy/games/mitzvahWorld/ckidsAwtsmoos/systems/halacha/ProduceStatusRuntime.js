// B"H
/** @file ProduceStatusRuntime.js @description Status helpers for tevel and separated produce. */
export function isTevel(item) { return item?.produceStatus?.tevel === true && item?.produceStatus?.separated !== true; }
export function markSeparated(item, steps = []) { if (!item) return null; item.produceStatus ||= {}; Object.assign(item.produceStatus, { tevel: false, separated: true, steps }); item.name = item.name?.replace(/^Tevel /, "Separated ") || "Separated produce"; return item; }
export function tevelItems(player) { return (player?.inventory?.slots || []).filter(isTevel); }
export default { isTevel, markSeparated, tevelItems };
