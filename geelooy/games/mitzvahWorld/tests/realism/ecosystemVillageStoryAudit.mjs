// B"H
import { simulationTier } from '../../systems/realism/SimulationInterestTiers.js';
import { wildlifeEcosystemStep } from '../../systems/realism/WildlifeEcosystemSystem.js';
import { createDynamicStoryWorld } from '../../systems/realism/DynamicStoryWorld.js';
import { animationOverlayIntent } from '../../systems/realism/ProceduralAnimationOverlays.js';
import { villageSnapshot } from '../../systems/realism/LivingVillageSimulation.js';
import { buildLivingWorldReport } from '../../systems/realism/LivingWorldBootstrap.js';
if(simulationTier(300).mode!=='statistical') throw new Error('Far simulation must be statistical');
const eco=wildlifeEcosystemStep({prey:20,predators:1,food:1,water:.7}); if(eco.prey<=19) throw new Error('Wildlife ecosystem did not preserve prey with food');
const story=createDynamicStoryWorld(); story.record({kind:'storm'}); if(!story.nextHooks().includes('repair-mission')) throw new Error('Story hook missing');
if(animationOverlayIntent({emotion:'grateful',lookingAt:true}).gesture!=='open-hands') throw new Error('Animation overlay missing');
const village=villageSnapshot([{name:'A',work:'market'}],{weather:'rain',timeOfDay:'morning'}); if(village.states[0].activity!=='shelter') throw new Error('Village rain schedule missing');
const report=buildLivingWorldReport({}); if(report.frameCost!=='event-driven-and-tiered'||!report.village.count) throw new Error('Living world bootstrap report incomplete');
console.log('B"H ecosystemVillageStoryAudit passed');
