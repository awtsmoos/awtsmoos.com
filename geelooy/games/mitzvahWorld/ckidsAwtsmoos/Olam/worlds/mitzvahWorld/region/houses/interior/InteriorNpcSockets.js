// B"H
/** @file InteriorNpcSockets.js @description NPC standing/sitting sockets inside cottages. */
export function npcSocketForHouse(house = {}, role = "resident") { const base = { resident:{ x:-.6,y:.05,z:.4 }, worker:{ x:1.1,y:.05,z:.6 }, child:{ x:-1.1,y:.05,z:-.2 }, visitor:{ x:0,y:.05,z:1.35 } }; return { houseId:house.id, role, ...(base[role] || base.resident) }; }
export default npcSocketForHouse;
