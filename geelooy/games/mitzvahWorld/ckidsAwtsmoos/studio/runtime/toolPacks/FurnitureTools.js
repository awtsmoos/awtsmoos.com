// B"H
/** @file FurnitureTools.js @description Every placed home object is tagged as functional, not decoration-only dust. */
const FURNITURE = ["bed","table","chair","bookshelf","candle","window","door","torah-shelf","lamp","food","storage","decoration","interactive-item"];
function furniture(id) { return { id:`furniture.${id}`, category:"furniture", functional:true, label:id, apply:({ runtime, payload }) => { runtime?.registerEntity?.({ id:payload.id || `${id}_${Date.now()}`, kind:"furniture", tags:["studio","furniture",id], functions:[id,"inspect","move"], payload }); return { ok:true, id, payload }; } }; }
export function furnitureTools() { return FURNITURE.map(furniture); }
export default furnitureTools;
