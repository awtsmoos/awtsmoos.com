// B"H
import { createLiveCollisionBridge } from "../../ckidsAwtsmoos/systems/collision/CollisionLiveWorldAdapter.js";
import CollisionMovementBridge from "../../ckidsAwtsmoos/systems/collision/CollisionMovementBridge.js";

export function makeLiveBridgeFixture(overrides = {}) {
  const events = [];
  const olam = { worldState:{ flags:{} }, player:{ id:"player", mesh:{ position:{ x:0, y:0, z:0 } } }, ayshPeula(kind, name, payload) { events.push({ kind, name, payload }); } };
  const data = {
    worldId:"village",
    bounds:{ minX:-10, maxX:80, minZ:-10, maxZ:50 },
    houses:[{ id:"house_a", x:8, z:0, width:3, depth:10 }, { id:"house_b", x:18, z:0, width:3, depth:10 }],
    walls:[{ id:"thin_wall", x:32, z:0, width:.25, depth:10 }],
    roads:[{ id:"main_road", x:10, z:14, width:60, depth:4 }],
    doors:[{ id:"door_a", x:6, z:9, width:1, depth:.35, locked:true, trigger:{ x:6, z:7.8, width:3, depth:2 } }],
    triggers:[{ id:"intro_zone", kind:"cutscene-zone", x:0, z:8, width:4, depth:4, trigger:true, once:true }],
    hazards:[{ id:"spike_soft", kind:"hazard", x:24, z:0, width:3, depth:3, trigger:true }],
    spawns:[{ id:"player_spawn", x:0, z:0, radius:.55 }, { id:"npc_spawn", x:2, z:2, radius:.55 }, { id:"animal_spawn", x:3, z:2, radius:.55 }],
    npcs:[{ id:"rebbe", name:"Rebbe", userData:{ kind:"npc", friendly:true }, position:{ x:2, z:0 } }],
    animals:[{ id:"goat", name:"Village Goat", userData:{ kind:"animal", peaceful:true, species:"goat" }, position:{ x:3, z:0 } }],
    hostiles:[{ id:"fox", name:"Wild Fox", userData:{ kind:"creature", hostile:true, attackable:true, species:"fox" }, position:{ x:5, z:0 }, hp:20 }],
    cutscenes:[{ id:"intro_once", play:{ once:true, when:{ event:"enterWorld", worldId:"village" } }, beats:[{ kind:"dialogue", at:1, text:"Welcome." }] }, { id:"zone_once", play:{ once:true, when:{ event:"collisionEnter", triggerId:"intro_zone" } }, beats:[{ kind:"dialogue", at:1, text:"You entered." }] }],
    ...overrides.data
  };
  const bridge = createLiveCollisionBridge(olam, data, overrides.options || {});
  const movement = new CollisionMovementBridge(olam, bridge, { worldSource:data, holder:olam, ...(overrides.movement || {}) });
  return { olam, data, bridge, movement, events };
}

export function eventCount(events, name) {
  return events.filter(e => e.name === name).length;
}
