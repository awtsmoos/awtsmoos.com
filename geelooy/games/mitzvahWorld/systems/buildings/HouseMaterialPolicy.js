// B"H
export function houseMaterialPolicy(part="wall"){const map={wall:{kind:"wall",layers:["plaster-grain","cavity-dirt","edge-wear"]},roof:{kind:"roof",layers:["tile-band","moss-edge","roughness-noise"]},beam:{kind:"bark",layers:["wood-grain","corner-wear"]},stone:{kind:"wall",layers:["stone-chip","foundation-dirt"]}};return map[part]||map.wall}
export default houseMaterialPolicy;
