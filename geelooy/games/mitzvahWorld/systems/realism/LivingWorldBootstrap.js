// B"H
import { regionalAwarenessState, regionalReactionHints } from './RegionalAwarenessSystem.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { createNpcMemoryBook } from './NpcMemorySystem.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { dirtWearForSurface } from './ProceduralDirtWearSystem.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { windFieldAt } from './WindFieldSystem.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { audioIntent } from './AudioRealismIntents.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { skyWeatherLighting } from './SkyWeatherLightingModel.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { terrainEcology } from './TerrainEcologyModel.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { simulationTier } from './SimulationInterestTiers.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { wildlifeEcosystemStep } from './WildlifeEcosystemSystem.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { createDynamicStoryWorld } from './DynamicStoryWorld.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { animationOverlayIntent } from './ProceduralAnimationOverlays.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
import { villageSnapshot } from './LivingVillageSimulation.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';
export function buildLivingWorldReport(scope=globalThis){const weather='clear',timeOfDay='morning';const region=regionalAwarenessState({timeOfDay,weather,population:18,recentEvents:['first-shlichus']});const memory=createNpcMemoryBook();memory.remember({actorId:'player',kind:'helped-villager',strength:.8});const story=createDynamicStoryWorld();story.record({kind:'helped-villager',thread:'first-shlichus'});return{seal:'living-world-hyperrealism-20260622-bh1',region,hints:regionalReactionHints(region),npcMemory:memory.report(),dirt:dirtWearForSurface({traffic:.7,moisture:.35,age:.8}),wind:windFieldAt({time:Date.now(),weather}),audio:audioIntent({distance:32,surface:'grass',weather}),sky:skyWeatherLighting({timeOfDay,weather}),terrain:terrainEcology({moisture:.55,slope:.18,rock:.22}),tier:simulationTier(85),wildlife:wildlifeEcosystemStep({prey:24,predators:2,food:.7,water:.6}),story:story.report(),animation:animationOverlayIntent({emotion:'grateful',lookingAt:true,wind:.25}),village:villageSnapshot([{name:'Rebbe',work:'school'},{name:'Merchant',work:'market'}],{timeOfDay,weather}),frameCost:'event-driven-and-tiered'} }
export function bootLivingWorld(scope=globalThis){const report=buildLivingWorldReport(scope);scope.__AWTSMOOS_LIVING_WORLD__=report;return report}
bootLivingWorld(globalThis.window||globalThis);export default bootLivingWorld;
