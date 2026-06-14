// B"H
/**
 * @file VillageWorldPolishPass.js
 * @description
 * Chapter 1010: one conductor gathers the separate instruments.
 * The Awtsmoos makes landmarks, atmosphere, NPC life, and interaction layers run
 * as one late pass after proof-first construction succeeds.
 */
import { ensureVillageLandmarkLayer } from "./VillageLandmarkLayer.js?v=village-landmarks-20260614-bh1";
import { ensureVillageAtmosphereLayer } from "./VillageAtmosphereLayer.js?v=village-atmosphere-20260614-bh1";
import { ensureVillageNpcLifeLayer } from "./VillageNpcLifeLayer.js?v=village-npc-life-20260614-bh1";
import { ensureVillageInteractionLayers } from "./VillageInteractionLayers.js?v=village-interaction-layers-20260614-bh1";
const KEY="__awtsmoosVillageWorldPolishPass";
async function step(name, fn){ try{ const value=await fn(); return {ok:true,value}; } catch(error){ console.warn("B\"H | VILLAGE_POLISH_STEP_FAILED",{name,message:error?.message||String(error)}); return {ok:false,error:error?.message||String(error)}; } }
function added(r){ return r?.value ? 1 : 0; }
export async function ensureVillageWorldPolishPass(context={}){ const olam=context.olam||context; if(!olam||olam[KEY]) return olam?.[KEY]||null; const landmarks=await step("landmarks",()=>ensureVillageLandmarkLayer(context)); const atmosphere=await step("atmosphere",()=>ensureVillageAtmosphereLayer(context)); const npcLife=await step("npcLife",()=>ensureVillageNpcLifeLayer(context)); const interaction=await step("interactionLayers",()=>ensureVillageInteractionLayers(context)); const result={ok:[landmarks,atmosphere,npcLife,interaction].every(x=>x.ok), steps:{landmarks:{ok:landmarks.ok,added:added(landmarks),error:landmarks.error||null}, atmosphere:{ok:atmosphere.ok,added:added(atmosphere),error:atmosphere.error||null}, npcLife:{ok:npcLife.ok,added:added(npcLife),stations:npcLife.value?.userData?.stats?.stations||0,error:npcLife.error||null}, interactionLayers:{ok:interaction.ok,counts:interaction.value?.counts||null,error:interaction.error||null}}}; olam[KEY]=result; return result; }
