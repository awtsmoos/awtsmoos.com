// B"H
/**
 * @file RegionCottageStats.js
 * @description Cottage stats preserve colliders and avoid circular reports.
 */
import { updateDoorAnimations } from "../houses/door/DoorAnimationRuntime.js?v=door-animation-runtime-20260615-bh2";
function movingDoor(root) { let moving = false; root?.traverse?.(child => { const state = child.userData?.doorState; const gap = Math.abs(Number(state?.targetAngle || 0) - Number(state?.angle || 0)); if (state && gap > 0.006) moving = true; }); return moving; }
function countRooms(root) { let rooms = 0, floors = 0, doors = 0; root?.traverse?.(child => { const d = child.userData || {}; if (d.visibleRoomWall || d.interiorWall) rooms++; if (d.cottageInteriorFloor) floors++; if (d.doorHingePivot || d.doorPanel) doors++; }); return { rooms, floors, doors }; }
export function tickCottageDoors(root, delta) { const dt = Number(delta) || 1 / 60; if (!movingDoor(root)) return; updateDoorAnimations(root, dt); root.userData.stats.doorAnimationTicks = (root.userData.stats.doorAnimationTicks || 0) + 1; }
export function installCottageStats(root, houses, allBase = [], olam) { const roomStats = countRooms(root), colliderCount = Array.isArray(allBase) ? allBase.filter(x => x?.solid !== false).length : 0; root.userData = { ...(root.userData || {}), cottageRenderer:true, cottageCount:houses.length, baseColliderSources:allBase, colliderSources:allBase, stats:{ cottages:houses.length, starterVisibleHouses:houses.filter(h => h.starterVisibleHouse).length, brickSystem:true, splitRoof:true, splitWindows:true, splitYard:true, doors:true, liveDoors:true, clickableDoors:roomStats.doors, internalRooms:roomStats.rooms, interiorFloors:roomStats.floors, fullVillageGameplay:true, colliderSources:colliderCount, visualOnlyUntilColliderProof:false, octreeCollisionRequired:true } }; root.userData.tick = delta => tickCottageDoors(root, delta); olam.__livingRegionCottageStats = root.userData.stats; }
