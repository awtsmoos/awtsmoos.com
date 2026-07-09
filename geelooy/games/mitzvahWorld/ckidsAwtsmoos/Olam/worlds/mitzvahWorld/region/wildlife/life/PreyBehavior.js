// B"H
/** @file PreyBehavior.js @description Graze, listen, panic, hide, return loop. */
import { posOf, steerAway, around } from './LifeMath.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { rememberThreat } from './WildlifeMemory.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { satisfy } from './WildlifeNeedSystem.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
export function preyDecision(actor, perception, needs, schedule, seed = 1) { const threat = perception.nearestThreat; if (threat) { rememberThreat(actor, threat.actor, 1); return { state:'panic', target:steerAway(posOf(actor), posOf(threat.actor), 20), threat:threat.actor }; } if (needs.fear > .55 || schedule.activity === 'hide') return { state:'hide' }; if (needs.hunger > .35) { satisfy(actor, 'hunger', .015); return { state:'graze', target:around(posOf(actor), 5, seed) }; } if (needs.social > .65 && perception.herd.length) return { state:'socialIdle', target:posOf(perception.herd[0].actor) }; return null; }
export function preySummary(actors = []) { return { prey:actors.filter(a => a.userData && ['rabbit','deer','goat','frog','bird'].includes(a.userData.species)).length }; }
