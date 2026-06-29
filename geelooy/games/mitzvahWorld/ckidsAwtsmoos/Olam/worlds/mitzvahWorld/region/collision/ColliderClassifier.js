// B"H
/**
 * @file ColliderClassifier.js
 * @description
 * Converts region data into collision intent. Visual abundance stays visual;
 * hard bodies become small, grounded, visible-sourced records that can be
 * indexed and baked without invisible mystery walls.
 */

function list(value) {
  return Array.isArray(value) ? value : [];
}

function count(value) {
  return Array.isArray(value) ? value.length : Number(value?.count || 0);
}

function num(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function localToWorld(record = {}, localX = 0, localZ = 0) {
  const yaw = num(record.yaw);
  return {
    x: num(record.x) + Math.cos(yaw) * localX + Math.sin(yaw) * localZ,
    z: num(record.z) - Math.sin(yaw) * localX + Math.cos(yaw) * localZ
  };
}

function wallRecord(house = {}, id, localX, localZ, size, yawOffset = 0) {
  const center = localToWorld(house, localX, localZ);
  const owner = house.id || house.name || `house_${num(house.x)}_${num(house.z)}`;
  return {
    type: "house-wall",
    category: "cottage-wall",
    id: `${owner}_${id}`,
    owner,
    x: center.x,
    z: center.z,
    yaw: num(house.yaw) + yawOffset,
    size,
    visibleTwin: true
  };
}

function houseHardColliders(house = {}) {
  const sx = num(house.sx, 8);
  const sy = num(house.sy, 4.2);
  const sz = num(house.sz, 6);
  const thick = 0.32;
  const doorWidth = Math.min(sx * 0.55, Math.max(1.05, num(house.doorWidth ?? house.door?.width, 1.28)));
  const doorHeight = Math.min(sy - 0.2, Math.max(1.7, num(house.doorHeight ?? house.door?.height, 2.15)));
  const sideW = Math.max(0.18, (sx - doorWidth) / 2);
  const sideX = doorWidth / 2 + sideW / 2;
  const lintelH = Math.max(0.18, sy - doorHeight);
  return [
    wallRecord(house, "front_left_jamb", -sideX, sz / 2, [sideW, doorHeight, thick]),
    wallRecord(house, "front_right_jamb", sideX, sz / 2, [sideW, doorHeight, thick]),
    { ...wallRecord(house, "front_lintel", 0, sz / 2, [sx, lintelH, thick]), liftY: doorHeight },
    wallRecord(house, "back_wall", 0, -sz / 2, [sx, sy, thick]),
    wallRecord(house, "left_wall", -sx / 2, 0, [thick, sy, sz]),
    wallRecord(house, "right_wall", sx / 2, 0, [thick, sy, sz])
  ];
}

function doorCollider(house = {}) {
  if (house.doorOpen === true || house.open === true) return null;
  const sx = num(house.sx, 8);
  const sz = num(house.sz, 6);
  const center = localToWorld(house, 0, sz / 2 + 0.12);
  const width = Math.min(sx * 0.52, Math.max(1.1, num(house.doorWidth, 1.3)));
  const height = Math.min(num(house.sy, 4.2), Math.max(1.8, num(house.doorHeight, 2.15)));
  return {
    type: "door",
    category: "closed-door",
    id: `${house.id || house.name || "house"}_front_door`,
    owner: house.id || house.name,
    x: center.x,
    z: center.z,
    yaw: num(house.yaw),
    size: [width, height, 0.22],
    visibleTwin: true,
    open: false
  };
}

function trunkRecords(instances = {}) {
  return list(instances.trees).slice(0, 96).map((tree, index) => ({
    type: "tree",
    category: "tree-trunk",
    id: tree.id || `tree_trunk_${index}`,
    x: num(tree.x),
    z: num(tree.z),
    radius: Math.max(0.12, num(tree.radius, 0.28)),
    size: [Math.max(0.24, num(tree.radius, 0.28) * 2), Math.max(1.2, num(tree.height, 2.6)), Math.max(0.24, num(tree.radius, 0.28) * 2)],
    visibleTwin: true
  }));
}

function rockRecords(instances = {}) {
  return list(instances.rocks).slice(0, 48).map((rock, index) => ({
    type: "rock",
    category: "rock",
    id: rock.id || `rock_${index}`,
    x: num(rock.x),
    z: num(rock.z),
    yaw: num(rock.yaw),
    size: [num(rock.sx, 1.1), num(rock.sy, 0.65), num(rock.sz, 1.1)],
    visibleTwin: true
  }));
}

function cliffRecords(ecology = {}) {
  return list(ecology.cliffs || ecology.mountains).map((cliff, index) => ({
    type: "cliff",
    category: "cliff-blocker",
    id: cliff.id || `cliff_blocker_${index}`,
    x: num(cliff.x),
    z: num(cliff.z),
    yaw: num(cliff.yaw),
    size: [num(cliff.sx, 16), num(cliff.sy, 18), num(cliff.sz, 4)],
    visibleTwin: true
  }));
}

export function classifyRegionColliders({ houses = [], roads = {}, instances = {}, ecology = {} } = {}) {
  const houseRecords = list(houses).flatMap(houseHardColliders);
  const doorRecords = list(houses).map(doorCollider).filter(Boolean);
  const hard = [
    ...houseRecords,
    ...trunkRecords(instances),
    ...rockRecords(instances),
    ...cliffRecords(ecology)
  ];
  const soft = [
    { type: "tree-trunks", count: count(instances.trees) },
    { type: "large-rocks", count: count(instances.rocks) },
    { type: "cliffs", count: count(ecology.cliffs || ecology.mountains) }
  ];
  const visual = ["grass", "flowers", "moss", "smallRocks", "cloth", "vegetables", "roadSurfaces"];
  return {
    hard,
    doors: doorRecords,
    soft,
    visual,
    roads: Boolean(roads),
    policy: "visible-sourced-grounded-center-colliders-local-bubble"
  };
}

export function colliderClassificationStats(classification = {}) {
  return {
    hard: list(classification.hard).length,
    doors: list(classification.doors).length,
    visualOnly: list(classification.visual).length,
    policy: classification.policy
  };
}

export default {
  classifyRegionColliders,
  colliderClassificationStats
};
