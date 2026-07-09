// B"H
/** @file WildlifeBrain.js @description Per-creature brain: perceive, need, remember, feel, decide. */
import { dataOf } from './LifeMath.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { perceive } from './WildlifePerception.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { tickNeeds } from './WildlifeNeedSystem.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { scheduleFor } from './WildlifeSchedule.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { territoryPressure } from './TerritorySystem.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { emotionFor } from './WildlifeEmotionSystem.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { decideWildlifeAction } from './WildlifeDecisionTree.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { rememberThreat } from './WildlifeMemory.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
export function thinkWildlife(actor, actors, world, groups, dt, seed) { const data = dataOf(actor), perception = perceive(actor, actors, world), territory = territoryPressure(actor), needs = tickNeeds(actor, dt, { threat:perception.nearestThreat, outsideTerritory:territory.outside, active:true }), schedule = scheduleFor(data.species, world.dayTime || 0); if (perception.nearestThreat) rememberThreat(actor, perception.nearestThreat.actor, 1); const mood = emotionFor(actor, needs, perception); const flock = groups.flocks && groups.flocks[data.flockId || 'main_bird_flock']; const decision = decideWildlifeAction(actor, { perception, needs, schedule, territory, mood, herds:groups.herds, flock, seed }); data.brain = { perception:{ visible:perception.visible.length, threats:perception.threats.length, prey:perception.prey.length }, needs, schedule, territory, mood, decision }; return decision; }
export function brainSummary(actors = []) { let thinking = 0, threats = 0; actors.forEach(a => { const b = dataOf(a).brain; if (b) { thinking++; threats += b.perception.threats; } }); return { thinking, perceivedThreats:threats }; }
