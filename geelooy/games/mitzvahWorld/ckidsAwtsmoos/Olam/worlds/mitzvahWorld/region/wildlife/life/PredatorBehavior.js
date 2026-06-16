// B"H
/** @file PredatorBehavior.js @description Search, stalk, chase, attack, eat, rest loop. */
import { dist, posOf, around } from './LifeMath.js';
import { satisfy } from './WildlifeNeedSystem.js';
export function predatorDecision(actor, perception, needs, schedule, seed = 1) { const prey = perception.nearestPrey; if (needs.fatigue > .82) return { state:'restDen' }; if (needs.hunger < .24 && schedule.activity !== 'hunt') return null; if (!prey) return { state:'searchPrey', target:around(posOf(actor), 18, seed) }; if (prey.distance > 14) return { state:'stalk', target:posOf(prey.actor), prey:prey.actor }; if (prey.distance > 2.6) return { state:'hunt', target:posOf(prey.actor), prey:prey.actor }; satisfy(actor, 'hunger', .2); return { state:'attack', target:posOf(prey.actor), prey:prey.actor }; }
export function predatorEat(actor, prey) { if (!prey || !prey.userData) return false; const h = prey.userData.health; if (h && h.dead) { satisfy(actor, 'hunger', .6); return true; } return false; }
export function predatorSummary(actors = []) { return { predators:actors.filter(a => a.userData && a.userData.species === 'fox').length }; }
