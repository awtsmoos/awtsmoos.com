// B"H
/** Hinged cottage door: clickable/openable vessel with closed-door collider descriptor. */
import * as THREE from "/games/scripts/build/three.module.js";
import { COTTAGE_BRICK_PALETTE as P } from "./CottageBrickPalette.js";
import { defaultDoorState } from "./door/DoorStateIndex.js?v=house-solid-loader-compact-20260702-bh3&compact=true";
const material = color => new THREE.MeshLambertMaterial({ color, transparent:false, opacity:1, depthWrite:true, depthTest:true });
function part(name, size, pos, color, data={}) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material(color)); mesh.name = name; mesh.position.set(...pos); Object.assign(mesh.userData ||= {}, data, { cottageDoorPart:true, opacitySealed:true, clickable:true }); return mesh; }
function applyOpen(root, state, panel, collider) { const open = state.open === true; root.rotation.y = open ? (state.hinge === "left" ? -Math.PI / 2.25 : Math.PI / 2.25) : 0; collider.open = open; collider.solid = !open; panel.userData.closedCollider = !open; root.userData.doorOpen = open; root.userData.needsCollisionReregister = true; }
export function buildCottageDoor(house = {}, spec = {}) {
  const state = { ...defaultDoorState(house), open:false }, root = new THREE.Group(), width = spec.doorWidth || 1.28, height = spec.doorHeight || 2.15, depth = .16, z = (spec.depth || house.sz || 5.4) / 2 + .13, hingeX = state.hinge === "left" ? -width / 2 : width / 2;
  root.name = `cottage_door_system_${house.id}`; root.position.set(hingeX, 0, z); const panelX = state.hinge === "left" ? width / 2 : -width / 2;
  const panel = part(`${state.id}_panel`, [width, height, depth], [panelX, height / 2, 0], P.door.color, { doorPanel:true, doorId:state.id, closedCollider:true });
  const trim = part(`${state.id}_trim`, [width + .2, height + .18, .2], [panelX, height / 2, 0], P.door.trim, { doorTrim:true, doorId:state.id });
  const knob = new THREE.Mesh(new THREE.SphereGeometry(.065, 10, 8), material(P.door.metal)); knob.name = `${state.id}_knob`; knob.position.set(panelX + (state.hinge === "left" ? width * .32 : -width * .32), height * .52, depth * .62); Object.assign(knob.userData ||= {}, { cottageDoorPart:true, doorKnob:true, doorId:state.id, opacitySealed:true, clickable:true });
  const collider = { id:state.id, category:"closed-door", owner:house.id, position:[0,height/2,z], size:[width,height,.34], yaw:0, door:true, open:false, locked:state.locked, hinge:state.hinge, visibleTwin:state.id, skin:.08 };
  const toggle = () => { if (state.locked) return false; state.open = !state.open; applyOpen(root, state, panel, collider); root.dispatchEvent?.({ type:"cottage-door-toggled", open:state.open, houseId:house.id, doorId:state.id }); return true; };
  Object.assign(root.userData ||= {}, { cottageDoorSystem:true, doorHingePivot:true, houseId:house.id, doorState:state, colliderSources:[collider], clickable:true, interactionKind:"door", prompt:"Open Door", onClick:toggle, interact:toggle, toggleDoor:toggle });
  [panel, trim, knob].forEach(x => Object.assign(x.userData ||= {}, { onClick:toggle, interact:toggle, houseId:house.id, doorId:state.id })); root.add(trim, panel, knob); applyOpen(root, state, panel, collider); return { root, state, collider };
}
export default buildCottageDoor;
