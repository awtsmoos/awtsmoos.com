// B"H
export function terrainMeshRequest(zone = {}) { return { id:`${zone.id || "zone"}_terrain`, recipe:"terrain", primitive:"plane", scale:[120,1,120], material:{ shader:"basic" } }; }
