// B"H
/** @file WildlifeDecisionTree.js @description Ordered creature decisions from survival to story. */
import { dataOf } from './LifeMath.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { predatorDecision } from './PredatorBehavior.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { preyDecision } from './PreyBehavior.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { herdDecision } from './HerdManager.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { birdDecision } from './BirdFlockManager.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { familyDecision, protectFamily } from './WildlifeFamilySystem.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { woundedDecision } from './WoundedBehavior.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { rareDecision } from './RareWildlifeManager.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { advancedBirdDecision } from './AdvancedBirdBehavior.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { territoryWaypoint } from './TerritorySystem.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { denTarget } from './DenNetwork.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
export function decideWildlifeAction(actor, ctx) {
  const data = dataOf(actor), species = data.species || 'rabbit';
  const wound = woundedDecision(actor, ctx.perception); if (wound) return wound;
  const rare = rareDecision(actor); if (rare) return rare;
  const protect = protectFamily(actor, ctx.perception.nearestThreat); if (protect) return protect;
  const bird = advancedBirdDecision(actor, ctx.schedule, ctx.perception, ctx.seed); if (bird) return bird;
  if (species === 'bird') { const flock = birdDecision(actor, ctx.flock, ctx.schedule, ctx.seed); if (flock) return flock; }
  const family = familyDecision(actor); if (family) return family;
  const herd = herdDecision(actor, ctx.herds); if (herd) return herd;
  if (species === 'fox') { const pred = predatorDecision(actor, ctx.perception, ctx.needs, ctx.schedule, ctx.seed); if (pred) return pred; }
  const prey = preyDecision(actor, ctx.perception, ctx.needs, ctx.schedule, ctx.seed); if (prey) return prey;
  if (ctx.schedule.activity && ctx.schedule.activity.includes('Den')) return { state:ctx.schedule.activity, target:denTarget(actor) };
  if (ctx.territory.outside) return { state:'returnTerritory', target:territoryWaypoint(actor, ctx.seed) };
  return { state:ctx.schedule.activity || 'wander', target:territoryWaypoint(actor, ctx.seed + 3) };
}
export default decideWildlifeAction;
