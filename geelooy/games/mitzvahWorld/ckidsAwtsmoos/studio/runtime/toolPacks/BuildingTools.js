// B"H
/** @file BuildingTools.js @description Snapping vessels for homes, bridges, farms, shuls, and villages. */
const BUILDINGS = ["house","village","farm","shop","synagogue","study-hall","bridge","road","wall","fence","garden","field","barn","workshop"];
const OPS = ["rotate","scale","duplicate","align","mirror","group","prefab","blueprint"];
function building(id) { return { id:`build.${id}`, category:"building", snap:true, label:id, apply:({ runtime, payload }) => { runtime?.registerEntity?.({ id:payload.id || `${id}_${Date.now()}`, kind:"building", tags:["studio","building",id], payload }); return { ok:true, id, payload }; } }; }
function op(id) { return { id:`build.op.${id}`, category:"building-op", label:id, apply:({ payload }) => ({ ok:true, operation:id, payload }) }; }
export function buildingTools() { return [...BUILDINGS.map(building), ...OPS.map(op)]; }
export default buildingTools;
