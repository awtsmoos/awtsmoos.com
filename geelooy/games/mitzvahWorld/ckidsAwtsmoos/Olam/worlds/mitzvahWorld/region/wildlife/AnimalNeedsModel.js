// B"H
/** @file AnimalNeedsModel.js @description Small bounded numbers create living behavior without expensive AI. */
const clamp=v=>Math.max(0,Math.min(1,Number(v)||0));
export function needsFor(species, traits = {}) { const predator=!!traits.predator, water=!!traits.water; return { hunger:predator?.62:.38, thirst:water?.16:.42, fear:traits.fear ?? .35, sleep:.12, parent:.2, herd:.5, territoryWeight:predator?.9:.64, state:traits.state || "wander", lastEvent:Date.now() }; }
export function advanceNeeds(needs, dt = 1/60, weather = {}) { const k=Math.min(.12, Number(dt)||1/60); needs.hunger=clamp(needs.hunger+k*.018); needs.thirst=clamp(needs.thirst+k*(weather.rain?.004:.014)); needs.sleep=clamp(needs.sleep+k*.006); needs.fear=clamp(needs.fear-k*.01); return needs; }
export function decideNeed(needs){ if(needs.fear>.75)return"flee"; if(needs.thirst>.72)return"drink"; if(needs.hunger>.68)return"eat"; if(needs.sleep>.82)return"sleep"; return needs.state || "wander"; }
export default { needsFor, advanceNeeds, decideNeed };
