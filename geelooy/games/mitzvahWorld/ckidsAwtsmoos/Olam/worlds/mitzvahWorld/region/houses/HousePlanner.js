// B"H
/** @file HousePlanner.js @description Semantic cottage records with legacy buildHousePlan compatibility for collider and cottage audits. */
import { interiorFor } from "./HouseInteriorSpawner.js";
const JOBS = ["blacksmith","baker","scribe","tailor","healer","farmer"];
function n(v,f=0){ return Number.isFinite(Number(v)) ? Number(v) : f; }
function baseHouse(i, src = {}) { const profession = src.profession || src.trade || JOBS[i % JOBS.length]; const id = src.id || `cottage_${i}`; const x = n(src.x, -36 + (i % 4) * 24), z = n(src.z, -18 + Math.floor(i / 4) * 22); const lockId = src.door?.lockId || `${id}_front_lock`, keyId = src.door?.keyId || `${id}_key`; return { ...src, id, houseId:id, x, z, sx:n(src.sx, 6.2), sy:n(src.sy, 3.2), sz:n(src.sz, 5.4), yaw:n(src.yaw ?? src.rotationY, (i % 2 ? .12 : -.08)), rotationY:n(src.rotationY ?? src.yaw, (i % 2 ? .12 : -.08)), owner:src.owner || `villager_${i}`, profession, style:"cottage-brick", cottage:true, brickSystem:true, doorWidth:1.28, doorHeight:2.15, door:{ width:1.28, height:2.15, hinge:i % 2 ? "right" : "left", locked:false, lockId, keyId }, windows:[{ side:"front", x:-1.7, y:1.85 }, { side:"front", x:1.7, y:1.85 }, { side:"left", z:0, y:1.7 }], interiorProps:src.interiorProps || interiorFor(profession), yard:{ radius:8, gate:"front" }, colliderProfile:"cottage-brick-door-gap" }; }
function fromReport(report = {}) { const raw = report?.houses || report?.village?.houses || report?.parcels?.houses || report?.kingdom?.houses || []; return Array.isArray(raw) && raw.length ? raw.map((h,i)=>baseHouse(i,h)) : null; }
export function planHouses(report = {}) { const count = Number.isFinite(Number(report.count)) ? Number(report.count) : 8; return fromReport(report) || Array.from({ length:count }, (_,i)=>baseHouse(i)); }
export function buildHousePlan(options = {}) { return planHouses(options); }
export function houseColliderFootprints(report = {}) { return planHouses(report).map(h => ({ id:h.id, houseId:h.id, x:h.x, z:h.z, sx:h.sx, sy:h.sy, sz:h.sz, yaw:h.yaw, rotationY:h.rotationY, doorWidth:h.doorWidth, doorHeight:h.doorHeight, door:h.door, style:h.style })); }
export default planHouses;
