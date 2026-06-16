// B"H
/** @file WildlifeLifeRuntime.js @description The 25-phase living ecosystem conductor. */
import { dataOf } from './LifeMath.js';
import { thinkWildlife, brainSummary } from './WildlifeBrain.js';
import { buildHerds, herdSummary } from './HerdManager.js';
import { buildFlocks, flockSummary } from './BirdFlockManager.js';
import { ensureDens, denSummary } from './DenNetwork.js';
import { seedFamilies } from './WildlifeFamilySystem.js';
import { tickTracks, trackSummary } from './WildlifeTracks.js';
import { disturbGrass, grassSummary } from './GrassDisturbanceSystem.js';
import { emitWildlifeSounds, soundSummary } from './WildlifeSoundscape.js';
import { emotionSummary } from './WildlifeEmotionSystem.js';
import { woundSummary } from './WoundedBehavior.js';
import { tickMicroWildlife, microSummary } from './MicroWildlifeSystem.js';
import { tickWaterLife, waterSummary, seedWaterPoints } from './WaterLifeSystem.js';
import { markRareWildlife, rareSummary } from './RareWildlifeManager.js';
import { tickEcosystem, ecosystemSummary } from './EcosystemSimulation.js';
import { advancedBirdSummary } from './AdvancedBirdBehavior.js';
import { territorySummary } from './TerritorySystem.js';
function actorsOf(root) { return root && Array.isArray(root.children) ? root.children.filter(c => dataOf(c).wildlifeActor) : []; }
function worldOf(olam, store) { return { dayTime:store.dayTime, water:store.waterPoints || seedWaterPoints(), food:store.foodSources || [] }; }
function summary(store, actors, groups) { return Object.assign({ livingEcosystem:true, phasesComplete:25, actors:actors.length }, brainSummary(actors), herdSummary(groups.herds), flockSummary(groups.flocks), denSummary(store.dens), trackSummary(store), grassSummary(store), soundSummary(store), emotionSummary(actors), woundSummary(actors), microSummary(store), waterSummary(store), rareSummary(actors), ecosystemSummary(store), advancedBirdSummary(actors), territorySummary(actors)); }
export function createWildlifeLifeRuntime(root, olam, report = {}) { const store = { dayTime:0, ticks:0, report, waterPoints:seedWaterPoints(), foodSources:[], tracks:[], grassDisturbances:[], soundEvents:[] }; const runtime = { store, tick(dt = 1 / 60) { const actors = actorsOf(root); store.ticks++; store.dayTime = ((Date.now() % 240000) / 240000); if (!store.seeded) { store.dens = ensureDens(actors); store.familySeed = seedFamilies(actors); store.rareSeed = markRareWildlife(actors); store.seeded = true; } const groups = { herds:buildHerds(actors), flocks:buildFlocks(actors) }; const world = worldOf(olam, store); actors.forEach((actor, i) => { const d = dataOf(actor); if (d.health && d.health.dead) return; d.lifeDecision = thinkWildlife(actor, actors, world, groups, dt, (d.motion && d.motion.seed || i) + store.ticks); if (d.lifeDecision && d.lifeDecision.state) d.state = d.lifeDecision.state; }); tickTracks(store, actors, dt); disturbGrass(store, actors, dt); emitWildlifeSounds(store, actors, dt); tickMicroWildlife(store, dt); tickWaterLife(store, actors, dt); tickEcosystem(store, actors, dt); store.summary = summary(store, actors, groups); root.userData.lifeSummary = store.summary; if (olam) olam.__AWTSMOOS_WILDLIFE_LIFE__ = store.summary; return store.summary; } }; root.userData.lifeRuntime = runtime; return runtime; }
export default createWildlifeLifeRuntime;
