// B"H
import { regionalAwarenessState, regionalReactionHints } from '../../systems/realism/RegionalAwarenessSystem.js';
import { createNpcMemoryBook, dialogueTone } from '../../systems/realism/NpcMemorySystem.js';
import { dirtWearForSurface } from '../../systems/realism/ProceduralDirtWearSystem.js';
import { windFieldAt } from '../../systems/realism/WindFieldSystem.js';
import { audioIntent } from '../../systems/realism/AudioRealismIntents.js';
import { skyWeatherLighting } from '../../systems/realism/SkyWeatherLightingModel.js';
import { terrainEcology } from '../../systems/realism/TerrainEcologyModel.js';
const storm=regionalAwarenessState({weather:'storm',danger:.6,recentEvents:['wolf'],population:20});
if(regionalReactionHints(storm).npcScheduleShift!=='seek-shelter-or-home') throw new Error('Regional storm reaction missing');
const book=createNpcMemoryBook(); book.remember({actorId:'player',kind:'helped-me',strength:.9});
if(dialogueTone(book,'player')!=='warm-grateful') throw new Error('NPC memory tone failed');
if(dirtWearForSurface({traffic:1,moisture:.8}).mud<=.4) throw new Error('Dirt wear mud too weak');
if(windFieldAt({weather:'storm'}).vegetationSway<=windFieldAt({weather:'clear'}).vegetationSway) throw new Error('Storm wind not stronger');
if(audioIntent({distance:100,occluded:true}).lowpassHz>2000) throw new Error('Audio occlusion missing');
if(skyWeatherLighting({weather:'storm'}).fogDensity<=skyWeatherLighting({weather:'clear'}).fogDensity) throw new Error('Storm fog missing');
if(terrainEcology({moisture:.8,slope:.1,rock:.1}).vegetation!=='lush') throw new Error('Terrain ecology lush case failed');
console.log('B"H livingWorldSystemsAudit passed');
