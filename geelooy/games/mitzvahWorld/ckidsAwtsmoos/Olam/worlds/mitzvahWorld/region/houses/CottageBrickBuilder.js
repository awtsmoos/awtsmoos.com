// B"H
/** Cottage builder: orchestration only; every wall/detail lives apart. */
import * as THREE from "/games/scripts/build/three.module.js";
import { COTTAGE_BRICK_PALETTE as P } from "./CottageBrickPalette.js";
import { addCottageWalls } from "./CottageBrickWalls.js";
import { addCottageBeams, addCottageWindows } from "./CottageBrickDetails.js";
export function cottageSpec(house = {}) { return { width:house.sx || 6.2, depth:house.sz || 5.4, height:house.sy || 3.2, brick:P.wall.size, doorWidth:house.door?.width || 1.28, doorHeight:house.door?.height || 2.15 }; }
export function buildCottageBricks(house = {}) { const group = new THREE.Group(), spec = cottageSpec(house), colliders = []; group.name = `cottage_brick_system_${house.id}`; Object.assign(group.userData ||= {}, { cottageBrickSystem:true, houseId:house.id, colliderSources:colliders, colliderSchema:"compound-cottage-v2", collisionStrategy:"static-compound-door-gap" }); addCottageWalls(group, house, spec, colliders); addCottageBeams(group, house, spec); group.userData.roofHandledByCottageRoofBuilder = true; addCottageWindows(group, house, spec); return { group, colliders, spec }; }
export default buildCottageBricks;
