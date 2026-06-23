// B"H
import { regionalAwarenessState, regionalReactionHints } from './RegionalAwarenessSystem.js';
import { createNpcMemoryBook } from './NpcMemorySystem.js';
import { dirtWearForSurface } from './ProceduralDirtWearSystem.js';
import { windFieldAt } from './WindFieldSystem.js';
import { audioIntent } from './AudioRealismIntents.js';
import { skyWeatherLighting } from './SkyWeatherLightingModel.js';
import { terrainEcology } from './TerrainEcologyModel.js';
import { simulationTier } from './SimulationInterestTiers.js';
import { wildlifeEcosystemStep } from './WildlifeEcosystemSystem.js';
import { createDynamicStoryWorld } from './DynamicStoryWorld.js';
import { animationOverlayIntent } from './ProceduralAnimationOverlays.js';
import { villageSnapshot } from './LivingVillageSimulation.js';
export function buildLivingWorldReport(scope=globalThis){const weather='clear',timeOfDay='morning';const region=regionalAwarenessState({timeOfDay,weather,population:18,recentEvents:['first-shlichus']});const memory=createNpcMemoryBook();memory.remember({actorId:'player',kind:'helped-villager',strength:.8});const story=createDynamicStoryWorld();story.record({kind:'helped-villager',thread:'first-shlichus'});return{seal:'living-world-hyperrealism-20260622-bh1',region,hints:regionalReactionHints(region),npcMemory:memory.report(),dirt:dirtWearForSurface({traffic:.7,moisture:.35,age:.8}),wind:windFieldAt({time:Date.now(),weather}),audio:audioIntent({distance:32,surface:'grass',weather}),sky:skyWeatherLighting({timeOfDay,weather}),terrain:terrainEcology({moisture:.55,slope:.18,rock:.22}),tier:simulationTier(85),wildlife:wildlifeEcosystemStep({prey:24,predators:2,food:.7,water:.6}),story:story.report(),animation:animationOverlayIntent({emotion:'grateful',lookingAt:true,wind:.25}),village:villageSnapshot([{name:'Rebbe',work:'school'},{name:'Merchant',work:'market'}],{timeOfDay,weather}),frameCost:'event-driven-and-tiered'} }
export function bootLivingWorld(scope=globalThis){const report=buildLivingWorldReport(scope);scope.__AWTSMOOS_LIVING_WORLD__=report;return report}
bootLivingWorld(globalThis.window||globalThis);export default bootLivingWorld;
