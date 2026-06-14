// B"H
/**
 * @file VillageInteractionLayers.js
 * @description
 * Chapter 1009: collision and interaction stop wrestling in the dark.
 * The Awtsmoos writes one registry: terrain is terrain, decor is decor, NPC
 * touch is explicit, and raycasts receive names instead of confusion.
 */
const KEY="__awtsmoosVillageInteractionLayers";
function gather(scene){ const out={terrain:[],world:[],decor:[],interaction:[]}; scene?.traverse?.(o=>{ const d=o.userData||{}; if(d.proceduralTerrain||o.name?.toLowerCase?.().includes("terrain")) out.terrain.push(o); else if(d.awtsmoosRayProxy||d.explicitTapOnly) out.interaction.push(o); else if(d.villageDecor||d.skipRaycast) out.decor.push(o); else if(o.isMesh) out.world.push(o); }); return out; }
function label(set){ set.decor.forEach(o=>Object.assign(o.userData,{skipRaycast:true,skipOctree:true,noOctree:true,interactionLayer:"decor"})); set.interaction.forEach(o=>Object.assign(o.userData,{skipRaycast:false,skipOctree:true,noOctree:true,interactionLayer:"explicit-interaction"})); set.terrain.forEach(o=>Object.assign(o.userData,{interactionLayer:"terrain"})); set.world.forEach(o=>Object.assign(o.userData,{interactionLayer:o.userData?.interactionLayer||"world"})); }
export async function ensureVillageInteractionLayers(context={}){ const olam=context.olam||context, scene=context.scene||olam.scene; if(!scene||!olam||olam[KEY]) return olam?.[KEY]||null; const layers=gather(scene); label(layers); const registry={ createdAt:Date.now(), counts:Object.fromEntries(Object.entries(layers).map(([k,v])=>[k,v.length])), names:Object.fromEntries(Object.entries(layers).map(([k,v])=>[k,v.slice(0,20).map(o=>o.name||o.type||"unnamed")]))}; olam.awtsmoosInteractionLayers=registry; olam[KEY]=registry; return registry; }
