// B"H
/**
 * @file HouseRecordFactory.js
 * @description
 * Raw plans become lived homes here. The Awtsmoos gives each house a family,
 * door, windows, interior, yard, collider law, and memory.
 */
import { interiorFor } from "./HouseInteriorSpawner.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { HOUSE_JOBS, STARTER_HOUSES, fallbackPosition, starterSource } from "./HouseStarterCatalog.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

function numberOr(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function doorFor(source, id, index) {
  const lockId = source.door?.lockId || `${id}_front_lock`;
  const keyId = source.door?.keyId || `${id}_key`;
  return {
    width: 1.28,
    height: 2.15,
    hinge: index % 2 ? "right" : "left",
    locked: false,
    lockId,
    keyId,
    owner: `family_${index}`
  };
}

function windowsFor(source) {
  return source.windows || [
    { side: "front", x: -1.7, y: 1.85 },
    { side: "front", x: 1.7, y: 1.85 },
    { side: "left", z: 0, y: 1.7 }
  ];
}

function familyFor(source, profession, index) {
  return {
    name: source.family?.name || `Bayis ${index + 1}`,
    members: source.family?.members || [`${profession}_parent`, `child_${index}`]
  };
}

export function baseHouse(index, raw = {}) {
  const source = starterSource(index, raw);
  const fallback = fallbackPosition(index);
  const profession = source.profession || source.trade || HOUSE_JOBS[index % HOUSE_JOBS.length];
  const id = source.id || `cottage_${index}`;
  const yaw = numberOr(source.yaw ?? source.rotationY, index % 2 ? 0.12 : -0.08);
  return {
    ...source,
    id,
    houseId: id,
    x: numberOr(source.x, fallback.x),
    z: numberOr(source.z, fallback.z),
    sx: numberOr(source.sx, source.width || 6.8),
    sy: numberOr(source.sy, source.height || 3.35),
    sz: numberOr(source.sz, source.depth || 5.8),
    yaw,
    rotationY: yaw,
    owner: source.owner || `family_${index}`,
    family: familyFor(source, profession, index),
    profession,
    style: "cottage-brick",
    age: numberOr(source.age, 8 + index * 3),
    condition: numberOr(source.condition, 0.82),
    repairs: source.repairs || [],
    history: source.history || [`Built for ${profession} work`],
    cottage: true,
    brickSystem: true,
    doorWidth: 1.28,
    doorHeight: 2.15,
    door: doorFor(source, id, index),
    windows: windowsFor(source),
    interiorProps: source.interiorProps || interiorFor(profession),
    yard: source.yard || { radius: 8, gate: "front" },
    colliderProfile: "cottage-brick-door-gap",
    worldMemory: source.worldMemory || { repairs: 0, visits: 0, weatherDamage: 0 },
    starterVisibleHouse: index < STARTER_HOUSES.length
  };
}

export function fromHouseReport(report = {}) {
  const raw = report?.houses || report?.village?.houses || report?.parcels?.houses || report?.kingdom?.houses || [];
  return Array.isArray(raw) && raw.length ? raw.map((house, index) => baseHouse(index, house)) : null;
}
