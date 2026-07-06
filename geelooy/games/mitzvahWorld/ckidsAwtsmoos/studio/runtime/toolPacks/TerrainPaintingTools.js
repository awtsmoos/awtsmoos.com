// B"H
/** @file TerrainPaintingTools.js @description Terrain brushes: dirt, rivers, forests, weather, music, and living zones. */
const TERRAIN = ["raise","lower","smooth","grass","flowers","dirt","road","river","lake","forest","mountain","village","cave","biome","weather","ambient-sound","music","npc-zone","spawn","quest","encounter","harvest","fishing","danger","cinematic-trigger"];
function tool(id) { return { id:`terrain.${id}`, category:"terrain", label:id.replace(/-/g," "), brush:true, apply:({ runtime, payload }) => { runtime?.registerEntity?.({ id:payload.id || `${id}_${Date.now()}`, kind:"terrainStroke", tags:["studio","terrain",id], payload }); return { ok:true, id, payload }; } }; }
export function terrainPaintingTools() { return TERRAIN.map(tool); }
export default terrainPaintingTools;
