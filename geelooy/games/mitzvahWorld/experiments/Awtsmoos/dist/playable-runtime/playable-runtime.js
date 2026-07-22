import {
  Aabb,
  Bone,
  BufferAttribute,
  BufferGeometry,
  CANONICAL_HOUSES_BY_ID,
  CANONICAL_VILLAGE_PLAN,
  DEFAULT_HOUSE_SPEC,
  DETAIL_TEXTURE_FAMILIES,
  GRASS_URLS,
  Group,
  HOUSE_ARCHITECTURE,
  Mesh,
  MeshStandardMaterial,
  PLAYER_CAPSULE,
  PerspectiveCamera,
  REFERENCE_GOLDEN_HOUR,
  REPEAT_HOOKS,
  ROOT_WORLD_MATRIX,
  Scene,
  TEXTURE_PURPOSES,
  TEXTURE_URLS,
  Vec3,
  add,
  bindMaterialPair,
  canonicalVillageRoadRoutes,
  closestPointsSegmentSegment,
  copyMat4,
  cottageSurfaceStack,
  createHouseFenceSegments,
  createHouseYardPatches,
  createLoftedAnimalGeometry,
  createPrimitiveMesh,
  createTerrainPackage,
  createVillageBoxBatch,
  cross,
  dot,
  floorBottomY,
  floorTopY,
  heightAt,
  houseBasis,
  identity,
  inverse,
  length,
  loadHouseAssets,
  localToWorld,
  mat4FromArray,
  materialTexture,
  multiply,
  negate,
  normalize,
  primitiveColliders,
  projectToPlane,
  rayTriangle,
  referenceLightingBudget,
  resolveHouseSpec,
  scale,
  storyCeilingY,
  sub,
  transformPoint,
  triangleContainsPoint,
  updateCachedWorldMatrix,
  v
} from "./chunks/chunk-DK7VZS62.js";
import {
  VILLAGE_ARRIVAL_PLAYER,
  cachedTextureImage,
  hydrateSceneMaterialImages,
  loadPublicMaterialUrl,
  publicMaterialCacheStats,
  rankedSceneUrls
} from "./chunks/chunk-PERZ7G34.js";

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/SceneMaterialCanonicalizer.js
function canonicalizeSceneMaterials(scene) {
  const identities = /* @__PURE__ */ new WeakMap();
  const canonical = /* @__PURE__ */ new Map();
  const uniqueBefore = /* @__PURE__ */ new Set();
  const uniqueAfter = /* @__PURE__ */ new Set();
  let nextIdentity = 1;
  let assignments = 0;
  let reusedAssignments = 0;
  const identity2 = (value3) => {
    if (!identities.has(value3)) {
      identities.set(value3, nextIdentity);
      nextIdentity += 1;
    }
    return identities.get(value3);
  };
  const signature = (material) => materialSignature(material, identity2);
  scene?.traverse?.((object) => {
    if (!object.material) {
      return;
    }
    const source = Array.isArray(object.material) ? object.material : [object.material];
    const resolved = source.map((material) => {
      assignments += 1;
      uniqueBefore.add(material);
      const key = signature(material);
      const existing = canonical.get(key);
      if (existing) {
        reusedAssignments += Number(existing !== material);
        uniqueAfter.add(existing);
        return existing;
      }
      canonical.set(key, material);
      uniqueAfter.add(material);
      return material;
    });
    object.material = Array.isArray(object.material) ? resolved : resolved[0];
  });
  return Object.freeze({
    assignments,
    reusedAssignments,
    uniqueMaterialsAfter: uniqueAfter.size,
    uniqueMaterialsBefore: uniqueBefore.size
  });
}
function materialSignature(material, identity2) {
  if (!material || typeof material !== "object") {
    return `primitive:${String(material)}`;
  }
  const keys = Object.keys(material).sort();
  const values = keys.map((key) => `${key}:${valueSignature(material[key], identity2)}`);
  return `${material.constructor?.name || "Object"}|${values.join("|")}`;
}
function valueSignature(value3, identity2) {
  if (value3 === null || typeof value3 !== "object") {
    return `${typeof value3}:${String(value3)}`;
  }
  if (Array.isArray(value3)) {
    return `[${value3.map((item2) => valueSignature(item2, identity2)).join(",")}]`;
  }
  if (ArrayBuffer.isView(value3)) {
    return `${value3.constructor.name}:${Array.from(value3).join(",")}`;
  }
  const numericKeys = numericValueKeys(value3);
  if (numericKeys.length) {
    return `${value3.constructor?.name || "Value"}:${numericKeys.map((key) => `${key}=${Number(value3[key])}`).join(",")}`;
  }
  return `identity:${identity2(value3)}`;
}
function numericValueKeys(value3) {
  const candidates2 = ["r", "g", "b", "a", "x", "y", "z", "w"];
  const keys = candidates2.filter((key) => Number.isFinite(value3[key]));
  return keys.length >= 2 ? keys : [];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/performance/WorldQualityProfile.js
var MOBILE_DPR = 1.25;
var DESKTOP_DPR = 1.5;
var PRESERVED_DISTANCE = 520;
var PRESERVED_MODELS = 11;
var PROFILES = Object.freeze({
  low: profile("low", MOBILE_DPR, PRESERVED_DISTANCE, PRESERVED_MODELS, "mobile-crisp"),
  medium: profile("medium", DESKTOP_DPR, PRESERVED_DISTANCE, PRESERVED_MODELS, "desktop-crisp"),
  high: profile("high", DESKTOP_DPR, PRESERVED_DISTANCE, PRESERVED_MODELS, "desktop-crisp"),
  cinematic: profile("cinematic", DESKTOP_DPR, 760, PRESERVED_MODELS, "cinematic-expanded")
});
var VALID_QUALITIES = new Set(Object.keys(PROFILES));
function resolveWorldQuality(options = {}, environment = globalThis) {
  const explicit = explicitQuality(options, environment);
  const selected = explicit || inferredQuality(environment);
  return {
    ...PROFILES[selected],
    explicit: Boolean(explicit),
    reason: explicit ? "explicit-override" : PROFILES[selected].reason
  };
}
function explicitQuality(options, environment) {
  if (VALID_QUALITIES.has(options.quality)) {
    return options.quality;
  }
  const search = options.search ?? environment.location?.search ?? "";
  const query = new URLSearchParams(search).get("quality");
  return VALID_QUALITIES.has(query) ? query : null;
}
function inferredQuality(environment) {
  const navigatorValue = environment.navigator || {};
  const width = Number(environment.innerWidth || 1280);
  const touch = Number(navigatorValue.maxTouchPoints || 0) > 0;
  const memory = Number(navigatorValue.deviceMemory || 8);
  const cores = Number(navigatorValue.hardwareConcurrency || 8);
  return touch || width <= 820 || memory <= 4 || cores <= 4 ? "low" : "medium";
}
function profile(quality, maxDpr, renderDistance2, modelLimit, reason) {
  return Object.freeze({
    maxDpr,
    modelLimit,
    quality,
    reason,
    renderDistance: renderDistance2
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/math/Ray.js
var Ray = class {
  constructor(origin = new Vec3(), direction = new Vec3(0, 0, 1)) {
    this.origin = Vec3.from(origin);
    this.direction = Vec3.from(direction).normalize();
  }
  /** Returns the point reached at one scalar distance. */
  at(distance4) {
    return this.origin.clone().add(
      this.direction.clone().scale(distance4)
    );
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/GroundPlacementSystem.js
function createGroundSampler({ terrainHeightAt, octree = null, top = 96 } = {}) {
  if (typeof terrainHeightAt !== "function") throw new TypeError("terrainHeightAt must be a function");
  const api = {
    terrainHeightAt,
    octree,
    top,
    heightAt(x, z, options = {}) {
      const terrainY = terrainHeightAt(x, z);
      const rayTop = options.top ?? top;
      const hit = octree?.raycast(
        new Ray({ x, y: rayTop, z }, { x: 0, y: -1, z: 0 }),
        options.maxDistance ?? rayTop + 128,
        options.predicate || groundPredicate
      );
      if (hit && Number.isFinite(hit.point?.y) && hit.point.y >= terrainY - 1e-3) {
        return { y: hit.point.y, normal: hit.item.normal, kind: hit.item.kind, source: "octree-raycast", hit };
      }
      return { y: terrainY, normal: terrainNormal(terrainHeightAt, x, z), kind: "terrain", source: "terrain-height", hit: null };
    },
    placeOnGround(localToWorld2, lx, lz, options = {}) {
      const p = localToWorld2(lx, lz);
      const sample2 = api.heightAt(p.x, p.z, options);
      return { x: p.x, y: sample2.y, z: p.z, sample: sample2 };
    },
    samplePath(points, options = {}) {
      return points.map((point3) => ({ ...point3, sample: api.heightAt(point3.x, point3.z, options), y: api.heightAt(point3.x, point3.z, options).y }));
    },
    withOctree(nextOctree) {
      return createGroundSampler({ terrainHeightAt, octree: nextOctree, top });
    },
    stats() {
      return { mode: octree ? "terrain-height/raycast" : "terrain-height-phase-one", hasOctree: !!octree, top };
    }
  };
  return api;
}
function groundPredicate(item2) {
  return !!item2?.solid && (!!item2.floor || item2.normal?.y > 0.24);
}
function terrainNormal(heightAt2, x, z) {
  const e = 0.08;
  return normalize(v(heightAt2(x - e, z) - heightAt2(x + e, z), 2 * e, heightAt2(x, z - e) - heightAt2(x, z + e)));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/DoorFrameUtilities.js
function chooseDoorSwing(hingeLocalX, requestedAngle, panelWidth) {
  const magnitude = Math.abs(finiteNumber(requestedAngle, Math.PI * 0.56));
  const candidates2 = [-1, 1].map((sign) => inspectCandidate(
    hingeLocalX,
    panelWidth,
    sign * magnitude
  ));
  const selected = candidates2.sort((left, right) => right.minimumSweptInwardClearance - left.minimumSweptInwardClearance)[0];
  return Object.freeze({
    sign: Math.sign(selected.openAngle),
    openAngle: selected.openAngle,
    minimumSweptInwardClearance: selected.minimumSweptInwardClearance,
    clearanceScope: "door-wall-plane",
    blockingObjectIds: Object.freeze([]),
    verifiedBy: "sampled-far-edge-wall-plane-sweep"
  });
}
function freezePoint(x, y, z) {
  return Object.freeze({
    x: finiteNumber(x, 0),
    y: finiteNumber(y, 0),
    z: finiteNumber(z, 0)
  });
}
function finiteNumber(value3, fallback) {
  return Number.isFinite(value3) ? value3 : fallback;
}
function inspectCandidate(hingeLocalX, panelWidth, openAngle) {
  const halfWidth = panelWidth / 2;
  const farEdgeLocalX = hingeLocalX < 0 ? halfWidth : -halfWidth;
  const relativeX = farEdgeLocalX - hingeLocalX;
  let minimum = Infinity;
  for (let sample2 = 1; sample2 <= 24; sample2 += 1) {
    const angle = openAngle * sample2 / 24;
    minimum = Math.min(minimum, -Math.sin(angle) * relativeX);
  }
  return {
    openAngle,
    minimumSweptInwardClearance: minimum
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/DoorWorldMatrix.js
function worldMatrixFromYaw(center, yaw) {
  const cosine = Math.cos(yaw);
  const sine = Math.sin(yaw);
  return [
    cosine,
    0,
    sine,
    0,
    0,
    1,
    0,
    0,
    -sine,
    0,
    cosine,
    0,
    center.x,
    center.y,
    center.z,
    1
  ];
}
function matrixBasis(matrix) {
  return {
    tangent: normalize2({ x: matrix[0], y: matrix[1], z: matrix[2] }),
    up: normalize2({ x: matrix[4], y: matrix[5], z: matrix[6] }),
    normal: normalize2({ x: matrix[8], y: matrix[9], z: matrix[10] }),
    center: { x: matrix[12], y: matrix[13], z: matrix[14] }
  };
}
function matrixMaximumDelta(left, right) {
  let maximum = 0;
  for (let index = 0; index < 16; index += 1) {
    maximum = Math.max(maximum, Math.abs((left?.[index] || 0) - (right?.[index] || 0)));
  }
  return maximum;
}
function vectorAngle(left, right) {
  const a = normalize2(left);
  const b = normalize2(right);
  const value3 = Math.max(-1, Math.min(1, dot2(a, b)));
  return Math.acos(value3);
}
function dot2(left, right) {
  return left.x * right.x + left.y * right.y + left.z * right.z;
}
function normalize2(vector3) {
  const length2 = Math.hypot(vector3.x, vector3.y, vector3.z) || 1;
  return {
    x: vector3.x / length2,
    y: vector3.y / length2,
    z: vector3.z / length2
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/HouseDoorLegacyAliases.js
function withDoorFrameAliases(frame) {
  return {
    ...frame,
    x: frame.center.x,
    z: frame.center.z,
    floorY: frame.center.y,
    openingBottomY: frame.opening.bottomY,
    wallW: frame.wall.width,
    wallH: frame.wall.height,
    wallT: frame.wall.thickness,
    doorW: frame.opening.width,
    doorH: frame.opening.height,
    doorThickness: frame.panel.thickness,
    panelGap: frame.opening.width - frame.panel.width,
    doorDepth: frame.panel.closedDepth,
    hingeSide: frame.hinge.side,
    rightJambLocalX: frame.entry.rightJambLocalX
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/HouseDoorGeometry.js
function normalizeDoorFrame(specification = {}) {
  if (specification.closedWorldMatrix && specification.panel && specification.opening) {
    return specification;
  }
  const yaw = snapAngle(finiteNumber(specification.yaw, 0));
  const basis = houseBasis(yaw);
  const openingWidth = finiteNumber(specification.doorW, finiteNumber(specification.width, 2.4));
  const openingHeight = finiteNumber(specification.doorH, finiteNumber(specification.height, 2.7));
  const panelGap = finiteNumber(specification.panelGap, 0.1);
  const panelWidth = openingWidth - panelGap;
  const panelHeight = openingHeight - panelGap;
  const floorY = finiteNumber(specification.floorY, 0);
  const openingBottomY = finiteNumber(specification.openingBottomY, floorY);
  const closedDepth = finiteNumber(specification.doorDepth, finiteNumber(specification.depth, 0));
  const center = freezePoint(specification.x ?? specification.position?.x, floorY, specification.z ?? specification.position?.z);
  const hingeSide = specification.hingeSide || "entry-right";
  const hingeLocalX = hingeSide === "entry-right" ? panelWidth / 2 : -panelWidth / 2;
  const hingePoint = framePoint({ center, basis }, hingeLocalX, closedDepth);
  const closedPoint = framePoint({ center, basis }, 0, closedDepth);
  const closedCenter = freezePoint(closedPoint.x, openingBottomY + panelHeight / 2, closedPoint.z);
  const swing = chooseDoorSwing(hingeLocalX, specification.openAngle, panelWidth);
  const frame = {
    id: specification.id || specification.doorId || "Awtsmoos-door-frame",
    houseId: specification.houseId || null,
    wallId: specification.wallId || `${specification.id || "Awtsmoos"}-doorway-wall`,
    doorId: specification.doorId || specification.id || "Awtsmoos-hinged-door",
    center,
    yaw,
    basis,
    wall: Object.freeze({
      width: finiteNumber(specification.wallW, 8),
      height: finiteNumber(specification.wallH, 3.5),
      thickness: finiteNumber(specification.wallT, 0.55)
    }),
    opening: Object.freeze({
      width: openingWidth,
      height: openingHeight,
      bottomY: openingBottomY,
      topY: openingBottomY + openingHeight
    }),
    panel: Object.freeze({
      width: panelWidth,
      height: panelHeight,
      thickness: finiteNumber(specification.doorThickness, finiteNumber(specification.thickness, 0.22)),
      closedDepth,
      closedYaw: yaw,
      closedCenter
    }),
    hinge: Object.freeze({
      side: hingeSide,
      localX: hingeLocalX,
      worldPosition: freezePoint(hingePoint.x, openingBottomY, hingePoint.z)
    }),
    entry: Object.freeze({
      outsideDirection: basis.outward,
      insideDirection: basis.inward,
      right: basis.entryRight,
      rightJambLocalX: openingWidth / 2,
      acrossYaw: yaw - Math.PI / 2
    }),
    swing,
    openAngle: swing.openAngle,
    closedWorldMatrix: Object.freeze(worldMatrixFromYaw(closedCenter, yaw)),
    noEdge: !!specification.noEdge,
    wallColor: specification.wallColor || "#ddd3c6",
    doorColor: specification.doorColor || specification.color || "#8a5228"
  };
  return Object.freeze(withDoorFrameAliases(frame));
}
function framePoint(frame, localX, inwardDepth) {
  return {
    x: frame.center.x + frame.basis.right.x * localX + frame.basis.inward.x * inwardDepth,
    z: frame.center.z + frame.basis.right.z * localX + frame.basis.inward.z * inwardDepth
  };
}
function doorHingeWorld(specification) {
  return normalizeDoorFrame(specification).hinge.worldPosition;
}
function snapAngle(value3) {
  const quarterTurn = Math.PI / 2;
  const nearest = Math.round(value3 / quarterTurn) * quarterTurn;
  return Math.abs(value3 - nearest) < 1e-8 ? nearest : value3;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/DoorWallSystem.js
function createDoorWallSet(specification, material = {}) {
  const frame = normalizeDoorFrame(specification);
  return {
    wall: createDoorWallDefinition(frame, material),
    door: createDoorDefinition(frame, material.doorMaterial || {}),
    spec: frame
  };
}
function createDoorWallDefinition(frame, material) {
  return {
    id: frame.wallId,
    shape: "doorway",
    solid: true,
    walkable: false,
    noEdge: frame.noEdge,
    ...texture(material, frame.wallColor),
    position: {
      x: frame.center.x,
      y: frame.opening.bottomY + frame.wall.height / 2,
      z: frame.center.z
    },
    size: {
      x: frame.wall.width,
      y: frame.wall.height,
      z: frame.wall.thickness
    },
    door: {
      x: frame.opening.width,
      y: frame.opening.height
    },
    yaw: frame.yaw,
    rotation: { y: frame.yaw },
    userData: {
      AwtsmoosDoorFrame: frame,
      booleanOperation: "difference",
      booleanSource: "awtsmoos-procedural-core-csg"
    }
  };
}
function createDoorDefinition(frame, material) {
  return {
    id: frame.doorId,
    frame,
    position: { ...frame.center, y: 0 },
    yaw: frame.panel.closedYaw,
    closedYaw: frame.panel.closedYaw,
    wallYaw: frame.yaw,
    width: frame.panel.width,
    height: frame.panel.height,
    thickness: frame.panel.thickness,
    centerY: frame.opening.bottomY + frame.panel.height / 2,
    depth: frame.panel.closedDepth,
    openAngle: frame.openAngle,
    hingeSide: frame.hinge.side,
    hinge: frame.hinge,
    entry: frame.entry,
    opening: {
      width: frame.opening.width,
      height: frame.opening.height,
      wall: frame.wallId
    },
    ...texture(material, frame.doorColor),
    userData: {
      AwtsmoosDoorFrame: frame,
      closedYawSource: "owning-wall-frame"
    }
  };
}
function texture(material, fallbackColor) {
  return {
    color: material.color || fallbackColor,
    mapImage: material.mapImage || null,
    textureUrl: material.textureUrl || material.mapImage?.dataset?.url || material.mapImage?.src || null,
    mapRepeat: material.mapRepeat || [1, 1],
    anisotropy: material.anisotropy ?? 2,
    backfaceCull: material.backfaceCull,
    texturePolicy: material.texturePolicy || null
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/MezuzaPlacement.js
var UPPER_THIRD_START = 2 / 3;
var SLANT_TOWARD_ROOM_RADIANS = 0.13;
function sourceFacePlacement(frame, dimensions) {
  const revealInset = 0.018;
  const exteriorInset = 0.035;
  const localX = frame.entry.rightJambLocalX - dimensions.depth / 2 - revealInset;
  const sourceDepth = -(frame.wall.thickness / 2) + dimensions.width / 2 + exteriorInset;
  const point3 = framePoint(frame, localX, sourceDepth);
  return {
    localX,
    sourceDepth,
    jambFace: "entry-right-exterior-reveal-cavity",
    worldPosition: {
      x: point3.x,
      y: upperThirdY(frame, dimensions),
      z: point3.z
    },
    rotation: {
      y: frame.yaw,
      z: SLANT_TOWARD_ROOM_RADIANS
    }
  };
}
function signedEntryMeasurements(frame, placement) {
  const delta = {
    x: placement.worldPosition.x - frame.center.x,
    y: 0,
    z: placement.worldPosition.z - frame.center.z
  };
  return {
    rightDot: dot3(delta, frame.entry.right),
    sourceDot: dot3(delta, frame.basis.outward),
    cavityDepthDot: dot3(delta, frame.basis.inward),
    facingDot: dot3(frame.basis.outward, frame.entry.outsideDirection),
    upperThirdRatio: (placement.worldPosition.y - frame.opening.bottomY) / frame.opening.height,
    hingeIsEntryRight: frame.hinge.side === "entry-right"
  };
}
function upperThirdY(frame, dimensions) {
  const lower = frame.opening.bottomY + frame.opening.height * UPPER_THIRD_START;
  const centerOffset = Math.min(dimensions.height * 0.18, frame.opening.height * 0.035);
  return lower + centerOffset;
}
function dot3(left, right) {
  return left.x * right.x + left.y * right.y + left.z * right.z;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/MezuzaSystem.js
function createMezuzaDef(specification, material = {}, context = {}) {
  const frame = normalizeDoorFrame(specification);
  const dimensions = {
    width: Math.min(0.16, frame.wall.thickness * 0.3),
    height: Math.min(0.82, frame.opening.height * 0.24),
    depth: 0.07
  };
  const placement = sourceFacePlacement(frame, dimensions);
  const measurements = signedEntryMeasurements(frame, placement);
  const evidence = createEvidence(frame, placement, measurements, context);
  return {
    id: evidence.id,
    shape: "box",
    solid: false,
    walkable: false,
    noEdge: true,
    color: material.color || "#c88924",
    mapImage: material.mapImage || null,
    textureUrl: material.textureUrl || TEXTURE_PURPOSES.mezuzaCase,
    mapRepeat: [1, 2],
    position: placement.worldPosition,
    size: {
      x: dimensions.depth,
      y: dimensions.height,
      z: dimensions.width
    },
    rotation: placement.rotation,
    texturePolicy: {
      publicFirebase: true,
      role: "mezuza-case-on-right-doorpost",
      parchmentUrl: TEXTURE_PURPOSES.mezuzaScroll
    },
    userData: { AwtsmoosMezuza: evidence }
  };
}
function createEvidence(frame, placement, measurements, context) {
  return {
    id: `${frame.doorId}-mezuza`,
    doorId: frame.doorId,
    wallId: frame.wallId,
    houseId: frame.houseId,
    doorwayKind: context.doorwayKind || "exterior",
    sourceRoomId: context.sourceRoomId || "outside",
    targetRoomId: context.targetRoomId || frame.houseId,
    entrySide: "right",
    enteringDirection: frame.basis.inward,
    enteringRight: frame.entry.right,
    wallFaceDirection: frame.basis.outward,
    jambFace: placement.jambFace,
    localPosition: {
      x: placement.localX,
      y: placement.worldPosition.y - frame.opening.bottomY,
      z: placement.sourceDepth
    },
    worldPosition: placement.worldPosition,
    position: {
      x: placement.worldPosition.x,
      z: placement.worldPosition.z
    },
    slantRadians: placement.rotation.z,
    dotFromOpeningCenter: measurements.rightDot,
    sourceFaceDot: measurements.sourceDot,
    cavityDepthDot: measurements.cavityDepthDot,
    facingDot: measurements.facingDot,
    upperThirdRatio: measurements.upperThirdRatio,
    hingeIsEntryRight: measurements.hingeIsEntryRight,
    placement: "outside-right-doorpost-upper-third-reveal-cavity",
    facing: "visible-from-source-outside-entering-room",
    verifiedBy: "entry-right-upper-third-source-face-and-cavity-depth"
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/InteriorRoomSystem.js
function createInteriorRoomSet({ spec: spec2, materials }) {
  const staticDefs = [];
  const doorDefs = [];
  const mezuzaDefs = [];
  const debug = [];
  for (let level = 0; level < spec2.floors; level += 1) {
    const floorY = floorTopY(spec2, level);
    const ceilingY = storyCeilingY(spec2, level);
    const partition = createPartition(spec2, materials, level, floorY, ceilingY);
    staticDefs.push(partition.wall, partition.mezuza);
    doorDefs.push(partition.door);
    mezuzaDefs.push(partition.mezuza);
    debug.push(partition.debug);
  }
  return { staticDefs, doorDefs, mezuzaDefs, debug };
}
function createPartition(spec2, materials, level, floorY, ceilingY) {
  const interiorDepth = spec2.depth - spec2.wallT * 2;
  const interiorWidth = spec2.width - spec2.wallT * 2;
  const localX = interiorWidth * 0.17;
  const point3 = localToWorld(spec2, localX, 0);
  const height = ceilingY - floorY;
  const sourceRoomId = `${spec2.id}-story-${level + 1}-original-room`;
  const targetRoomId = `${spec2.id}-story-${level + 1}-inner-room`;
  const set = createDoorWallSet({
    id: `${spec2.id}-partition-${level + 1}`,
    houseId: spec2.id,
    wallId: `${spec2.id}-partition-${level + 1}-wall`,
    doorId: `${spec2.id}-partition-${level + 1}-door`,
    x: point3.x,
    z: point3.z,
    floorY,
    openingBottomY: floorY,
    yaw: spec2.yaw + Math.PI / 2,
    wallW: interiorDepth,
    wallH: height,
    wallT: Math.max(0.48, spec2.wallT * 0.65),
    doorW: Math.max(2.6, spec2.doorW * 0.88),
    doorH: spec2.doorH,
    doorThickness: 0.2,
    openAngle: -Math.PI * 0.5,
    noEdge: true
  }, {
    ...materials.wall,
    doorMaterial: materials.door
  });
  const mezuza = createMezuzaDef(set.spec, materials.mezuza, {
    doorwayKind: "interior",
    sourceRoomId,
    targetRoomId
  });
  return {
    ...set,
    mezuza,
    debug: partitionDebug(set, height, interiorDepth, sourceRoomId, targetRoomId)
  };
}
function partitionDebug(set, height, interiorDepth, sourceRoomId, targetRoomId) {
  return {
    id: set.wall.id,
    axis: "depth",
    fullSpan: interiorDepth,
    actualWidth: set.wall.size.x,
    actualHeight: height,
    doorOpening: set.wall.door,
    sourceRoomId,
    targetRoomId,
    mezuzaId: `${set.door.id}-mezuza`,
    touchesLeftBoundary: true,
    touchesRightBoundary: true,
    touchesCeiling: true
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/house/HouseBox.js
function createHouseBox({
  id,
  material,
  spec: spec2,
  localX = 0,
  y,
  localZ = 0,
  sizeX,
  sizeY,
  sizeZ,
  walkable = false,
  visible = true,
  userData = {}
}) {
  const point3 = localToWorld(spec2, localX, localZ);
  return {
    id,
    shape: "box",
    solid: true,
    walkable,
    visible,
    noEdge: true,
    ...material,
    position: { x: point3.x, y, z: point3.z },
    size: { x: sizeX, y: sizeY, z: sizeZ },
    rotation: { y: spec2.yaw },
    userData
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/house/HouseEntrySystem.js
function createHouseEntry(spec2, materials, sampler) {
  const wallPoint = localToWorld(spec2, 0, spec2.depth / 2 - spec2.wallT / 2);
  const frameInput = {
    id: `${spec2.id}-front`,
    houseId: spec2.id,
    wallId: `${spec2.id}-front-wall`,
    doorId: `${spec2.id}-front-door`,
    x: wallPoint.x,
    z: wallPoint.z,
    floorY: spec2.floorY,
    openingBottomY: floorTopY(spec2, 0),
    yaw: spec2.yaw,
    wallW: spec2.width,
    wallH: spec2.wallH,
    wallT: spec2.wallT,
    doorW: spec2.doorW,
    doorH: spec2.doorH,
    doorThickness: 0.24,
    panelGap: 0.08,
    openAngle: -Math.PI * 0.54,
    noEdge: true
  };
  const set = createDoorWallSet(frameInput, {
    ...materials.wall,
    doorMaterial: materials.door
  });
  return {
    ...set,
    mezuza: createMezuzaDef(set.spec, materials.mezuza),
    steps: createEntrySteps(spec2, materials.stone, sampler),
    anchors: entryAnchors(spec2)
  };
}
function entryAnchors(spec2) {
  return {
    door: localToWorld(spec2, 0, spec2.depth / 2 + 0.8),
    landing: localToWorld(spec2, 0, spec2.depth / 2 + 4.1),
    gate: localToWorld(spec2, 0, spec2.depth / 2 + 8.2),
    outward: spec2.yaw
  };
}
function createEntrySteps(spec2, material, sampler) {
  if (!sampler) {
    return [];
  }
  const targetY = floorTopY(spec2, 0);
  const baseZ = spec2.depth / 2 + 6.2;
  const base = sample(spec2, sampler, baseZ);
  const count = Math.max(3, Math.min(10, Math.ceil(Math.max(0.2, targetY - base.y) / 0.24)));
  const definitions = [];
  for (let index = 0; index < count; index += 1) {
    const progress = index / Math.max(1, count - 1);
    const localZ = baseZ - index * 0.72;
    const ground = sample(spec2, sampler, localZ);
    const topY = ground.y + (targetY - ground.y) * progress;
    definitions.push(step(spec2, material, index, localZ, topY));
  }
  definitions.push(createHouseBox({
    id: `${spec2.id}-door-landing`,
    material,
    spec: spec2,
    y: targetY - 0.1,
    localZ: spec2.depth / 2 + 1,
    sizeX: spec2.doorW + 4.4,
    sizeY: 0.2,
    sizeZ: 2.4,
    walkable: true
  }));
  return definitions;
}
function step(spec2, material, index, localZ, topY) {
  return createHouseBox({
    id: `${spec2.id}-entry-step-${index + 1}`,
    material,
    spec: spec2,
    y: topY - 0.12,
    localZ,
    sizeX: spec2.doorW + 3.6,
    sizeY: 0.24,
    sizeZ: 0.76,
    walkable: true
  });
}
function sample(spec2, sampler, localZ) {
  const point3 = localToWorld(spec2, 0, localZ);
  return sampler.heightAt(point3.x, point3.z);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/grass/YardGrassGeometry.js
var TAU = Math.PI * 2;
function createYardGrassDefinition(spec2, patches, groundSampler) {
  const mesh = { vertices: [], faces: [], uvs: [] };
  const tuftCount = Math.max(150, Math.round((spec2.width + spec2.depth) * 2.25));
  let flowerCount = 0;
  let bladeCount = 0;
  for (let index = 0; index < tuftCount; index += 1) {
    const patch = patches[index % patches.length];
    const localX = mix(patch.minX, patch.maxX, random(index, 17));
    const localZ = mix(patch.minZ, patch.maxZ, random(index, 31));
    const world = localToWorld(spec2, localX, localZ);
    const groundY = groundSampler.heightAt(world.x, world.z).y + 0.018;
    const tuft = createTuft(index, world.x, groundY, world.z);
    for (const blade of tuft.blades) {
      appendBlade(mesh, blade);
      bladeCount += 1;
    }
    if (tuft.flower) {
      appendFlower(mesh, tuft.flower);
      flowerCount += 1;
    }
  }
  return {
    id: `${spec2.id}-dynamic-yard-grass`,
    shape: "manual",
    solid: false,
    walkable: false,
    noEdge: true,
    color: "#68ba3f",
    doubleSided: true,
    position: { x: 0, y: 0, z: 0 },
    rotation: { y: 0 },
    vertices: mesh.vertices,
    faces: mesh.faces,
    uvs: mesh.uvs,
    grassReactive: true,
    grassInteractionRadius: 2.65,
    grassWindStrength: 0.12,
    userData: {
      AwtsmoosYardGrass: {
        houseId: spec2.id,
        patches,
        tuftCount,
        bladeCount,
        flowerCount,
        seed: `${spec2.id}-613-yard-life`,
        source: "merged-curved-cross-blade-flower-head-generator",
        reactsToPlayer: true,
        insideFenceOnly: true,
        performance: "one-manual-mesh-per-yard-no-collider"
      }
    }
  };
}
function createTuft(index, x, y, z) {
  const blades = [];
  const count = 4 + Math.floor(random(index, 131) * 3);
  const baseHeight = 0.32 + random(index, 53) * 0.62;
  const baseWidth = 0.028 + random(index, 71) * 0.032;
  const yaw = random(index, 101) * TAU;
  for (let blade = 0; blade < count; blade += 1) {
    const turn = yaw + blade * TAU / count + random(index + blade, 197) * 0.38;
    const lean = 0.035 + random(index + blade, 211) * 0.11;
    blades.push({
      x,
      y,
      z,
      height: baseHeight * (0.72 + random(index + blade, 89) * 0.42),
      width: baseWidth * (0.75 + random(index + blade, 97) * 0.55),
      yaw: turn,
      lean
    });
  }
  return {
    blades,
    flower: random(index, 307) > 0.82 ? {
      x,
      y: y + baseHeight * 0.92,
      z,
      radius: 0.035 + random(index, 313) * 0.025,
      yaw
    } : null
  };
}
function appendBlade(mesh, blade) {
  const cosine = Math.cos(blade.yaw);
  const sine = Math.sin(blade.yaw);
  const side = { x: cosine * blade.width, z: sine * blade.width };
  const forward = { x: -sine * blade.lean, z: cosine * blade.lean };
  const waistY = blade.y + blade.height * 0.52;
  const tipY = blade.y + blade.height;
  const rootLeft = [blade.x - side.x, blade.y, blade.z - side.z];
  const rootRight = [blade.x + side.x, blade.y, blade.z + side.z];
  const waistRight = [blade.x + side.x * 0.58 + forward.x * 0.45, waistY, blade.z + side.z * 0.58 + forward.z * 0.45];
  const waistLeft = [blade.x - side.x * 0.58 + forward.x * 0.35, waistY, blade.z - side.z * 0.58 + forward.z * 0.35];
  const tip = [blade.x + forward.x, tipY, blade.z + forward.z];
  const start = mesh.vertices.length;
  mesh.vertices.push(rootLeft, rootRight, waistRight, waistLeft, tip);
  mesh.faces.push([start, start + 1, start + 2, start + 3]);
  mesh.faces.push([start + 3, start + 2, start + 4]);
  mesh.uvs.push(0, 0, 1, 0, 0.82, 0.62, 0.18, 0.62, 0.5, 1);
}
function appendFlower(mesh, flower) {
  const start = mesh.vertices.length;
  mesh.vertices.push(
    [flower.x, flower.y + flower.radius, flower.z],
    [flower.x + Math.cos(flower.yaw) * flower.radius, flower.y, flower.z + Math.sin(flower.yaw) * flower.radius],
    [flower.x - Math.sin(flower.yaw) * flower.radius, flower.y, flower.z + Math.cos(flower.yaw) * flower.radius],
    [flower.x - Math.cos(flower.yaw) * flower.radius, flower.y, flower.z - Math.sin(flower.yaw) * flower.radius],
    [flower.x + Math.sin(flower.yaw) * flower.radius, flower.y, flower.z - Math.cos(flower.yaw) * flower.radius]
  );
  mesh.faces.push([start, start + 1, start + 2]);
  mesh.faces.push([start, start + 2, start + 3]);
  mesh.faces.push([start, start + 3, start + 4]);
  mesh.faces.push([start, start + 4, start + 1]);
  mesh.uvs.push(0.5, 1, 1, 0.5, 0.5, 0, 0, 0.5, 0.5, 0.5);
}
function random(index, seed) {
  const value3 = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return value3 - Math.floor(value3);
}
function mix(start, end, amount) {
  return start + (end - start) * amount;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/ProceduralFenceSystem.js
function createFenceAlongPath({ id, path, segments, groundSampler, postSpacing = 4, height = 1.45, railCount = 3, material = {} }) {
  if (!groundSampler?.heightAt) throw new TypeError("groundSampler is required");
  const sourceSegments = segments || closedSegments(path || []);
  const vertices = [], faces = [], uvs = [], allPosts = [], postSize = 0.24, railSize = 0.14;
  sourceSegments.forEach((segment, index) => {
    const posts = resampleOpenSegment(segment, postSpacing).map((point3) => {
      const sample2 = groundSampler.heightAt(point3.x, point3.z);
      return { ...point3, groundY: sample2.y, sample: sample2, segment: index };
    });
    allPosts.push(...posts);
    for (const post of posts) addBox(vertices, faces, uvs, post.x, post.groundY + height / 2, post.z, postSize, height, postSize);
    for (let i = 0; i < posts.length - 1; i++) {
      const a = posts[i], b = posts[i + 1];
      for (let rail = 1; rail <= railCount; rail++) addRail(vertices, faces, uvs, a, b, height * rail / (railCount + 1), railSize);
    }
  });
  return [{
    id,
    shape: "manual",
    solid: true,
    walkable: false,
    noEdge: true,
    ...material,
    position: { x: 0, y: 0, z: 0 },
    rotation: { y: 0 },
    vertices,
    faces,
    uvs,
    userData: { AwtsmoosFence: { posts: allPosts.length, segments: sourceSegments.length, railCount, collisionMode: "raw-merged-fence-octree", hasGate: !!segments, groundSources: [...new Set(allPosts.map((p) => p.sample.source))] } }
  }];
}
function closedSegments(path) {
  const out = [];
  for (let i = 0; i < path.length; i++) out.push([path[i], path[(i + 1) % path.length]]);
  return out;
}
function resampleOpenSegment(segment, spacing) {
  const [a, b] = segment, length2 = Math.hypot(b.x - a.x, b.z - a.z), count = Math.max(1, Math.ceil(length2 / spacing)), out = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    out.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
  }
  return out;
}
function addRail(vertices, faces, uvs, a, b, aboveGround, size) {
  const dx = b.x - a.x, dz = b.z - a.z, length2 = Math.hypot(dx, dz), yaw = Math.atan2(dx, dz);
  const x = (a.x + b.x) / 2, z = (a.z + b.z) / 2, y = (a.groundY + aboveGround + (b.groundY + aboveGround)) / 2;
  addBox(vertices, faces, uvs, x, y, z, size, size, length2 + 0.08, yaw);
}
function addBox(vertices, faces, uvs, x, y, z, sx, sy, sz, yaw = 0) {
  const hx = sx / 2, hy = sy / 2, hz = sz / 2, c = Math.cos(yaw), s = Math.sin(yaw);
  const rotate = ([px, py, pz]) => [x + px * c + pz * s, y + py, z - px * s + pz * c];
  const sides = [
    [[-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz]],
    [[hx, -hy, -hz], [-hx, -hy, -hz], [-hx, hy, -hz], [hx, hy, -hz]],
    [[-hx, -hy, -hz], [-hx, -hy, hz], [-hx, hy, hz], [-hx, hy, -hz]],
    [[hx, -hy, hz], [hx, -hy, -hz], [hx, hy, -hz], [hx, hy, hz]],
    [[-hx, hy, hz], [hx, hy, hz], [hx, hy, -hz], [-hx, hy, -hz]],
    [[-hx, -hy, -hz], [hx, -hy, -hz], [hx, -hy, hz], [-hx, -hy, hz]]
  ];
  for (const side of sides) addFace(vertices, faces, uvs, side.map(rotate));
}
function addFace(vertices, faces, uvs, points) {
  const offset = vertices.length;
  vertices.push(...points);
  faces.push([offset, offset + 1, offset + 2, offset + 3]);
  const edgeA = Math.hypot(points[1][0] - points[0][0], points[1][1] - points[0][1], points[1][2] - points[0][2]);
  const edgeB = Math.hypot(points[3][0] - points[0][0], points[3][1] - points[0][1], points[3][2] - points[0][2]);
  uvs.push(0, 0, edgeA / 2, 0, edgeA / 2, edgeB / 2, 0, edgeB / 2);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/house/HouseStairSystem.js
var STAIR_RULES = Object.freeze({
  maxRise: 0.24,
  treadDepth: 0.72,
  minimumWidth: 2.8,
  wallClearance: 0.7,
  headroomExtra: 0.8
});
function planHouseStaircase(spec2, fromLevel, toLevel) {
  const fromY = floorTopY(spec2, fromLevel);
  const toY = floorTopY(spec2, toLevel);
  const totalRise = toY - fromY;
  const stepCount = Math.ceil(totalRise / STAIR_RULES.maxRise);
  const stepRise = totalRise / stepCount;
  const treadDepth = Math.max(PLAYER_CAPSULE.radius * 1.7, STAIR_RULES.treadDepth);
  const width = Math.max(PLAYER_CAPSULE.radius * 6, STAIR_RULES.minimumWidth);
  const run = stepCount * treadDepth;
  const headroom = PLAYER_CAPSULE.height + STAIR_RULES.headroomExtra;
  const openingSteps = Math.ceil(headroom / stepRise) + 2;
  const openingDepth = openingSteps * treadDepth + PLAYER_CAPSULE.radius * 2;
  const interiorWidth = spec2.width - spec2.wallT * 2;
  const interiorDepth = spec2.depth - spec2.wallT * 2;
  const centerX = clamp(-interiorWidth * 0.22, -interiorWidth / 2 + width, interiorWidth / 2 - width);
  const zMin = -interiorDepth / 2 + STAIR_RULES.wallClearance;
  const zMax = zMin + openingDepth;
  const finalStepZ = zMin + treadDepth / 2;
  const firstStepZ = finalStepZ + (stepCount - 1) * treadDepth;
  const lowerLandingDepth = Math.max(PLAYER_CAPSULE.radius * 3.5, 1.5);
  const lowerLandingCenterZ = firstStepZ + treadDepth / 2 + lowerLandingDepth / 2;
  const steps = Array.from({ length: stepCount }, (_, index) => Object.freeze({
    index,
    centerX,
    centerZ: firstStepZ - index * treadDepth,
    topY: fromY + (index + 1) * stepRise,
    width,
    depth: treadDepth
  }));
  return Object.freeze({
    id: `${spec2.id}-stairs-${fromLevel + 1}-${toLevel + 1}`,
    houseId: spec2.id,
    fromLevel,
    toLevel,
    fromY,
    toY,
    totalRise,
    run,
    stepCount,
    stepRise,
    treadDepth,
    width,
    headroom,
    lowerLanding: Object.freeze({
      centerX,
      centerZ: lowerLandingCenterZ,
      width,
      depth: lowerLandingDepth,
      topY: fromY
    }),
    opening: Object.freeze({
      centerX,
      centerZ: (zMin + zMax) / 2,
      width: width + PLAYER_CAPSULE.radius * 2 + 0.24,
      depth: openingDepth,
      xMin: centerX - width / 2 - PLAYER_CAPSULE.radius - 0.12,
      xMax: centerX + width / 2 + PLAYER_CAPSULE.radius + 0.12,
      zMin,
      zMax
    }),
    steps: Object.freeze(steps)
  });
}
function staircaseStats(layout) {
  const faceCount = layout.stepCount * 4 + 6;
  return {
    id: layout.id,
    houseId: layout.houseId,
    totalSteps: layout.stepCount,
    landings: 1,
    octreeSteps: layout.stepCount,
    openings: 1,
    maxRise: layout.stepRise,
    minTreadDepth: layout.treadDepth,
    approachClearance: layout.lowerLanding.depth,
    opening: layout.opening,
    visibleTriangleCount: faceCount * 2,
    collisionTriangleCount: faceCount * 2,
    internalCollisionFaces: 0,
    collisionModel: "visible-watertight-sawtooth-solid",
    visibleEqualsCollision: true,
    capsuleFits: layout.opening.width > PLAYER_CAPSULE.radius * 2 && layout.headroom > PLAYER_CAPSULE.height
  };
}
function clamp(value3, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value3));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/StoryFloorSystem.js
function stairwellOpening(specification, level) {
  return planHouseStaircase(specification, level - 1, level).opening;
}
function createStoryFloorPieces({ spec: spec2, material, level }) {
  const width = spec2.width - spec2.wallT * 2;
  const depth = spec2.depth - spec2.wallT * 2;
  const opening = stairwellOpening(spec2, level);
  const y = floorBottomY(spec2, level) + spec2.floorThickness / 2;
  return floorBands({ spec: spec2, material, level, width, depth, opening, y }).filter((definition) => definition.size.x > 0.08 && definition.size.z > 0.08);
}
function floorBands({ spec: spec2, material, level, width, depth, opening, y }) {
  const leftWidth = opening.xMin + width / 2;
  const rightWidth = width / 2 - opening.xMax;
  const frontDepth = depth / 2 - opening.zMax;
  const backDepth = opening.zMin + depth / 2;
  return [
    piece(spec2, material, level, "left", -width / 2 + leftWidth / 2, 0, leftWidth, depth, y),
    piece(spec2, material, level, "right", opening.xMax + rightWidth / 2, 0, rightWidth, depth, y),
    piece(spec2, material, level, "front", opening.centerX, opening.zMax + frontDepth / 2, opening.width, frontDepth, y),
    piece(spec2, material, level, "back", opening.centerX, -depth / 2 + backDepth / 2, opening.width, backDepth, y)
  ];
}
function piece(spec2, material, level, suffix, localX, localZ, sizeX, sizeZ, y) {
  return createHouseBox({
    id: `${spec2.id}-story-${level + 1}-${suffix}`,
    material,
    spec: spec2,
    localX,
    y,
    localZ,
    sizeX,
    sizeY: spec2.floorThickness,
    sizeZ,
    walkable: true,
    userData: { AwtsmoosFloorOpeningLevel: level }
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/visibility/HouseVisibilityMetadata.js
function tagHouseInteriorDefinitions(definitions, houseId, source) {
  return definitions.map((definition) => ({
    ...definition,
    userData: {
      ...definition.userData || {},
      AwtsmoosVisibility: {
        houseId,
        domain: "interior",
        source
      }
    }
  }));
}
function houseVisibilityMetadata(object) {
  return object?.userData?.AwtsmoosVisibility || null;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/house/HouseRoofSystem.js
function createHouseRoof(spec2, material) {
  const outerWidth = spec2.width / 2 + spec2.roofOver;
  const outerDepth = spec2.depth / 2 + spec2.roofOver;
  const thickness = 0.32;
  const baseY = spec2.floorY + spec2.wallH;
  const outerPeak = [0, baseY + spec2.roofRise, 0];
  const innerPeak = [0, baseY + spec2.roofRise - thickness, 0];
  const outer = corners(outerWidth, outerDepth, baseY);
  const inner = corners(
    Math.max(0.2, outerWidth - thickness),
    Math.max(0.2, outerDepth - thickness),
    baseY - thickness
  );
  const mesh = { vertices: [], faces: [], uvs: [] };
  for (let side = 0; side < 4; side += 1) {
    const next = (side + 1) % 4;
    triangle(mesh, outer[side], outer[next], outerPeak);
    triangle(mesh, inner[next], inner[side], innerPeak);
    quad(mesh, outer[side], inner[side], inner[next], outer[next]);
  }
  return {
    id: `${spec2.id}-solid-hip-roof`,
    shape: "manual",
    solid: true,
    walkable: false,
    noEdge: true,
    ...material,
    doubleSided: true,
    position: { x: spec2.x, y: 0, z: spec2.z },
    rotation: { y: spec2.yaw },
    vertices: mesh.vertices,
    faces: mesh.faces,
    uvs: mesh.uvs,
    userData: {
      AwtsmoosRoof: {
        shape: "watertight-hip-solid",
        outerTriangles: 4,
        undersideTriangles: 4,
        fasciaFaces: 4,
        closed: true,
        undersideVisible: true,
        thickness
      }
    }
  };
}
function corners(width, depth, y) {
  return [
    [-width, y, depth],
    [width, y, depth],
    [width, y, -depth],
    [-width, y, -depth]
  ];
}
function triangle(mesh, first, second, third) {
  const start = mesh.vertices.length;
  mesh.vertices.push(first, second, third);
  mesh.faces.push([start, start + 1, start + 2]);
  mesh.uvs.push(...uv(first), ...uv(second), ...uv(third));
}
function quad(mesh, first, second, third, fourth) {
  const start = mesh.vertices.length;
  mesh.vertices.push(first, second, third, fourth);
  mesh.faces.push([start, start + 1, start + 2, start + 3]);
  mesh.uvs.push(...uv(first), ...uv(second), ...uv(third), ...uv(fourth));
}
function uv(point3) {
  return [
    point3[0] / REPEAT_HOOKS.roofTileWorld,
    point3[2] / REPEAT_HOOKS.roofTileWorld
  ];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/house/HouseShellSystem.js
function createHouseShell(spec2, materials) {
  const foundationDepth = Math.max(0.35, spec2.floorY - spec2.groundMin + 0.2);
  const floorWidth = spec2.width - spec2.wallT * 2;
  const floorDepth = spec2.depth - spec2.wallT * 2;
  return [
    box(spec2, materials.stone, "measured-foundation", 0, spec2.floorY - foundationDepth / 2, 0, spec2.width, foundationDepth, spec2.depth, true),
    box(spec2, materials.stone, "floor-1", 0, floorBottomY(spec2, 0) + spec2.floorThickness / 2, 0, floorWidth, spec2.floorThickness, floorDepth, true),
    box(spec2, materials.wall, "back-wall", 0, spec2.floorY + spec2.wallH / 2, -spec2.depth / 2 + spec2.wallT / 2, spec2.width, spec2.wallH, spec2.wallT),
    box(spec2, materials.side, "left-wall", -spec2.width / 2 + spec2.wallT / 2, spec2.floorY + spec2.wallH / 2, 0, spec2.wallT, spec2.wallH, floorDepth),
    box(spec2, materials.side, "right-wall", spec2.width / 2 - spec2.wallT / 2, spec2.floorY + spec2.wallH / 2, 0, spec2.wallT, spec2.wallH, floorDepth),
    createHouseRoof(spec2, materials.roof)
  ];
}
function box(spec2, material, suffix, localX, y, localZ, sizeX, sizeY, sizeZ, walkable = false) {
  return createHouseBox({
    id: `${spec2.id}-${suffix}`,
    material,
    spec: spec2,
    localX,
    y,
    localZ,
    sizeX,
    sizeY,
    sizeZ,
    walkable
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/house/StairSolidMesh.js
function buildStairSolidMesh(layout, tileWorld) {
  const mesh = { vertices: [], faces: [], uvs: [], topFaces: [] };
  const first = layout.steps[0];
  const last = layout.steps.at(-1);
  const x0 = layout.lowerLanding.centerX - layout.width / 2;
  const x1 = layout.lowerLanding.centerX + layout.width / 2;
  const baseY = layout.fromY - 0.22;
  const landingFront = layout.lowerLanding.centerZ + layout.lowerLanding.depth / 2;
  const stairStart = first.centerZ + first.depth / 2;
  const stairEnd = last.centerZ - last.depth / 2;
  appendTop(mesh, x0, x1, landingFront, stairStart, layout.fromY, tileWorld);
  appendFront(mesh, x0, x1, landingFront, baseY, layout.fromY, tileWorld);
  appendSides(mesh, x0, x1, landingFront, stairStart, baseY, layout.fromY, tileWorld);
  let previousTop = layout.fromY;
  for (const step2 of layout.steps) {
    const front = step2.centerZ + step2.depth / 2;
    const back = step2.centerZ - step2.depth / 2;
    appendRiser(mesh, x0, x1, front, previousTop, step2.topY, tileWorld);
    appendTop(mesh, x0, x1, front, back, step2.topY, tileWorld);
    appendSides(mesh, x0, x1, front, back, baseY, step2.topY, tileWorld);
    previousTop = step2.topY;
  }
  appendBack(mesh, x0, x1, stairEnd, baseY, layout.toY, tileWorld);
  appendBottom(mesh, x0, x1, stairEnd, landingFront, baseY, tileWorld);
  return mesh;
}
function stairGeometrySignature(definition) {
  return definition.vertices.map((point3) => point3.map((value3) => value3.toFixed(4)).join(",")).join("|");
}
function appendTop(mesh, x0, x1, front, back, y, tile) {
  mesh.topFaces.push(mesh.faces.length);
  quad2(mesh, [
    [x0, y, front],
    [x1, y, front],
    [x1, y, back],
    [x0, y, back]
  ], x1 - x0, front - back, tile);
}
function appendRiser(mesh, x0, x1, z, low, high, tile) {
  quad2(mesh, [
    [x0, low, z],
    [x1, low, z],
    [x1, high, z],
    [x0, high, z]
  ], x1 - x0, high - low, tile);
}
function appendFront(mesh, x0, x1, z, low, high, tile) {
  appendRiser(mesh, x0, x1, z, low, high, tile);
}
function appendBack(mesh, x0, x1, z, low, high, tile) {
  quad2(mesh, [
    [x1, low, z],
    [x0, low, z],
    [x0, high, z],
    [x1, high, z]
  ], x1 - x0, high - low, tile);
}
function appendSides(mesh, x0, x1, front, back, low, high, tile) {
  quad2(mesh, [
    [x0, low, back],
    [x0, low, front],
    [x0, high, front],
    [x0, high, back]
  ], front - back, high - low, tile);
  quad2(mesh, [
    [x1, low, front],
    [x1, low, back],
    [x1, high, back],
    [x1, high, front]
  ], front - back, high - low, tile);
}
function appendBottom(mesh, x0, x1, back, front, y, tile) {
  quad2(mesh, [
    [x0, y, back],
    [x1, y, back],
    [x1, y, front],
    [x0, y, front]
  ], x1 - x0, front - back, tile);
}
function quad2(mesh, points, width, height, tile) {
  const start = mesh.vertices.length;
  mesh.vertices.push(...points);
  mesh.faces.push([start, start + 1, start + 2, start + 3]);
  mesh.uvs.push(
    0,
    0,
    width / tile,
    0,
    width / tile,
    height / tile,
    0,
    height / tile
  );
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/house/StairVisualGeometry.js
function createStairSolidDefinition(layout, spec2, material = {}) {
  const tileWorld = Math.max(0.25, material.texturePolicy?.tileWorld || 1);
  const mesh = buildStairSolidMesh(layout, tileWorld);
  const definition = {
    id: `${layout.id}-solid-stairs`,
    shape: "manual",
    solid: true,
    walkable: true,
    noEdge: true,
    ...material,
    position: { x: spec2.x, y: 0, z: spec2.z },
    rotation: { y: spec2.yaw },
    vertices: mesh.vertices,
    faces: mesh.faces,
    uvs: mesh.uvs,
    userData: {
      AwtsmoosStairLayout: layout,
      AwtsmoosStairSolid: {
        projection: "cube-world-per-face",
        tileWorld,
        topFaceIndices: mesh.topFaces,
        faceCount: mesh.faces.length,
        triangleCount: mesh.faces.length * 2,
        internalFaces: 0,
        visibleEqualsCollision: true,
        collisionModel: "visible-watertight-sawtooth-solid"
      }
    }
  };
  definition.userData.AwtsmoosStairSolid.geometrySignature = stairGeometrySignature(definition);
  return definition;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/house/StairMeshBuilder.js
function createStairDefinitions(layout, spec2, material) {
  return [createStairSolidDefinition(layout, spec2, material)];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/house/HouseDefinitionAssembly.js
function assembleHouseDefinitions({
  spec: spec2,
  materials,
  entry,
  rooms,
  groundSampler
}) {
  const stairLayouts = [];
  const yardPatches = spec2.fence ? createHouseYardPatches(spec2) : [];
  const yardGrass = createYardGrass(spec2, yardPatches, groundSampler);
  const definitions = [
    ...createHouseShell(spec2, materials),
    entry.wall,
    entry.mezuza,
    ...entry.steps,
    ...tagHouseInteriorDefinitions(rooms.staticDefs, spec2.id, "room-partitions")
  ];
  for (let level = 1; level < spec2.floors; level += 1) {
    appendStory(definitions, stairLayouts, spec2, materials, level);
  }
  if (yardGrass) {
    definitions.push(yardGrass);
  }
  definitions.push(...createFenceDefinitions(spec2, materials, groundSampler));
  return {
    definitions,
    stairLayouts,
    yardGrass,
    yardPatches
  };
}
function appendStory(definitions, stairLayouts, spec2, materials, level) {
  const layout = planHouseStaircase(spec2, level - 1, level);
  stairLayouts.push(layout);
  definitions.push(...tagHouseInteriorDefinitions(
    createStoryFloorPieces({ spec: spec2, material: materials.stone, level }),
    spec2.id,
    `story-${level + 1}-floor`
  ));
  definitions.push(...tagHouseInteriorDefinitions(
    createStairDefinitions(layout, spec2, materials.stone),
    spec2.id,
    `stairs-${level}-${level + 1}`
  ));
}
function createYardGrass(spec2, yardPatches, groundSampler) {
  return groundSampler && yardPatches.length ? createYardGrassDefinition(spec2, yardPatches, groundSampler) : null;
}
function createFenceDefinitions(spec2, materials, groundSampler) {
  if (!spec2.fence || !groundSampler) {
    return [];
  }
  return createFenceAlongPath({
    id: `${spec2.id}-measured-fence`,
    segments: createHouseFenceSegments(spec2),
    groundSampler,
    material: {
      ...materials.fence,
      doubleSided: true
    }
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/house/HouseMaterials.js
function createHouseMaterials(assets = {}) {
  const layers = Object.fromEntries(
    cottageSurfaceStack().layers.map((layer) => [layer.role, layer])
  );
  return {
    wall: pair(
      "#d8d0bf",
      assets.whiteBrickImage,
      REPEAT_HOOKS.wallTileWorld,
      layers["cottage-fieldstone"],
      layers["cottage-limestone"]
    ),
    side: pair(
      "#cfc5b2",
      assets.brickImage,
      REPEAT_HOOKS.wallTileWorld,
      layers["cottage-white-brick"],
      layers["cottage-weathered-brick"]
    ),
    stone: pair(
      "#9f9687",
      assets.stoneImage,
      REPEAT_HOOKS.floorTileWorld,
      layers["cottage-fieldstone"],
      layers["cottage-limestone"]
    ),
    door: pair(
      "#5a3422",
      assets.woodImage,
      2,
      layers["cottage-timber"],
      layers["cottage-bark-trim"]
    ),
    roof: pair(
      "#5b4436",
      assets.woodImage,
      REPEAT_HOOKS.roofTileWorld,
      layers["cottage-roof"],
      layers["cottage-roof-small-tile"]
    ),
    fence: pair(
      "#6a4b33",
      assets.woodImage,
      2,
      layers["cottage-timber"],
      layers["cottage-oak-variation"]
    ),
    mezuza: pair(
      "#b78a2f",
      assets.goldImage || assets.woodImage,
      0.5,
      layers["cottage-gold"],
      layers["cottage-iron"]
    )
  };
}
function pair(color, image, tileWorld, primary, secondary) {
  const fields = materialTexture(color, image, [1, 1], {
    anisotropy: 8,
    backfaceCull: true,
    hook: "modular-house-physical-pair",
    projection: "cube-world",
    tileWorld
  });
  return bindMaterialPair(fields, primary, secondary);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/house/HousePackageMetadata.js
function createHousePackageMetadata({
  spec: spec2,
  entry,
  rooms,
  stairLayouts,
  yardGrass,
  yardPatches,
  anchors
}) {
  const mezuzahs = [entry.mezuza, ...rooms.mezuzaDefs].map((definition) => definition.userData.AwtsmoosMezuza);
  return {
    doorDefs: [entry.door, ...rooms.doorDefs],
    roomDebug: rooms.debug,
    houseStats: {
      id: spec2.id,
      x: spec2.x,
      z: spec2.z,
      yaw: spec2.yaw,
      width: spec2.width,
      depth: spec2.depth,
      floorY: spec2.floorY,
      wallThickness: spec2.wallT,
      wallHeight: spec2.wallH,
      floors: spec2.floors,
      storyHeight: spec2.storyHeight,
      partitionCount: rooms.debug.length,
      partitionFullHeight: rooms.debug.every((item2) => item2.touchesCeiling),
      stairCount: stairLayouts.length,
      openingCount: stairLayouts.length
    },
    stairStats: stairLayouts.map(staircaseStats),
    stairLayouts,
    mezuzaStats: mezuzahs,
    yardGrassStats: yardGrass?.userData?.AwtsmoosYardGrass || null,
    yardPatches,
    anchors
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/house/HouseDistrictSpecs.js
var HOUSE_ROOM_KINDS = Object.freeze([
  "main-house",
  "west-learning-house",
  "east-family-house",
  "north-study-house",
  "south-guest-house"
]);
function createFutureHouseSpecs(base = DEFAULT_HOUSE_SPEC) {
  const shared = { ...DEFAULT_HOUSE_SPEC, ...base };
  return [
    house(shared, "Awtsmoos-west-learning-house", -88, 62, 0.18, 46, 34, 9.1, 2),
    house(shared, "Awtsmoos-east-family-house", 118, 50, -0.22, 48, 36, 9.4, 2),
    house(shared, "Awtsmoos-north-study-house", -94, -72, -0.12, 44, 32, 9, 2),
    house(shared, "Awtsmoos-south-guest-house", 160, -112, 0.16, 42, 31, 9.2, 1)
  ];
}
function house(shared, id, x, z, yaw, width, depth, storyHeight, floors) {
  return {
    ...shared,
    id,
    x,
    z,
    yaw,
    width,
    depth,
    storyHeight,
    floors,
    wallH: floors * storyHeight + HOUSE_ARCHITECTURE.roofClearance
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/ModularHouseSystem.js
function createModularHouse(assets = {}, specification = DEFAULT_HOUSE_SPEC, groundSampler) {
  const spec2 = resolveHouseSpec(specification, groundSampler);
  const materials = createHouseMaterials(assets);
  const entry = createHouseEntry(spec2, materials, groundSampler);
  const rooms = createInteriorRoomSet({ spec: spec2, materials });
  const assembly = assembleHouseDefinitions({
    spec: spec2,
    materials,
    entry,
    rooms,
    groundSampler
  });
  assembly.definitions.userData = createHousePackageMetadata({
    spec: spec2,
    entry,
    rooms,
    stairLayouts: assembly.stairLayouts,
    yardGrass: assembly.yardGrass,
    yardPatches: assembly.yardPatches,
    anchors: modularHouseAnchors(spec2)
  });
  for (const definition of assembly.definitions) {
    definition.userData = {
      ...definition.userData || {},
      family: definition.userData?.family || "functional-house",
      // These complete walk-in buildings are much larger than the cottage
      // layer. Distance culling keeps their interiors from becoming giant
      // arrival-screen walls; all parts return together as the player approaches.
      renderDistance: 80
    };
  }
  return assembly.definitions;
}
function modularHouseDoorDefs(assets = {}, specification = DEFAULT_HOUSE_SPEC, groundSampler) {
  const spec2 = resolveHouseSpec(specification, groundSampler);
  const materials = createHouseMaterials(assets);
  const entry = createHouseEntry(spec2, materials, groundSampler);
  const rooms = createInteriorRoomSet({ spec: spec2, materials });
  return [entry.door, ...rooms.doorDefs];
}
function modularHouseAnchors(specification = DEFAULT_HOUSE_SPEC) {
  const spec2 = {
    ...DEFAULT_HOUSE_SPEC,
    ...specification,
    floorY: specification.floorY ?? 0
  };
  const entry = entryAnchors(spec2);
  const stair = spec2.floors > 1 ? planHouseStaircase(spec2, 0, 1) : null;
  return {
    id: spec2.id,
    frontDoor: entry.door,
    frontStairs: entry.landing,
    roadGate: entry.gate,
    insideFoyer: localToWorld(spec2, 0, spec2.depth / 2 - 5),
    hallCenter: localToWorld(spec2, 0, 0),
    backRoom: localToWorld(spec2, 0, -spec2.depth / 2 + 7),
    upstairsHook: stair ? {
      ...localToWorld(spec2, stair.opening.centerX, stair.opening.centerZ),
      y: floorTopY(spec2, 1)
    } : null
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/House3D.js
var DISTRICT_SPECS = createFutureHouseSpecs(DEFAULT_HOUSE_SPEC);
var ALL_SPECS = [DEFAULT_HOUSE_SPEC, ...DISTRICT_SPECS];
function createHouseDefs(assets = {}, groundSampler) {
  const packages = ALL_SPECS.map((spec2) => createModularHouse(assets, spec2, groundSampler));
  const definitions = packages.flatMap((packageDefinitions) => [...packageDefinitions]);
  definitions.userData = {
    houses: packages.map((item2) => item2.userData.houseStats),
    stairs: packages.flatMap((item2) => item2.userData.stairStats),
    stairLayouts: packages.flatMap((item2) => item2.userData.stairLayouts),
    mezuzahs: packages.flatMap((item2) => item2.userData.mezuzaStats),
    anchors: packages.map((item2) => item2.userData.anchors),
    rooms: packages.flatMap((item2) => item2.userData.roomDebug),
    yardGrass: packages.map((item2) => item2.userData.yardGrassStats).filter(Boolean),
    yardPatches: packages.flatMap((item2) => item2.userData.yardPatches || [])
  };
  return definitions;
}
function allHouseDoorDefs(assets = {}, groundSampler) {
  return ALL_SPECS.flatMap((spec2) => modularHouseDoorDefs(assets, spec2, groundSampler));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/ObstacleField.js
function createObstacleField(assets = {}, groundSampler) {
  const houses = createHouseDefs(assets, groundSampler);
  const definitions = [...houses];
  definitions.assets = assets;
  definitions.userData = {
    ...houses.userData,
    startingZone: {
      productionOnly: true,
      testCourseObjects: 0,
      npcInstalledSeparately: true
    }
  };
  return definitions;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/sky/SkyMeshFactory.js
function createSkyMesh(name, geometryData, materialData) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", attribute(geometryData.positions, 3));
  geometry.setAttribute("normal", attribute(geometryData.normals, 3));
  geometry.setAttribute("color", attribute(geometryData.colors, 4));
  if (geometryData.uvs?.length) geometry.setAttribute("uv", attribute(geometryData.uvs, 2));
  geometry.setIndex(new BufferAttribute(indexArray(geometryData.indices), 1));
  const alpha = materialData.color[3] ?? 1;
  const material = new MeshStandardMaterial({ name, color: materialData.color });
  Object.assign(material, {
    textureUrl: materialData.textureUrl,
    mapImage: materialData.mapImage || cachedTextureImage(materialData.textureUrl),
    mapRepeat: materialData.mapRepeat || [1, 1],
    transparent: alpha < 1,
    opacity: alpha,
    alphaMode: alpha < 1 ? "BLEND" : "OPAQUE",
    doubleSided: materialData.doubleSided !== false,
    texturePolicy: materialData.texturePolicy || null
  });
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  mesh.setBaseTransform();
  return mesh;
}
function createSkyQuad(name, center, size, color, textureUrl = null, mapImage = null) {
  const [x, y, z] = center;
  const [width, height] = size;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  return createSkyMesh(name, {
    positions: [
      x - halfWidth,
      y - halfHeight,
      z,
      x + halfWidth,
      y - halfHeight,
      z,
      x + halfWidth,
      y + halfHeight,
      z,
      x - halfWidth,
      y + halfHeight,
      z
    ],
    normals: repeatVector([0, 0, 1], 4),
    colors: repeatVector([1, 1, 1, 1], 4),
    uvs: [0, 0, 1, 0, 1, 1, 0, 1],
    indices: [0, 1, 2, 0, 2, 3]
  }, {
    color,
    mapImage,
    texturePolicy: { atmosphericLayer: true, proceduralSky: true },
    textureUrl
  });
}
function createSkyDisc(name, center, radius, color, textureUrl = null, mapImage = null) {
  const middle = v(...center);
  const normal = normalize(v(-center[0], -center[1], -center[2]));
  const right = normalize(v(normal.z, 0, -normal.x));
  const up = normalize(v(
    normal.y * right.z,
    normal.z * right.x - normal.x * right.z,
    -normal.y * right.x
  ));
  const data = discGeometry(middle, normal, right, up, radius, [1, 1, 1, 1]);
  return createSkyMesh(name, data, {
    color,
    mapImage,
    texturePolicy: { atmosphericLayer: true, proceduralSky: true },
    textureUrl
  });
}
function createSkyRay(name, center, angle, length2, width, color, textureUrl = null) {
  const [x, y, z] = center;
  const rayX = Math.cos(angle);
  const rayY = Math.sin(angle);
  const upX = -Math.sin(angle);
  const upY = Math.cos(angle);
  return createSkyMesh(name, {
    positions: [
      x - upX * width,
      y - upY * width,
      z,
      x + upX * width,
      y + upY * width,
      z,
      x + rayX * length2 + upX * width * 0.18,
      y + rayY * length2 + upY * width * 0.18,
      z,
      x + rayX * length2 - upX * width * 0.18,
      y + rayY * length2 - upY * width * 0.18,
      z
    ],
    normals: repeatVector([0, 0, 1], 4),
    colors: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
    uvs: [0, 0, 1, 0, 1, 1, 0, 1],
    indices: [0, 1, 2, 0, 2, 3]
  }, {
    color,
    texturePolicy: { atmosphericLayer: true, proceduralSky: true },
    textureUrl
  });
}
function discGeometry(middle, normal, right, up, radius, color) {
  const positions = [middle.x, middle.y, middle.z];
  const normals = [normal.x, normal.y, normal.z];
  const colors = [...color];
  const uvs = [0.5, 0.5];
  const indices = [];
  for (let index = 0; index <= 64; index += 1) {
    const angle = index / 64 * Math.PI * 2;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    positions.push(
      middle.x + (right.x * cosine + up.x * sine) * radius,
      middle.y + (right.y * cosine + up.y * sine) * radius,
      middle.z + (right.z * cosine + up.z * sine) * radius
    );
    normals.push(normal.x, normal.y, normal.z);
    colors.push(...color);
    uvs.push(0.5 + cosine * 0.5, 0.5 + sine * 0.5);
    if (index > 0) indices.push(0, index, index + 1);
  }
  return { positions, normals, colors, uvs, indices };
}
function attribute(values, itemSize) {
  return new BufferAttribute(new Float32Array(values), itemSize);
}
function repeatVector(vector3, count) {
  return Array.from({ length: count }, () => vector3).flat();
}
function indexArray(indices) {
  return Math.max(...indices) > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/sky/ProceduralAtmosphereTexture.js
var cloudTexture = null;
var hazeTexture = null;
function proceduralCloudTexture() {
  if (cloudTexture || typeof document === "undefined") return cloudTexture;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.globalCompositeOperation = "lighter";
  const puffs = [
    [82, 150, 74, 0.64],
    [150, 116, 92, 0.82],
    [232, 126, 112, 0.92],
    [324, 112, 96, 0.8],
    [404, 148, 78, 0.58],
    [280, 170, 118, 0.54]
  ];
  for (const [x, y, radius, alpha] of puffs) {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
    gradient.addColorStop(0.46, `rgba(255,255,255,${alpha * 0.68})`);
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  canvas.dataset.url = "procedural://awtsmoos-soft-cloud-alpha";
  cloudTexture = canvas;
  return canvas;
}
function proceduralHazeTexture() {
  if (hazeTexture || typeof document === "undefined") return hazeTexture;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const horizontal = context.createLinearGradient(0, 0, canvas.width, 0);
  horizontal.addColorStop(0, "rgba(255,255,255,0)");
  horizontal.addColorStop(0.18, "rgba(255,255,255,.72)");
  horizontal.addColorStop(0.82, "rgba(255,255,255,.72)");
  horizontal.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = horizontal;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalCompositeOperation = "destination-in";
  const vertical = context.createLinearGradient(0, 0, 0, canvas.height);
  vertical.addColorStop(0, "rgba(255,255,255,0)");
  vertical.addColorStop(0.5, "rgba(255,255,255,1)");
  vertical.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = vertical;
  context.fillRect(0, 0, canvas.width, canvas.height);
  canvas.dataset.url = "procedural://awtsmoos-horizon-haze-alpha";
  hazeTexture = canvas;
  return canvas;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/lighting/ReferenceSkyCloudSystem.js
function createReferenceSkyClouds(quality = "high") {
  const budget = referenceLightingBudget(quality);
  return Array.from({ length: budget.clouds }, (_, index) => {
    const row2 = index % 3;
    const column = Math.floor(index / 3);
    const warm = index % 4 === 0;
    return createSkyQuad(
      `reference_cloud_${quality}_${index}`,
      [
        -196 + column * 47 + row2 * 9,
        52 + row2 * 15 + Math.sin(index * 1.41) * 7,
        -132 - row2 * 24 - column % 2 * 12
      ],
      [44 + index % 4 * 11, 9 + row2 * 5],
      warm ? REFERENCE_GOLDEN_HOUR.cloudColor : [0.68, 0.77, 0.88, 0.14],
      null,
      proceduralCloudTexture()
    );
  });
}
function createReferenceHazeLayers() {
  return [
    createSkyQuad(
      "reference_warm_horizon_haze",
      [0, 1, -190],
      [620, 104],
      REFERENCE_GOLDEN_HOUR.horizonColor,
      null,
      proceduralHazeTexture()
    ),
    createSkyQuad(
      "reference_cool_valley_haze",
      [0, 18, -270],
      [760, 146],
      [0.42, 0.55, 0.72, 0.15],
      null,
      proceduralHazeTexture()
    ),
    createSkyQuad(
      "reference_far_blue_air",
      [0, 42, -420],
      [980, 210],
      [0.48, 0.61, 0.78, 0.1],
      null,
      proceduralHazeTexture()
    )
  ];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/lighting/VolumetricSunShaftSystem.js
function createVolumetricSunShafts(quality = "high") {
  const budget = referenceLightingBudget(quality);
  return Array.from({ length: budget.sunShafts }, (_, index) => {
    const ratio3 = index / Math.max(1, budget.sunShafts - 1);
    const angle = -0.72 + ratio3 * 1.34 + Math.sin(index * 2.3) * 0.045;
    const length2 = 92 + index % 4 * 24;
    const width = 5.5 + index % 3 * 2.4;
    const alpha = 0.08 + index % 5 * 0.012;
    return createSkyRay(
      `reference_sun_shaft_${quality}_${index}`,
      REFERENCE_GOLDEN_HOUR.sunPosition,
      angle,
      length2,
      width,
      [1, 0.73, 0.28, alpha]
    );
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/sky/SkyDome.js
function createSkyDome(textureUrl, radius = 1400, rings = 24, segments = 64) {
  const geometry = createDomeGeometry(radius, rings, segments);
  return createSkyMesh(
    "reference_blue_gold_atmosphere_dome",
    geometry,
    {
      color: [1, 1, 1, 1],
      doubleSided: true,
      mapRepeat: [2, 1],
      texturePolicy: {
        notWhite: true,
        proceduralSky: true,
        publicFirebaseProxy: true,
        referenceGoldenHour: true
      },
      textureUrl
    }
  );
}
function createDomeGeometry(radius, rings, segments) {
  const geometry = {
    colors: [],
    indices: [],
    normals: [],
    positions: [],
    uvs: []
  };
  for (let ring = 0; ring <= rings; ring += 1) {
    appendRing(geometry, ring, rings, segments, radius);
  }
  for (let ring = 0; ring < rings; ring += 1) {
    appendRingIndices(geometry.indices, ring, segments);
  }
  return geometry;
}
function appendRing(geometry, ring, rings, segments, radius) {
  const verticalRatio = ring / rings;
  const phi = verticalRatio * Math.PI * 0.58;
  const y = Math.sin(phi) * radius - 96;
  const flatRadius = Math.cos(phi) * radius;
  for (let segment = 0; segment <= segments; segment += 1) {
    const horizontalRatio = segment / segments;
    const angle = horizontalRatio * Math.PI * 2;
    geometry.positions.push(
      Math.cos(angle) * flatRadius,
      y,
      Math.sin(angle) * flatRadius
    );
    geometry.normals.push(0, 1, 0);
    geometry.colors.push(...skyColor(verticalRatio, angle));
    geometry.uvs.push(horizontalRatio, 1 - verticalRatio);
  }
}
function appendRingIndices(indices, ring, segments) {
  for (let segment = 0; segment < segments; segment += 1) {
    const first = ring * (segments + 1) + segment;
    const second = first + 1;
    const third = first + segments + 1;
    const fourth = third + 1;
    indices.push(first, third, second, second, third, fourth);
  }
}
function skyColor(verticalRatio, angle) {
  const horizon = 1 - verticalRatio;
  const sunDirection = Math.max(0, Math.cos(angle + 2.12)) ** 7;
  const gold = sunDirection * horizon;
  return [
    0.055 + verticalRatio * 0.13 + horizon * 0.31 + gold * 0.64,
    0.15 + verticalRatio * 0.28 + horizon * 0.25 + gold * 0.37,
    0.42 + verticalRatio * 0.34 + horizon * 0.15 - gold * 0.12,
    1
  ];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/Sky3D.js
function createSky3D(quality = "high") {
  const group = new Group();
  const budget = referenceLightingBudget(quality);
  group.name = `Awtsmoos_reference_golden_hour_sky_${quality}`;
  group.add(createSkyDome(null));
  for (const haze of createReferenceHazeLayers()) group.add(haze);
  group.add(createSkyDisc(
    "reference_sun_white_core",
    REFERENCE_GOLDEN_HOUR.sunPosition,
    6.4,
    REFERENCE_GOLDEN_HOUR.sunCore
  ));
  group.add(createSkyDisc(
    "reference_sun_warm_bloom",
    REFERENCE_GOLDEN_HOUR.sunPosition,
    21,
    REFERENCE_GOLDEN_HOUR.sunGlow
  ));
  for (const ray of createVolumetricSunShafts(quality)) group.add(ray);
  for (const cloud of createReferenceSkyClouds(quality)) group.add(cloud);
  group.userData.AwtsmoosSky = {
    budget,
    cloudTextureProxy: "procedural://awtsmoos-soft-cloud-alpha",
    quality,
    style: "reference-golden-hour-atmospheric-depth",
    sun: REFERENCE_GOLDEN_HOUR.sunPosition,
    technique: "static-transparent-meshes-no-fullscreen-postprocess"
  };
  return group;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/GroundSampleCache.js
var GroundSampleCache = class {
  constructor({ maximumEntries = 192 } = {}) {
    this.maximumEntries = maximumEntries;
    this.entries = /* @__PURE__ */ new Map();
    this.identities = /* @__PURE__ */ new WeakMap();
    this.nextIdentity = 1;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      clears: 0
    };
  }
  /** Returns one cached sample or creates it from exact world inputs. */
  resolve({ x, z, maximumY, octree, terrainHeightAt, create }) {
    const key = this.keyFor({
      x,
      z,
      maximumY,
      octree,
      terrainHeightAt
    });
    if (!key) {
      return create();
    }
    if (this.entries.has(key)) {
      this.stats.hits += 1;
      return this.entries.get(key);
    }
    this.stats.misses += 1;
    const sample2 = create();
    this.entries.set(key, sample2);
    this.evictOldest();
    return sample2;
  }
  /** Clears all remembered ground while preserving cumulative evidence. */
  clear() {
    if (!this.entries.size) {
      return;
    }
    this.entries.clear();
    this.stats.clears += 1;
  }
  /** Builds an exact cache key including mutable collision-world revision. */
  keyFor({ x, z, maximumY, octree, terrainHeightAt }) {
    if (![x, z, maximumY].every(Number.isFinite)) {
      return null;
    }
    return [
      this.identityFor(octree),
      collisionRevisionFor(octree),
      this.identityFor(terrainHeightAt),
      x,
      z,
      maximumY
    ].join("|");
  }
  /** Returns a stable process-local identity for an object or primitive. */
  identityFor(value3) {
    if (!isReference(value3)) {
      return `${typeof value3}:${String(value3)}`;
    }
    if (!this.identities.has(value3)) {
      this.identities.set(value3, this.nextIdentity);
      this.nextIdentity += 1;
    }
    return this.identities.get(value3);
  }
  /** Evicts oldest insertion-order entries until the configured bound holds. */
  evictOldest() {
    while (this.entries.size > this.maximumEntries) {
      this.entries.delete(this.entries.keys().next().value);
      this.stats.evictions += 1;
    }
  }
};
function collisionRevisionFor(octree) {
  const revision = octree?.revision;
  return revision === void 0 ? "revision:none" : `revision:${String(revision)}`;
}
function isReference(value3) {
  return !!value3 && (typeof value3 === "object" || typeof value3 === "function");
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/WorldGround.js
var WorldGround = class {
  constructor({ terrainHeightAt, octree, top = 42 }) {
    this.terrainHeightAt = terrainHeightAt;
    this.octree = octree;
    this.top = top;
    this.sampleCache = new GroundSampleCache();
  }
  sample(x, z, options = {}) {
    const maximumY = Number.isFinite(options.maxY) ? options.maxY : this.top;
    if (!cacheableOptions(options)) {
      return this.computeSample(x, z, maximumY);
    }
    return this.sampleCache.resolve({
      x,
      z,
      maximumY,
      octree: this.octree,
      terrainHeightAt: this.terrainHeightAt,
      create: () => this.computeSample(x, z, maximumY)
    });
  }
  heightAt(x, z, options = {}) {
    return this.sample(x, z, options).height;
  }
  isGrounded(position, footOffset = 0, epsilon = 0.055) {
    const feetY = position.y - footOffset;
    const ground = this.heightAt(position.x, position.z, {
      maxY: feetY + epsilon
    });
    return feetY <= ground + epsilon;
  }
  terrainNormal(x, z) {
    const epsilon = 0.08;
    const heightAt2 = this.terrainHeightAt;
    return normalize(v(
      heightAt2(x - epsilon, z) - heightAt2(x + epsilon, z),
      2 * epsilon,
      heightAt2(x, z - epsilon) - heightAt2(x, z + epsilon)
    ));
  }
  computeSample(x, z, maximumY) {
    const terrain = this.terrainSample(x, z);
    const originY = Math.max(
      terrain.height + 0.04,
      Math.min(this.top, maximumY + 0.04)
    );
    const maximumDistance = Math.max(
      0.08,
      originY - terrain.height + 2
    );
    const hit = this.octree?.raycast(
      new Ray({ x, y: originY, z }, { x: 0, y: -1, z: 0 }),
      maximumDistance,
      floorOnly
    );
    if (!hit || hit.point.y < terrain.height - 1e-3) return terrain;
    return {
      height: hit.point.y,
      normal: hit.item.normal,
      kind: hit.item.kind,
      source: "octree-bounded-floor-ray"
    };
  }
  terrainSample(x, z) {
    return {
      height: this.terrainHeightAt(x, z),
      normal: this.terrainNormal(x, z),
      kind: "terrain",
      source: "terrain-height"
    };
  }
};
function cacheableOptions(options) {
  return Object.keys(options).every((key) => key === "maxY");
}
function floorOnly(item2) {
  return item2.solid && item2.floor && item2.normal?.y > 0.24;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodTransitionQueue.js
var LodTransitionQueue = class {
  constructor() {
    this.entries = /* @__PURE__ */ new Map();
    this.sequence = 0;
    this.stats = {
      enqueued: 0,
      replaced: 0,
      applied: 0,
      failed: 0
    };
  }
  enqueue({
    id,
    priority = 0,
    cost = 1,
    apply,
    metadata = null
  }) {
    if (!id || typeof apply !== "function") return false;
    const existing = this.entries.get(id);
    const entry = {
      id,
      priority: finiteNumber2(priority, 0),
      cost: Math.max(0, finiteNumber2(cost, 1)),
      apply,
      metadata,
      sequence: existing?.sequence ?? this.sequence++
    };
    if (existing) this.stats.replaced += 1;
    else this.stats.enqueued += 1;
    this.entries.set(id, entry);
    return true;
  }
  cancel(id) {
    return this.entries.delete(id);
  }
  clear() {
    this.entries.clear();
  }
  process({ maximumTransitions = 4, maximumCost = Infinity } = {}) {
    const ordered = [...this.entries.values()].sort(compareEntries);
    const results = [];
    let usedCost = 0;
    for (const entry of ordered) {
      if (results.length >= maximumTransitions) break;
      if (usedCost + entry.cost > maximumCost) continue;
      this.entries.delete(entry.id);
      try {
        const value3 = entry.apply(entry.metadata);
        usedCost += entry.cost;
        this.stats.applied += 1;
        results.push({
          id: entry.id,
          ok: true,
          value: value3,
          cost: entry.cost
        });
      } catch (error) {
        this.stats.failed += 1;
        results.push({
          id: entry.id,
          ok: false,
          error,
          cost: entry.cost
        });
      }
    }
    return {
      results,
      usedCost,
      remaining: this.entries.size
    };
  }
  get size() {
    return this.entries.size;
  }
};
function compareEntries(left, right) {
  if (left.priority !== right.priority) return right.priority - left.priority;
  return left.sequence - right.sequence;
}
function finiteNumber2(value3, fallback) {
  return Number.isFinite(value3) ? value3 : fallback;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkId.js
var ID_PREFIX = "wc";
var CURRENT_VERSION = 1;
function createWorldChunkId({
  namespace = "mitzvah-world",
  level = 0,
  x = 0,
  y = 0,
  z = 0,
  version = CURRENT_VERSION
} = {}) {
  assertNamespace(namespace);
  assertCoordinate("level", level, { minimum: 0 });
  assertCoordinate("x", x);
  assertCoordinate("y", y);
  assertCoordinate("z", z);
  assertCoordinate("version", version, { minimum: 1 });
  return [
    ID_PREFIX,
    version,
    encodeURIComponent(namespace),
    level,
    x,
    y,
    z
  ].join(":");
}
function parseWorldChunkId(id) {
  if (typeof id !== "string") {
    throw new TypeError("World chunk ID must be a string.");
  }
  const parts = id.split(":");
  if (parts.length !== 7 || parts[0] !== ID_PREFIX) {
    throw new TypeError(`Malformed world chunk ID: ${id}`);
  }
  const parsed = {
    version: Number(parts[1]),
    namespace: decodeURIComponent(parts[2]),
    level: Number(parts[3]),
    x: Number(parts[4]),
    y: Number(parts[5]),
    z: Number(parts[6])
  };
  const canonical = createWorldChunkId(parsed);
  if (canonical !== id) {
    throw new TypeError(`Non-canonical world chunk ID: ${id}`);
  }
  return Object.freeze(parsed);
}
function worldChunkSeed(id, generationVersion = 1) {
  parseWorldChunkId(id);
  assertCoordinate("generationVersion", generationVersion, { minimum: 1 });
  let hash2 = 2166136261;
  for (const character of `${id}|generation:${generationVersion}`) {
    hash2 ^= character.codePointAt(0);
    hash2 = Math.imul(hash2, 16777619);
  }
  return hash2 >>> 0;
}
function parentWorldChunkId(id) {
  const chunk = parseWorldChunkId(id);
  if (chunk.level === 0) {
    return null;
  }
  return createWorldChunkId({
    ...chunk,
    level: chunk.level - 1,
    x: Math.floor(chunk.x / 2),
    y: Math.floor(chunk.y / 2),
    z: Math.floor(chunk.z / 2)
  });
}
function childWorldChunkIds(id) {
  const chunk = parseWorldChunkId(id);
  const children = [];
  for (let xOffset = 0; xOffset < 2; xOffset += 1) {
    for (let yOffset = 0; yOffset < 2; yOffset += 1) {
      for (let zOffset = 0; zOffset < 2; zOffset += 1) {
        children.push(createWorldChunkId({
          ...chunk,
          level: chunk.level + 1,
          x: chunk.x * 2 + xOffset,
          y: chunk.y * 2 + yOffset,
          z: chunk.z * 2 + zOffset
        }));
      }
    }
  }
  return Object.freeze(children);
}
function assertNamespace(namespace) {
  if (typeof namespace !== "string" || !namespace.trim()) {
    throw new TypeError("World chunk namespace must be a nonempty string.");
  }
}
function assertCoordinate(name, value3, { minimum = -Infinity } = {}) {
  if (!Number.isSafeInteger(value3) || value3 < minimum) {
    throw new TypeError(`${name} must be a safe integer >= ${minimum}.`);
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkRecordValues.js
function freezeChunkBounds(bounds = {}) {
  const minimum = freezeVector(bounds.min);
  const maximum = freezeVector(bounds.max);
  for (const axis of ["x", "y", "z"]) {
    if (maximum[axis] < minimum[axis]) {
      throw new TypeError(`Chunk bounds max.${axis} must be >= min.${axis}.`);
    }
  }
  return Object.freeze({ min: minimum, max: maximum });
}
function freezeChunkStrings(values = []) {
  if (!Array.isArray(values) || values.some((value3) => typeof value3 !== "string")) {
    throw new TypeError("Chunk relationship lists must contain only strings.");
  }
  return Object.freeze([...values]);
}
function freezeChunkMemory(value3 = {}) {
  return Object.freeze({
    geometry: nonnegativeChunkNumber("memory.geometry", value3.geometry),
    textures: nonnegativeChunkNumber("memory.textures", value3.textures),
    collision: nonnegativeChunkNumber("memory.collision", value3.collision)
  });
}
function freezeChunkReadiness(value3 = {}) {
  return Object.freeze({
    visualReady: value3.visualReady === true,
    collisionPrepared: value3.collisionPrepared === true,
    safetyValidated: value3.safetyValidated === true
  });
}
function freezeCollisionHandoff(value3 = {}) {
  return Object.freeze({
    parentRetained: value3.parentRetained === true,
    atomicReady: value3.atomicReady === true
  });
}
function nonnegativeChunkInteger(name, value3, minimum = 0) {
  if (!Number.isSafeInteger(value3) || value3 < minimum) {
    throw new TypeError(`${name} must be an integer >= ${minimum}.`);
  }
  return value3;
}
function nonnegativeChunkNumber(name, value3 = 0) {
  const number = finiteNumber3(name, value3);
  if (number < 0) {
    throw new TypeError(`${name} must be nonnegative.`);
  }
  return number;
}
function clampChunkUnit(value3 = 0) {
  return Math.min(1, Math.max(0, Number(value3) || 0));
}
function freezeVector(value3 = {}) {
  return Object.freeze({
    x: finiteNumber3("vector.x", value3.x),
    y: finiteNumber3("vector.y", value3.y),
    z: finiteNumber3("vector.z", value3.z)
  });
}
function finiteNumber3(name, value3 = 0) {
  if (!Number.isFinite(value3)) {
    throw new TypeError(`${name} must be finite.`);
  }
  return value3;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkState.js
var WORLD_CHUNK_STATES = Object.freeze({
  UNKNOWN: "Unknown",
  METADATA_LOADED: "MetadataLoaded",
  COARSE_GENERATED: "CoarseGenerated",
  VISUAL_READY: "VisualReady",
  COLLISION_PREPARED: "CollisionPrepared",
  SAFETY_VALIDATED: "SafetyValidated",
  ACTIVE: "Active",
  DORMANT: "Dormant",
  UNLOADING: "Unloading",
  CACHED: "Cached",
  FAILED: "Failed"
});
var STATE_VALUES = new Set(Object.values(WORLD_CHUNK_STATES));
function isWorldChunkState(value3) {
  return STATE_VALUES.has(value3);
}
function assertWorldChunkState(value3) {
  if (!isWorldChunkState(value3)) {
    throw new TypeError(`Unknown world chunk state: ${String(value3)}`);
  }
  return value3;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkRecord.js
function createWorldChunkRecord(definition = {}) {
  const id = definition.id || createWorldChunkId(definition.identity);
  parseWorldChunkId(id);
  const generationVersion = nonnegativeChunkInteger(
    "generationVersion",
    definition.generationVersion ?? 1,
    1
  );
  return Object.freeze({
    id,
    state: assertWorldChunkState(definition.state ?? WORLD_CHUNK_STATES.UNKNOWN),
    generationVersion,
    deterministicSeed: definition.deterministicSeed ?? worldChunkSeed(id, generationVersion),
    bounds: freezeChunkBounds(definition.bounds),
    parentId: definition.parentId ?? parentWorldChunkId(id),
    childIds: freezeChunkStrings(definition.childIds ?? childWorldChunkIds(id)),
    neighborIds: freezeChunkStrings(definition.neighborIds),
    assetDependencies: freezeChunkStrings(definition.assetDependencies),
    memoryEstimate: freezeChunkMemory(definition.memoryEstimate),
    readiness: freezeChunkReadiness(definition.readiness),
    collisionRequired: definition.collisionRequired !== false,
    collisionHandoff: freezeCollisionHandoff(definition.collisionHandoff),
    streamingUrgency: clampChunkUnit(definition.streamingUrgency),
    lastAccessTime: nonnegativeChunkNumber(
      "lastAccessTime",
      definition.lastAccessTime
    ),
    lastTransition: definition.lastTransition ?? null,
    runtime: definition.runtime ?? null
  });
}
function worldChunkRecordDiagnostics(records) {
  const byState = Object.fromEntries(
    Object.values(WORLD_CHUNK_STATES).map((state) => [state, 0])
  );
  const readiness = {
    visualReady: 0,
    collisionPrepared: 0,
    safetyValidated: 0,
    collisionOptional: 0
  };
  let total = 0;
  for (const record of records) {
    total += 1;
    byState[assertWorldChunkState(record.state)] += 1;
    readiness.visualReady += record.readiness?.visualReady === true ? 1 : 0;
    readiness.collisionPrepared += record.readiness?.collisionPrepared === true ? 1 : 0;
    readiness.safetyValidated += record.readiness?.safetyValidated === true ? 1 : 0;
    readiness.collisionOptional += record.collisionRequired === false ? 1 : 0;
  }
  return Object.freeze({
    total,
    byState: Object.freeze(byState),
    readiness: Object.freeze(readiness)
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkBootstrap.js
var BOOTSTRAP_WORLD_CHUNK_ID = createWorldChunkId({
  namespace: "eretz-bootstrap",
  level: 0,
  x: 0,
  y: 0,
  z: 0
});
function createBootstrapWorldChunk({ terrain, mainOctree } = {}) {
  if (!terrain?.group || !Array.isArray(terrain.colliders)) {
    throw new TypeError("Bootstrap terrain package is incomplete.");
  }
  if (!mainOctree?.bounds?.toJSON) {
    throw new TypeError("Bootstrap collision octree bounds are required.");
  }
  const collisionTriangles = terrain.colliders.length;
  const collisionPositionBytes = collisionTriangles * 3 * 3 * 4;
  return createWorldChunkRecord({
    id: BOOTSTRAP_WORLD_CHUNK_ID,
    state: WORLD_CHUNK_STATES.ACTIVE,
    bounds: mainOctree.bounds.toJSON(),
    parentId: null,
    childIds: [],
    neighborIds: [],
    assetDependencies: [],
    memoryEstimate: {
      geometry: collisionPositionBytes,
      textures: 0,
      collision: collisionPositionBytes
    },
    readiness: {
      visualReady: true,
      collisionPrepared: true,
      safetyValidated: true
    },
    collisionRequired: true,
    collisionHandoff: {
      parentRetained: false,
      atomicReady: false
    },
    runtime: {
      terrain,
      sceneNode: terrain.group,
      collisionOctree: mainOctree,
      memoryEstimateMethod: "collision-position-lower-bound"
    }
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionState.js
var WORLD_CHUNK_COLLISION_STATES = Object.freeze({
  PREPARED: "Prepared",
  VALIDATED: "Validated",
  ACTIVE: "Active",
  DISCARDED: "Discarded"
});
var COLLISION_STATE_VALUES = new Set(
  Object.values(WORLD_CHUNK_COLLISION_STATES)
);
function isWorldChunkCollisionState(value3) {
  return COLLISION_STATE_VALUES.has(value3);
}
function assertWorldChunkCollisionState(value3) {
  if (!isWorldChunkCollisionState(value3)) {
    throw new TypeError(`Unknown world chunk collision state: ${String(value3)}`);
  }
  return value3;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionValues.js
var DEFAULT_COLLISION_EVENT_TIME = 0;
function assertCollisionOctree(octree) {
  if (!octree?.bounds?.toJSON || typeof octree.all !== "function") {
    throw new TypeError("Collision entry requires an octree with bounds and all().");
  }
  return octree;
}
function assertCollisionGenerationVersion(value3) {
  if (!Number.isSafeInteger(value3) || value3 < 1) {
    throw new TypeError("Collision generation version must be a positive integer.");
  }
  return value3;
}
function assertCollisionEventTime(value3) {
  if (!Number.isFinite(value3) || value3 < 0) {
    throw new TypeError("Collision event time must be a finite nonnegative number.");
  }
  return value3;
}
function freezeCollisionBounds(bounds = {}) {
  const frozen = Object.freeze({
    min: freezeVector2(bounds.min),
    max: freezeVector2(bounds.max)
  });
  for (const axis of ["x", "y", "z"]) {
    if (frozen.min[axis] >= frozen.max[axis]) {
      throw new RangeError(`Collision bounds require min < max on ${axis}.`);
    }
  }
  return frozen;
}
function assertExpectedCollisionBounds(actual, expected, chunkId) {
  if (!expected) {
    return;
  }
  const frozenExpected = freezeCollisionBounds(expected);
  if (!sameCollisionBounds(actual, frozenExpected)) {
    throw new Error(`Collision bounds mismatch for chunk: ${chunkId}`);
  }
}
function freezeCollisionEvidence(evidence = {}, fallbackName) {
  return Object.freeze({
    at: assertCollisionEventTime(
      evidence.at ?? DEFAULT_COLLISION_EVENT_TIME
    ),
    name: String(evidence.name || fallbackName),
    reason: String(evidence.reason || "")
  });
}
function collisionBoundsVolume(bounds) {
  return ["x", "y", "z"].reduce(
    (volume, axis) => volume * (bounds.max[axis] - bounds.min[axis]),
    1
  );
}
function sameCollisionBounds(left, right) {
  return ["min", "max"].every((side) => ["x", "y", "z"].every((axis) => left[side][axis] === right[side][axis]));
}
function freezeVector2(value3 = {}) {
  const vector3 = { x: value3.x, y: value3.y, z: value3.z };
  if (Object.values(vector3).some((component) => !Number.isFinite(component))) {
    throw new TypeError("Collision bounds must contain finite coordinates.");
  }
  return Object.freeze(vector3);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionEntry.js
var C = WORLD_CHUNK_COLLISION_STATES;
function createWorldChunkCollisionEntry({
  chunkId,
  parentId = null,
  octree,
  generationVersion = 1,
  expectedBounds = null
} = {}) {
  parseWorldChunkId(chunkId);
  if (parentId !== null) {
    parseWorldChunkId(parentId);
  }
  assertCollisionOctree(octree);
  assertCollisionGenerationVersion(generationVersion);
  const bounds = freezeCollisionBounds(octree.bounds.toJSON());
  assertExpectedCollisionBounds(bounds, expectedBounds, chunkId);
  return Object.freeze({
    chunkId,
    parentId,
    generationVersion,
    state: C.PREPARED,
    bounds,
    triangleCount: octree.all().length,
    validation: null,
    handoff: null,
    runtime: Object.freeze({ octree })
  });
}
function validateWorldChunkCollisionEntry(entry, evidence = {}) {
  assertEntryState(entry, C.PREPARED);
  return Object.freeze({
    ...entry,
    state: C.VALIDATED,
    validation: freezeCollisionEvidence(evidence, "collision-validator")
  });
}
function activateWorldChunkCollisionEntry(entry, handoffId, activatedAt = 0) {
  assertEntryState(entry, C.VALIDATED);
  assertHandoffId(handoffId);
  return Object.freeze({
    ...entry,
    state: C.ACTIVE,
    handoff: Object.freeze({
      id: handoffId,
      activatedAt: assertCollisionEventTime(activatedAt)
    })
  });
}
function discardWorldChunkCollisionEntry(entry, evidence = {}) {
  assertEntryState(entry, C.PREPARED, C.VALIDATED);
  return Object.freeze({
    ...entry,
    state: C.DISCARDED,
    discard: freezeCollisionEvidence(evidence, "collision-discard")
  });
}
function assertEntryState(entry, ...states) {
  const state = assertWorldChunkCollisionState(entry?.state);
  if (!states.includes(state)) {
    throw new Error(`Collision entry state must be one of: ${states.join(", ")}`);
  }
}
function assertHandoffId(value3) {
  if (typeof value3 !== "string" || !value3.trim()) {
    throw new TypeError("Collision handoff ID must be a nonempty string.");
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionDiagnostics.js
function createWorldChunkCollisionDiagnostics(activeEntries, preparedEntries, lastHandoff, lastDiscard) {
  const active = [...activeEntries];
  const prepared = [...preparedEntries];
  const validated = prepared.filter((entry) => entry.state === WORLD_CHUNK_COLLISION_STATES.VALIDATED);
  return Object.freeze({
    active: active.length,
    prepared: prepared.length,
    validated: validated.length,
    activeTriangles: triangleTotal(active),
    preparedTriangles: triangleTotal(prepared),
    activeIds: freezeIds(active),
    preparedIds: freezeIds(prepared),
    validatedIds: freezeIds(validated),
    activeEntries: freezeEntrySummaries(active),
    preparedEntries: freezeEntrySummaries(prepared),
    parentCoverage: freezeParentCoverage(active),
    lastHandoff: compactHandoff(lastHandoff),
    lastDiscard: compactDiscard(lastDiscard)
  });
}
function triangleTotal(entries) {
  return entries.reduce((total, entry) => total + entry.triangleCount, 0);
}
function freezeIds(entries) {
  return Object.freeze(entries.map((entry) => entry.chunkId).sort());
}
function freezeEntrySummaries(entries) {
  return Object.freeze(entries.map((entry) => Object.freeze({
    chunkId: entry.chunkId,
    parentId: entry.parentId,
    state: entry.state,
    bounds: entry.bounds,
    triangleCount: entry.triangleCount
  })).sort((left, right) => left.chunkId.localeCompare(right.chunkId)));
}
function freezeParentCoverage(entries) {
  const coverage = {};
  for (const entry of entries) {
    if (!entry.parentId) {
      continue;
    }
    coverage[entry.parentId] ||= [];
    coverage[entry.parentId].push(entry.chunkId);
  }
  for (const [parentId, childIds] of Object.entries(coverage)) {
    coverage[parentId] = Object.freeze(childIds.sort());
  }
  return Object.freeze(coverage);
}
function compactHandoff(value3) {
  if (!value3) {
    return null;
  }
  return Object.freeze({
    id: value3.id,
    parentId: value3.parentId,
    childIds: Object.freeze([...value3.childIds]),
    retainedParent: value3.retainedParent,
    at: value3.at,
    coverage: compactCoverage(value3.coverage)
  });
}
function compactCoverage(value3) {
  if (!value3) {
    return null;
  }
  return Object.freeze({
    parentBounds: value3.parentBounds,
    aggregateBounds: value3.aggregateBounds,
    parentVolume: value3.parentVolume,
    childVolume: value3.childVolume,
    childCount: value3.childCount,
    tolerance: value3.tolerance
  });
}
function compactDiscard(value3) {
  if (!value3) {
    return null;
  }
  return Object.freeze({
    chunkId: value3.chunkId,
    at: value3.at,
    reason: value3.reason
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionCoverage.js
var COLLISION_VOLUME_TOLERANCE = 1e-9;
function assertCollisionReplacementCoverage(parent, children) {
  if (!parent?.bounds || !Array.isArray(children) || children.length === 0) {
    throw new TypeError("Collision coverage requires one parent and child entries.");
  }
  for (const child of children) {
    assertContained(parent, child);
  }
  assertNoInteriorOverlap(children);
  const aggregateBounds = aggregateCollisionBounds(children);
  if (!sameCollisionBounds(parent.bounds, aggregateBounds)) {
    throw new Error("Collision children do not match the exact parent extents.");
  }
  const parentVolume = collisionBoundsVolume(parent.bounds);
  const childVolume = children.reduce(
    (total, child) => total + collisionBoundsVolume(child.bounds),
    0
  );
  const tolerance = Math.max(1, parentVolume) * COLLISION_VOLUME_TOLERANCE;
  if (Math.abs(parentVolume - childVolume) > tolerance) {
    throw new Error("Collision children leave a gap or duplicate parent volume.");
  }
  return Object.freeze({
    parentBounds: parent.bounds,
    aggregateBounds,
    parentVolume,
    childVolume,
    childCount: children.length,
    tolerance
  });
}
function aggregateCollisionBounds(children) {
  const aggregate = {
    min: { x: Infinity, y: Infinity, z: Infinity },
    max: { x: -Infinity, y: -Infinity, z: -Infinity }
  };
  for (const child of children) {
    for (const axis of ["x", "y", "z"]) {
      aggregate.min[axis] = Math.min(aggregate.min[axis], child.bounds.min[axis]);
      aggregate.max[axis] = Math.max(aggregate.max[axis], child.bounds.max[axis]);
    }
  }
  return freezeCollisionBounds(aggregate);
}
function assertContained(parent, child) {
  if (!child?.bounds) {
    throw new TypeError("Collision coverage child bounds are required.");
  }
  for (const axis of ["x", "y", "z"]) {
    if (child.bounds.min[axis] < parent.bounds.min[axis] || child.bounds.max[axis] > parent.bounds.max[axis]) {
      throw new Error(`Collision child escapes parent bounds: ${child.chunkId}`);
    }
  }
}
function assertNoInteriorOverlap(children) {
  for (let leftIndex = 0; leftIndex < children.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < children.length; rightIndex += 1) {
      if (hasInteriorOverlap(children[leftIndex], children[rightIndex])) {
        throw new Error("Collision children overlap with positive volume.");
      }
    }
  }
}
function hasInteriorOverlap(left, right) {
  return ["x", "y", "z"].every((axis) => Math.max(left.bounds.min[axis], right.bounds.min[axis]) < Math.min(left.bounds.max[axis], right.bounds.max[axis]));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionHandoff.js
function prepareCollisionReplacement(activeEntries, preparedEntries, options = {}) {
  const { parentId, childIds, retainParent = true, handoffId, at = 0 } = options;
  const orderedIds = canonicalIds(childIds);
  const parent = requireActiveParent(activeEntries, parentId);
  const children = orderedIds.map((childId) => {
    const child = preparedEntries.get(childId);
    if (!child) {
      throw new Error(`Prepared collision child is missing: ${childId}`);
    }
    if (child.state !== WORLD_CHUNK_COLLISION_STATES.VALIDATED) {
      throw new Error(`Collision child is not validated: ${childId}`);
    }
    if (child.parentId !== parentId) {
      throw new Error(`Collision child has the wrong parent: ${childId}`);
    }
    return child;
  });
  const coverage = assertCollisionReplacementCoverage(parent, children);
  const eventTime = assertCollisionEventTime(at);
  const nextActive = new Map(activeEntries);
  const nextPrepared = new Map(preparedEntries);
  for (const child of children) {
    nextActive.set(
      child.chunkId,
      activateWorldChunkCollisionEntry(child, handoffId, eventTime)
    );
    nextPrepared.delete(child.chunkId);
  }
  if (!retainParent) {
    nextActive.delete(parentId);
  }
  return {
    activeEntries: nextActive,
    preparedEntries: nextPrepared,
    handoff: freezeHandoff(
      parentId,
      orderedIds,
      retainParent,
      handoffId,
      eventTime,
      coverage
    )
  };
}
function prepareCollisionParentRetirement(activeEntries, options = {}) {
  const { parentId, replacementIds, handoffId, at = 0 } = options;
  const orderedIds = canonicalIds(replacementIds);
  const parent = requireActiveParent(activeEntries, parentId);
  const replacements = orderedIds.map((replacementId) => {
    const replacement = activeEntries.get(replacementId);
    if (!replacement || replacement.parentId !== parentId) {
      throw new Error(`Active replacement does not cover parent: ${replacementId}`);
    }
    return replacement;
  });
  const coverage = assertCollisionReplacementCoverage(parent, replacements);
  const nextActive = new Map(activeEntries);
  nextActive.delete(parentId);
  return {
    activeEntries: nextActive,
    handoff: freezeHandoff(
      parentId,
      orderedIds,
      false,
      handoffId,
      at,
      coverage
    )
  };
}
function canonicalIds(values) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new TypeError("Collision replacement IDs must be a nonempty array.");
  }
  if (values.some((value3) => typeof value3 !== "string")) {
    throw new TypeError("Collision replacement IDs must be strings.");
  }
  const unique2 = [...new Set(values)];
  if (unique2.length !== values.length) {
    throw new Error("Collision replacement IDs must be unique.");
  }
  return unique2.sort();
}
function requireActiveParent(activeEntries, parentId) {
  const parent = activeEntries.get(parentId);
  if (!parent) {
    throw new Error(`Active collision parent is missing: ${String(parentId)}`);
  }
  return parent;
}
function freezeHandoff(parentId, childIds, retainedParent, id, at, coverage) {
  if (typeof id !== "string" || !id.trim()) {
    throw new TypeError("Collision handoff ID must be a nonempty string.");
  }
  return Object.freeze({
    id,
    parentId,
    childIds: Object.freeze([...childIds]),
    retainedParent,
    at: assertCollisionEventTime(at),
    coverage
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionStore.js
var WorldChunkCollisionStore = class {
  constructor() {
    this.activeEntries = /* @__PURE__ */ new Map();
    this.preparedEntries = /* @__PURE__ */ new Map();
  }
  /** Returns one active entry without exposing map mutation. */
  getActive(id) {
    return this.activeEntries.get(id) || null;
  }
  /** Returns one prepared entry without exposing map mutation. */
  getPrepared(id) {
    return this.preparedEntries.get(id) || null;
  }
  /** Returns whether active ownership contains the stable ID. */
  hasActive(id) {
    return this.activeEntries.has(id);
  }
  /** Returns whether prepared ownership contains the stable ID. */
  hasPrepared(id) {
    return this.preparedEntries.has(id);
  }
  /** Returns a frozen, canonically ordered point-in-time active snapshot. */
  activeSnapshot() {
    return collisionEntrySnapshot(this.activeEntries);
  }
  /** Returns a frozen, canonically ordered point-in-time prepared snapshot. */
  preparedSnapshot() {
    return collisionEntrySnapshot(this.preparedEntries);
  }
  /** Returns an iterator over a stable active snapshot. */
  activeValues() {
    return this.activeSnapshot().values();
  }
  /** Returns an iterator over a stable prepared snapshot. */
  preparedValues() {
    return this.preparedSnapshot().values();
  }
  /** Rejects duplicate IDs across both ownership domains. */
  assertUnused(id) {
    if (this.hasActive(id) || this.hasPrepared(id)) {
      throw new Error(`Collision chunk is already registered: ${id}`);
    }
  }
  /** Returns a required prepared entry or throws with its stable ID. */
  requirePrepared(id) {
    const entry = this.getPrepared(id);
    if (!entry) {
      throw new Error(`Prepared collision chunk is missing: ${String(id)}`);
    }
    return entry;
  }
  /** Atomically replaces complete ownership maps after external validation. */
  replaceMaps(activeEntries, preparedEntries = this.preparedEntries) {
    if (!(activeEntries instanceof Map) || !(preparedEntries instanceof Map)) {
      throw new TypeError("Collision ownership replacements must be complete maps.");
    }
    this.activeEntries = activeEntries;
    this.preparedEntries = preparedEntries;
  }
};
function collisionEntrySnapshot(entries) {
  return Object.freeze(
    [...entries.values()].sort((left, right) => left.chunkId.localeCompare(right.chunkId))
  );
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionIndex.js
var WorldChunkCollisionIndex = class extends WorldChunkCollisionStore {
  constructor() {
    super();
    this.lastHandoff = null;
    this.lastDiscard = null;
  }
  /** Registers collision that was already accepted before streaming begins. */
  registerActive(definition) {
    this.assertUnused(definition.chunkId);
    const prepared = createWorldChunkCollisionEntry(definition);
    const validated = validateWorldChunkCollisionEntry(prepared, {
      name: "initial-active-collision",
      reason: "Existing collision is already live and proven."
    });
    const active = activateWorldChunkCollisionEntry(
      validated,
      `initial:${definition.chunkId}`
    );
    this.activeEntries.set(active.chunkId, active);
    return active;
  }
  /** Conceals one child entry until validation and group activation succeed. */
  prepare(definition) {
    this.assertUnused(definition.chunkId);
    const entry = createWorldChunkCollisionEntry(definition);
    this.preparedEntries.set(entry.chunkId, entry);
    return entry;
  }
  /** Replaces one prepared entry with its validated immutable form. */
  validate(id, evidence = {}) {
    const validated = validateWorldChunkCollisionEntry(
      this.requirePrepared(id),
      evidence
    );
    this.preparedEntries.set(id, validated);
    return validated;
  }
  /** Discards one nonactive child and preserves explicit rollback evidence. */
  discardPrepared(id, evidence = {}) {
    const discarded = discardWorldChunkCollisionEntry(
      this.requirePrepared(id),
      evidence
    );
    this.preparedEntries.delete(id);
    this.lastDiscard = Object.freeze({
      chunkId: id,
      at: discarded.discard.at,
      reason: discarded.discard.reason
    });
    return discarded;
  }
  /** Atomically activates one fully validated replacement group. */
  activateReplacement(options) {
    const next = prepareCollisionReplacement(
      this.activeEntries,
      this.preparedEntries,
      options
    );
    this.replaceMaps(next.activeEntries, next.preparedEntries);
    this.lastHandoff = next.handoff;
    return next.handoff;
  }
  /** Retires one retained parent at the caller's explicit sequence time. */
  retireActiveParent(parentId, replacementIds, handoffId, at = 0) {
    const next = prepareCollisionParentRetirement(this.activeEntries, {
      parentId,
      replacementIds,
      handoffId,
      at
    });
    this.replaceMaps(next.activeEntries);
    this.lastHandoff = next.handoff;
    return next.handoff;
  }
  /** Returns immutable active, prepared, handoff, and discard evidence. */
  diagnostics() {
    return createWorldChunkCollisionDiagnostics(
      this.activeValues(),
      this.preparedValues(),
      this.lastHandoff,
      this.lastDiscard
    );
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionQueryEvidence.js
var WorldChunkCollisionQueryEvidence = class {
  constructor() {
    this.operationSequence = 0;
    this.stats = {
      queries: 0,
      raycasts: 0,
      allCalls: 0,
      candidates: 0,
      duplicatesRemoved: 0
    };
    this.lastOperation = null;
  }
  /** Records one completed query operation against its original owner context. */
  record(type, context, candidates2, unique2, duplicatesRemoved) {
    this.operationSequence += 1;
    this.incrementType(type);
    this.stats.candidates += candidates2;
    this.stats.duplicatesRemoved += duplicatesRemoved;
    this.lastOperation = Object.freeze({
      sequence: this.operationSequence,
      type,
      ownerIds: context.ownerIds,
      revision: context.revision,
      candidates: candidates2,
      unique: unique2,
      duplicatesRemoved
    });
    return this.lastOperation;
  }
  /** Serializes current counters using the supplied point-in-time owner context. */
  diagnostics(context) {
    return Object.freeze({
      revision: context.revision,
      ownerIds: context.ownerIds,
      stats: Object.freeze({ ...this.stats }),
      lastOperation: this.lastOperation
    });
  }
  incrementType(type) {
    if (type === "query") {
      this.stats.queries += 1;
      return;
    }
    if (type === "raycast") {
      this.stats.raycasts += 1;
      return;
    }
    if (type === "all") {
      this.stats.allCalls += 1;
      return;
    }
    throw new Error(`Unknown collision query evidence type: ${String(type)}`);
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionQuerySelection.js
function selectWorldChunkCollisionQueryEntries(activeEntries = []) {
  if (!Array.isArray(activeEntries)) {
    throw new TypeError("Active collision query entries must be an array snapshot.");
  }
  const activeById = new Map(
    activeEntries.map((entry) => [entry.chunkId, entry])
  );
  return Object.freeze(
    activeEntries.filter((entry) => !entry.parentId || !activeById.has(entry.parentId)).sort((left, right) => left.chunkId.localeCompare(right.chunkId))
  );
}
function worldChunkCollisionQueryRevision(activeEntries = []) {
  return [...activeEntries].sort((left, right) => left.chunkId.localeCompare(right.chunkId)).map((entry) => [
    entry.chunkId,
    entry.parentId || "-",
    entry.generationVersion,
    entry.state,
    entry.handoff?.id || "-",
    entry.triangleCount
  ].join(":")).join("|");
}
function worldChunkCollisionQueryOwnerIds(entries = []) {
  return Object.freeze(entries.map((entry) => entry.chunkId));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionTriangleIdentity.js
var WorldChunkCollisionTriangleIdentity = class {
  constructor() {
    this.cachedKeys = /* @__PURE__ */ new WeakMap();
    this.fallbackIds = /* @__PURE__ */ new WeakMap();
    this.nextFallbackId = 1;
  }
  /** Returns one stable identity for a collider or test-double object. */
  keyFor(triangle2) {
    if (!isReference2(triangle2)) {
      return `${typeof triangle2}:${String(triangle2)}`;
    }
    if (this.cachedKeys.has(triangle2)) {
      return this.cachedKeys.get(triangle2);
    }
    const key = hasTriangleVertices(triangle2) ? geometricTriangleKey(triangle2) : this.fallbackKey(triangle2);
    this.cachedKeys.set(triangle2, key);
    return key;
  }
  fallbackKey(value3) {
    if (!this.fallbackIds.has(value3)) {
      this.fallbackIds.set(value3, this.nextFallbackId);
      this.nextFallbackId += 1;
    }
    return `object:${this.fallbackIds.get(value3)}`;
  }
};
function appendUniqueCollisionTriangles(triangles, output, identity2, seen = /* @__PURE__ */ new Set()) {
  let duplicatesRemoved = 0;
  for (const triangle2 of triangles) {
    const key = identity2.keyFor(triangle2);
    if (seen.has(key)) {
      duplicatesRemoved += 1;
      continue;
    }
    seen.add(key);
    output.push(triangle2);
  }
  return duplicatesRemoved;
}
function geometricTriangleKey(triangle2) {
  const vertices = [triangle2.a, triangle2.b, triangle2.c].map(vectorKey).sort().join(";");
  return [
    "triangle",
    String(triangle2.kind || ""),
    triangle2.solid !== false ? "solid" : "open",
    triangle2.floor ? "floor" : "wall",
    vertices
  ].join("|");
}
function vectorKey(vector3) {
  return [vector3.x, vector3.y, vector3.z].map((component) => Number(component).toString()).join(",");
}
function hasTriangleVertices(value3) {
  return [value3.a, value3.b, value3.c].every((vector3) => vector3 && [vector3.x, vector3.y, vector3.z].every(Number.isFinite));
}
function isReference2(value3) {
  return !!value3 && (typeof value3 === "object" || typeof value3 === "function");
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionQueryFacade.js
var WorldChunkCollisionQueryFacade = class {
  constructor(index) {
    if (typeof index?.activeSnapshot !== "function") {
      throw new TypeError("Composite collision query requires an active collision index.");
    }
    this.index = index;
    this.identity = new WorldChunkCollisionTriangleIdentity();
    this.evidence = new WorldChunkCollisionQueryEvidence();
  }
  /** Returns the canonical active-ownership revision for dependent caches. */
  get revision() {
    return this.createContext().revision;
  }
  /** Appends unique candidates from one immutable selected-owner snapshot. */
  query(aabb, output = []) {
    return this.collectTriangles("query", aabb, output);
  }
  /** Returns the nearest predicate-approved hit across active owners. */
  raycast(ray, maximumDistance = Infinity, predicate = () => true) {
    const context = this.createContext();
    let nearest = null;
    let candidates2 = 0;
    for (const owner of context.owners) {
      const hit = owner.runtime.octree.raycast(
        ray,
        maximumDistance,
        predicate
      );
      if (!hit || !Number.isFinite(hit.distance)) {
        continue;
      }
      candidates2 += 1;
      if (!nearest || hit.distance < nearest.distance) {
        nearest = hit;
      }
    }
    this.evidence.record(
      "raycast",
      context,
      candidates2,
      nearest ? 1 : 0,
      0
    );
    return nearest;
  }
  /** Appends every unique triangle from canonical active query owners. */
  all(output = []) {
    return this.collectTriangles("all", null, output);
  }
  /** Returns frozen deterministic metrics from one ownership snapshot. */
  diagnostics() {
    return this.evidence.diagnostics(this.createContext());
  }
  collectTriangles(type, aabb, output) {
    const context = this.createContext();
    const startingLength = output.length;
    const seen = /* @__PURE__ */ new Set();
    let candidates2 = 0;
    let duplicatesRemoved = 0;
    for (const owner of context.owners) {
      const octree = owner.runtime.octree;
      const found = type === "query" ? octree.query(aabb, []) : octree.all([]);
      candidates2 += found.length;
      duplicatesRemoved += appendUniqueCollisionTriangles(
        found,
        output,
        this.identity,
        seen
      );
    }
    this.evidence.record(
      type,
      context,
      candidates2,
      output.length - startingLength,
      duplicatesRemoved
    );
    return output;
  }
  createContext() {
    const activeEntries = this.index.activeSnapshot();
    const owners = selectWorldChunkCollisionQueryEntries(activeEntries);
    return Object.freeze({
      owners,
      ownerIds: worldChunkCollisionQueryOwnerIds(owners),
      revision: worldChunkCollisionQueryRevision(activeEntries)
    });
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionStreamingJobDiagnostics.js
function createCollisionStreamingJobDiagnostics(job) {
  return Object.freeze({
    requestId: job.request.requestId,
    parentId: job.request.parentId,
    state: job.state,
    terminal: job.terminal,
    requestedAt: job.request.requestedAt,
    lastAt: job.lastAt,
    sourceTriangles: job.request.triangles.length,
    generationVersion: job.request.generationVersion,
    maximumGenerationUnits: job.request.maximumGenerationUnits,
    sortRunSize: job.request.sortRunSize,
    generation: job.generated?.diagnostics || null,
    childIds: job.childIds,
    nextValidationIndex: job.nextValidationIndex,
    observationFrames: job.observationFrames,
    minimumObservationFrames: job.request.minimumObservationFrames,
    cancelRequest: job.cancelRequest,
    retirementRequest: job.retirementRequest,
    error: job.error,
    rollback: job.rollback,
    history: Object.freeze([...job.history]),
    ...job.generationTelemetry.diagnostics()
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionStreamingGenerationTelemetry.js
var WorldChunkCollisionStreamingGenerationTelemetry = class {
  constructor() {
    this.stepCount = 0;
    this.totalUnits = 0;
    this.cumulativeDurationMs = 0;
    this.maximumStepDurationMs = 0;
    this.maximumStep = null;
    this.progress = null;
  }
  /** Records one measured generator step and its compact progress. */
  record(receipt, durationMs) {
    const duration = Number.isFinite(durationMs) ? Math.max(0, durationMs) : 0;
    this.stepCount += 1;
    this.totalUnits += receipt.units;
    this.cumulativeDurationMs += duration;
    this.progress = receipt.progress;
    if (duration >= this.maximumStepDurationMs) {
      this.maximumStepDurationMs = duration;
      this.maximumStep = Object.freeze({
        phase: receipt.previousPhase,
        units: receipt.units,
        durationMs: duration
      });
    }
  }
  /** Returns immutable generation telemetry. */
  diagnostics() {
    return Object.freeze({
      generationStepCount: this.stepCount,
      generationTotalUnits: this.totalUnits,
      generationDurationMs: this.cumulativeDurationMs,
      generationMaximumStepDurationMs: this.maximumStepDurationMs,
      generationMaximumStep: this.maximumStep,
      generationProgress: this.progress
    });
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionStreamingStates.js
var WORLD_CHUNK_COLLISION_STREAMING_STATES = Object.freeze({
  GENERATION_PENDING: "generation-pending",
  GENERATING: "generating",
  GENERATED: "generated",
  PREPARED: "prepared",
  VALIDATING: "validating",
  VALIDATED: "validated",
  RETAINED_ACTIVE: "retained-active",
  OBSERVING: "observing",
  RETIREMENT_READY: "retirement-ready",
  RETIRED: "retired",
  CANCELLED: "cancelled",
  FAILED: "failed",
  ROLLBACK_FAILED: "rollback-failed",
  MANUAL_RECOVERY: "manual-recovery"
});
var S = WORLD_CHUNK_COLLISION_STREAMING_STATES;
var TERMINAL_STATES = /* @__PURE__ */ new Set([
  S.RETIRED,
  S.CANCELLED,
  S.FAILED,
  S.ROLLBACK_FAILED,
  S.MANUAL_RECOVERY
]);
var TRANSITIONS = Object.freeze({
  [S.GENERATION_PENDING]: freezeStates(S.GENERATING, S.CANCELLED, S.FAILED),
  [S.GENERATING]: freezeStates(S.GENERATED, S.CANCELLED, S.FAILED),
  [S.GENERATED]: freezeStates(S.PREPARED, S.CANCELLED, S.FAILED),
  [S.PREPARED]: freezeStates(S.VALIDATING, S.VALIDATED, S.CANCELLED, S.FAILED),
  [S.VALIDATING]: freezeStates(S.VALIDATING, S.VALIDATED, S.CANCELLED, S.FAILED),
  [S.VALIDATED]: freezeStates(S.RETAINED_ACTIVE, S.CANCELLED, S.FAILED),
  [S.RETAINED_ACTIVE]: freezeStates(S.OBSERVING, S.MANUAL_RECOVERY),
  [S.OBSERVING]: freezeStates(S.OBSERVING, S.RETIREMENT_READY, S.MANUAL_RECOVERY),
  [S.RETIREMENT_READY]: freezeStates(S.RETIRED, S.MANUAL_RECOVERY),
  [S.RETIRED]: freezeStates(),
  [S.CANCELLED]: freezeStates(),
  [S.FAILED]: freezeStates(S.ROLLBACK_FAILED),
  [S.ROLLBACK_FAILED]: freezeStates(),
  [S.MANUAL_RECOVERY]: freezeStates()
});
function assertCollisionStreamingState(value3) {
  if (!Object.values(S).includes(value3)) {
    throw new TypeError(`Unknown collision streaming state: ${String(value3)}`);
  }
  return value3;
}
function isCollisionStreamingTerminal(value3) {
  return TERMINAL_STATES.has(assertCollisionStreamingState(value3));
}
function canTransitionCollisionStreaming(fromState, toState) {
  assertCollisionStreamingState(fromState);
  assertCollisionStreamingState(toState);
  return TRANSITIONS[fromState].includes(toState);
}
function freezeStates(...states) {
  return Object.freeze(states);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionStreamingJob.js
var WorldChunkCollisionStreamingJob = class {
  constructor(request) {
    this.request = request;
    this.state = WORLD_CHUNK_COLLISION_STREAMING_STATES.GENERATION_PENDING;
    this.generator = null;
    this.generated = null;
    this.handoff = null;
    this.childIds = Object.freeze([]);
    this.nextValidationIndex = 0;
    this.observationFrames = 0;
    this.cancelRequest = null;
    this.retirementRequest = null;
    this.error = null;
    this.rollback = null;
    this.lastAt = request.requestedAt;
    this.history = [];
    this.generationTelemetry = new WorldChunkCollisionStreamingGenerationTelemetry();
  }
  /** Returns whether the scheduler has reached a terminal state. */
  get terminal() {
    return isCollisionStreamingTerminal(this.state);
  }
  /** Records one legal state transition with deterministic sequence time. */
  transition(nextState, operation, at, details = null) {
    this.assertTime(at);
    if (!canTransitionCollisionStreaming(this.state, nextState)) {
      throw new Error(`Illegal collision streaming transition: ${this.state} -> ${nextState}`);
    }
    const previousState = this.state;
    this.state = nextState;
    this.lastAt = at;
    this.history.push(Object.freeze({
      operation,
      at,
      from: previousState,
      to: nextState,
      details
    }));
    return this.state;
  }
  /** Stores one measured generation step without growing lifecycle history. */
  recordGenerationStep(receipt, durationMs, at) {
    this.assertTime(at);
    this.lastAt = at;
    this.generationTelemetry.record(receipt, durationMs);
  }
  /** Stores generated runtime data while exposing only immutable diagnostics. */
  setGenerated(generated) {
    this.generated = generated;
    this.childIds = Object.freeze(
      generated.definitions.map((definition) => definition.chunkId)
    );
  }
  /** Requests deterministic cancellation before retained activation. */
  requestCancel(reason, at) {
    this.assertTime(at);
    this.cancelRequest = Object.freeze({ reason, at });
  }
  /** Requests parent retirement after retained observation. */
  requestRetirement(at) {
    this.assertTime(at);
    this.retirementRequest = Object.freeze({ at });
  }
  /** Stores compact failure evidence without retaining the Error object. */
  setError(error, operation) {
    this.error = Object.freeze({
      operation,
      name: error?.name || "Error",
      message: error?.message || String(error)
    });
  }
  /** Returns immutable diagnostics without source triangles or octrees. */
  diagnostics() {
    return createCollisionStreamingJobDiagnostics(this);
  }
  assertTime(at) {
    if (!Number.isFinite(at) || at < this.lastAt) {
      throw new TypeError("Collision streaming time must be finite and nondecreasing.");
    }
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionIncrementalValues.js
var DEFAULT_COLLISION_GENERATION_UNITS = 64;
var DEFAULT_COLLISION_SORT_RUN_SIZE = 128;
var MAXIMUM_COLLISION_SORT_RUN_SIZE = 256;
function createCollisionIncrementalOptions(options = {}) {
  if (!Array.isArray(options.triangles) || options.triangles.length === 0) {
    throw new TypeError("Incremental collision generation requires triangles.");
  }
  return Object.freeze({
    parentId: options.parentId,
    parentBounds: options.parentBounds,
    parentSeed: requireSafeInteger(options.parentSeed ?? 0, "Parent seed"),
    generationVersion: requirePositiveInteger(
      options.generationVersion ?? 1,
      "Generation version"
    ),
    triangles: options.triangles,
    defaultStepUnits: requireCollisionGenerationUnits(
      options.defaultStepUnits ?? DEFAULT_COLLISION_GENERATION_UNITS
    ),
    sortRunSize: Math.min(
      requirePositiveInteger(
        options.sortRunSize ?? DEFAULT_COLLISION_SORT_RUN_SIZE,
        "Sort run size"
      ),
      MAXIMUM_COLLISION_SORT_RUN_SIZE
    )
  });
}
function requireCollisionGenerationUnits(value3) {
  if (!Number.isSafeInteger(value3) || value3 < 0) {
    throw new TypeError("Collision generation units must be nonnegative.");
  }
  return value3;
}
function compareCollisionSourceKeys(left, right) {
  return left.key.localeCompare(right.key);
}
function requirePositiveInteger(value3, label) {
  const integer = requireSafeInteger(value3, label);
  if (integer < 1) {
    throw new TypeError(`${label} must be positive.`);
  }
  return integer;
}
function requireSafeInteger(value3, label) {
  if (!Number.isSafeInteger(value3)) {
    throw new TypeError(`${label} must be a safe integer.`);
  }
  return value3;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionStreamingValues.js
function createCollisionStreamingRequest(options, parentRecord, sourceTriangles) {
  const requestId = requireText(options?.requestId, "Collision request ID");
  const requestedAt = requireTime(options?.at, "Collision request time");
  parseWorldChunkId(parentRecord?.id);
  const triangles = requireTriangles(sourceTriangles);
  return Object.freeze({
    requestId,
    requestedAt,
    parentId: parentRecord.id,
    parentBounds: parentRecord.bounds,
    parentSeed: requireSafeInteger2(
      options?.parentSeed ?? parentRecord.deterministicSeed,
      "Collision parent seed"
    ),
    generationVersion: requirePositiveInteger(
      options?.generationVersion ?? parentRecord.generationVersion,
      "Collision generation version"
    ),
    minimumObservationFrames: requirePositiveInteger(
      options?.minimumObservationFrames ?? 1,
      "Minimum observation frames"
    ),
    maximumGenerationUnits: requirePositiveInteger(
      options?.maximumGenerationUnits ?? DEFAULT_COLLISION_GENERATION_UNITS,
      "Maximum generation units"
    ),
    sortRunSize: requirePositiveInteger(
      options?.sortRunSize ?? DEFAULT_COLLISION_SORT_RUN_SIZE,
      "Collision sort run size"
    ),
    triangles: Object.freeze([...triangles])
  });
}
function createCollisionStreamingUpdate(options, requiresTime) {
  const maximumOperations = options?.maximumOperations ?? 1;
  if (!Number.isSafeInteger(maximumOperations) || maximumOperations < 0) {
    throw new TypeError("Collision operation budget must be nonnegative.");
  }
  return Object.freeze({
    at: requiresTime ? requireTime(options?.at, "Collision update time") : options?.at ?? null,
    maximumOperations: Math.min(1, maximumOperations),
    maximumGenerationUnits: options?.maximumGenerationUnits === void 0 ? null : requireCollisionGenerationUnits(options.maximumGenerationUnits)
  });
}
function collisionStreamingHandoffIds(requestId) {
  const stableId = requireText(requestId, "Collision request ID");
  return Object.freeze({
    activation: `${stableId}:retained-active`,
    retirement: `${stableId}:parent-retired`
  });
}
function requireCollisionStreamingTime(value3, label) {
  return requireTime(value3, label);
}
function requireCollisionStreamingText(value3, label) {
  return requireText(value3, label);
}
function requireTriangles(value3) {
  if (!Array.isArray(value3) || value3.length === 0) {
    throw new TypeError("Collision source triangles are required.");
  }
  return value3;
}
function requireTime(value3, label) {
  if (!Number.isFinite(value3)) {
    throw new TypeError(`${label} must be finite.`);
  }
  return value3;
}
function requireText(value3, label) {
  if (typeof value3 !== "string" || value3.trim().length === 0) {
    throw new TypeError(`${label} must be nonempty text.`);
  }
  return value3.trim();
}
function requireSafeInteger2(value3, label) {
  if (!Number.isSafeInteger(value3)) {
    throw new TypeError(`${label} must be a safe integer.`);
  }
  return value3;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionStreamingControl.js
var RETAINED_STATES = Object.freeze([
  WORLD_CHUNK_COLLISION_STREAMING_STATES.RETAINED_ACTIVE,
  WORLD_CHUNK_COLLISION_STREAMING_STATES.OBSERVING,
  WORLD_CHUNK_COLLISION_STREAMING_STATES.RETIREMENT_READY
]);
function acceptCollisionStreamingRequest(runtime, options) {
  if (runtime.currentJob && !runtime.currentJob.terminal) {
    throw new Error("A collision streaming job is already active.");
  }
  if (!runtime.index.hasActive(runtime.parentRecord.id)) {
    throw new Error("The bootstrap collision parent is not active.");
  }
  runtime.lastJob = runtime.currentJob?.diagnostics() || runtime.lastJob;
  const request = createCollisionStreamingRequest(
    options,
    runtime.parentRecord,
    runtime.sourceTriangles
  );
  runtime.currentJob = new WorldChunkCollisionStreamingJob(request);
  return runtime.currentJob.diagnostics();
}
function requestCollisionStreamingCancellation(runtime, options) {
  const job = requireActiveCollisionStreamingJob(runtime);
  if (RETAINED_STATES.includes(job.state)) {
    return Object.freeze({
      accepted: false,
      reason: "retained-activation-already-visible"
    });
  }
  job.requestCancel(
    requireCollisionStreamingText(
      options?.reason ?? "cancelled-by-request",
      "Cancellation reason"
    ),
    requireCollisionStreamingTime(options?.at, "Cancellation time")
  );
  return Object.freeze({ accepted: true, state: job.state });
}
function requestCollisionStreamingRetirement(runtime, options) {
  const job = requireActiveCollisionStreamingJob(runtime);
  if (!RETAINED_STATES.includes(job.state)) {
    throw new Error(`Parent retirement is unavailable during ${job.state}.`);
  }
  const requestedAt = requireCollisionStreamingTime(
    options?.at,
    "Retirement request time"
  );
  if (requestedAt <= job.lastAt) {
    throw new Error("Retirement request time must follow lifecycle time.");
  }
  job.requestRetirement(requestedAt);
  return job.diagnostics();
}
function requireActiveCollisionStreamingJob(runtime) {
  if (!runtime.currentJob || runtime.currentJob.terminal) {
    throw new Error("No active collision streaming job exists.");
  }
  return runtime.currentJob;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionStreamingGenerationOperations.js
function beginCollisionStreamingGeneration(job, dependencies, at) {
  job.generator = dependencies.createGenerator({
    parentId: job.request.parentId,
    parentBounds: job.request.parentBounds,
    parentSeed: job.request.parentSeed,
    generationVersion: job.request.generationVersion,
    triangles: job.request.triangles,
    defaultStepUnits: job.request.maximumGenerationUnits,
    sortRunSize: job.request.sortRunSize
  });
  job.transition(WORLD_CHUNK_COLLISION_STREAMING_STATES.GENERATING, "begin-generation", at, Object.freeze({
    maximumGenerationUnits: job.request.maximumGenerationUnits,
    sortRunSize: job.request.sortRunSize
  }));
  return "begin-generation";
}
function stepCollisionStreamingGeneration(job, dependencies, at, maximumUnits) {
  const measured = dependencies.measure(() => job.generator.step({ maximumUnits }));
  job.recordGenerationStep(measured.value, measured.durationMs, at);
  if (!measured.value.completed) {
    return "generation-step";
  }
  job.setGenerated(job.generator.result());
  job.transition(WORLD_CHUNK_COLLISION_STREAMING_STATES.GENERATED, "complete-generation", at, Object.freeze({
    childCount: job.childIds.length,
    generationStepCount: job.generationTelemetry.stepCount,
    generationDurationMs: job.generationTelemetry.cumulativeDurationMs
  }));
  return "complete-generation";
}
function disposeCollisionStreamingGeneration(job, reason) {
  if (job.generator && !job.generator.diagnostics().completed) {
    job.generator.dispose(reason);
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionGeneratedHandoffValues.js
function assertGeneratedHandoffIndex(index) {
  const methods = [
    "prepare",
    "validate",
    "activateReplacement",
    "retireActiveParent",
    "preparedSnapshot",
    "diagnostics"
  ];
  if (!methods.every((method) => typeof index?.[method] === "function")) {
    throw new TypeError("Generated handoff requires an accepted collision index.");
  }
  return index;
}
function canonicalGeneratedHandoffDefinitions(definitions, parentId) {
  if (!Array.isArray(definitions) || definitions.length === 0) {
    throw new TypeError("Generated collision definitions are required.");
  }
  const ordered = [...definitions].sort((left, right) => left.chunkId.localeCompare(right.chunkId));
  const identifiers = ordered.map((definition) => definition.chunkId);
  if (new Set(identifiers).size !== identifiers.length) {
    throw new Error("Generated collision child IDs must be unique.");
  }
  for (const definition of ordered) {
    assertGeneratedDefinition(definition, parentId);
  }
  return Object.freeze(ordered);
}
function generatedHandoffIndexDefinition(definition) {
  return Object.freeze({
    chunkId: definition.chunkId,
    parentId: definition.parentId,
    octree: definition.octree,
    generationVersion: definition.generationVersion,
    expectedBounds: definition.expectedBounds
  });
}
function requireGeneratedHandoffText(value3, label) {
  if (typeof value3 !== "string" || value3.length === 0) {
    throw new TypeError(`${label} must be nonempty text.`);
  }
  return value3;
}
function requireGeneratedHandoffTime(value3, label) {
  if (!Number.isFinite(value3)) {
    throw new TypeError(`${label} must be finite.`);
  }
  return value3;
}
function assertGeneratedDefinition(definition, parentId) {
  if (!definition?.chunkId || definition.parentId !== parentId) {
    throw new Error(`Invalid generated collision child: ${definition?.chunkId}`);
  }
  if (!definition.octree || !definition.expectedBounds) {
    throw new Error(`Generated collision child lacks geometry: ${definition.chunkId}`);
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionGeneratedHandoff.js
var WorldChunkCollisionGeneratedHandoff = class {
  constructor({ index, parentId, definitions } = {}) {
    this.index = assertGeneratedHandoffIndex(index);
    this.parentId = requireGeneratedHandoffText(parentId, "Parent collision ID");
    this.definitions = canonicalGeneratedHandoffDefinitions(
      definitions,
      this.parentId
    );
    this.childIds = Object.freeze(
      this.definitions.map((definition) => definition.chunkId)
    );
    this.phase = "created";
  }
  /** Prepares every generated child in canonical ID order. */
  prepareAll() {
    this.requirePhase("created");
    for (const definition of this.definitions) {
      this.index.prepare(generatedHandoffIndexDefinition(definition));
    }
    this.phase = "prepared";
    return this.receipt("prepare");
  }
  /** Validates one owned child using explicit deterministic evidence. */
  validateOne(chunkId, evidence = {}) {
    if (!["prepared", "validating"].includes(this.phase)) {
      throw new Error(`Cannot validate generated children during ${this.phase}.`);
    }
    if (!this.childIds.includes(chunkId)) {
      throw new Error(`Unknown generated collision child: ${String(chunkId)}`);
    }
    const at = requireGeneratedHandoffTime(evidence.at, "Validation time");
    this.index.validate(chunkId, Object.freeze({ ...evidence, at }));
    this.phase = this.allValidated() ? "validated" : "validating";
    return this.receipt("validate", chunkId);
  }
  /** Validates every remaining child in canonical order at one sequence time. */
  validateAll({ at, name = "generated-child-validation" } = {}) {
    requireGeneratedHandoffTime(at, "Validation time");
    for (const chunkId of this.childIds) {
      if (!this.validatedIds().includes(chunkId)) {
        this.validateOne(chunkId, { at, name });
      }
    }
    return this.receipt("validate-all");
  }
  /** Activates all validated children while retaining the active parent. */
  activateRetained({ handoffId, at } = {}) {
    this.requirePhase("validated");
    this.index.activateReplacement({
      parentId: this.parentId,
      childIds: this.childIds,
      retainParent: true,
      handoffId: requireGeneratedHandoffText(handoffId, "Handoff ID"),
      at: requireGeneratedHandoffTime(at, "Handoff time")
    });
    this.phase = "retained-active";
    return this.receipt("activate-retained");
  }
  /** Retires the parent after complete accepted child activation. */
  retireParent({ handoffId, at } = {}) {
    this.requirePhase("retained-active");
    this.index.retireActiveParent(
      this.parentId,
      this.childIds,
      requireGeneratedHandoffText(handoffId, "Retirement ID"),
      requireGeneratedHandoffTime(at, "Retirement time")
    );
    this.phase = "retired";
    return this.receipt("retire-parent");
  }
  allValidated() {
    return this.validatedIds().length === this.childIds.length;
  }
  validatedIds() {
    return this.index.preparedSnapshot().filter((entry) => entry.state === WORLD_CHUNK_COLLISION_STATES.VALIDATED).map((entry) => entry.chunkId).filter((chunkId) => this.childIds.includes(chunkId));
  }
  receipt(operation, chunkId = null) {
    return Object.freeze({
      operation,
      chunkId,
      phase: this.phase,
      parentId: this.parentId,
      childIds: this.childIds,
      diagnostics: this.index.diagnostics()
    });
  }
  requirePhase(expected) {
    if (this.phase !== expected) {
      throw new Error(`Expected handoff phase ${expected}, got ${this.phase}.`);
    }
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionStreamingOperations.js
function prepareCollisionStreamingChildren(job, index, at) {
  job.handoff = new WorldChunkCollisionGeneratedHandoff({
    index,
    parentId: job.request.parentId,
    definitions: job.generated.definitions
  });
  job.handoff.prepareAll();
  job.transition(WORLD_CHUNK_COLLISION_STREAMING_STATES.PREPARED, "prepare-children", at, Object.freeze({
    preparedIds: job.childIds
  }));
}
function validateNextCollisionStreamingChild(job, at) {
  const chunkId = job.childIds[job.nextValidationIndex];
  job.handoff.validateOne(chunkId, {
    at,
    name: `${job.request.requestId}:validation`
  });
  job.nextValidationIndex += 1;
  const complete = job.nextValidationIndex === job.childIds.length;
  job.transition(
    complete ? WORLD_CHUNK_COLLISION_STREAMING_STATES.VALIDATED : WORLD_CHUNK_COLLISION_STREAMING_STATES.VALIDATING,
    "validate-child",
    at,
    Object.freeze({ chunkId, complete })
  );
}
function activateCollisionStreamingChildren(job, at) {
  const ids = collisionStreamingHandoffIds(job.request.requestId);
  job.handoff.activateRetained({ handoffId: ids.activation, at });
  job.transition(WORLD_CHUNK_COLLISION_STREAMING_STATES.RETAINED_ACTIVE, "activate-retained", at, Object.freeze({
    parentRetained: true,
    childIds: job.childIds
  }));
}
function observeCollisionStreamingHandoff(job, at) {
  const alreadyObserving = job.state === WORLD_CHUNK_COLLISION_STREAMING_STATES.OBSERVING;
  job.observationFrames += 1;
  const ready = alreadyObserving && job.observationFrames >= job.request.minimumObservationFrames;
  job.transition(
    ready ? WORLD_CHUNK_COLLISION_STREAMING_STATES.RETIREMENT_READY : WORLD_CHUNK_COLLISION_STREAMING_STATES.OBSERVING,
    "observe-retained",
    at,
    Object.freeze({ frames: job.observationFrames, ready })
  );
}
function retireCollisionStreamingParent(job, at) {
  const ids = collisionStreamingHandoffIds(job.request.requestId);
  job.handoff.retireParent({ handoffId: ids.retirement, at });
  job.transition(WORLD_CHUNK_COLLISION_STREAMING_STATES.RETIRED, "retire-parent", at, Object.freeze({
    parentId: job.request.parentId,
    childIds: job.childIds
  }));
}
function rollbackCollisionStreamingChildren(job, index, at, reason) {
  const discardedIds = [];
  for (const chunkId of [...job.childIds].reverse()) {
    if (index.hasPrepared(chunkId)) {
      index.discardPrepared(chunkId, { at, reason });
      discardedIds.push(chunkId);
    }
  }
  const leakedIds = job.childIds.filter((chunkId) => index.hasPrepared(chunkId) || index.hasActive(chunkId));
  job.rollback = Object.freeze({
    at,
    reason,
    discardedIds: Object.freeze(discardedIds),
    leakedIds: Object.freeze(leakedIds)
  });
  if (leakedIds.length > 0) {
    throw new Error(`Collision rollback leaked children: ${leakedIds.join(", ")}`);
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionStreamingEngine.js
function advanceCollisionStreamingJob({
  job,
  index,
  dependencies,
  at,
  maximumGenerationUnits
}) {
  switch (job.state) {
    case WORLD_CHUNK_COLLISION_STREAMING_STATES.GENERATION_PENDING:
      return beginCollisionStreamingGeneration(job, dependencies, at);
    case WORLD_CHUNK_COLLISION_STREAMING_STATES.GENERATING:
      return stepCollisionStreamingGeneration(
        job,
        dependencies,
        at,
        maximumGenerationUnits
      );
    case WORLD_CHUNK_COLLISION_STREAMING_STATES.GENERATED:
      prepareCollisionStreamingChildren(job, index, at);
      break;
    case WORLD_CHUNK_COLLISION_STREAMING_STATES.PREPARED:
    case WORLD_CHUNK_COLLISION_STREAMING_STATES.VALIDATING:
      validateNextCollisionStreamingChild(job, at);
      break;
    case WORLD_CHUNK_COLLISION_STREAMING_STATES.VALIDATED:
      activateCollisionStreamingChildren(job, at);
      break;
    case WORLD_CHUNK_COLLISION_STREAMING_STATES.RETAINED_ACTIVE:
    case WORLD_CHUNK_COLLISION_STREAMING_STATES.OBSERVING:
      observeCollisionStreamingHandoff(job, at);
      break;
    case WORLD_CHUNK_COLLISION_STREAMING_STATES.RETIREMENT_READY:
      return retireAuthorizedParent(job, at);
    default:
      return "no-operation";
  }
  return job.history.at(-1)?.operation || "no-operation";
}
function cancelCollisionStreamingJob(job, index, at) {
  if ([WORLD_CHUNK_COLLISION_STREAMING_STATES.GENERATION_PENDING, WORLD_CHUNK_COLLISION_STREAMING_STATES.GENERATING].includes(job.state)) {
    disposeCollisionStreamingGeneration(job, job.cancelRequest.reason);
    job.transition(WORLD_CHUNK_COLLISION_STREAMING_STATES.CANCELLED, "cancel-generation", at, job.cancelRequest);
    return "cancel-generation";
  }
  rollbackCollisionStreamingChildren(job, index, at, job.cancelRequest.reason);
  job.transition(WORLD_CHUNK_COLLISION_STREAMING_STATES.CANCELLED, "cancel-and-rollback", at, job.rollback);
  return "cancel-and-rollback";
}
function recoverCollisionStreamingFailure(job, index, error, at) {
  job.setError(error, job.history.at(-1)?.operation || "advance");
  if ([WORLD_CHUNK_COLLISION_STREAMING_STATES.GENERATION_PENDING, WORLD_CHUNK_COLLISION_STREAMING_STATES.GENERATING].includes(job.state)) {
    disposeCollisionStreamingGeneration(job, job.error.message);
    job.transition(WORLD_CHUNK_COLLISION_STREAMING_STATES.FAILED, "generation-failed", at, job.error);
    return "generation-failed";
  }
  if ([WORLD_CHUNK_COLLISION_STREAMING_STATES.RETAINED_ACTIVE, WORLD_CHUNK_COLLISION_STREAMING_STATES.OBSERVING, WORLD_CHUNK_COLLISION_STREAMING_STATES.RETIREMENT_READY].includes(job.state)) {
    job.transition(WORLD_CHUNK_COLLISION_STREAMING_STATES.MANUAL_RECOVERY, "post-activation-failure", at, job.error);
    return "manual-recovery";
  }
  try {
    rollbackCollisionStreamingChildren(job, index, at, job.error.message);
    job.transition(WORLD_CHUNK_COLLISION_STREAMING_STATES.FAILED, "failure-rollback", at, job.error);
    return "failure-rollback";
  } catch (rollbackError) {
    job.transition(WORLD_CHUNK_COLLISION_STREAMING_STATES.FAILED, "failure-before-rollback", at, job.error);
    job.setError(rollbackError, "rollback");
    job.transition(WORLD_CHUNK_COLLISION_STREAMING_STATES.ROLLBACK_FAILED, "rollback-failed", at, job.error);
    return "rollback-failed";
  }
}
function retireAuthorizedParent(job, at) {
  if (!job.retirementRequest || at < job.retirementRequest.at) {
    return "retirement-locked";
  }
  retireCollisionStreamingParent(job, at);
  return "retire-parent";
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionIncrementalDiagnostics.js
var FNV_OFFSET = 2166136261;
var FNV_PRIME = 16777619;
function createCollisionDigestState() {
  return FNV_OFFSET;
}
function updateCollisionDigestState(hash2, key, keyIndex) {
  let nextHash = hash2 >>> 0;
  if (keyIndex > 0) {
    nextHash = hashText(nextHash, "\n");
  }
  return hashText(nextHash, key);
}
function finalizeCollisionDigest(hash2) {
  return (hash2 >>> 0).toString(16).padStart(8, "0");
}
function createCollisionIncrementalFinalDiagnostics({
  options,
  layout,
  assignment,
  childDiagnostics
}) {
  return Object.freeze({
    parentId: options.parentId,
    generationVersion: options.generationVersion,
    parentBounds: layout.parentBounds,
    aggregateChildBounds: layout.aggregateChildBounds,
    parentVolume: layout.parentVolume,
    childVolume: layout.childVolume,
    childCount: childDiagnostics.length,
    sourceCount: assignment.sourceCount,
    uniqueSourceCount: assignment.uniqueSourceCount,
    duplicateSourceCount: assignment.duplicateSourceCount,
    totalAssignments: assignment.totalAssignments,
    overlapDuplicationCount: assignment.overlapDuplicationCount,
    children: Object.freeze(childDiagnostics)
  });
}
function hashText(initialHash, text3) {
  let hash2 = initialHash >>> 0;
  for (let index = 0; index < text3.length; index += 1) {
    hash2 ^= text3.charCodeAt(index);
    hash2 = Math.imul(hash2, FNV_PRIME) >>> 0;
  }
  return hash2;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionIncrementalPhases.js
var WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES = Object.freeze({
  LAYOUT: "layout",
  SCAN_SOURCES: "scan-sources",
  SORT_RUNS: "sort-runs",
  MERGE_RUNS: "merge-runs",
  ASSIGN_SOURCES: "assign-sources",
  INITIALIZE_OCTREES: "initialize-octrees",
  INSERT_TRIANGLES: "insert-triangles",
  VERIFY_CHILDREN: "verify-children",
  FINALIZE_CHILDREN: "finalize-children",
  COMPLETE: "complete",
  DISPOSED: "disposed",
  FAILED: "failed"
});
var PHASES = WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES;
var TERMINAL_PHASES = /* @__PURE__ */ new Set([
  PHASES.COMPLETE,
  PHASES.DISPOSED,
  PHASES.FAILED
]);
function isCollisionIncrementalTerminal(phase2) {
  return TERMINAL_PHASES.has(phase2);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionIncrementalBuildEngine.js
function advanceCollisionIncrementalBuild(generator, maximumUnits) {
  switch (generator.phase) {
    case WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.INITIALIZE_OCTREES:
      return initializeOctrees(generator, maximumUnits);
    case WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.INSERT_TRIANGLES:
      return insertTriangles(generator, maximumUnits);
    case WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.VERIFY_CHILDREN:
      return verifyChildren(generator, maximumUnits);
    case WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.FINALIZE_CHILDREN:
      return finalizeChildren(generator, maximumUnits);
    default:
      return null;
  }
}
function initializeOctrees(generator, maximumUnits) {
  const units = generator.octrees.initialize(maximumUnits);
  if (generator.octrees.initializeCursor === generator.layout.children.length) {
    generator.phase = WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.INSERT_TRIANGLES;
  }
  return units;
}
function insertTriangles(generator, maximumUnits) {
  const units = generator.octrees.insert(maximumUnits);
  if (generator.octrees.insertChildCursor === generator.layout.children.length) {
    generator.phase = WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.VERIFY_CHILDREN;
  }
  return units;
}
function verifyChildren(generator, maximumUnits) {
  const units = generator.octrees.verify(maximumUnits);
  if (generator.octrees.verifyCursor === generator.layout.children.length) {
    generator.phase = WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.FINALIZE_CHILDREN;
  }
  return units;
}
function finalizeChildren(generator, maximumUnits) {
  const units = generator.octrees.finalize(maximumUnits);
  if (generator.octrees.finalizeCursor === generator.layout.children.length) {
    completeGeneration(generator);
  }
  return units;
}
function completeGeneration(generator) {
  const diagnostics3 = createCollisionIncrementalFinalDiagnostics({
    options: generator.options,
    layout: generator.layout,
    assignment: generator.assignment,
    childDiagnostics: generator.octrees.childDiagnostics
  });
  generator.resultValue = Object.freeze({
    parentId: generator.options.parentId,
    layout: generator.layout,
    assignment: generator.assignment,
    definitions: Object.freeze(generator.octrees.definitions),
    diagnostics: diagnostics3
  });
  generator.phase = WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.COMPLETE;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionIncrementalProgress.js
function createCollisionIncrementalProgress(generator) {
  return Object.freeze({
    phase: generator.phase,
    completed: generator.phase === WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.COMPLETE,
    stepCount: generator.stepCount,
    totalUnits: generator.totalUnits,
    sortRunSize: generator.options.sortRunSize,
    disposedReason: generator.disposedReason,
    sources: generator.sources?.diagnostics(generator.options.triangles.length) || null,
    merge: generator.merge?.diagnostics() || null,
    assignment: generator.assignmentBuilder?.diagnostics() || null,
    octrees: generator.octrees?.diagnostics() || null
  });
}
function createCollisionIncrementalReceipt(generator, units, previousPhase = generator.phase) {
  return Object.freeze({
    previousPhase,
    phase: generator.phase,
    units,
    completed: generator.phase === WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.COMPLETE,
    progress: createCollisionIncrementalProgress(generator)
  });
}
function releaseCollisionIncrementalStructures(generator) {
  generator.sources = null;
  generator.merge = null;
  generator.orderedSources = null;
  generator.assignmentBuilder = null;
  generator.runtimeAssignment = null;
  generator.assignment = null;
  generator.octrees = null;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionChildLayout.js
var WORLD_CHUNK_COLLISION_CHILD_COUNT = 8;
function createWorldChunkCollisionChildLayout({
  parentId,
  parentBounds,
  parentSeed = 0,
  generationVersion = 1
} = {}) {
  const parent = parseWorldChunkId(parentId);
  const bounds = freezeCollisionBounds(parentBounds);
  const middle = midpointVector(bounds);
  const children = [];
  for (let octant = 0; octant < WORLD_CHUNK_COLLISION_CHILD_COUNT; octant += 1) {
    children.push(createChild({
      parent,
      parentId,
      bounds,
      middle,
      parentSeed,
      generationVersion,
      octant
    }));
  }
  const coverage = assertCollisionReplacementCoverage(
    { chunkId: parentId, bounds },
    children
  );
  return Object.freeze({
    parentId,
    parentBounds: bounds,
    generationVersion,
    children: Object.freeze(children),
    coverage
  });
}
function createChild(options) {
  const bits = octantBits(options.octant);
  const coordinates = Object.freeze({
    x: options.parent.x * 2 + bits.x,
    y: options.parent.y * 2 + bits.y,
    z: options.parent.z * 2 + bits.z
  });
  const chunkId = createWorldChunkId({
    namespace: options.parent.namespace,
    level: options.parent.level + 1,
    ...coordinates
  });
  return Object.freeze({
    chunkId,
    parentId: options.parentId,
    octant: options.octant,
    coordinates,
    bounds: createOctantBounds(options.bounds, options.middle, bits),
    seed: deriveChildSeed(
      options.parentSeed,
      options.generationVersion,
      chunkId
    ),
    generationVersion: options.generationVersion
  });
}
function createOctantBounds(bounds, middle, bits) {
  const minimum = {};
  const maximum = {};
  for (const axis of ["x", "y", "z"]) {
    minimum[axis] = bits[axis] ? middle[axis] : bounds.min[axis];
    maximum[axis] = bits[axis] ? bounds.max[axis] : middle[axis];
  }
  return freezeCollisionBounds({ min: minimum, max: maximum });
}
function octantBits(octant) {
  return Object.freeze({
    x: octant & 1,
    y: octant >> 1 & 1,
    z: octant >> 2 & 1
  });
}
function midpointVector(bounds) {
  return Object.freeze({
    x: (bounds.min.x + bounds.max.x) / 2,
    y: (bounds.min.y + bounds.max.y) / 2,
    z: (bounds.min.z + bounds.max.z) / 2
  });
}
function deriveChildSeed(parentSeed, generationVersion, chunkId) {
  const input = `${String(parentSeed)}|${generationVersion}|${chunkId}`;
  let hash2 = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash2 ^= input.charCodeAt(index);
    hash2 = Math.imul(hash2, 16777619);
  }
  return hash2 >>> 0;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionTriangleBounds.js
function createWorldChunkCollisionTriangleBounds(triangle2) {
  const vertices = [triangle2?.a, triangle2?.b, triangle2?.c];
  if (!vertices.every(isFiniteVector)) {
    throw new TypeError("Collision child generation requires finite triangle vertices.");
  }
  const minimum = { x: Infinity, y: Infinity, z: Infinity };
  const maximum = { x: -Infinity, y: -Infinity, z: -Infinity };
  for (const vertex of vertices) {
    for (const axis of ["x", "y", "z"]) {
      minimum[axis] = Math.min(minimum[axis], vertex[axis]);
      maximum[axis] = Math.max(maximum[axis], vertex[axis]);
    }
  }
  return freezePlanarBounds(minimum, maximum);
}
function collisionBoundsClosedOverlap(left, right) {
  assertFiniteBounds(left);
  assertFiniteBounds(right);
  return ["x", "y", "z"].every((axis) => left.max[axis] >= right.min[axis] && left.min[axis] <= right.max[axis]);
}
function freezePlanarBounds(minimum, maximum) {
  return Object.freeze({
    min: Object.freeze({ ...minimum }),
    max: Object.freeze({ ...maximum })
  });
}
function assertFiniteBounds(bounds = {}) {
  for (const side of ["min", "max"]) {
    if (!isFiniteVector(bounds[side])) {
      throw new TypeError("Collision bounds require finite min and max vectors.");
    }
  }
}
function isFiniteVector(vector3) {
  return !!vector3 && ["x", "y", "z"].every((axis) => Number.isFinite(vector3[axis]));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionIncrementalAssignments.js
var WorldChunkCollisionIncrementalAssignments = class {
  constructor(children, sourceCount, duplicateSourceCount) {
    this.children = children;
    this.sourceCount = sourceCount;
    this.duplicateSourceCount = duplicateSourceCount;
    this.sourceCursor = 0;
    this.sourceKeys = [];
    this.totalAssignments = 0;
    this.buckets = new Map(children.map((child) => [
      child.chunkId,
      createBucket(child)
    ]));
  }
  /** Assigns at most the requested number of canonical sources. */
  step(sources, maximumUnits) {
    let units = 0;
    while (units < maximumUnits && this.sourceCursor < sources.length) {
      this.assignOne(sources[this.sourceCursor]);
      this.sourceCursor += 1;
      units += 1;
    }
    return units;
  }
  /** Returns the public assignment shape preserved by the compatibility factory. */
  result() {
    const runtime = this.runtimeResult();
    return Object.freeze({
      ...runtime,
      assignments: Object.freeze(runtime.assignments.map((assigned) => Object.freeze({
        child: assigned.child,
        triangles: assigned.triangles,
        triangleKeys: assigned.triangleKeys
      })))
    });
  }
  /** Returns assignments with private digest state for incremental child builds. */
  runtimeResult() {
    if (this.sourceCursor !== this.sourceKeys.length) {
      throw new Error("Incremental child assignment is incomplete.");
    }
    const assignments = this.children.map((child) => {
      const bucket = this.buckets.get(child.chunkId);
      return Object.freeze({
        child,
        triangles: Object.freeze(bucket.triangles),
        triangleKeys: Object.freeze(bucket.triangleKeys),
        digestState: bucket.digestState
      });
    });
    const uniqueSourceCount = this.sourceKeys.length;
    return Object.freeze({
      assignments: Object.freeze(assignments),
      sourceCount: this.sourceCount,
      uniqueSourceCount,
      duplicateSourceCount: this.duplicateSourceCount,
      totalAssignments: this.totalAssignments,
      overlapDuplicationCount: this.totalAssignments - uniqueSourceCount,
      sourceKeys: Object.freeze(this.sourceKeys)
    });
  }
  /** Returns compact assignment progress. */
  diagnostics() {
    return Object.freeze({
      sourceCursor: this.sourceCursor,
      sourceKeyCount: this.sourceKeys.length,
      totalAssignments: this.totalAssignments
    });
  }
  /** Assigns one canonical source to every closed child bound it touches. */
  assignOne(source) {
    const touchedChildren = this.children.filter((child) => collisionBoundsClosedOverlap(source.bounds, child.bounds));
    if (touchedChildren.length === 0) {
      throw new Error(`Triangle ${source.key} reached no collision child.`);
    }
    for (const child of touchedChildren) {
      const bucket = this.buckets.get(child.chunkId);
      bucket.triangles.push(source.triangle);
      bucket.triangleKeys.push(source.key);
      bucket.digestState = updateCollisionDigestState(
        bucket.digestState,
        source.key,
        bucket.triangleKeys.length - 1
      );
    }
    this.sourceKeys.push(source.key);
    this.totalAssignments += touchedChildren.length;
  }
};
function createBucket(child) {
  return {
    child,
    triangles: [],
    triangleKeys: [],
    digestState: createCollisionDigestState()
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionIncrementalMerge.js
var WorldChunkCollisionIncrementalMerge = class {
  constructor(runs) {
    if (!Array.isArray(runs) || runs.length === 0) {
      throw new TypeError("Incremental merge requires at least one sorted run.");
    }
    this.runs = runs;
    this.nextRuns = [];
    this.pairCursor = 0;
    this.leftCursor = 0;
    this.rightCursor = 0;
    this.output = [];
    this.round = 0;
    this.resultValue = runs.length === 1 ? runs[0] : null;
  }
  /** Emits or carries at most the requested number of records. */
  step(maximumUnits) {
    let units = 0;
    while (units < maximumUnits && !this.resultValue) {
      if (this.pairCursor >= this.runs.length) {
        this.advanceRound();
        continue;
      }
      if (this.pairCursor === this.runs.length - 1) {
        this.nextRuns.push(this.runs[this.pairCursor]);
        this.pairCursor += 1;
        units += 1;
        continue;
      }
      this.emitOne();
      units += 1;
    }
    return units;
  }
  /** Returns the one completely merged canonical source run. */
  result() {
    if (!this.resultValue) {
      throw new Error("Incremental source merge is not complete.");
    }
    return this.resultValue;
  }
  /** Returns compact merge progress. */
  diagnostics() {
    return Object.freeze({
      round: this.round,
      runCount: this.runs.length,
      nextRunCount: this.nextRuns.length,
      pairCursor: this.pairCursor,
      leftCursor: this.leftCursor,
      rightCursor: this.rightCursor,
      outputCount: this.output.length,
      complete: Boolean(this.resultValue)
    });
  }
  emitOne() {
    const left = this.runs[this.pairCursor];
    const right = this.runs[this.pairCursor + 1];
    if (this.leftCursor >= left.length) {
      this.output.push(right[this.rightCursor]);
      this.rightCursor += 1;
    } else if (this.rightCursor >= right.length) {
      this.output.push(left[this.leftCursor]);
      this.leftCursor += 1;
    } else if (compareCollisionSourceKeys(left[this.leftCursor], right[this.rightCursor]) <= 0) {
      this.output.push(left[this.leftCursor]);
      this.leftCursor += 1;
    } else {
      this.output.push(right[this.rightCursor]);
      this.rightCursor += 1;
    }
    if (this.leftCursor >= left.length && this.rightCursor >= right.length) {
      this.nextRuns.push(this.output);
      this.pairCursor += 2;
      this.leftCursor = 0;
      this.rightCursor = 0;
      this.output = [];
    }
  }
  advanceRound() {
    if (this.nextRuns.length === 1) {
      this.resultValue = this.nextRuns[0];
      return;
    }
    this.runs = this.nextRuns;
    this.nextRuns = [];
    this.pairCursor = 0;
    this.round += 1;
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionIncrementalSources.js
var WorldChunkCollisionIncrementalSources = class {
  constructor() {
    this.identity = new WorldChunkCollisionTriangleIdentity();
    this.byKey = /* @__PURE__ */ new Map();
    this.uniqueSources = [];
    this.sourceCursor = 0;
    this.runCursor = 0;
    this.runs = [];
  }
  /** Scans at most the requested number of source triangles. */
  scan(triangles, maximumUnits) {
    let units = 0;
    while (units < maximumUnits && this.sourceCursor < triangles.length) {
      this.scanOne(triangles[this.sourceCursor]);
      this.sourceCursor += 1;
      units += 1;
    }
    return units;
  }
  /** Creates at most the requested number of bounded sorted runs. */
  createRuns(maximumUnits, runSize) {
    let units = 0;
    while (units < maximumUnits && this.runCursor < this.uniqueSources.length) {
      const end = Math.min(this.runCursor + runSize, this.uniqueSources.length);
      const run = this.uniqueSources.slice(this.runCursor, end).sort(compareCollisionSourceKeys);
      this.runs.push(run);
      this.runCursor = end;
      units += 1;
    }
    return units;
  }
  /** Returns compact source progress without collider references. */
  diagnostics(sourceCount) {
    return Object.freeze({
      sourceCount,
      sourceCursor: this.sourceCursor,
      uniqueSourceCount: this.uniqueSources.length,
      duplicateSourceCount: this.sourceCursor - this.uniqueSources.length,
      runCursor: this.runCursor,
      runCount: this.runs.length
    });
  }
  scanOne(triangle2) {
    const key = this.identity.keyFor(triangle2);
    if (!key.startsWith("triangle|")) {
      throw new TypeError("Collision child generation accepts triangle colliders only.");
    }
    if (this.byKey.has(key)) {
      return;
    }
    const source = Object.freeze({
      key,
      triangle: triangle2,
      bounds: createWorldChunkCollisionTriangleBounds(triangle2)
    });
    this.byKey.set(key, source);
    this.uniqueSources.push(source);
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/math/RayAabb.js
var AXES = ["x", "y", "z"];
var PARALLEL_EPSILON = 1e-10;
function rayIntersectsAabb(origin, direction, bounds, maximumDistance = Infinity) {
  if (!validVector(origin) || !validVector(direction)) return false;
  if (!validBounds(bounds) || !validDistance(maximumDistance)) return false;
  let nearDistance = 0;
  let farDistance = maximumDistance;
  for (const axis of AXES) {
    const component = direction[axis];
    if (Math.abs(component) < PARALLEL_EPSILON) {
      if (outsideSlab(origin[axis], bounds, axis)) return false;
      continue;
    }
    const distances = slabDistances(origin[axis], component, bounds, axis);
    nearDistance = Math.max(nearDistance, distances.near);
    farDistance = Math.min(farDistance, distances.far);
    if (farDistance < nearDistance) return false;
  }
  return farDistance >= 0;
}
function slabDistances(origin, direction, bounds, axis) {
  let near = (bounds.min[axis] - origin) / direction;
  let far = (bounds.max[axis] - origin) / direction;
  if (near > far) [near, far] = [far, near];
  return { near, far };
}
function outsideSlab(value3, bounds, axis) {
  return value3 < bounds.min[axis] || value3 > bounds.max[axis];
}
function validDistance(value3) {
  return value3 === Infinity || Number.isFinite(value3) && value3 >= 0;
}
function validBounds(bounds) {
  if (!validVector(bounds?.min) || !validVector(bounds?.max)) return false;
  return AXES.every((axis) => bounds.min[axis] <= bounds.max[axis]);
}
function validVector(vector3) {
  return AXES.every((axis) => Number.isFinite(vector3?.[axis]));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/collision/OctreeRaycast.js
function raycastOctree(root, ray, maximumDistance = 50, predicate = () => true) {
  if (!validRay(ray) || !validDistance2(maximumDistance)) return null;
  const direction = normalize(ray.direction);
  const state = { best: null };
  visitNode(
    root,
    ray.origin,
    direction,
    maximumDistance,
    predicate,
    state
  );
  return state.best;
}
function visitNode(node, origin, direction, maximumDistance, predicate, state) {
  const limit = currentLimit(maximumDistance, state.best);
  if (!rayIntersectsAabb(origin, direction, node?.bounds, limit)) return;
  for (const item2 of node.items || []) {
    visitItem(item2, origin, direction, maximumDistance, predicate, state);
  }
  for (const child of node.children || []) {
    visitNode(child, origin, direction, maximumDistance, predicate, state);
  }
}
function visitItem(item2, origin, direction, maximumDistance, predicate, state) {
  if (!item2?.a || !predicate(item2)) return;
  const limit = currentLimit(maximumDistance, state.best);
  if (item2.aabb && !rayIntersectsAabb(origin, direction, item2.aabb, limit)) return;
  const hit = rayTriangle(origin, direction, item2, limit);
  if (!validHit(hit)) return;
  if (!state.best || hit.distance < state.best.distance) state.best = hit;
}
function currentLimit(maximumDistance, best) {
  return best ? Math.min(maximumDistance, best.distance) : maximumDistance;
}
function validRay(ray) {
  return validVector2(ray?.origin) && validVector2(ray?.direction) && length(ray.direction) > 1e-10;
}
function validHit(hit) {
  return !!hit && Number.isFinite(hit.distance) && validVector2(hit.point) && validVector2(hit.normal);
}
function validDistance2(value3) {
  return value3 === Infinity || Number.isFinite(value3) && value3 >= 0;
}
function validVector2(vector3) {
  return Number.isFinite(vector3?.x) && Number.isFinite(vector3?.y) && Number.isFinite(vector3?.z);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/collision/AwtsmoosOctree.js
var AwtsmoosOctree = class _AwtsmoosOctree {
  constructor(bounds, depth = 0, maxDepth = 5) {
    this.bounds = bounds;
    this.depth = depth;
    this.maxDepth = maxDepth;
    this.items = [];
    this.children = null;
  }
  /** Inserts one item when its AABB touches this node. */
  insert(item2) {
    if (!this.bounds.intersects(item2.aabb)) return false;
    if (this.depth >= this.maxDepth || this.items.length < 10) {
      this.items.push(item2);
      return true;
    }
    if (!this.children) this.children = this.split();
    for (const child of this.children) {
      if (child.bounds.containsAabb(item2.aabb)) return child.insert(item2);
    }
    this.items.push(item2);
    return true;
  }
  /** Removes one exact item reference and compacts empty child vessels. */
  remove(item2) {
    const localIndex = this.items.indexOf(item2);
    if (localIndex >= 0) {
      this.items.splice(localIndex, 1);
      return true;
    }
    for (const child of this.children || []) {
      if (!child.remove(item2)) continue;
      if (this.children.every((candidate) => candidate.isEmpty())) {
        this.children = null;
      }
      return true;
    }
    return false;
  }
  /** Collects items whose boxes intersect the requested box. */
  query(aabb, output = []) {
    if (!this.bounds.intersects(aabb)) return output;
    for (const item2 of this.items) {
      if (item2.aabb.intersects(aabb)) output.push(item2);
    }
    for (const child of this.children || []) child.query(aabb, output);
    return output;
  }
  /** Collects every item without changing deterministic child order. */
  all(output = []) {
    output.push(...this.items);
    for (const child of this.children || []) child.all(output);
    return output;
  }
  /** Returns the nearest accepted ray hit through the custom traversal. */
  raycast(ray, maximumDistance = 50, predicate = () => true) {
    const normalizedRay = ray instanceof Ray ? ray : new Ray(ray?.origin, ray?.direction);
    return raycastOctree(this, normalizedRay, maximumDistance, predicate);
  }
  /** Reports whether this branch contains no collision authority. */
  isEmpty() {
    if (this.items.length) return false;
    return (this.children || []).every((child) => child.isEmpty());
  }
  /** Creates eight children in the original x-y-z nested order. */
  split() {
    const center = this.bounds.center();
    const { min, max } = this.bounds;
    const children = [];
    const xRanges = [[min.x, center.x], [center.x, max.x]];
    const yRanges = [[min.y, center.y], [center.y, max.y]];
    const zRanges = [[min.z, center.z], [center.z, max.z]];
    for (const xRange of xRanges) {
      for (const yRange of yRanges) {
        for (const zRange of zRanges) {
          children.push(this.createChild(xRange, yRange, zRange));
        }
      }
    }
    return children;
  }
  /** Creates one child with inherited depth and maximum depth. */
  createChild(xRange, yRange, zRange) {
    return new _AwtsmoosOctree(
      new Aabb(
        { x: xRange[0], y: yRange[0], z: zRange[0] },
        { x: xRange[1], y: yRange[1], z: zRange[1] }
      ),
      this.depth + 1,
      this.maxDepth
    );
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionIncrementalChildResult.js
function createIncrementalChildDefinition({
  assigned,
  octree,
  parentId,
  generationVersion
}) {
  const child = assigned.child;
  return Object.freeze({
    chunkId: child.chunkId,
    parentId,
    octree,
    generationVersion,
    expectedBounds: child.bounds,
    triangleKeys: assigned.triangleKeys,
    deterministicSeed: child.seed
  });
}
function createIncrementalChildDiagnostics(assigned) {
  const child = assigned.child;
  return Object.freeze({
    chunkId: child.chunkId,
    parentId: child.parentId,
    seed: child.seed,
    bounds: child.bounds,
    triangleCount: assigned.triangleKeys.length,
    triangleKeys: assigned.triangleKeys,
    digest: finalizeCollisionDigest(assigned.digestState)
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionIncrementalOctrees.js
var WorldChunkCollisionIncrementalOctrees = class {
  constructor(assignment, parentId, generationVersion) {
    this.assignment = assignment;
    this.parentId = parentId;
    this.generationVersion = generationVersion;
    this.builds = [];
    this.initializeCursor = 0;
    this.insertChildCursor = 0;
    this.insertTriangleCursor = 0;
    this.verifyCursor = 0;
    this.finalizeCursor = 0;
    this.definitions = [];
    this.childDiagnostics = [];
  }
  /** Creates at most the requested number of child octrees. */
  initialize(maximumUnits) {
    let units = 0;
    while (units < maximumUnits && this.initializeCursor < this.assignment.assignments.length) {
      const assigned = this.assignment.assignments[this.initializeCursor];
      const { min, max } = assigned.child.bounds;
      this.builds.push({
        assigned,
        octree: new AwtsmoosOctree(new Aabb(min, max)),
        inserted: 0
      });
      this.initializeCursor += 1;
      units += 1;
    }
    return units;
  }
  /** Inserts at most the requested number of assigned triangles. */
  insert(maximumUnits) {
    let units = 0;
    while (units < maximumUnits && this.insertChildCursor < this.builds.length) {
      const build = this.builds[this.insertChildCursor];
      if (this.insertTriangleCursor >= build.assigned.triangles.length) {
        this.insertChildCursor += 1;
        this.insertTriangleCursor = 0;
        continue;
      }
      const triangle2 = build.assigned.triangles[this.insertTriangleCursor];
      if (!build.octree.insert(triangle2)) {
        throw new Error(`Child octree rejected triangle for ${build.assigned.child.chunkId}.`);
      }
      build.inserted += 1;
      this.insertTriangleCursor += 1;
      units += 1;
    }
    return units;
  }
  /** Verifies at most the requested number of complete child builds. */
  verify(maximumUnits) {
    let units = 0;
    while (units < maximumUnits && this.verifyCursor < this.builds.length) {
      const build = this.builds[this.verifyCursor];
      const childId = build.assigned.child.chunkId;
      if (build.inserted !== build.assigned.triangleKeys.length) {
        throw new Error(`Child octree count mismatch for ${childId}.`);
      }
      const actualBounds = JSON.stringify(build.octree.bounds.toJSON());
      const expectedBounds = JSON.stringify(build.assigned.child.bounds);
      if (actualBounds !== expectedBounds) {
        throw new Error(`Child octree bounds mismatch for ${childId}.`);
      }
      this.verifyCursor += 1;
      units += 1;
    }
    return units;
  }
  /** Freezes at most the requested number of child results. */
  finalize(maximumUnits) {
    let units = 0;
    while (units < maximumUnits && this.finalizeCursor < this.builds.length) {
      const { assigned, octree } = this.builds[this.finalizeCursor];
      this.definitions.push(createIncrementalChildDefinition({
        assigned,
        octree,
        parentId: this.parentId,
        generationVersion: this.generationVersion
      }));
      this.childDiagnostics.push(createIncrementalChildDiagnostics(assigned));
      this.finalizeCursor += 1;
      units += 1;
    }
    return units;
  }
  /** Returns compact octree-build progress. */
  diagnostics() {
    return Object.freeze({
      initializedChildren: this.initializeCursor,
      insertChildCursor: this.insertChildCursor,
      insertTriangleCursor: this.insertTriangleCursor,
      verifiedChildren: this.verifyCursor,
      finalizedChildren: this.finalizeCursor
    });
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionIncrementalSourceEngine.js
function advanceCollisionIncrementalSource(generator, maximumUnits) {
  switch (generator.phase) {
    case WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.LAYOUT:
      return createLayout(generator);
    case WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.SCAN_SOURCES:
      return scanSources(generator, maximumUnits);
    case WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.SORT_RUNS:
      return sortRuns(generator, maximumUnits);
    case WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.MERGE_RUNS:
      return mergeRuns(generator, maximumUnits);
    case WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.ASSIGN_SOURCES:
      return assignSources(generator, maximumUnits);
    default:
      return null;
  }
}
function createLayout(generator) {
  generator.layout = createWorldChunkCollisionChildLayout(generator.options);
  generator.sources = new WorldChunkCollisionIncrementalSources();
  generator.phase = WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.SCAN_SOURCES;
  return 1;
}
function scanSources(generator, maximumUnits) {
  const units = generator.sources.scan(generator.options.triangles, maximumUnits);
  if (generator.sources.sourceCursor === generator.options.triangles.length) {
    generator.phase = WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.SORT_RUNS;
  }
  return units;
}
function sortRuns(generator, maximumUnits) {
  const units = generator.sources.createRuns(
    maximumUnits,
    generator.options.sortRunSize
  );
  if (generator.sources.runCursor === generator.sources.uniqueSources.length) {
    generator.merge = new WorldChunkCollisionIncrementalMerge(generator.sources.runs);
    generator.phase = WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.MERGE_RUNS;
  }
  return units;
}
function mergeRuns(generator, maximumUnits) {
  const units = generator.merge.step(maximumUnits);
  if (generator.merge.diagnostics().complete) {
    generator.orderedSources = generator.merge.result();
    generator.assignmentBuilder = new WorldChunkCollisionIncrementalAssignments(
      generator.layout.children,
      generator.options.triangles.length,
      generator.options.triangles.length - generator.orderedSources.length
    );
    generator.phase = WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.ASSIGN_SOURCES;
  }
  return units;
}
function assignSources(generator, maximumUnits) {
  const units = generator.assignmentBuilder.step(
    generator.orderedSources,
    maximumUnits
  );
  if (generator.assignmentBuilder.sourceCursor === generator.orderedSources.length) {
    generator.runtimeAssignment = generator.assignmentBuilder.runtimeResult();
    generator.assignment = generator.assignmentBuilder.result();
    generator.octrees = new WorldChunkCollisionIncrementalOctrees(
      generator.runtimeAssignment,
      generator.options.parentId,
      generator.options.generationVersion
    );
    generator.phase = WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.INITIALIZE_OCTREES;
  }
  return units;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionIncrementalGenerator.js
var WorldChunkCollisionIncrementalGenerator = class {
  constructor(options = {}) {
    this.options = createCollisionIncrementalOptions(options);
    this.phase = WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.LAYOUT;
    this.stepCount = 0;
    this.totalUnits = 0;
    this.resultValue = null;
    this.disposedReason = null;
    this.layout = null;
    this.sources = null;
    this.merge = null;
    this.orderedSources = null;
    this.assignmentBuilder = null;
    this.runtimeAssignment = null;
    this.assignment = null;
    this.octrees = null;
  }
  /** Advances bounded deterministic work and returns compact progress. */
  step({ maximumUnits = this.options.defaultStepUnits } = {}) {
    const budget = requireCollisionGenerationUnits(maximumUnits);
    if (isCollisionIncrementalTerminal(this.phase) || budget === 0) {
      return createCollisionIncrementalReceipt(this, 0);
    }
    const previousPhase = this.phase;
    let consumed = 0;
    let guard = 0;
    while (consumed < budget && !isCollisionIncrementalTerminal(this.phase)) {
      const before = this.phase;
      const units = this.advance(budget - consumed);
      consumed += units;
      guard += 1;
      if (units === 0 && this.phase === before) {
        throw new Error(`Incremental generation stalled during ${this.phase}.`);
      }
      if (guard > 32) {
        throw new Error("Incremental generation exceeded its phase guard.");
      }
    }
    this.stepCount += 1;
    this.totalUnits += consumed;
    return createCollisionIncrementalReceipt(this, consumed, previousPhase);
  }
  /** Returns the completed generation result. */
  result() {
    if (this.phase !== WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.COMPLETE || !this.resultValue) {
      throw new Error("Incremental collision generation is not complete.");
    }
    return this.resultValue;
  }
  /** Releases runtime-only structures before ownership preparation. */
  dispose(reason = "disposed") {
    if (this.phase === WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.COMPLETE) {
      throw new Error("Completed collision generation cannot be disposed.");
    }
    this.disposedReason = String(reason);
    this.phase = WORLD_CHUNK_COLLISION_INCREMENTAL_PHASES.DISPOSED;
    releaseCollisionIncrementalStructures(this);
  }
  /** Returns progress without source triangles or octrees. */
  diagnostics() {
    return createCollisionIncrementalProgress(this);
  }
  advance(maximumUnits) {
    const sourceUnits = advanceCollisionIncrementalSource(this, maximumUnits);
    if (sourceUnits !== null) {
      return sourceUnits;
    }
    const buildUnits = advanceCollisionIncrementalBuild(this, maximumUnits);
    if (buildUnits !== null) {
      return buildUnits;
    }
    throw new Error(`No incremental engine supports phase ${this.phase}.`);
  }
};
function createWorldChunkCollisionIncrementalGenerator(options) {
  return new WorldChunkCollisionIncrementalGenerator(options);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionOneShotGenerator.js
var WorldChunkCollisionOneShotGenerator = class {
  constructor(options, generate) {
    this.options = options;
    this.generate = generate;
    this.phase = "one-shot-pending";
    this.resultValue = null;
    this.disposedReason = null;
  }
  /** Executes the injected generator once when at least one unit is available. */
  step({ maximumUnits = 1 } = {}) {
    if (maximumUnits < 1 || this.phase !== "one-shot-pending") {
      return this.receipt(0);
    }
    this.resultValue = this.generate(this.options);
    this.phase = "complete";
    return this.receipt(1, "one-shot-pending");
  }
  /** Returns the injected generation result after completion. */
  result() {
    if (!this.resultValue) {
      throw new Error("One-shot collision generation is not complete.");
    }
    return this.resultValue;
  }
  /** Disposes the pending adapter. */
  dispose(reason = "disposed") {
    this.disposedReason = String(reason);
    this.phase = "disposed";
  }
  /** Returns compact adapter diagnostics. */
  diagnostics() {
    return Object.freeze({
      phase: this.phase,
      completed: this.phase === "complete",
      disposedReason: this.disposedReason
    });
  }
  receipt(units, previousPhase = this.phase) {
    return Object.freeze({
      previousPhase,
      phase: this.phase,
      units,
      completed: this.phase === "complete",
      progress: this.diagnostics()
    });
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionStreamingRuntime.js
var WorldChunkCollisionStreamingRuntime = class {
  constructor({ index, parentRecord, sourceTriangles, generate, measure: measure2 } = {}) {
    this.index = index;
    this.parentRecord = parentRecord;
    this.sourceTriangles = sourceTriangles;
    this.dependencies = Object.freeze({
      createGenerator: generate ? (options) => new WorldChunkCollisionOneShotGenerator(options, generate) : createWorldChunkCollisionIncrementalGenerator,
      measure: measure2 || measureOperation
    });
    this.currentJob = null;
    this.lastJob = null;
  }
  /** Accepts one stable manually triggered bootstrap subdivision request. */
  request(options = {}) {
    return acceptCollisionStreamingRequest(this, options);
  }
  /** Requests cancellation while rollback can restore parent-only ownership. */
  cancel(options = {}) {
    return requestCollisionStreamingCancellation(this, options);
  }
  /** Requests explicit parent retirement after retained observation. */
  requestRetirement(options = {}) {
    return requestCollisionStreamingRetirement(this, options);
  }
  /** Executes at most one collision lifecycle operation. */
  update(options = {}) {
    const job = this.currentJob;
    if (!job || job.terminal) {
      return this.receipt("idle");
    }
    const update = createCollisionStreamingUpdate(options, true);
    job.assertTime(update.at);
    if (update.maximumOperations === 0) {
      return this.receipt("budget-exhausted");
    }
    const maximumGenerationUnits = Math.min(
      update.maximumGenerationUnits ?? job.request.maximumGenerationUnits,
      job.request.maximumGenerationUnits
    );
    try {
      const operation = job.cancelRequest ? cancelCollisionStreamingJob(job, this.index, update.at) : advanceCollisionStreamingJob({
        job,
        index: this.index,
        dependencies: this.dependencies,
        at: update.at,
        maximumGenerationUnits
      });
      return this.receipt(operation);
    } catch (error) {
      const operation = recoverCollisionStreamingFailure(
        job,
        this.index,
        error,
        update.at
      );
      return this.receipt(operation);
    }
  }
  /** Returns live scheduler evidence without exposing source geometry. */
  diagnostics() {
    return Object.freeze({
      limitation: "individual-octree-insertions-remain-synchronous",
      currentJob: this.currentJob?.diagnostics() || null,
      lastJob: this.lastJob
    });
  }
  receipt(operation) {
    return Object.freeze({
      operation,
      state: this.currentJob?.state || "idle",
      job: this.currentJob?.diagnostics() || null,
      ownership: this.index.diagnostics()
    });
  }
};
function measureOperation(operation) {
  const start = globalThis.performance?.now?.() ?? 0;
  const value3 = operation();
  const end = globalThis.performance?.now?.() ?? start;
  return Object.freeze({ value: value3, durationMs: Math.max(0, end - start) });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkCollisionRuntime.js
var WorldChunkCollisionRuntime = class {
  constructor({ bootstrapRecord, mainOctree, generate, measure: measure2 } = {}) {
    if (!bootstrapRecord?.id) {
      throw new TypeError("Bootstrap chunk record is required for collision runtime.");
    }
    this.index = new WorldChunkCollisionIndex();
    this.bootstrapEntry = this.index.registerActive({
      chunkId: bootstrapRecord.id,
      parentId: null,
      octree: mainOctree,
      generationVersion: bootstrapRecord.generationVersion,
      expectedBounds: bootstrapRecord.bounds
    });
    this.query = new WorldChunkCollisionQueryFacade(this.index);
    this.streaming = new WorldChunkCollisionStreamingRuntime({
      index: this.index,
      parentRecord: bootstrapRecord,
      sourceTriangles: bootstrapRecord.runtime.terrain.colliders,
      generate,
      measure: measure2
    });
  }
  /** Accepts one stable manually triggered bootstrap subdivision. */
  requestBootstrapSubdivision(options) {
    return this.streaming.request(options);
  }
  /** Requests safe cancellation before retained activation. */
  cancelStreaming(options) {
    return this.streaming.cancel(options);
  }
  /** Authorizes parent retirement after retained observation. */
  requestParentRetirement(options) {
    return this.streaming.requestRetirement(options);
  }
  /** Advances at most one live collision ownership operation. */
  update(options) {
    return this.streaming.update(options);
  }
  /** Returns ownership, streaming, bootstrap, and query evidence together. */
  diagnostics() {
    return Object.freeze({
      bootstrapId: this.bootstrapEntry.chunkId,
      bootstrapBounds: this.bootstrapEntry.bounds,
      bootstrapTriangles: this.bootstrapEntry.triangleCount,
      streaming: this.streaming.diagnostics(),
      query: this.query.diagnostics(),
      ...this.index.diagnostics()
    });
  }
};
function createWorldChunkCollisionRuntime(options) {
  return new WorldChunkCollisionRuntime(options);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkSafety.js
var READY_DEPENDENCY_STATES = /* @__PURE__ */ new Set([
  WORLD_CHUNK_STATES.SAFETY_VALIDATED,
  WORLD_CHUNK_STATES.ACTIVE,
  WORLD_CHUNK_STATES.DORMANT
]);
function evaluateWorldChunkSafety(record, dependencies = /* @__PURE__ */ new Map()) {
  if (!record || typeof record !== "object") {
    throw new TypeError("World chunk record is required for safety evaluation.");
  }
  const readiness = record.readiness || {};
  const visualReady = readiness.visualReady === true;
  const collisionReady = record.collisionRequired === false || readiness.collisionPrepared === true;
  const safetyValidated = readiness.safetyValidated === true;
  const missingDependencies = dependencyFailures(record, dependencies);
  const hasParent = Boolean(record.parentId);
  const handoff = record.collisionHandoff || {};
  const parentCollisionRetained = !hasParent || handoff.parentRetained === true;
  const atomicHandoffReady = !hasParent || handoff.atomicReady === true;
  const safe = visualReady && collisionReady && safetyValidated && missingDependencies.length === 0 && parentCollisionRetained && atomicHandoffReady;
  return Object.freeze({
    safe,
    visualReady,
    collisionReady,
    safetyValidated,
    missingDependencies: Object.freeze(missingDependencies),
    parentCollisionRetained,
    atomicHandoffReady
  });
}
function canActivateWorldChunk(record, dependencies = /* @__PURE__ */ new Map()) {
  return evaluateWorldChunkSafety(record, dependencies).safe;
}
function dependencyFailures(record, dependencies) {
  const failures = [];
  for (const dependencyId of record.assetDependencies || []) {
    const dependency = findDependency(dependencies, dependencyId);
    if (!dependency || !READY_DEPENDENCY_STATES.has(dependency.state)) {
      failures.push(dependencyId);
    }
  }
  return failures;
}
function findDependency(dependencies, dependencyId) {
  if (dependencies instanceof Map) {
    return dependencies.get(dependencyId);
  }
  if (Array.isArray(dependencies)) {
    return dependencies.find((dependency) => dependency?.id === dependencyId);
  }
  if (dependencies && typeof dependencies === "object") {
    return dependencies[dependencyId];
  }
  return void 0;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkRegistryDiagnostics.js
function createWorldChunkRegistryDiagnostics(records, queue, lastProcess) {
  const recordList = [...records];
  const lifecycle = worldChunkRecordDiagnostics(recordList);
  const memory = recordList.reduce((total, record) => {
    return {
      geometry: total.geometry + (record.memoryEstimate?.geometry || 0),
      textures: total.textures + (record.memoryEstimate?.textures || 0),
      collision: total.collision + (record.memoryEstimate?.collision || 0)
    };
  }, { geometry: 0, textures: 0, collision: 0 });
  memory.total = memory.geometry + memory.textures + memory.collision;
  return Object.freeze({
    ...lifecycle,
    memory: Object.freeze(memory),
    queue: Object.freeze({
      pending: queue.size,
      stats: Object.freeze({ ...queue.stats })
    }),
    lastProcess: summarizeProcess(lastProcess)
  });
}
function summarizeProcess(process) {
  if (!process) {
    return null;
  }
  return Object.freeze({
    usedCost: process.usedCost,
    remaining: process.remaining,
    results: Object.freeze((process.results || []).map((result) => Object.freeze({
      id: result.id,
      ok: result.ok,
      cost: result.cost,
      error: result.error?.message || null
    })))
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkTransitions.js
var S2 = WORLD_CHUNK_STATES;
var WORLD_CHUNK_TRANSITIONS = Object.freeze({
  [S2.UNKNOWN]: freezeStates2(S2.METADATA_LOADED, S2.FAILED),
  [S2.METADATA_LOADED]: freezeStates2(S2.COARSE_GENERATED, S2.CACHED, S2.FAILED),
  [S2.COARSE_GENERATED]: freezeStates2(S2.VISUAL_READY, S2.CACHED, S2.FAILED),
  [S2.VISUAL_READY]: freezeStates2(
    S2.COLLISION_PREPARED,
    S2.SAFETY_VALIDATED,
    S2.DORMANT,
    S2.FAILED
  ),
  [S2.COLLISION_PREPARED]: freezeStates2(S2.SAFETY_VALIDATED, S2.DORMANT, S2.FAILED),
  [S2.SAFETY_VALIDATED]: freezeStates2(S2.ACTIVE, S2.DORMANT, S2.FAILED),
  [S2.ACTIVE]: freezeStates2(S2.DORMANT, S2.UNLOADING, S2.FAILED),
  [S2.DORMANT]: freezeStates2(S2.ACTIVE, S2.UNLOADING, S2.CACHED, S2.FAILED),
  [S2.UNLOADING]: freezeStates2(S2.CACHED, S2.FAILED),
  [S2.CACHED]: freezeStates2(S2.METADATA_LOADED, S2.COARSE_GENERATED, S2.FAILED),
  [S2.FAILED]: freezeStates2(S2.METADATA_LOADED, S2.CACHED)
});
function canTransitionWorldChunk(fromState, toState) {
  assertWorldChunkState(fromState);
  assertWorldChunkState(toState);
  return WORLD_CHUNK_TRANSITIONS[fromState].includes(toState);
}
function transitionWorldChunk(record, toState, evidence = {}) {
  if (!record || typeof record !== "object") {
    throw new TypeError("World chunk record is required.");
  }
  const fromState = assertWorldChunkState(record.state);
  assertWorldChunkState(toState);
  if (!canTransitionWorldChunk(fromState, toState)) {
    throw new Error(`Illegal world chunk transition: ${fromState} -> ${toState}`);
  }
  const at = normalizeTimestamp(evidence.at);
  const transition = Object.freeze({
    from: fromState,
    to: toState,
    at,
    reason: normalizeReason(evidence.reason),
    retryCount: normalizeRetryCount(evidence.retryCount)
  });
  return Object.freeze({
    ...record,
    state: toState,
    previousState: fromState,
    stateChangedAt: at,
    lastTransition: transition
  });
}
function freezeStates2(...states) {
  return Object.freeze(states);
}
function normalizeTimestamp(value3) {
  const timestamp = value3 ?? Date.now();
  if (!Number.isFinite(timestamp) || timestamp < 0) {
    throw new TypeError("Transition timestamp must be a nonnegative number.");
  }
  return timestamp;
}
function normalizeReason(value3) {
  if (value3 === void 0) {
    return "";
  }
  if (typeof value3 !== "string") {
    throw new TypeError("Transition reason must be a string.");
  }
  return value3;
}
function normalizeRetryCount(value3) {
  const retryCount = value3 ?? 0;
  if (!Number.isSafeInteger(retryCount) || retryCount < 0) {
    throw new TypeError("Transition retry count must be a nonnegative integer.");
  }
  return retryCount;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkRegistry.js
var WorldChunkRegistry = class {
  constructor({ transitionQueue = new LodTransitionQueue() } = {}) {
    this.records = /* @__PURE__ */ new Map();
    this.queue = transitionQueue;
    this.lastProcess = null;
  }
  get size() {
    return this.records.size;
  }
  register(definition) {
    const record = createWorldChunkRecord(definition);
    if (this.records.has(record.id)) {
      return false;
    }
    this.records.set(record.id, record);
    return true;
  }
  has(id) {
    return this.records.has(id);
  }
  get(id) {
    return this.records.get(id) || null;
  }
  values() {
    return this.records.values();
  }
  queueTransition({
    id,
    toState,
    evidence = {},
    priority = 0,
    cost = 1
  } = {}) {
    const current = this.requireRecord(id);
    this.assertLegalTransition(current, toState);
    return this.queue.enqueue({
      id: queueId(id),
      priority,
      cost,
      metadata: { chunkId: id, toState },
      apply: () => this.applyTransition(id, toState, evidence)
    });
  }
  process(options = {}) {
    this.lastProcess = this.queue.process(options);
    return this.lastProcess;
  }
  diagnostics() {
    return createWorldChunkRegistryDiagnostics(
      this.records.values(),
      this.queue,
      this.lastProcess
    );
  }
  applyTransition(id, toState, evidence) {
    const current = this.requireRecord(id);
    this.assertLegalTransition(current, toState);
    if (toState === WORLD_CHUNK_STATES.ACTIVE && !canActivateWorldChunk(current, this.records)) {
      throw new Error(`World chunk is not safe to activate: ${id}`);
    }
    const next = transitionWorldChunk(current, toState, evidence);
    this.records.set(id, next);
    return next;
  }
  requireRecord(id) {
    const record = this.records.get(id);
    if (!record) {
      throw new Error(`Unknown world chunk: ${String(id)}`);
    }
    return record;
  }
  assertLegalTransition(record, toState) {
    if (!canTransitionWorldChunk(record.state, toState)) {
      throw new Error(
        `Illegal world chunk transition: ${record.state} -> ${toState}`
      );
    }
  }
};
function queueId(id) {
  return `world-chunk:${id}`;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/streaming/WorldChunkRuntime.js
var WorldChunkRuntime = class {
  constructor({
    terrain,
    mainOctree,
    transitionQueue,
    collisionGenerate,
    collisionMeasure
  } = {}) {
    this.registry = new WorldChunkRegistry({
      transitionQueue: transitionQueue || new LodTransitionQueue()
    });
    this.bootstrapRecord = createBootstrapWorldChunk({ terrain, mainOctree });
    if (!this.registry.register(this.bootstrapRecord)) {
      throw new Error("Bootstrap world chunk registration failed.");
    }
    this.collisionRuntime = createWorldChunkCollisionRuntime({
      bootstrapRecord: this.bootstrapRecord,
      mainOctree,
      generate: collisionGenerate,
      measure: collisionMeasure
    });
    this.collisionQuery = this.collisionRuntime.query;
    this.lastProcess = null;
  }
  /** Advances visual work and at most one collision operation. */
  update({
    at,
    maximumTransitions = 2,
    maximumCost = 4,
    maximumCollisionOperations = 1
  } = {}) {
    const visual = this.registry.process({
      maximumTransitions,
      maximumCost
    });
    const collision = this.collisionRuntime.update({
      at,
      maximumOperations: maximumCollisionOperations
    });
    this.lastProcess = Object.freeze({
      ...visual,
      visual,
      collision
    });
    return this.lastProcess;
  }
  /** Accepts one manually triggered bootstrap collision subdivision. */
  requestBootstrapSubdivision(options) {
    return this.collisionRuntime.requestBootstrapSubdivision(options);
  }
  /** Requests safe pre-activation collision rollback. */
  cancelCollisionStreaming(options) {
    return this.collisionRuntime.cancelStreaming(options);
  }
  /** Authorizes parent retirement after retained observation. */
  requestCollisionParentRetirement(options) {
    return this.collisionRuntime.requestParentRetirement(options);
  }
  /** Returns visual registry, collision ownership, and query diagnostics. */
  diagnostics() {
    return Object.freeze({
      bootstrapId: BOOTSTRAP_WORLD_CHUNK_ID,
      bootstrapSeed: this.bootstrapRecord.deterministicSeed,
      bootstrapBounds: this.bootstrapRecord.bounds,
      collision: this.collisionRuntime.diagnostics(),
      ...this.registry.diagnostics()
    });
  }
};
function createWorldChunkRuntime(options) {
  return new WorldChunkRuntime(options);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/network/LocalRpgCatalog.js
var LOCAL_RPG_WEAPONS = Object.freeze({
  chalaf: weapon("chalaf", 8, 2.2, 900, 8, "tool"),
  "spark-blade": weapon("spark-blade", 26, 4.5, 550, 14, "hand"),
  "wooden-staff": weapon("wooden-staff", 18, 4.2, 700, 10, "hand")
});
var LOCAL_RPG_CREATURES = Object.freeze({
  chicken: creature(24, false, 0),
  cow: creature(75, true, 0),
  deer: creature(48, true, 0),
  fox: creature(36, false, 0),
  goat: creature(42, true, 0),
  sheep: creature(35, true, 0),
  wolf: creature(55, false, 0),
  "dybbuk-shade": creature(45, false, 2),
  "fallen-seraph-husk": creature(70, false, 3),
  "great-dybbuk": creature(180, false, 10),
  "klipah-guardian": creature(90, false, 4),
  "spark-wisp": creature(18, false, 1)
});
var LOCAL_CREATURE_SPAWNS = Object.freeze([
  spawn("sheep-1", "sheep", 108, 38),
  spawn("sheep-2", "sheep", 121, 47),
  spawn("goat-1", "goat", 128, 32),
  spawn("cow-1", "cow", 96, 52),
  spawn("deer-1", "deer", 76, -72),
  spawn("chicken-1", "chicken", -49, 19),
  spawn("fox-1", "fox", 88, -94),
  spawn("wolf-1", "wolf", 30, -124),
  spawn("dybbuk-1", "dybbuk-shade", 0, -140),
  spawn("dybbuk-2", "dybbuk-shade", 14, -146),
  spawn("dybbuk-3", "dybbuk-shade", -12, -151),
  spawn("guardian-1", "klipah-guardian", -20, -152),
  spawn("guardian-2", "klipah-guardian", -31, -143),
  spawn("seraph-husk-1", "fallen-seraph-husk", 24, -158),
  spawn("seraph-husk-2", "fallen-seraph-husk", 36, -148),
  spawn("seraph-husk-3", "fallen-seraph-husk", 12, -168),
  spawn("great-dybbuk-1", "great-dybbuk", 8, -182)
]);
var LOCAL_ADVENTURE_IDS = Object.freeze([
  "sparks-at-east-gate",
  "guard-the-shul",
  "shepherds-mercy",
  "kosher-provision",
  "orchard-defense",
  "wings-over-lake",
  "great-spark-refinement"
]);
function weapon(id, damage, range, cooldownMs, staminaCost, slot) {
  return Object.freeze({ cooldownMs, damage, id, range, slot, staminaCost });
}
function creature(maximumHealth, kosherEligible, refinedSparks) {
  return Object.freeze({ kosherEligible, maximumHealth, refinedSparks });
}
function spawn(id, speciesId, x, z) {
  return Object.freeze({ id, position: Object.freeze({ x, y: 0, z }), speciesId });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/network/MitzvahWorldLocalRpgSession.js
var MitzvahWorldLocalRpgSession = class {
  constructor(options = {}) {
    this.clock = options.clock || Date.now;
    this.combat = combatState();
    this.creatures = /* @__PURE__ */ new Map();
    this.equipment = { hand: "wooden-staff", tool: "chalaf" };
    this.inventory = /* @__PURE__ */ new Set(["wooden-staff", "chalaf"]);
    this.progress = Object.fromEntries(LOCAL_ADVENTURE_IDS.map((id) => [id, "available"]));
    this.refinedSparks = 0;
    for (const spawn2 of LOCAL_CREATURE_SPAWNS) this.spawn(spawn2.id, spawn2.speciesId, spawn2.position);
  }
  spawn(id, speciesId, position = { x: 0, y: 0, z: 0 }) {
    const definition = LOCAL_RPG_CREATURES[speciesId];
    if (!definition) throw new Error(`Unknown local creature: ${speciesId}`);
    this.creatures.set(id, {
      ...definition,
      health: definition.maximumHealth,
      id,
      position: { ...position },
      speciesId,
      status: "active"
    });
    return this.snapshot();
  }
  startAdventure(questId) {
    if (!LOCAL_ADVENTURE_IDS.includes(questId)) throw new Error(`Unknown adventure: ${questId}`);
    if (this.progress[questId] === "available") this.progress[questId] = "active";
    return this.snapshot();
  }
  attack(creatureId, weaponId = "wooden-staff", distance4 = 1) {
    const weapon2 = LOCAL_RPG_WEAPONS[weaponId];
    const creature2 = this.creatures.get(creatureId);
    if (!weapon2 || !this.inventory.has(weaponId)) throw new Error("WEAPON_NOT_OWNED");
    if (this.equipment[weapon2.slot] !== weaponId) throw new Error("WEAPON_NOT_EQUIPPED");
    if (!creature2 || creature2.status !== "active") throw new Error("CREATURE_NOT_ACTIVE");
    if (distance4 > weapon2.range) throw new Error("TARGET_OUT_OF_RANGE");
    const now2 = this.clock();
    if (now2 - this.combat.lastAttackAt < weapon2.cooldownMs) throw new Error("ATTACK_COOLDOWN");
    if (this.combat.stamina < weapon2.staminaCost) throw new Error("INSUFFICIENT_STAMINA");
    this.combat.lastAttackAt = now2;
    this.combat.stamina -= weapon2.staminaCost;
    creature2.health = Math.max(0, creature2.health - weapon2.damage);
    if (creature2.health === 0) this.defeat(creature2);
    return this.snapshot();
  }
  tick(steps = 1) {
    this.combat.stamina = Math.min(100, this.combat.stamina + Math.max(1, steps) * 3);
    return this.snapshot();
  }
  defeat(creature2) {
    creature2.status = creature2.kosherEligible ? "harvestable" : "defeated";
    this.refinedSparks += creature2.refinedSparks;
  }
  snapshot() {
    return structuredClone({
      combat: this.combat,
      creatures: [...this.creatures.values()],
      progress: this.progress,
      refinedSparks: this.refinedSparks
    });
  }
};
function combatState() {
  return {
    health: 100,
    lastAttackAt: 0,
    maximumHealth: 100,
    maximumStamina: 100,
    stamina: 100,
    status: "active"
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/performance/AdaptiveRenderScalePolicy.js
var BASE_SCALES = Object.freeze([1, 0.9, 0.8, 0.72, 0.67]);
var DEFAULT_FLOOR = 0.67;
var AdaptiveRenderScalePolicy = class {
  constructor(runtime, options = {}) {
    this.runtime = runtime;
    this.cooldownMilliseconds = options.cooldownMilliseconds ?? 1200;
    this.stableSamplesToRecover = options.stableSamplesToRecover ?? 24;
    this.warningSamplesToReduce = options.warningSamplesToReduce ?? 4;
    this.lastChangeAt = -Infinity;
    this.stableSamples = 0;
    this.warningSamples = 0;
    this.history = [];
    this.publish(this.nearestScale(runtime.adaptiveRenderScale ?? 1));
  }
  evaluate(pressureState, nowMilliseconds) {
    this.stableSamples = pressureState === "stable" ? this.stableSamples + 1 : 0;
    this.warningSamples = pressureState === "warning" ? this.warningSamples + 1 : 0;
    const direction = this.direction(pressureState);
    const coolingDown = nowMilliseconds - this.lastChangeAt < this.cooldownMilliseconds;
    if (!direction || coolingDown && pressureState !== "critical") {
      return this.result(false, pressureState, "hysteresis");
    }
    const scales = this.availableScales();
    const currentIndex = nearestIndex(scales, this.runtime.adaptiveRenderScale ?? 1);
    const nextIndex = clampIndex(currentIndex + direction, scales.length);
    if (nextIndex === currentIndex) {
      return this.result(false, pressureState, "scale-limit");
    }
    this.lastChangeAt = nowMilliseconds;
    this.stableSamples = 0;
    this.warningSamples = 0;
    this.publish(scales[nextIndex]);
    const reason = direction > 0 ? "pressure-reduction" : "stable-recovery";
    const result = this.result(true, pressureState, reason);
    this.history.push({ at: nowMilliseconds, ...result });
    return result;
  }
  direction(pressureState) {
    if (pressureState === "critical") {
      return 1;
    }
    if (pressureState === "warning" && this.warningSamples >= this.warningSamplesToReduce) {
      return 1;
    }
    if (pressureState === "stable" && this.stableSamples >= this.stableSamplesToRecover) {
      return -1;
    }
    return 0;
  }
  availableScales() {
    const floor = Math.max(DEFAULT_FLOOR, Math.min(1, this.runtime.minimumRenderScale ?? DEFAULT_FLOOR));
    const scales = BASE_SCALES.filter((scale2) => scale2 >= floor - 1e-3);
    if (Math.abs(scales.at(-1) - floor) > 1e-3) {
      scales.push(floor);
    }
    return scales;
  }
  nearestScale(value3) {
    const scales = this.availableScales();
    return scales[nearestIndex(scales, value3)];
  }
  publish(scale2) {
    this.runtime.adaptiveRenderScale = scale2;
    this.runtime.resizeViewport?.();
  }
  result(changed, pressureState, reason) {
    return {
      changed,
      hardFrameMilliseconds: 17,
      pressureState,
      reason,
      scale: this.runtime.adaptiveRenderScale,
      targetFrameMilliseconds: 1e3 / 60
    };
  }
};
function nearestIndex(scales, value3) {
  let best = 0;
  for (let index = 1; index < scales.length; index += 1) {
    if (Math.abs(scales[index] - value3) < Math.abs(scales[best] - value3)) {
      best = index;
    }
  }
  return best;
}
function clampIndex(index, length2) {
  return Math.max(0, Math.min(length2 - 1, index));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/performance/FrameBudgetWindow.js
var HARD_FRAME_MILLISECONDS = 17;
var FrameBudgetWindow = class {
  constructor(options = {}) {
    this.capacity = Math.max(1, Math.trunc(options.capacity || 90));
    this.targetFrameMilliseconds = options.targetFrameMilliseconds || 1e3 / 60;
    this.hardFrameMilliseconds = options.hardFrameMilliseconds || HARD_FRAME_MILLISECONDS;
    this.longFrameMilliseconds = options.longFrameMilliseconds || 50;
    this.values = new Float64Array(this.capacity);
    this.count = 0;
    this.cursor = 0;
    this.totalSamples = 0;
  }
  push(intervalMilliseconds) {
    if (!Number.isFinite(intervalMilliseconds) || intervalMilliseconds <= 0) {
      return false;
    }
    this.values[this.cursor] = intervalMilliseconds;
    this.cursor = (this.cursor + 1) % this.capacity;
    this.count = Math.min(this.capacity, this.count + 1);
    this.totalSamples += 1;
    return true;
  }
  clear() {
    this.count = 0;
    this.cursor = 0;
  }
  get ready() {
    return this.count >= this.capacity;
  }
  snapshot() {
    const ordered = this.orderedValues();
    const elapsedMilliseconds = ordered.reduce((total, value3) => total + value3, 0);
    const hardMisses = countAbove(ordered, this.hardFrameMilliseconds);
    const longFrames = countAbove(ordered, this.longFrameMilliseconds);
    const missedBudgetFrames = countAbove(ordered, this.targetFrameMilliseconds);
    const p99 = percentile(ordered, 0.99);
    const p999 = percentile(ordered, 0.999);
    return {
      averageFps: fpsFromElapsed(this.count, elapsedMilliseconds),
      averageIntervalMilliseconds: average(elapsedMilliseconds, this.count),
      capacity: this.capacity,
      count: this.count,
      hardFrameMilliseconds: this.hardFrameMilliseconds,
      hardMissRate: ratio(hardMisses, this.count),
      hardMisses,
      longFrameMilliseconds: this.longFrameMilliseconds,
      longFrameRate: ratio(longFrames, this.count),
      longFrames,
      maximumIntervalMilliseconds: ordered.at(-1) || 0,
      minimumIntervalMilliseconds: ordered[0] || 0,
      missedBudgetFrames,
      missedBudgetRate: ratio(missedBudgetFrames, this.count),
      onePercentLowFps: fpsFromInterval(p99),
      p50IntervalMilliseconds: percentile(ordered, 0.5),
      p95IntervalMilliseconds: percentile(ordered, 0.95),
      p99IntervalMilliseconds: p99,
      p999IntervalMilliseconds: p999,
      ready: this.ready,
      targetFrameMilliseconds: this.targetFrameMilliseconds,
      totalSamples: this.totalSamples,
      zeroPointOnePercentLowFps: fpsFromInterval(p999)
    };
  }
  orderedValues() {
    if (this.count < this.capacity) {
      return Array.from(this.values.subarray(0, this.count)).sort(numberOrder);
    }
    const values = [];
    for (let index = 0; index < this.count; index += 1) {
      values.push(this.values[(this.cursor + index) % this.capacity]);
    }
    return values.sort(numberOrder);
  }
};
function percentile(values, ratioValue) {
  if (!values.length) return 0;
  const index = Math.min(values.length - 1, Math.ceil(values.length * ratioValue) - 1);
  return values[Math.max(0, index)];
}
function countAbove(values, threshold) {
  return values.filter((value3) => value3 > threshold).length;
}
function average(total, count) {
  return count ? total / count : 0;
}
function ratio(value3, count) {
  return count ? value3 / count : 0;
}
function fpsFromElapsed(count, elapsedMilliseconds) {
  return elapsedMilliseconds > 0 ? count * 1e3 / elapsedMilliseconds : 0;
}
function fpsFromInterval(intervalMilliseconds) {
  return intervalMilliseconds > 0 ? 1e3 / intervalMilliseconds : 0;
}
function numberOrder(left, right) {
  return left - right;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/performance/RuntimeAnimationWindows.js
var FIELDS = Object.freeze({
  doors: "doorsMilliseconds",
  horses: "horsesMilliseconds",
  npcs: "npcsMilliseconds",
  playerMatrix: "playerMatrixMilliseconds",
  worldModels: "worldModelsMilliseconds"
});
var RuntimeAnimationWindows = class {
  constructor(options = {}) {
    const capacity = options.capacity || 600;
    this.windows = Object.fromEntries(
      Object.keys(FIELDS).map((name) => [
        name,
        new FrameBudgetWindow({ capacity })
      ])
    );
  }
  push(breakdown = {}) {
    for (const [name, field] of Object.entries(FIELDS)) {
      const value3 = breakdown[field];
      if (Number.isFinite(value3) && value3 >= 0) {
        this.windows[name].push(Math.max(1e-4, value3));
      }
    }
  }
  clear() {
    for (const window2 of Object.values(this.windows)) window2.clear();
  }
  snapshot(totalAnimationMilliseconds = 0) {
    const costs = Object.fromEntries(
      Object.entries(this.windows).map(([name, window2]) => [
        name,
        costSnapshot(window2.snapshot(), totalAnimationMilliseconds)
      ])
    );
    let dominantComponent = null;
    for (const name of Object.keys(costs)) {
      if (!dominantComponent || costs[name].averageMilliseconds > costs[dominantComponent].averageMilliseconds) {
        dominantComponent = name;
      }
    }
    return { ...costs, dominantComponent };
  }
};
function costSnapshot(snapshot2, totalAnimationMilliseconds) {
  return {
    averageMilliseconds: snapshot2.averageIntervalMilliseconds,
    count: snapshot2.count,
    p95Milliseconds: snapshot2.p95IntervalMilliseconds,
    p99Milliseconds: snapshot2.p99IntervalMilliseconds,
    ready: snapshot2.ready,
    share: totalAnimationMilliseconds > 0 ? snapshot2.averageIntervalMilliseconds / totalAnimationMilliseconds : 0
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/performance/RuntimeLongTaskMonitor.js
var DEFAULT_CAPACITY = 128;
var DEFAULT_WINDOW_MS = 1e4;
var RuntimeLongTaskMonitor = class {
  constructor(ObserverClass = globalThis.PerformanceObserver, options = {}) {
    this.available = supportsLongTasks(ObserverClass);
    this.capacity = options.capacity || DEFAULT_CAPACITY;
    this.windowMilliseconds = options.windowMilliseconds || DEFAULT_WINDOW_MS;
    this.now = options.nowProvider || defaultNow;
    this.durations = new Float64Array(this.capacity);
    this.timestamps = new Float64Array(this.capacity);
    this.count = 0;
    this.nextIndex = 0;
    this.totalObserved = 0;
    this.observer = null;
    if (this.available) {
      this.observer = new ObserverClass((list) => {
        this.recordEntries(list.getEntries());
      });
      this.observer.observe({ type: "longtask", buffered: true });
    }
  }
  recordEntries(entries = []) {
    for (const entry of entries) {
      const duration = Number(entry.duration);
      if (!Number.isFinite(duration) || duration < 0) continue;
      this.durations[this.nextIndex] = duration;
      this.timestamps[this.nextIndex] = Number.isFinite(entry.startTime) ? entry.startTime : this.now();
      this.nextIndex = (this.nextIndex + 1) % this.capacity;
      this.count = Math.min(this.capacity, this.count + 1);
      this.totalObserved += 1;
    }
  }
  reset() {
    this.count = 0;
    this.nextIndex = 0;
    this.totalObserved = 0;
  }
  snapshot(nowMilliseconds = this.now()) {
    if (!this.available) return unavailableSnapshot(this.windowMilliseconds);
    let count = 0;
    let maximumMilliseconds = 0;
    let totalMilliseconds = 0;
    for (let offset = 0; offset < this.count; offset += 1) {
      const index = (this.nextIndex - 1 - offset + this.capacity) % this.capacity;
      if (nowMilliseconds - this.timestamps[index] > this.windowMilliseconds) continue;
      const duration = this.durations[index];
      count += 1;
      totalMilliseconds += duration;
      maximumMilliseconds = Math.max(maximumMilliseconds, duration);
    }
    return {
      available: true,
      count,
      maximumMilliseconds,
      totalMilliseconds,
      totalObserved: this.totalObserved,
      windowMilliseconds: this.windowMilliseconds
    };
  }
  dispose() {
    this.observer?.disconnect();
    this.observer = null;
  }
};
function unavailableSnapshot(windowMilliseconds) {
  return {
    available: false,
    count: 0,
    maximumMilliseconds: null,
    totalMilliseconds: null,
    totalObserved: 0,
    windowMilliseconds
  };
}
function supportsLongTasks(ObserverClass) {
  return typeof ObserverClass === "function" && Array.isArray(ObserverClass.supportedEntryTypes) && ObserverClass.supportedEntryTypes.includes("longtask");
}
function defaultNow() {
  return globalThis.performance?.now?.() ?? Date.now();
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/performance/RuntimePerformanceVerdict.js
var TARGETS = Object.freeze({
  averageFps: 59,
  cpuMilliseconds: 1e3 / 60,
  onePercentLowFps: 55,
  zeroPointOnePercentLowFps: 50
});
function createRuntimePerformanceVerdict(evidence) {
  const frame = evidence.frame || {};
  const cpu = evidence.cpu || {};
  const context = evidence.context || {};
  const longTasks = evidence.longTasks || {};
  const reasons = [];
  if (!context.foregroundEligible) {
    reasons.push(context.reason || "foreground-context-required");
  }
  if (!frame.ready || !cpu.ready) {
    reasons.push("warming-up");
  }
  if (frame.ready) {
    appendFrameReasons(reasons, frame);
  }
  if (cpu.ready && cpu.averageMilliseconds > TARGETS.cpuMilliseconds) {
    reasons.push("cpu-budget");
  }
  if (longTasks.available && longTasks.count > 0) {
    reasons.push("long-tasks");
  }
  const eligible = Boolean(context.foregroundEligible);
  const ready = Boolean(frame.ready && cpu.ready);
  const meetsTarget = eligible && ready && reasons.length === 0;
  return {
    eligible,
    evidenceComplete: ready,
    meetsTarget,
    reasons: Object.freeze([...new Set(reasons)]),
    status: verdictStatus(eligible, ready, meetsTarget),
    targets: { ...TARGETS }
  };
}
function appendFrameReasons(reasons, frame) {
  if (frame.averageFps < TARGETS.averageFps) {
    reasons.push("average-fps");
  }
  if (frame.onePercentLowFps < TARGETS.onePercentLowFps) {
    reasons.push("one-percent-low");
  }
  if (frame.zeroPointOnePercentLowFps < TARGETS.zeroPointOnePercentLowFps) {
    reasons.push("zero-point-one-percent-low");
  }
}
function verdictStatus(eligible, ready, meetsTarget) {
  if (!eligible) {
    return "ineligible";
  }
  if (!ready) {
    return "warming-up";
  }
  return meetsTarget ? "pass" : "fail";
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/performance/RuntimePerformanceProbe.js
function createRuntimePerformanceProbe() {
  if (typeof document === "undefined") {
    return { dataset: {}, textContent: "" };
  }
  const existing = document.getElementById("AwtsmoosPerformance");
  if (existing) return existing;
  const element2 = document.createElement("output");
  element2.id = "AwtsmoosPerformance";
  element2.setAttribute("aria-label", "Live rendering and multiplayer performance");
  element2.hidden = new URLSearchParams(location.search).get("perf") !== "1";
  Object.assign(element2.style, probeStyle());
  document.body.append(element2);
  return element2;
}
function publishRuntimePerformanceProbe(element2, diagnostics3) {
  const animation = diagnostics3.animationBreakdown;
  const frame = diagnostics3.frame;
  const resources = diagnostics3.resources;
  const sampling = diagnostics3.sampling;
  const subsystems = diagnostics3.subsystems;
  const verdict = diagnostics3.verdict;
  const animationName = animation.dominantComponent || "none";
  const animationCost = animation[animationName]?.p95Milliseconds;
  Object.assign(element2.dataset, {
    animationDominant: animationName,
    animationP95Ms: fixed(animationCost),
    context: sampling.kind,
    cpuMs: fixed(diagnostics3.cpu.averageMilliseconds),
    dominant: subsystems.dominantSubsystem || "none",
    draws: String(resources.drawCalls),
    fps: fixed(frame.averageFps),
    gpuAvailable: String(resources.gpuFrameTime.available),
    gpuMs: fixed(resources.gpuFrameTime.milliseconds),
    longTasks: String(diagnostics3.longTasks.count),
    materials: String(resources.activeMaterials),
    objects: String(resources.objectCount),
    onePercentLow: fixed(frame.onePercentLowFps),
    pressure: diagnostics3.governor.pressureState,
    qualityPreserved: "true",
    renderP95Ms: fixed(subsystems.render.p95Milliseconds),
    target: "60",
    textures: String(resources.textureCount),
    triangles: String(resources.triangles),
    verdict: verdict.status,
    zeroPointOnePercentLow: fixed(frame.zeroPointOnePercentLowFps)
  });
  element2.textContent = probeLines(diagnostics3).join("\n");
}
function probeLines(diagnostics3) {
  const animation = diagnostics3.animationBreakdown;
  const frame = diagnostics3.frame;
  const subsystems = diagnostics3.subsystems;
  const verdict = diagnostics3.verdict;
  const animationName = animation.dominantComponent || "none";
  return [
    [
      `${verdict.status.toUpperCase()} \xB7 ${diagnostics3.sampling.kind}`,
      `FPS ${fixed(frame.averageFps, 0)}`,
      `1% ${fixed(frame.onePercentLowFps, 0)}`,
      `0.1% ${fixed(frame.zeroPointOnePercentLowFps, 0)}`
    ].join(" \xB7 "),
    [
      `CPU ${fixed(diagnostics3.cpu.averageMilliseconds)}ms`,
      `dominant ${subsystems.dominantSubsystem || "none"}`,
      `render p95 ${fixed(subsystems.render.p95Milliseconds)}ms`,
      `animation ${animationName} p95 ${fixed(animation[animationName]?.p95Milliseconds)}ms`
    ].join(" \xB7 "),
    [
      `${diagnostics3.resources.drawCalls} draws`,
      `${diagnostics3.resources.triangles} triangles`,
      `${diagnostics3.longTasks.count} recent long tasks`
    ].join(" \xB7 "),
    verdict.reasons.length ? verdict.reasons.join(", ") : "all measured gates passed"
  ];
}
function probeStyle() {
  return {
    backdropFilter: "blur(9px)",
    background: "rgba(9,20,20,.88)",
    border: "1px solid rgba(255,211,116,.68)",
    borderRadius: "14px",
    color: "#fff0c2",
    font: "600 12px/1.35 system-ui,sans-serif",
    left: "50%",
    maxWidth: "min(94vw, 1040px)",
    padding: "8px 14px",
    pointerEvents: "none",
    position: "fixed",
    textAlign: "center",
    top: "10px",
    transform: "translateX(-50%)",
    whiteSpace: "pre-line",
    zIndex: "80"
  };
}
function fixed(value3, digits = 1) {
  return Number.isFinite(value3) ? Number(value3).toFixed(digits) : "n/a";
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/performance/QualityTier.js
var QUALITY_TIER_ORDER = ["low", "medium", "high", "cinematic"];
var QUALITY_TIERS = Object.freeze({
  low: freezeTier({ name: "low", transitionBudget: 2 }),
  medium: freezeTier({ name: "medium", transitionBudget: 4 }),
  high: freezeTier({ name: "high", transitionBudget: 6 }),
  cinematic: freezeTier({
    name: "cinematic",
    decorativeDistanceScale: 1.35,
    vegetationDistanceScale: 1.28,
    transitionBudget: 8
  })
});
function qualityTier(name, fallback = "medium") {
  return QUALITY_TIERS[name] || QUALITY_TIERS[fallback] || QUALITY_TIERS.medium;
}
function clampQualityTier(requestedName, maximumName = "high") {
  const requestedIndex = qualityTierIndex(requestedName);
  const maximumIndex = qualityTierIndex(maximumName);
  return QUALITY_TIER_ORDER[Math.min(requestedIndex, maximumIndex)];
}
function qualityTierIndex(name) {
  const index = QUALITY_TIER_ORDER.indexOf(name);
  return index >= 0 ? index : QUALITY_TIER_ORDER.indexOf("medium");
}
function freezeTier(values) {
  return Object.freeze({
    decorativeDistanceScale: 1,
    internalResolutionScale: 1,
    maximumLongFrameRate: 0.03,
    vegetationDistanceScale: 1,
    ...values
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/performance/FrameBudgetGovernor.js
var HARD_FRAME_MILLISECONDS2 = 17;
var FrameBudgetGovernor = class {
  constructor(options = {}) {
    this.maximumTier = options.maximumTier || "high";
    this.currentTier = clampQualityTier(
      options.initialTier || this.maximumTier,
      this.maximumTier
    );
    this.warmupMilliseconds = options.warmupMilliseconds ?? 1e3;
    this.lastPressureState = "unmeasured";
    this.startedAt = null;
    this.decisions = [];
  }
  evaluate(snapshot2, nowMilliseconds) {
    if (this.startedAt === null) this.startedAt = nowMilliseconds;
    const blocked = this.blockedReason(snapshot2, nowMilliseconds);
    if (blocked) return this.result(blocked, snapshot2, "unmeasured");
    const pressureState = classifyPressure(snapshot2);
    const reason = pressureState === "stable" ? "stable-under-seventeen-milliseconds" : `${pressureState}-seventeen-millisecond-covenant-breached`;
    if (pressureState !== this.lastPressureState) {
      this.decisions.push({
        at: nowMilliseconds,
        pressureState,
        qualityPreserved: true,
        recommendations: recommendations(pressureState),
        snapshot: snapshot2
      });
      this.lastPressureState = pressureState;
    }
    return this.result(reason, snapshot2, pressureState);
  }
  blockedReason(snapshot2, nowMilliseconds) {
    if (!snapshot2?.ready) return "window-not-ready";
    if (nowMilliseconds - this.startedAt < this.warmupMilliseconds) return "warmup";
    return null;
  }
  result(reason, snapshot2, pressureState) {
    return {
      changed: false,
      hardFrameMilliseconds: HARD_FRAME_MILLISECONDS2,
      nextTier: this.currentTier,
      pressureState,
      previousTier: this.currentTier,
      qualityPreserved: true,
      reason,
      recommendations: recommendations(pressureState),
      snapshot: snapshot2
    };
  }
};
function classifyPressure(snapshot2) {
  if (snapshot2.averageIntervalMilliseconds > HARD_FRAME_MILLISECONDS2 || snapshot2.p95IntervalMilliseconds > HARD_FRAME_MILLISECONDS2 || snapshot2.hardMissRate > 0.01 || snapshot2.averageFps < 58.8) {
    return "critical";
  }
  if (snapshot2.p95IntervalMilliseconds > 1e3 / 60 || snapshot2.missedBudgetRate > 0.01 || snapshot2.onePercentLowFps < 59) {
    return "warning";
  }
  return "stable";
}
function recommendations(pressureState) {
  if (pressureState === "unmeasured" || pressureState === "stable") return [];
  return [
    "reduce-framebuffer-scale",
    "batch-and-instance",
    "bound-shadow-updates",
    "cache-calculations",
    "pool-objects",
    "bound-streaming",
    "eliminate-duplicate-work"
  ];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/performance/RuntimePerformanceMonitorSupport.js
function createPerformanceGovernor(runtime, options) {
  return new FrameBudgetGovernor({
    initialTier: runtime.qualityProfile.quality,
    maximumTier: runtime.qualityProfile.quality,
    warmupMilliseconds: options.warmupMilliseconds ?? 3e3
  });
}
function createPerformanceCounters() {
  return {
    acceptedFocused: 0,
    acceptedNonForeground: 0,
    discardedTransitionFrames: 0,
    rejectedHidden: 0
  };
}
function performanceEvidence(monitor) {
  return {
    context: monitor.context,
    cpu: monitor.cpu,
    frame: monitor.frame,
    longTasks: monitor.longTasks
  };
}
function performanceDiagnostics(monitor) {
  return {
    animationBreakdown: monitor.animationBreakdown,
    cpu: { ...monitor.cpu },
    frame: { ...monitor.frame },
    governor: governorDiagnostics(monitor),
    longTasks: { ...monitor.longTasks },
    meets60Target: monitor.verdict.meetsTarget,
    renderScale: {
      current: monitor.runtime.adaptiveRenderScale,
      decision: monitor.renderScaleDecision,
      history: [...monitor.renderScalePolicy.history]
    },
    resources: monitor.resources,
    sampling: {
      ...monitor.context,
      counters: { ...monitor.counters },
      windowResets: monitor.windowResets
    },
    subsystems: monitor.subsystems,
    targetFps: 60,
    verdict: monitor.verdict
  };
}
function resetPerformanceWindows(monitor) {
  monitor.frameWindow.clear();
  monitor.subsystemWindows.clear();
  monitor.animationWindows.clear();
  monitor.longTaskMonitor.reset();
  monitor.frame = monitor.frameWindow.snapshot();
  monitor.subsystems = monitor.subsystemWindows.snapshot();
  monitor.animationBreakdown = monitor.animationWindows.snapshot(0);
  monitor.cpu = monitor.subsystems.cpu;
  monitor.longTasks = monitor.longTaskMonitor.snapshot();
  monitor.verdict = createRuntimePerformanceVerdict(performanceEvidence(monitor));
  monitor.lastEvaluationAt = 0;
  monitor.windowResets += 1;
}
function governorDiagnostics(monitor) {
  return {
    currentTier: monitor.governor.currentTier,
    decisions: [...monitor.governor.decisions],
    pressureState: monitor.decision.pressureState,
    qualityPreserved: true,
    recommendations: [...monitor.decision.recommendations]
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/performance/RuntimeSceneResourceScan.js
var MIP_OVERHEAD = 4 / 3;
function scanRuntimeSceneResources(scene) {
  if (!scene?.traverse) {
    return emptyRuntimeSceneMetrics();
  }
  const materials = /* @__PURE__ */ new Set();
  const textures = /* @__PURE__ */ new Set();
  let objectCount = 0;
  let triangles = 0;
  scene.traverse((object) => {
    objectCount += 1;
    triangles += geometryTriangles(object.geometry);
    for (const material of materialArray(object.material)) {
      collectMaterialResources(material, materials, textures);
    }
  });
  return {
    activeMaterials: materials.size,
    objectCount,
    textureCount: textures.size,
    textureMemoryBytesEstimate: Array.from(textures).reduce(textureBytes, 0),
    triangles
  };
}
function emptyRuntimeSceneMetrics() {
  return {
    activeMaterials: 0,
    objectCount: 0,
    textureCount: 0,
    textureMemoryBytesEstimate: 0,
    triangles: 0
  };
}
function collectMaterialResources(material, materials, textures) {
  if (!material) {
    return;
  }
  materials.add(material);
  for (const value3 of Object.values(material)) {
    if (value3?.isTexture) {
      textures.add(value3);
    }
  }
}
function geometryTriangles(geometry) {
  if (!geometry) {
    return 0;
  }
  const count = geometry.index?.count || geometry.attributes?.position?.count || 0;
  return Math.floor(count / 3);
}
function textureBytes(total, texture2) {
  const image = texture2.image || texture2.source?.data;
  const width = Number(image?.width || image?.videoWidth || 0);
  const height = Number(image?.height || image?.videoHeight || 0);
  return total + Math.round(width * height * 4 * MIP_OVERHEAD);
}
function materialArray(value3) {
  return Array.isArray(value3) ? value3 : [value3];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/performance/RuntimeResourceSnapshot.js
var STATIC_SCAN_INTERVAL_MS = 5e3;
var RuntimeResourceSnapshot = class {
  constructor() {
    this.lastSceneScanAt = -Infinity;
    this.scene = emptyRuntimeSceneMetrics();
    this.memoryBaseline = null;
  }
  collect(runtime, costs = {}, now2 = performance.now()) {
    if (now2 - this.lastSceneScanAt >= STATIC_SCAN_INTERVAL_MS) {
      this.scene = scanRuntimeSceneResources(runtime.scene);
      this.lastSceneScanAt = now2;
    }
    const renderer = runtime.renderer || {};
    const stats3 = renderer.stats || renderer.info?.render || {};
    return {
      activeMaterials: this.scene.activeMaterials,
      animationCostMilliseconds: finiteOrNull(costs.animationMilliseconds),
      drawCalls: finiteOrZero(stats3.draws ?? stats3.calls),
      garbageCollection: { available: false, stallMilliseconds: null },
      gpuFrameTime: gpuEvidence(stats3),
      memory: memoryEvidence(this),
      objectCount: this.scene.objectCount,
      renderSubmissionMilliseconds: finiteOrNull(costs.renderSubmissionMilliseconds),
      shadowCostMilliseconds: finiteOrNull(costs.shadowMilliseconds),
      streaming: streamingEvidence(runtime, costs),
      textureCount: this.scene.textureCount,
      textureMemoryBytesEstimate: this.scene.textureMemoryBytesEstimate,
      triangles: finiteOrZero(stats3.triangles) || this.scene.triangles,
      vegetationCostMilliseconds: finiteOrNull(costs.vegetationMilliseconds),
      waterCostMilliseconds: finiteOrNull(costs.waterMilliseconds)
    };
  }
};
function streamingEvidence(runtime, costs) {
  return {
    chunk: runtime.chunkRuntime?.diagnostics?.() || null,
    costMilliseconds: finiteOrNull(costs.streamingMilliseconds),
    stalls: runtime.chunkRuntime?.stats?.streamingStalls ?? null
  };
}
function memoryEvidence(sampler) {
  const memory = performance.memory;
  if (!memory) {
    return { available: false, growthBytes: null, usedBytes: null };
  }
  sampler.memoryBaseline ??= memory.usedJSHeapSize;
  return {
    available: true,
    growthBytes: memory.usedJSHeapSize - sampler.memoryBaseline,
    usedBytes: memory.usedJSHeapSize
  };
}
function gpuEvidence(stats3) {
  const milliseconds = finiteOrNull(stats3.gpuFrameMilliseconds);
  return { available: milliseconds !== null, milliseconds };
}
function finiteOrNull(value3) {
  return Number.isFinite(value3) ? Number(value3) : null;
}
function finiteOrZero(value3) {
  return Number.isFinite(value3) ? Number(value3) : 0;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/performance/RuntimeSamplingContext.js
var RuntimeSamplingContext = class {
  constructor(provider = defaultContextProvider) {
    this.provider = provider;
    this.currentKind = null;
    this.transitions = 0;
  }
  sample() {
    const observed = normalizeContext(this.provider());
    const changed = this.currentKind !== null && this.currentKind !== observed.kind;
    if (changed) {
      this.transitions += 1;
    }
    this.currentKind = observed.kind;
    return {
      ...observed,
      changed,
      transitions: this.transitions
    };
  }
};
function defaultContextProvider() {
  if (typeof document === "undefined") {
    return { kind: "unknown" };
  }
  const visibilityState = document.visibilityState || "unknown";
  if (document.hidden || visibilityState === "hidden") {
    return { kind: "hidden", visibilityState };
  }
  if (visibilityState === "prerender") {
    return { kind: "prerender", visibilityState };
  }
  if (typeof document.hasFocus !== "function") {
    return { kind: "unknown", visibilityState };
  }
  return {
    kind: document.hasFocus() ? "focused" : "unfocused",
    visibilityState
  };
}
function normalizeContext(value3 = {}) {
  const kind = validKind(value3.kind) ? value3.kind : "unknown";
  const hidden = kind === "hidden" || kind === "prerender";
  return {
    focused: kind === "focused",
    foregroundEligible: kind === "focused",
    hidden,
    kind,
    reason: contextReason(kind),
    recordable: !hidden,
    visibilityState: value3.visibilityState || "unknown"
  };
}
function validKind(kind) {
  return [
    "focused",
    "unfocused",
    "hidden",
    "prerender",
    "unknown"
  ].includes(kind);
}
function contextReason(kind) {
  const reasons = {
    focused: "foreground-valid",
    hidden: "document-hidden",
    prerender: "document-prerendering",
    unfocused: "window-unfocused",
    unknown: "focus-unknown"
  };
  return reasons[kind];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/performance/RuntimeSubsystemWindows.js
var COST_FIELDS = Object.freeze({
  animation: "animationMilliseconds",
  camera: "cameraMilliseconds",
  cpu: "cpuFrameMilliseconds",
  gameplay: "gameplayMilliseconds",
  render: "renderSubmissionMilliseconds",
  shadows: "shadowMilliseconds",
  streaming: "streamingMilliseconds",
  water: "waterMilliseconds"
});
var RuntimeSubsystemWindows = class {
  constructor(options = {}) {
    const capacity = options.capacity || 600;
    this.windows = Object.fromEntries(
      Object.keys(COST_FIELDS).map((name) => [
        name,
        new FrameBudgetWindow({ capacity })
      ])
    );
  }
  push(costs = {}) {
    for (const [name, field] of Object.entries(COST_FIELDS)) {
      const value3 = costs[field];
      if (Number.isFinite(value3) && value3 >= 0) {
        this.windows[name].push(Math.max(1e-4, value3));
      }
    }
  }
  clear() {
    for (const window2 of Object.values(this.windows)) {
      window2.clear();
    }
  }
  snapshot() {
    const snapshots = Object.fromEntries(
      Object.entries(this.windows).map(([name, window2]) => [
        name,
        costSnapshot2(window2.snapshot())
      ])
    );
    return attributeSubsystems(snapshots);
  }
};
function costSnapshot2(snapshot2) {
  return {
    averageIntervalMilliseconds: snapshot2.averageIntervalMilliseconds,
    averageMilliseconds: snapshot2.averageIntervalMilliseconds,
    count: snapshot2.count,
    maximumMilliseconds: snapshot2.maximumIntervalMilliseconds,
    p50Milliseconds: snapshot2.p50IntervalMilliseconds,
    p95Milliseconds: snapshot2.p95IntervalMilliseconds,
    p99Milliseconds: snapshot2.p99IntervalMilliseconds,
    ready: snapshot2.ready,
    totalSamples: snapshot2.totalSamples
  };
}
function attributeSubsystems(snapshots) {
  const cpuAverage = snapshots.cpu.averageMilliseconds;
  const names = Object.keys(snapshots).filter((name) => name !== "cpu");
  let attributedAverage = 0;
  let dominantSubsystem = null;
  for (const name of names) {
    const snapshot2 = snapshots[name];
    attributedAverage += snapshot2.averageMilliseconds;
    snapshot2.cpuShare = ratio2(snapshot2.averageMilliseconds, cpuAverage);
    if (!dominantSubsystem || snapshot2.averageMilliseconds > snapshots[dominantSubsystem].averageMilliseconds) {
      dominantSubsystem = name;
    }
  }
  const otherMilliseconds = Math.max(0, cpuAverage - attributedAverage);
  return {
    ...snapshots,
    attributedAverageMilliseconds: attributedAverage,
    attributionRatio: ratio2(Math.min(cpuAverage, attributedAverage), cpuAverage),
    dominantSubsystem,
    otherMilliseconds
  };
}
function ratio2(value3, total) {
  return total > 0 ? value3 / total : 0;
}
var RUNTIME_SUBSYSTEM_NAMES = Object.freeze(
  Object.keys(COST_FIELDS).filter((name) => name !== "cpu")
);

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/performance/RuntimePerformanceMonitor.js
var EVALUATION_INTERVAL_MS = 500;
var RuntimePerformanceMonitor = class {
  constructor(runtime, options = {}) {
    this.runtime = runtime;
    const capacity = options.capacity || 600;
    this.frameWindow = new FrameBudgetWindow({ capacity });
    this.subsystemWindows = new RuntimeSubsystemWindows({ capacity });
    this.animationWindows = new RuntimeAnimationWindows({ capacity });
    this.samplingContext = new RuntimeSamplingContext(options.contextProvider);
    this.longTaskMonitor = new RuntimeLongTaskMonitor(options.PerformanceObserver);
    this.governor = createPerformanceGovernor(runtime, options);
    this.resourceSampler = new RuntimeResourceSnapshot();
    this.renderScalePolicy = new AdaptiveRenderScalePolicy(runtime, options.renderScale);
    this.frame = this.frameWindow.snapshot();
    this.subsystems = this.subsystemWindows.snapshot();
    this.animationBreakdown = this.animationWindows.snapshot(0);
    this.cpu = this.subsystems.cpu;
    this.context = this.samplingContext.sample();
    this.longTasks = this.longTaskMonitor.snapshot();
    this.resources = this.resourceSampler.collect(runtime);
    this.decision = this.governor.evaluate(this.frame, 0);
    this.renderScaleDecision = this.renderScalePolicy.result(false, "unmeasured", "initial");
    this.verdict = createRuntimePerformanceVerdict(performanceEvidence(this));
    this.counters = createPerformanceCounters();
    this.lastEvaluationAt = 0;
    this.windowResets = 0;
    this.element = createRuntimePerformanceProbe();
    runtime.adaptiveQualityTier = runtime.qualityProfile.quality;
  }
  record(intervalMilliseconds, nowMilliseconds, costs = {}) {
    this.context = this.samplingContext.sample();
    if (this.context.changed) return this.discardTransitionFrame();
    if (!this.context.recordable) {
      this.counters.rejectedHidden += 1;
      return this.frame;
    }
    this.countAcceptedContext();
    this.frameWindow.push(intervalMilliseconds);
    this.subsystemWindows.push(costs);
    this.animationWindows.push(costs.animationBreakdown);
    if (nowMilliseconds - this.lastEvaluationAt >= EVALUATION_INTERVAL_MS) {
      this.evaluate(costs, nowMilliseconds);
    }
    return this.frame;
  }
  evaluate(costs, nowMilliseconds) {
    this.lastEvaluationAt = nowMilliseconds;
    this.frame = this.frameWindow.snapshot();
    this.subsystems = this.subsystemWindows.snapshot();
    this.animationBreakdown = this.animationWindows.snapshot(
      this.subsystems.animation.averageMilliseconds
    );
    this.cpu = this.subsystems.cpu;
    this.decision = this.governor.evaluate(this.frame, nowMilliseconds);
    this.renderScaleDecision = this.renderScalePolicy.evaluate(
      this.decision.pressureState,
      nowMilliseconds
    );
    this.resources = this.resourceSampler.collect(this.runtime, costs, nowMilliseconds);
    this.longTasks = this.longTaskMonitor.snapshot();
    this.verdict = createRuntimePerformanceVerdict(performanceEvidence(this));
    publishRuntimePerformanceProbe(this.element, this.diagnostics());
  }
  diagnostics() {
    return performanceDiagnostics(this);
  }
  dispose() {
    this.longTaskMonitor.dispose();
    this.element?.remove?.();
  }
  discardTransitionFrame() {
    resetPerformanceWindows(this);
    this.counters.discardedTransitionFrames += 1;
    if (!this.context.recordable) this.counters.rejectedHidden += 1;
    return this.frame;
  }
  countAcceptedContext() {
    const key = this.context.foregroundEligible ? "acceptedFocused" : "acceptedNonForeground";
    this.counters[key] += 1;
  }
};
function installRuntimePerformanceMonitor(runtime, options) {
  const monitor = new RuntimePerformanceMonitor(runtime, options);
  runtime.performanceMonitor = monitor;
  return monitor;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/LavaLevel.js
var LAVA_START = { x: -62, z: 42 };
var ERETZ_RETURN = { x: 0, z: 4 };
var LAVA_Y = -1.18;
var LavaLevel = class {
  constructor(scene, assets = {}) {
    this.group = new Group();
    this.group.name = "Awtsmoos_long_lava_coin_world_easy_extended";
    this.group.visible = false;
    this.assets = assets;
    this.defs = lavaWorldDefs(assets);
    this.coins = coinData().map((p, i) => makeCoin(p, assets, i));
    this.collected = 0;
    this.failures = 0;
    this.active = false;
    this.notice = "";
    this.build();
    this.octree = buildOctree(this.colliders);
    scene.add(this.group);
  }
  build() {
    this.colliders = this.defs.flatMap(primitiveColliders);
    for (const d of this.defs) this.group.add(createPrimitiveMesh(d));
    for (const c of this.coins) this.group.add(c.group);
  }
  heightAt() {
    return LAVA_Y + 0.09;
  }
  enter(state, ground, mover, footOffset) {
    this.active = true;
    this.group.visible = true;
    this.notice = "Long lava course: collect every coin; lava resets the count.";
    state.level = "lava-coin-course";
    this.resetPlayer(state, ground, footOffset);
    if (mover) mover.octree = this.octree;
  }
  leave(state, ground, mover, mainOctree, footOffset) {
    this.active = false;
    this.group.visible = false;
    this.notice = "";
    state.level = "eretz";
    state.x = ERETZ_RETURN.x;
    state.z = ERETZ_RETURN.z;
    if (mover) mover.octree = mainOctree;
    state.y = ground.heightAt(state.x, state.z) + footOffset;
    state.renderY = state.y;
    state.velY = 0;
    state.grounded = true;
  }
  update(state, ground, footOffset) {
    if (!this.active) return;
    if (this.touchedLava(state, footOffset)) return this.fail(state, ground, footOffset);
    for (const c of this.coins) if (!c.got && Math.hypot(state.x - c.x, state.z - c.z) < 1.35 && Math.abs(state.y - footOffset - c.floorY) < 2.8) {
      c.got = true;
      c.group.visible = false;
      this.collected++;
      this.notice = `Coin collected: ${this.collected}/${this.coins.length}`;
    }
  }
  touchedLava(state, footOffset) {
    return state.y - footOffset <= LAVA_Y + 0.3;
  }
  fail(state, ground, footOffset) {
    this.failures++;
    this.notice = `Lava reset ${this.failures}; coins 0/${this.coins.length}.`;
    for (const c of this.coins) {
      c.got = false;
      c.group.visible = true;
    }
    this.collected = 0;
    this.resetPlayer(state, ground, footOffset);
  }
  resetPlayer(state, ground, footOffset) {
    state.x = LAVA_START.x;
    state.z = LAVA_START.z;
    state.y = ground.heightAt(state.x, state.z) + footOffset;
    state.renderY = state.y;
    state.velY = 0;
    state.grounded = true;
  }
  stats() {
    return { active: this.active, coins: this.collected, collected: this.collected, total: this.coins.length, failures: this.failures, start: LAVA_START, platformColliders: this.colliders.length, loadedWorld: this.group.visible, notice: this.notice, platformTexture: tex(this.assets.redBrickImage), coinTexture: tex(this.assets.goldImage), easierCourse: true, extendedCourse: true };
  }
};
function lavaWorldDefs(assets = {}) {
  const lava = { color: "#ff3512", mapImage: assets.lavaImage || null, textureUrl: tex(assets.lavaImage), mapRepeat: [18, 7] }, brick = brickMaterial(assets);
  const out = [{ id: "lava-huge-extended-burning-sea", shape: "box", solid: false, walkable: false, ...lava, position: { x: -18, y: LAVA_Y, z: 42 }, size: { x: 118, y: 0.22, z: 46 }, rotation: { y: 0.01 } }];
  for (const [i, p] of courseNodes().entries()) out.push(box2(`lava-long-red-brick-platform-${i + 1}`, brick, p.x, p.y, p.z, p.sx, 0.58, p.sz, p.yaw || 0, true));
  return out;
}
function coinData() {
  return courseNodes().filter((_, i) => i > 0 && i % 2 === 0).map((p) => [p.x, p.y + 1.05, p.z, p.y + 0.29]);
}
function courseNodes() {
  const out = [{ x: -62, y: 0.48, z: 42, sx: 6.2, sz: 5.2, yaw: 0 }];
  for (let i = 1; i <= 30; i++) {
    const x = -62 + i * 3.2, z = 42 + Math.sin(i * 0.48) * 6.4 + Math.cos(i * 0.21) * 2.2, big = i % 5 === 0 || i % 7 === 0;
    out.push({ x, y: 0.56 + i % 4 * 0.08, z, sx: big ? 4.4 : 3, sz: i % 3 === 0 ? 3.8 : big ? 4.1 : 2.85, yaw: i * 0.08 });
  }
  out.push({ x: 39.5, y: 1.02, z: 43, sx: 7.4, sz: 5.6, yaw: 0.08 });
  return out;
}
function makeCoin([x, y, z, floorY], assets, i) {
  const group = new Group();
  group.name = `long-gold-coin-${i + 1}`;
  group.add(createPrimitiveMesh({ id: `gold-2-long-course-coin-${i + 1}`, shape: "cylinder", color: "#ffd84a", mapImage: assets.goldImage || null, textureUrl: tex(assets.goldImage), mapRepeat: [1, 1], solid: false, position: { x, y, z }, radius: 0.48, height: 0.08, segments: 32, rotation: { x: Math.PI / 2 } }));
  return { x, y, z, floorY, group, got: false };
}
function brickMaterial(assets) {
  const img = assets.redBrickImage || assets.redBrick2Image || assets.brickImage;
  return { color: "#f47a55", mapImage: img || null, textureUrl: tex(img), mapRepeat: [2.4, 2.4] };
}
function box2(id, material, x, y, z, sx, sy, sz, yaw, walkable) {
  return { id, shape: "box", solid: true, walkable, noEdge: true, ...material, position: { x, y, z }, size: { x: sx, y: sy, z: sz }, rotation: { y: yaw } };
}
function buildOctree(colliders) {
  const octree = new AwtsmoosOctree(Aabb.centerSize({ x: -18, y: 2, z: 42 }, { x: 170, y: 70, z: 92 }));
  for (const tri of colliders) octree.insert(tri);
  return octree;
}
function tex(img) {
  return img?.dataset?.url || img?.dataset?.publicUrl || img?.src || null;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/ShadowUpdateState.js
function captureShadowUpdateState({
  state,
  ground,
  npc,
  worldMode
}) {
  const octree = ground?.octree;
  const octreeRevision = collisionRevisionFor2(octree);
  return Object.freeze({
    playerX: state?.x,
    playerZ: state?.z,
    playerFacing: state?.facing,
    playerLevel: state?.level,
    npcX: npc?.x,
    npcZ: npc?.z,
    npcVisible: npc?.group?.visible !== false,
    worldMode: worldMode?.mode,
    octree,
    octreeRevision,
    terrainHeightAt: ground?.terrainHeightAt
  });
}
function shadowUpdateStateChanged(previous, next) {
  if (!previous) {
    return true;
  }
  return previous.playerX !== next.playerX || previous.playerZ !== next.playerZ || previous.playerFacing !== next.playerFacing || previous.playerLevel !== next.playerLevel || previous.npcX !== next.npcX || previous.npcZ !== next.npcZ || previous.npcVisible !== next.npcVisible || previous.worldMode !== next.worldMode || previous.octree !== next.octree || previous.octreeRevision !== next.octreeRevision || previous.terrainHeightAt !== next.terrainHeightAt;
}
var ShadowUpdateTracker = class {
  constructor() {
    this.previous = null;
    this.stats = { applied: 0, skipped: 0 };
  }
  /** Returns whether the current context requires a fresh shadow projection. */
  shouldApply(context) {
    const next = captureShadowUpdateState(context);
    if (!shadowUpdateStateChanged(this.previous, next)) {
      this.stats.skipped += 1;
      return false;
    }
    this.previous = next;
    this.stats.applied += 1;
    return true;
  }
};
function collisionRevisionFor2(octree) {
  const revision = octree?.revision;
  return revision === void 0 ? null : String(revision);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/SunShadowMeshes.js
function createSunShadowMeshes(scene) {
  const group = new Group();
  group.name = "Awtsmoos_fast_sun_projected_shadows";
  const player = shadowDisc("player-sun-shadow", 1.05, 0.22);
  const npc = shadowDisc("npc-sun-shadow", 0.95, 0.18);
  const house2 = shadowBox(
    "house-roof-ground-shadow",
    10.8,
    6.8,
    0.16
  );
  group.add(player);
  group.add(npc);
  group.add(house2);
  scene.add(group);
  return { group, player, npc, house: house2 };
}
function placeSunShadow(mesh, x, y, z, yaw) {
  mesh.position.set(x, y, z);
  mesh.quaternion.set(
    0,
    Math.sin(yaw / 2),
    0,
    Math.cos(yaw / 2)
  );
  mesh.setBaseTransform();
}
function shadowDisc(id, radius, opacity) {
  return shadowMaterial(createPrimitiveMesh({
    id,
    shape: "cylinder",
    color: "#000000",
    solid: false,
    position: { x: 0, y: 0, z: 0 },
    radius,
    height: 0.025,
    segments: 40,
    rotation: {}
  }), opacity);
}
function shadowBox(id, x, z, opacity) {
  return shadowMaterial(createPrimitiveMesh({
    id,
    shape: "box",
    color: "#000000",
    solid: false,
    position: { x: 0, y: 0, z: 0 },
    size: { x, y: 0.025, z },
    rotation: { y: -0.16 }
  }), opacity);
}
function shadowMaterial(mesh, opacity) {
  mesh.material.opacity = opacity;
  mesh.material.alphaMode = "BLEND";
  mesh.material.transparent = true;
  mesh.material.color = [0, 0, 0, opacity];
  return mesh;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/SunShadowProjector.js
var SunShadowProjector = class {
  constructor(scene) {
    Object.assign(this, createSunShadowMeshes(scene));
    this.updateTracker = new ShadowUpdateTracker();
  }
  update(context) {
    if (!this.updateTracker.shouldApply(context)) return false;
    this.applyUpdate(context);
    return true;
  }
  applyUpdate({ state, ground, npc, worldMode }) {
    const lava = state.level.startsWith("lava");
    this.group.visible = true;
    placeSunShadow(
      this.player,
      state.x - 0.55,
      ground.heightAt(state.x, state.z) + 0.025,
      state.z + 0.45,
      state.facing
    );
    this.updateNpcShadow({ lava, ground, npc });
    this.updateHouseShadow({ lava, ground, worldMode });
  }
  updateNpcShadow({ lava, ground, npc }) {
    this.npc.visible = !lava && npc?.group?.visible !== false;
    if (!this.npc.visible) return;
    placeSunShadow(
      this.npc,
      npc.x - 0.45,
      ground.heightAt(npc.x, npc.z) + 0.026,
      npc.z + 0.35,
      0
    );
  }
  updateHouseShadow({ lava, ground, worldMode }) {
    this.house.visible = !lava && worldMode?.mode === "eretz";
    if (!this.house.visible) return;
    placeSunShadow(
      this.house,
      16.8,
      ground.heightAt(16.8, -19.2) + 0.028,
      -18.7,
      -0.16
    );
  }
  stats() {
    return {
      player: this.player.visible,
      npc: this.npc.visible,
      house: this.house.visible,
      updates: { ...this.updateTracker.stats },
      method: "flat projected transparent meshes along sun direction"
    };
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/WorldModeManager.js
var WorldModeManager = class {
  constructor({
    state,
    ground,
    mover,
    eretzCollision,
    mainGroup,
    lava,
    mainObjects = [],
    footOffset = 0
  } = {}) {
    this.state = state;
    this.ground = ground;
    this.mover = mover;
    this.eretzCollision = eretzCollision;
    this.mainGroup = mainGroup;
    this.lava = lava;
    this.mainObjects = mainObjects;
    this.footOffset = footOffset;
    this.mode = "eretz";
    this.mainHeightAt = null;
  }
  /** Remembers the Eretz terrain-height function used after lava restoration. */
  rememberMainHeight(heightAt2) {
    if (typeof heightAt2 !== "function") {
      throw new TypeError("Eretz height function must be callable.");
    }
    this.mainHeightAt = heightAt2;
    return this;
  }
  /** Conceals Eretz and activates the isolated lava collision world. */
  enterLava() {
    if (this.mode === "lava") {
      return false;
    }
    this.mode = "lava";
    this.setMainVisibility(false);
    this.ground.terrainHeightAt = (x, z) => this.lava.heightAt(x, z);
    this.ground.octree = this.lava.octree;
    this.lava.enter(
      this.state,
      this.ground,
      this.mover,
      this.footOffset
    );
    return true;
  }
  /** Restores Eretz scenery, terrain sampling, and the active collision facade. */
  returnEretz() {
    if (this.mode !== "lava") {
      return false;
    }
    if (typeof this.mainHeightAt !== "function") {
      throw new Error("Eretz height function was not remembered before restoration.");
    }
    this.mode = "eretz";
    this.setMainVisibility(true);
    this.ground.terrainHeightAt = this.mainHeightAt;
    this.ground.octree = this.eretzCollision;
    this.lava.leave(
      this.state,
      this.ground,
      this.mover,
      this.eretzCollision,
      this.footOffset
    );
    return true;
  }
  /** Returns compact deterministic world-mode evidence. */
  stats() {
    return Object.freeze({
      mode: this.mode,
      mainVisible: this.mainGroup.visible,
      lavaVisible: this.lava.group.visible,
      eretzCollisionRestored: this.ground.octree === this.eretzCollision
    });
  }
  setMainVisibility(visible) {
    this.mainGroup.visible = visible;
    for (const object of this.mainObjects) {
      object.visible = visible;
    }
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/visibility/HouseBounds.js
function pointInsideHouse(house2, point3, margin = 0.45) {
  if (!house2 || !point3) {
    return false;
  }
  const local = worldPointToHouse(house2, point3.x, point3.z);
  const insideFloorPlan = Math.abs(local.x) <= house2.width / 2 + margin && Math.abs(local.z) <= house2.depth / 2 + margin;
  const y = Number(point3.renderY ?? point3.y ?? house2.floorY);
  const minimumY = house2.floorY - 1;
  const maximumY = house2.floorY + house2.wallHeight + 2;
  return insideFloorPlan && y >= minimumY && y <= maximumY;
}
function worldPointToHouse(house2, x, z) {
  const dx = Number(x) - house2.x;
  const dz = Number(z) - house2.z;
  const cosine = Math.cos(house2.yaw || 0);
  const sine = Math.sin(house2.yaw || 0);
  return {
    x: dx * cosine + dz * sine,
    z: -dx * sine + dz * cosine
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/visibility/HouseInteriorActivity.js
function setHouseInteriorObjectActive(object, active) {
  const next = Boolean(active);
  object.visible = next;
  object.userData ||= {};
  object.userData.AwtsmoosInteriorRuntime = {
    active: next,
    animationHz: next ? 30 : 0,
    audioActive: next,
    lightActive: next,
    suspended: !next
  };
  for (const handle of runtimeHandles(object)) {
    applyRuntimeHandle(handle, next);
  }
}
function houseInteriorObjectActive(object) {
  return object?.userData?.AwtsmoosInteriorRuntime?.active !== false;
}
function runtimeHandles(object) {
  const data = object?.userData || {};
  return [
    data.interiorRuntimeHandle,
    data.animationHandle,
    data.audioHandle,
    data.lightHandle,
    data.particleHandle
  ].filter(Boolean);
}
function applyRuntimeHandle(handle, active) {
  if (typeof handle.setActive === "function") {
    handle.setActive(active);
    return;
  }
  if (active && typeof handle.resume === "function") {
    handle.resume();
    return;
  }
  if (!active && typeof handle.pause === "function") {
    handle.pause();
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/visibility/HouseVisibilityIndex.js
function createHouseVisibilityIndex(root) {
  const objectsByHouse = /* @__PURE__ */ new Map();
  walkHierarchy(root, (object) => {
    const metadata = houseVisibilityMetadata(object);
    if (!metadata || metadata.domain !== "interior") return;
    if (!objectsByHouse.has(metadata.houseId)) {
      objectsByHouse.set(metadata.houseId, []);
    }
    objectsByHouse.get(metadata.houseId).push(object);
  });
  return new HouseVisibilityIndex(objectsByHouse);
}
var HouseVisibilityIndex = class {
  constructor(objectsByHouse = /* @__PURE__ */ new Map()) {
    this.objectsByHouse = objectsByHouse;
    this.visibleByHouse = /* @__PURE__ */ new Map();
  }
  setVisible(houseId, visible) {
    const next = Boolean(visible);
    if (this.visibleByHouse.get(houseId) === next) return false;
    for (const object of this.objectsByHouse.get(houseId) || []) {
      setHouseInteriorObjectActive(object, next);
    }
    this.visibleByHouse.set(houseId, next);
    return true;
  }
  meshes(houseId) {
    return [...this.objectsByHouse.get(houseId) || []];
  }
  stats() {
    const objects = [...this.objectsByHouse.values()].flat();
    const activeObjects = objects.filter(houseInteriorObjectActive).length;
    return {
      activeObjects,
      hiddenMeshes: objects.length - activeObjects,
      houses: this.objectsByHouse.size,
      suspendedObjects: objects.length - activeObjects,
      totalMeshes: objects.length,
      visibleMeshes: activeObjects
    };
  }
};
function walkHierarchy(object, visitor) {
  if (!object) return;
  visitor(object);
  for (const child of object.children || []) {
    walkHierarchy(child, visitor);
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/visibility/HouseVisibilitySystem.js
var HouseVisibilitySystem = class {
  constructor({ root, houses = [], doors = [] } = {}) {
    this.houses = [...houses];
    this.doors = [...doors];
    this.index = createHouseVisibilityIndex(root);
    this.states = /* @__PURE__ */ new Map();
    this.updateCount = 0;
  }
  /** Updates only houses whose inside-or-door state actually changed. */
  update(playerState) {
    let changed = 0;
    for (const house2 of this.houses) {
      const inside = pointInsideHouse(house2, playerState);
      const doorActive = frontDoorActive(this.doors, house2.id);
      const visible = inside || doorActive;
      if (this.index.setVisible(house2.id, visible)) {
        changed += 1;
      }
      this.states.set(house2.id, { inside, doorActive, visible });
    }
    this.updateCount += 1;
    return changed;
  }
  /** Returns detached evidence suitable for diagnostics and browser tests. */
  stats() {
    const visibleHouses = [...this.states.values()].filter((state) => state.visible).length;
    return {
      ...this.index.stats(),
      visibleHouses,
      hiddenHouses: this.houses.length - visibleHouses,
      updates: this.updateCount,
      states: Object.fromEntries(this.states)
    };
  }
};
function createHouseVisibilitySystem(options, playerState) {
  const system = new HouseVisibilitySystem(options);
  system.update(playerState);
  return system;
}
function frontDoorActive(doors, houseId) {
  const entryDoor = doors.find((door) => doorHouseId(door) === houseId && door?.def?.id === `${houseId}-front-door`);
  return entryDoor ? entryDoor.state !== "closed" : false;
}
function doorHouseId(door) {
  return door?.def?.frame?.houseId || door?.def?.userData?.AwtsmoosDoorFrame?.houseId || null;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/collision/CapsuleTriangle.js
function capsuleTriangleContact(capsule, tri) {
  const center = scale(add(capsule.start, capsule.end), 0.5);
  const facingNormal = dot(sub(center, tri.a), tri.normal) < 0 ? negate(tri.normal) : tri.normal;
  const planeHit = planeContact(capsule, tri, facingNormal);
  let best = planeHit;
  for (const [a, b] of [[tri.a, tri.b], [tri.b, tri.c], [tri.c, tri.a]]) best = deeper(best, edgeContact(capsule, tri, a, b, facingNormal));
  return best;
}
function planeContact(capsule, tri, normal) {
  const d1 = dot(sub(capsule.start, tri.a), normal);
  const d2 = dot(sub(capsule.end, tri.a), normal);
  const nearest = Math.abs(d1) < Math.abs(d2) ? capsule.start : capsule.end;
  const dist = Math.abs(Math.abs(d1) < Math.abs(d2) ? d1 : d2);
  if (dist >= capsule.radius) return null;
  const projected = projectToPlane(nearest, { ...tri, normal });
  if (!triangleContainsPoint(projected, tri)) return null;
  return { normal, depth: capsule.radius - dist + 2e-3, kind: tri.kind, point: projected };
}
function edgeContact(capsule, tri, a, b, fallbackNormal) {
  const [p1, p2] = closestPointsSegmentSegment(capsule.start, capsule.end, a, b);
  const delta = sub(p1, p2), dist = length(delta);
  if (dist >= capsule.radius) return null;
  const normal = dist > 1e-5 ? normalize(delta) : fallbackNormal;
  return { normal, depth: capsule.radius - dist + 2e-3, kind: tri.kind, point: p2 };
}
function deeper(a, b) {
  if (!b) return a;
  if (!a || b.depth > a.depth) return b;
  return a;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/collision/CapsuleCollisionQuery.js
function capsuleFor(position, radius, height, footOffset) {
  const base = position.y - footOffset;
  return {
    radius,
    start: { x: position.x, y: base + 0.25, z: position.z },
    end: { x: position.x, y: base + height, z: position.z }
  };
}
function deepestContact({ octree, capsule, radius, options, accept }) {
  let best = null;
  for (const triangle2 of candidates(octree, capsule, radius, options)) {
    const hit = capsuleTriangleContact(capsule, triangle2);
    if (!hit || !accept(triangle2, hit)) continue;
    if (!best || hit.depth > best.depth) best = hit;
  }
  return best;
}
function candidates(octree, capsule, radius, options) {
  const bounds = capsuleBounds(capsule, radius);
  const dynamic = (options.dynamicColliders || []).filter((triangle2) => triangle2.aabb?.intersects?.(bounds));
  return [...octree.query(bounds), ...dynamic];
}
function capsuleBounds(capsule, radius) {
  const margin = radius + 0.04;
  return new Aabb(
    {
      x: capsule.start.x - margin,
      y: Math.min(capsule.start.y, capsule.end.y) - margin,
      z: capsule.start.z - margin
    },
    {
      x: capsule.start.x + margin,
      y: Math.max(capsule.start.y, capsule.end.y) + margin,
      z: capsule.start.z + margin
    }
  );
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/collision/AwtsmoosCollisionMover.js
var AwtsmoosCollisionMover = class {
  constructor({ octree, radius = 0.38, height = 1.72, footOffset = 0 }) {
    Object.assign(this, { octree, radius, height, footOffset });
    this.lastCeiling = null;
    this.resetContacts();
  }
  move(position, delta, options = {}) {
    const count = Math.max(1, Math.ceil(Math.hypot(delta.x, delta.z) / 0.055));
    this.resetContacts();
    for (let index = 0; index < count; index += 1) {
      position.x += delta.x / count;
      position.z += delta.z / count;
      this.solve(position, options);
    }
    return {
      contacts: this.lastContacts.length,
      normals: this.lastNormals,
      steppedFaces: this.lastStepFaces
    };
  }
  solve(position, options) {
    for (let pass = 0; pass < 7; pass += 1) {
      const hit = this.deepestWall(this.capsule(position), options);
      if (!hit) return;
      position.x += hit.normal.x * hit.depth;
      position.z += hit.normal.z * hit.depth;
      this.remember(hit);
    }
  }
  resolveCeiling(position, options = {}) {
    let pushed = 0;
    this.lastCeiling = null;
    for (let pass = 0; pass < 4; pass += 1) {
      const hit = this.deepestCeiling(this.capsule(position), options);
      if (!hit) break;
      position.y += Math.min(-2e-3, hit.normal.y * hit.depth);
      pushed += hit.depth;
      this.lastCeiling = hit;
    }
    return {
      hit: !!this.lastCeiling,
      kind: this.lastCeiling?.kind || null,
      depth: pushed
    };
  }
  ceilingHit(position, options = {}) {
    return this.deepestCeiling(this.capsule(position), options);
  }
  deepestWall(capsule, options) {
    return deepestContact({
      octree: this.octree,
      capsule,
      radius: this.radius,
      options,
      accept: (triangle2, hit) => this.isBlockingWall(triangle2, hit, capsule, options)
    });
  }
  deepestCeiling(capsule, options) {
    return deepestContact({
      octree: this.octree,
      capsule,
      radius: this.radius,
      options,
      accept: (triangle2, hit) => this.isBlockingCeiling(triangle2, hit, capsule)
    });
  }
  isBlockingCeiling(triangle2, hit, capsule) {
    if (!triangle2.solid || triangle2.floor || triangle2.normal.y > -0.18) return false;
    if (triangle2.aabb.max.y < capsule.end.y - 0.46) return false;
    hit.normal = triangle2.normal;
    return true;
  }
  isBlockingWall(triangle2, hit, capsule, options) {
    const maxSlope = options.maxSlopeNormal ?? 0.72;
    if (!triangle2.solid) return false;
    if (triangle2.floor && triangle2.normal.y >= maxSlope) return false;
    if (triangle2.floor && options.blockSteepFloors === false) return false;
    if (Math.abs(hit.normal.y) > 0.76) return false;
    const floorY = options.floorY ?? capsule.start.y - 0.25;
    const stepTop = floorY + (options.maxStepHeight ?? 0);
    if (!triangle2.floor && options.grounded && triangle2.aabb.max.y <= stepTop + 0.045) {
      this.lastStepFaces.push(triangle2.kind);
      return false;
    }
    return true;
  }
  resetContacts() {
    this.lastContacts = [];
    this.lastNormals = [];
    this.lastStepFaces = [];
  }
  remember(hit) {
    this.lastContacts.push(hit.kind);
    this.lastNormals.push({
      x: hit.normal.x,
      y: hit.normal.y,
      z: hit.normal.z,
      depth: hit.depth
    });
  }
  capsule(position) {
    return capsuleFor(position, this.radius, this.height, this.footOffset);
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/motion/JumpPhysics.js
var JumpPhysics = class {
  constructor({ ground, footOffset, impulse = 7.35, gravity = 13.25, maxSlopeNormal = 0.72 }) {
    Object.assign(this, { ground, footOffset, impulse, gravity, maxSlopeNormal });
  }
  update(state, dt, jumpQueued) {
    const feetY = state.y - this.footOffset;
    const sample2 = this.ground.sample(state.x, state.z, { maxY: feetY + 0.12 });
    const floorY = sample2.height + this.footOffset;
    state.groundKind = sample2.kind;
    state.groundNormal = sample2.normal;
    state.grounded = state.y <= floorY + 0.06 && state.velY <= 0.03;
    if (state.grounded) {
      state.y = floorY;
      state.velY = 0;
      state.airPhase = "ground";
    }
    if (jumpQueued && state.grounded) {
      state.velY = this.impulse;
      state.grounded = false;
      state.airPhase = "jump";
      state.jumpClock = 0;
      state.slopeState = "jump";
    }
    if (!state.grounded) return this.air(state, dt);
    return this.slide(state, sample2, dt);
  }
  air(state, dt) {
    state.jumpClock += dt;
    state.velY -= this.gravity * dt;
    state.y += state.velY * dt;
    const feetY = state.y - this.footOffset;
    const floorY = this.ground.heightAt(state.x, state.z, { maxY: feetY + 0.18 }) + this.footOffset;
    state.airPhase = state.velY >= -0.25 && state.jumpClock < 0.46 ? "jump" : "fall";
    if (state.velY <= 0 && state.y <= floorY) {
      state.y = floorY;
      state.velY = 0;
      state.grounded = true;
      state.airPhase = "ground";
    }
    return { slide: null };
  }
  slide(state, sample2, dt) {
    const n = sample2.normal || { x: 0, y: 1, z: 0 }, steep = n.y < this.maxSlopeNormal && n.y > 0.18, mag = Math.hypot(n.x, n.z);
    state.slopeState = steep ? "slide" : "walk";
    if (!steep || mag < 1e-3) return { slide: null };
    const speed = (this.maxSlopeNormal - n.y) * 10 + 1.1;
    return { slide: { x: n.x / mag * speed * dt, z: n.z / mag * speed * dt } };
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/DoorCollisionGeometry.js
function rayObb(ray, box4) {
  const direction = normalize(ray.dir);
  let minimum = 0.05;
  let maximum = 80;
  for (const [axis, half] of axes(box4)) {
    const offset = dot(axis, sub(box4.center, ray.origin));
    const projected = dot(direction, axis);
    if (Math.abs(projected) < 1e-5) {
      if (-offset - half > 0 || -offset + half < 0) {
        return null;
      }
      continue;
    }
    let near = (offset - half) / projected;
    let far = (offset + half) / projected;
    if (near > far) {
      [near, far] = [far, near];
    }
    minimum = Math.max(minimum, near);
    maximum = Math.min(maximum, far);
    if (minimum > maximum) {
      return null;
    }
  }
  return { t: minimum };
}
function colorArray(hex = "#6b3d1e") {
  const value3 = parseInt(String(hex).replace("#", ""), 16);
  return [
    (value3 >> 16 & 255) / 255,
    (value3 >> 8 & 255) / 255,
    (value3 & 255) / 255,
    1
  ];
}
function axes(box4) {
  return [
    [box4.right, box4.half.x],
    [box4.up, box4.half.y],
    [box4.forward, box4.half.z]
  ];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/DoorDebugEvidence.js
function createDoorDebugEvidence(door) {
  const actualMatrix = Array.from(door.refreshWorldMatrix());
  const expectedMatrix = door.pose.matrix;
  const actualBasis = matrixBasis(actualMatrix);
  const wall = door.def.frame.basis;
  return {
    id: door.def.id,
    state: door.state,
    progress: door.t,
    currentAngle: door.pose.angle,
    worldMatrix: actualMatrix,
    colliderWorldMatrix: expectedMatrix,
    matrixDelta: matrixMaximumDelta(actualMatrix, expectedMatrix),
    panelTangentAngleToWall: vectorAngle(actualBasis.tangent, wall.right),
    panelNormalAngleToWall: vectorAngle(actualBasis.normal, wall.outward),
    frame: door.def.frame,
    obb: door.obb(),
    interaction: door.interaction.debug()
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/DoorProjectionGeometry.js
function pointerRay(event, camera, canvas, targetHint) {
  const rectangle = canvas.getBoundingClientRect();
  const x = (event.clientX - rectangle.left) / rectangle.width * 2 - 1;
  const y = 1 - (event.clientY - rectangle.top) / rectangle.height * 2;
  const basis = cameraBasis(camera, targetHint);
  const tangent = Math.tan((camera.fov || 45) * Math.PI / 360);
  const direction = add(
    add(basis.forward, scale(basis.right, x * tangent * (camera.aspect || 1))),
    scale(basis.up, y * tangent)
  );
  return { origin: basis.origin, dir: normalize(direction) };
}
function screenBox(box4, camera, canvas, targetHint, padding) {
  const points = boxCorners(box4).map((point3) => project(point3, camera, canvas, targetHint)).filter(Boolean);
  if (points.length < 2) {
    return null;
  }
  return {
    x0: Math.min(...points.map((point3) => point3.x)) - padding,
    x1: Math.max(...points.map((point3) => point3.x)) + padding,
    y0: Math.min(...points.map((point3) => point3.y)) - padding,
    y1: Math.max(...points.map((point3) => point3.y)) + padding
  };
}
function boxCorners(box4) {
  const points = [];
  for (const sideX of [-1, 1]) {
    for (const sideY of [-1, 1]) {
      for (const sideZ of [-1, 1]) {
        const horizontal = add(box4.center, scale(box4.right, sideX * box4.half.x));
        const vertical = add(horizontal, scale(box4.up, sideY * box4.half.y));
        points.push(add(vertical, scale(box4.forward, sideZ * box4.half.z)));
      }
    }
  }
  return points;
}
function project(point3, camera, canvas, targetHint) {
  const basis = cameraBasis(camera, targetHint);
  const delta = sub(point3, basis.origin);
  const depth = dot(delta, basis.forward);
  if (depth <= 0.05) {
    return null;
  }
  const tangent = Math.tan((camera.fov || 45) * Math.PI / 360);
  const x = dot(delta, basis.right) / (depth * tangent * (camera.aspect || 1));
  const y = dot(delta, basis.up) / (depth * tangent);
  return {
    x: (x + 1) * 0.5 * canvas.clientWidth,
    y: (1 - y) * 0.5 * canvas.clientHeight
  };
}
function cameraBasis(camera, targetHint) {
  const origin = v(camera.position.x, camera.position.y, camera.position.z);
  const forward = normalize(sub(targetOf(targetHint || camera.target), origin));
  const right = normalize(cross(forward, v(0, 1, 0)));
  return { origin, forward, right, up: normalize(cross(right, forward)) };
}
function targetOf(target) {
  if (Array.isArray(target)) {
    return v(target[0] || 0, target[1] || 0, target[2] || 0);
  }
  return v(target?.x || 0, target?.y || 0, target?.z || 0);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/DoorInteractionController.js
var DEFAULT_INTERACTION_DISTANCE = 4.5;
var DoorInteractionController = class {
  constructor(door) {
    this.door = door;
    this.context = {};
    this.canvas = null;
    this.camera = null;
    this.hoverFrame = null;
    this.pendingPointerEvent = null;
    this.lastHitMode = "none";
    this.lastScreenBox = null;
    this.lastHit = null;
    this.onPointerMove = (event) => this.queueHover(event);
    this.onPointerDown = (event) => this.handle(event, true);
  }
  setContext(context = {}) {
    this.context = context;
    return this;
  }
  install(canvas, camera) {
    this.uninstall();
    this.canvas = canvas;
    this.camera = camera;
    canvas.addEventListener("pointermove", this.onPointerMove, { passive: true });
    canvas.addEventListener("pointerdown", this.onPointerDown);
    return this;
  }
  uninstall() {
    if (this.canvas) {
      this.canvas.removeEventListener("pointermove", this.onPointerMove);
      this.canvas.removeEventListener("pointerdown", this.onPointerDown);
      this.restoreCursor();
    }
    if (this.hoverFrame != null) {
      cancelAnimationFrame(this.hoverFrame);
    }
    this.hoverFrame = null;
    this.pendingPointerEvent = null;
    this.canvas = null;
    this.camera = null;
  }
  queueHover(event) {
    if (event.pointerType !== "mouse") {
      return;
    }
    this.pendingPointerEvent = event;
    if (this.hoverFrame != null) {
      return;
    }
    this.hoverFrame = requestAnimationFrame(() => {
      this.hoverFrame = null;
      const pointerEvent = this.pendingPointerEvent;
      this.pendingPointerEvent = null;
      if (pointerEvent) {
        this.handle(pointerEvent, false);
      }
    });
  }
  handle(event, click) {
    const found = this.hit(event, this.camera);
    this.door.setHover(found && event.pointerType === "mouse");
    this.updateCursor(found);
    this.publishPrompt(found);
    if (!click || !found) {
      return false;
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    this.door.toggle("pointer");
    return true;
  }
  hit(event, camera) {
    this.resetEvidence();
    if (!this.door.clickable() || !this.withinInteractionDistance()) {
      return false;
    }
    const canvas = event.currentTarget || this.canvas || this.context.canvas;
    if (!canvas || !camera) {
      return false;
    }
    const ray = pointerRay(event, camera, canvas, this.context.getCameraTarget?.());
    const rayHit = rayObb(ray, this.door.obb());
    if (rayHit) {
      this.lastHitMode = "ray-current-pose";
      this.lastHit = {
        distance: rayHit.t,
        state: this.door.state
      };
      return true;
    }
    const padding = this.door.state === "open" ? 20 : 8;
    const box4 = screenBox(
      this.door.obb(),
      camera,
      canvas,
      this.context.getCameraTarget?.(),
      padding
    );
    this.lastScreenBox = box4;
    const inside = Boolean(box4) && event.clientX >= box4.x0 && event.clientX <= box4.x1 && event.clientY >= box4.y0 && event.clientY <= box4.y1;
    if (inside) {
      this.lastHitMode = "screen-current-pose";
    }
    return inside;
  }
  withinInteractionDistance() {
    const player = this.context.getPlayerPosition?.();
    if (!player) {
      return true;
    }
    const center = this.door.obb().center;
    const maximum = Number(
      this.context.maxInteractionDistance || DEFAULT_INTERACTION_DISTANCE
    );
    return Math.hypot(center.x - player.x, center.y - player.y, center.z - player.z) <= maximum;
  }
  updateCursor(found) {
    if (!this.canvas) {
      return;
    }
    this.canvas.style.cursor = found ? "pointer" : "";
  }
  restoreCursor() {
    if (this.canvas) {
      this.canvas.style.cursor = "";
    }
  }
  publishPrompt(found) {
    this.context.bus?.emit?.("door:prompt", {
      doorId: this.door.def.id,
      state: this.door.state,
      visible: Boolean(found)
    });
  }
  resetEvidence() {
    this.lastHitMode = "none";
    this.lastHit = null;
    this.lastScreenBox = null;
  }
  debug() {
    return {
      hitMode: this.lastHitMode,
      lastHit: this.lastHit,
      screenBox: this.lastScreenBox
    };
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/DoorRuntimePose.js
function closedYaw(definition) {
  return definition.frame?.yaw ?? definition.closedYaw ?? definition.wallYaw ?? definition.yaw ?? 0;
}
function hingeWorld(definition) {
  return definition.hinge?.worldPosition || doorHingeWorld(definition.frame || definition);
}
function currentAngle(definition, progress) {
  if (progress <= 0) {
    return 0;
  }
  const openAngle = definition.frame?.swing?.openAngle ?? definition.openAngle ?? -Math.PI * 0.58;
  if (progress >= 1) {
    return openAngle;
  }
  const eased = progress * progress * (3 - 2 * progress);
  return openAngle * eased;
}
function doorPose(definition, progress = 0) {
  const clamped = Math.max(0, Math.min(1, progress));
  const angle = currentAngle(definition, clamped);
  const yaw = closedYaw(definition) + angle;
  if (clamped === 0 && definition.frame?.closedWorldMatrix) {
    return {
      progress: 0,
      angle: 0,
      yaw: closedYaw(definition),
      center: { ...definition.frame.panel.closedCenter },
      matrix: [...definition.frame.closedWorldMatrix]
    };
  }
  const hinge = hingeWorld(definition);
  const hingeSign = Math.sign(definition.frame?.hinge?.localX || -1);
  const centerOffset = -hingeSign * definition.width / 2;
  const center = {
    x: hinge.x + Math.cos(yaw) * centerOffset,
    y: definition.centerY,
    z: hinge.z + Math.sin(yaw) * centerOffset
  };
  return {
    progress: clamped,
    angle,
    yaw,
    center,
    matrix: worldMatrixFromYaw(center, yaw)
  };
}
function orientedBox(definition, progress) {
  const pose = doorPose(definition, progress);
  return {
    center: pose.center,
    right: v(Math.cos(pose.yaw), 0, Math.sin(pose.yaw)),
    up: v(0, 1, 0),
    forward: v(-Math.sin(pose.yaw), 0, Math.cos(pose.yaw)),
    half: {
      x: definition.width / 2,
      y: definition.height / 2,
      z: Math.max(definition.thickness / 2, 0.12)
    }
  };
}
function colliderDefinition(definition, progress = 0) {
  const pose = doorPose(definition, progress);
  return {
    id: `${definition.id}-door`,
    shape: "box",
    solid: true,
    walkable: false,
    position: pose.center,
    size: {
      x: definition.width,
      y: definition.height,
      z: definition.thickness
    },
    rotation: { y: pose.yaw },
    userData: {
      AwtsmoosDoorPose: {
        progress: pose.progress,
        angle: pose.angle,
        worldMatrix: pose.matrix
      }
    }
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/DoorwaySpecs.js
var TALL_DOORWAY_SPEC = Object.freeze({
  id: "tall-doorway",
  wallId: "tall-dynamic-doorway-wall",
  doorId: "tall-hinged-door",
  x: -5.5,
  z: -20.6,
  floorY: 0,
  yaw: 0.04,
  wallW: 8.7,
  wallH: 4.2,
  wallT: 0.72,
  doorW: 2.75,
  doorH: 3.08,
  doorThickness: 0.24,
  panelGap: 0.08,
  openAngle: -Math.PI * 0.56
});
function tallDoorDef() {
  return doorwaySet().door;
}
function doorwaySet() {
  return createDoorWallSet(TALL_DOORWAY_SPEC, {
    color: "#654538",
    doorMaterial: { color: "#7d4827" }
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/DynamicDoor3D.js
var DEFAULT_SPEED = 2.15;
var DynamicDoor3D = class {
  constructor(definition = tallDoorDef()) {
    this.def = definition;
    this.t = 0;
    this.state = "closed";
    this.hovered = false;
    this.autoCloseRemaining = 0;
    this.mesh = new Group();
    this.mesh.name = `${definition.id}-panel-frame`;
    this.panel = createPrimitiveMesh(panelDefinition(definition));
    this.panel.name = `${definition.id}-dynamic-door`;
    this.mesh.add(this.panel);
    this.interaction = new DoorInteractionController(this);
    this.setPose();
    this.closedColliders = [...this.currentColliders];
  }
  setInteractionContext(context = {}) {
    this.interaction.setContext(context);
    return this;
  }
  install(canvas, camera) {
    this.interaction.install(canvas, camera);
    return this;
  }
  clickable() {
    return this.state === "closed" || this.state === "open";
  }
  toggle(source = "unknown") {
    if (this.state === "closed") {
      return this.open(source);
    }
    if (this.state === "open") {
      return this.close(source);
    }
    return false;
  }
  open(source = "unknown") {
    if (this.state === "open" || this.state === "opening") {
      return false;
    }
    this.setState("opening", source);
    return true;
  }
  close(source = "unknown") {
    if (this.state === "closed" || this.state === "closing") {
      return false;
    }
    this.setState("closing", source);
    return true;
  }
  update(deltaTime) {
    if (this.state === "open" && this.autoCloseRemaining > 0) {
      this.autoCloseRemaining = Math.max(0, this.autoCloseRemaining - deltaTime);
      if (this.autoCloseRemaining === 0) {
        this.close("auto-close");
      }
    }
    const direction = motionDirection(this.state);
    if (direction === 0) {
      return;
    }
    const previousProgress = this.t;
    const speed = finitePositive(this.def.openSpeed, DEFAULT_SPEED);
    this.t = clamp01(previousProgress + direction * deltaTime * speed);
    if (this.t >= 1) {
      this.t = 1;
      this.setState("open", "motion-complete");
      this.autoCloseRemaining = finitePositive(this.def.autoCloseSeconds, 0);
    } else if (this.t <= 0) {
      this.t = 0;
      this.setState("closed", "motion-complete");
    }
    if (this.t !== previousProgress) {
      this.setPose();
    }
  }
  activeColliders() {
    return this.currentColliders;
  }
  setHover(enabled) {
    const next = Boolean(enabled);
    if (next === this.hovered) {
      return;
    }
    this.hovered = next;
    this.panel.material.color = next ? [1, 0.78, 0.26, 1] : colorArray(this.def.color);
  }
  setState(nextState, source) {
    if (nextState === this.state) {
      return;
    }
    const previousState = this.state;
    this.state = nextState;
    this.interaction.context.bus?.emit?.("door:state", {
      doorId: this.def.id,
      previousState,
      source,
      state: nextState
    });
  }
  setPose() {
    this.pose = doorPose(this.def, easedProgress(this.t));
    this.mesh.matrix = new Float32Array(this.pose.matrix);
    this.mesh.position.set(0, 0, 0);
    this.mesh.quaternion.set(0, 0, 0, 1);
    this.currentColliders = primitiveColliders(
      colliderDefinition(this.def, easedProgress(this.t))
    );
    this.refreshWorldMatrix();
  }
  refreshWorldMatrix() {
    const parentMatrix = this.mesh.parent?.matrixWorld;
    this.mesh.updateWorldMatrix(parentMatrix);
    return this.mesh.matrixWorld;
  }
  obb() {
    return orientedBox(this.def, easedProgress(this.t));
  }
  debug() {
    return {
      ...createDoorDebugEvidence(this),
      autoCloseRemaining: this.autoCloseRemaining,
      hovered: this.hovered
    };
  }
  destroy() {
    this.interaction.uninstall();
    this.mesh.parent?.remove(this.mesh);
  }
};
function motionDirection(state) {
  if (state === "opening") {
    return 1;
  }
  if (state === "closing") {
    return -1;
  }
  return 0;
}
function easedProgress(value3) {
  const progress = clamp01(value3);
  return progress * progress * (3 - 2 * progress);
}
function clamp01(value3) {
  return Math.max(0, Math.min(1, Number(value3) || 0));
}
function finitePositive(value3, fallback) {
  const number = Number(value3);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}
function panelDefinition(definition) {
  return {
    color: definition.color || "#6b3d1e",
    id: `${definition.id}-panel`,
    mapImage: definition.mapImage || null,
    mapRepeat: definition.mapRepeat || [1, 1],
    position: { x: 0, y: 0, z: 0 },
    rotation: { y: 0 },
    shape: "box",
    size: {
      x: definition.width,
      y: definition.height,
      z: definition.thickness
    },
    textureUrl: definition.textureUrl || null
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/EnemyAdventureEvent.js
function enemyDefeatAdventureEvent(payload) {
  if (!payload?.creatureType) return null;
  return {
    count: 1,
    instanceId: payload.id,
    target: payload.creatureType,
    type: "defeat"
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/EnemyStates.js
var ENEMY_STATE = Object.freeze({
  ALERT: "Alert",
  APPROACH: "Approach",
  ATTACK_ACTIVE: "AttackActive",
  ATTACK_ANTICIPATION: "AttackAnticipation",
  ATTACK_RECOVERY: "AttackRecovery",
  CHASE: "Chase",
  CIRCLE: "Circle",
  DEFEATED: "Defeated",
  DESPAWN: "Despawn",
  DORMANT: "Dormant",
  HIT_REACTION: "HitReaction",
  IDLE: "Idle",
  INVESTIGATE: "Investigate",
  PATROL: "Patrol",
  RESPAWN_COOLDOWN: "RespawnCooldown",
  RETREAT: "Retreat",
  RETURN_HOME: "ReturnHome",
  SPAWN: "Spawn",
  STAGGER: "Stagger",
  WANDER: "Wander"
});
var URGENT_STATES = /* @__PURE__ */ new Set([
  ENEMY_STATE.ALERT,
  ENEMY_STATE.APPROACH,
  ENEMY_STATE.ATTACK_ACTIVE,
  ENEMY_STATE.ATTACK_ANTICIPATION,
  ENEMY_STATE.ATTACK_RECOVERY,
  ENEMY_STATE.CHASE,
  ENEMY_STATE.CIRCLE,
  ENEMY_STATE.HIT_REACTION,
  ENEMY_STATE.RETREAT,
  ENEMY_STATE.RETURN_HOME,
  ENEMY_STATE.STAGGER
]);
function enemyStateIsUrgent(state) {
  return URGENT_STATES.has(state);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/CombatDamageEvent.js
function createCombatDamageEvent(options, timestamp = Date.now()) {
  return Object.freeze({
    abilityId: options.abilityId || null,
    amount: Math.max(0, Number(options.amount) || 0),
    blocked: Boolean(options.blocked),
    critical: Boolean(options.critical),
    damageType: options.damageType || "symbolic-light",
    hitDirection: vector(options.hitDirection),
    perfectWard: Boolean(options.perfectWard),
    sourceId: String(options.sourceId || "unknown-source"),
    staggerAmount: Math.max(0, Number(options.staggerAmount) || 0),
    statusEffects: Object.freeze([...options.statusEffects || []]),
    targetId: String(options.targetId || "unknown-target"),
    timestamp,
    worldPosition: vector(options.worldPosition)
  });
}
function vector(value3 = {}) {
  return Object.freeze({
    x: Number(value3.x) || 0,
    y: Number(value3.y) || 0,
    z: Number(value3.z) || 0
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/PlayerCombatDefense.js
var PlayerCombatDefense = class {
  constructor() {
    this.perfectWardUntil = 0;
    this.protectionUntil = 0;
    this.wardUntil = 0;
  }
  activateWard(nowSeconds, options = {}) {
    this.perfectWardUntil = nowSeconds + (options.perfectSeconds || 0.22);
    this.wardUntil = nowSeconds + (options.wardSeconds || 0.9);
  }
  activateProtection(nowSeconds, seconds = 5) {
    this.protectionUntil = Math.max(this.protectionUntil, nowSeconds + seconds);
  }
  resolveIncoming(event, nowSeconds) {
    const perfectWard = nowSeconds <= this.perfectWardUntil;
    const warded = nowSeconds <= this.wardUntil;
    const protectedValue = nowSeconds <= this.protectionUntil;
    const multiplier = perfectWard ? 0 : warded ? 0.3 : protectedValue ? 0.65 : 1;
    return createCombatDamageEvent({
      ...event,
      amount: event.amount * multiplier,
      blocked: multiplier < 1,
      perfectWard,
      staggerAmount: perfectWard ? 0 : event.staggerAmount
    }, event.timestamp);
  }
  snapshot(nowSeconds) {
    return {
      perfectWard: nowSeconds <= this.perfectWardUntil,
      protected: nowSeconds <= this.protectionUntil,
      warded: nowSeconds <= this.wardUntil
    };
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/TorahAbilityRules.js
var ABILITIES = Object.freeze({
  awareness: ability("Gemara Chain", "chain", 3, 14, 0, ["clarity"]),
  choice: ability("Tzedakah Burst", "single", 1, 12, 18, ["armor-open", "protection"]),
  courage: ability("Mishnah Pulse", "area", 8, 7, 24, ["push"]),
  gratitude: ability("Alef-Beis Spark", "single", 1, 12, 12, ["stagger-light"]),
  joy: ability("Mitzvah Radiance", "area", 8, 9, 30, ["radiance"]),
  light: ability("Mitzvah Radiance", "area", 8, 9, 30, ["radiance"]),
  peace: ability("Tehillim Ward", "ward", 0, 0, 0, ["ward"]),
  unity: ability("Gemara Chain", "chain", 3, 14, 8, ["unity-chain"]),
  water: ability("Niggun Resonance", "area", 6, 8, 14, ["slow"])
});
function torahAbilityFor(passage2) {
  const base = ABILITIES[passage2.aspect] || ABILITIES.gratitude;
  return Object.freeze({
    ...base,
    damage: passage2.damage,
    id: passage2.id,
    passageName: passage2.name
  });
}
function ability(name, targetMode, maximumTargets, range, stagger, statusEffects) {
  return Object.freeze({ maximumTargets, name, range, stagger, statusEffects, targetMode });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/TorahPassageCatalog.js
var TORAH_BOOKS = Object.freeze([
  book("siddur", "Siddur", "\u{1F4D6}", [
    passage("modeh-ani", "Grateful Awakening", "Gratitude awakens the soul.", 12, 8, 700, "gratitude"),
    passage("shema-unity", "Unity of the Shema", "Everything rests within one Source.", 18, 12, 900, "unity"),
    passage("peace-prayer", "Prayer for Peace", "Peace joins divided sparks.", 10, 16, 650, "peace")
  ]),
  book("chumash-light", "Chumash of Light", "\u{1F4DA}", [
    passage("creation-light", "Light of Creation", "Light is called into darkness.", 24, 9, 1100, "light"),
    passage("guardian-path", "The Guarded Path", "Courage walks beside responsibility.", 20, 14, 1e3, "courage"),
    passage("living-water", "Living Water", "Wisdom flows toward thirsty ground.", 16, 18, 900, "water")
  ]),
  book("tanya-pocket", "Pocket Tanya", "\u{1F4D5}", [
    passage("two-souls", "Two Souls", "Choice can redirect inner struggle.", 22, 15, 1050, "choice"),
    passage("small-city", "The Small City", "Awareness governs the inner city.", 19, 20, 950, "awareness"),
    passage("joy-breaks-barriers", "Joy Breaks Barriers", "Holy joy opens a blocked road.", 28, 10, 1250, "joy")
  ])
]);
function torahBook(bookId) {
  return TORAH_BOOKS.find((item2) => item2.id === bookId) || null;
}
function torahPassage(passageId) {
  for (const bookValue of TORAH_BOOKS) {
    const found = bookValue.passages.find((item2) => item2.id === passageId);
    if (found) return { ...found, bookId: bookValue.id, bookName: bookValue.name };
  }
  return null;
}
function book(id, name, icon, passages) {
  return Object.freeze({ icon, id, name, passages: Object.freeze(passages) });
}
function passage(id, name, text3, damage, focusCost, cooldownMs, aspect) {
  return Object.freeze({
    aspect,
    cooldownMs,
    damage,
    focusCost,
    id,
    name,
    text: text3
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/HostileActorSpatialIndex.js
var HostileActorSpatialIndex = class {
  constructor(cellSize = 12) {
    this.cellSize = Math.max(1, cellSize);
    this.actorsById = /* @__PURE__ */ new Map();
    this.cells = /* @__PURE__ */ new Map();
    this.memberships = /* @__PURE__ */ new Map();
    this.lookupCount = 0;
    this.queryCount = 0;
    this.lastQuery = emptyQuery();
  }
  replace(actors = []) {
    this.clear();
    for (const actor of actors) this.update(actor);
  }
  update(actor) {
    const id = actorId(actor);
    const position = actor?.group?.position;
    if (!id || !Number.isFinite(position?.x) || !Number.isFinite(position?.z)) return false;
    const cellX = Math.floor(position.x / this.cellSize);
    const cellZ = Math.floor(position.z / this.cellSize);
    const previous = this.memberships.get(id);
    this.actorsById.set(id, actor);
    if (previous?.cellX === cellX && previous?.cellZ === cellZ) return true;
    if (previous) this.removeFromCell(previous.cellX, previous.cellZ, id);
    this.cell(cellX, cellZ, true).set(id, actor);
    this.memberships.set(id, { cellX, cellZ });
    return true;
  }
  remove(actorOrId) {
    const id = actorId(actorOrId);
    const membership = this.memberships.get(id);
    if (!membership) return false;
    this.removeFromCell(membership.cellX, membership.cellZ, id);
    this.memberships.delete(id);
    this.actorsById.delete(id);
    return true;
  }
  resolve(actorOrId) {
    this.lookupCount += 1;
    return this.actorsById.get(actorId(actorOrId)) || null;
  }
  queryRadius(center, radius) {
    const safeRadius = Math.max(0, Number(radius) || 0);
    const minimumX = Math.floor((center.x - safeRadius) / this.cellSize);
    const maximumX = Math.floor((center.x + safeRadius) / this.cellSize);
    const minimumZ = Math.floor((center.z - safeRadius) / this.cellSize);
    const maximumZ = Math.floor((center.z + safeRadius) / this.cellSize);
    const actors = [];
    let visitedCells = 0;
    let candidateCount = 0;
    for (let cellX = minimumX; cellX <= maximumX; cellX += 1) {
      for (let cellZ = minimumZ; cellZ <= maximumZ; cellZ += 1) {
        visitedCells += 1;
        const bucket = this.cell(cellX, cellZ, false);
        if (!bucket) continue;
        candidateCount += bucket.size;
        for (const actor of bucket.values()) actors.push(actor);
      }
    }
    this.queryCount += 1;
    this.lastQuery = { candidateCount, radius: safeRadius, visitedCells };
    return actors;
  }
  diagnostics() {
    return {
      actorCount: this.actorsById.size,
      cellCount: countCells(this.cells),
      directLookups: this.lookupCount,
      lastQuery: { ...this.lastQuery },
      regionalQueries: this.queryCount
    };
  }
  clear() {
    this.actorsById.clear();
    this.cells.clear();
    this.memberships.clear();
  }
  cell(cellX, cellZ, create) {
    let column = this.cells.get(cellX);
    if (!column && create) this.cells.set(cellX, column = /* @__PURE__ */ new Map());
    let bucket = column?.get(cellZ);
    if (!bucket && create) column.set(cellZ, bucket = /* @__PURE__ */ new Map());
    return bucket || null;
  }
  removeFromCell(cellX, cellZ, id) {
    const column = this.cells.get(cellX);
    const bucket = column?.get(cellZ);
    bucket?.delete(id);
    if (bucket?.size === 0) column.delete(cellZ);
    if (column?.size === 0) this.cells.delete(cellX);
  }
};
function actorId(actorOrId) {
  return typeof actorOrId === "string" ? actorOrId : actorOrId?.profile?.id || "";
}
function countCells(columns) {
  let count = 0;
  for (const column of columns.values()) count += column.size;
  return count;
}
function emptyQuery() {
  return { candidateCount: 0, radius: 0, visitedCells: 0 };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/EnemyTerrainPolicy.js
var PROTECTED_ZONES = Object.freeze([
  zone("arrival", CANONICAL_VILLAGE_PLAN.landmarks.entrance, 12),
  zone("beis-chabad", CANONICAL_VILLAGE_PLAN.landmarks.beisChabad, 13),
  zone("plaza", CANONICAL_VILLAGE_PLAN.landmarks.plaza, 12),
  zone("shul", CANONICAL_VILLAGE_PLAN.landmarks.shul, 15)
]);
function enemyTerrainAllows(ground, x, z, profile3 = {}) {
  if (insideProtectedZone(x, z)) return false;
  if (insideLake(x, z) || insideRiver(x, z)) return false;
  const sample2 = ground.sample?.(x, z) || {
    height: ground.heightAt(x, z),
    kind: "terrain",
    normal: ground.terrainNormal?.(x, z)
  };
  const normalY = Number(sample2.normal?.y ?? 1);
  const minimumNormalY = Number(profile3.minimumGroundNormalY || 0.72);
  const kind = String(sample2.kind || "").toLowerCase();
  return normalY >= minimumNormalY && !/(water|river|lake|lava)/.test(kind);
}
function resolveEnemyGroundStep(ground, current, proposed, profile3) {
  for (const candidate of detourCandidates(current, proposed)) {
    if (!enemyTerrainAllows(ground, candidate.x, candidate.z, profile3)) continue;
    return { ...candidate, y: ground.heightAt(candidate.x, candidate.z) };
  }
  return { ...current, y: ground.heightAt(current.x, current.z) };
}
function insideProtectedZone(x, z) {
  return PROTECTED_ZONES.some((value3) => distance(x, z, value3.x, value3.z) < value3.radius);
}
function insideLake(x, z) {
  const lake = CANONICAL_VILLAGE_PLAN.landmarks.lake;
  return ((x - lake.x) / lake.radiusX) ** 2 + ((z - lake.z) / lake.radiusZ) ** 2 < 1.12;
}
function insideRiver(x, z) {
  const bridge = CANONICAL_VILLAGE_PLAN.landmarks.bridge;
  if (distance(x, z, bridge.x, bridge.z) < 5.5) return false;
  return CANONICAL_VILLAGE_PLAN.river.controlPoints.some(([riverX, riverZ]) => distance(x, z, riverX, riverZ) < 4.2);
}
function detourCandidates(current, proposed) {
  return [
    proposed,
    { x: proposed.x, z: current.z },
    { x: current.x, z: proposed.z }
  ];
}
function distance(x, z, otherX, otherZ) {
  return Math.hypot(x - otherX, z - otherZ);
}
function zone(id, point3, radius) {
  return Object.freeze({ id, radius, x: point3.x, z: point3.z });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/VillageSanctuaryPolicy.js
var EXCLUDED_DISTRICTS = /* @__PURE__ */ new Set(["waterfall-portal"]);
var DISTRICT_MARGIN = 4;
var SANCTUARIES = Object.freeze([
  ...CANONICAL_VILLAGE_PLAN.districts.filter((district) => !EXCLUDED_DISTRICTS.has(district.id)).map((district) => ellipse(
    district.id,
    district.center[0],
    district.center[1],
    district.radius[0] + DISTRICT_MARGIN,
    district.radius[1] + DISTRICT_MARGIN
  )),
  circle("bridge-crossing", CANONICAL_VILLAGE_PLAN.landmarks.bridge, 14),
  circle("central-plaza", CANONICAL_VILLAGE_PLAN.landmarks.plaza, 14),
  circle("village-well", CANONICAL_VILLAGE_PLAN.landmarks.well, 10)
]);
function villageSanctuaryAt(point3, padding = 0) {
  if (!finitePoint(point3)) return null;
  return SANCTUARIES.find((zone2) => insideEllipse(point3, zone2, padding)) || null;
}
function pointInsideVillageSanctuary(point3, padding = 0) {
  return Boolean(villageSanctuaryAt(point3, padding));
}
function segmentEntersVillageSanctuary(from, to, sampleCount = 12) {
  if (!finitePoint(from) || !finitePoint(to)) return true;
  const count = Math.max(2, Math.min(32, Math.floor(sampleCount)));
  for (let index = 1; index <= count; index += 1) {
    const ratio3 = index / count;
    const point3 = {
      x: from.x + (to.x - from.x) * ratio3,
      z: from.z + (to.z - from.z) * ratio3
    };
    if (pointInsideVillageSanctuary(point3)) return true;
  }
  return false;
}
function ellipse(id, x, z, radiusX, radiusZ) {
  return Object.freeze({ id, radiusX, radiusZ, x, z });
}
function circle(id, marker2, radius) {
  return ellipse(id, marker2.x, marker2.z, radius, radius);
}
function insideEllipse(point3, zone2, padding) {
  const radiusX = Math.max(1e-3, zone2.radiusX + padding);
  const radiusZ = Math.max(1e-3, zone2.radiusZ + padding);
  const dx = (point3.x - zone2.x) / radiusX;
  const dz = (point3.z - zone2.z) / radiusZ;
  return dx * dx + dz * dz <= 1;
}
function finitePoint(point3) {
  return Number.isFinite(point3?.x) && Number.isFinite(point3?.z);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/EnemyTerritoryPolicy.js
function evaluateEnemyMovement(options) {
  const { candidate, from, ground, profile: profile3, purpose = "wander" } = options;
  if (!finitePoint2(candidate) || !finitePoint2(from)) return denied("invalid-point");
  const currentHomeDistance = planarDistance(from, profile3);
  const candidateHomeDistance = planarDistance(candidate, profile3);
  const retreatProgress = purpose === "return" && candidateHomeDistance < currentHomeDistance;
  if (candidateHomeDistance > profile3.leashRange && !retreatProgress) {
    return denied("outside-leash");
  }
  const fromInside = pointInsideVillageSanctuary(from);
  const candidateInside = pointInsideVillageSanctuary(candidate);
  if (fromInside && purpose === "return") {
    if (!retreatProgress) return denied("sanctuary-exit-not-progressing");
  } else if (candidateInside || segmentEntersVillageSanctuary(from, candidate)) {
    return denied("village-sanctuary");
  }
  const normalY = terrainNormalY(ground, candidate);
  const minimumNormalY = purpose === "return" ? 0.22 : Number(profile3.minimumGroundNormalY ?? 0.58);
  if (normalY < minimumNormalY) return denied("slope-too-steep", { normalY });
  return Object.freeze({ allowed: true, normalY, reason: "allowed" });
}
function terrainNormalY(ground, point3) {
  const normal = ground?.terrainNormal?.(point3.x, point3.z);
  return Number.isFinite(normal?.y) ? normal.y : 1;
}
function planarDistance(first, second) {
  return Math.hypot(first.x - second.x, first.z - second.z);
}
function denied(reason, detail = {}) {
  return Object.freeze({ allowed: false, reason, ...detail });
}
function finitePoint2(point3) {
  return Number.isFinite(point3?.x) && Number.isFinite(point3?.z);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/ShadowDemonMotion.js
function updateShadowDemonMotion(actor, deltaTime, playerState) {
  if (actor.state === ENEMY_STATE.CHASE || actor.state === ENEMY_STATE.APPROACH) {
    return pursuePlayer(actor, playerState, deltaTime);
  }
  if (actor.state === ENEMY_STATE.CIRCLE) {
    return circlePlayer(actor, playerState, deltaTime);
  }
  if (actor.state === ENEMY_STATE.RETURN_HOME || actor.state === ENEMY_STATE.RETREAT) {
    return returnShadowHome(actor, deltaTime);
  }
  if (actor.state === ENEMY_STATE.WANDER || actor.state === ENEMY_STATE.PATROL) {
    return wanderShadow(actor, deltaTime);
  }
  return true;
}
function planarDistance2(first, second) {
  return Math.hypot(first.x - second.x, first.z - second.z);
}
function shadowGroundHeight(ground, x, z) {
  const value3 = ground.heightAt(x, z);
  return Number(value3?.y ?? value3 ?? 0);
}
function pursuePlayer(actor, playerState, deltaTime) {
  const moved = moveShadowToward(
    actor,
    playerState,
    actor.profile.speed,
    deltaTime,
    "chase"
  );
  actor.forcedReturnReason = moved ? null : actor.lastTerritoryDecision?.reason;
  return moved;
}
function circlePlayer(actor, playerState, deltaTime) {
  const dx = playerState.x - actor.group.position.x;
  const dz = playerState.z - actor.group.position.z;
  const length2 = Math.max(1e-3, Math.hypot(dx, dz));
  const direction = actor.attackIndex % 2 === 0 ? 1 : -1;
  const target = {
    x: actor.group.position.x - dz / length2 * direction * 2,
    z: actor.group.position.z + dx / length2 * direction * 2
  };
  return moveShadowToward(actor, target, actor.profile.speed * 0.72, deltaTime, "circle");
}
function wanderShadow(actor, deltaTime) {
  const waypoint = actor.waypoints[actor.waypointIndex];
  if (planarDistance2(actor.group.position, waypoint) < 0.8) {
    advanceWaypoint(actor);
    return true;
  }
  const moved = moveShadowToward(
    actor,
    waypoint,
    actor.profile.speed * 0.38,
    deltaTime,
    "wander"
  );
  if (!moved) advanceWaypoint(actor);
  return moved;
}
function returnShadowHome(actor, deltaTime) {
  if (planarDistance2(actor.group.position, actor.profile) <= actor.profile.homeArrivalRange) {
    actor.engaged = false;
    actor.forcedReturnReason = null;
    return true;
  }
  return moveShadowToward(
    actor,
    actor.profile,
    actor.profile.speed * 1.2,
    deltaTime,
    "return"
  );
}
function moveShadowToward(actor, target, speed, deltaTime, purpose) {
  const from = actor.group.position;
  const dx = target.x - from.x;
  const dz = target.z - from.z;
  const length2 = Math.max(1e-4, Math.hypot(dx, dz));
  const step2 = Math.min(length2, speed * deltaTime);
  const proposed = {
    x: from.x + dx / length2 * step2,
    z: from.z + dz / length2 * step2
  };
  const candidate = resolveEnemyGroundStep(actor.ground, from, proposed, actor.profile);
  const decision = evaluateEnemyMovement({ candidate, from, ground: actor.ground, profile: actor.profile, purpose });
  actor.lastTerritoryDecision = decision;
  if (!decision.allowed) return false;
  actor.group.position.x = candidate.x;
  actor.group.position.z = candidate.z;
  actor.groundY = shadowGroundHeight(actor.ground, candidate.x, candidate.z);
  const yaw = Math.atan2(dx, dz);
  actor.group.quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2));
  return true;
}
function advanceWaypoint(actor) {
  actor.waypointIndex = (actor.waypointIndex + 1) % actor.waypoints.length;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/HostileTorahAbilitySystem.js?v=20260721-spatial-targeting-01
var HostileTorahAbilitySystem = class {
  constructor(bus, actors, spatialIndex = new HostileActorSpatialIndex()) {
    this.bus = bus;
    this.spatialIndex = spatialIndex;
    this.defense = new PlayerCombatDefense();
    this.playerState = null;
    this._actors = [];
    this.setActors(actors);
  }
  get actors() {
    return this._actors;
  }
  set actors(actors) {
    this._actors = Array.isArray(actors) ? actors : [];
    this.spatialIndex.replace(this._actors);
  }
  setActors(actors = []) {
    this.actors = actors;
    return this._actors.length;
  }
  setPlayerState(playerState) {
    this.playerState = playerState;
  }
  updateActor(actor) {
    if (actor?.state === ENEMY_STATE.DEFEATED) return this.spatialIndex.remove(actor);
    return this.spatialIndex.update(actor);
  }
  removeActor(actorOrId) {
    return this.spatialIndex.remove(actorOrId);
  }
  apply(proposedPassage, selectedTarget) {
    const passage2 = torahPassage(proposedPassage?.id);
    if (!passage2) return this.reject("UNKNOWN_PASSAGE");
    if (!this.playerState) return this.reject("PLAYER_STATE_UNAVAILABLE");
    const ability3 = torahAbilityFor(passage2);
    const now2 = performance.now() / 1e3;
    if (ability3.targetMode === "ward") return this.applyWard(ability3, now2);
    if (ability3.statusEffects.includes("protection")) this.defense.activateProtection(now2, 5);
    const targets = this.targetsFor(ability3, selectedTarget);
    if (!targets.length) return this.reject("TARGET_REQUIRED", ability3);
    const results = targets.map((actor) => actor.applyTorahPassage(passage2, this.playerState, now2));
    if (!results.some((result) => result.accepted)) {
      return this.reject(results[0]?.reason || "ABILITY_REJECTED", ability3, results);
    }
    return this.accept(ability3, targets, results);
  }
  targetsFor(ability3, selectedTarget) {
    if (ability3.targetMode === "single") {
      const selected2 = this.spatialIndex.resolve(selectedTarget);
      return this.isAvailable(selected2, ability3.range) ? [selected2] : [];
    }
    const inRange = this.spatialIndex.queryRadius(this.playerState, ability3.range).filter((actor) => this.isAvailable(actor, ability3.range));
    inRange.sort((first, second) => this.distance(first) - this.distance(second));
    if (ability3.targetMode !== "chain") return inRange.slice(0, ability3.maximumTargets);
    const selected = this.spatialIndex.resolve(selectedTarget);
    if (!this.isAvailable(selected, ability3.range) || !inRange.includes(selected)) {
      return inRange.slice(0, ability3.maximumTargets);
    }
    return [selected, ...inRange.filter((actor) => actor !== selected)].slice(0, ability3.maximumTargets);
  }
  isAvailable(actor, range) {
    return Boolean(actor) && actor.state !== ENEMY_STATE.DEFEATED && this.distance(actor) <= range;
  }
  distance(actor) {
    return planarDistance2(actor.group.position, this.playerState);
  }
  applyWard(ability3, now2) {
    this.defense.activateWard(now2);
    this.bus.emit("combat:ward", { ability: ability3, defense: this.defense.snapshot(now2) });
    return this.accept(ability3, [], []);
  }
  accept(ability3, targets, results) {
    const targetIds = targets.map((actor) => actor.profile.id);
    const impact = { accepted: true, ability: ability3, results, targetIds };
    this.bus.emit("combat:ability", impact);
    this.bus.emit("torah:impact", impact);
    return impact;
  }
  reject(reason, ability3 = null, results = []) {
    const impact = { accepted: false, ability: ability3, reason, results, targetIds: [] };
    this.bus.emit("torah:impact", impact);
    return impact;
  }
  diagnostics() {
    return { targeting: this.spatialIndex.diagnostics() };
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/npc/NpcPointerRay.js
function npcPointerHits(event, camera, canvas, target, radius = 0.82) {
  const ray = rayFromPointer(event, camera, canvas);
  return raySphere(ray, target, radius);
}
function rayFromPointer(event, camera, canvas) {
  const rectangle = canvas.getBoundingClientRect();
  const normalizedX = (event.clientX - rectangle.left) / rectangle.width * 2 - 1;
  const normalizedY = 1 - (event.clientY - rectangle.top) / rectangle.height * 2;
  const basis = cameraBasis2(camera);
  const tangent = Math.tan((camera.fov || 45) * Math.PI / 360);
  return {
    direction: normalize(add(
      add(
        basis.forward,
        scale(basis.right, normalizedX * tangent * (camera.aspect || 1))
      ),
      scale(basis.up, normalizedY * tangent)
    )),
    origin: basis.origin
  };
}
function cameraBasis2(camera) {
  const origin = v(
    camera.position.x,
    camera.position.y,
    camera.position.z
  );
  const forward = normalize(sub(targetOf2(camera.target), origin));
  const right = normalize(cross(forward, v(0, 1, 0)));
  const up = normalize(cross(right, forward));
  return { forward, origin, right, up };
}
function raySphere(ray, center, radius) {
  const offset = sub(ray.origin, center);
  const linear = dot(offset, ray.direction);
  const constant = dot(offset, offset) - radius * radius;
  const discriminant = linear * linear - constant;
  if (discriminant < 0) return false;
  const distance4 = -linear - Math.sqrt(discriminant);
  return distance4 > 0.05 && distance4 < 80;
}
function targetOf2(target) {
  if (Array.isArray(target)) {
    return v(target[0] || 0, target[1] || 0, target[2] || 0);
  }
  return v(target?.x || 0, target?.y || 0, target?.z || 0);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/EnemyAttackCatalog.js
var ENEMY_ATTACKS = Object.freeze({
  "klipah-stalker": attacks([
    attack("quick-slash", 0.28, 0.14, 0.38, 0.75, 8, 2.25, 9, "shadow-slash"),
    attack("lunging-cut", 0.46, 0.16, 0.56, 1.05, 11, 3.5, 13, "shadow-lunge"),
    attack("retreat-feint", 0.34, 0.12, 0.42, 0.9, 6, 2.7, 7, "shadow-feint")
  ]),
  "portal-wraith": attacks([
    attack("charged-pulse", 0.92, 0.16, 0.7, 1.55, 13, 8.5, 15, "portal-pulse"),
    attack("warning-ring", 0.68, 0.22, 0.64, 1.35, 10, 5.8, 12, "portal-ring"),
    attack("blink-burst", 0.48, 0.14, 0.5, 1.1, 9, 4.5, 10, "portal-blink")
  ]),
  "shadow-husk": attacks([
    attack("heavy-sweep", 0.76, 0.24, 0.82, 1.35, 14, 3.1, 18, "shadow-sweep"),
    attack("ground-pulse", 0.9, 0.2, 0.9, 1.65, 12, 4.7, 20, "shadow-pulse"),
    attack("binding-grasp", 0.64, 0.2, 0.72, 1.45, 10, 2.2, 16, "shadow-grasp")
  ])
});
function chooseEnemyAttack(archetype, attackIndex, playerDistance) {
  const values = ENEMY_ATTACKS[archetype] || ENEMY_ATTACKS["shadow-husk"];
  if (archetype === "portal-wraith" && playerDistance > 5) return values[0];
  if (archetype === "klipah-stalker" && playerDistance > 2.5) return values[1];
  return values[Math.abs(attackIndex) % values.length];
}
function attack(id, anticipation, active, recovery, cooldown, damage, range, stagger, damageType) {
  return Object.freeze({ active, anticipation, cooldown, damage, damageType, id, range, recovery, stagger });
}
function attacks(values) {
  return Object.freeze(values);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/EnemyAttackTimeline.js
function beginEnemyAttack(definition, nowSeconds) {
  const activeStart = nowSeconds + definition.anticipation;
  const activeEnd = activeStart + definition.active;
  return {
    activeEnd,
    activeStart,
    cancelled: false,
    completeAt: activeEnd + definition.recovery,
    damageApplied: false,
    definition,
    startedAt: nowSeconds
  };
}
function advanceEnemyAttack(timeline, nowSeconds) {
  if (!timeline || timeline.cancelled) {
    return phase(ENEMY_STATE.CHASE, false, true);
  }
  if (nowSeconds < timeline.activeStart) {
    return phase(ENEMY_STATE.ATTACK_ANTICIPATION, false, false);
  }
  if (nowSeconds < timeline.activeEnd) {
    return phase(ENEMY_STATE.ATTACK_ACTIVE, !timeline.damageApplied, false);
  }
  if (nowSeconds < timeline.completeAt) {
    return phase(ENEMY_STATE.ATTACK_RECOVERY, false, false);
  }
  return phase(ENEMY_STATE.CHASE, false, true);
}
function markEnemyAttackDamage(timeline) {
  if (timeline) timeline.damageApplied = true;
}
function enemyAttackCooldownEnds(timeline) {
  return timeline.completeAt + timeline.definition.cooldown;
}
function phase(state, damageWindowOpened, complete) {
  return { complete, damageWindowOpened, state };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/EnemyTargetContract.js
function enemyTargetContract(actor) {
  const worldPosition = actor.targetHint();
  return {
    aimPoint: { ...worldPosition },
    alive: actor.health > 0,
    combatRadius: actor.profile.attackRange,
    faction: "hostile",
    face: actor.profile.face || "\u25C8",
    health: actor.health,
    hostility: 1,
    id: actor.profile.id,
    interactionRadius: actor.profile.targetRadius || 1.25,
    maxHealth: actor.profile.maxHealth,
    name: actor.profile.name,
    occluded: false,
    priority: actor.selected ? 100 : 60,
    role: actor.profile.role,
    selected: actor.selected,
    stagger: actor.stagger,
    state: actor.state,
    statusEffects: actor.statusEffects.map((effect2) => effect2.id),
    targetable: actor.health > 0 && actor.group.visible,
    targetId: actor.profile.id,
    worldPosition
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/EnemyUpdateCadence.js
var EnemyUpdateCadence = class {
  constructor() {
    this.accumulated = 0;
  }
  advance(deltaTime, context) {
    this.accumulated += Math.max(0, deltaTime);
    const interval = enemyUpdateInterval(context);
    if (interval > 0 && this.accumulated < interval) return 0;
    const released = this.accumulated;
    this.accumulated = 0;
    return released;
  }
};
function enemyUpdateInterval(context) {
  if (context.selected || enemyStateIsUrgent(context.state)) return 0;
  if (context.distance < 34) return 0;
  if (context.distance < 72) return 0.1;
  if (context.distance < 120) return 0.25;
  return 0.6;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/ShadowDemonCombatSupport.js
function shadowAttackDefinition(actor) {
  if (actor.currentAttack) return actor.currentAttack;
  const profile3 = actor.profile || {};
  return Object.freeze({
    damage: Math.max(0, Number(profile3.attackDamage || 0)),
    damageType: "shadow-contact",
    id: "shadow-contact",
    range: Math.max(0, Number(profile3.attackRange || 0)),
    stagger: 0
  });
}
function shadowSanctuaryBlock(actor, playerState) {
  if (pointInsideVillageSanctuary(actor.group?.position)) return "enemy-sanctuary";
  if (pointInsideVillageSanctuary(playerState)) return "player-sanctuary";
  return null;
}
function resolveShadowIncoming(actor, proposedEvent, now2) {
  if (typeof actor.defense?.resolveIncoming === "function") {
    return actor.defense.resolveIncoming(proposedEvent, now2);
  }
  return proposedEvent;
}
function ensureShadowCombatCollections(actor) {
  if (!Array.isArray(actor.statusEffects)) actor.statusEffects = [];
  if (!Number.isFinite(actor.stagger)) actor.stagger = 0;
}
function resetShadowTransform(actor) {
  const x = Number(actor.profile.x || 0);
  const z = Number(actor.profile.z || 0);
  const y = shadowGroundHeight(actor.ground, x, z);
  actor.groundY = y;
  if (typeof actor.group.position.set === "function") actor.group.position.set(x, y, z);
  else Object.assign(actor.group.position, { x, y, z });
  if (typeof actor.group.scale?.set === "function") actor.group.scale.set(1, 1, 1);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/ShadowDemonCombat.js
var PLAYER_HURT_WINDOW_SECONDS = 0.18;
function attackPlayerFromShadow(actor, playerState, now2) {
  const attack2 = shadowAttackDefinition(actor);
  if (actor.attackTimeline?.damageApplied) return false;
  markEnemyAttackDamage(actor.attackTimeline);
  const sanctuaryReason = shadowSanctuaryBlock(actor, playerState);
  if (sanctuaryReason) return publishMiss(actor, attack2, sanctuaryReason);
  const combat = playerState.combat || (playerState.combat = { nextShadowHitAt: 0 });
  if (now2 < combat.nextShadowHitAt) return false;
  if (planarDistance2(actor.group.position, playerState) > attack2.range * 1.2) {
    return publishMiss(actor, attack2, "out-of-range");
  }
  combat.nextShadowHitAt = now2 + PLAYER_HURT_WINDOW_SECONDS;
  const proposed = createCombatDamageEvent({
    amount: attack2.damage,
    damageType: attack2.damageType,
    hitDirection: hitDirection(actor.group.position, playerState),
    sourceId: actor.profile.id,
    staggerAmount: attack2.stagger,
    targetId: "player",
    worldPosition: playerState
  });
  const event = resolveShadowIncoming(actor, proposed, now2);
  playerState.player.health = Math.max(0, playerState.player.health - event.amount);
  if (event.perfectWard) staggerShadow(actor, now2, attack2.stagger);
  actor.bus.emit("combat:damage", event);
  actor.bus.emit("enemy:attack", { attackId: attack2.id, enemy: actor.payload(), event });
  return true;
}
function applyTorahLight(actor, proposedPassage, playerState, now2) {
  const passage2 = torahPassage(proposedPassage?.id);
  if (!passage2) return rejection("UNKNOWN_PASSAGE");
  if (actor.state === ENEMY_STATE.DEFEATED) return rejection("TARGET_DEFEATED");
  const ability3 = torahAbilityFor(passage2);
  if (!playerState || planarDistance2(actor.group.position, playerState) > ability3.range) {
    return rejection("TARGET_OUT_OF_RANGE");
  }
  ensureShadowCombatCollections(actor);
  actor.engaged = true;
  actor.health = Math.max(0, actor.health - ability3.damage);
  actor.stagger += ability3.stagger;
  actor.statusEffects.push(...ability3.statusEffects.map((id) => ({ id, until: now2 + 3 })));
  const event = torahDamageEvent(actor, ability3, passage2);
  if (actor.stagger >= Number(actor.profile.staggerThreshold || Infinity)) {
    staggerShadow(actor, now2, actor.stagger);
  }
  if (actor.health <= 0) defeatShadow(actor, now2);
  actor.bus.emit("combat:damage", event);
  actor.bus.emit("enemy:damaged", { ...actor.payload(), ability: ability3, event });
  if (actor.selected) actor.bus.emit("npc:target", actor.payload());
  return { accepted: true, ability: ability3, damage: ability3.damage, defeated: actor.state === ENEMY_STATE.DEFEATED, event, health: actor.health };
}
function defeatShadow(actor, now2) {
  actor.state = ENEMY_STATE.DEFEATED;
  actor.stateElapsed = 0;
  actor.engaged = false;
  actor.respawnAt = now2 + actor.profile.respawnSeconds;
  actor.group.visible = false;
  actor.clear?.();
  actor.bus.emit("enemy:defeated", actor.payload());
}
function updateShadowRespawn(actor, now2) {
  if (now2 < actor.respawnAt) return false;
  actor.health = actor.profile.maxHealth;
  actor.state = ENEMY_STATE.SPAWN;
  actor.stateElapsed = 0;
  actor.engaged = false;
  actor.selected = false;
  actor.attackTimeline = null;
  actor.currentAttack = null;
  actor.nextAttackAt = now2 + Number(actor.profile.spawnSeconds || 0);
  actor.respawnAt = 0;
  actor.stagger = 0;
  actor.staggerUntil = 0;
  actor.statusEffects = [];
  actor.waypointIndex = 0;
  actor.forcedReturnReason = null;
  if (actor.cadence) actor.cadence.accumulated = 0;
  actor.group.visible = true;
  resetShadowTransform(actor);
  actor.bus.emit("enemy:respawn", actor.payload());
  return true;
}
function staggerShadow(actor, now2, amount) {
  actor.stagger = 0;
  actor.staggerUntil = now2 + Math.min(1.2, 0.4 + amount / 50);
  actor.attackTimeline = null;
  actor.currentAttack = null;
  actor.state = ENEMY_STATE.STAGGER;
  actor.stateElapsed = 0;
  actor.bus.emit("enemy:staggered", actor.payload());
}
function torahDamageEvent(actor, ability3, passage2) {
  return createCombatDamageEvent({ abilityId: ability3.id, amount: ability3.damage, damageType: `torah-${passage2.aspect}`, sourceId: "player", staggerAmount: ability3.stagger, statusEffects: ability3.statusEffects, targetId: actor.profile.id, worldPosition: actor.group.position });
}
function publishMiss(actor, attack2, reason) {
  actor.bus.emit("enemy:miss", { attackId: attack2.id, enemy: actor.payload(), reason });
  return false;
}
function hitDirection(source, target) {
  const length2 = Math.max(1e-3, planarDistance2(source, target));
  return { x: (target.x - source.x) / length2, y: 0, z: (target.z - source.z) / length2 };
}
function rejection(reason) {
  return { accepted: false, damage: 0, reason };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/ShadowDemonMelee.js
function applyMeleeStrike(actor, request, playerState, nowSeconds) {
  const attack2 = request?.attack;
  if (!attack2 || !playerState) return rejection2(actor, attack2, "ATTACK_CONTEXT_UNAVAILABLE");
  if (actor.state === ENEMY_STATE.DEFEATED) return rejection2(actor, attack2, "TARGET_DEFEATED");
  const distance4 = planarDistance2(actor.group.position, playerState);
  if (distance4 > attack2.range) return rejection2(actor, attack2, "TARGET_OUT_OF_RANGE", distance4);
  actor.engaged = true;
  actor.health = Math.max(0, actor.health - attack2.damage);
  actor.stagger += attack2.stagger;
  const event = createCombatDamageEvent({
    abilityId: attack2.id,
    amount: attack2.damage,
    damageType: "physical-staff",
    sourceId: request.sourceId || "player",
    staggerAmount: attack2.stagger,
    targetId: actor.profile.id,
    worldPosition: actor.group.position
  });
  if (actor.health <= 0) {
    defeatShadow(actor, nowSeconds);
  } else {
    applyStaggerThreshold(actor, nowSeconds);
  }
  actor.bus.emit("combat:damage", event);
  actor.bus.emit("enemy:damaged", {
    ...actor.payload(),
    attack: attack2,
    event
  });
  return {
    accepted: true,
    attackId: attack2.id,
    damage: attack2.damage,
    defeated: actor.state === ENEMY_STATE.DEFEATED,
    distance: distance4,
    health: actor.health,
    targetId: actor.profile.id
  };
}
function applyStaggerThreshold(actor, nowSeconds) {
  const threshold = Number(actor.profile.staggerThreshold || Infinity);
  if (actor.stagger < threshold) return;
  actor.stagger = 0;
  actor.staggerUntil = nowSeconds + 0.55;
  actor.attackTimeline = null;
  actor.currentAttack = null;
  actor.state = ENEMY_STATE.STAGGER;
  actor.stateElapsed = 0;
  actor.bus.emit("enemy:staggered", actor.payload());
}
function rejection2(actor, attack2, reason, distance4 = null) {
  return {
    accepted: false,
    attackId: attack2?.id || null,
    distance: distance4,
    reason,
    targetId: actor?.profile?.id || null
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/EnemyStatePolicy.js
function resolveEnemyState(context = {}) {
  if (Number(context.health) <= 0) return ENEMY_STATE.DEFEATED;
  if (mustReturnHome(context)) return ENEMY_STATE.RETURN_HOME;
  if (continuingReturn(context)) return ENEMY_STATE.RETURN_HOME;
  if (Number(context.now) < Number(context.staggerUntil || 0)) return ENEMY_STATE.STAGGER;
  if (continuingSpawn(context)) return ENEMY_STATE.SPAWN;
  if (context.attackState) return context.attackState;
  if (continuingAlert(context)) return ENEMY_STATE.ALERT;
  const aware = Boolean(context.engaged) || Number(context.playerDistance) <= Number(context.aggroRange);
  if (!aware) return ENEMY_STATE.WANDER;
  if (!context.engaged) return ENEMY_STATE.ALERT;
  if (canBeginAttack(context)) return ENEMY_STATE.ATTACK_ANTICIPATION;
  return ENEMY_STATE.CHASE;
}
function mustReturnHome(context) {
  return Boolean(context.returnReason) || Boolean(context.enemyInSanctuary) || Boolean(context.playerInSanctuary) || Number(context.homeDistance) > Number(context.leashRange);
}
function continuingReturn(context) {
  return context.currentState === ENEMY_STATE.RETURN_HOME && Number(context.homeDistance) > Number(context.homeArrivalRange);
}
function continuingSpawn(context) {
  return context.currentState === ENEMY_STATE.SPAWN && Number(context.stateElapsed) < Number(context.spawnSeconds || 0);
}
function continuingAlert(context) {
  return context.currentState === ENEMY_STATE.ALERT && Number(context.stateElapsed) < Number(context.noticeSeconds || 0);
}
function canBeginAttack(context) {
  return Number(context.playerDistance) <= Number(context.attackRange) && Number(context.now) >= Number(context.nextAttackAt || 0);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/EnemyWanderPath.js
function compileEnemyWanderPath(profile3, pointCount = 7) {
  const random2 = seededRandom(hash(profile3.id));
  const count = Math.max(3, Math.min(16, Math.floor(pointCount)));
  return Array.from({ length: count }, (_, index) => {
    const angle = index / count * Math.PI * 2 + random2() * 0.42;
    const radius = profile3.wanderRadius * (0.38 + random2() * 0.62);
    return {
      x: profile3.x + Math.cos(angle) * radius,
      z: profile3.z + Math.sin(angle) * radius
    };
  });
}
function hash(value3) {
  let result = 2166136261;
  for (const character of String(value3)) {
    result = Math.imul(result ^ character.charCodeAt(0), 16777619) >>> 0;
  }
  return result;
}
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = Math.imul(state ^ state >>> 15, 2246822507);
    state ^= Math.imul(state ^ state >>> 13, 3266489909);
    return (state >>> 0) / 4294967295;
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzFallbackBoxMesh.js
var FACES = Object.freeze([
  face([0, 0, 1], [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]),
  face([0, 0, -1], [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]]),
  face([1, 0, 0], [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]]),
  face([-1, 0, 0], [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]]),
  face([0, 1, 0], [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]]),
  face([0, -1, 0], [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]])
]);
function createFallbackBoxMesh(name, size, position, color) {
  const geometry = new BufferGeometry();
  const positions = [];
  const normals = [];
  const colors = [];
  const uvs = [];
  const indices = [];
  const half = size.map((value3) => value3 * 0.5);
  for (const [faceIndex, definition] of FACES.entries()) {
    const offset = faceIndex * 4;
    for (const corner of definition.corners) {
      positions.push(
        corner[0] * half[0],
        corner[1] * half[1],
        corner[2] * half[2]
      );
      normals.push(...definition.normal);
      colors.push(...color);
    }
    uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
    indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
  }
  geometry.setAttribute("position", attribute2(positions, 3));
  geometry.setAttribute("normal", attribute2(normals, 3));
  geometry.setAttribute("color", attribute2(colors, 4));
  geometry.setAttribute("uv", attribute2(uvs, 2));
  geometry.setIndex(new BufferAttribute(new Uint16Array(indices), 1));
  const material = new MeshStandardMaterial({ color, name: `${name}-material` });
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(position[0], position[1], position[2]);
  mesh.setBaseTransform();
  return mesh;
}
function face(normal, corners2) {
  return Object.freeze({
    corners: Object.freeze(corners2.map((corner) => Object.freeze(corner))),
    normal: Object.freeze(normal)
  });
}
function attribute2(values, itemSize) {
  return new BufferAttribute(new Float32Array(values), itemSize);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/ShadowDemonVisual.js
var SHADOW = Object.freeze([0.035, 0.025, 0.07, 1]);
var VIOLET = Object.freeze([0.2, 0.06, 0.32, 1]);
var EYE = Object.freeze([0.8, 0.3, 1, 1]);
function createShadowDemonVisual(profile3, ground) {
  const group = new Group();
  group.name = `Awtsmoos_shadow_${profile3.id}`;
  group.userData.archetype = profile3.creatureType;
  group.userData.family = "hostile-shadow-demon";
  group.userData.renderDistance = 105;
  for (const definition of partsFor(profile3)) {
    group.add(createFallbackBoxMesh(
      definition.name,
      definition.size,
      definition.position,
      definition.color
    ));
  }
  const groundY = groundHeight(ground, profile3.x, profile3.z);
  group.position.set(profile3.x, groundY, profile3.z);
  group.setBaseTransform();
  return { group, groundY };
}
function animateShadowDemonVisual(actor, deltaTime) {
  actor.visualClock += deltaTime;
  const pulse = Math.sin(actor.visualClock * stateFrequency(actor.state));
  actor.group.position.y = actor.groundY + 0.2 + pulse * 0.07;
  const anticipation = actor.state === ENEMY_STATE.ATTACK_ANTICIPATION ? Math.max(0, pulse) * 0.2 : 0;
  const active = actor.state === ENEMY_STATE.ATTACK_ACTIVE ? 0.17 : 0;
  const stagger = actor.state === ENEMY_STATE.STAGGER ? pulse * 0.1 : 0;
  const spawn2 = actor.state === ENEMY_STATE.SPAWN ? Math.min(1, actor.stateElapsed / actor.profile.spawnSeconds) : 1;
  const scale2 = Math.max(0.05, (actor.profile.visualScale + anticipation + active + stagger) * spawn2);
  actor.group.scale.set(scale2, scale2, scale2);
}
function partsFor(profile3) {
  if (profile3.visualKind === "stalker") return stalkerParts(profile3.id);
  if (profile3.visualKind === "wraith") return wraithParts(profile3.id);
  return huskParts(profile3.id);
}
function huskParts(id) {
  return [
    part(`${id}-body`, [1.05, 1.7, 0.72], [0, 1, 0], SHADOW),
    part(`${id}-head`, [0.62, 0.56, 0.55], [0, 2.05, 0], VIOLET),
    part(`${id}-eye`, [0.3, 0.1, 0.05], [0, 2.1, 0.3], EYE)
  ];
}
function stalkerParts(id) {
  return [
    part(`${id}-body`, [1.35, 0.62, 0.6], [0, 0.72, 0], SHADOW),
    part(`${id}-head`, [0.5, 0.48, 0.52], [0, 1.05, 0.48], VIOLET),
    part(`${id}-legs`, [1.55, 0.25, 0.35], [0, 0.3, 0], SHADOW)
  ];
}
function wraithParts(id) {
  return [
    part(`${id}-mist`, [1.45, 0.3, 1.2], [0, 0.22, 0], VIOLET),
    part(`${id}-column`, [0.65, 1.9, 0.58], [0, 1.15, 0], SHADOW),
    part(`${id}-eyes`, [0.38, 0.1, 0.05], [0, 1.8, 0.31], EYE)
  ];
}
function part(name, size, position, color) {
  return { color, name, position, size };
}
function stateFrequency(state) {
  if (state === ENEMY_STATE.ATTACK_ANTICIPATION) return 10;
  if (state === ENEMY_STATE.ATTACK_ACTIVE || state === ENEMY_STATE.STAGGER) return 14;
  return 3;
}
function groundHeight(ground, x, z) {
  const value3 = ground.heightAt(x, z);
  return Number(value3?.y ?? value3 ?? 0);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/ShadowDemonActor.js
var ShadowDemonActor = class {
  constructor(options) {
    Object.assign(this, options);
    this.health = this.profile.maxHealth;
    this.state = ENEMY_STATE.SPAWN;
    this.stateElapsed = 0;
    this.selected = false;
    this.engaged = false;
    this.nextAttackAt = 0;
    this.respawnAt = 0;
    this.stagger = 0;
    this.staggerUntil = 0;
    this.statusEffects = [];
    this.attackIndex = 0;
    this.attackTimeline = null;
    this.currentAttack = null;
    this.visualClock = 0;
    this.lastTerritoryDecision = null;
    this.cadence = new EnemyUpdateCadence();
    this.waypoints = compileEnemyWanderPath(this.profile);
    this.waypointIndex = 0;
    Object.assign(this, createShadowDemonVisual(this.profile, this.ground));
  }
  update(deltaTime, playerState, now2 = performance.now() / 1e3) {
    if (this.state === ENEMY_STATE.DEFEATED) {
      updateShadowRespawn(this, now2);
      return;
    }
    const distance4 = planarDistance2(this.group.position, playerState);
    const released = this.cadence.advance(deltaTime, {
      distance: distance4,
      selected: this.selected,
      state: this.state
    });
    animateShadowDemonVisual(this, deltaTime);
    if (!released) return;
    this.statusEffects = this.statusEffects.filter((effect2) => effect2.until > now2);
    this.stateElapsed += released;
    const attackState = this.advanceAttack(playerState, now2);
    const previousState = this.state;
    this.state = resolveEnemyState(this.stateContext(playerState, now2, attackState));
    if (this.state !== previousState) this.stateElapsed = 0;
    if (this.state === ENEMY_STATE.ALERT && !this.engaged) {
      this.engaged = true;
      this.bus.emit("enemy:alert", this.payload());
    }
    if (this.state === ENEMY_STATE.ATTACK_ANTICIPATION && !this.attackTimeline) {
      this.beginAttack(distance4, now2);
    }
    updateShadowDemonMotion(this, released, playerState);
  }
  advanceAttack(playerState, now2) {
    if (!this.attackTimeline) return null;
    const phase2 = advanceEnemyAttack(this.attackTimeline, now2);
    if (phase2.damageWindowOpened) attackPlayerFromShadow(this, playerState, now2);
    if (!phase2.complete) return phase2.state;
    this.nextAttackAt = enemyAttackCooldownEnds(this.attackTimeline);
    this.attackTimeline = null;
    this.currentAttack = null;
    this.attackIndex += 1;
    return null;
  }
  beginAttack(distance4, now2) {
    this.currentAttack = chooseEnemyAttack(this.profile.creatureType, this.attackIndex, distance4);
    this.attackTimeline = beginEnemyAttack(this.currentAttack, now2);
    this.bus.emit("enemy:telegraph", { attack: this.currentAttack, enemy: this.payload() });
  }
  stateContext(playerState, now2, attackState) {
    return {
      aggroRange: this.profile.aggroRange,
      attackRange: this.currentAttack?.range || this.profile.attackRange,
      attackState,
      currentState: this.state,
      engaged: this.engaged,
      enemyInSanctuary: pointInsideVillageSanctuary(this.group.position),
      health: this.health,
      homeArrivalRange: this.profile.homeArrivalRange,
      homeDistance: planarDistance2(this.group.position, this.profile),
      leashRange: this.profile.leashRange,
      nextAttackAt: this.nextAttackAt,
      noticeSeconds: this.profile.noticeSeconds,
      now: now2,
      playerDistance: planarDistance2(this.group.position, playerState),
      playerInSanctuary: pointInsideVillageSanctuary(playerState),
      returnReason: this.forcedReturnReason,
      spawnSeconds: this.profile.spawnSeconds,
      staggerUntil: this.staggerUntil,
      stateElapsed: this.stateElapsed
    };
  }
  hitPointer(event) {
    return this.state !== ENEMY_STATE.DEFEATED && npcPointerHits(event, this.camera, this.canvas, this.targetHint());
  }
  target() {
    this.selected = true;
    this.bus.emit("npc:target", this.payload());
  }
  clear(silent = false) {
    this.selected = false;
    if (!silent) this.bus.emit("npc:clear", this.payload());
  }
  applyTorahPassage(passage2, playerState, now2 = performance.now() / 1e3) {
    return applyTorahLight(this, passage2, playerState, now2);
  }
  applyMelee(request, playerState, now2 = performance.now() / 1e3) {
    return applyMeleeStrike(this, request, playerState, now2);
  }
  payload() {
    return {
      ...enemyTargetContract(this),
      attackable: true,
      attackId: this.currentAttack?.id || null,
      creatureType: this.profile.creatureType,
      level: "Hostile shadow",
      territory: this.lastTerritoryDecision
    };
  }
  targetHint() {
    return {
      x: this.group.position.x,
      y: this.group.position.y + 1.3,
      z: this.group.position.z
    };
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/ShadowDemonProfiles.js
var PROFILES2 = Object.freeze([
  profile2({
    aggroRange: 22,
    attackCooldown: 1.35,
    attackRange: 3.1,
    creatureType: "shadow-husk",
    face: "\u{1F311}",
    id: "shadow-husk-east",
    maxHealth: 110,
    name: "Shadow Husk",
    noticeSeconds: 0.6,
    role: "Heavy sweep, pulse, and binding grasp",
    speed: 1.55,
    staggerThreshold: 38,
    targetRadius: 1.55,
    visualKind: "husk",
    wanderRadius: 14,
    x: 86,
    z: -88
  }),
  profile2({
    aggroRange: 30,
    attackCooldown: 0.9,
    attackRange: 3.5,
    creatureType: "klipah-stalker",
    face: "\u{1F43E}",
    id: "klipah-stalker-ridge",
    maxHealth: 70,
    name: "Klipah Stalker",
    noticeSeconds: 0.35,
    role: "Quick slash, lunge, side-step, and retreat",
    speed: 3.1,
    staggerThreshold: 24,
    targetRadius: 1.3,
    visualKind: "stalker",
    wanderRadius: 20,
    x: 52,
    z: -104
  }),
  profile2({
    aggroRange: 34,
    attackCooldown: 1.4,
    attackRange: 8.5,
    creatureType: "portal-wraith",
    face: "\u{1F300}",
    id: "portal-wraith-terrace",
    maxHealth: 82,
    name: "Portal Wraith",
    noticeSeconds: 0.5,
    role: "Charged pulse, warning ring, and blink burst",
    speed: 2.3,
    staggerThreshold: 30,
    targetRadius: 1.45,
    visualKind: "wraith",
    wanderRadius: 12,
    x: 77,
    z: -55
  })
]);
function shadowDemonProfiles(quality = "high") {
  const count = quality === "low" ? 1 : quality === "medium" ? 2 : 3;
  return PROFILES2.slice(0, count);
}
function profile2(definition) {
  return Object.freeze({
    face: "\u{1F311}",
    homeArrivalRange: 0.8,
    leashRange: definition.wanderRadius + 24,
    minimumGroundNormalY: 0.55,
    questTarget: "dybbuk-shade",
    respawnSeconds: 22,
    spawnSeconds: 0.7,
    visualScale: 1,
    ...definition
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/enemy/HostileNpcPopulation.js?v=20260721-spatial-targeting-01
var HostileNpcPopulation = class {
  constructor(options) {
    this.bus = options.bus;
    this.camera = options.camera;
    this.group = new Group();
    this.group.name = "Awtsmoos_hostile_shadow_population";
    this.abilitySystem = new HostileTorahAbilitySystem(options.bus, []);
    this.actors = shadowDemonProfiles(options.quality).map((profile3) => new ShadowDemonActor({
      bus: options.bus,
      camera: options.camera,
      canvas: options.canvas,
      defense: this.abilitySystem.defense,
      ground: options.ground,
      profile: profile3
    }));
    this.abilitySystem.setActors(this.actors);
    for (const actor of this.actors) this.group.add(actor.group);
    this.selected = null;
    this.playerState = null;
    this.unsubscribers = [
      this.bus.on("torah:use", (passage2) => this.applyTorahPassage(passage2)),
      this.bus.on("combat:melee", (request) => this.applyMelee(request)),
      this.bus.on("target:cycle", () => this.cycleTarget()),
      this.bus.on("npc:target", (payload) => this.clearDifferentTarget(payload)),
      this.bus.on("enemy:defeated", (payload) => this.publishAdventureEvent(payload))
    ];
  }
  update(deltaTime, playerState) {
    this.playerState = playerState;
    this.abilitySystem.setPlayerState(playerState);
    const now2 = performance.now() / 1e3;
    for (const actor of this.actors) {
      actor.update(deltaTime, playerState, now2);
      this.abilitySystem.updateActor(actor);
    }
    if (this.selected?.state === ENEMY_STATE.DEFEATED) this.selected = null;
  }
  applyTorahPassage(passage2) {
    return this.abilitySystem.apply(passage2, this.selected?.profile?.id || null);
  }
  applyMelee(request) {
    const result = this.selected ? this.selected.applyMelee(request, this.playerState) : rejection3(request, "TARGET_REQUIRED");
    this.bus.emit("combat:melee-result", result);
    return result;
  }
  candidateFromPointer(event) {
    const hits = this.actors.filter((actor) => actor.hitPointer(event)).map((actor) => ({
      actor,
      distance: distanceFromCamera(actor, this.camera),
      population: this
    }));
    return hits.sort((first, second) => first.distance - second.distance)[0] || null;
  }
  activateCandidate(candidate) {
    this.selectActor(candidate.actor);
  }
  cycleTarget() {
    const living = this.actors.filter((actor) => actor.state !== ENEMY_STATE.DEFEATED);
    if (!living.length) return false;
    const index = Math.max(-1, living.indexOf(this.selected));
    this.selectActor(living[(index + 1) % living.length]);
    return true;
  }
  selectActor(actor) {
    if (this.selected && this.selected !== actor) this.selected.clear(true);
    this.selected = actor;
    actor.target();
  }
  clearAll() {
    if (!this.selected) return;
    this.selected.clear();
    this.selected = null;
  }
  clearDifferentTarget(payload) {
    if (!this.selected || payload?.id === this.selected.profile.id) return;
    this.selected.clear(true);
    this.selected = null;
  }
  publishAdventureEvent(payload) {
    this.abilitySystem.removeActor(payload?.id);
    if (payload?.id === this.selected?.profile.id) this.selected = null;
    const event = enemyDefeatAdventureEvent(payload);
    if (event) this.bus.emit("quest:event", event);
  }
  diagnostics() {
    const actors = this.actors.map((actor) => actor.payload());
    return {
      active: actors.filter((actor) => actor.state !== ENEMY_STATE.DEFEATED).length,
      actors,
      playerContextReady: Boolean(this.playerState),
      selectedId: this.selected?.profile.id || null,
      torahTargeting: this.abilitySystem.diagnostics().targeting
    };
  }
  destroy() {
    for (const unsubscribe of this.unsubscribers) unsubscribe();
    this.abilitySystem.spatialIndex.clear();
    this.group.parent?.remove(this.group);
  }
};
function rejection3(request, reason) {
  return { accepted: false, attackId: request?.attack?.id || null, reason, targetId: null };
}
function distanceFromCamera(actor, camera) {
  const hint = actor.targetHint();
  const position = camera?.position || { x: 0, y: 0, z: 0 };
  return Math.hypot(hint.x - position.x, hint.y - position.y, hint.z - position.z);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/horses/AnimatedHorse.js
var AnimatedHorse = class {
  constructor(template, groundProfile, route) {
    this.groundProfile = groundProfile;
    this.route = { ...route };
    this.clock = 0;
    this.mesh = new Mesh(template.geometry, template.material);
    this.mesh.name = `Awtsmoos-animated-horse-${route.id}`;
    this.mesh.userData = {
      ...template.userData,
      animated: true,
      dynamic: true,
      groundSampling: "precomputed-cyclic-catmull-rom-profile",
      horseId: route.id,
      sharedGeometry: true,
      sharedMaterial: true
    };
    this.update(0);
  }
  update(deltaTime) {
    this.clock += Math.max(0, Number(deltaTime) || 0);
    const angle = this.route.phase + this.clock * this.route.speed;
    const x = this.route.centerX + Math.cos(angle) * this.route.radiusX;
    const z = this.route.centerZ + Math.sin(angle) * this.route.radiusZ;
    const directionX = -Math.sin(angle) * this.route.radiusX;
    const directionZ = Math.cos(angle) * this.route.radiusZ;
    const yaw = Math.atan2(directionX, directionZ);
    const groundY = this.groundProfile.heightAt(angle);
    const gait = Math.abs(Math.sin(this.clock * this.route.gaitRate));
    this.mesh.position.set(x, groundY + gait * 0.075, z);
    this.mesh.quaternion.set(
      0,
      Math.sin(yaw / 2),
      0,
      Math.cos(yaw / 2)
    );
    return this;
  }
  stats() {
    return {
      animated: true,
      clock: this.clock,
      geometryShared: this.mesh.userData.sharedGeometry,
      groundProfile: this.groundProfile.stats(),
      groundSampling: this.mesh.userData.groundSampling,
      id: this.route.id,
      materialShared: this.mesh.userData.sharedMaterial,
      modelSource: this.mesh.userData.modelSource,
      position: {
        x: this.mesh.position.x,
        y: this.mesh.position.y,
        z: this.mesh.position.z
      }
    };
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/horses/HorseGroundProfile.js
var TWO_PI = Math.PI * 2;
var HORSE_GROUND_SAMPLE_COUNT = 2048;
var HorseGroundProfile = class {
  constructor(ground, route, options = {}) {
    this.routeId = route.id;
    this.sampleCount = validatedSampleCount(
      options.sampleCount || HORSE_GROUND_SAMPLE_COUNT
    );
    this.heights = new Float64Array(this.sampleCount);
    this.terrainQueries = 0;
    this.minimumHeight = Infinity;
    this.maximumHeight = -Infinity;
    this.maximumAdjacentDelta = 0;
    this.sampleGround(ground, route);
    this.measureAdjacentDelta();
  }
  heightAt(angle) {
    const scaled = normalizeAngle(angle) / TWO_PI * this.sampleCount;
    const base = Math.floor(scaled);
    const amount = scaled - base;
    return cyclicCatmullRom(
      this.heights[wrap(base - 1, this.sampleCount)],
      this.heights[wrap(base, this.sampleCount)],
      this.heights[wrap(base + 1, this.sampleCount)],
      this.heights[wrap(base + 2, this.sampleCount)],
      amount
    );
  }
  stats() {
    return {
      interpolation: "cyclic-catmull-rom",
      maximumAdjacentDelta: this.maximumAdjacentDelta,
      maximumHeight: this.maximumHeight,
      minimumHeight: this.minimumHeight,
      routeId: this.routeId,
      sampleCount: this.sampleCount,
      sampleSpacingRadians: TWO_PI / this.sampleCount,
      terrainQueries: this.terrainQueries
    };
  }
  sampleGround(ground, route) {
    for (let index = 0; index < this.sampleCount; index += 1) {
      const angle = index / this.sampleCount * TWO_PI;
      const x = route.centerX + Math.cos(angle) * route.radiusX;
      const z = route.centerZ + Math.sin(angle) * route.radiusZ;
      const height = finiteGroundHeight(ground.heightAt(x, z));
      this.heights[index] = height;
      this.terrainQueries += 1;
      this.minimumHeight = Math.min(this.minimumHeight, height);
      this.maximumHeight = Math.max(this.maximumHeight, height);
    }
  }
  measureAdjacentDelta() {
    for (let index = 0; index < this.sampleCount; index += 1) {
      const next = (index + 1) % this.sampleCount;
      this.maximumAdjacentDelta = Math.max(
        this.maximumAdjacentDelta,
        Math.abs(this.heights[next] - this.heights[index])
      );
    }
  }
};
function cyclicCatmullRom(a, b, c, d, amount) {
  const squared = amount * amount;
  const cubed = squared * amount;
  return 0.5 * (2 * b + (-a + c) * amount + (2 * a - 5 * b + 4 * c - d) * squared + (-a + 3 * b - 3 * c + d) * cubed);
}
function normalizeAngle(angle) {
  const finite4 = Number.isFinite(Number(angle)) ? Number(angle) : 0;
  return (finite4 % TWO_PI + TWO_PI) % TWO_PI;
}
function wrap(index, count) {
  return (index % count + count) % count;
}
function validatedSampleCount(value3) {
  const count = Math.floor(Number(value3));
  if (!Number.isFinite(count) || count < 8) {
    throw new Error("Horse ground profile requires at least eight samples.");
  }
  return count;
}
function finiteGroundHeight(sample2) {
  const value3 = Number.isFinite(Number(sample2)) ? Number(sample2) : Number(sample2?.y);
  if (!Number.isFinite(value3)) {
    throw new Error("Horse ground profile requires a finite terrain height.");
  }
  return value3;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/horses/HorseMaterialContract.js
var HORSE_FUR_TEXTURE_URL = DETAIL_TEXTURE_FAMILIES.fur.horse;
function horseMaterialFields() {
  const mapImage = cachedTextureImage(HORSE_FUR_TEXTURE_URL);
  return {
    anisotropy: 8,
    mapImage,
    mapRepeat: [3, 2],
    texturePolicy: {
      fallbackApplied: false,
      fullResolution: true,
      role: "creature.horseFur",
      tileWorld: 1.15
    },
    textureUrl: HORSE_FUR_TEXTURE_URL
  };
}
function horseMaterialEvidence() {
  const image = cachedTextureImage(HORSE_FUR_TEXTURE_URL);
  return {
    decoded: !!image,
    fullResolution: HORSE_FUR_TEXTURE_URL.includes("/full-resolution/"),
    height: image?.naturalHeight || 0,
    role: "creature.horseFur",
    url: HORSE_FUR_TEXTURE_URL,
    width: image?.naturalWidth || 0
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/horses/HorseGeometryTemplate.js
var HORSE_VISUAL = Object.freeze({
  color: "#7a4a28",
  height: 1.82,
  id: "horse",
  kosherEligible: false,
  length: 3.25,
  width: 0.74
});
var sharedTemplate = null;
function sharedHorseTemplate() {
  if (sharedTemplate) {
    return sharedTemplate;
  }
  const geometry = createLoftedAnimalGeometry(HORSE_VISUAL, "high");
  sharedTemplate = createPrimitiveMesh({
    ...horseMaterialFields(),
    color: HORSE_VISUAL.color,
    id: "Awtsmoos-shared-high-detail-horse-template",
    indices: geometry.indices,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
    shape: "manual",
    solid: false,
    userData: {
      animated: true,
      dynamic: true,
      family: "animated-horse",
      modelSource: "shared-project-horse-geometry"
    },
    vertices: geometry.vertices
  });
  return sharedTemplate;
}
function sharedHorseTemplateEvidence() {
  const template = sharedHorseTemplate();
  return {
    materialName: template.material.name,
    modelSource: template.userData.modelSource,
    triangles: template.geometry.index.count / 3,
    vertices: template.geometry.attributes.position.count
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/horses/HorseRouteCatalog.js
var HORSE_HERD_ROUTES = Object.freeze([
  createHorseRoute("chesed", 53, -43, 8.5, 5.5, 0.27, 0.2),
  createHorseRoute("gevurah", 51, -43, 6.2, 8.3, 0.24, 2.4),
  createHorseRoute("tiferes", 55, -45, 10.4, 6.8, 0.21, 4.5)
]);
function createHorseRoute(id, centerX, centerZ, radiusX, radiusZ, speed, phase2) {
  return Object.freeze({
    centerX,
    centerZ,
    gaitRate: 7.8 + speed * 4,
    id,
    phase: phase2,
    radiusX,
    radiusZ,
    speed
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/horses/HorseHerdSystem.js
var HorseHerdSystem = class {
  constructor(scene, ground) {
    this.group = new Group();
    this.group.name = "Awtsmoos-animated-full-material-horse-herd";
    this.group.userData = {
      animated: true,
      dynamic: true,
      family: "animated-horse-herd",
      groundSampling: "precomputed-cyclic-catmull-rom-profile"
    };
    const template = sharedHorseTemplate();
    this.groundProfiles = HORSE_HERD_ROUTES.map((route) => new HorseGroundProfile(ground, route));
    this.horses = HORSE_HERD_ROUTES.map((route, index) => new AnimatedHorse(template, this.groundProfiles[index], route));
    for (const horse of this.horses) {
      this.group.add(horse.mesh);
    }
    scene.add(this.group);
  }
  update(deltaTime) {
    for (const horse of this.horses) {
      horse.update(deltaTime);
    }
  }
  stats() {
    const groundProfiles = this.groundProfiles.map((profile3) => profile3.stats());
    return {
      allAnimated: this.horses.every((horse) => horse.mesh.userData.animated === true),
      count: this.horses.length,
      drawVessels: this.horses.length,
      groundProfiles,
      horses: this.horses.map((horse) => horse.stats()),
      material: horseMaterialEvidence(),
      resources: sharedHorseTemplateEvidence(),
      runtimeTerrainQueries: 0,
      strategy: "shared-full-detail-form-independent-frame-motion-cyclic-ground-profiles",
      terrainQueriesDuringConstruction: groundProfiles.reduce(
        (total, profile3) => total + profile3.terrainQueries,
        0
      )
    };
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/npc/NpcAnimationCadence.js
var NpcAnimationCadence = class {
  constructor(id, options = {}) {
    this.phase = Number.isFinite(options.phase) ? clampPhase(options.phase) : deterministicNpcAnimationPhase(id);
    this.elapsed = 0;
    this.lastAppliedAt = 0;
    this.nextAt = 0;
    this.interval = Infinity;
    this.updates = 0;
  }
  advance(deltaTime, interval) {
    this.elapsed += Math.max(0, Number(deltaTime) || 0);
    if (!Number.isFinite(interval)) {
      this.interval = Infinity;
      return 0;
    }
    const safeInterval = Math.max(1 / 240, Number(interval) || 0);
    if (safeInterval !== this.interval) {
      this.interval = safeInterval;
      this.nextAt = this.elapsed + this.phase * safeInterval;
    }
    if (this.elapsed + 1e-9 < this.nextAt) {
      return 0;
    }
    const accumulated = Math.max(1e-3, this.elapsed - this.lastAppliedAt);
    this.lastAppliedAt = this.elapsed;
    this.nextAt = this.elapsed + safeInterval;
    this.updates += 1;
    return accumulated;
  }
  stats() {
    return {
      elapsed: this.elapsed,
      interval: this.interval,
      nextAt: this.nextAt,
      phase: this.phase,
      updates: this.updates
    };
  }
};
function deterministicNpcAnimationPhase(id) {
  let hash2 = 2166136261;
  for (const character of String(id || "npc")) {
    hash2 ^= character.codePointAt(0);
    hash2 = Math.imul(hash2, 16777619);
  }
  return (hash2 >>> 0) / 4294967296;
}
function clampPhase(value3) {
  return Math.max(0, Math.min(0.999999, Number(value3) || 0));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/npc/NpcLodPolicy.js
var TIERS = Object.freeze({
  near: tier("near", true, false, 1 / 30, 2),
  mid: tier("mid", false, true, 1 / 8, 6),
  distant: tier("distant", false, true, 1 / 3, 18),
  dormant: tier("dormant", false, false, Infinity, Infinity)
});
function resolveNpcLod(distance4, options = {}) {
  if (options.selected || options.questFocused) {
    return { ...TIERS.near, minimumFrames: 1 };
  }
  const value3 = Number.isFinite(distance4) ? distance4 : Infinity;
  if (value3 <= (options.nearDistance ?? 24)) return { ...TIERS.near };
  if (value3 <= (options.midDistance ?? 72)) return { ...TIERS.mid };
  if (value3 <= (options.distantDistance ?? 155)) return { ...TIERS.distant };
  return { ...TIERS.dormant };
}
function npcDistanceToPlayer(actor, playerState) {
  if (!playerState) return Infinity;
  return Math.hypot(
    Number(playerState.x || 0) - Number(actor.x || 0),
    Number(playerState.z || 0) - Number(actor.z || 0)
  );
}
function tier(id, fullModel, proxyModel, updateInterval, minimumFrames) {
  return Object.freeze({
    fullModel,
    id,
    minimumFrames,
    proxyModel,
    updateInterval
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/npc/NpcQuestMarker.js
function createNpcQuestMarker(profile3, groundY) {
  const group = new Group();
  group.name = `Awtsmoos_npc_marker_${profile3.id}`;
  group.add(primitive(
    `${profile3.id}-ring`,
    "cylinder",
    profile3.x,
    groundY + 0.05,
    profile3.z,
    { height: 0.05, radius: 1.05, segments: 28 },
    "#ffe45e"
  ));
  if (profile3.questId) {
    group.add(primitive(
      `${profile3.id}-quest-stem`,
      "cylinder",
      profile3.x,
      groundY + 3.25,
      profile3.z,
      { height: 0.58, radius: 0.1, segments: 12 },
      "#ffd229"
    ));
    group.add(primitive(
      `${profile3.id}-quest-dot`,
      "sphere",
      profile3.x,
      groundY + 2.82,
      profile3.z,
      { radius: 0.14 },
      "#fff080"
    ));
  }
  group.userData.questMarker = Boolean(profile3.questId);
  return group;
}
function setNpcMarkerState(marker2, state) {
  const selected = state.selected === true;
  const questVisible = state.questVisible === true;
  for (const child of marker2.children) {
    const questPart = child.name.includes("quest-");
    child.visible = questPart ? questVisible : selected;
  }
  marker2.visible = selected || questVisible;
}
function primitive(id, shape, x, y, z, dimensions, color) {
  return createPrimitiveMesh({
    ...dimensions,
    color,
    id: `Awtsmoos_${id}`,
    position: { x, y, z },
    shape,
    solid: false,
    userData: { family: "friendly-npc-marker" }
  });
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-accessors.js
var COMPONENTS = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
var TYPE_SIZES = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };
function componentName(t) {
  return { 5120: "BYTE", 5121: "UNSIGNED_BYTE", 5122: "SHORT", 5123: "UNSIGNED_SHORT", 5125: "UNSIGNED_INT", 5126: "FLOAT" }[t] || String(t);
}
function normalizedScale(Ctor) {
  if (Ctor === Int8Array) return 1 / 127;
  if (Ctor === Uint8Array) return 1 / 255;
  if (Ctor === Int16Array) return 1 / 32767;
  if (Ctor === Uint16Array) return 1 / 65535;
  return 1;
}
function scalar(view, off, Ctor) {
  if (Ctor === Float32Array) return view.getFloat32(off, true);
  if (Ctor === Uint32Array) return view.getUint32(off, true);
  if (Ctor === Uint16Array) return view.getUint16(off, true);
  if (Ctor === Uint8Array) return view.getUint8(off);
  if (Ctor === Int16Array) return view.getInt16(off, true);
  return view.getInt8(off);
}
function writeTuple(target, index, values, itemSize) {
  for (let k = 0; k < itemSize; k++) target[index * itemSize + k] = values[k] ?? 0;
}
function readAccessor(doc, buffers, index) {
  const a = doc.accessors[index], Ctor = COMPONENTS[a?.componentType], itemSize = TYPE_SIZES[a?.type] || 1;
  if (!a || !Ctor) throw new Error(`Unsupported accessor ${index}`);
  const normalized3 = a.normalized === true;
  let array;
  if (a.bufferView === void 0) {
    array = new Ctor(a.count * itemSize);
  } else {
    const bv = doc.bufferViews[a.bufferView], buffer = buffers[bv.buffer], base = (bv.byteOffset || 0) + (a.byteOffset || 0), stride = bv.byteStride || Ctor.BYTES_PER_ELEMENT * itemSize;
    if (stride === Ctor.BYTES_PER_ELEMENT * itemSize) {
      array = new Ctor(buffer, base, a.count * itemSize);
    } else {
      array = new Ctor(a.count * itemSize);
      const view = new DataView(buffer);
      for (let i = 0; i < a.count; i++) for (let k = 0; k < itemSize; k++) array[i * itemSize + k] = scalar(view, base + i * stride + k * Ctor.BYTES_PER_ELEMENT, Ctor);
    }
  }
  if (a.sparse) {
    array = new Ctor(array);
    applySparse(doc, buffers, a, array, itemSize, Ctor);
  }
  const attr = new BufferAttribute(array, itemSize, normalized3, a.componentType);
  attr.accessorIndex = index;
  attr.min = a.min;
  attr.max = a.max;
  return attr;
}
function applySparse(doc, buffers, a, array, itemSize, Ctor) {
  const s = a.sparse, iv = doc.bufferViews[s.indices.bufferView], vv = doc.bufferViews[s.values.bufferView], ICtor = COMPONENTS[s.indices.componentType];
  const ib = buffers[iv.buffer], vb = buffers[vv.buffer], iBase = (iv.byteOffset || 0) + (s.indices.byteOffset || 0), vBase = (vv.byteOffset || 0) + (s.values.byteOffset || 0);
  const iView = new DataView(ib), vView = new DataView(vb);
  for (let n = 0; n < s.count; n++) {
    const idx = scalar(iView, iBase + n * ICtor.BYTES_PER_ELEMENT, ICtor), vals = [];
    for (let k = 0; k < itemSize; k++) vals[k] = scalar(vView, vBase + (n * itemSize + k) * Ctor.BYTES_PER_ELEMENT, Ctor);
    writeTuple(array, idx, vals, itemSize);
  }
}
function accessorFloatArray(attr) {
  const src = attr.array;
  if (src instanceof Float32Array && !attr.normalized) return src;
  const out = new Float32Array(src.length), scale2 = attr.normalized ? normalizedScale(src.constructor) : 1;
  for (let i = 0; i < src.length; i++) {
    let v2 = src[i] * scale2;
    if (attr.normalized && (src instanceof Int8Array || src instanceof Int16Array)) v2 = Math.max(-1, v2);
    out[i] = v2;
  }
  return out;
}
function normalizeWeightsAttribute(attr) {
  const src = accessorFloatArray(attr), out = new Float32Array(src.length), size = attr.itemSize;
  for (let i = 0; i < attr.count; i++) {
    let sum2 = 0;
    for (let k = 0; k < size; k++) sum2 += Math.abs(src[i * size + k] || 0);
    if (sum2 > 0) {
      for (let k = 0; k < size; k++) out[i * size + k] = (src[i * size + k] || 0) / sum2;
    } else out[i * size] = 1;
  }
  return new BufferAttribute(out, size, false, 5126);
}
function accessorSummary(doc, index) {
  const a = doc.accessors[index];
  return `${index} ${a.type} ${componentName(a.componentType)} norm=${!!a.normalized} count=${a.count}`;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-parser.js
var TARGET_SIZE = {
  rotation: 4,
  scale: 3,
  translation: 3,
  weights: 1
};
function summarizeAnimations(document2) {
  return (document2.animations || []).map((animation, index) => ({
    channels: (animation.channels || []).length,
    index,
    name: animation.name || `animation_${index}`,
    paths: [...new Set(
      (animation.channels || []).map((channel) => channel.target?.path).filter(Boolean)
    )],
    samplers: (animation.samplers || []).length
  }));
}
function parseTinyAnimations(document2, accessors, nodeMap) {
  return (document2.animations || []).map((animation, index) => parseAnimation(animation, index, accessors, nodeMap));
}
function parseAnimation(animation, index, accessors, nodeMap) {
  const channels = [];
  let duration = 0;
  for (const sourceChannel of animation.channels || []) {
    const channel = parseChannel(
      sourceChannel,
      animation.samplers || [],
      accessors,
      nodeMap
    );
    if (!channel) {
      continue;
    }
    channels.push(channel);
    duration = Math.max(duration, channel.input[channel.input.length - 1] || 0);
  }
  return {
    channels,
    duration,
    index,
    name: animation.name || `animation_${index}`
  };
}
function parseChannel(sourceChannel, samplers, accessors, nodeMap) {
  const sampler = samplers[sourceChannel.sampler];
  const target = sourceChannel.target || {};
  const node = nodeMap.get(target.node);
  const size = TARGET_SIZE[target.path];
  if (!sampler || !node || !size) {
    return null;
  }
  return {
    input: accessorFloatArray(accessors[sampler.input]),
    interpolation: sampler.interpolation || "LINEAR",
    node,
    nodeIndex: target.node,
    output: accessorFloatArray(accessors[sampler.output]),
    path: target.path,
    size
  };
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-bindings.js
function createAnimationBindings(clips) {
  const bindingByNode = /* @__PURE__ */ new Map();
  const bindings = [];
  for (const clip of clips) {
    for (const channel of clip.channels || []) {
      let paths = bindingByNode.get(channel.node);
      if (!paths) {
        paths = /* @__PURE__ */ new Map();
        bindingByNode.set(channel.node, paths);
      }
      if (paths.has(channel.path)) {
        continue;
      }
      const binding = {
        base: readBaseValue(channel.node, channel.path),
        node: channel.node,
        path: channel.path
      };
      paths.set(channel.path, binding);
      bindings.push(binding);
    }
  }
  return bindings;
}
function captureClipPose(clip) {
  const pose = /* @__PURE__ */ new Map();
  for (const channel of clip?.channels || []) {
    pose.set(channel, readNodeValue(channel.node, channel.path));
  }
  return pose;
}
function resetAnimationBindings(bindings) {
  for (const binding of bindings) {
    writeNodeValue(binding.node, binding.path, binding.base);
  }
}
function writeNodeValue(node, path, values) {
  if (path === "translation") {
    node.position.set(values[0], values[1], values[2]);
    return;
  }
  if (path === "rotation") {
    node.quaternion.set(values[0], values[1], values[2], values[3]);
    return;
  }
  if (path === "scale") {
    node.scale.set(values[0], values[1], values[2]);
  }
}
function readBaseValue(node, path) {
  const base = node._base;
  if (path === "translation") {
    const value3 = base?.position || node.position;
    return [value3.x, value3.y, value3.z];
  }
  if (path === "rotation") {
    const value3 = base?.quaternion || node.quaternion;
    return [value3.x, value3.y, value3.z, value3.w];
  }
  if (path === "scale") {
    const value3 = base?.scale || node.scale;
    return [value3.x, value3.y, value3.z];
  }
  return [0];
}
function readNodeValue(node, path) {
  if (path === "translation") {
    return [node.position.x, node.position.y, node.position.z];
  }
  if (path === "rotation") {
    return [node.quaternion.x, node.quaternion.y, node.quaternion.z, node.quaternion.w];
  }
  if (path === "scale") {
    return [node.scale.x, node.scale.y, node.scale.z];
  }
  return [0];
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-quaternion.js
function slerpQuaternionInto(output, ax, ay, az, aw, bx, by, bz, bw, amount) {
  let cosine = ax * bx + ay * by + az * bz + aw * bw;
  if (cosine < 0) {
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
    cosine = -cosine;
  }
  if (cosine > 0.9995) {
    return normalizeInto(
      output,
      ax + (bx - ax) * amount,
      ay + (by - ay) * amount,
      az + (bz - az) * amount,
      aw + (bw - aw) * amount
    );
  }
  const angle = Math.acos(Math.min(1, Math.max(-1, cosine)));
  const sine = Math.sin(angle);
  const leftWeight = Math.sin((1 - amount) * angle) / sine;
  const rightWeight = Math.sin(amount * angle) / sine;
  return normalizeInto(
    output,
    ax * leftWeight + bx * rightWeight,
    ay * leftWeight + by * rightWeight,
    az * leftWeight + bz * rightWeight,
    aw * leftWeight + bw * rightWeight
  );
}
function normalizeInto(output, x, y, z, w) {
  const scale2 = 1 / Math.max(1e-12, Math.hypot(x, y, z, w));
  output[0] = x * scale2;
  output[1] = y * scale2;
  output[2] = z * scale2;
  output[3] = w * scale2;
  return output;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-sampler.js
function applyChannelSample(channel, time, fadeFrom, fadeAmount = 1) {
  const span = resolveSpan(channel, time);
  if (channel.path === "rotation") {
    applyRotation(channel, span, fadeFrom, fadeAmount);
    return;
  }
  if (channel.path === "translation" || channel.path === "scale") {
    applyVector(channel, span, fadeFrom, fadeAmount);
  }
}
function applyVector(channel, span, fadeFrom, fadeAmount) {
  const values = channel._sampleScratch || (channel._sampleScratch = new Float64Array(3));
  for (let index = 0; index < 3; index += 1) {
    const sampled = sampleComponent(channel, span, index);
    values[index] = fadeFrom ? fadeFrom[index] + (sampled - fadeFrom[index]) * fadeAmount : sampled;
  }
  const target = channel.path === "translation" ? channel.node.position : channel.node.scale;
  target.set(values[0], values[1], values[2]);
}
function applyRotation(channel, span, fadeFrom, fadeAmount) {
  const output = channel._sampleScratch || (channel._sampleScratch = new Float64Array(4));
  const left = span.left * channel.size;
  const right = span.right * channel.size;
  const source = channel.output;
  if (span.step) {
    for (let index = 0; index < 4; index += 1) {
      output[index] = source[left + index] ?? (index === 3 ? 1 : 0);
    }
  } else {
    slerpQuaternionInto(
      output,
      source[left] || 0,
      source[left + 1] || 0,
      source[left + 2] || 0,
      source[left + 3] ?? 1,
      source[right] || 0,
      source[right + 1] || 0,
      source[right + 2] || 0,
      source[right + 3] ?? 1,
      span.amount
    );
  }
  if (fadeFrom) {
    slerpQuaternionInto(output, ...fadeFrom, ...output, fadeAmount);
  }
  channel.node.quaternion.set(output[0], output[1], output[2], output[3]);
}
function sampleComponent(channel, span, componentIndex) {
  const left = span.left * channel.size + componentIndex;
  const valueA = channel.output[left] ?? 0;
  if (span.step) return valueA;
  const right = span.right * channel.size + componentIndex;
  const valueB = channel.output[right] ?? valueA;
  return valueA + (valueB - valueA) * span.amount;
}
function resolveSpan(channel, time) {
  const times = channel.input;
  const span = channel._sampleSpan || (channel._sampleSpan = {});
  const last = times.length - 1;
  if (last <= 0 || time <= times[0]) return assignSpan(span, 0, 0, 0, true);
  if (time >= times[last]) return assignSpan(span, last, last, 0, true);
  let low = 0;
  let high = last;
  while (high - low > 1) {
    const middle = low + high >> 1;
    if (times[middle] <= time) low = middle;
    else high = middle;
  }
  const amount = (time - times[low]) / Math.max(1e-8, times[high] - times[low]);
  return assignSpan(span, low, high, amount, channel.interpolation === "STEP");
}
function assignSpan(span, left, right, amount, step2) {
  span.left = left;
  span.right = right;
  span.amount = amount;
  span.step = step2 || left === right;
  return span;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-animation-player.js
var TinyAnimationPlayer = class {
  constructor(root, clips = []) {
    this.root = root;
    this.clips = clips;
    this.bindings = createAnimationBindings(clips);
    this.currentIndex = clips.length ? 0 : -1;
    this.time = 0;
    this.playing = true;
    this.bindPose = false;
    this.lastApplied = null;
    this.fadeDuration = 0.18;
    this.fadeTime = 0;
    this.fadePose = null;
  }
  get current() {
    return this.clips[this.currentIndex] || null;
  }
  get names() {
    return this.clips.map((clip) => clip.name);
  }
  play(indexOrName) {
    const index = resolveClipIndex(this.clips, indexOrName);
    if (index < 0) return this.current;
    const target = this.clips[index];
    const alreadyApplied = this.lastApplied === target?.name;
    if (index === this.currentIndex && !this.bindPose && alreadyApplied) {
      this.playing = true;
      return this.current;
    }
    const hasAppliedPose = this.lastApplied !== null && this.lastApplied !== "bind";
    this.fadePose = hasAppliedPose ? captureClipPose(target) : null;
    this.fadeTime = hasAppliedPose ? 0 : this.fadeDuration;
    this.currentIndex = index;
    this.time = 0;
    this.bindPose = false;
    this.playing = true;
    this.apply(0);
    return this.current;
  }
  next() {
    return this.play((this.currentIndex + 1) % Math.max(1, this.clips.length));
  }
  setBindPose(enabled) {
    this.bindPose = Boolean(enabled);
    this.time = 0;
    this.fadePose = null;
    resetAnimationBindings(this.bindings);
    this.lastApplied = this.bindPose ? "bind" : null;
  }
  update(deltaTime) {
    if (this.bindPose || !this.current) return;
    const delta = Math.max(0, Number(deltaTime) || 0);
    if (this.playing) this.time += delta;
    if (this.fadePose) this.fadeTime += delta;
    const duration = this.current.duration || 1;
    this.apply(duration ? this.time % duration : 0);
  }
  apply(time) {
    const clip = this.current;
    if (!clip) return;
    resetAnimationBindings(this.bindings);
    const fadeAmount = this.fadePose ? smooth(Math.min(1, this.fadeTime / Math.max(1e-3, this.fadeDuration))) : 1;
    for (const channel of clip.channels) {
      applyChannelSample(channel, time, this.fadePose?.get(channel), fadeAmount);
    }
    if (this.fadePose && this.fadeTime >= this.fadeDuration) this.fadePose = null;
    this.lastApplied = clip.name;
  }
  diagnostics() {
    const clip = this.current;
    return {
      bindPose: this.bindPose,
      channels: clip?.channels.length || 0,
      clipCount: this.clips.length,
      currentAnimation: clip?.name || null,
      currentIndex: this.currentIndex,
      duration: Number((clip?.duration || 0).toFixed(3)),
      fade: this.fadePose ? Number((1 - this.fadeTime / this.fadeDuration).toFixed(3)) : 0,
      playing: this.playing,
      time: Number(this.time.toFixed(3))
    };
  }
};
function resolveClipIndex(clips, indexOrName) {
  return typeof indexOrName === "number" ? indexOrName : clips.findIndex((clip) => clip.name === indexOrName);
}
function smooth(amount) {
  return amount * amount * (3 - 2 * amount);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/GroundRay.js
function alignModelFeetToGround(model, groundY = 0) {
  model.updateWorldMatrix?.();
  const minY = findMinWorldY(model);
  if (!Number.isFinite(minY)) return { minY: null, offset: 0 };
  const offset = groundY - minY;
  model.position.y += offset;
  model.setBaseTransform?.();
  return { minY, offset };
}
function findMinWorldY(root) {
  let minY = Infinity;
  root.traverse((object) => {
    const position = object.geometry?.attributes?.position;
    const matrix = object.matrixWorld;
    if (!position || !matrix) return;
    const array = position.array;
    for (let i = 0; i < array.length; i += 3) {
      const y = matrix[1] * array[i] + matrix[5] * array[i + 1] + matrix[9] * array[i + 2] + matrix[13];
      if (y < minY) minY = y;
    }
  });
  return minY;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/npc/NpcFarProxy.js
function createNpcFarProxy(profile3, ground) {
  const group = new Group();
  const definition = createVillageBoxBatch(
    `npc-proxy-${profile3.id}`,
    proxyBoxes(),
    {
      color: profile3.outfit?.colors?.coat || "#29313b",
      family: "friendly-npc-proxy",
      part: "merged-silhouette"
    }
  );
  const mesh = createPrimitiveMesh(definition);
  mesh.userData.renderFamily = "npc-proxy";
  mesh.userData.renderDistance = 170;
  group.name = `Awtsmoos_npc_proxy_${profile3.id}`;
  group.userData.family = "friendly-npc-proxy";
  group.userData.actorId = profile3.id;
  group.position.set(profile3.x, ground.heightAt(profile3.x, profile3.z), profile3.z);
  group.add(mesh);
  group.visible = false;
  return group;
}
function proxyBoxes() {
  return [
    box3(0, 1.28, 0, 0.72, 1.22, 0.42),
    box3(0, 2.18, 0, 0.48, 0.48, 0.48),
    box3(0, 2.55, 0, 0.62, 0.18, 0.62),
    box3(-0.25, 0.48, 0, 0.22, 0.96, 0.24),
    box3(0.25, 0.48, 0, 0.22, 0.96, 0.24),
    box3(-0.48, 1.35, 0, 0.2, 1.02, 0.24),
    box3(0.48, 1.35, 0, 0.2, 1.02, 0.24)
  ];
}
function box3(x, y, z, width, height, depth) {
  return {
    position: { x, y, z },
    size: { x: width, y: height, z: depth },
    yaw: 0
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/npc/NpcChossidVisual.js
function createNpcChossidVisual(profile3, gltf, ground) {
  const group = new Group();
  group.name = `Awtsmoos_friendly_npc_${profile3.id}`;
  group.userData.family = "animated-chossid-npc";
  group.userData.renderDistance = profile3.primary ? 170 : 155;
  const model = gltf.scene;
  model.scale.set(1.38, 1.38, 1.38);
  model.position.set(profile3.x, 0, profile3.z);
  const aligned = alignModelFeetToGround(model, 0);
  const groundY = ground.heightAt(profile3.x, profile3.z);
  const footOffset = aligned.offset ?? 0;
  model.position.set(profile3.x, groundY + footOffset, profile3.z);
  model.quaternion.set(0, Math.sin(0.75), 0, Math.cos(0.75));
  model.setBaseTransform();
  const player = new TinyAnimationPlayer(model, gltf.animations);
  const clips = npcAnimationClips(player.names);
  player.play(profile3.wanderRadius ? clips.walk : clips.idle);
  const marker2 = createNpcQuestMarker(profile3, groundY);
  const proxy = createNpcFarProxy(profile3, ground);
  group.add(model);
  group.add(proxy);
  group.add(marker2);
  return { clips, footOffset, groundY, group, marker: marker2, model, player, proxy };
}
function faceNpcModelToPlayer(model, actorPosition, playerState) {
  if (!playerState) return;
  const yaw = Math.atan2(playerState.x - actorPosition.x, playerState.z - actorPosition.z);
  setYaw(model, yaw);
}
function faceNpcModelAlongPath(model, elapsed, phase2 = 0) {
  const dx = -Math.sin(elapsed + phase2);
  const dz = Math.cos((elapsed + phase2) * 0.83) * 0.72;
  setYaw(model, Math.atan2(dx, dz));
}
function setYaw(model, yaw) {
  model.quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2));
}
function npcAnimationClips(names) {
  const pick = (expression, fallback) => names.find((name) => expression.test(name)) || fallback;
  const idle = pick(/stand|idle|neutral/i, names[0] || "");
  return { idle, walk: pick(/walk|step|stroll/i, idle) };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/npc/NpcScheduleFacing.js
function faceNpcScheduledActor(model, actor, playerState) {
  if (actor.selected || actor.dialogueOpen) {
    faceNpcModelToPlayer(
      model,
      { x: actor.worldX, z: actor.worldZ },
      playerState
    );
    return;
  }
  if (actor.isTravelling) {
    faceDirection(model, actor.routeDirectionX, actor.routeDirectionZ);
    return;
  }
  faceNpcModelAlongPath(
    model,
    actor.elapsed,
    actor.profile.motionPhase || 0
  );
}
function faceDirection(model, directionX, directionZ) {
  const yaw = Math.atan2(directionX || 0, directionZ || 1);
  model.quaternion.set(0, Math.sin(yaw / 2), 0, Math.cos(yaw / 2));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/npc/FriendlyNpcScheduleRules.js
var DEFAULT_DAY_LENGTH_SECONDS = 1440;
function friendlyNpcDailyPeriod(hour) {
  const value3 = normalizeFriendlyNpcHour(hour);
  if (value3 < 5 || value3 >= 21) return "night";
  if (value3 < 10) return "morning";
  if (value3 < 17) return "day";
  return "evening";
}
function friendlyNpcScheduleAt(profile3, hour) {
  const period = friendlyNpcDailyPeriod(hour);
  return profile3?.dailyAnchors?.[period] || null;
}
function advanceFriendlyNpcWorldHour(currentHour, deltaTime, options = {}) {
  const authoritative = Number(options.playerState?.worldHour);
  if (Number.isFinite(authoritative)) return normalizeFriendlyNpcHour(authoritative);
  const dayLengthSeconds = Math.max(60, Number(options.dayLengthSeconds) || DEFAULT_DAY_LENGTH_SECONDS);
  const elapsed = Math.max(0, Number(deltaTime) || 0);
  return normalizeFriendlyNpcHour(Number(currentHour) + elapsed * 24 / dayLengthSeconds);
}
function normalizeFriendlyNpcHour(hour) {
  const value3 = Number.isFinite(Number(hour)) ? Number(hour) : 12;
  return (value3 % 24 + 24) % 24;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/npc/NpcRoadNetwork.js
var NETWORK = buildNetwork();
function nearestNpcRoadNode(point3) {
  let nearest = NETWORK.nodes[0];
  let nearestDistance = Infinity;
  for (const node of NETWORK.nodes) {
    const distance4 = pointDistance(point3, node);
    if (distance4 < nearestDistance) {
      nearest = node;
      nearestDistance = distance4;
    }
  }
  return nearest;
}
function shortestNpcRoadNodePath(start, end) {
  const count = NETWORK.nodes.length;
  const distances = new Float64Array(count);
  const previous = new Int32Array(count);
  const visited = new Uint8Array(count);
  distances.fill(Infinity);
  previous.fill(-1);
  distances[start.index] = 0;
  for (let pass = 0; pass < count; pass += 1) {
    const node = nearestUnvisited(distances, visited);
    if (!node || node === end) break;
    visited[node.index] = 1;
    relaxLinks(node, distances, previous);
  }
  return rebuildPath(start, end, previous);
}
function buildNetwork() {
  const nodesByKey = /* @__PURE__ */ new Map();
  const nodes = [];
  for (const route of canonicalVillageRoadRoutes()) {
    for (let index = 0; index < route.points.length; index += 1) {
      const node = networkNode(route.points[index], nodesByKey, nodes);
      if (index > 0) {
        const previous = networkNode(route.points[index - 1], nodesByKey, nodes);
        connectNodes(previous, node);
      }
    }
  }
  return Object.freeze({ nodes: Object.freeze(nodes) });
}
function networkNode(point3, nodesByKey, nodes) {
  const key = coordinateKey(point3);
  if (!nodesByKey.has(key)) {
    const node = { index: nodes.length, links: [], x: point3.x, z: point3.z };
    nodesByKey.set(key, node);
    nodes.push(node);
  }
  return nodesByKey.get(key);
}
function connectNodes(first, second) {
  const distance4 = pointDistance(first, second);
  first.links.push({ distance: distance4, node: second });
  second.links.push({ distance: distance4, node: first });
}
function nearestUnvisited(distances, visited) {
  let result = null;
  let resultDistance = Infinity;
  for (const node of NETWORK.nodes) {
    if (!visited[node.index] && distances[node.index] < resultDistance) {
      result = node;
      resultDistance = distances[node.index];
    }
  }
  return result;
}
function relaxLinks(node, distances, previous) {
  for (const link of node.links) {
    const candidate = distances[node.index] + link.distance;
    if (candidate < distances[link.node.index]) {
      distances[link.node.index] = candidate;
      previous[link.node.index] = node.index;
    }
  }
}
function rebuildPath(start, end, previous) {
  const path = [];
  let index = end.index;
  while (index >= 0) {
    path.push(NETWORK.nodes[index]);
    if (index === start.index) break;
    index = previous[index];
  }
  return index < 0 ? [start, end] : path.reverse();
}
function coordinateKey(point3) {
  return `${Number(point3.x).toFixed(3)}:${Number(point3.z).toFixed(3)}`;
}
function pointDistance(first, second) {
  return Math.hypot(Number(second.x) - Number(first.x), Number(second.z) - Number(first.z));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/npc/NpcRoadJourney.js
var JOURNEY_CACHE = /* @__PURE__ */ new Map();
function npcRoadJourney(from, to) {
  const key = journeyKey(from, to);
  if (JOURNEY_CACHE.has(key)) return JOURNEY_CACHE.get(key);
  const points = samePoint(from, to) ? [pointFrom(from)] : journeyPoints(from, to);
  const journey = measureJourney(points);
  JOURNEY_CACHE.set(key, journey);
  return journey;
}
function sampleNpcRoadJourney(journey, progress, actor, laneOffset = 0) {
  if (journey.points.length < 2 || journey.totalLength <= 1e-3) {
    applyStationaryJourney(journey.points[0], actor);
    return;
  }
  const clamped = Math.max(0, Math.min(1, Number(progress) || 0));
  const distance4 = journey.totalLength * clamped;
  const index = segmentForDistance(journey, distance4);
  const from = journey.points[index - 1];
  const to = journey.points[index];
  const start = journey.cumulativeLength[index - 1];
  const length2 = Math.max(1e-6, journey.cumulativeLength[index] - start);
  const local = Math.max(0, Math.min(1, (distance4 - start) / length2));
  const directionX = (to.x - from.x) / length2;
  const directionZ = (to.z - from.z) / length2;
  const offset = laneOffset * Math.sin(Math.PI * clamped);
  actor.routeCenterX = from.x + (to.x - from.x) * local - directionZ * offset;
  actor.routeCenterZ = from.z + (to.z - from.z) * local + directionX * offset;
  actor.routeDirectionX = directionX;
  actor.routeDirectionZ = directionZ;
}
function journeyPoints(from, to) {
  const nodes = shortestNpcRoadNodePath(
    nearestNpcRoadNode(from),
    nearestNpcRoadNode(to)
  );
  return deduplicatePoints([
    pointFrom(from),
    ...nodes.map(pointFrom),
    pointFrom(to)
  ]);
}
function applyStationaryJourney(point3, actor) {
  actor.routeCenterX = Number(point3?.x) || 0;
  actor.routeCenterZ = Number(point3?.z) || 0;
  actor.routeDirectionX = 0;
  actor.routeDirectionZ = 1;
}
function measureJourney(points) {
  const cumulativeLength = [0];
  for (let index = 1; index < points.length; index += 1) {
    cumulativeLength.push(
      cumulativeLength[index - 1] + pointDistance2(points[index - 1], points[index])
    );
  }
  return Object.freeze({
    cumulativeLength: Object.freeze(cumulativeLength),
    points: Object.freeze(points.map((point3) => Object.freeze(point3))),
    totalLength: cumulativeLength.at(-1) || 0
  });
}
function segmentForDistance(journey, distance4) {
  for (let index = 1; index < journey.cumulativeLength.length; index += 1) {
    if (distance4 <= journey.cumulativeLength[index]) return index;
  }
  return journey.points.length - 1;
}
function deduplicatePoints(points) {
  return points.filter((point3, index) => {
    return index === 0 || pointDistance2(point3, points[index - 1]) > 1e-3;
  });
}
function samePoint(first, second) {
  return pointDistance2(first, second) <= 1e-3;
}
function journeyKey(from, to) {
  return `${coordinateKey2(from)}>${coordinateKey2(to)}`;
}
function coordinateKey2(point3) {
  return `${Number(point3.x).toFixed(3)}:${Number(point3.z).toFixed(3)}`;
}
function pointFrom(point3) {
  return { x: Number(point3.x) || 0, z: Number(point3.z) || 0 };
}
function pointDistance2(first, second) {
  return Math.hypot(
    Number(second.x) - Number(first.x),
    Number(second.z) - Number(first.z)
  );
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/npc/NpcScheduleJourney.js
var DEFAULT_DAY_LENGTH_SECONDS2 = 1440;
var MAXIMUM_TRAVEL_HOURS = 2.4;
var MINIMUM_TRAVEL_HOURS = 0.25;
var PERIOD_START = Object.freeze({ day: 10, evening: 17, morning: 5, night: 21 });
var PREVIOUS_PERIOD = Object.freeze({
  day: "morning",
  evening: "day",
  morning: "night",
  night: "evening"
});
function applyNpcScheduleJourney(actor, worldHour) {
  const anchors = actor.profile?.dailyAnchors;
  if (!anchors) {
    applyFallbackPost(actor);
    return 1;
  }
  const hour = normalizeFriendlyNpcHour(worldHour);
  const period = friendlyNpcDailyPeriod(hour);
  ensureScheduleLeg(actor, anchors, period);
  const elapsed = normalizeFriendlyNpcHour(hour - PERIOD_START[period]);
  const duration = actor.scheduleTravelDuration;
  const progress = duration > 0 ? Math.min(1, elapsed / duration) : 1;
  sampleNpcRoadJourney(
    actor.scheduleJourney,
    smoothStep(progress),
    actor,
    actor.scheduleLaneOffset
  );
  applyScheduleState(actor, progress);
  return progress;
}
function npcScheduleTravelDuration(routeLength, walkSpeed, dayLengthSeconds = DEFAULT_DAY_LENGTH_SECONDS2) {
  const length2 = Math.max(0, Number(routeLength) || 0);
  if (length2 <= 1e-3) return 0;
  const speed = Math.max(0.2, Number(walkSpeed) || 1);
  const daySeconds = Math.max(1, Number(dayLengthSeconds) || DEFAULT_DAY_LENGTH_SECONDS2);
  const worldHours = length2 / speed * 24 / daySeconds;
  return Math.max(MINIMUM_TRAVEL_HOURS, Math.min(MAXIMUM_TRAVEL_HOURS, worldHours));
}
function ensureScheduleLeg(actor, anchors, period) {
  if (actor.scheduleJourney && actor.dailyPeriod === period) return;
  const destination = friendlyNpcScheduleAt(actor.profile, PERIOD_START[period]);
  const origin = anchors[PREVIOUS_PERIOD[period]] || destination;
  if (actor.dailyPeriod && actor.dailyPeriod !== period) {
    actor.scheduleChanges = Number(actor.scheduleChanges || 0) + 1;
  }
  actor.dailyPeriod = period;
  actor.scheduleDestination = destination;
  actor.scheduleJourney = npcRoadJourney(origin.location, destination.location);
  actor.scheduleTravelDuration = npcScheduleTravelDuration(
    actor.scheduleJourney.totalLength,
    actor.profile.walkSpeed
  );
  actor.scheduleLaneOffset = laneOffsetFor(actor.profile);
}
function applyScheduleState(actor, progress) {
  const destination = actor.scheduleDestination;
  actor.activeScheduleAction = destination.action;
  actor.currentAction = progress < 1 ? `travel-to-${destination.location.id}` : destination.action;
  actor.isTravelling = progress < 1;
  actor.navigationTarget = destination.location;
  actor.scheduleProgress = progress;
  actor.scheduleRouteLength = actor.scheduleJourney.totalLength;
}
function applyFallbackPost(actor) {
  actor.routeCenterX = Number(actor.profile?.x) || 0;
  actor.routeCenterZ = Number(actor.profile?.z) || 0;
  actor.routeDirectionX = 0;
  actor.routeDirectionZ = 1;
  actor.currentAction = "remain-at-post";
  actor.isTravelling = false;
}
function laneOffsetFor(profile3) {
  const phase2 = Number(profile3.motionPhase) || 0;
  return Math.sin(phase2 * 7.31 + 0.43) * 0.42;
}
function smoothStep(value3) {
  const clamped = Math.max(0, Math.min(1, value3));
  return clamped * clamped * (3 - 2 * clamped);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/npc/NpcChossidMotion.js
var DUTY_WANDER_SCALE = Object.freeze({
  "join-village-gathering": 0.68,
  "pray-shacharis": 0.32,
  "rest-at-home": 0.16
});
function updateNpcChossidMotion(actor, deltaTime, playerState, worldHour) {
  applyNpcScheduleJourney(actor, worldHour);
  updateLogicalRoute(actor);
  const previousLodId = actor.lod?.id;
  actor.lod = resolveNpcLod(
    npcDistanceToPlayer({ x: actor.worldX, z: actor.worldZ }, playerState),
    { questFocused: actor.dialogueOpen, selected: actor.selected }
  );
  applyVisibility(actor);
  const motionDelta = actor.motionCadence.advance(
    deltaTime,
    actor.lod.updateInterval,
    actor.lod.minimumFrames
  );
  if (!actor.lod.fullModel && !actor.lod.proxyModel) return;
  const becameVisible = previousLodId === "dormant" && actor.lod.id !== "dormant";
  const appliedDelta = motionDelta > 0 ? motionDelta : becameVisible ? Math.max(deltaTime, 1 / 60) : 0;
  if (appliedDelta <= 0) return;
  actor.elapsed += appliedDelta * (actor.profile.motionSpeed || 0);
  updateLogicalRoute(actor);
  updateGround(actor);
  moveMarker(actor);
  if (actor.lod.fullModel) updateFullModel(actor, appliedDelta, playerState);
  if (actor.lod.proxyModel) updateProxy(actor);
}
function applyVisibility(actor) {
  actor.model.visible = actor.lod.fullModel;
  actor.proxy.visible = actor.lod.proxyModel;
  setNpcMarkerState(actor.marker, {
    questVisible: Boolean(actor.profile.questId) && actor.lod.id !== "dormant",
    selected: actor.selected
  });
}
function updateLogicalRoute(actor) {
  const radius = localWanderRadius(actor);
  const phase2 = actor.profile.motionPhase || 0;
  actor.worldX = actor.routeCenterX + Math.cos(actor.elapsed + phase2) * radius;
  actor.worldZ = actor.routeCenterZ + Math.sin((actor.elapsed + phase2) * 0.83) * radius * 0.72;
}
function localWanderRadius(actor) {
  if (actor.isTravelling) return 0;
  const scale2 = DUTY_WANDER_SCALE[actor.activeScheduleAction] ?? 0.52;
  return (actor.profile.wanderRadius || 0) * scale2;
}
function updateFullModel(actor, motionDelta, playerState) {
  const animationDelta = actor.animationCadence.advance(
    motionDelta,
    actor.lod.updateInterval
  );
  if (animationDelta > 0) actor.player.update(animationDelta);
  actor.model.position.set(actor.worldX, actor.worldY, actor.worldZ);
  faceNpcScheduledActor(actor.model, actor, playerState);
}
function updateProxy(actor) {
  actor.proxy.position.set(
    actor.worldX,
    actor.worldY - actor.footOffset,
    actor.worldZ
  );
  faceNpcScheduledActor(actor.proxy, actor, null);
}
function updateGround(actor) {
  actor.worldY = actor.ground.heightAt(actor.worldX, actor.worldZ) + actor.footOffset;
}
function moveMarker(actor) {
  actor.marker.position.set(
    actor.worldX - actor.profile.x,
    actor.worldY - (actor.groundY + actor.footOffset),
    actor.worldZ - actor.profile.z
  );
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/npc/NpcRelevanceCadence.js
var NpcRelevanceCadence = class {
  constructor(id, options = {}) {
    this.phase = Number.isFinite(options.phase) ? clampPhase2(options.phase) : deterministicNpcAnimationPhase(id);
    this.elapsed = 0;
    this.frames = 0;
    this.interval = Infinity;
    this.lastAppliedAt = 0;
    this.minimumFrames = Infinity;
    this.nextAt = Infinity;
    this.nextFrame = Infinity;
    this.updates = 0;
  }
  advance(deltaTime, interval, minimumFrames) {
    this.elapsed += Math.max(0, Number(deltaTime) || 0);
    this.frames += 1;
    if (!Number.isFinite(interval) || !Number.isFinite(minimumFrames)) {
      this.enterDormantState();
      return 0;
    }
    const safeInterval = Math.max(1 / 240, Number(interval) || 0);
    const safeFrames = Math.max(1, Math.floor(Number(minimumFrames) || 1));
    this.applyPolicy(safeInterval, safeFrames);
    if (this.elapsed + 1e-9 < this.nextAt || this.frames < this.nextFrame) return 0;
    const accumulated = Math.max(1e-3, this.elapsed - this.lastAppliedAt);
    this.lastAppliedAt = this.elapsed;
    this.nextAt = this.elapsed + safeInterval;
    this.nextFrame = this.frames + safeFrames;
    this.updates += 1;
    return accumulated;
  }
  stats() {
    return {
      elapsed: this.elapsed,
      frames: this.frames,
      interval: this.interval,
      minimumFrames: this.minimumFrames,
      nextAt: this.nextAt,
      nextFrame: this.nextFrame,
      phase: this.phase,
      updates: this.updates
    };
  }
  applyPolicy(interval, minimumFrames) {
    if (interval === this.interval && minimumFrames === this.minimumFrames) return;
    this.interval = interval;
    this.minimumFrames = minimumFrames;
    this.nextAt = this.elapsed + this.phase * interval;
    this.nextFrame = this.frames + Math.floor(this.phase * minimumFrames);
  }
  enterDormantState() {
    this.interval = Infinity;
    this.minimumFrames = Infinity;
    this.nextAt = Infinity;
    this.nextFrame = Infinity;
    this.lastAppliedAt = this.elapsed;
  }
};
function clampPhase2(value3) {
  return Math.max(0, Math.min(0.999999, Number(value3) || 0));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/NpcChossid.js
var NpcChossid = class {
  constructor(options) {
    this.profile = options.profile;
    this.bus = options.bus;
    this.camera = options.camera;
    this.canvas = options.canvas;
    this.ground = options.ground;
    this.health = 100;
    this.selected = false;
    this.dialogueOpen = false;
    this.lastHit = false;
    this.elapsed = 0;
    this.worldX = this.profile.x;
    this.worldZ = this.profile.z;
    this.routeCenterX = this.profile.x;
    this.routeCenterZ = this.profile.z;
    this.dailyPeriod = null;
    this.currentAction = "arriving";
    this.activeScheduleAction = "arriving";
    this.navigationTarget = this.profile.dailyAnchors?.day?.location || null;
    this.isTravelling = false;
    this.scheduleChanges = 0;
    this.relationshipState = this.profile.relationship?.initial || "neighbor";
    this.lod = resolveNpcLod(Infinity);
    this.animationCadence = new NpcAnimationCadence(this.profile.id);
    this.motionCadence = new NpcRelevanceCadence(`${this.profile.id}:motion`);
    Object.assign(this, createNpcChossidVisual(this.profile, options.gltf, options.ground));
    this.worldY = this.groundY + this.footOffset;
  }
  update(deltaTime, playerState, worldHour) {
    updateNpcChossidMotion(this, deltaTime, playerState, worldHour);
  }
  hitPointer(event) {
    if (this.lod.id === "dormant") return false;
    this.lastHit = npcPointerHits(event, this.camera, this.canvas, this.targetHint());
    return this.lastHit;
  }
  target() {
    this.selected = true;
    this.dialogueOpen = false;
    this.bus.emit("npc:target", this.payload());
  }
  dialogue(mode = "greeting") {
    this.dialogueOpen = true;
    const payload = { ...this.payload(), dialogueMode: mode, dialogueText: this.profile.dialogue?.[mode] || this.profile.dialogue?.greeting };
    this.bus.emit("npc:dialogue", payload);
    this.bus.emit("npc:talk", payload);
    this.bus.emit("quest:event", { count: 1, npcId: this.profile.id, target: this.profile.id, type: "npc:talk" });
    if (this.profile.questId) this.bus.emit("quest:offer", { questId: this.profile.questId });
  }
  setRelationship(state) {
    if (!state || state === this.relationshipState) return false;
    this.relationshipState = state;
    this.bus.emit("npc:relationship", this.payload());
    return true;
  }
  clear() {
    if (!this.selected && !this.dialogueOpen) return;
    this.selected = false;
    this.dialogueOpen = false;
    this.bus.emit("npc:clear", this.payload());
  }
  payload() {
    return {
      currentAction: this.currentAction,
      dialogueModes: this.profile.dialogueModes,
      face: "\u{1F9D4}",
      health: this.health,
      homeId: this.profile.home?.id || null,
      id: this.profile.id,
      level: this.profile.role || "Village resident",
      name: this.profile.name,
      navigationTarget: this.navigationTarget,
      period: this.dailyPeriod,
      questId: this.profile.questId,
      relationship: this.relationshipState,
      role: this.profile.role,
      selected: this.selected,
      torah: this.profile.torah,
      vendor: this.profile.vendor,
      workplaceId: this.profile.workplace?.id || null
    };
  }
  targetHint() {
    return { x: this.worldX, y: this.worldY + 1.35, z: this.worldZ };
  }
  debug() {
    return {
      ...this.payload(),
      animation: this.player.diagnostics(),
      animationCadence: this.animationCadence.stats(),
      dialogueOpen: this.dialogueOpen,
      lastHit: this.lastHit,
      lod: this.lod.id,
      modelSource: "chossid.glb",
      motionCadence: this.motionCadence.stats(),
      position: this.targetHint(),
      scheduleChanges: this.scheduleChanges,
      travelling: this.isTravelling
    };
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/npc/FriendlyNpcWorldClock.js
var DEFAULT_DAY_LENGTH_SECONDS3 = 1440;
var DEFAULT_INITIAL_HOUR = 13;
var FriendlyNpcWorldClock = class {
  constructor(options = {}) {
    this.dayLengthSeconds = positiveNumber(
      options.dayLengthSeconds,
      DEFAULT_DAY_LENGTH_SECONDS3
    );
    this.hour = normalizeFriendlyNpcHour(
      options.initialHour ?? DEFAULT_INITIAL_HOUR
    );
    this.updates = 0;
  }
  /** Advances once for the population and returns the shared normalized hour. */
  update(deltaTime, playerState) {
    this.hour = advanceFriendlyNpcWorldHour(this.hour, deltaTime, {
      dayLengthSeconds: this.dayLengthSeconds,
      playerState
    });
    this.updates += 1;
    return this.hour;
  }
  /** Returns allocation-light diagnostics outside the animation hot path. */
  stats() {
    return {
      dayLengthSeconds: this.dayLengthSeconds,
      hour: this.hour,
      updates: this.updates
    };
  }
};
function positiveNumber(value3, fallback) {
  const parsed = Number(value3);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/npc/FriendlyNpcPopulation.js
var FriendlyNpcPopulation = class {
  constructor(options) {
    this.camera = options.camera;
    this.group = new Group();
    this.group.name = "Awtsmoos_friendly_npc_population";
    this.worldClock = options.worldClock || new FriendlyNpcWorldClock({
      dayLengthSeconds: options.dayLengthSeconds,
      initialHour: options.initialWorldHour
    });
    this.actors = options.profiles.map((profile3, index) => {
      const actor = new NpcChossid({
        bus: options.bus,
        camera: options.camera,
        canvas: options.canvas,
        gltf: options.gltfs[index],
        ground: options.ground,
        profile: profile3
      });
      this.group.add(actor.group);
      return actor;
    });
    this.primary = this.actors.find((actor) => actor.profile.primary) || this.actors[0];
  }
  candidateFromPointer(event) {
    let nearest = null;
    for (const actor of this.actors) {
      if (!actor.hitPointer(event)) continue;
      const distance4 = distanceFromCamera2(actor, this.camera);
      if (!nearest || distance4 < nearest.distance) {
        nearest = { actor, distance: distance4, population: this };
      }
    }
    return nearest;
  }
  activateCandidate(candidate) {
    const actor = candidate.actor;
    for (const current of this.actors) {
      if (current !== actor) current.clear();
    }
    if (actor.selected) actor.dialogue();
    else actor.target();
  }
  update(deltaTime, playerState) {
    const worldHour = this.worldClock.update(deltaTime, playerState);
    for (const actor of this.actors) {
      actor.update(deltaTime, playerState, worldHour);
    }
  }
  clearAll() {
    for (const actor of this.actors) actor.clear();
  }
  stats() {
    const byLod = {};
    for (const actor of this.actors) {
      byLod[actor.lod.id] = (byLod[actor.lod.id] || 0) + 1;
    }
    return {
      actors: this.actors.length,
      byLod,
      clock: this.worldClock.stats(),
      selected: this.actors.find((actor) => actor.selected)?.profile.id || null
    };
  }
  destroy() {
    this.clearAll();
    this.group.parent?.remove(this.group);
  }
};
function distanceFromCamera2(actor, camera) {
  const hint = actor.targetHint();
  const position = camera?.position || { x: 0, y: 0, z: 0 };
  return Math.hypot(hint.x - position.x, hint.y - position.y, hint.z - position.z);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/targeting/WorldTargetCoordinator.js
var WorldTargetCoordinator = class {
  /**
   * @param {object} options - Shared target ownership options.
   * @param {HTMLElement} options.canvas - Renderer canvas.
   * @param {Array<object>} options.populations - Actor populations.
   */
  constructor(options) {
    this.canvas = options.canvas;
    this.populations = options.populations.filter(Boolean);
    this.onPointerDown = (event) => this.selectFromPointer(event);
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
  }
  /** Selects or activates the first actor hit by the shared pointer ray. */
  selectFromPointer(event) {
    const entry = this.entries().find((candidate) => candidate.actor.hitPointer?.(event));
    if (!entry) {
      this.clearAll();
      return false;
    }
    event.preventDefault?.();
    event.stopPropagation?.();
    event.stopImmediatePropagation?.();
    if (entry.actor.selected && typeof entry.actor.dialogue === "function") {
      entry.actor.dialogue();
      return true;
    }
    this.clearAll(entry.actor);
    if (typeof entry.population.selectActor === "function") {
      entry.population.selectActor(entry.actor);
    } else {
      entry.actor.target?.();
    }
    return true;
  }
  /** Returns actor entries while preserving their owning population. */
  entries() {
    return this.populations.flatMap((population) => (population.actors || []).map((actor) => ({ actor, population })));
  }
  /** Clears every selected actor except an optional preserved actor. */
  clearAll(exception = null) {
    for (const { actor } of this.entries()) {
      if (actor === exception || !actor.selected) continue;
      actor.clear?.(true);
    }
    for (const population of this.populations) {
      if (population.selected && population.selected !== exception) {
        population.selected = null;
      }
    }
  }
  /** Removes the one canvas pointer listener. */
  destroy() {
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzConstants.js
var PLAYER_MODEL_URL = "./assets/models/player/chossid.glb";
var SIDE_SIGN = -1;
var FACE_HEIGHT = 1.78;
var MAX_STEP = 0.96;
var STEP_DOWN = 0.72;
var MAX_SLOPE_NORMAL = 0.72;
var WALK_SPEED = 3.7;
var RUN_SPEED = 8.85;
var MAX_RENDER_DPR = 1.5;
var PLAYER_RADIUS = 0.38;
var PLAYER_HEIGHT = 1.72;

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzPlayerStateFactory.js?v=20260720-canonical-valley-pass-04
var PLAYER_SPAWN = VILLAGE_ARRIVAL_PLAYER;
function createEretzPlayerStats() {
  return {
    face: "\u{1F3A9}",
    health: 100,
    level: 1,
    name: "Chossid",
    xp: 0,
    xpMax: 100
  };
}
function createEretzPlayerState(initialY, feet, player, spawn2 = PLAYER_SPAWN) {
  return {
    airPhase: "ground",
    ceilingHit: null,
    clip: "",
    contacts: [],
    faceHeight: FACE_HEIGHT,
    facing: spawn2.facing,
    feet,
    grounded: true,
    jumpClock: 0,
    level: "eretz",
    moving: false,
    normals: [],
    player,
    renderY: initialY,
    runMode: false,
    slopeState: "walk",
    stepState: "flat",
    velY: 0,
    x: spawn2.x,
    y: initialY,
    z: spawn2.z
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzActorFactories.js?v=20260721-shadow-runtime-02
function createEretzDoors(foundation, state) {
  const definitions = [
    tallDoorDef(),
    ...allHouseDoorDefs(foundation.assets, foundation.phaseOneGround)
  ];
  return definitions.map((definition) => {
    const door = new DynamicDoor3D(definition);
    door.setInteractionContext({
      canvas: foundation.canvas,
      getCameraTarget: () => ({
        x: state.x,
        y: state.renderY + state.faceHeight,
        z: state.z
      })
    }).install(foundation.canvas, foundation.camera);
    foundation.scene.add(door.mesh);
    return door;
  });
}
function createEretzNpcPopulation(foundation) {
  const population = new FriendlyNpcPopulation({
    bus: foundation.bus,
    camera: foundation.camera,
    canvas: foundation.canvas,
    gltfs: foundation.npcGltfs,
    ground: foundation.ground,
    ownsPointer: false,
    profiles: foundation.npcProfiles
  });
  foundation.scene.add(population.group);
  return population;
}
function createEretzHostilePopulation(foundation) {
  const population = new HostileNpcPopulation({
    bus: foundation.bus,
    camera: foundation.camera,
    canvas: foundation.canvas,
    ground: foundation.ground,
    ownsPointer: false,
    quality: foundation.qualityProfile?.quality || "high"
  });
  foundation.scene.add(population.group);
  return population;
}
function createEretzTargetCoordinator(foundation, friendlyNpcs, hostileNpcs) {
  return new WorldTargetCoordinator({
    canvas: foundation.canvas,
    populations: [friendlyNpcs, hostileNpcs]
  });
}
function createEretzHorseHerd(foundation) {
  return new HorseHerdSystem(foundation.scene, foundation.ground);
}
function createEretzMover(foundation, playerModel) {
  return new AwtsmoosCollisionMover({
    footOffset: playerModel.footOffset,
    height: PLAYER_HEIGHT,
    octree: foundation.collisionQuery,
    radius: PLAYER_RADIUS
  });
}
function createEretzJumpPhysics(foundation, playerModel) {
  return new JumpPhysics({
    footOffset: playerModel.footOffset,
    ground: foundation.ground,
    maxSlopeNormal: MAX_SLOPE_NORMAL
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzPlayerModel.js
function createPlayerModel(playerGltf, scene) {
  const model = playerGltf.scene;
  model.name = "Awtsmoos_visible_player_isolated_chossid";
  model.visible = true;
  model.scale.set(1.52, 1.52, 1.52);
  model.position.set(0, 0, 4);
  model.setBaseTransform();
  scene.add(model);
  const feet = alignModelFeetToGround(model, 0);
  const footOffset = model.position.y;
  const player = new TinyAnimationPlayer(model, playerGltf.animations || []);
  const clips = createClipMap(playerGltf.animations || []);
  const defaultClip = clips.stand || player.names[0] || "";
  if (defaultClip) {
    player.play(defaultClip);
  }
  model.userData.AwtsmoosCanonicalPlayer = {
    animationCount: player.names.length,
    defaultClip,
    modelSource: "chossid.glb",
    measuredAnimatedIdle: defaultClip === "stand_Armature",
    optionalAnimationsDeferred: true
  };
  return { clips, defaultClip, feet, footOffset, model, player };
}
function createEquipment(model) {
  const materials = /* @__PURE__ */ new Set();
  const meshes = [];
  const visible = {};
  model.traverse((object) => {
    if (!object.isMesh && !object.isSkinnedMesh) return;
    const material = object.material?.name || "material";
    materials.add(material);
    visible[material] = object.visible !== false;
    meshes.push({ name: object.name, material, object });
  });
  return { materials: [...materials], meshes, visible };
}
function placePlayerModel(model, state) {
  model.position.set(state.x, state.renderY, state.z);
  model.quaternion.set(0, Math.sin(state.facing / 2), 0, Math.cos(state.facing / 2));
}
function faceTarget(state) {
  return { x: state.x, y: state.renderY + state.faceHeight, z: state.z };
}
function createClipMap(animations) {
  const clips = animations.map((clip) => ({
    duration: Number(clip.duration || 0),
    name: clip.name || ""
  }));
  const names = clips.map((clip) => clip.name);
  const animated = (expression) => clips.find((clip) => expression.test(clip.name) && clip.duration > 0)?.name;
  const named = (expression) => names.find((name) => expression.test(name));
  const stand = animated(/^stand_Armature$/i) || animated(/^stand 2_Armature$/i) || animated(/stand|idle/i) || named(/neutral/i) || names[0] || "";
  const walk = animated(/walk|step|stroll/i) || stand;
  const run = animated(/run|jog/i) || walk;
  const jump = animated(/jump|leap/i) || stand;
  return {
    fall: animated(/fall|air|drop/i) || jump,
    jump,
    run,
    stand,
    walk
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzPlayerStateFactory.js
var PLAYER_SPAWN2 = VILLAGE_ARRIVAL_PLAYER;

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzActorSystem.js?v=20260720-canonical-valley-pass-04
function createEretzActors(foundation) {
  const playerModel = createPlayerModel(foundation.playerGltf, foundation.scene);
  const initialY = foundation.groundSampler.heightAt(
    PLAYER_SPAWN2.x,
    PLAYER_SPAWN2.z
  ).y + playerModel.footOffset;
  const playerStats = createEretzPlayerStats();
  const state = createEretzPlayerState(
    initialY,
    playerModel.feet,
    playerStats,
    PLAYER_SPAWN2
  );
  const doors = createEretzDoors(foundation, state);
  const friendlyNpcs = createEretzNpcPopulation(foundation);
  const hostileNpcs = createEretzHostilePopulation(foundation);
  const targetCoordinator = createEretzTargetCoordinator(
    foundation,
    friendlyNpcs,
    hostileNpcs
  );
  const horses = createEretzHorseHerd(foundation);
  const npc = friendlyNpcs.primary;
  const lava = new LavaLevel(foundation.scene, foundation.assets);
  const shadows = new SunShadowProjector(foundation.scene);
  const mover = createEretzMover(foundation, playerModel);
  const jumpPhysics = createEretzJumpPhysics(foundation, playerModel);
  const houses = foundation.terrain.worldMetadata.houses || [];
  const worldMode = createWorldMode({
    doors,
    footOffset: playerModel.footOffset,
    foundation,
    friendlyNpcs,
    horses,
    hostileNpcs,
    lava,
    mover,
    state
  });
  const houseVisibility = createHouseVisibilitySystem({
    doors,
    houses,
    root: foundation.terrain.group
  }, state);
  foundation.orbit.setSpatialContext({
    houses,
    stairs: foundation.terrain.worldMetadata.stairLayouts || [],
    state
  });
  return {
    ...foundation,
    ...playerModel,
    doors,
    friendlyNpcs,
    horses,
    hostileNpcs,
    houseVisibility,
    jumpPhysics,
    lava,
    mover,
    npc,
    playerStats,
    shadows,
    state,
    targetCoordinator,
    worldMode
  };
}
function createWorldMode(options) {
  return new WorldModeManager({
    eretzCollision: options.foundation.collisionQuery,
    footOffset: options.footOffset,
    ground: options.foundation.ground,
    lava: options.lava,
    mainGroup: options.foundation.terrain.group,
    mainObjects: [
      options.friendlyNpcs.group,
      options.hostileNpcs.group,
      options.horses.group,
      ...options.doors.map((door) => door.mesh)
    ],
    mover: options.mover,
    state: options.state
  }).rememberMainHeight(options.foundation.terrain.heightAt);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzRuntimeDiagnostics.js
function attachRuntimeDiagnostics(diagnostics3, runtime, movement, localRpg) {
  Object.assign(diagnostics3, {
    actionBar: runtime.actionBar,
    actionBarRuntime: runtime.gameplayUi.actionBar,
    animationDiagnostics: runtime.player.diagnostics(),
    animationNames: runtime.player.names,
    assets: runtime.assets,
    bus: runtime.bus,
    clips: runtime.clips,
    combatActionBar: runtime.combatActionBar,
    combatActionBarState: () => runtime.combatActionBar?.snapshot(),
    door: runtime.doors[0],
    equipment: runtime.equipment,
    forest: runtime.terrain.forest,
    forestStats: runtime.terrain.forest.stats,
    gameplayUi: runtime.gameplayUi,
    gameplayUiState: () => runtime.gameplayUi.snapshot(),
    grassImage: runtime.grassImage,
    ground: runtime.ground,
    groundSampler: runtime.groundSampler,
    hostileDiagnostics: () => runtime.hostileNpcs?.diagnostics?.() || null,
    hostileNpcs: runtime.hostileNpcs,
    houseDoor: runtime.doors[1],
    houseDoors: runtime.doors.slice(1),
    inventoryPanel: runtime.inventoryPanel,
    inventoryStore: runtime.inventoryStore,
    joystick: runtime.joystick,
    jumpButton: runtime.jumpButton,
    lava: runtime.lava,
    lavaStats: runtime.lava.stats(),
    localRpg,
    logVillageLifeDiagnostics: (label) => runtime.villageLifeLogger?.force(runtime, label),
    mainOctree: runtime.mainOctree,
    materialResidencyDiagnostics: () => runtime.materialResidency?.diagnostics?.(),
    model: runtime.model,
    movement,
    mover: runtime.mover,
    npc: runtime.npc,
    npcHud: runtime.npcHud,
    octree: runtime.mover.octree,
    orbit: runtime.orbit,
    performancePolicy: performancePolicy(runtime),
    performanceMonitor: runtime.performanceMonitor,
    performanceMetrics: () => runtime.performanceMonitor?.diagnostics(),
    player: runtime.player,
    playerSource: runtime.playerGltf.scene.userData.isolatedModelLoad,
    runtime,
    shadowStats: runtime.shadows.stats(),
    shadows: runtime.shadows,
    textureGpuDiagnostics: () => runtime.renderer?.textures?.diagnostics?.(),
    villageLifeDiagnostics: () => runtime.villageLifeLogger?.snapshot(),
    worldModels: runtime.worldModels,
    worldModelStats: runtime.worldModels?.stats() || null,
    worldMode: runtime.worldMode,
    worldStats: runtime.worldMode.stats()
  });
  return diagnostics3;
}
function performancePolicy(runtime) {
  return {
    combatHudUpdateMilliseconds: 50,
    forestDrawCalls: runtime.terrain.forest.stats.rendering.drawCalls,
    forestLod: runtime.terrain.forest.stats.mobilePolicy,
    forestWind: runtime.terrain.forest.stats.unsupported.wind,
    hostileActors: runtime.hostileNpcs?.actors?.length || 0,
    importedModelAnimations: runtime.worldModels?.players.length || 0,
    importedModelFailures: runtime.worldModels?.failures.length || 0,
    maxRenderDpr: runtime.terrain.stats.renderDpr,
    minimapPolicy: "movement-threshold-updates",
    roadCollision: "shared-manual-strip",
    staticArchitecture: true,
    structuredVillageLogging: true,
    uiReconstructionPolicy: "state-transitions-only"
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/SceneMaterialResidencyStats.js
function createResidencyStats(state) {
  return {
    active: state.active.size,
    binding: state.binding,
    completed: state.completed,
    concurrency: state.concurrency,
    failed: state.failed.size,
    failures: [...state.failed.entries()].slice(0, 12),
    pendingCandidates: state.candidates.length,
    scanSkipped: state.scanSkipped,
    scanSkips: state.scanSkips,
    sceneRevision: state.revision,
    started: state.startedNow,
    startedTotal: state.startedTotal,
    topCandidates: state.rankedCandidates.slice(0, 8)
  };
}
function residencyStatsSettled(stats3) {
  return stats3.active === 0 && stats3.pendingCandidates === 0 && blockingBindingPending(stats3.binding) === 0;
}
function blockingBindingPending(binding = {}) {
  return Math.max(
    0,
    Number(binding.pending || 0) - Number(binding.mapTransformsPending || 0)
  );
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/SceneMaterialResidencyUrls.js
function rankedSceneUrls2(root) {
  return rankedSceneUrls(root);
}
function sceneMaterialRevision(root) {
  return Number(root?._sceneGraphRevision || 0);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/SceneMaterialResidency.js
var DEFAULT_CONCURRENCY = 3;
var SceneMaterialResidency = class {
  constructor(options = {}) {
    this.active = /* @__PURE__ */ new Map();
    this.cachedImage = options.cachedImage || cachedTextureImage;
    this.completed = 0;
    this.concurrency = options.concurrency || DEFAULT_CONCURRENCY;
    this.failed = /* @__PURE__ */ new Map();
    this.hydrate = options.hydrate || hydrateSceneMaterialImages;
    this.lastStats = null;
    this.loadUrl = options.loadUrl || loadPublicMaterialUrl;
    this.resolved = /* @__PURE__ */ new Set();
    this.scanSkips = 0;
    this.settledRevision = -1;
    this.started = 0;
  }
  update(root) {
    const revision = sceneMaterialRevision(root);
    if (this.canReuseSettled(revision)) return this.reuseSettled(revision);
    const binding = this.hydrate(root, { requestLimit: 0, requestMissing: false });
    const rankedCandidates = this.pendingCandidates(root);
    const candidates2 = [...rankedCandidates];
    let startedNow = 0;
    while (this.active.size < this.concurrency && candidates2.length) {
      this.start(candidates2.shift());
      startedNow += 1;
    }
    const stats3 = createResidencyStats({
      active: this.active,
      binding,
      candidates: candidates2,
      completed: this.completed,
      concurrency: this.concurrency,
      failed: this.failed,
      rankedCandidates,
      revision,
      scanSkipped: false,
      scanSkips: this.scanSkips,
      startedNow,
      startedTotal: this.started
    });
    this.settledRevision = residencyStatsSettled(stats3) ? revision : -1;
    this.lastStats = stats3;
    return stats3;
  }
  retryFailures() {
    const count = this.failed.size;
    this.failed.clear();
    this.settledRevision = -1;
    return count;
  }
  pendingCandidates(root) {
    return rankedSceneUrls2(root).filter((entry) => {
      return !this.active.has(entry.url) && !this.failed.has(entry.url) && !this.resolved.has(entry.url) && !this.cachedImage(entry.url);
    });
  }
  canReuseSettled(revision) {
    return Boolean(this.lastStats) && this.active.size === 0 && this.settledRevision === revision;
  }
  reuseSettled(revision) {
    this.scanSkips += 1;
    this.lastStats = {
      ...this.lastStats,
      scanSkipped: true,
      scanSkips: this.scanSkips,
      sceneRevision: revision,
      started: 0
    };
    return this.lastStats;
  }
  start(entry) {
    this.started += 1;
    const promise = Promise.resolve(this.loadUrl(entry.url)).then((result) => this.finish(entry, result)).catch((error) => this.finish(entry, { error: error?.message || String(error), ok: false })).finally(() => this.active.delete(entry.url));
    this.active.set(entry.url, promise);
  }
  finish(entry, result) {
    if (result?.ok === false || result?.error) {
      this.failed.set(entry.url, { entry, result });
      return result;
    }
    this.completed += 1;
    this.resolved.add(entry.url);
    return result;
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/diagnostics/VillageHydrationSettled.js
function hydrationSettled(hydration) {
  if (!hydration) return false;
  return Number(hydration.active || 0) === 0 && Number(hydration.pendingCandidates || 0) === 0 && blockingBindingPending2(hydration.binding) === 0;
}
function blockingBindingPending2(binding = {}) {
  return Math.max(
    0,
    Number(binding.pending || 0) - Number(binding.mapTransformsPending || 0)
  );
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/diagnostics/VillageLightingDiagnostics.js
var MINIMUM_AMBIENT_LUMINANCE = 0.31;
var MINIMUM_DIFFUSE_FLOOR = 0.36;
function inspectVillageLighting(renderer) {
  const environment = renderer?.environment || {};
  const ambient = vector2(environment.ambient);
  const sunColor = vector2(environment.sunColor);
  const fogColor = vector2(environment.fogColor);
  const exposure = finite(environment.exposure, 0);
  const ambientLuminance = luminance(ambient);
  const sunLuminance = luminance(sunColor);
  const diffuseFloor = ambientLuminance * exposure;
  const warnings = [];
  if (ambientLuminance < MINIMUM_AMBIENT_LUMINANCE) {
    warnings.push("ambient-below-readable-floor");
  }
  if (diffuseFloor < MINIMUM_DIFFUSE_FLOOR) warnings.push("diffuse-floor-too-dark");
  if (sunLuminance < 0.9) warnings.push("sun-below-form-modeling-floor");
  if (exposure < 1.12) warnings.push("exposure-below-material-readable-range");
  if (exposure > 1.42) warnings.push("exposure-above-highlight-safe-range");
  if (!validFog(environment)) warnings.push("invalid-fog-range");
  return {
    ambient,
    ambientLuminance,
    diffuseFloor,
    exposure,
    fogColor,
    fogFar: finite(environment.fogFar, 0),
    fogNear: finite(environment.fogNear, 0),
    readable: warnings.length === 0,
    sunColor,
    sunDirection: vector2(environment.sunDirection),
    sunLuminance,
    warnings
  };
}
function validFog(environment) {
  const near = finite(environment.fogNear, 0);
  const far = finite(environment.fogFar, 0);
  return near >= 0 && far > near;
}
function vector2(value3) {
  return [0, 1, 2].map((index) => finite(value3?.[index], 0));
}
function luminance(color) {
  return color[0] * 0.2126 + color[1] * 0.7152 + color[2] * 0.0722;
}
function finite(value3, fallback) {
  return Number.isFinite(Number(value3)) ? Number(value3) : fallback;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/diagnostics/VillageMaterialDiagnosticHelpers.js
var COTTAGE_PATTERN = /cottage|house|village-district|functional-house|roof/i;
var PHYSICAL_PATTERN = /bridge|cottage|door|foundation|house|market|roof|shul|stone|timber|wall|wood/i;
var EXEMPT_PATTERN = /(?:decal|glyph|icon|label|mask|procedural-text|shadow|sign-card|sun-shadow|text-landmark)/i;
function materialIdentity(object, material) {
  return [
    object.name,
    object.userData?.family,
    object.userData?.part,
    material.name,
    material.texturePolicy?.role
  ].filter(Boolean).join(" ");
}
function materialClassification(identity2, material) {
  const exempt = isDiagnosticExemption(identity2, material);
  return {
    cottage: !exempt && COTTAGE_PATTERN.test(identity2),
    exempt,
    physical: !exempt && (material.texturePolicy?.nativeTexelDensity === true || material.texturePolicy?.originalPixelsOnly === true || PHYSICAL_PATTERN.test(identity2))
  };
}
function usableMaterialImage(image) {
  return Boolean(
    image && image.complete !== false && imageWidth(image) > 0 && imageHeight(image) > 0
  );
}
function nearWhiteMaterial(color = []) {
  return (color[0] ?? 1) > 0.88 && (color[1] ?? 1) > 0.88 && (color[2] ?? 1) > 0.88;
}
function unresolvedMaterialRecord(object, material, url, family) {
  return {
    color: [...material.color || []],
    fallback: material.mapImageFallback === true,
    family,
    material: material.name || "(unnamed-material)",
    mesh: object.name || "(unnamed-mesh)",
    reason: url ? "image-not-ready" : "missing-http-texture-url",
    textureUrl: url || null
  };
}
function emptyMaterialSummary() {
  return {
    cottagePending: 0,
    cottageReady: 0,
    cottageSurfaces: 0,
    exemptSurfaces: 0,
    fallbackMaps: 0,
    materialSlots: 0,
    missingTextureUrls: 0,
    pendingPhysicalMaps: 0,
    physicalSurfaces: 0,
    readyMaps: 0,
    readyMixMaps: 0,
    whiteUntextured: 0
  };
}
function emptyMaterialFamily() {
  return {
    cottagePending: 0,
    cottageReady: 0,
    cottageSurfaces: 0,
    exemptSurfaces: 0,
    materialSlots: 0,
    missingTextureUrls: 0,
    pendingPhysicalMaps: 0,
    physicalSurfaces: 0
  };
}
function isDiagnosticExemption(identity2, material) {
  const url = String(material.textureUrl || material.mapImage?.src || "");
  if (EXEMPT_PATTERN.test(identity2)) return true;
  if (/^data:/i.test(url)) return true;
  return material.texturePolicy?.diagnosticExempt === true;
}
function imageWidth(image) {
  return Number(image?.naturalWidth || image?.videoWidth || image?.width || 0);
}
function imageHeight(image) {
  return Number(image?.naturalHeight || image?.videoHeight || image?.height || 0);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/diagnostics/VillageMaterialReadability.js
var LOWEST_RECORD_LIMIT = 6;
var TEXTURE_SHADOW_FACTOR = 0.62;
function createReadabilityLedger() {
  return { families: /* @__PURE__ */ new Map(), records: [] };
}
function recordMaterialReadability(ledger, identity2, material, lighting, mapReady) {
  if (!lighting) return;
  const family = readabilityFamily(identity2);
  const tintLuminance = colorLuminance(material.color);
  const effectiveFloor = tintLuminance * Number(lighting.diffuseFloor || 0) * (mapReady ? TEXTURE_SHADOW_FACTOR : 1);
  const record = Object.freeze({
    color: Object.freeze([...material.color || [1, 1, 1, 1]]),
    effectiveFloor,
    family,
    identity: String(identity2 || "unnamed-physical-material"),
    mapReady,
    minimum: minimumFor(family),
    tintLuminance
  });
  ledger.records.push(record);
  const records = ledger.families.get(family) || [];
  records.push(record);
  ledger.families.set(family, records);
}
function summarizeMaterialReadability(ledger) {
  const families = {};
  const warnings = [];
  for (const [name, records] of ledger.families.entries()) {
    const ordered = [...records].sort(compareEffectiveFloor);
    const values = ordered.map((record) => record.effectiveFloor);
    const minimum = minimumFor(name);
    const p10 = percentile2(values, 0.1);
    families[name] = Object.freeze({
      count: ordered.length,
      lowest: Object.freeze(ordered.slice(0, LOWEST_RECORD_LIMIT)),
      maximum: values.at(-1) || 0,
      median: percentile2(values, 0.5),
      minimum,
      p10,
      readable: p10 >= minimum
    });
    if (p10 < minimum) warnings.push(`${name}-below-readable-material-floor`);
  }
  return Object.freeze({
    families: Object.freeze(families),
    readable: warnings.length === 0,
    recordCount: ledger.records.length,
    warnings: Object.freeze(warnings)
  });
}
function readabilityFamily(identity2 = "") {
  if (/terrain|meadow|soil|ground|grass/i.test(identity2)) return "terrain";
  if (/roof|slate|shingle|tile/i.test(identity2)) return "roof";
  if (/timber|wood|beam|door|shutter|balcony/i.test(identity2)) return "timber";
  if (/wall|stone|foundation|cottage|house|shul/i.test(identity2)) return "masonry";
  if (/road|path|bridge|cobble|stair/i.test(identity2)) return "infrastructure";
  if (/water|river|lake|stream|waterfall/i.test(identity2)) return "water";
  if (/tree|leaf|forest|flower|bush|reed|moss/i.test(identity2)) return "vegetation";
  return "other-physical";
}
function minimumFor(family) {
  return {
    infrastructure: 0.1,
    masonry: 0.1,
    "other-physical": 0.08,
    roof: 0.075,
    terrain: 0.095,
    timber: 0.065,
    vegetation: 0.06,
    water: 0.055
  }[family] || 0.08;
}
function colorLuminance(color = []) {
  return (color[0] ?? 1) * 0.2126 + (color[1] ?? 1) * 0.7152 + (color[2] ?? 1) * 0.0722;
}
function percentile2(values, fraction) {
  if (!values.length) return 0;
  return values[Math.min(values.length - 1, Math.floor((values.length - 1) * fraction))];
}
function compareEffectiveFloor(left, right) {
  return left.effectiveFloor - right.effectiveFloor;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/diagnostics/VillageMaterialDiagnostics.js
function inspectVillageMaterials(root, lighting = null) {
  const summary = emptyMaterialSummary();
  const families = {};
  const unresolved = [];
  const readabilityLedger = createReadabilityLedger();
  root?.traverse?.((object) => inspectObject(
    object,
    summary,
    families,
    unresolved,
    readabilityLedger,
    lighting
  ));
  return {
    families,
    readability: summarizeMaterialReadability(readabilityLedger),
    summary,
    unresolved: unresolved.slice(0, 60)
  };
}
function inspectObject(object, summary, families, unresolved, ledger, lighting) {
  if (object?.visible === false || !object?.material) return;
  const materials = Array.isArray(object.material) ? object.material : [object.material];
  for (const material of materials) {
    inspectMaterial(
      object,
      material,
      summary,
      families,
      unresolved,
      ledger,
      lighting
    );
  }
}
function inspectMaterial(object, material, summary, families, unresolved, ledger, lighting) {
  const identity2 = materialIdentity(object, material);
  const classification = materialClassification(identity2, material);
  const mapReady = usableMaterialImage(material.mapImage);
  const mixReady = usableMaterialImage(material.mixImage);
  const url = String(material.textureUrl || "");
  const familyName = object.userData?.family || "unclassified";
  const family = families[familyName] || emptyMaterialFamily();
  summary.materialSlots += 1;
  family.materialSlots += 1;
  if (classification.exempt) recordExempt(summary, family);
  if (classification.physical) {
    recordPhysical(summary, family, material, url, mapReady);
    recordMaterialReadability(ledger, identity2, material, lighting, mapReady);
  }
  if (classification.cottage) recordCottage(summary, family, mapReady);
  if (mapReady) summary.readyMaps += 1;
  if (mixReady) summary.readyMixMaps += 1;
  if (material.mapImageFallback === true) summary.fallbackMaps += 1;
  if (classification.physical && !mapReady) {
    unresolved.push(unresolvedMaterialRecord(object, material, url, familyName));
  }
  families[familyName] = family;
}
function recordExempt(summary, family) {
  summary.exemptSurfaces += 1;
  family.exemptSurfaces += 1;
}
function recordPhysical(summary, family, material, url, mapReady) {
  summary.physicalSurfaces += 1;
  family.physicalSurfaces += 1;
  if (!url || !/^https?:\/\//i.test(url)) {
    summary.missingTextureUrls += 1;
    family.missingTextureUrls += 1;
  } else if (!mapReady) {
    summary.pendingPhysicalMaps += 1;
    family.pendingPhysicalMaps += 1;
  }
  if (!mapReady && nearWhiteMaterial(material.color)) {
    summary.whiteUntextured += 1;
  }
}
function recordCottage(summary, family, mapReady) {
  summary.cottageSurfaces += 1;
  family.cottageSurfaces += 1;
  if (mapReady) {
    summary.cottageReady += 1;
    family.cottageReady += 1;
    return;
  }
  summary.cottagePending += 1;
  family.cottagePending += 1;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/diagnostics/VillageLifeRuntimeLogger.js
var HISTORY_LIMIT = 20;
var HEARTBEAT_MS = 1e4;
var VillageLifeRuntimeLogger = class {
  constructor(options = {}) {
    this.console = options.console || globalThis.console;
    this.history = [];
    this.lastKey = "";
    this.lastPublishedAt = -Infinity;
  }
  update(runtime, now2 = performance.now()) {
    const snapshot2 = createSnapshot(runtime, now2, "cadence");
    const key = snapshotKey(snapshot2);
    if (key !== this.lastKey || now2 - this.lastPublishedAt >= HEARTBEAT_MS) {
      this.publish(snapshot2);
      this.lastKey = key;
      this.lastPublishedAt = now2;
    }
    return snapshot2;
  }
  force(runtime, label = "manual-probe") {
    const now2 = globalThis.performance?.now?.() ?? Date.now();
    const snapshot2 = createSnapshot(runtime, now2, label);
    this.publish(snapshot2);
    this.lastKey = snapshotKey(snapshot2);
    this.lastPublishedAt = now2;
    return snapshot2;
  }
  snapshot() {
    return {
      history: this.history.map((entry) => structuredCloneSafe(entry)),
      latest: this.history.at(-1) || null
    };
  }
  publish(snapshot2) {
    this.history.push(snapshot2);
    if (this.history.length > HISTORY_LIMIT) this.history.shift();
    const prefix = 'B"H [MitzvahWorld][VillageLife]';
    this.console?.log?.(prefix, snapshot2);
    if (!snapshot2.lighting.readable) {
      this.console?.warn?.(`${prefix}[LightingGate]`, snapshot2.lighting);
    }
    if (!hydrationSettled(snapshot2.hydration)) return;
    if (snapshot2.materials.summary.cottagePending > 0) {
      this.console?.warn?.(`${prefix}[UnresolvedCottages]`, snapshot2.materials.unresolved);
    }
    if (!snapshot2.materials.readability.readable) {
      this.console?.warn?.(`${prefix}[MaterialReadabilityGate]`, snapshot2.materials.readability);
    }
  }
};
function createSnapshot(runtime, now2, label) {
  const lighting = inspectVillageLighting(runtime.renderer);
  return {
    atMilliseconds: Math.round(now2),
    cache: publicMaterialCacheStats(),
    hydration: runtime.materialHydrationStats || null,
    label,
    lighting,
    materials: inspectVillageMaterials(runtime.scene, lighting),
    performance: runtime.performanceMonitor?.diagnostics?.() || null,
    renderer: runtime.renderer?.stats || null,
    textureGpu: runtime.renderer?.textures?.diagnostics?.() || null
  };
}
function snapshotKey(snapshot2) {
  const materials = snapshot2.materials.summary;
  const hydration = snapshot2.hydration || {};
  const renderer = snapshot2.renderer || {};
  return [
    materials.cottagePending,
    materials.whiteUntextured,
    materials.pendingPhysicalMaps,
    snapshot2.lighting.readable,
    snapshot2.materials.readability.readable,
    hydrationSettled(hydration),
    hydration.active,
    hydration.completed,
    hydration.failed,
    renderer.draws,
    renderer.triangles
  ].join("|");
}
function structuredCloneSafe(value3) {
  try {
    return globalThis.structuredClone ? structuredClone(value3) : JSON.parse(JSON.stringify(value3));
  } catch {
    return value3;
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/performance/RuntimeFrameCostSample.js
var COST_NAMES = Object.freeze([
  "streaming",
  "animation",
  "animationDoors",
  "animationWorldModels",
  "animationNpcs",
  "animationHorses",
  "animationPlayerMatrix",
  "water",
  "gameplay",
  "shadows",
  "camera",
  "render"
]);
var RuntimeFrameCostSample = class {
  constructor(clock = defaultClock) {
    this.clock = clock;
    this.startedAt = clock();
    this.costs = Object.fromEntries(COST_NAMES.map((name) => [name, 0]));
  }
  measure(name, callback) {
    const startedAt = this.clock();
    try {
      return callback();
    } finally {
      this.costs[name] = (this.costs[name] || 0) + this.clock() - startedAt;
    }
  }
  finish() {
    return {
      animationBreakdown: {
        doorsMilliseconds: this.costs.animationDoors,
        horsesMilliseconds: this.costs.animationHorses,
        npcsMilliseconds: this.costs.animationNpcs,
        playerMatrixMilliseconds: this.costs.animationPlayerMatrix,
        worldModelsMilliseconds: this.costs.animationWorldModels
      },
      animationMilliseconds: this.costs.animation,
      cameraMilliseconds: this.costs.camera,
      cpuFrameMilliseconds: this.clock() - this.startedAt,
      gameplayMilliseconds: this.costs.gameplay,
      renderSubmissionMilliseconds: this.costs.render,
      shadowMilliseconds: this.costs.shadows,
      streamingMilliseconds: this.costs.streaming,
      vegetationMilliseconds: null,
      waterMilliseconds: this.costs.water
    };
  }
};
function defaultClock() {
  return performance.now();
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzAnimationMotion.js
function updatePlayerPresentation(runtime, deltaTime) {
  smoothRenderHeight(runtime.state, deltaTime);
  updateAnimation(runtime, deltaTime);
  placePlayerModel(runtime.model, runtime.state);
}
function smoothRenderHeight(state, deltaTime) {
  const factor = state.grounded ? Math.min(1, deltaTime * 12) : 1;
  state.renderY += (state.y - state.renderY) * factor;
}
function updateAnimation(runtime, deltaTime) {
  const { state, clips, player } = runtime;
  const wanted = !state.grounded ? state.airPhase === "jump" ? clips.jump : clips.fall : state.moving ? state.runMode ? clips.run : clips.walk : clips.stand;
  if (state.clip !== wanted) {
    player.play(wanted);
    state.clip = wanted;
  }
  player.update(deltaTime);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzAnimationFrame.js
function updateEretzAnimationFrame(runtime, deltaTime, costs) {
  costs.measure("animationDoors", () => updateDoors(runtime, deltaTime));
  costs.measure("animationWorldModels", () => {
    runtime.worldModels?.update(deltaTime, runtime.state);
  });
  costs.measure("animationNpcs", () => updateNpcs(runtime, deltaTime));
  costs.measure("animationHostiles", () => {
    runtime.hostileNpcs?.update(deltaTime, runtime.state);
  });
  costs.measure("animationHorses", () => {
    runtime.horses?.update(deltaTime);
  });
  costs.measure("animationPlayerPose", () => {
    updatePlayerPresentation(runtime, deltaTime);
  });
  costs.measure("animationPlayerMatrix", () => {
    runtime.model.updateWorldMatrix();
  });
}
function updateDoors(runtime, deltaTime) {
  for (const door of runtime.doors) {
    door.update(deltaTime);
  }
}
function updateNpcs(runtime, deltaTime) {
  if (runtime.friendlyNpcs) {
    runtime.friendlyNpcs.update(deltaTime, runtime.state);
    return;
  }
  runtime.npc.update(deltaTime, runtime.state);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzMovementInput.js
var KEYBOARD_LOOK_SPEED = 2.85;
function movementDelta(runtime, deltaTime) {
  const axis = runtime.input.axis();
  applyViewRotation(runtime, axis, deltaTime);
  const joystick = runtime.joystick.vector;
  const facingYaw = movementFacing(runtime);
  const facing = playerFacing(facingYaw);
  const right = { x: Math.cos(facingYaw), z: -Math.sin(facingYaw) };
  const forwardAmount = -(axis.y + joystick.y * joystick.magnitude);
  const sideAmount = movementSideSign(runtime) * (axis.x + joystick.x * joystick.magnitude);
  let x = right.x * sideAmount + facing.x * forwardAmount;
  let z = right.z * sideAmount + facing.z * forwardAmount;
  const length2 = Math.hypot(x, z);
  if (length2 <= 0.05) {
    return null;
  }
  x /= length2;
  z /= length2;
  runtime.state.facing = facingYaw;
  const speed = runtime.state.runMode ? RUN_SPEED : WALK_SPEED;
  return {
    x: x * deltaTime * speed,
    z: z * deltaTime * speed
  };
}
function stepStateFor(state, target, difference) {
  if (state.grounded && target.normal.y < MAX_SLOPE_NORMAL && difference > 0.015) {
    return "too-steep";
  }
  if (state.grounded && difference > 0.02 && difference <= MAX_STEP) {
    return "up";
  }
  if (state.grounded && difference < -0.02 && difference >= -STEP_DOWN) {
    return "down";
  }
  if (state.grounded && difference < -STEP_DOWN) {
    return "ledge";
  }
  return "flat";
}
function applyViewRotation(runtime, axis, deltaTime) {
  const keyboardLook = axis.turn * KEYBOARD_LOOK_SPEED * deltaTime;
  if (keyboardLook) {
    runtime.orbit.yaw += keyboardLook;
  }
  if (!runtime.orbit.isFirstPerson?.()) {
    applyLegacyPlayerRotation(runtime, axis, deltaTime);
  }
}
function applyLegacyPlayerRotation(runtime, axis, deltaTime) {
  const pointer = runtime.input.pointer || {};
  const rightDragTurn = pointer.right && !pointer.bothMain ? -(pointer.movementX || 0) * 7e-3 : 0;
  const keyboardTurn = axis.turn * KEYBOARD_LOOK_SPEED * deltaTime;
  if (keyboardTurn || rightDragTurn) {
    runtime.state.facing += keyboardTurn + rightDragTurn;
  }
  if (pointer.bothMain) {
    runtime.state.facing = runtime.orbit.yaw;
  }
}
function movementFacing(runtime) {
  return runtime.orbit.isFirstPerson?.() ? runtime.orbit.yaw : runtime.state.facing;
}
function movementSideSign(runtime) {
  return runtime.orbit.isFirstPerson?.() ? 1 : SIDE_SIGN;
}
function playerFacing(yaw) {
  return { x: Math.sin(yaw), z: Math.cos(yaw) };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/collision/StepUpResolver.js
function findWalkableStep({
  ground,
  position,
  delta,
  footOffset,
  radius,
  maxStep,
  maxSlopeNormal
}) {
  const distance4 = Math.hypot(delta.x, delta.z);
  if (distance4 < 1e-4) {
    return null;
  }
  const direction = {
    x: delta.x / distance4,
    z: delta.z / distance4
  };
  const feetY = position.y - footOffset;
  const target = {
    x: position.x + delta.x,
    z: position.z + delta.z
  };
  const probes = [
    {
      x: target.x + direction.x * radius * 0.82,
      z: target.z + direction.z * radius * 0.82
    },
    target
  ];
  for (const probe of probes) {
    const sample2 = ground.sample(probe.x, probe.z, {
      maxY: feetY + maxStep + 0.025
    });
    const rise = sample2.height - feetY;
    if (sample2.normal.y < maxSlopeNormal) {
      continue;
    }
    if (rise < -maxStep - 0.02 || rise > maxStep + 0.02) {
      continue;
    }
    return { ...sample2, rise, probe };
  }
  return null;
}
function applyWalkableStep(position, sample2, footOffset) {
  if (!sample2) {
    return false;
  }
  position.y = sample2.height + footOffset;
  return true;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzCollisionMotion.js
function updateHorizontalMotion(runtime, deltaTime) {
  const delta = movementDelta(runtime, deltaTime);
  const state = runtime.state;
  state.moving = !!delta;
  if (!delta) {
    return;
  }
  const oldPosition = { x: state.x, y: state.y, z: state.z };
  const step2 = findWalkableStep({
    ground: runtime.ground,
    position: state,
    delta,
    footOffset: runtime.footOffset,
    radius: PLAYER_RADIUS,
    maxStep: MAX_STEP,
    maxSlopeNormal: MAX_SLOPE_NORMAL
  });
  state.stepState = stepStateFor(state, step2 || fallbackGround(runtime, delta), step2?.rise ?? 0);
  applyWalkableStep(state, step2, runtime.footOffset);
  runtime.mover.move(state, delta, wallOptions(runtime, MAX_STEP, true));
  if (headBlocked(runtime)) {
    Object.assign(state, oldPosition, { stepState: "head-block" });
  }
  snapToWalkableGround(runtime);
  state.contacts = [...new Set([
    ...runtime.mover.lastContacts,
    state.ceilingHit
  ].filter(Boolean))].slice(0, 8);
  state.normals = runtime.mover.lastNormals.slice(-4);
}
function wallOptions(runtime, stepHeight, blockSteepFloors) {
  const state = runtime.state;
  return {
    grounded: state.grounded,
    maxStepHeight: stepHeight,
    floorY: state.y - runtime.footOffset,
    maxSlopeNormal: MAX_SLOPE_NORMAL,
    blockSteepFloors,
    dynamicColliders: state.level === "eretz" ? runtime.doors.flatMap((door) => door.activeColliders()) : []
  };
}
function resolveCeiling(runtime) {
  const state = runtime.state;
  state.ceilingHit = null;
  if (state.velY <= 0 && state.grounded) {
    return;
  }
  const collision = runtime.mover.resolveCeiling(
    state,
    wallOptions(runtime, MAX_STEP, true)
  );
  if (!collision.hit) {
    return;
  }
  state.ceilingHit = collision.kind;
  state.velY = Math.min(state.velY, -1.45);
  state.grounded = false;
  state.airPhase = "fall";
}
function fallbackGround(runtime, delta) {
  const feetY = runtime.state.y - runtime.footOffset;
  return runtime.ground.sample(
    runtime.state.x + delta.x,
    runtime.state.z + delta.z,
    { maxY: feetY + MAX_STEP + 0.025 }
  );
}
function headBlocked(runtime) {
  if (!runtime.state.grounded) {
    return false;
  }
  const hit = runtime.mover.ceilingHit(
    runtime.state,
    wallOptions(runtime, MAX_STEP, true)
  );
  runtime.state.ceilingHit = hit?.kind || null;
  return !!hit;
}
function snapToWalkableGround(runtime) {
  const state = runtime.state;
  const feetY = state.y - runtime.footOffset;
  const landed = runtime.ground.sample(state.x, state.z, {
    maxY: feetY + MAX_STEP + 0.025
  });
  const floorY = landed.height + runtime.footOffset;
  if (state.grounded && Math.abs(floorY - state.y) <= MAX_STEP + 0.02 && landed.normal.y >= MAX_SLOPE_NORMAL) {
    state.y = floorY;
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzMovementController.js
var EretzMovementController = class {
  constructor(runtime) {
    this.runtime = runtime;
  }
  update(deltaTime) {
    updateHorizontalMotion(this.runtime, deltaTime);
    const physics = this.runtime.jumpPhysics.update(
      this.runtime.state,
      deltaTime,
      this.runtime.jumpButton.consume()
    );
    if (physics.slide) {
      this.runtime.mover.move(
        this.runtime.state,
        physics.slide,
        wallOptions(this.runtime, 0.1, false)
      );
    }
    resolveCeiling(this.runtime);
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzStatusHud.js
function refreshStatusHud(runtime) {
  runtime.npcHud.updatePlayer(runtime.playerStats);
  if (!runtime.hud) {
    return;
  }
  runtime.hud.textContent = [
    'B"H 3D chossid',
    runtime.state.clip,
    runtime.state.level,
    `doors ${runtime.doors.map((door) => door.state).join("/")}`,
    `camera ${runtime.orbit.currentDistance.toFixed(1)}m`,
    `camera-hit ${runtime.orbit.stats.hitKind || "clear"}`,
    `draws ${runtime.renderer.stats.draws || 0}`,
    `static-save ${runtime.renderer.stats.staticBatch?.savedDraws || 0}`,
    `chossid-save ${runtime.assets.importedModelMaterials?.player?.consolidation?.savedDraws || 0}`,
    `x ${runtime.state.x.toFixed(1)}`,
    `z ${runtime.state.z.toFixed(1)}`
  ].join(" \u2022 ");
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/RuntimeCadence.js
var RUNTIME_CADENCE_INTERVALS = Object.freeze({
  chunks: 100,
  combatHud: 50,
  diagnostics: 500,
  houseVisibility: 125,
  hud: 125,
  lod: 100,
  materialHydration: 1e3,
  minimap: 125,
  multiplayer: 100,
  performance: 500,
  villageLifeLogs: 2500
});
var RuntimeCadence = class {
  constructor(options = {}) {
    const intervals = options?.intervals || options || {};
    this.intervals = {
      ...RUNTIME_CADENCE_INTERVALS,
      ...intervals
    };
    this.previous = /* @__PURE__ */ new Map();
  }
  /** Returns true exactly when one named service is due. */
  due(name, nowMilliseconds) {
    const interval = Math.max(0, Number(this.intervals[name]) || 0);
    const previous = this.previous.get(name);
    if (previous == null || nowMilliseconds - previous >= interval) {
      this.previous.set(name, nowMilliseconds);
      return true;
    }
    return false;
  }
  reset(name = null) {
    if (name == null) {
      this.previous.clear();
      return;
    }
    this.previous.delete(name);
  }
  snapshot() {
    return {
      intervals: { ...this.intervals },
      previous: Object.fromEntries(this.previous)
    };
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/WorldForestInspection.js
function inspectForestTree(runtime, presetName) {
  const summary = runtime.terrain.stats.forestStats?.treeSummaries?.find(
    (entry) => entry.preset === presetName
  );
  if (!summary) {
    return null;
  }
  const colliderKinds = runtime.terrain.colliders.filter((triangle2) => triangle2.kind?.startsWith(`forest:${presetName}:`)).reduce((counts, triangle2) => {
    counts[triangle2.kind] = (counts[triangle2.kind] || 0) + 1;
    return counts;
  }, {});
  return {
    summary,
    meshStats: runtime.terrain.stats.forestStats?.mergedMeshes,
    geometry: runtime.terrain.stats.forestStats?.rendering,
    groupedColliders: colliderKinds
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/WorldStairSummary.js
function summarizeWorldStairs(items, octreeTriangles) {
  const kindEntries = items.map((item2) => `${item2.houseId}:${item2.kind}`);
  const exactCollisionKinds = kindEntries.map((kind) => `stair:${kind}`);
  const expectedCollisionTriangles = sum(items, "collisionTriangles");
  const totalCollisionTriangles = octreeTriangles.filter(
    (triangle2) => triangle2.kind?.startsWith("stair:")
  ).length;
  const matchedCollisionTriangles = octreeTriangles.filter(
    (triangle2) => exactCollisionKinds.includes(triangle2.kind)
  ).length;
  return {
    count: items.length,
    kinds: kindEntries,
    countsByKind: countByKind(items),
    exactCollisionKinds,
    expectedCollisionTriangles,
    totalCollisionTriangles,
    matchedCollisionTriangles,
    unmatchedCollisionTriangles: totalCollisionTriangles - matchedCollisionTriangles,
    minimumLength: measure(items, "length", Math.min),
    maximumLength: measure(items, "length", Math.max),
    minimumWidth: measure(items, "width", Math.min),
    maximumWidth: measure(items, "width", Math.max),
    minimumRise: measure(items, "totalRise", Math.min),
    maximumRise: measure(items, "totalRise", Math.max),
    minimumSteps: measure(items, "stepCount", Math.min),
    maximumSteps: measure(items, "stepCount", Math.max),
    averageStepRise: average2(items, "stepRise"),
    averageStepRun: average2(items, "stepRun"),
    totalSteps: sum(items, "stepCount")
  };
}
function countByKind(items) {
  const counts = {};
  for (const item2 of items) {
    counts[item2.kind] = (counts[item2.kind] || 0) + 1;
  }
  return counts;
}
function measure(items, key, operation) {
  if (!items.length) {
    return 0;
  }
  return operation(...items.map((item2) => item2[key]));
}
function average2(items, key) {
  return items.length ? sum(items, key) / items.length : 0;
}
function sum(items, key) {
  return items.reduce((total, item2) => total + (item2[key] || 0), 0);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/WorldDiagnostics.js
function installWorldDiagnostics(runtime) {
  const stairLayouts = runtime.terrain.worldMetadata.stairLayouts || [];
  const octreeTriangles = runtime.mainOctree.all();
  const api = {
    chunkStats: runtime.chunkRuntime?.diagnostics() || null,
    forestStats: runtime.terrain.stats.forestStats,
    inspectForestTree: (presetName) => inspectForestTree(runtime, presetName),
    inspectStair: (index = 0) => inspectStair(
      stairLayouts,
      octreeTriangles,
      index
    ),
    inspectWorldHierarchy: () => inspectWorldHierarchy(
      runtime,
      stairLayouts,
      octreeTriangles
    ),
    materialDiagnostics: runtime.terrain.materialDiagnostics,
    performance: runtime.performanceMonitor?.diagnostics() || null,
    rendererStats: runtime.renderer.stats,
    stairStats: summarizeWorldStairs(stairLayouts, octreeTriangles),
    state: runtime.state,
    terrainStats: runtime.terrain.stats,
    worldStats: runtime.terrain.worldMetadata
  };
  window.Awtsmoos = api;
  return api;
}
function refreshWorldDiagnostics(api, runtime) {
  api.chunkStats = runtime.chunkRuntime?.diagnostics() || null;
  api.performance = runtime.performanceMonitor?.diagnostics() || null;
  api.rendererStats = runtime.renderer.stats;
  api.state = runtime.state;
}
function inspectWorldHierarchy(runtime, stairLayouts, octreeTriangles) {
  return {
    collisionTriangles: octreeTriangles.length,
    houses: runtime.terrain.worldMetadata.houses || [],
    octreeBounds: runtime.mainOctree.bounds.toJSON(),
    stairs: stairLayouts,
    terrain: runtime.terrain.group
  };
}
function inspectStair(stairLayouts, octreeTriangles, index) {
  const layout = stairLayouts[index] || null;
  const collisionKind = layout ? `stair:${layout.houseId}:${layout.kind}` : null;
  return {
    collisionKind,
    collisionTriangles: collisionKind ? octreeTriangles.filter((triangle2) => triangle2.kind === collisionKind).length : 0,
    layout
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzRuntimeLoop.js
function startEretzRuntime(runtime, diagnostics3) {
  const movement = new EretzMovementController(runtime);
  const cadence = new RuntimeCadence();
  const residency = new SceneMaterialResidency({ concurrency: 3, timeoutMs: 3e4 });
  const villageLifeLogger = new VillageLifeRuntimeLogger();
  let lastTime = performance.now();
  const frame = (now2) => {
    const intervalMilliseconds = Math.max(0.1, now2 - lastTime);
    const deltaTime = frameDelta(intervalMilliseconds);
    const costs = new RuntimeFrameCostSample();
    lastTime = now2;
    try {
      costs.measure("streaming", () => updateStreaming(runtime, cadence, residency, now2));
      costs.measure("gameplay", () => updateGameplay(runtime, movement, cadence, deltaTime, now2));
      costs.measure("animation", () => updateEretzAnimationFrame(runtime, deltaTime, costs));
      costs.measure("water", () => runtime.lava.update(
        runtime.state,
        runtime.ground,
        runtime.footOffset
      ));
      costs.measure("shadows", () => updateShadows(runtime));
      costs.measure("camera", () => runtime.orbit.apply(
        runtime.camera,
        faceTarget(runtime.state),
        runtime.mover.octree,
        deltaTime
      ));
      costs.measure("render", () => renderWorld(runtime, now2));
      if (cadence.due("combatHud", now2)) runtime.combatActionBar?.update(now2);
      if (cadence.due("hud", now2)) refreshStatusHud(runtime);
      if (cadence.due("diagnostics", now2)) refreshWorldDiagnostics(diagnostics3, runtime);
      if (cadence.due("villageLifeLogs", now2)) villageLifeLogger.update(runtime, now2);
    } catch (error) {
      window.AwtsmoosError = error?.stack || String(error);
    } finally {
      runtime.performanceMonitor?.record(intervalMilliseconds, now2, costs.finish());
      requestAnimationFrame(frame);
    }
  };
  runtime.runtimeCadence = cadence;
  runtime.materialResidency = residency;
  runtime.villageLifeLogger = villageLifeLogger;
  requestAnimationFrame(frame);
  return movement;
}
function updateStreaming(runtime, cadence, residency, now2) {
  if (cadence.due("chunks", now2)) runtime.chunkRuntime?.update({ at: now2 });
  if (!cadence.due("materialHydration", now2)) return;
  runtime.materialHydrationStats = residency.update(runtime.scene);
}
function updateGameplay(runtime, movement, cadence, deltaTime, now2) {
  movement.update(deltaTime);
  runtime.gameplayUi?.actionBar.update(now2);
  runtime.multiplayerBridge?.update(deltaTime, runtime.state, now2);
  if (cadence.due("minimap", now2)) runtime.gameplayUi?.updatePosition(runtime.state);
  if (cadence.due("houseVisibility", now2)) runtime.houseVisibility.update(runtime.state);
}
function updateShadows(runtime) {
  runtime.shadows.update({
    ground: runtime.ground,
    npc: runtime.npc,
    state: runtime.state,
    worldMode: runtime.worldMode
  });
}
function renderWorld(runtime, now2) {
  runtime.renderer.setInteractor(runtime.state, now2 / 1e3);
  runtime.renderer.render(runtime.scene, runtime.camera);
}
function frameDelta(intervalMilliseconds) {
  return Math.min(0.05, Math.max(1e-3, intervalMilliseconds / 1e3));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryCatalog.js
var INVENTORY_CATALOG = Object.freeze({
  "forest-axe": item("forest-axe", "Forest Axe", "\u{1FA93}", "tool", "tool", ["equip", "inspect"], stats(5, 0, 2), 45, "axe-small"),
  "wooden-staff": item("wooden-staff", "Wooden Staff", "\u{1FA84}", "weapon", "hand", ["equip", "inspect"], stats(18, 2, 4), 32, "wooden-staff"),
  "spark-blade": item("spark-blade", "Spark Blade", "\u2694\uFE0F", "weapon", "hand", ["equip", "inspect"], stats(26, 4, 1), 110, "sword"),
  "village-shield": item("village-shield", "Village Shield", "\u{1F6E1}\uFE0F", "shield", "offhand", ["equip", "inspect"], stats(0, 10, 0), 75, "shield"),
  "chalaf": item("chalaf", "Chalaf", "\u{1F52A}", "tool", "tool", ["equip", "inspect"], stats(8, 0, 1), 40, null),
  "siddur": item("siddur", "Siddur", "\u{1F4D6}", "book", "book", ["open", "pin", "inspect"], stats(0, 4, 5), 10, "book"),
  "chumash-light": item("chumash-light", "Chumash of Light", "\u{1F4DA}", "book", "book", ["open", "pin", "inspect"], stats(0, 7, 8), 55, "book"),
  "tanya-pocket": item("tanya-pocket", "Pocket Tanya", "\u{1F4D5}", "book", "book", ["open", "pin", "inspect"], stats(0, 8, 6), 65, "book"),
  "quest-scroll": item("quest-scroll", "Shlichus Scroll", "\u{1F4DC}", "quest", null, ["open", "pin", "inspect"], stats(0, 0, 0), null, "scroll"),
  "lost-scroll": item("lost-scroll", "Lost Stream Scroll", "\u{1F4DC}", "quest", null, ["inspect"], stats(0, 0, 0), null, "scroll"),
  "wood-log": item("wood-log", "Fallen Wood", "\u{1FAB5}", "material", null, ["inspect", "drop"], stats(0, 0, 0), 4, null, 20),
  "cottage-flower": item("cottage-flower", "Cottage Flower", "\u{1F338}", "material", null, ["inspect", "drop"], stats(0, 0, 0), 3, null, 24),
  "wool-thread": item("wool-thread", "Wool Thread", "\u{1F9F6}", "material", null, ["inspect", "drop"], stats(0, 0, 0), 8, null, 20),
  "prepared-hide": item("prepared-hide", "Prepared Hide", "\u{1F7EB}", "material", null, ["inspect", "drop"], stats(0, 0, 0), 6, null, 20),
  "community-badge": item("community-badge", "Community Badge", "\u{1F3C5}", "accessory", "accessory", ["equip", "inspect"], stats(0, 4, 3), 25, null),
  "black-coat": item("black-coat", "Black Shabbos Coat", "\u{1F9E5}", "clothing", "coat", ["equip", "inspect"], stats(0, 6, 2), 80, null),
  "wool-kippah": item("wool-kippah", "Wool Kippah", "\u26AB", "clothing", "head", ["equip", "inspect"], stats(0, 3, 3), 25, null),
  "walking-boots": item("walking-boots", "Walking Boots", "\u{1F97E}", "clothing", "feet", ["equip", "inspect"], stats(0, 2, 1), 42, null),
  "chest-key": item("chest-key", "Old Chest Key", "\u{1F5DD}\uFE0F", "quest", null, ["inspect"], stats(0, 0, 0), null, null),
  "perutas": item("perutas", "Perutas", "\u{1FA99}", "currency", null, ["inspect"], stats(0, 0, 0), null, null, 9999)
});
var STARTER_INVENTORY = Object.freeze([
  stack("perutas", 120),
  stack("siddur", 1),
  stack("wooden-staff", 1),
  stack("chalaf", 1),
  stack("quest-scroll", 1),
  stack("black-coat", 1)
]);
function inventoryDefinition(itemId) {
  return INVENTORY_CATALOG[itemId] || null;
}
function item(id, name, icon, category, slot, actions, statValue, price, modelId, stackLimit = 1) {
  return Object.freeze({ actions: Object.freeze(actions), category, description: descriptionFor(name, category), icon, id, modelId, name, price, slot, stackLimit, stats: Object.freeze(statValue) });
}
function stats(damage, defense, focus) {
  return { damage, defense, focus };
}
function stack(itemId, quantity2) {
  return Object.freeze({ itemId, quantity: quantity2 });
}
function descriptionFor(name, category) {
  return `${name} is a ${category} vessel with server-owned effects in shared worlds.`;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryStoreRules.js
function addInventoryItem(items, itemId, quantity2, definition) {
  const existing = items.find((item2) => item2.itemId === itemId);
  if (existing) {
    existing.quantity = Math.min(
      definition.stackLimit,
      existing.quantity + quantity2
    );
    return;
  }
  items.push({
    itemId,
    quantity: Math.min(definition.stackLimit, quantity2)
  });
}
function removeInventoryItem(items, itemId, quantity2) {
  const existing = items.find((item2) => item2.itemId === itemId);
  if (!existing || existing.quantity < quantity2) {
    throw new Error("INSUFFICIENT_ITEM_QUANTITY");
  }
  existing.quantity -= quantity2;
  if (existing.quantity > 0) return items;
  return items.filter((item2) => item2 !== existing);
}
function derivedInventoryStats(equipment) {
  const total = { damage: 0, defense: 0, focus: 20 };
  for (const itemId of Object.values(equipment)) {
    const stats3 = INVENTORY_CATALOG[itemId]?.stats;
    if (!stats3) continue;
    total.damage += stats3.damage;
    total.defense += stats3.defense;
    total.focus += stats3.focus;
  }
  return total;
}
function togglePinnedValue(values, id, maximum, label) {
  if (values.includes(id)) return values.filter((value3) => value3 !== id);
  if (values.length >= maximum) {
    throw new Error(`Only ${maximum} ${label} may be pinned.`);
  }
  return [...values, id];
}
function inventorySnapshot(store) {
  return structuredClone({
    equipment: store.equipment,
    items: store.items.map((stack2) => ({
      ...stack2,
      definition: INVENTORY_CATALOG[stack2.itemId]
    })),
    lastUsedAt: store.lastUsedAt,
    learned: store.learned,
    pinnedBooks: store.pinnedBooks,
    pinnedPassages: store.pinnedPassages,
    stats: derivedInventoryStats(store.equipment)
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryLearningRules.js
function learnInventoryPassage(store, passageId) {
  if (!torahPassage(passageId)) throw new Error("UNKNOWN_TORAH_PASSAGE");
  if (!store.learned.includes(passageId)) store.learned.push(passageId);
}
function toggleInventoryPassage(store, passageId) {
  if (!store.learned.includes(passageId)) throw new Error("PASSAGE_NOT_LEARNED");
  store.pinnedPassages = togglePinnedValue(
    store.pinnedPassages,
    passageId,
    5,
    "passages"
  );
}
function toggleInventoryBook(store, bookId) {
  store.pinnedBooks = togglePinnedValue(
    store.pinnedBooks,
    bookId,
    3,
    "books"
  );
}
function markInventoryPassageUsed(store, passageId, at) {
  if (!torahPassage(passageId)) throw new Error("UNKNOWN_TORAH_PASSAGE");
  store.lastUsedAt[passageId] = at;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryPersistenceRules.js
function serializableInventoryState(store) {
  return structuredClone({
    equipment: store.equipment,
    items: store.items,
    lastUsedAt: store.lastUsedAt,
    learned: store.learned,
    pinnedBooks: store.pinnedBooks,
    pinnedPassages: store.pinnedPassages
  });
}
function restoreInventoryState(store, saved = {}) {
  store.items = validStacks(saved.items);
  store.equipment = validEquipment(saved.equipment, store.items);
  store.learned = unique(saved.learned).filter((id) => torahPassage(id));
  store.pinnedBooks = unique(saved.pinnedBooks).filter((id) => torahBook(id)).slice(0, 3);
  store.pinnedPassages = unique(saved.pinnedPassages).filter((id) => store.learned.includes(id)).slice(0, 5);
  store.lastUsedAt = validUsage(saved.lastUsedAt);
}
function validStacks(stacks) {
  const quantities = /* @__PURE__ */ new Map();
  for (const stack2 of stacks || []) {
    const definition = inventoryDefinition(stack2?.itemId);
    if (!definition) continue;
    const quantity2 = Math.max(0, Math.trunc(Number(stack2.quantity) || 0));
    if (!quantity2) continue;
    quantities.set(stack2.itemId, Math.min(definition.stackLimit, quantity2));
  }
  return [...quantities].map(([itemId, quantity2]) => ({ itemId, quantity: quantity2 }));
}
function validEquipment(equipment, items) {
  const owned = new Set(items.map((item2) => item2.itemId));
  const result = {};
  for (const [slot, itemId] of Object.entries(equipment || {})) {
    const definition = inventoryDefinition(itemId);
    if (definition?.slot === slot && owned.has(itemId)) result[slot] = itemId;
  }
  return result;
}
function validUsage(lastUsedAt) {
  const result = {};
  for (const [passageId, value3] of Object.entries(lastUsedAt || {})) {
    const at = Number(value3);
    if (torahPassage(passageId) && Number.isFinite(at) && at >= 0) result[passageId] = at;
  }
  return result;
}
function unique(values) {
  return [...new Set(Array.isArray(values) ? values : [])];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/InventoryStore.js
var InventoryStore = class {
  constructor(options = {}) {
    this.items = structuredClone(options.items || STARTER_INVENTORY);
    this.equipment = { ...options.equipment || DEFAULT_EQUIPMENT };
    this.learned = [...options.learned || ["modeh-ani"]];
    this.pinnedBooks = [...options.pinnedBooks || ["siddur"]];
    this.pinnedPassages = [...options.pinnedPassages || ["modeh-ani"]];
    this.lastUsedAt = { ...options.lastUsedAt || {} };
    this.listeners = /* @__PURE__ */ new Set();
  }
  onChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  add(itemId, quantity2 = 1) {
    addInventoryItem(this.items, itemId, quantity2, requireItem(itemId));
    return this.publish();
  }
  remove(itemId, quantity2 = 1) {
    this.items = removeInventoryItem(this.items, itemId, quantity2);
    for (const [slot, equippedId] of Object.entries(this.equipment)) {
      if (equippedId === itemId && !this.owns(itemId)) delete this.equipment[slot];
    }
    return this.publish();
  }
  buy(itemId, quantity2 = 1) {
    const definition = requireItem(itemId);
    if (!Number.isFinite(definition.price)) throw new Error("ITEM_NOT_FOR_SALE");
    this.remove("perutas", definition.price * quantity2);
    this.add(itemId, quantity2);
    return this.snapshot();
  }
  equip(itemId) {
    const definition = requireItem(itemId);
    if (!this.owns(itemId)) throw new Error("ITEM_NOT_OWNED");
    if (!definition.slot) throw new Error("ITEM_NOT_EQUIPPABLE");
    this.equipment[definition.slot] = itemId;
    return this.publish();
  }
  unequip(slot) {
    delete this.equipment[slot];
    return this.publish();
  }
  learn(passageId) {
    learnInventoryPassage(this, passageId);
    return this.publish();
  }
  togglePassagePin(passageId) {
    toggleInventoryPassage(this, passageId);
    return this.publish();
  }
  toggleBookPin(bookId) {
    toggleInventoryBook(this, bookId);
    return this.publish();
  }
  markPassageUsed(passageId, at = Date.now()) {
    markInventoryPassageUsed(this, passageId, at);
    return this.publish();
  }
  owns(itemId) {
    return Boolean(this.items.find((item2) => item2.itemId === itemId && item2.quantity > 0));
  }
  restore(saved) {
    restoreInventoryState(this, saved);
    return this.publish();
  }
  serializableState() {
    return serializableInventoryState(this);
  }
  snapshot() {
    return inventorySnapshot(this);
  }
  publish() {
    const snapshot2 = this.snapshot();
    for (const listener of this.listeners) listener(snapshot2);
    return snapshot2;
  }
};
function requireItem(itemId) {
  const definition = inventoryDefinition(itemId);
  if (!definition) throw new Error(`Unknown inventory item: ${itemId}`);
  return definition;
}
var DEFAULT_EQUIPMENT = Object.freeze({
  coat: "black-coat",
  hand: "wooden-staff",
  tool: "chalaf"
});

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/ActionBar.js
var ACTIONS = Object.freeze([
  action("bag", "\u{1F392}", "Bag", "inventory:toggle", "i"),
  action("quests", "\u{1F4DC}", "Shlichus", "questlog:toggle", "q"),
  action("torah", "\u{1F4DA}", "Sefarim", "torah:toggle", "b"),
  action("profile", "\u{1F31F}", "Profile", "profile:toggle", "p"),
  action("vendor", "\u{1F3EA}", "Market", "vendor:toggle", "v"),
  action("map", "\u{1F5FA}\uFE0F", "Map", "map:toggle", "m")
]);
var ActionBar = class {
  constructor(host, bus, state) {
    this.host = host || makeHost();
    this.bus = bus;
    this.state = state;
    this.unsubscribers = [];
    this.keyHandler = (event) => this.onKey(event);
    this.build();
  }
  build() {
    this.host.classList.add("Awtsmoos-action-host");
    this.host.innerHTML = `<nav class="Awtsmoos-action-bar" aria-label="B'H action slots"></nav>`;
    this.bar = this.host.querySelector(".Awtsmoos-action-bar");
    this.unsubscribers.push(this.bus.on("mode:changed", () => this.render()));
    this.unsubscribers.push(this.bus.on("level:changed", () => this.render()));
    addEventListener("keydown", this.keyHandler);
    this.render();
  }
  render() {
    const actions = [
      ...ACTIONS,
      action(
        "run",
        this.state.runMode ? "\u{1F3C3}" : "\u{1F6B6}",
        this.state.runMode ? "Run" : "Walk",
        "mode:toggle-run",
        "shift"
      )
    ];
    if (String(this.state.level).startsWith("lava")) {
      actions.push(action("return", "\u{1F3E0}", "Back", "level:return-eretz", "escape"));
    }
    this.bar.replaceChildren(...actions.map((definition) => actionButton(definition)));
    this.bar.querySelectorAll("button").forEach((button2) => {
      button2.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.activate(button2.dataset.event);
      });
    });
  }
  activate(eventType) {
    this.bus.emit(eventType);
  }
  onKey(event) {
    if (event.repeat || isTextEntry(event.target)) return;
    const key = event.key.toLowerCase();
    const actionValue = ACTIONS.find((item2) => item2.key === key);
    if (actionValue) this.activate(actionValue.eventType);
    if (key === "shift") this.activate("mode:toggle-run");
    if (key === "escape" && String(this.state.level).startsWith("lava")) {
      this.activate("level:return-eretz");
    }
  }
  destroy() {
    removeEventListener("keydown", this.keyHandler);
    for (const unsubscribe of this.unsubscribers) unsubscribe();
  }
};
function action(id, icon, label, eventType, key) {
  return Object.freeze({ eventType, icon, id, key, label });
}
function actionButton(definition) {
  const button2 = document.createElement("button");
  button2.dataset.action = definition.id;
  button2.dataset.event = definition.eventType;
  button2.setAttribute("aria-label", definition.label);
  button2.innerHTML = `<span>${definition.icon}</span><small>${definition.label}</small>`;
  return button2;
}
function isTextEntry(target) {
  return Boolean(target?.closest?.('input,textarea,select,[contenteditable="true"]'));
}
function makeHost() {
  const host = document.createElement("div");
  document.body.appendChild(host);
  return host;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/combat/TorahAbilityCatalog.js
var DEFAULTS = Object.freeze({
  castMilliseconds: 0,
  channelMilliseconds: 0,
  chargeRecoveryMilliseconds: 0,
  charges: 1,
  globalCooldownMilliseconds: 1e3,
  healing: 0,
  radius: 0,
  range: 0,
  shield: 0,
  stagger: 0
});
var TORAH_ABILITY_CATALOG = Object.freeze([
  ability2(
    "grateful-awakening",
    "Grateful Awakening",
    "modeh-ani",
    "Renew courage and a measure of health.",
    "awakening",
    { castType: "instant", healing: 24, statusEffects: ["returning-spark"], targetType: "self" }
  ),
  ability2(
    "voice-of-unity",
    "Voice of Unity",
    "shema-unity",
    "Sustain a chain of light through nearby concealment.",
    "unity",
    { castType: "channel", channelMilliseconds: 2400, range: 15, statusEffects: ["light-of-clarity"], targetType: "chain" }
  ),
  ability2(
    "stillness-of-shabbos",
    "Stillness of Shabbos",
    "peace-prayer",
    "Establish a peaceful field that delays hostile preparation.",
    "peace",
    { castType: "cast", castMilliseconds: 900, radius: 7, statusEffects: ["stillness-of-shabbos"], targetType: "ground-point" }
  ),
  ability2(
    "light-against-concealment",
    "Light Against Concealment",
    "creation-light",
    "Reveal a shadow weak point and disperse its concealment.",
    "illumination",
    { castType: "cast", castMilliseconds: 700, range: 18, statusEffects: ["light-against-concealment"], targetType: "selected-enemy" }
  ),
  ability2(
    "shield-of-trust",
    "Shield of Trust",
    "guardian-path",
    "Receive a measured protection against incoming harm.",
    "protection",
    { castType: "instant", shield: 48, statusEffects: ["shield-of-trust"], targetType: "self" }
  ),
  ability2(
    "waters-of-purification",
    "Waters of Purification",
    "living-water",
    "Cleanse one burden and grant brief resistance.",
    "purification",
    { castType: "cast", castMilliseconds: 600, healing: 16, range: 16, statusEffects: ["waters-of-purification"], targetType: "selected-ally" }
  ),
  ability2(
    "merciful-restraint",
    "Merciful Restraint",
    "two-souls",
    "Briefly bind a lesser hostile; damage may release it.",
    "restraint",
    { castType: "instant", range: 14, statusEffects: ["merciful-restraint"], targetType: "selected-enemy" }
  ),
  ability2(
    "guarded-thought",
    "Guarded Thought",
    "small-city",
    "Interrupt hostile preparation and guard against retaliation.",
    "clarity",
    { castType: "reactive", range: 12, statusEffects: ["guarded-thought"], targetType: "selected-enemy" }
  ),
  ability2(
    "joy-breaks-barriers",
    "Joy Breaks Barriers",
    "joy-breaks-barriers",
    "Gather joy, then release a warm wave of courage.",
    "joy",
    { castType: "charged", castMilliseconds: 1400, charges: 2, chargeRecoveryMilliseconds: 11e3, radius: 6, stagger: 28, targetType: "cone" }
  )
]);
var ABILITIES_BY_ID = new Map(TORAH_ABILITY_CATALOG.map((definition) => [definition.id, definition]));
function torahAbilityDefinition(abilityId) {
  return ABILITIES_BY_ID.get(abilityId) || null;
}
function torahAbilityForPassage(passageId) {
  return TORAH_ABILITY_CATALOG.find((definition) => definition.passageId === passageId) || null;
}
function ability2(id, title2, passageId, description, school, overrides) {
  const passage2 = torahPassage(passageId);
  if (!passage2) throw new Error(`Unknown Torah passage for ability: ${passageId}`);
  return Object.freeze({
    ...DEFAULTS,
    ...overrides,
    audioEvent: `torah:${id}:audio`,
    cooldownMilliseconds: passage2.cooldownMs,
    damage: passage2.damage,
    description,
    id,
    passageId,
    questTags: Object.freeze(["torah:use", id]),
    resourceCost: passage2.focusCost,
    school,
    statusEffects: Object.freeze([...overrides.statusEffects || []]),
    title: title2,
    unlockCondition: Object.freeze({ passageId, type: "passage-learned" }),
    visualEvent: `torah:${id}:visual`
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/actionbar/ActionBarBindingRules.js
var KEY_CODES = Object.freeze([
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Digit5",
  "Digit6",
  "Digit7",
  "Digit8",
  "Digit9",
  "Digit0",
  "Minus",
  "Equal"
]);
var KEY_LABELS = Object.freeze(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "\u2212", "="]);
var GAMEPAD_BUTTONS = Object.freeze([0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 8, 9]);
var DEFAULT_ACTION_BAR_BINDINGS = Object.freeze({
  gamepadButtons: GAMEPAD_BUTTONS,
  keyboardCodes: KEY_CODES
});
function keyboardActionSlot(event, options = {}) {
  if (!event || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return null;
  if (isEditableTarget(event.target)) return null;
  const codes = options.keyboardCodes || KEY_CODES;
  const localIndex = codes.indexOf(event.code);
  if (localIndex < 0) return null;
  return localIndex + rowOffset(options.secondRow);
}
function gamepadActionSlot(buttonIndex, options = {}) {
  if (!Number.isInteger(buttonIndex) || buttonIndex < 0) return null;
  const buttons = options.gamepadButtons || GAMEPAD_BUTTONS;
  const localIndex = buttons.indexOf(buttonIndex);
  if (localIndex < 0) return null;
  return localIndex + rowOffset(options.secondRow);
}
function actionBarKeyLabel(slotIndex) {
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= 24) return "";
  return KEY_LABELS[slotIndex % KEY_LABELS.length];
}
function rowOffset(secondRow) {
  return secondRow ? KEY_CODES.length : 0;
}
function isEditableTarget(target) {
  if (!target) return false;
  if (target.isContentEditable) return true;
  const tagName = String(target.tagName || "").toLowerCase();
  return tagName === "input" || tagName === "select" || tagName === "textarea";
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/TorahAbilityPresentation.js
var PRESENTATION = Object.freeze({
  "grateful-awakening": presentation("\u05DE", "awakening"),
  "guarded-thought": presentation("\u05D3", "clarity"),
  "joy-breaks-barriers": presentation("\u05E9", "joy"),
  "light-against-concealment": presentation("\u05D0\u05D5\u05E8", "illumination"),
  "merciful-restraint": presentation("\u05E8", "restraint"),
  "shield-of-trust": presentation("\u05D1", "protection"),
  "stillness-of-shabbos": presentation("\u05E9\u05D1", "peace"),
  "voice-of-unity": presentation("\u05D0\u05D7\u05D3", "unity"),
  "waters-of-purification": presentation("\u05DE\u05D9\u05DD", "purification")
});
var FALLBACK = presentation("\u05EA", "clarity");
function torahAbilityPresentation(abilityId) {
  return PRESENTATION[abilityId] || FALLBACK;
}
function presentation(glyph, tone) {
  return Object.freeze({ glyph, tone });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/ActionBarSlotView.js
function renderActionBarSlots(grid, layout) {
  const fragment = document.createDocumentFragment();
  const visibleCount = layout.rows * 12;
  for (let slotIndex = 0; slotIndex < visibleCount; slotIndex += 1) {
    fragment.appendChild(createActionSlot(slotIndex, layout.slots[slotIndex]));
  }
  grid.dataset.rows = layout.rows;
  grid.replaceChildren(fragment);
  return visibleCount;
}
function updateActionSlotReadiness(button2, decision) {
  const unavailable = !decision?.ok;
  button2.classList.toggle("is-unavailable", unavailable && !button2.classList.contains("is-empty"));
  button2.setAttribute("aria-disabled", String(unavailable));
  button2.dataset.reason = decision?.reason || "";
}
function updateActionSlotCooldown(button2, definition, state) {
  if (!definition || !state) return false;
  const presentation2 = cooldownPresentation(definition, state);
  if (button2.dataset.cooldownSignature === presentation2.signature) return false;
  button2.dataset.cooldownSignature = presentation2.signature;
  button2.style.setProperty("--cooldown-ratio", presentation2.ratio);
  const time = button2.querySelector(".Mitzvah-slot-cooldown-time");
  if (time.textContent !== presentation2.label) time.textContent = presentation2.label;
  const charge = button2.querySelector(".Mitzvah-slot-charge");
  charge.hidden = presentation2.chargeHidden;
  if (!charge.hidden && charge.textContent !== presentation2.chargeLabel) {
    charge.textContent = presentation2.chargeLabel;
  }
  return true;
}
function cooldownPresentation(definition, state) {
  const localRemaining = state.cooldownRemainingMilliseconds;
  const globalRemaining = state.globalCooldownRemainingMilliseconds;
  const remaining = Math.max(localRemaining, globalRemaining);
  const localDuration = definition.charges > 1 ? definition.chargeRecoveryMilliseconds : definition.cooldownMilliseconds;
  const duration = globalRemaining > localRemaining ? definition.globalCooldownMilliseconds : localDuration;
  const ratio3 = duration ? Math.min(1, remaining / duration).toFixed(3) : "0.000";
  const label = remaining > 0 ? cooldownLabel(remaining) : "";
  const chargeHidden = state.maximumCharges < 2;
  const chargeLabel = chargeHidden ? "" : String(state.charges);
  return {
    chargeHidden,
    chargeLabel,
    label,
    ratio: ratio3,
    signature: `${ratio3}|${label}|${chargeHidden ? 0 : 1}|${chargeLabel}`
  };
}
function createActionSlot(slotIndex, abilityId) {
  const definition = torahAbilityDefinition(abilityId);
  const presentation2 = torahAbilityPresentation(abilityId);
  const button2 = document.createElement("button");
  button2.className = `Mitzvah-action-slot${definition ? "" : " is-empty"}`;
  button2.dataset.slotIndex = slotIndex;
  button2.draggable = Boolean(definition);
  button2.type = "button";
  button2.setAttribute("aria-describedby", "Mitzvah-ability-tooltip");
  button2.setAttribute(
    "aria-label",
    definition ? `${definition.title}, slot ${slotIndex + 1}` : `Empty slot ${slotIndex + 1}`
  );
  if (definition) {
    button2.dataset.abilityId = definition.id;
    button2.dataset.tone = presentation2.tone;
  }
  button2.append(
    text("span", "Mitzvah-slot-glyph", definition ? presentation2.glyph : ""),
    text("kbd", "Mitzvah-slot-key", actionBarKeyLabel(slotIndex)),
    text("i", "Mitzvah-slot-cooldown", ""),
    text("span", "Mitzvah-slot-cooldown-time", ""),
    text("span", "Mitzvah-slot-charge", "")
  );
  button2.querySelector(".Mitzvah-slot-charge").hidden = true;
  return button2;
}
function cooldownLabel(milliseconds) {
  if (milliseconds >= 1e4) return `${Math.ceil(milliseconds / 1e3)}`;
  return `${(milliseconds / 1e3).toFixed(1)}`;
}
function text(tagName, className, value3) {
  const element2 = document.createElement(tagName);
  element2.className = className;
  element2.textContent = value3;
  return element2;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/ActionBarCooldownPresenter.js
var DEFAULT_REFRESH_MILLISECONDS = 50;
var ActionBarCooldownPresenter = class {
  constructor(runtime, grid, options = {}) {
    this.buttons = [];
    this.domUpdates = 0;
    this.getDefinition = options.getDefinition || torahAbilityDefinition;
    this.grid = grid;
    this.nextRefreshAt = 0;
    this.refreshMilliseconds = options.refreshMilliseconds ?? DEFAULT_REFRESH_MILLISECONDS;
    this.runtime = runtime;
    this.updateSlot = options.updateSlot || updateActionSlotCooldown;
  }
  recache() {
    this.buttons = Array.from(this.grid.querySelectorAll("[data-ability-id]"));
    this.nextRefreshAt = 0;
    return this.buttons.length;
  }
  update(now2) {
    if (now2 < this.nextRefreshAt) return false;
    this.nextRefreshAt = now2 + this.refreshMilliseconds;
    let changedCount = 0;
    for (const button2 of this.buttons) {
      const definition = this.getDefinition(button2.dataset.abilityId);
      if (!definition) continue;
      const state = this.runtime.timeline.cooldowns.snapshotAbility(definition, now2);
      if (this.updateSlot(button2, definition, state)) changedCount += 1;
    }
    this.domUpdates += changedCount;
    return changedCount > 0;
  }
  invalidate() {
    this.nextRefreshAt = 0;
  }
  snapshot() {
    return {
      cachedButtons: this.buttons.length,
      domUpdates: this.domUpdates,
      nextRefreshAt: this.nextRefreshAt,
      refreshMilliseconds: this.refreshMilliseconds
    };
  }
  destroy() {
    this.buttons = [];
    this.nextRefreshAt = 0;
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/ActionBarHudMarkup.js
function ActionBarHudMarkup(host = null) {
  const root = host || document.createElement("section");
  if (!root.isConnected) document.body.appendChild(root);
  root.classList.add("Mitzvah-combat-host");
  root.setAttribute("aria-label", "Torah abilities");
  const frame = element("div", "Mitzvah-combat-frame");
  const grid = element("nav", "Mitzvah-action-grid");
  grid.setAttribute("aria-label", "Torah action slots");
  const meta = element("div", "Mitzvah-action-meta");
  const focusTrack = element("div", "Mitzvah-focus-track");
  const focusFill = element("i", "Mitzvah-focus-fill");
  const focusLabel = element("span", "Mitzvah-focus-label");
  focusTrack.setAttribute("aria-label", "Torah focus");
  focusTrack.setAttribute("role", "meter");
  focusTrack.append(focusFill, focusLabel);
  const lock = element("button", "Mitzvah-layout-lock");
  lock.dataset.actionbarControl = "lock";
  lock.type = "button";
  const feedback = element("div", "Mitzvah-action-feedback");
  feedback.setAttribute("aria-live", "polite");
  feedback.hidden = true;
  meta.append(focusTrack, lock);
  frame.append(grid, meta, feedback);
  root.replaceChildren(frame);
  return { feedback, focusFill, focusLabel, focusTrack, frame, grid, lock, root };
}
function element(tagName, className) {
  const value3 = document.createElement(tagName);
  value3.className = className;
  return value3;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/ActionBarActivationInput.js
var ActionBarActivationInput = class {
  constructor(options) {
    this.consumeLongPressClick = options.consumeLongPressClick || (() => false);
    this.getSlot = options.getSlot;
    this.runtime = options.runtime;
  }
  click(event) {
    const lock = event.target?.closest?.('[data-actionbar-control="lock"]');
    if (lock) {
      this.toggleLock();
      return true;
    }
    const slot = this.getSlot(event.target);
    if (!slot) return false;
    const slotIndex = Number(slot.dataset.slotIndex);
    event.preventDefault();
    if (this.consumeLongPressClick(slotIndex)) return true;
    this.activate(slotIndex, "pointer");
    return true;
  }
  keydown(event) {
    const secondRow = Boolean(event.shiftKey) && this.visibleRows() === 2;
    const slotIndex = keyboardActionSlot(event, { secondRow });
    if (slotIndex == null) return false;
    event.preventDefault();
    this.activate(slotIndex, "keyboard");
    return true;
  }
  activateGamepad(buttonIndex, secondRow = false) {
    const visibleSecondRow = Boolean(secondRow) && this.visibleRows() === 2;
    const slotIndex = gamepadActionSlot(buttonIndex, { secondRow: visibleSecondRow });
    if (slotIndex == null) return false;
    this.activate(slotIndex, "gamepad");
    return true;
  }
  activate(slotIndex, source) {
    return this.runtime.activateSlot(slotIndex, { source });
  }
  toggleLock() {
    const snapshot2 = this.runtime.store.snapshot();
    return this.runtime.store.setLocked(!snapshot2.locked);
  }
  visibleRows() {
    return this.runtime.store.snapshot().rows;
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/ActionBarInputListenerRegistry.js
var ROOT_EVENTS = Object.freeze([
  "click",
  "dragover",
  "drop",
  "focusin",
  "focusout",
  "pointerdown",
  "pointerout",
  "pointerover"
]);
var DOCUMENT_EVENTS = Object.freeze([
  "dragend",
  "dragstart",
  "keydown",
  "pointercancel",
  "pointermove",
  "pointerup"
]);
var ActionBarInputListenerRegistry = class {
  constructor(root, documentValue, handlers) {
    this.document = documentValue;
    this.handlers = handlers;
    this.root = root;
    this.bind();
  }
  bind() {
    for (const type of ROOT_EVENTS) {
      this.root.addEventListener(type, this.handlers[type]);
    }
    for (const type of DOCUMENT_EVENTS) {
      this.document.addEventListener(type, this.handlers[type]);
    }
  }
  snapshot() {
    return {
      documentListeners: DOCUMENT_EVENTS.length,
      rootListeners: ROOT_EVENTS.length
    };
  }
  destroy() {
    for (const type of ROOT_EVENTS) {
      this.root.removeEventListener(type, this.handlers[type]);
    }
    for (const type of DOCUMENT_EVENTS) {
      this.document.removeEventListener(type, this.handlers[type]);
    }
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/ActionBarLongPressController.js
var DEFAULT_DELAY_MILLISECONDS = 550;
var DEFAULT_MOVEMENT_TOLERANCE = 12;
var SUPPORTED_POINTER_TYPES = /* @__PURE__ */ new Set(["pen", "touch"]);
var ActionBarLongPressController = class {
  constructor(options = {}) {
    this.clearTimer = options.clearTimer || clearTimeout;
    this.delayMilliseconds = options.delayMilliseconds || DEFAULT_DELAY_MILLISECONDS;
    this.movementTolerance = options.movementTolerance || DEFAULT_MOVEMENT_TOLERANCE;
    this.onInspect = options.onInspect || (() => {
    });
    this.onInspectEnd = options.onInspectEnd || (() => {
    });
    this.setTimer = options.setTimer || setTimeout;
    this.state = null;
    this.suppressedSlot = null;
    this.timer = null;
  }
  begin(event, slotIndex, anchor2) {
    if (!this.supports(event)) return false;
    this.cancel();
    this.suppressedSlot = null;
    this.state = {
      anchor: anchor2,
      inspected: false,
      pointerId: event.pointerId,
      slotIndex,
      startX: Number(event.clientX || 0),
      startY: Number(event.clientY || 0)
    };
    this.timer = this.setTimer(
      () => this.complete(event.pointerId),
      this.delayMilliseconds
    );
    return true;
  }
  move(event) {
    if (!this.matches(event)) return false;
    const deltaX = Number(event.clientX || 0) - this.state.startX;
    const deltaY = Number(event.clientY || 0) - this.state.startY;
    if (deltaX * deltaX + deltaY * deltaY <= this.movementTolerance ** 2) return true;
    this.cancel();
    return false;
  }
  end(event) {
    if (!this.matches(event)) return false;
    this.cancel(true);
    return true;
  }
  consumeClick(slotIndex) {
    if (this.suppressedSlot !== slotIndex) return false;
    this.suppressedSlot = null;
    return true;
  }
  complete(pointerId) {
    if (!this.state || this.state.pointerId !== pointerId) return false;
    this.timer = null;
    this.state.inspected = true;
    this.suppressedSlot = this.state.slotIndex;
    this.onInspect(this.state.slotIndex, this.state.anchor);
    return true;
  }
  cancel(endInspection = false) {
    if (this.timer != null) this.clearTimer(this.timer);
    this.timer = null;
    if (endInspection && this.state?.inspected) this.onInspectEnd();
    this.state = null;
  }
  snapshot() {
    return {
      active: Boolean(this.state),
      inspected: Boolean(this.state?.inspected),
      suppressedSlot: this.suppressedSlot
    };
  }
  destroy() {
    this.cancel(true);
    this.suppressedSlot = null;
  }
  matches(event) {
    return Boolean(this.state) && event?.pointerId === this.state.pointerId;
  }
  supports(event) {
    if (!event || !SUPPORTED_POINTER_TYPES.has(event.pointerType)) return false;
    if (event.isPrimary === false) return false;
    return event.button == null || event.button === 0;
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/ActionBarPointerDragInput.js
var ActionBarPointerDragInput = class {
  constructor(options) {
    this.getSlot = options.getSlot;
    this.onResult = options.onResult || (() => {
    });
    this.root = options.root;
    this.runtime = options.runtime;
  }
  start(event) {
    const libraryAbility = event.target?.closest?.("[data-torah-ability-id]");
    const slot = this.getSlot(event.target);
    const result = libraryAbility ? this.runtime.drag.beginAbility(libraryAbility.dataset.torahAbilityId) : this.beginSlot(slot);
    if (!result?.ok) return false;
    event.dataTransfer?.setData("text/plain", result.state.abilityId || "torah-ability");
    if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
    slot?.classList.add("is-dragging");
    return true;
  }
  over(event) {
    if (!this.getSlot(event.target) || !this.runtime.drag.snapshot().active) return false;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    return true;
  }
  drop(event) {
    const slot = this.getSlot(event.target);
    if (!slot) return false;
    event.preventDefault();
    const result = this.runtime.drag.dropOnSlot(Number(slot.dataset.slotIndex));
    this.onResult(result);
    return result.ok;
  }
  end(event) {
    this.root.querySelector(".is-dragging")?.classList.remove("is-dragging");
    if (!this.runtime.drag.snapshot().active) return false;
    const result = event.dataTransfer?.dropEffect === "none" ? this.runtime.drag.dropOutside() : this.runtime.drag.cancel();
    this.onResult(result);
    return result.ok;
  }
  beginSlot(slot) {
    if (!slot) return null;
    return this.runtime.drag.beginSlot(Number(slot.dataset.slotIndex));
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/ActionBarInputController.js
var ActionBarInputController = class {
  constructor(options) {
    this.root = options.root;
    this.runtime = options.runtime;
    this.onInspect = options.onInspect || (() => {
    });
    this.onInspectEnd = options.onInspectEnd || (() => {
    });
    this.longPress = new ActionBarLongPressController({
      ...options.longPressOptions,
      onInspect: this.onInspect,
      onInspectEnd: this.onInspectEnd
    });
    this.activation = new ActionBarActivationInput({
      consumeLongPressClick: (slotIndex) => this.longPress.consumeClick(slotIndex),
      getSlot: (target) => this.slot(target),
      runtime: this.runtime
    });
    this.dragInput = new ActionBarPointerDragInput({
      getSlot: (target) => this.slot(target),
      onResult: options.onResult,
      root: this.root,
      runtime: this.runtime
    });
    this.listeners = new ActionBarInputListenerRegistry(
      this.root,
      options.document || document,
      this.createHandlers()
    );
  }
  createHandlers() {
    return {
      click: (event) => this.activation.click(event),
      dragend: (event) => this.dragInput.end(event),
      dragover: (event) => this.dragInput.over(event),
      dragstart: (event) => this.dragInput.start(event),
      drop: (event) => this.dragInput.drop(event),
      focusin: (event) => this.inspect(event),
      focusout: (event) => this.inspectEnd(event),
      keydown: (event) => this.activation.keydown(event),
      pointercancel: (event) => this.longPress.end(event),
      pointerdown: (event) => this.pointerDown(event),
      pointermove: (event) => this.longPress.move(event),
      pointerout: (event) => this.inspectEnd(event),
      pointerover: (event) => this.inspect(event),
      pointerup: (event) => this.longPress.end(event)
    };
  }
  activateGamepad(buttonIndex, secondRow = false) {
    return this.activation.activateGamepad(buttonIndex, secondRow);
  }
  pointerDown(event) {
    const slot = this.slot(event.target);
    if (!slot?.dataset.abilityId) return false;
    return this.longPress.begin(event, Number(slot.dataset.slotIndex), slot);
  }
  inspect(event) {
    if (this.touchPointer(event)) return;
    const slot = this.slot(event.target);
    if (slot) this.onInspect(Number(slot.dataset.slotIndex), slot);
  }
  inspectEnd(event) {
    const slot = this.slot(event.target);
    const nextSlot = this.slot(event.relatedTarget);
    if (!slot || slot === nextSlot) return;
    if (this.touchPointer(event)) this.longPress.cancel(true);
    else this.onInspectEnd();
  }
  touchPointer(event) {
    return event.pointerType === "touch" || event.pointerType === "pen";
  }
  slot(target) {
    return target?.closest?.(".Mitzvah-action-slot") || null;
  }
  snapshot() {
    return {
      listeners: this.listeners.snapshot(),
      longPress: this.longPress.snapshot(),
      rows: this.runtime.store.snapshot().rows
    };
  }
  destroy() {
    this.listeners.destroy();
    this.longPress.destroy();
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/ActionBarMetaPresenter.js
var ActionBarMetaPresenter = class {
  constructor(elements, options = {}) {
    this.clock = options.clock || Date.now;
    this.elements = elements;
    this.domUpdates = 0;
    this.feedbackExpiresAt = 0;
    this.focusSignature = "";
  }
  updateFocus(focus) {
    const current = Number(focus?.current || 0);
    const maximum = Number(focus?.maximum || 0);
    const signature = `${Math.round(current)}:${Math.round(maximum)}`;
    if (signature === this.focusSignature) return false;
    this.focusSignature = signature;
    const ratio3 = maximum ? Math.min(1, current / maximum) : 0;
    this.elements.focusFill.style.setProperty("--focus-ratio", ratio3.toFixed(3));
    this.elements.focusLabel.textContent = `${Math.floor(current)} / ${Math.floor(maximum)} focus`;
    this.elements.focusTrack.setAttribute("aria-valuemax", maximum);
    this.elements.focusTrack.setAttribute("aria-valuenow", current);
    this.domUpdates += 1;
    return true;
  }
  showResult(result) {
    if (!result) return false;
    this.elements.feedback.textContent = result.ok ? "Torah ability ready" : readable(result.reason);
    this.elements.feedback.dataset.state = result.ok ? "accepted" : "rejected";
    this.elements.feedback.hidden = false;
    this.feedbackExpiresAt = this.clock() + 1800;
    this.domUpdates += 1;
    return true;
  }
  update(now2 = this.clock()) {
    if (!this.feedbackExpiresAt || now2 < this.feedbackExpiresAt) return false;
    this.elements.feedback.hidden = true;
    this.feedbackExpiresAt = 0;
    this.domUpdates += 1;
    return true;
  }
  snapshot() {
    return {
      domUpdates: this.domUpdates,
      feedbackExpiresAt: this.feedbackExpiresAt,
      focusSignature: this.focusSignature
    };
  }
};
function readable(reason) {
  return String(reason || "Unavailable").replaceAll("-", " ");
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/ActionBarSlotPresenter.js
var ActionBarSlotPresenter = class {
  constructor(runtime, elements, cooldowns) {
    this.buttons = [];
    this.cooldowns = cooldowns;
    this.domUpdates = 0;
    this.elements = elements;
    this.runtime = runtime;
  }
  render() {
    const layout = this.runtime.store.snapshot();
    renderActionBarSlots(this.elements.grid, layout);
    this.buttons = Array.from(this.elements.grid.children);
    this.cooldowns.recache();
    this.elements.lock.textContent = layout.locked ? "Layout locked" : "Lock layout";
    this.elements.lock.setAttribute("aria-pressed", String(layout.locked));
    this.refreshReadiness();
    this.domUpdates += 1;
    return this.buttons.length;
  }
  refreshReadiness() {
    let changedCount = 0;
    for (const button2 of this.buttons) {
      const abilityId = button2.dataset.abilityId;
      const decision = abilityId ? this.runtime.timeline.readiness(abilityId) : { ok: false, reason: "empty-slot" };
      updateActionSlotReadiness(button2, decision);
      changedCount += 1;
    }
    this.cooldowns.invalidate();
    this.domUpdates += changedCount;
    return changedCount;
  }
  snapshot() {
    return {
      cachedButtons: this.buttons.length,
      domUpdates: this.domUpdates
    };
  }
  destroy() {
    this.buttons = [];
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/ActionBarLayoutStyles.js
var ACTION_BAR_LAYOUT_CSS = `
.Mitzvah-combat-host {
	--bar-gold: #e3b85e;
	--bar-stone: #252925;
	--bar-wood: #2d1c12;
	bottom: max(12px, env(safe-area-inset-bottom));
	contain: layout style;
	left: 50%;
	pointer-events: none;
	position: fixed;
	transform: translateX(-50%);
	width: min(94vw, 940px);
	z-index: 310;
}

.Mitzvah-combat-frame {
	background:
		linear-gradient(180deg, rgba(255, 226, 157, .09), transparent 28%),
		linear-gradient(135deg, rgba(18, 21, 19, .96), rgba(46, 28, 17, .96));
	border: 1px solid rgba(227, 184, 94, .52);
	border-radius: 12px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, .45), inset 0 0 0 2px rgba(0, 0, 0, .42);
	display: grid;
	gap: 5px;
	padding: 7px;
	pointer-events: auto;
	position: relative;
}

.Mitzvah-action-grid {
	display: grid;
	gap: 5px;
	grid-template-columns: repeat(12, minmax(0, 1fr));
}

.Mitzvah-action-grid[data-rows="2"] {
	grid-template-rows: repeat(2, auto);
}

.Mitzvah-action-meta {
	align-items: center;
	display: grid;
	gap: 8px;
	grid-template-columns: minmax(120px, 1fr) auto;
	min-height: 15px;
}

.Mitzvah-focus-track {
	background: rgba(2, 13, 15, .78);
	border: 1px solid rgba(108, 217, 220, .32);
	border-radius: 999px;
	height: 8px;
	overflow: hidden;
	position: relative;
}

.Mitzvah-focus-fill {
	background: linear-gradient(90deg, #3d8e93, #b6ffff 76%, #f5df92);
	box-shadow: 0 0 8px rgba(119, 241, 245, .5);
	height: 100%;
	transform: scaleX(var(--focus-ratio, 1));
	transform-origin: left center;
}

.Mitzvah-focus-label {
	color: #d8fbf8;
	font: 700 10px/1.1 ui-sans-serif, system-ui, sans-serif;
	left: 8px;
	letter-spacing: .04em;
	position: absolute;
	text-shadow: 0 1px 2px #000;
	top: -2px;
}

.Mitzvah-layout-lock {
	background: rgba(18, 16, 12, .74);
	border: 1px solid rgba(227, 184, 94, .38);
	border-radius: 6px;
	color: #ead9b4;
	cursor: pointer;
	font: 700 10px/1 system-ui, sans-serif;
	min-height: 24px;
	padding: 4px 8px;
}

.Mitzvah-layout-lock:focus-visible {
	outline: 2px solid #c9ffff;
	outline-offset: 2px;
}

@media (max-width: 800px) {
	.Mitzvah-combat-host {
		bottom: max(8px, env(safe-area-inset-bottom));
		width: min(98vw, 620px);
	}

	.Mitzvah-action-grid {
		grid-template-columns: repeat(6, minmax(44px, 1fr));
	}

	.Mitzvah-combat-frame {
		border-radius: 10px;
		gap: 4px;
		padding: 5px;
	}
}

@media (max-width: 420px) {
	.Mitzvah-combat-host {
		width: calc(100vw - 8px);
	}

	.Mitzvah-action-grid {
		gap: 3px;
		grid-template-columns: repeat(6, minmax(42px, 1fr));
	}
}

@media (prefers-reduced-motion: reduce) {
	.Mitzvah-combat-host *,
	.Mitzvah-combat-host *::before,
	.Mitzvah-combat-host *::after {
		scroll-behavior: auto !important;
		transition-duration: .001ms !important;
	}
}
`;

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/ActionBarSlotStyles.js
var ACTION_BAR_SLOT_CSS = `
.Mitzvah-action-slot {
	--ability-a: #527d79;
	--ability-b: #142a2c;
	aspect-ratio: 1;
	background:
		linear-gradient(145deg, rgba(255, 255, 255, .16), transparent 34%),
		radial-gradient(circle at 50% 42%, var(--ability-a), var(--ability-b) 72%);
	border: 1px solid rgba(231, 198, 119, .62);
	border-radius: 8px;
	box-shadow: inset 0 0 0 2px rgba(8, 7, 5, .54);
	color: #fff8df;
	cursor: pointer;
	display: grid;
	font-family: ui-sans-serif, system-ui, sans-serif;
	isolation: isolate;
	min-width: 0;
	overflow: hidden;
	padding: 0;
	place-items: center;
	position: relative;
	touch-action: manipulation;
	transition: filter 120ms ease, opacity 120ms ease, transform 120ms ease;
}

.Mitzvah-action-slot:hover:not(.is-unavailable) {
	filter: brightness(1.16) saturate(1.08);
	transform: translateY(-2px);
}

.Mitzvah-action-slot:active:not(.is-unavailable) {
	transform: translateY(0) scale(.96);
}

.Mitzvah-action-slot:focus-visible {
	outline: 3px solid #d7ffff;
	outline-offset: 2px;
	z-index: 4;
}

.Mitzvah-action-slot.is-empty {
	background: linear-gradient(145deg, rgba(72, 68, 58, .42), rgba(13, 15, 14, .78));
	border-color: rgba(190, 172, 131, .25);
	cursor: default;
}

.Mitzvah-action-slot.is-unavailable {
	filter: grayscale(.84);
	opacity: .56;
}

.Mitzvah-action-slot.is-dragging {
	opacity: .42;
	transform: scale(.92);
}

.Mitzvah-slot-glyph {
	direction: rtl;
	font-family: Georgia, "Times New Roman", serif;
	font-size: clamp(14px, 1.7vw, 24px);
	font-weight: 800;
	grid-area: 1 / 1;
	letter-spacing: -.06em;
	line-height: 1;
	text-shadow: 0 2px 3px rgba(0, 0, 0, .85);
	z-index: 1;
}

.Mitzvah-slot-key {
	background: rgba(5, 6, 5, .7);
	border-radius: 0 0 0 4px;
	color: #ead49e;
	font-size: 9px;
	font-weight: 800;
	line-height: 1;
	padding: 3px 4px;
	position: absolute;
	right: 0;
	top: 0;
	z-index: 3;
}

.Mitzvah-slot-charge {
	background: #151813;
	border: 1px solid #f4d67b;
	border-radius: 999px;
	bottom: 2px;
	color: #fff2bd;
	font-size: 10px;
	font-weight: 900;
	line-height: 15px;
	min-width: 15px;
	padding: 0 2px;
	position: absolute;
	right: 2px;
	z-index: 3;
}

.Mitzvah-slot-cooldown {
	background: conic-gradient(rgba(0, 0, 0, .8) calc(var(--cooldown-ratio, 0) * 1turn), transparent 0);
	grid-area: 1 / 1;
	inset: 0;
	pointer-events: none;
	position: absolute;
	z-index: 2;
}

.Mitzvah-slot-cooldown-time {
	color: #fff;
	font-size: clamp(11px, 1.2vw, 15px);
	font-weight: 900;
	grid-area: 1 / 1;
	text-shadow: 0 1px 3px #000, 0 0 4px #000;
	z-index: 3;
}

.Mitzvah-action-slot[data-tone="awakening"] { --ability-a: #9a8544; --ability-b: #30250f; }
.Mitzvah-action-slot[data-tone="clarity"] { --ability-a: #70b9c8; --ability-b: #15313e; }
.Mitzvah-action-slot[data-tone="illumination"] { --ability-a: #efcb61; --ability-b: #51370e; }
.Mitzvah-action-slot[data-tone="joy"] { --ability-a: #d68a40; --ability-b: #51250e; }
.Mitzvah-action-slot[data-tone="peace"] { --ability-a: #7b91bd; --ability-b: #242b47; }
.Mitzvah-action-slot[data-tone="protection"] { --ability-a: #80a960; --ability-b: #26351c; }
.Mitzvah-action-slot[data-tone="purification"] { --ability-a: #58b9bd; --ability-b: #143a46; }
.Mitzvah-action-slot[data-tone="restraint"] { --ability-a: #967d61; --ability-b: #34271d; }
.Mitzvah-action-slot[data-tone="unity"] { --ability-a: #9f78ba; --ability-b: #352040; }

@media (hover: none), (pointer: coarse) {
	.Mitzvah-action-slot {
		min-height: 44px;
	}

	.Mitzvah-action-slot:hover:not(.is-unavailable) {
		filter: none;
		transform: none;
	}
}
`;

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/CombatHudAuxiliaryStyles.js
var COMBAT_HUD_AUXILIARY_CSS = `
.Mitzvah-combat-host [hidden] {
	display: none !important;
}

.Mitzvah-castbar {
	background: linear-gradient(180deg, rgba(34, 39, 35, .96), rgba(15, 16, 14, .98));
	border: 1px solid rgba(229, 195, 111, .64);
	border-radius: 7px;
	bottom: calc(100% + 8px);
	box-shadow: 0 5px 18px rgba(0, 0, 0, .42);
	color: #fff2cb;
	display: grid;
	font: 700 12px/1.2 ui-sans-serif, system-ui, sans-serif;
	grid-template-columns: 1fr auto;
	left: 50%;
	overflow: hidden;
	padding: 7px 9px 8px;
	position: absolute;
	transform: translateX(-50%);
	width: min(360px, 76vw);
}

.Mitzvah-castbar-time {
	color: #bde7e6;
	font-variant-numeric: tabular-nums;
}

.Mitzvah-castbar-fill {
	background: linear-gradient(90deg, #4da1a1, #f0ce6c);
	bottom: 0;
	height: 3px;
	left: 0;
	position: absolute;
	right: 0;
	transform: scaleX(0);
	transform-origin: left center;
}

.Mitzvah-castbar[data-phase="channeling"] .Mitzvah-castbar-fill {
	background: linear-gradient(90deg, #8abfd1, #d8ecff);
}

.Mitzvah-status-effects {
	bottom: calc(100% + 46px);
	display: flex;
	gap: 5px;
	left: 50%;
	pointer-events: auto;
	position: absolute;
	transform: translateX(-50%);
}

.Mitzvah-status-effect {
	background: linear-gradient(145deg, #365a59, #172322);
	border: 1px solid rgba(219, 239, 209, .58);
	border-radius: 6px;
	box-shadow: 0 3px 9px rgba(0, 0, 0, .38);
	color: #f3ffe7;
	display: grid;
	height: 32px;
	place-items: center;
	position: relative;
	width: 32px;
}

.Mitzvah-status-effect b {
	font: 800 8px/1 ui-sans-serif, system-ui, sans-serif;
	max-width: 28px;
	overflow: hidden;
	text-overflow: clip;
	text-transform: uppercase;
}

.Mitzvah-status-effect small {
	background: rgba(0, 0, 0, .72);
	bottom: 0;
	font: 800 9px/1 ui-monospace, monospace;
	padding: 1px 2px;
	position: absolute;
	right: 0;
}

.Mitzvah-status-effect::after {
	content: attr(data-stacks);
	font: 900 10px/1 ui-sans-serif, system-ui, sans-serif;
	left: 2px;
	position: absolute;
	top: 2px;
}

.Mitzvah-ability-tooltip {
	background: linear-gradient(145deg, rgba(32, 28, 21, .98), rgba(13, 20, 19, .98));
	border: 1px solid rgba(232, 195, 105, .72);
	border-radius: 9px;
	box-shadow: 0 12px 28px rgba(0, 0, 0, .52);
	color: #eee6d1;
	left: var(--tooltip-x);
	max-width: min(330px, 88vw);
	padding: 12px;
	pointer-events: none;
	position: fixed;
	top: var(--tooltip-y);
	transform: translate(-50%, -100%);
	z-index: 900;
}

.Mitzvah-tooltip-heading {
	color: #ffe49a;
	font: 800 16px/1.2 Georgia, serif;
	margin: 0 0 2px;
}

.Mitzvah-tooltip-school {
	color: #9cd7d5;
	font: 800 10px/1.2 ui-sans-serif, system-ui, sans-serif;
	letter-spacing: .1em;
	margin: 0 0 8px;
	text-transform: uppercase;
}

.Mitzvah-tooltip-description {
	font: 12px/1.45 ui-sans-serif, system-ui, sans-serif;
	margin: 0 0 9px;
}

.Mitzvah-tooltip-stats {
	display: grid;
	font: 11px/1.3 ui-sans-serif, system-ui, sans-serif;
	grid-template-columns: auto 1fr;
	margin: 0;
}

.Mitzvah-tooltip-term,
.Mitzvah-tooltip-value {
	margin: 0;
	padding: 1px 0;
}

.Mitzvah-tooltip-value {
	color: #dcebea;
	text-align: right;
}

.Mitzvah-tooltip-ready,
.Mitzvah-tooltip-unavailable {
	font: 800 11px/1.2 ui-sans-serif, system-ui, sans-serif;
	margin: 9px 0 0;
	text-transform: capitalize;
}

.Mitzvah-tooltip-ready { color: #8ff0d7; }
.Mitzvah-tooltip-unavailable { color: #f1a69f; }

.Mitzvah-action-feedback {
	color: #f7e1a6;
	font: 800 11px/1.2 ui-sans-serif, system-ui, sans-serif;
	left: 50%;
	pointer-events: none;
	position: absolute;
	top: -24px;
	transform: translateX(-50%);
	white-space: nowrap;
}

@media (max-width: 600px) {
	.Mitzvah-ability-tooltip {
		max-width: calc(100vw - 20px);
	}

	.Mitzvah-status-effects {
		bottom: calc(100% + 40px);
	}
}

@media (prefers-contrast: more) {
	.Mitzvah-combat-frame,
	.Mitzvah-action-slot,
	.Mitzvah-castbar,
	.Mitzvah-ability-tooltip {
		border-color: #fff2b6;
	}
}
`;

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/ActionBarStyles.js
var STYLES = Object.freeze([
  ["Mitzvah-actionbar-layout-styles", ACTION_BAR_LAYOUT_CSS],
  ["Mitzvah-actionbar-slot-styles", ACTION_BAR_SLOT_CSS],
  ["Mitzvah-combat-hud-auxiliary-styles", COMBAT_HUD_AUXILIARY_CSS]
]);
function installActionBarStyles(documentValue = globalThis.document) {
  if (!documentValue?.head) return false;
  for (const [id, css] of STYLES) {
    if (documentValue.getElementById(id)) continue;
    const style = documentValue.createElement("style");
    style.id = id;
    style.textContent = css;
    documentValue.head.appendChild(style);
  }
  return true;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/CastBarHud.js
var CastBarHud = class {
  constructor(host, bus) {
    this.bus = bus;
    this.active = null;
    this.domUpdates = 0;
    this.root = document.createElement("div");
    this.root.className = "Mitzvah-castbar";
    this.root.hidden = true;
    this.root.innerHTML = '<span class="Mitzvah-castbar-name"></span><span class="Mitzvah-castbar-time"></span><i class="Mitzvah-castbar-fill"></i>';
    this.name = this.root.querySelector(".Mitzvah-castbar-name");
    this.time = this.root.querySelector(".Mitzvah-castbar-time");
    this.fill = this.root.querySelector(".Mitzvah-castbar-fill");
    host.appendChild(this.root);
    this.unsubscribers = [
      bus.on("torah:cast-start", (detail) => this.start(detail)),
      bus.on("torah:cast-complete", (detail) => this.finish(detail)),
      bus.on("torah:interrupt", (detail) => this.finish(detail)),
      bus.on("actionbar:result", (detail) => {
        if (!detail?.ok) this.finish(detail);
      })
    ];
  }
  start(detail) {
    const definition = torahAbilityDefinition(detail?.abilityId);
    if (!definition) return;
    this.active = { ...detail, title: definition.title };
    this.name.textContent = definition.title;
    this.root.dataset.phase = detail.phase;
    this.root.hidden = false;
    this.domUpdates += 1;
    this.update(detail.startedAt);
  }
  update(now2) {
    if (!this.active || this.root.hidden) return false;
    const duration = Math.max(1, this.active.completesAt - this.active.startedAt);
    const progress = Math.min(1, Math.max(0, (now2 - this.active.startedAt) / duration));
    const remaining = Math.max(0, this.active.completesAt - now2);
    this.fill.style.transform = `scaleX(${progress})`;
    const label = `${(remaining / 1e3).toFixed(1)}s`;
    if (this.time.textContent !== label) this.time.textContent = label;
    this.domUpdates += 1;
    return true;
  }
  finish(detail) {
    if (!this.active) return;
    if (detail?.castId && detail.castId !== this.active.castId) return;
    this.active = null;
    this.root.hidden = true;
    this.fill.style.transform = "scaleX(0)";
    this.domUpdates += 1;
  }
  snapshot() {
    return { active: this.active ? { ...this.active } : null, domUpdates: this.domUpdates };
  }
  destroy() {
    for (const unsubscribe of this.unsubscribers) unsubscribe();
    this.root.remove();
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/combat/TorahStatusEffectCatalog.js
var TORAH_STATUS_EFFECT_CATALOG = Object.freeze([
  effect(
    "light-of-clarity",
    "Light of Clarity",
    "Reveals concealment and lowers hostile evasion.",
    8e3,
    0,
    "clarity",
    { evasionMultiplier: 0.7, revealsHidden: true }
  ),
  effect(
    "shield-of-trust",
    "Shield of Trust",
    "Absorbs a measured amount of incoming harm.",
    1e4,
    0,
    "protection",
    { absorb: 48 },
    { refreshRule: "replace-stronger" }
  ),
  effect(
    "flame-of-enthusiasm",
    "Flame of Enthusiasm",
    "Warm golden resolve steadily disperses shadow.",
    7e3,
    1e3,
    "enthusiasm",
    { damagePerTick: 5 },
    { maximumStacks: 3, stackingRule: "add" }
  ),
  effect(
    "stillness-of-shabbos",
    "Stillness of Shabbos",
    "Peace slows movement and hostile preparation.",
    6e3,
    0,
    "peace",
    { attackPreparationMultiplier: 1.3, movementMultiplier: 0.65 },
    { bossBehavior: "half-strength" }
  ),
  effect(
    "waters-of-purification",
    "Waters of Purification",
    "Cleanses one burden and grants brief resistance.",
    5e3,
    0,
    "purification",
    { cleanseCount: 1, resistanceMultiplier: 0.7 }
  ),
  effect(
    "voice-of-courage",
    "Voice of Courage",
    "Breaks fear and strengthens stagger resistance.",
    9e3,
    0,
    "courage",
    { breaksFear: true, staggerResistance: 0.35 }
  ),
  effect(
    "light-against-concealment",
    "Light Against Concealment",
    "Reveals a shadow weak point and applies steady light.",
    8e3,
    1e3,
    "illumination",
    { damagePerTick: 4, revealsWeakPoint: true },
    { bossBehavior: "reveal-only" }
  ),
  effect(
    "merciful-restraint",
    "Merciful Restraint",
    "Briefly restrains a lesser hostile until struck.",
    3500,
    0,
    "restraint",
    { breakOnDamage: true, rooted: true },
    { bossBehavior: "immune" }
  ),
  effect(
    "guarded-thought",
    "Guarded Thought",
    "Grants brief protection from hostile interruption.",
    3e3,
    0,
    "clarity",
    { interruptImmunity: true }
  ),
  effect(
    "returning-spark",
    "Returning Spark",
    "Returns a portion of subsequent effort as renewal.",
    1e4,
    0,
    "awakening",
    { returnHealingRatio: 0.18, returnResourceRatio: 0.12 }
  )
]);
var EFFECTS_BY_ID = new Map(TORAH_STATUS_EFFECT_CATALOG.map((definition) => [definition.id, definition]));
function torahStatusEffectDefinition(effectId) {
  return EFFECTS_BY_ID.get(effectId) || null;
}
function effect(id, title2, tooltip, durationMilliseconds, tickIntervalMilliseconds, icon, modifiers, overrides = {}) {
  return Object.freeze({
    bossBehavior: overrides.bossBehavior || "normal",
    dispelCategory: overrides.dispelCategory || "torah-light",
    durationMilliseconds,
    icon,
    id,
    maximumStacks: overrides.maximumStacks || 1,
    modifiers: Object.freeze({ ...modifiers }),
    persistenceRule: "combat-only",
    questEventRule: "status:apply",
    refreshRule: overrides.refreshRule || "refresh-duration",
    stackingRule: overrides.stackingRule || "replace",
    tickIntervalMilliseconds,
    title: title2,
    tooltip
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/StatusEffectHud.js
var DEFAULT_REFRESH_MILLISECONDS2 = 250;
var StatusEffectHud = class {
  constructor(host, bus, store, targetId = "player", options = {}) {
    this.bus = bus;
    this.store = store;
    this.targetId = targetId;
    this.domUpdates = 0;
    this.nextRefreshAt = 0;
    this.refreshMilliseconds = options.refreshMilliseconds ?? DEFAULT_REFRESH_MILLISECONDS2;
    this.nodes = /* @__PURE__ */ new Map();
    this.root = document.createElement("div");
    this.root.className = "Mitzvah-status-effects";
    this.root.setAttribute("aria-label", "Active Torah effects");
    this.root.setAttribute("role", "list");
    this.root.hidden = true;
    host.appendChild(this.root);
    this.unsubscribers = [
      bus.on("status:apply", (detail) => this.changed(detail)),
      bus.on("status:expire", (detail) => this.changed(detail))
    ];
    this.render();
  }
  changed(detail) {
    if (detail?.targetId === this.targetId) this.render();
  }
  render() {
    const effects = this.store.snapshot(this.targetId).effects;
    const fragment = document.createDocumentFragment();
    this.nodes.clear();
    for (const effect2 of effects) {
      const definition = torahStatusEffectDefinition(effect2.effectId);
      if (!definition) continue;
      const node = this.createNode(effect2, definition);
      fragment.appendChild(node);
      this.nodes.set(effect2.sequence, node);
    }
    this.root.replaceChildren(fragment);
    this.root.hidden = this.nodes.size === 0;
    this.nextRefreshAt = 0;
    this.domUpdates += 1;
  }
  createNode(effect2, definition) {
    const node = document.createElement("span");
    node.className = `Mitzvah-status-effect is-${definition.icon}`;
    node.dataset.expiresAt = effect2.expiresAt;
    node.setAttribute("role", "listitem");
    node.title = definition.tooltip;
    node.innerHTML = `<b>${definition.icon.slice(0, 2)}</b><small></small>`;
    if (effect2.stacks > 1) node.dataset.stacks = effect2.stacks;
    return node;
  }
  update(now2) {
    if (this.root.hidden || now2 < this.nextRefreshAt) return false;
    this.nextRefreshAt = now2 + this.refreshMilliseconds;
    let changedCount = 0;
    for (const node of this.nodes.values()) {
      const seconds = Math.max(0, Math.ceil((Number(node.dataset.expiresAt) - now2) / 1e3));
      const time = node.querySelector("small");
      const label = String(seconds);
      if (time.textContent === label) continue;
      time.textContent = label;
      changedCount += 1;
    }
    this.domUpdates += changedCount;
    return changedCount > 0;
  }
  snapshot() {
    return {
      activeCount: this.nodes.size,
      domUpdates: this.domUpdates,
      nextRefreshAt: this.nextRefreshAt,
      refreshMilliseconds: this.refreshMilliseconds,
      targetId: this.targetId
    };
  }
  destroy() {
    for (const unsubscribe of this.unsubscribers) unsubscribe();
    this.nodes.clear();
    this.root.remove();
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/TorahAbilityTooltip.js
var TorahAbilityTooltip = class {
  constructor(host) {
    this.element = document.createElement("aside");
    this.element.className = "Mitzvah-ability-tooltip";
    this.element.id = "Mitzvah-ability-tooltip";
    this.element.setAttribute("aria-hidden", "true");
    this.element.setAttribute("role", "tooltip");
    this.element.hidden = true;
    host.appendChild(this.element);
  }
  show(definition, readiness, anchor2) {
    if (!definition || !anchor2) return this.hide();
    const presentation2 = torahAbilityPresentation(definition.id);
    this.element.replaceChildren(
      row("Mitzvah-tooltip-heading", `${presentation2.glyph} ${definition.title}`),
      row("Mitzvah-tooltip-school", definition.school),
      row("Mitzvah-tooltip-description", definition.description),
      stats2(definition),
      row(
        readiness?.ok ? "Mitzvah-tooltip-ready" : "Mitzvah-tooltip-unavailable",
        readinessLabel(readiness)
      )
    );
    const bounds = anchor2.getBoundingClientRect();
    this.element.style.setProperty("--tooltip-x", `${bounds.left + bounds.width / 2}px`);
    this.element.style.setProperty("--tooltip-y", `${Math.max(8, bounds.top - 12)}px`);
    this.element.hidden = false;
    this.element.setAttribute("aria-hidden", "false");
  }
  hide() {
    this.element.hidden = true;
    this.element.setAttribute("aria-hidden", "true");
  }
  destroy() {
    this.element.remove();
  }
};
function stats2(definition) {
  const element2 = document.createElement("dl");
  element2.className = "Mitzvah-tooltip-stats";
  const values = [
    ["Focus", definition.resourceCost],
    ["Range", definition.range ? `${definition.range}m` : "Self"],
    ["Cast", castLabel(definition)],
    ["Cooldown", `${(definition.cooldownMilliseconds / 1e3).toFixed(1)}s`]
  ];
  for (const [label, value3] of values) {
    element2.append(row("Mitzvah-tooltip-term", label, "dt"));
    element2.append(row("Mitzvah-tooltip-value", value3, "dd"));
  }
  return element2;
}
function castLabel(definition) {
  if (definition.castType === "channel") return `${definition.channelMilliseconds / 1e3}s channel`;
  if (!definition.castMilliseconds) return definition.castType;
  return `${definition.castMilliseconds / 1e3}s ${definition.castType}`;
}
function readinessLabel(readiness) {
  if (!readiness) return "";
  if (readiness.ok) return "Ready";
  return String(readiness.reason || "Unavailable").replaceAll("-", " ");
}
function row(className, text3, tagName = "p") {
  const element2 = document.createElement(tagName);
  element2.className = className;
  element2.textContent = text3;
  return element2;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/ActionBarHud.js
var ActionBarHud = class {
  constructor(runtime, bus, options = {}) {
    installActionBarStyles();
    this.runtime = runtime;
    this.clock = options.clock || Date.now;
    this.ownsHost = !options.host;
    this.elements = ActionBarHudMarkup(options.host);
    this.tooltip = new TorahAbilityTooltip(document.body);
    this.castBar = new CastBarHud(this.elements.frame, bus);
    this.statusEffects = new StatusEffectHud(
      this.elements.frame,
      bus,
      runtime.statuses,
      options.playerId || "player",
      { refreshMilliseconds: options.statusEffectRefreshMilliseconds }
    );
    this.meta = new ActionBarMetaPresenter(this.elements, { clock: this.clock });
    this.cooldowns = new ActionBarCooldownPresenter(runtime, this.elements.grid, {
      refreshMilliseconds: options.cooldownRefreshMilliseconds
    });
    this.slots = new ActionBarSlotPresenter(runtime, this.elements, this.cooldowns);
    this.input = new ActionBarInputController({
      longPressOptions: options.longPressOptions,
      onInspect: (slotIndex, anchor2) => this.inspect(slotIndex, anchor2),
      onInspectEnd: () => this.tooltip.hide(),
      onResult: (result) => this.showResult(result),
      root: this.elements.root,
      runtime
    });
    this.unsubscribers = this.subscribe(bus);
    this.slots.render();
  }
  subscribe(bus) {
    return [
      this.runtime.store.onChange(() => this.slots.render()),
      this.runtime.inventory.onChange(() => this.slots.refreshReadiness()),
      bus.on("npc:target", () => this.slots.refreshReadiness()),
      bus.on("npc:clear", () => this.slots.refreshReadiness()),
      bus.on("actionbar:result", (result) => this.showResult(result))
    ];
  }
  update(now2 = this.clock()) {
    if (this.elements.root.hidden) return false;
    this.meta.updateFocus(this.runtime.combat.snapshot().focus);
    this.cooldowns.update(now2);
    this.castBar.update(now2);
    this.statusEffects.update(now2);
    this.meta.update(now2);
    return true;
  }
  inspect(slotIndex, anchor2) {
    const abilityId = anchor2.dataset.abilityId;
    if (!abilityId) return this.tooltip.hide();
    return this.tooltip.show(
      torahAbilityDefinition(abilityId),
      this.runtime.timeline.readiness(abilityId),
      anchor2
    );
  }
  showResult(result) {
    if (!this.meta.showResult(result)) return false;
    this.slots.refreshReadiness();
    return true;
  }
  activateGamepad(buttonIndex, secondRow = false) {
    return this.input.activateGamepad(buttonIndex, secondRow);
  }
  snapshot() {
    return {
      castBar: this.castBar.snapshot(),
      cooldowns: this.cooldowns.snapshot(),
      input: this.input.snapshot(),
      meta: this.meta.snapshot(),
      slots: this.slots.snapshot(),
      statusEffects: this.statusEffects.snapshot()
    };
  }
  destroy() {
    for (const unsubscribe of this.unsubscribers) unsubscribe();
    this.input.destroy();
    this.slots.destroy();
    this.cooldowns.destroy();
    this.tooltip.destroy();
    this.castBar.destroy();
    this.statusEffects.destroy();
    if (this.ownsHost) this.elements.root.remove();
    else this.elements.root.replaceChildren();
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/CameraModePresentation.js
var CAMERA_MODE_FIRST_PERSON = "firstPerson";
var CAMERA_MODE_THIRD_PERSON = "orbit";
function nextCameraMode(mode) {
  return mode === CAMERA_MODE_FIRST_PERSON ? CAMERA_MODE_THIRD_PERSON : CAMERA_MODE_FIRST_PERSON;
}
function cameraModePresentation(mode) {
  const firstPerson = mode === CAMERA_MODE_FIRST_PERSON;
  return {
    activeLabel: firstPerson ? "1st Person" : "3rd Person",
    ariaLabel: firstPerson ? "Switch camera to third-person view" : "Switch camera to first-person view",
    icon: firstPerson ? "\u{1F441}\uFE0F" : "\u{1F3A5}",
    mode: firstPerson ? CAMERA_MODE_FIRST_PERSON : CAMERA_MODE_THIRD_PERSON,
    pressed: firstPerson,
    shortLabel: firstPerson ? "1st" : "3rd"
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/CameraModeToggle.js
var STYLE_ID = "Awtsmoos-camera-mode-style";
var CameraModeToggle = class {
  constructor(root, bus, initialMode = "orbit") {
    if (!root?.ownerDocument) {
      throw new Error("Camera mode toggle requires a DOM root.");
    }
    this.root = root;
    this.bus = bus;
    this.document = root.ownerDocument;
    this.installStyle();
    this.button = this.createButton();
    this.root.append(this.button);
    this.unsubscribe = this.bus.on("camera:changed", (detail) => {
      this.setMode(detail.mode);
    });
    this.setMode(initialMode);
  }
  createButton() {
    const button2 = this.document.createElement("button");
    button2.type = "button";
    button2.className = "Awtsmoos-camera-mode-toggle";
    button2.addEventListener("click", () => {
      this.bus.emit("camera:toggle");
    });
    return button2;
  }
  setMode(mode) {
    const presentation2 = cameraModePresentation(mode);
    this.button.dataset.cameraMode = presentation2.mode;
    this.button.setAttribute("aria-label", presentation2.ariaLabel);
    this.button.setAttribute("aria-pressed", String(presentation2.pressed));
    this.button.title = presentation2.ariaLabel;
    this.button.innerHTML = [
      `<span aria-hidden="true">${presentation2.icon}</span>`,
      `<strong>${presentation2.activeLabel}</strong>`,
      "<small>Change View</small>"
    ].join("");
    return presentation2;
  }
  destroy() {
    this.unsubscribe?.();
    this.button.remove();
  }
  installStyle() {
    if (this.document.getElementById(STYLE_ID)) {
      return;
    }
    const style = this.document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
			.Awtsmoos-camera-mode-toggle {
				position: fixed;
				right: 16px;
				top: 16px;
				z-index: 12;
				display: grid;
				grid-template-columns: auto auto;
				gap: 2px 8px;
				align-items: center;
				min-width: 126px;
				padding: 9px 12px;
				border: 1px solid rgba(53, 255, 216, .72);
				border-radius: 15px;
				background: rgba(3, 10, 18, .82);
				color: #eaffff;
				box-shadow: 0 0 22px rgba(53, 255, 216, .18);
				backdrop-filter: blur(8px);
				font: inherit;
				cursor: pointer;
				touch-action: manipulation;
			}
			.Awtsmoos-camera-mode-toggle span { grid-row: 1 / 3; font-size: 25px; }
			.Awtsmoos-camera-mode-toggle strong { font-size: 13px; line-height: 1; }
			.Awtsmoos-camera-mode-toggle small { font-size: 10px; opacity: .78; }
			.Awtsmoos-camera-mode-toggle:focus-visible { outline: 3px solid #ffe45e; }
			@media (max-width: 700px) {
				.Awtsmoos-camera-mode-toggle { top: 82px; right: 12px; min-width: 112px; }
			}
		`;
    this.document.head.append(style);
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/RiverCrossingShlichus.js
var RIVER_CROSSING_SHLICHUS = Object.freeze({
  description: "Repair the river crossing, disperse the nearby concealment, and restore its lanterns.",
  giver: Object.freeze({
    id: "bridge-keeper",
    name: "Reb Zalman the Bridge Keeper",
    position: point(-18, 34)
  }),
  id: "light-at-river-crossing",
  location: Object.freeze({ districtId: "riverbank-bridge", name: "Riverbank and Bridge Approach" }),
  multiplayer: false,
  name: "The Light at the River Crossing",
  objectives: Object.freeze([
    objective("meet-keeper", "npc:talk", "bridge-keeper", 1, "Speak with Reb Zalman at the bridge.", -18, 34),
    objective("inspect-damage", "bridge:inspect", "damaged-bridge-point", 3, "Inspect three damaged bridge points.", -12, 39),
    objective("bring-timber", "inventory:add", "treated-timber", 4, "Bring four treated timbers from the workshop.", -43, 14),
    objective("clear-shadows", "defeat", "dybbuk-shade", 2, "Disperse two shadows along the riverbank.", 0, -140),
    objective("illuminate-portal", "torah", "light-against-concealment", 1, "Use Light Against Concealment at the waterfall portal.", -6, -166),
    objective("report-repair", "npc:talk", "bridge-keeper", 1, "Return to Reb Zalman.", -18, 34)
  ]),
  reward: Object.freeze({
    mitzvahPoints: 8,
    passages: Object.freeze(["living-water"]),
    perutas: 24,
    xp: 220
  }),
  storyIntroduction: "The bridge still carries travelers, but its darkened lamps and cracked braces invite danger after dusk.",
  title: "The Light at the River Crossing",
  worldEffects: Object.freeze([
    Object.freeze({ state: "lit", target: "village-stone-bridge", type: "bridge:lanterns" })
  ])
});
function objective(id, eventType, target, count, description, x, z) {
  return Object.freeze({ count, description, eventType, id, marker: point(x, z), optional: false, target });
}
function point(x, z) {
  return Object.freeze({ x, y: 0, z });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/AdventureCatalog.js
var ADVENTURE_CATALOG = Object.freeze([
  RIVER_CROSSING_SHLICHUS,
  quest("sparks-at-east-gate", "Sparks at the East Gate", "Rabbi Dov Ber", 4, -44, [
    objective2("defeat", "dybbuk-shade", 3, "Disperse three shades.", 0, -140)
  ], reward(120, 3), true),
  quest("guard-the-shul", "Guard the Shul", "Shul Gabbai", 8, -48, [
    objective2("defeat", "klipah-guardian", 2, "Defeat two guardians.", -20, -152)
  ], reward(150, 4), true),
  quest("shepherds-mercy", "The Shepherd\u2019s Mercy", "Yosef the Shepherd", 103, 42, [
    objective2("care", "kosher-animal", 3, "Care for three pasture animals.", 111, 43)
  ], reward(90, 5), true),
  quest("kosher-provision", "Kosher Provision", "Shimon the Provider", 92, 49, [
    objective2("harvest", "kosher-animal", 1, "Prepare one eligible provision.", 96, 52)
  ], reward(130, 5), true),
  quest("orchard-defense", "Defense of the Orchard", "Leah the Orchard Keeper", 72, -67, [
    objective2("defeat", "orchard-predator", 2, "Drive away two predators.", 86, -96)
  ], reward(140, 4), true),
  quest("wings-over-lake", "Wings Over the Lake", "Mendel the Watchman", 31, -61, [
    objective2("defeat", "fallen-seraph-husk", 3, "Disperse three fallen husks.", 24, -158)
  ], reward(180, 6), true),
  quest("great-spark-refinement", "The Great Spark Refinement", "The Elder Shliach", 6, -46, [
    objective2("defeat", "great-dybbuk", 1, "Defeat the great dybbuk.", 8, -182),
    objective2("refine", "spark", 10, "Refine ten sparks.", 8, -182)
  ], reward(300, 10), true),
  quest("wood-for-the-shul", "Wood for the Shul", "Avraham the Carpenter", -54, 12, [
    objective2("purchase", "forest-axe", 1, "Buy a forest axe.", -43, 14),
    objective2("chop", "fallen-wood", 6, "Collect six fallen logs.", 82, -112)
  ], reward(115, 4), false),
  quest("flowers-for-shabbos", "Flowers for Shabbos", "Rivka the Gardener", 67, -45, [
    objective2("collect", "cottage-flower", 8, "Gather eight permitted flowers.", 72, -52)
  ], reward(80, 3), false),
  quest("lost-scroll-by-stream", "The Scroll by the Stream", "Moshe the Scribe", -7, 22, [
    objective2("collect", "lost-scroll", 1, "Recover the scroll near the lower cascade.", -18, 34),
    objective2("talk", "moshe-scribe", 1, "Return the scroll to Moshe.", -7, 22)
  ], reward(100, 4), false),
  quest("forest-predator-patrol", "Forest Predator Patrol", "Eliyahu the Ranger", 58, -80, [
    objective2("defeat", "forest-predator", 4, "Defeat four hostile forest creatures.", 92, -126)
  ], reward(170, 5), false),
  quest("words-of-light", "Words of Light", "The Beis Midrash Teacher", 15, -50, [
    objective2("learn", "torah-passage", 3, "Learn three Torah passages.", 15, -50),
    objective2("defeat", "dybbuk-shade", 1, "Use a learned passage against one shade.", 0, -140)
  ], reward(160, 6), false)
]);
function quest(id, name, giver, x, z, objectives, rewardValue, multiplayer) {
  return Object.freeze({
    description: objectives.map((item2) => item2.description).join(" "),
    giver: Object.freeze({ id: giver.toLowerCase().replaceAll(" ", "-"), name: giver, position: point2(x, z) }),
    id,
    multiplayer,
    name,
    objectives: Object.freeze(objectives),
    reward: Object.freeze(rewardValue),
    title: name
  });
}
function objective2(eventType, target, count, description, x, z) {
  return Object.freeze({ count, description, eventType, marker: point2(x, z), target });
}
function reward(xp, mitzvahPoints) {
  return { mitzvahPoints, xp };
}
function point2(x, z) {
  return Object.freeze({ x, y: 0, z });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/AdventureStoreRules.js
function createAdventureRecord(definition) {
  return {
    definition,
    objectiveIndex: 0,
    objectives: definition.objectives.map((item2) => ({
      ...item2,
      progress: 0
    })),
    pinned: false,
    status: "available"
  };
}
function resetAdventureRecord(record) {
  return {
    ...createAdventureRecord(record.definition),
    status: "available"
  };
}
function applyAdventureEvent(record, event) {
  if (record.status !== "active") return false;
  const objective3 = currentAdventureObjective(record);
  if (!objectiveMatchesEvent(objective3, event)) return false;
  objective3.progress = Math.min(
    objective3.count,
    objective3.progress + Number(event.count || 1)
  );
  if (objective3.progress >= objective3.count) advanceAdventure(record);
  return true;
}
function adventureSnapshot(records) {
  const values = [...records.values()];
  return structuredClone({
    active: values.filter((item2) => item2.status === "active"),
    available: values.filter((item2) => ["available", "declined", "offered"].includes(item2.status)),
    completed: values.filter((item2) => item2.status === "completed"),
    offered: values.filter((item2) => item2.status === "offered"),
    pinned: values.filter((item2) => item2.pinned)
  });
}
function currentAdventureObjective(record) {
  return record.objectives[record.objectiveIndex] || null;
}
function objectiveMatchesEvent(objective3, event) {
  if (!objective3 || objective3.eventType !== event.type) return false;
  if (objective3.target === event.target) return true;
  if (objective3.target === "kosher-animal") return Boolean(event.kosherEligible);
  if (objective3.target === "orchard-predator") {
    return ["fox", "wolf"].includes(event.target);
  }
  if (objective3.target === "forest-predator") {
    return ["fox", "wolf", "snake", "spider"].includes(event.target);
  }
  return false;
}
function advanceAdventure(record) {
  record.objectiveIndex += 1;
  if (record.objectiveIndex < record.objectives.length) return;
  record.status = "completed";
  record.pinned = false;
  record.completedAt = Date.now();
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/AdventureStore.js
var MAX_PINNED = 3;
var AdventureStore = class {
  constructor(options = {}) {
    this.catalog = options.catalog || ADVENTURE_CATALOG;
    this.listeners = /* @__PURE__ */ new Set();
    this.records = new Map(this.catalog.map((definition) => [
      definition.id,
      createAdventureRecord(definition)
    ]));
  }
  onChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  offer(questId) {
    return this.change(questId, (record) => {
      if (["available", "declined"].includes(record.status)) record.status = "offered";
    });
  }
  accept(questId) {
    return this.change(questId, (record) => {
      if (!["offered", "available", "declined"].includes(record.status)) return;
      record.status = "active";
      record.acceptedAt = Date.now();
    });
  }
  decline(questId) {
    return this.change(questId, (record) => {
      if (record.status === "offered") record.status = "declined";
    });
  }
  abandon(questId) {
    return this.change(questId, (record) => {
      if (record.status === "active") this.records.set(questId, resetAdventureRecord(record));
    });
  }
  togglePin(questId) {
    return this.change(questId, (record) => {
      if (record.status !== "active") return;
      if (record.pinned) {
        record.pinned = false;
        return;
      }
      const pinned = [...this.records.values()].filter((item2) => item2.pinned).length;
      if (pinned >= MAX_PINNED) throw new Error(`Only ${MAX_PINNED} quests may be pinned.`);
      record.pinned = true;
    });
  }
  recordEvent(event) {
    let changed = false;
    for (const record of this.records.values()) {
      changed = applyAdventureEvent(record, event) || changed;
    }
    if (changed) this.publish();
    return this.snapshot();
  }
  synchronize(questId, progress) {
    return this.change(questId, (record) => {
      record.status = progress?.status === "complete" ? "completed" : progress?.status || "available";
      record.objectiveIndex = Number(progress?.objectiveIndex || 0);
      const objective3 = record.objectives[record.objectiveIndex];
      if (objective3) objective3.progress = Number(progress?.count || 0);
    });
  }
  serialize() {
    return [...this.records.values()].map((record) => ({
      acceptedAt: record.acceptedAt || null,
      completedAt: record.completedAt || null,
      id: record.definition.id,
      objectiveIndex: record.objectiveIndex,
      objectives: record.objectives.map((objective3) => ({ progress: objective3.progress })),
      pinned: Boolean(record.pinned),
      status: record.status
    }));
  }
  restore(records) {
    for (const saved of records || []) {
      const record = this.records.get(saved.id);
      if (!record) continue;
      record.acceptedAt = saved.acceptedAt || null;
      record.completedAt = saved.completedAt || null;
      record.objectiveIndex = Number(saved.objectiveIndex || 0);
      record.pinned = Boolean(saved.pinned);
      record.status = saved.status || "available";
      for (let index = 0; index < record.objectives.length; index += 1) {
        record.objectives[index].progress = Number(saved.objectives?.[index]?.progress || 0);
      }
    }
    this.publish();
    return this.snapshot();
  }
  get(questId) {
    const record = this.records.get(questId);
    return record ? structuredClone(record) : null;
  }
  snapshot() {
    return adventureSnapshot(this.records);
  }
  change(questId, operation) {
    const record = this.records.get(questId);
    if (!record) throw new Error(`Unknown adventure: ${questId}`);
    operation(record);
    this.publish();
    return this.get(questId);
  }
  publish() {
    const snapshot2 = this.snapshot();
    for (const listener of this.listeners) listener(snapshot2);
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/combat/TorahAbilityStatusGateway.js
var TorahAbilityStatusGateway = class {
  constructor(options) {
    this.bus = options.bus || null;
    this.playerId = options.playerId || "player";
    this.statuses = options.statuses;
  }
  apply(definition, context, result) {
    const targetIds = this.targetIds(definition, context, result);
    for (const targetId of targetIds) {
      for (const effectId of definition.statusEffects) {
        this.statuses.apply({
          effectId,
          isBoss: Boolean(context.target?.isBoss && context.target.id === targetId),
          sourceId: this.playerId,
          targetId
        });
      }
    }
    if (definition.healing > 0) {
      this.emit("combat:healing", { amount: definition.healing, sourceId: this.playerId, targetIds });
    }
    if (definition.shield > 0) {
      this.emit("combat:shield", { amount: definition.shield, sourceId: this.playerId, targetIds });
    }
    return targetIds;
  }
  channelTick(definition, context, tickIndex) {
    this.emit("combat:channel-impact", {
      abilityId: definition.id,
      damage: definition.damage / 3,
      sourceId: this.playerId,
      targetId: context.target?.id || null,
      tickIndex
    });
  }
  periodicTick(effect2) {
    const damagePerTick = Number(effect2.modifiers.damagePerTick || 0);
    if (!damagePerTick) return;
    this.emit("combat:status-tick", {
      damage: damagePerTick * effect2.stacks * effect2.strength * effect2.bossScale,
      effectId: effect2.effectId,
      sourceId: effect2.sourceId,
      targetId: effect2.targetId
    });
  }
  targetIds(definition, context, result) {
    if (result?.targetIds?.length) return result.targetIds.slice(0, 12);
    if (definition.targetType === "selected-ally") {
      const allyId = context.ally?.id || context.target?.id;
      return allyId ? [allyId] : [];
    }
    if (definition.targetType === "self") return [this.playerId];
    if (definition.targetType === "ground-point") return [`ground:${definition.id}`];
    return context.target?.id ? [context.target.id] : [];
  }
  emit(type, detail) {
    this.bus?.emit(type, detail);
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/combat/TorahAbilityCastRules.js
var CHANNEL_TICK_COUNT = 3;
var MAXIMUM_CATCH_UP_TICKS = 3;
function createAbilityCast(definition, context, now2, castId) {
  const phase2 = definition.castType === "channel" ? "channeling" : definition.castType === "charged" ? "charging" : "casting";
  const duration = phase2 === "channeling" ? definition.channelMilliseconds : definition.castMilliseconds;
  const tickInterval = phase2 === "channeling" ? duration / CHANNEL_TICK_COUNT : 0;
  return {
    castId,
    completesAt: now2 + duration,
    context,
    definition,
    nextTickAt: tickInterval ? now2 + tickInterval : Infinity,
    phase: phase2,
    startedAt: now2,
    tickIndex: 0,
    tickInterval
  };
}
function abilityCastSnapshot(cast, now2) {
  if (!cast) return null;
  const duration = Math.max(1, cast.completesAt - cast.startedAt);
  return {
    abilityId: cast.definition.id,
    castId: cast.castId,
    completesAt: cast.completesAt,
    phase: cast.phase,
    progress: Math.min(1, Math.max(0, (now2 - cast.startedAt) / duration)),
    startedAt: cast.startedAt,
    tickIndex: cast.tickIndex
  };
}
function abilityChargeRatio(cast, now2) {
  if (!cast || cast.phase !== "charging") return 0;
  const duration = Math.max(1, cast.completesAt - cast.startedAt);
  return Math.min(1, Math.max(0.1, (now2 - cast.startedAt) / duration));
}
function channelTickPlan(cast, now2) {
  if (!cast || cast.phase !== "channeling" || now2 < cast.nextTickAt) return null;
  const effectiveNow = Math.min(now2, cast.completesAt);
  const pending = Math.floor((effectiveNow - cast.nextTickAt) / cast.tickInterval) + 1;
  const remaining = CHANNEL_TICK_COUNT - cast.tickIndex;
  const count = Math.min(pending, remaining, MAXIMUM_CATCH_UP_TICKS);
  cast.tickIndex += count;
  cast.nextTickAt += count * cast.tickInterval;
  return { count, firstTickIndex: cast.tickIndex - count + 1 };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/combat/TorahAbilityCooldownStore.js
var TorahAbilityCooldownStore = class {
  constructor() {
    this.abilities = /* @__PURE__ */ new Map();
    this.globalCooldownUntil = 0;
    this.activations = 0;
  }
  readiness(definition, now2) {
    const state = this.stateFor(definition, now2);
    if (now2 < this.globalCooldownUntil) {
      return { ok: false, reason: "global-cooldown", state: this.snapshotAbility(definition, now2) };
    }
    if (state.charges < 1 || now2 < state.cooldownUntil) {
      return { ok: false, reason: "cooldown", state: this.snapshotAbility(definition, now2) };
    }
    return { ok: true, reason: "ready", state: this.snapshotAbility(definition, now2) };
  }
  commit(definition, now2) {
    const state = this.stateFor(definition, now2);
    if (state.charges < 1) return false;
    state.charges -= 1;
    if (definition.charges > 1) {
      if (!state.nextChargeAt) state.nextChargeAt = now2 + definition.chargeRecoveryMilliseconds;
    } else {
      state.cooldownUntil = now2 + definition.cooldownMilliseconds;
    }
    this.globalCooldownUntil = Math.max(
      this.globalCooldownUntil,
      now2 + definition.globalCooldownMilliseconds
    );
    this.activations += 1;
    return true;
  }
  update(now2) {
    for (const state of this.abilities.values()) this.recover(state, now2);
    return this.diagnostics(now2);
  }
  snapshotAbility(definition, now2) {
    const state = this.stateFor(definition, now2);
    const recoveryUntil = state.nextChargeAt || state.cooldownUntil;
    return {
      abilityId: definition.id,
      charges: state.charges,
      cooldownRemainingMilliseconds: Math.max(0, recoveryUntil - now2),
      cooldownUntil: recoveryUntil,
      globalCooldownRemainingMilliseconds: Math.max(0, this.globalCooldownUntil - now2),
      maximumCharges: definition.charges
    };
  }
  snapshot(now2) {
    const abilities = [];
    for (const state of this.abilities.values()) abilities.push(this.snapshotAbility(state.definition, now2));
    return { abilities, diagnostics: this.diagnostics(now2) };
  }
  diagnostics(now2) {
    return {
      activations: this.activations,
      globalCooldownRemainingMilliseconds: Math.max(0, this.globalCooldownUntil - now2),
      trackedAbilities: this.abilities.size
    };
  }
  destroy() {
    this.abilities.clear();
    this.globalCooldownUntil = 0;
  }
  stateFor(definition, now2) {
    let state = this.abilities.get(definition.id);
    if (!state) {
      state = {
        charges: definition.charges,
        cooldownUntil: 0,
        definition,
        nextChargeAt: 0
      };
      this.abilities.set(definition.id, state);
    }
    this.recover(state, now2);
    return state;
  }
  recover(state, now2) {
    const definition = state.definition;
    if (definition.charges === 1 && state.charges === 0 && now2 >= state.cooldownUntil) {
      state.charges = 1;
      state.cooldownUntil = 0;
      return;
    }
    if (!state.nextChargeAt || !definition.chargeRecoveryMilliseconds) return;
    while (state.charges < definition.charges && now2 >= state.nextChargeAt) {
      state.charges += 1;
      state.nextChargeAt += definition.chargeRecoveryMilliseconds;
    }
    if (state.charges >= definition.charges) state.nextChargeAt = 0;
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/combat/TorahAbilityExecutor.js
var TorahAbilityExecutor = class {
  constructor(options) {
    this.bus = options.bus || null;
    this.cooldowns = options.cooldowns;
    this.execute = options.execute;
    this.onApply = options.onApply || (() => {
    });
    this.onChannelTick = options.onChannelTick || (() => {
    });
    this.diagnostics = { accepted: 0, executorErrors: 0 };
  }
  commit(cast, now2, publishCompletion) {
    let result;
    try {
      result = this.execute(cast.definition, { ...cast.context, castId: cast.castId });
    } catch (error) {
      this.diagnostics.executorErrors += 1;
      return rejected("executor-error", String(error));
    }
    if (!(result === true || result?.ok === true)) {
      return rejected(result?.reason || "rejected", result?.detail || result);
    }
    this.cooldowns.commit(cast.definition, now2);
    this.diagnostics.accepted += 1;
    this.onApply(cast.definition, cast.context, result);
    const detail = this.castDetail(cast, now2);
    this.emit(cast.definition.visualEvent, detail);
    this.emit(cast.definition.audioEvent, detail);
    this.emit("quest:event", {
      count: 1,
      passageId: cast.definition.passageId,
      target: cast.definition.id,
      type: "torah"
    });
    if (publishCompletion) this.emit("torah:cast-complete", detail);
    return { cast: abilityCastSnapshot(cast, now2), ok: true, reason: cast.phase };
  }
  channelTick(cast, now2, tickIndex) {
    this.onChannelTick(cast.definition, cast.context, tickIndex);
    this.emit("torah:channel-tick", { ...this.castDetail(cast, now2), tickIndex });
  }
  completeChannel(cast, now2) {
    this.emit("torah:cast-complete", this.castDetail(cast, now2));
  }
  snapshot() {
    return { ...this.diagnostics };
  }
  castDetail(cast, now2, reason = null) {
    return { ...abilityCastSnapshot(cast, now2), reason };
  }
  emit(type, detail) {
    this.bus?.emit(type, detail);
  }
};
function rejected(reason, detail = null) {
  return { detail, ok: false, reason };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/combat/TorahAbilityActivationRules.js
var ENEMY_TARGET_TYPES = /* @__PURE__ */ new Set(["chain", "line", "selected-enemy"]);
function evaluateTorahAbilityActivation(definition, state = {}) {
  if (!definition) return rejected2("unknown-ability");
  if (state.enabled === false) return rejected2("disabled");
  if (state.unlocked === false) return rejected2("not-unlocked");
  if (state.activeCast) return rejected2("already-casting");
  if (state.cooldown?.ok === false) return rejected2(state.cooldown.reason, state.cooldown.state);
  if (Number(state.resource ?? Infinity) < definition.resourceCost) return rejected2("insufficient-resource");
  if (definition.castType === "reactive" && !state.reactiveWindow) return rejected2("no-reactive-window");
  const target = targetFor(definition.targetType, state);
  if (requiresTarget(definition.targetType) && !target) return rejected2("no-target");
  if (definition.targetType === "ground-point" && !state.groundPoint) return rejected2("no-ground-point");
  if (ENEMY_TARGET_TYPES.has(definition.targetType) && target?.attackable === false) {
    return rejected2("invalid-target");
  }
  if (definition.targetType === "selected-ally" && target?.friendly === false) {
    return rejected2("invalid-target");
  }
  const distance4 = Number(state.distance ?? target?.distance);
  if (definition.range > 0 && Number.isFinite(distance4) && distance4 > definition.range) {
    return rejected2("out-of-range", { distance: distance4, range: definition.range });
  }
  if (requiresFacing(definition.targetType) && state.facing === false) return rejected2("not-facing");
  return { ok: true, reason: "ready", target };
}
function targetFor(targetType, state) {
  if (targetType === "selected-ally") return state.ally || state.target || null;
  if (ENEMY_TARGET_TYPES.has(targetType)) return state.target || null;
  return null;
}
function requiresTarget(targetType) {
  return ENEMY_TARGET_TYPES.has(targetType) || targetType === "selected-ally";
}
function requiresFacing(targetType) {
  return ENEMY_TARGET_TYPES.has(targetType) || targetType === "cone" || targetType === "line";
}
function rejected2(reason, detail = null) {
  return { detail, ok: false, reason };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/combat/TorahAbilityPreflight.js
var TorahAbilityPreflight = class {
  constructor(options) {
    this.clock = options.clock;
    this.cooldowns = options.cooldowns;
    this.getContext = options.getContext || (() => ({}));
    this.getResource = options.getResource || (() => Infinity);
    this.isUnlocked = options.isUnlocked || (() => true);
  }
  resolve(abilityId, suppliedContext = {}, activeCast = false) {
    const definition = torahAbilityDefinition(abilityId);
    const now2 = suppliedContext.now ?? this.clock();
    const context = { ...this.getContext(definition), ...suppliedContext };
    const decision = evaluateTorahAbilityActivation(definition, {
      ...context,
      activeCast,
      cooldown: definition ? this.cooldowns.readiness(definition, now2) : null,
      resource: resourceValue(this.getResource(now2)),
      unlocked: definition ? this.isUnlocked(definition) : false
    });
    return { context, decision, definition, now: now2 };
  }
};
function resourceValue(resource) {
  return Number(resource?.current ?? resource);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/combat/TorahAbilityTimeline.js
var TIMELINED_CAST_TYPES = /* @__PURE__ */ new Set(["cast", "charged", "channel"]);
var TorahAbilityTimeline = class {
  constructor(options = {}) {
    this.bus = options.bus || null;
    this.clock = options.clock || Date.now;
    this.cooldowns = options.cooldowns || new TorahAbilityCooldownStore();
    this.preflight = options.preflight || new TorahAbilityPreflight({
      clock: this.clock,
      cooldowns: this.cooldowns,
      getContext: options.getContext,
      getResource: options.getResource,
      isUnlocked: options.isUnlocked
    });
    this.executor = options.executor || new TorahAbilityExecutor({
      bus: this.bus,
      cooldowns: this.cooldowns,
      execute: options.execute || (() => ({ ok: false, reason: "unavailable" })),
      onApply: options.onApply,
      onChannelTick: options.onChannelTick
    });
    this.activeCast = null;
    this.castSequence = 0;
    this.diagnostics = { channelTicks: 0, interrupted: 0, rejected: 0 };
  }
  activate(abilityId, suppliedContext = {}) {
    const resolved = this.preflight.resolve(abilityId, suppliedContext, Boolean(this.activeCast));
    if (!resolved.decision.ok) return this.reject(abilityId, resolved.decision);
    const castId = `torah-cast-${++this.castSequence}`;
    const cast = createAbilityCast(resolved.definition, resolved.context, resolved.now, castId);
    this.emit("torah:cast-start", abilityCastSnapshot(cast, resolved.now));
    if (!TIMELINED_CAST_TYPES.has(resolved.definition.castType)) return this.commit(cast, resolved.now, true);
    this.activeCast = cast;
    if (resolved.definition.castType !== "channel") return accepted(cast.phase, cast, resolved.now);
    const result = this.commit(cast, resolved.now, false);
    if (!result.ok) this.activeCast = null;
    return result;
  }
  release(now2 = this.clock()) {
    const cast = this.activeCast;
    if (!cast || cast.phase !== "charging") return rejected3("not-charging");
    cast.context = { ...cast.context, chargeRatio: abilityChargeRatio(cast, now2) };
    this.activeCast = null;
    return this.commit(cast, now2, true);
  }
  interrupt(reason = "interrupted") {
    if (!this.activeCast) return false;
    const detail = { ...abilityCastSnapshot(this.activeCast, this.clock()), reason };
    this.activeCast = null;
    this.diagnostics.interrupted += 1;
    this.emit("torah:interrupt", detail);
    return true;
  }
  update(now2 = this.clock()) {
    const cast = this.activeCast;
    if (!cast) return false;
    if (cast.phase === "casting" && now2 >= cast.completesAt) {
      this.activeCast = null;
      this.commit(cast, now2, true);
      return false;
    }
    if (cast.phase === "channeling") this.advanceChannel(cast, now2);
    return Boolean(this.activeCast);
  }
  readiness(abilityId, suppliedContext = {}) {
    return this.preflight.resolve(abilityId, suppliedContext, Boolean(this.activeCast)).decision;
  }
  snapshot(now2 = this.clock()) {
    return {
      activeCast: abilityCastSnapshot(this.activeCast, now2),
      cooldowns: this.cooldowns.snapshot(now2),
      diagnostics: { ...this.diagnostics, executor: this.executor.snapshot() }
    };
  }
  destroy() {
    this.activeCast = null;
    this.cooldowns.destroy();
  }
  commit(cast, now2, publishCompletion) {
    const result = this.executor.commit(cast, now2, publishCompletion);
    if (!result.ok) return this.reject(cast.definition.id, result);
    const acceptedResult = accepted(cast.phase === "channeling" ? "channeling" : "complete", cast, now2);
    this.emit("actionbar:result", { ...acceptedResult, abilityId: cast.definition.id });
    return acceptedResult;
  }
  advanceChannel(cast, now2) {
    const plan = channelTickPlan(cast, now2);
    for (let index = 0; index < (plan?.count || 0); index += 1) {
      this.executor.channelTick(cast, now2, plan.firstTickIndex + index);
      this.diagnostics.channelTicks += 1;
    }
    if (now2 < cast.completesAt) return;
    this.activeCast = null;
    this.executor.completeChannel(cast, now2);
  }
  reject(abilityId, decision) {
    this.diagnostics.rejected += 1;
    const result = rejected3(decision?.reason || "rejected", decision?.detail, abilityId);
    this.emit("actionbar:result", result);
    return result;
  }
  emit(type, detail) {
    this.bus?.emit(type, detail);
  }
};
function accepted(reason, cast, now2) {
  return { cast: abilityCastSnapshot(cast, now2), ok: true, reason };
}
function rejected3(reason, detail = null, abilityId = null) {
  return { abilityId, detail, ok: false, reason };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/combat/TorahStatusEffectRules.js
var MAXIMUM_CATCH_UP_TICKS2 = 4;
function createStatusInstance(definition, request, now2, sequence) {
  return {
    bossScale: bossScale(definition, request.isBoss),
    definition,
    expiresAt: now2 + definition.durationMilliseconds,
    nextTickAt: definition.tickIntervalMilliseconds ? now2 + definition.tickIntervalMilliseconds : Infinity,
    sequence,
    sourceId: request.sourceId,
    stacks: 1,
    strength: request.strength ?? 1,
    targetId: request.targetId
  };
}
function refreshStatusInstance(instance, request, now2) {
  const definition = instance.definition;
  const strength = request.strength ?? 1;
  if (definition.refreshRule === "replace-stronger" && strength < instance.strength) {
    return { ok: false, reason: "weaker-effect" };
  }
  if (definition.stackingRule === "add") {
    instance.stacks = Math.min(definition.maximumStacks, instance.stacks + 1);
  }
  instance.expiresAt = now2 + definition.durationMilliseconds;
  instance.sourceId = request.sourceId;
  instance.strength = Math.max(instance.strength, strength);
  return { ok: true, reason: "refreshed" };
}
function statusTickPlan(instance, now2) {
  const interval = instance.definition.tickIntervalMilliseconds;
  if (!interval || now2 < instance.nextTickAt) return null;
  const pending = Math.floor((now2 - instance.nextTickAt) / interval) + 1;
  const count = Math.min(pending, MAXIMUM_CATCH_UP_TICKS2);
  instance.nextTickAt = pending > count ? now2 + interval : instance.nextTickAt + count * interval;
  return { count, dropped: pending - count };
}
function statusEffectSnapshot(instance) {
  return {
    bossScale: instance.bossScale,
    effectId: instance.definition.id,
    expiresAt: instance.expiresAt,
    modifiers: instance.definition.modifiers,
    sequence: instance.sequence,
    sourceId: instance.sourceId,
    stacks: instance.stacks,
    strength: instance.strength,
    targetId: instance.targetId
  };
}
function bossScale(definition, isBoss) {
  if (!isBoss) return 1;
  if (definition.bossBehavior === "half-strength") return 0.5;
  if (definition.bossBehavior === "reveal-only") return 0;
  return 1;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/combat/TorahStatusEffectStore.js
var TorahStatusEffectStore = class {
  constructor(options = {}) {
    this.bus = options.bus || null;
    this.clock = options.clock || Date.now;
    this.maximumEffects = options.maximumEffects || 128;
    this.onTick = options.onTick || (() => {
    });
    this.targets = /* @__PURE__ */ new Map();
    this.activeCount = 0;
    this.sequence = 0;
    this.diagnostics = { applied: 0, droppedTicks: 0, expired: 0, ticks: 0 };
  }
  apply(request) {
    const definition = torahStatusEffectDefinition(request.effectId);
    if (!definition) return outcome(false, "unknown-effect");
    if (request.targetId == null) return outcome(false, "missing-target");
    if (request.isBoss && definition.bossBehavior === "immune") return outcome(false, "boss-immune");
    const now2 = request.now ?? this.clock();
    const effects = this.targetEffects(request.targetId, true);
    const existing = effects.get(definition.id);
    if (existing) {
      const result = refreshStatusInstance(existing, request, now2);
      if (result.ok) this.emit("status:apply", existing, result.reason);
      return outcome(result.ok, result.reason, statusEffectSnapshot(existing));
    }
    if (this.activeCount >= this.maximumEffects) return outcome(false, "capacity");
    const instance = createStatusInstance(definition, request, now2, ++this.sequence);
    effects.set(definition.id, instance);
    this.activeCount += 1;
    this.diagnostics.applied += 1;
    this.emit("status:apply", instance, "applied");
    return outcome(true, "applied", statusEffectSnapshot(instance));
  }
  update(now2 = this.clock()) {
    for (const [targetId, effects] of this.targets) {
      for (const [effectId, instance] of effects) {
        if (now2 >= instance.expiresAt) {
          this.removeInternal(targetId, effectId, instance, "expired");
          continue;
        }
        this.advanceTicks(instance, now2);
      }
    }
    return this.diagnosticSnapshot();
  }
  remove(targetId, effectId, reason = "removed") {
    const instance = this.targetEffects(targetId)?.get(effectId);
    if (!instance) return false;
    this.removeInternal(targetId, effectId, instance, reason);
    return true;
  }
  removeByCategory(targetId, category, maximum = 1) {
    const effects = this.targetEffects(targetId);
    if (!effects) return 0;
    let removed = 0;
    for (const [effectId, instance] of effects) {
      if (instance.definition.dispelCategory !== category) continue;
      this.removeInternal(targetId, effectId, instance, "cleansed");
      removed += 1;
      if (removed >= maximum) break;
    }
    return removed;
  }
  handleDamage(targetId) {
    const effects = this.targetEffects(targetId);
    if (!effects) return 0;
    let removed = 0;
    for (const [effectId, instance] of effects) {
      if (!instance.definition.modifiers.breakOnDamage) continue;
      this.removeInternal(targetId, effectId, instance, "damage-broken");
      removed += 1;
    }
    return removed;
  }
  snapshot(targetId = null) {
    const effects = [];
    if (targetId != null) {
      for (const instance of this.targetEffects(targetId)?.values() || []) effects.push(statusEffectSnapshot(instance));
    } else {
      for (const targetEffects of this.targets.values()) {
        for (const instance of targetEffects.values()) effects.push(statusEffectSnapshot(instance));
      }
    }
    return { diagnostics: this.diagnosticSnapshot(), effects };
  }
  destroy() {
    this.targets.clear();
    this.activeCount = 0;
  }
  advanceTicks(instance, now2) {
    const plan = statusTickPlan(instance, now2);
    if (!plan) return;
    for (let index = 0; index < plan.count; index += 1) {
      this.onTick(statusEffectSnapshot(instance));
      this.emit("status:tick", instance);
    }
    this.diagnostics.ticks += plan.count;
    this.diagnostics.droppedTicks += plan.dropped;
  }
  removeInternal(targetId, effectId, instance, reason) {
    const effects = this.targets.get(targetId);
    effects.delete(effectId);
    if (!effects.size) this.targets.delete(targetId);
    this.activeCount -= 1;
    if (reason === "expired") this.diagnostics.expired += 1;
    this.emit("status:expire", instance, reason);
  }
  targetEffects(targetId, create = false) {
    if (targetId == null) return null;
    if (create && !this.targets.has(targetId)) this.targets.set(targetId, /* @__PURE__ */ new Map());
    return this.targets.get(targetId) || null;
  }
  diagnosticSnapshot() {
    return { ...this.diagnostics, activeCount: this.activeCount, maximumEffects: this.maximumEffects };
  }
  emit(type, instance, reason = null) {
    const detail = { ...statusEffectSnapshot(instance), reason };
    this.bus?.emit(type, detail);
    if (type === "status:apply") this.bus?.emit("quest:event", { count: 1, target: detail.effectId, type: "status" });
  }
};
function outcome(ok, reason, effect2 = null) {
  return { effect: effect2, ok, reason };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/actionbar/ActionBarDragController.js
var ActionBarDragController = class {
  constructor(options) {
    this.store = options.store;
    this.bus = options.bus || null;
    this.drag = null;
  }
  beginAbility(abilityId) {
    this.drag = { abilityId, source: "library", sourceSlot: null };
    return this.publish("started");
  }
  beginSlot(slotIndex) {
    const abilityId = this.store.snapshot().slots[slotIndex];
    if (!abilityId) return this.result(false, "empty-source");
    this.drag = { abilityId, source: "slot", sourceSlot: slotIndex };
    return this.publish("started");
  }
  dropOnSlot(slotIndex) {
    if (!this.drag) return this.result(false, "not-dragging");
    const result = this.drag.source === "slot" ? this.store.move(this.drag.sourceSlot, slotIndex) : this.store.assign(slotIndex, this.drag.abilityId);
    if (result.ok) this.finish("dropped");
    return result;
  }
  dropOutside() {
    if (!this.drag) return this.result(false, "not-dragging");
    const result = this.drag.source === "slot" ? this.store.remove(this.drag.sourceSlot) : this.result(true, "discarded");
    if (result.ok) this.finish("removed");
    return result;
  }
  cancel() {
    if (!this.drag) return this.result(true, "unchanged");
    this.finish("cancelled");
    return this.result(true, "cancelled");
  }
  snapshot() {
    return this.drag ? { ...this.drag, active: true } : { active: false };
  }
  destroy() {
    this.drag = null;
  }
  finish(reason) {
    this.drag = null;
    this.publish(reason);
  }
  publish(reason) {
    const detail = { ...this.snapshot(), reason };
    this.bus?.emit("actionbar:drag", detail);
    return this.result(true, reason);
  }
  result(ok, reason) {
    return { ok, reason, state: this.snapshot() };
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/actionbar/ActionBarPersistence.js
var DEFAULT_KEY = "awtsmoos.mitzvahWorld.actionBar.v1";
var ActionBarPersistence = class {
  constructor(options = {}) {
    this.key = options.key || DEFAULT_KEY;
    this.storage = resolveStorage(options);
    this.unsubscribe = null;
    this.diagnostics = { failures: 0, reads: 0, restored: false, writes: 0 };
  }
  connect(store) {
    this.disconnect();
    const layout = this.load();
    if (layout) {
      store.restore(layout);
      this.diagnostics.restored = true;
    }
    this.unsubscribe = store.onChange((snapshot2) => this.save(snapshot2));
    return this.snapshot();
  }
  disconnect() {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }
  load() {
    this.diagnostics.reads += 1;
    if (!this.storage) return null;
    try {
      const encoded = this.storage.getItem(this.key);
      return encoded ? validateLayout(JSON.parse(encoded)) : null;
    } catch {
      this.diagnostics.failures += 1;
      return null;
    }
  }
  save(layout) {
    if (!this.storage) return false;
    try {
      this.storage.setItem(this.key, JSON.stringify(compactLayout(layout)));
      this.diagnostics.writes += 1;
      return true;
    } catch {
      this.diagnostics.failures += 1;
      return false;
    }
  }
  clear() {
    try {
      this.storage?.removeItem?.(this.key);
      return true;
    } catch {
      this.diagnostics.failures += 1;
      return false;
    }
  }
  snapshot() {
    return { ...this.diagnostics, connected: Boolean(this.unsubscribe), key: this.key };
  }
  destroy() {
    this.disconnect();
  }
};
function compactLayout(layout) {
  return {
    locked: Boolean(layout?.locked),
    rows: layout?.rows === 2 ? 2 : 1,
    slots: Array.from({ length: 24 }, (_, index) => layout?.slots?.[index] || null),
    version: 1
  };
}
function validateLayout(layout) {
  if (!layout || layout.version !== 1 || !Array.isArray(layout.slots)) return null;
  return compactLayout(layout);
}
function resolveStorage(options) {
  if ("storage" in options) return options.storage;
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/actionbar/ActionBarStore.js
var SLOTS_PER_ROW = 12;
var MAXIMUM_ROWS = 2;
var MAXIMUM_SLOTS = SLOTS_PER_ROW * MAXIMUM_ROWS;
var ActionBarStore = class {
  constructor(options = {}) {
    this.activateAbility = options.activateAbility || (() => ({ ok: false, reason: "unavailable" }));
    this.isAbilityKnown = options.isAbilityKnown || (() => true);
    this.listeners = /* @__PURE__ */ new Set();
    this.locked = Boolean(options.locked);
    this.rows = options.rows === MAXIMUM_ROWS ? MAXIMUM_ROWS : 1;
    this.slots = Array(MAXIMUM_SLOTS).fill(null);
    this.revision = 0;
    if (options.layout) this.restore(options.layout, false);
  }
  onChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  assign(slotIndex, abilityId) {
    if (!this.canEdit()) return this.result(false, "layout-locked");
    this.assertVisibleSlot(slotIndex);
    if (!this.validAbility(abilityId)) return this.result(false, "unknown-ability");
    if (this.slots[slotIndex] === abilityId) return this.result(true, "unchanged");
    this.slots[slotIndex] = abilityId;
    return this.publish("assigned");
  }
  move(sourceIndex, targetIndex) {
    if (!this.canEdit()) return this.result(false, "layout-locked");
    this.assertVisibleSlot(sourceIndex);
    this.assertVisibleSlot(targetIndex);
    if (sourceIndex === targetIndex) return this.result(true, "unchanged");
    const sourceAbility = this.slots[sourceIndex];
    if (!sourceAbility) return this.result(false, "empty-source");
    [this.slots[sourceIndex], this.slots[targetIndex]] = [this.slots[targetIndex], sourceAbility];
    return this.publish("moved");
  }
  remove(slotIndex) {
    if (!this.canEdit()) return this.result(false, "layout-locked");
    this.assertVisibleSlot(slotIndex);
    if (!this.slots[slotIndex]) return this.result(true, "unchanged");
    this.slots[slotIndex] = null;
    return this.publish("removed");
  }
  activate(slotIndex, context = {}) {
    this.assertVisibleSlot(slotIndex);
    const abilityId = this.slots[slotIndex];
    if (!abilityId) return this.result(false, "empty-slot");
    return this.activateAbility(abilityId, { ...context, slotIndex });
  }
  setLocked(locked) {
    const next = Boolean(locked);
    if (this.locked === next) return this.result(true, "unchanged");
    this.locked = next;
    return this.publish(next ? "locked" : "unlocked");
  }
  setRows(rows) {
    const next = rows === MAXIMUM_ROWS ? MAXIMUM_ROWS : 1;
    if (this.rows === next) return this.result(true, "unchanged");
    this.rows = next;
    return this.publish("rows-changed");
  }
  restore(layout, publish = true) {
    this.locked = Boolean(layout?.locked);
    this.rows = layout?.rows === MAXIMUM_ROWS ? MAXIMUM_ROWS : 1;
    for (let index = 0; index < MAXIMUM_SLOTS; index += 1) {
      const abilityId = layout?.slots?.[index];
      this.slots[index] = this.validAbility(abilityId) ? abilityId : null;
    }
    return publish ? this.publish("restored") : this.snapshot();
  }
  snapshot() {
    return {
      locked: this.locked,
      revision: this.revision,
      rows: this.rows,
      slots: [...this.slots],
      version: 1
    };
  }
  destroy() {
    this.listeners.clear();
  }
  canEdit() {
    return !this.locked;
  }
  validAbility(abilityId) {
    return typeof abilityId === "string" && abilityId.length > 0 && this.isAbilityKnown(abilityId);
  }
  assertVisibleSlot(slotIndex) {
    if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= this.rows * SLOTS_PER_ROW) {
      throw new RangeError(`Action slot ${slotIndex} is outside the visible layout.`);
    }
  }
  publish(reason) {
    this.revision += 1;
    const snapshot2 = this.snapshot();
    for (const listener of this.listeners) listener(snapshot2, reason);
    return this.result(true, reason, snapshot2);
  }
  result(ok, reason, snapshot2 = this.snapshot()) {
    return { ok, reason, snapshot: snapshot2 };
  }
};
var ACTION_BAR_LIMITS = Object.freeze({ maximumRows: MAXIMUM_ROWS, slotsPerRow: SLOTS_PER_ROW });

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/actionbar/ActionBarRuntimeCoordinator.js
var TARGET_REQUIRED_TYPES = /* @__PURE__ */ new Set(["chain", "line", "selected-enemy"]);
var DIRECT_SUPPORT_TYPES = /* @__PURE__ */ new Set(["self", "selected-ally"]);
var STATUS_UPDATE_MILLISECONDS = 100;
var ActionBarRuntimeCoordinator = class {
  constructor(options) {
    this.bus = options.bus || null;
    this.clock = options.clock || Date.now;
    this.combat = options.combat;
    this.inventory = options.inventory;
    this.nextStatusUpdateAt = 0;
    this.statuses = options.statuses || new TorahStatusEffectStore({
      bus: this.bus,
      clock: this.clock,
      onTick: (effect2) => this.statusGateway?.periodicTick(effect2)
    });
    this.statusGateway = new TorahAbilityStatusGateway({
      bus: this.bus,
      playerId: options.playerId,
      statuses: this.statuses
    });
    this.timeline = options.timeline || new TorahAbilityTimeline({
      bus: this.bus,
      clock: this.clock,
      execute: (definition, context) => this.execute(definition, context),
      getContext: () => this.combatContext(),
      getResource: () => this.combat.snapshot().focus,
      isUnlocked: (definition) => this.isUnlocked(definition),
      onApply: (definition, context, result) => this.statusGateway.apply(definition, context, result),
      onChannelTick: (definition, context, tickIndex) => this.statusGateway.channelTick(definition, context, tickIndex)
    });
    this.store = options.store || new ActionBarStore({
      activateAbility: (abilityId, context) => this.timeline.activate(abilityId, context),
      isAbilityKnown: (abilityId) => Boolean(torahAbilityDefinition(abilityId)),
      layout: defaultLayout()
    });
    this.persistence = options.persistence || new ActionBarPersistence(options.persistenceOptions);
    this.persistence.connect(this.store);
    this.drag = options.drag || new ActionBarDragController({ bus: this.bus, store: this.store });
  }
  activateSlot(slotIndex, context = {}) {
    return this.store.activate(slotIndex, context);
  }
  assignFirstAvailable(abilityId) {
    if (this.store.locked) return { ok: false, reason: "layout-locked", snapshot: this.store.snapshot() };
    let slotIndex = firstEmptySlot(this.store.slots, this.store.rows * 12);
    if (slotIndex < 0 && this.store.rows === 1) {
      this.store.setRows(2);
      slotIndex = firstEmptySlot(this.store.slots, 24);
    }
    if (slotIndex < 0) return { ok: false, reason: "bar-full", snapshot: this.store.snapshot() };
    return this.store.assign(slotIndex, abilityId);
  }
  readinessForSlot(slotIndex, context = {}) {
    const abilityId = this.store.slots[slotIndex];
    return abilityId ? this.timeline.readiness(abilityId, context) : { ok: false, reason: "empty-slot" };
  }
  update(now2 = this.clock()) {
    const casting = this.timeline.update(now2);
    if (this.statuses.activeCount && now2 >= this.nextStatusUpdateAt) {
      this.statuses.update(now2);
      this.nextStatusUpdateAt = now2 + STATUS_UPDATE_MILLISECONDS;
    }
    return casting || this.statuses.activeCount > 0;
  }
  snapshot(now2 = this.clock()) {
    return {
      drag: this.drag.snapshot(),
      layout: this.store.snapshot(),
      persistence: this.persistence.snapshot(),
      statuses: this.statuses.snapshot(),
      timeline: this.timeline.snapshot(now2)
    };
  }
  destroy() {
    this.persistence.destroy();
    this.drag.destroy();
    this.timeline.destroy();
    this.statuses.destroy();
    this.store.destroy();
  }
  execute(definition, context) {
    return this.combat.usePassage({ id: definition.passageId }, {
      requestId: context.castId,
      returnResult: true,
      skipPassageCooldown: true,
      targetRequired: TARGET_REQUIRED_TYPES.has(definition.targetType),
      worldImpactRequired: !DIRECT_SUPPORT_TYPES.has(definition.targetType)
    });
  }
  combatContext() {
    const target = this.combat.snapshot().selectedTarget;
    return {
      distance: target?.distance ?? target?.distanceToPlayer,
      facing: target?.facing !== false,
      target
    };
  }
  isUnlocked(definition) {
    return this.inventory.snapshot().learned?.includes(definition.passageId) || false;
  }
};
function defaultLayout() {
  const slots = Array(24).fill(null);
  slots[0] = "grateful-awakening";
  return { locked: false, rows: 1, slots };
}
function firstEmptySlot(slots, visibleCount) {
  for (let index = 0; index < visibleCount; index += 1) {
    if (!slots[index]) return index;
  }
  return -1;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/combat/PlayerMeleeController.js
var DEFAULT_ATTACK = Object.freeze({
  cooldownMilliseconds: 620,
  damage: 18,
  id: "shliach-staff-strike",
  range: 2.85,
  stagger: 14
});
var PlayerMeleeController = class {
  constructor(options) {
    this.bus = options.bus;
    this.clock = options.clock || Date.now;
    this.attack = Object.freeze({ ...DEFAULT_ATTACK, ...options.attack || {} });
    this.lastAttackAt = -Infinity;
    this.keys = /* @__PURE__ */ new Set();
    this.lastResult = null;
    this.unsubscribers = [
      this.bus.on("input:key", (state) => this.receiveInput(state)),
      this.bus.on("combat:melee-result", (result) => this.receiveResult(result))
    ];
  }
  receiveInput(state) {
    const nextKeys = new Set(state?.keys || []);
    const pressed = nextKeys.has("KeyF") && !this.keys.has("KeyF");
    this.keys = nextKeys;
    if (pressed) this.attackNow();
  }
  attackNow() {
    const now2 = this.clock();
    if (now2 - this.lastAttackAt < this.attack.cooldownMilliseconds) {
      return this.publishLocalRejection("ATTACK_COOLDOWN", now2);
    }
    this.lastAttackAt = now2;
    const request = {
      attack: this.attack,
      requestedAt: now2,
      sourceId: "player"
    };
    this.bus.emit("combat:melee", request);
    this.bus.emit("player:attack", request);
    return request;
  }
  receiveResult(result) {
    this.lastResult = result ? structuredClone(result) : null;
  }
  publishLocalRejection(reason, now2) {
    const result = {
      accepted: false,
      attackId: this.attack.id,
      reason,
      resolvedAt: now2
    };
    this.bus.emit("combat:melee-result", result);
    return result;
  }
  snapshot() {
    return {
      attack: this.attack,
      lastAttackAt: this.lastAttackAt,
      lastResult: this.lastResult
    };
  }
  destroy() {
    for (const unsubscribe of this.unsubscribers) unsubscribe();
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/combat/TorahFocusMeter.js
var DEFAULT_REGENERATION_PER_SECOND = 4;
var TorahFocusMeter = class {
  constructor(options = {}) {
    this.clock = options.clock || Date.now;
    this.maximum = Math.max(1, Number(options.maximum || 24));
    this.current = Math.min(
      this.maximum,
      Math.max(0, Number(options.current ?? this.maximum))
    );
    this.regenerationPerSecond = Math.max(
      0,
      Number(options.regenerationPerSecond ?? DEFAULT_REGENERATION_PER_SECOND)
    );
    this.updatedAt = Number(options.updatedAt ?? this.clock());
  }
  synchronizeMaximum(maximum, now2 = this.clock()) {
    this.recover(now2);
    this.maximum = Math.max(1, Number(maximum || this.maximum));
    this.current = Math.min(this.current, this.maximum);
    return this.snapshot(now2);
  }
  canSpend(amount, now2 = this.clock()) {
    this.recover(now2);
    return this.current >= Number(amount || 0);
  }
  spend(amount, now2 = this.clock()) {
    this.recover(now2);
    const cost = Math.max(0, Number(amount || 0));
    if (this.current < cost) return false;
    this.current -= cost;
    return true;
  }
  recover(now2 = this.clock()) {
    const elapsedSeconds = Math.max(0, Number(now2) - this.updatedAt) / 1e3;
    this.current = Math.min(
      this.maximum,
      this.current + elapsedSeconds * this.regenerationPerSecond
    );
    this.updatedAt = Number(now2);
    return this.current;
  }
  snapshot(now2 = this.clock()) {
    this.recover(now2);
    return {
      current: this.current,
      maximum: this.maximum,
      regenerationPerSecond: this.regenerationPerSecond,
      updatedAt: this.updatedAt
    };
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/combat/TorahStudyRules.js
function evaluateTorahStudyUse(inventoryState, requestedPassage, now2, combatState2 = {}) {
  const passage2 = torahPassage(requestedPassage?.id);
  if (!passage2) return rejected4("UNKNOWN_PASSAGE");
  if (!inventoryState.learned?.includes(passage2.id)) return rejected4("PASSAGE_NOT_LEARNED");
  if (!ownsBook(inventoryState, passage2.bookId)) return rejected4("BOOK_NOT_OWNED");
  if (!combatState2.skipPassageCooldown) {
    const lastUsedAt = Number(inventoryState.lastUsedAt?.[passage2.id] || 0);
    const elapsed = Number(now2) - lastUsedAt;
    if (lastUsedAt > 0 && elapsed < passage2.cooldownMs) {
      return rejected4("PASSAGE_COOLDOWN", { remainingMs: passage2.cooldownMs - elapsed });
    }
  }
  const focus = Number.isFinite(combatState2.focus) ? combatState2.focus : Number.POSITIVE_INFINITY;
  if (focus < passage2.focusCost) return rejected4("INSUFFICIENT_FOCUS");
  if (combatState2.targetRequired !== false && combatState2.targetAttackable === false) {
    return rejected4("TARGET_REQUIRED");
  }
  return {
    damage: passage2.damage,
    focusCost: passage2.focusCost,
    ok: true,
    passage: passage2,
    usedAt: Number(now2)
  };
}
function ownsBook(inventoryState, bookId) {
  return Boolean(inventoryState.items?.find((item2) => {
    const quantity2 = item2.quantity === void 0 ? 1 : Number(item2.quantity);
    return item2.itemId === bookId && quantity2 > 0;
  }));
}
function rejected4(reason, detail = {}) {
  return { ok: false, reason, ...detail };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/combat/TorahCombatController.js
var TorahCombatController = class {
  constructor(options) {
    this.bus = options.bus;
    this.clock = options.clock || Date.now;
    this.inventory = options.inventory;
    this.profile = options.profile;
    this.focus = options.focus || new TorahFocusMeter({
      clock: this.clock,
      maximum: this.profile.snapshot().derived.focusMaximum
    });
    this.selectedTarget = null;
    this.pendingUse = null;
    this.completedUseResult = null;
    this.unsubscribers = [
      this.bus.on("npc:target", (payload) => this.receiveTarget(payload)),
      this.bus.on("npc:clear", (payload) => this.clearTarget(payload)),
      this.bus.on("enemy:defeated", (payload) => this.clearTarget(payload)),
      this.bus.on("torah:impact", (payload) => this.receiveImpact(payload)),
      this.bus.on("combat:ability", (payload) => this.receiveLegacyAbility(payload)),
      this.bus.on("combat:ward", (payload) => this.receiveLegacyWard(payload))
    ];
  }
  usePassage(requestedPassage, options = {}) {
    const now2 = this.clock();
    this.focus.synchronizeMaximum(this.profile.snapshot().derived.focusMaximum, now2);
    const decision = evaluateTorahStudyUse(this.inventory.snapshot(), requestedPassage, now2, {
      focus: this.focus.snapshot(now2).current,
      skipPassageCooldown: Boolean(options.skipPassageCooldown),
      targetAttackable: Boolean(this.selectedTarget?.attackable),
      targetRequired: options.targetRequired
    });
    if (!decision.ok) return this.publishResult({ ...decision, requestId: options.requestId || null });
    this.completedUseResult = null;
    this.pendingUse = { ...decision, requestId: options.requestId || null };
    if (options.worldImpactRequired === false) {
      this.receiveImpact({ accepted: true, kind: "support" });
    } else {
      this.bus.emit("torah:use", decision.passage);
    }
    if (this.pendingUse) {
      this.pendingUse = null;
      this.publishResult({ ok: false, reason: "TARGET_UNAVAILABLE", requestId: options.requestId || null });
    }
    return options.returnResult ? this.completedUseResult : true;
  }
  receiveTarget(payload) {
    this.selectedTarget = payload?.attackable ? payload : null;
  }
  clearTarget(payload) {
    if (!payload?.id || payload.id === this.selectedTarget?.id) this.selectedTarget = null;
  }
  receiveLegacyAbility(payload) {
    if (!this.pendingUse) return;
    const accepted2 = payload?.results?.some((result) => result.accepted) || false;
    this.receiveImpact({
      ...payload,
      accepted: accepted2,
      reason: accepted2 ? null : payload?.results?.[0]?.reason || "ABILITY_REJECTED"
    });
  }
  receiveLegacyWard(payload) {
    if (this.pendingUse) this.receiveImpact({ accepted: true, ...payload, results: [] });
  }
  receiveImpact(impact) {
    const pending = this.pendingUse;
    if (!pending) return;
    this.pendingUse = null;
    if (!impact?.accepted) {
      this.publishResult({ ok: false, reason: impact?.reason || "ABILITY_REJECTED", requestId: pending.requestId });
      return;
    }
    const now2 = this.clock();
    if (!this.focus.spend(pending.focusCost, now2)) {
      this.publishResult({ ok: false, reason: "INSUFFICIENT_FOCUS", requestId: pending.requestId });
      return;
    }
    this.inventory.markPassageUsed(pending.passage.id, now2);
    this.publishResult({
      ...impact,
      focus: this.focus.snapshot(now2),
      ok: true,
      passage: pending.passage,
      requestId: pending.requestId
    });
  }
  publishResult(result) {
    this.completedUseResult = result;
    this.bus.emit("torah:result", result);
    return result;
  }
  snapshot() {
    return {
      focus: this.focus.snapshot(this.clock()),
      selectedTarget: this.selectedTarget ? { ...this.selectedTarget } : null,
      selectedTargetId: this.selectedTarget?.id || null
    };
  }
  destroy() {
    for (const unsubscribe of this.unsubscribers) unsubscribe();
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/ShliachProfileCatalog.js
var SHLIACH_ATTRIBUTES = Object.freeze({
  binah: attribute3("Binah", "\u{1F9E0}", "Faster cooldown recovery", 10),
  chochmah: attribute3("Chochmah", "\u2728", "Larger focus reserve", 10),
  daas: attribute3("Daas", "\u{1F9ED}", "Longer tracking range", 10),
  gevurah: attribute3("Gevurah", "\u2694\uFE0F", "Stronger light damage", 10),
  haganah: attribute3("Haganah", "\u{1F6E1}\uFE0F", "Greater armor", 10)
});
var SHLIACH_POWERUPS = Object.freeze({
  "binah-flow": powerup("Binah Flow", "\u{1F9E0}", "binah", 25, 45e3, {
    cooldownMultiplier: 0.82
  }),
  "chochmah-light": powerup("Chochmah Light", "\u2728", "chochmah", 20, 45e3, {
    focusBonus: 18
  }),
  "daas-compass": powerup("Daas Compass", "\u{1F9ED}", "daas", 18, 6e4, {
    trackingBonus: 90
  }),
  "gevurah-courage": powerup("Gevurah Courage", "\u2694\uFE0F", "gevurah", 30, 3e4, {
    damageBonus: 12
  }),
  "haganah-aura": powerup("Haganah Aura", "\u{1F6E1}\uFE0F", "haganah", 30, 35e3, {
    armorBonus: 18
  })
});
function defaultShliachAttributes() {
  return Object.fromEntries(
    Object.keys(SHLIACH_ATTRIBUTES).map((attributeId) => [attributeId, 1])
  );
}
function deriveShliachStats(attributes, level = 1) {
  const total = Object.values(attributes).reduce(
    (sum2, value3) => sum2 + Number(value3 || 0),
    0
  );
  return {
    armor: attributes.haganah * 3,
    cooldownMultiplier: Math.max(0.6, 1 - attributes.binah * 0.03),
    damageBonus: attributes.gevurah * 2,
    focusMaximum: 20 + attributes.chochmah * 4,
    powerRating: level * 10 + total * 5,
    trackingRange: 70 + attributes.daas * 15
  };
}
function applyShliachPowerups(derived, activePowerups) {
  const result = { ...derived };
  for (const powerupId of Object.keys(activePowerups)) {
    const effect2 = SHLIACH_POWERUPS[powerupId]?.effect || {};
    if (effect2.focusBonus) result.focusMaximum += effect2.focusBonus;
    if (effect2.damageBonus) result.damageBonus += effect2.damageBonus;
    if (effect2.armorBonus) result.armor += effect2.armorBonus;
    if (effect2.trackingBonus) result.trackingRange += effect2.trackingBonus;
    if (effect2.cooldownMultiplier) {
      result.cooldownMultiplier *= effect2.cooldownMultiplier;
    }
  }
  return result;
}
function attribute3(name, icon, effect2, maximum) {
  return Object.freeze({ effect: effect2, icon, maximum, name });
}
function powerup(name, icon, attributeId, cost, durationMs, effect2) {
  return Object.freeze({
    attributeId,
    cost,
    durationMs,
    effect: Object.freeze(effect2),
    icon,
    name
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/ShliachProfileRules.js
var BASE_LEVEL_XP = 200;
var LEVEL_XP_GROWTH = 1.35;
function createShliachProfileState(overrides = {}) {
  return {
    activePowerups: {},
    attributes: defaultShliachAttributes(),
    level: 1,
    mitzvahPoints: 0,
    perutas: null,
    unspentPoints: 3,
    xp: 0,
    ...structuredClone(overrides)
  };
}
function allocateShliachAttribute(state, attributeId, points) {
  const definition = SHLIACH_ATTRIBUTES[attributeId];
  if (!definition) throw new Error("ATTRIBUTE_NOT_FOUND");
  if (!Number.isInteger(points) || points < 1 || points > 5) {
    throw new Error("INVALID_ATTRIBUTE_POINTS");
  }
  if (state.unspentPoints < points) throw new Error("ATTRIBUTE_POINTS_UNAVAILABLE");
  if (state.attributes[attributeId] + points > definition.maximum) {
    throw new Error("ATTRIBUTE_MAXIMUM");
  }
  state.attributes[attributeId] += points;
  state.unspentPoints -= points;
}
function awardShlichusProgress(state, reward2 = {}) {
  state.xp += nonNegativeInteger(reward2.xp);
  state.mitzvahPoints += nonNegativeInteger(reward2.mitzvahPoints);
  let levelsGained = 0;
  while (state.xp >= xpForNextLevel(state.level)) {
    state.xp -= xpForNextLevel(state.level);
    state.level += 1;
    state.unspentPoints += 2;
    levelsGained += 1;
  }
  return levelsGained;
}
function xpForNextLevel(level) {
  return Math.round(BASE_LEVEL_XP * Math.pow(LEVEL_XP_GROWTH, Math.max(0, level - 1)));
}
function activateShliachPowerup(state, inventory, powerupId, now2) {
  const definition = SHLIACH_POWERUPS[powerupId];
  if (!definition) throw new Error("POWERUP_NOT_FOUND");
  if (state.perutas != null) {
    if (state.perutas < definition.cost) throw new Error("INSUFFICIENT_FUNDS");
    state.perutas -= definition.cost;
  } else {
    if (!inventory) throw new Error("PERUTA_WALLET_UNAVAILABLE");
    inventory.remove("perutas", definition.cost);
  }
  state.activePowerups[powerupId] = {
    activatedAt: now2,
    expiresAt: now2 + definition.durationMs
  };
}
function synchronizeShliachProfile(state, payload) {
  const source = payload?.shliach || payload;
  if (!source) return;
  for (const key of PROFILE_KEYS) {
    if (source[key] !== void 0) state[key] = structuredClone(source[key]);
  }
}
function removeExpiredShliachPowerups(state, now2) {
  for (const [powerupId, powerup2] of Object.entries(state.activePowerups)) {
    if (powerup2.expiresAt <= now2) delete state.activePowerups[powerupId];
  }
}
function nonNegativeInteger(value3) {
  return Math.max(0, Math.trunc(Number(value3) || 0));
}
var PROFILE_KEYS = Object.freeze([
  "activePowerups",
  "attributes",
  "level",
  "mitzvahPoints",
  "perutas",
  "unspentPoints",
  "xp"
]);

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/ShliachProfileStore.js
var ShliachProfileStore = class {
  constructor(options = {}) {
    this.clock = options.clock || Date.now;
    this.inventory = options.inventory || null;
    this.state = createShliachProfileState(options.state);
    this.listeners = /* @__PURE__ */ new Set();
    this.inventoryUnsubscribe = this.inventory?.onChange(() => {
      if (this.state.perutas == null) this.publish();
    });
  }
  onChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  allocate(attributeId, points = 1) {
    allocateShliachAttribute(this.state, attributeId, points);
    return this.publish();
  }
  activate(powerupId) {
    activateShliachPowerup(this.state, this.inventory, powerupId, this.clock());
    return this.publish();
  }
  award(reward2, sourceId = null) {
    const levelsGained = awardShlichusProgress(this.state, reward2);
    return {
      levelsGained,
      sourceId,
      state: this.publish()
    };
  }
  synchronize(payload) {
    synchronizeShliachProfile(this.state, payload);
    return this.publish();
  }
  serializableState() {
    removeExpiredShliachPowerups(this.state, this.clock());
    return structuredClone(this.state);
  }
  snapshot() {
    const base = deriveShliachStats(this.state.attributes, this.state.level);
    return structuredClone({
      ...this.serializableState(),
      attributesCatalog: SHLIACH_ATTRIBUTES,
      derived: applyShliachPowerups(base, this.state.activePowerups),
      perutas: this.perutas(),
      powerupsCatalog: SHLIACH_POWERUPS
    });
  }
  perutas() {
    if (Number.isFinite(this.state.perutas)) return this.state.perutas;
    const stack2 = this.inventory?.snapshot().items.find((item2) => item2.itemId === "perutas");
    return stack2?.quantity || 0;
  }
  publish() {
    const snapshot2 = this.snapshot();
    for (const listener of this.listeners) listener(snapshot2);
    return snapshot2;
  }
  destroy() {
    this.inventoryUnsubscribe?.();
    this.listeners.clear();
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/ShlichusPersistence.js
var DEFAULT_KEY2 = "awtsmoos.mitzvahWorld.shlichus.v1";
var ShlichusPersistence = class {
  constructor(options = {}) {
    this.key = options.key || DEFAULT_KEY2;
    this.storage = resolveStorage2(options);
    this.diagnostics = { clears: 0, failures: 0, reads: 0, restored: false, writes: 0 };
  }
  load() {
    this.diagnostics.reads += 1;
    if (!this.storage) return null;
    try {
      const value3 = this.storage.getItem(this.key);
      const restored = value3 ? JSON.parse(value3) : null;
      this.diagnostics.restored = Boolean(restored);
      return restored;
    } catch {
      this.diagnostics.failures += 1;
      return null;
    }
  }
  save(value3) {
    if (!this.storage) return false;
    try {
      this.storage.setItem(this.key, JSON.stringify(value3));
      this.diagnostics.writes += 1;
      return true;
    } catch {
      this.diagnostics.failures += 1;
      return false;
    }
  }
  clear() {
    try {
      this.storage?.removeItem?.(this.key);
      this.diagnostics.clears += 1;
      return true;
    } catch {
      this.diagnostics.failures += 1;
      return false;
    }
  }
  snapshot() {
    return { ...this.diagnostics, available: Boolean(this.storage), key: this.key };
  }
};
function resolveStorage2(options) {
  if ("storage" in options) return options.storage;
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/ShlichusRewardService.js
var ShlichusRewardService = class {
  constructor(options) {
    this.adventures = options.adventures;
    this.inventory = options.inventory || null;
    this.profile = options.profile;
    this.granted = new Set(options.grantedQuestIds || []);
    this.onGrant = options.onGrant || (() => {
    });
  }
  reconcile(snapshot2 = this.adventures.snapshot()) {
    const grants = [];
    for (const record of snapshot2.completed || []) {
      const questId = record.definition.id;
      if (this.granted.has(questId)) continue;
      const reward2 = record.definition.reward || {};
      this.validateInventoryReward(reward2);
      const profile3 = this.profile.award(reward2, questId);
      this.grantInventoryReward(reward2);
      this.granted.add(questId);
      const grant = {
        profile: profile3,
        questId,
        reward: structuredClone(reward2),
        worldEffects: structuredClone(record.definition.worldEffects || [])
      };
      grants.push(grant);
      this.onGrant(grant);
    }
    return grants;
  }
  snapshot() {
    return [...this.granted].sort();
  }
  validateInventoryReward(reward2) {
    if (!this.inventory) return;
    for (const item2 of reward2.items || []) {
      if (!inventoryDefinition(item2.itemId)) throw new Error(`Unknown reward item: ${item2.itemId}`);
    }
    for (const passageId of reward2.passages || []) {
      if (!torahPassage(passageId)) throw new Error(`Unknown reward passage: ${passageId}`);
    }
  }
  grantInventoryReward(reward2) {
    if (!this.inventory) return;
    const perutas = nonNegativeInteger2(reward2.perutas);
    if (perutas) this.inventory.add("perutas", perutas);
    for (const item2 of reward2.items || []) {
      this.inventory.add(item2.itemId, nonNegativeInteger2(item2.quantity) || 1);
    }
    for (const passageId of reward2.passages || []) this.inventory.learn(passageId);
  }
};
function nonNegativeInteger2(value3) {
  return Math.max(0, Math.trunc(Number(value3) || 0));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/gameplay/ShlichusRuntimeCoordinator.js
var ShlichusRuntimeCoordinator = class {
  constructor(options) {
    this.adventures = options.adventures;
    this.profile = options.profile;
    this.inventory = options.inventory || null;
    this.persistence = options.persistence || new ShlichusPersistence(options.persistenceOptions);
    this.bus = options.bus;
    this.mutating = true;
    this.persistedSignature = "";
    const saved = this.persistence.load();
    if (saved?.adventures) this.adventures.restore(saved.adventures);
    if (saved?.inventory) this.inventory?.restore?.(saved.inventory);
    if (saved?.profile) this.profile.synchronize(saved.profile);
    const restoredGrantIds = new Set(saved?.grantedQuestIds || []);
    this.rewards = new ShlichusRewardService({
      adventures: this.adventures,
      grantedQuestIds: saved?.grantedQuestIds,
      inventory: this.inventory,
      onGrant: (grant) => this.publishGrant(grant),
      profile: this.profile
    });
    this.rewards.reconcile();
    this.restoreWorldEffects(restoredGrantIds);
    this.mutating = false;
    this.unsubscribers = [
      this.adventures.onChange((snapshot2) => this.changed(snapshot2)),
      this.inventory?.onChange?.(() => this.persist()),
      this.profile.onChange(() => this.persist())
    ].filter(Boolean);
    this.persist();
  }
  changed(snapshot2) {
    this.mutating = true;
    try {
      this.rewards.reconcile(snapshot2);
    } finally {
      this.mutating = false;
    }
    this.persist();
  }
  persist() {
    if (this.mutating) return false;
    const state = this.serializableState();
    const signature = JSON.stringify(state);
    if (signature === this.persistedSignature) return false;
    const saved = this.persistence.save(state);
    if (saved) this.persistedSignature = signature;
    return saved;
  }
  publishGrant(grant) {
    this.bus?.emit("quest:reward", grant);
    this.publishWorldEffects(grant.questId, grant.worldEffects, "completion");
  }
  publishWorldEffects(questId, effects, source) {
    for (const effect2 of effects || []) {
      this.bus?.emit("quest:world-state", { ...effect2, questId, source });
      this.bus?.emit(effect2.type, { questId, source, state: effect2.state, target: effect2.target });
    }
  }
  restoreWorldEffects(grantedQuestIds) {
    for (const record of this.adventures.snapshot().completed || []) {
      const questId = record.definition.id;
      if (!grantedQuestIds.has(questId)) continue;
      this.publishWorldEffects(questId, record.definition.worldEffects, "restore");
    }
  }
  serializableState() {
    return {
      adventures: this.adventures.serialize(),
      grantedQuestIds: this.rewards.snapshot(),
      inventory: this.inventory?.serializableState?.() || null,
      profile: this.profile.serializableState(),
      version: 2
    };
  }
  snapshot() {
    return { ...this.serializableState(), persistence: this.persistence.snapshot() };
  }
  destroy() {
    for (const unsubscribe of this.unsubscribers) unsubscribe();
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/GameplayActionGateway.js
var GameplayActionGateway = class {
  constructor(options) {
    this.actions = options.actions || {};
    this.inventory = options.inventory;
    this.profile = options.profile;
  }
  async allocateAttribute(attributeId, points) {
    const result = this.actions.allocateAttribute ? await this.actions.allocateAttribute(attributeId, points) : this.profile.allocate(attributeId, points);
    return synchronizeResult(this.profile, result);
  }
  async activatePowerup(powerupId) {
    const result = this.actions.activatePowerup ? await this.actions.activatePowerup(powerupId) : this.profile.activate(powerupId);
    return synchronizeResult(this.profile, result);
  }
  async buyItem(itemId, quantity2) {
    return this.actions.buyItem ? this.actions.buyItem(itemId, quantity2) : this.inventory.buy(itemId, quantity2);
  }
};
function synchronizeResult(store, result) {
  const payload = result?.payload || result;
  if (payload?.shliach || payload?.attributes) {
    return store.synchronize(payload);
  }
  return result;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/PanelCoordinator.js
var PanelCoordinator = class {
  constructor() {
    this.panels = /* @__PURE__ */ new Map();
    this.activeId = null;
    this.keyHandler = (event) => this.onKey(event);
    addEventListener("keydown", this.keyHandler);
  }
  register(panelId, panel) {
    if (!panel?.setOpen) {
      throw new Error(`Panel ${panelId} requires setOpen().`);
    }
    const originalSetOpen = panel.setOpen.bind(panel);
    const record = {
      originalSetOpen,
      panel
    };
    this.panels.set(panelId, record);
    panel.setOpen = (open) => this.apply(panelId, Boolean(open));
    return () => this.unregister(panelId);
  }
  unregister(panelId) {
    const record = this.panels.get(panelId);
    if (!record) return;
    record.panel.setOpen = record.originalSetOpen;
    this.panels.delete(panelId);
    if (this.activeId === panelId) this.activeId = null;
  }
  toggle(panelId) {
    if (this.activeId === panelId) {
      this.close(panelId);
      return false;
    }
    this.open(panelId);
    return true;
  }
  open(panelId) {
    const record = this.requirePanel(panelId);
    record.panel.setOpen(true);
  }
  close(panelId = this.activeId) {
    if (!panelId) return;
    this.panels.get(panelId)?.panel.setOpen(false);
  }
  notify(panelId, open) {
    const record = this.panels.get(panelId);
    if (!record) return;
    if (open) this.apply(panelId, true, false);
    else if (this.activeId === panelId) this.activeId = null;
  }
  apply(panelId, open, callTarget = true) {
    const record = this.requirePanel(panelId);
    if (open) {
      for (const [otherId, other] of this.panels) {
        if (otherId !== panelId) other.originalSetOpen(false);
      }
      if (callTarget) record.originalSetOpen(true);
      this.activeId = panelId;
      return;
    }
    if (callTarget) record.originalSetOpen(false);
    if (this.activeId === panelId) this.activeId = null;
  }
  requirePanel(panelId) {
    const record = this.panels.get(panelId);
    if (!record) throw new Error(`Unknown panel: ${panelId}`);
    return record;
  }
  onKey(event) {
    if (event.key !== "Escape" || !this.activeId) return;
    event.preventDefault();
    this.close();
  }
  destroy() {
    removeEventListener("keydown", this.keyHandler);
    for (const panelId of [...this.panels.keys()]) {
      this.unregister(panelId);
    }
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/QuestLogPanel.js
var QuestLogPanel = class {
  constructor(store) {
    this.store = store;
    this.open = false;
    this.tab = "active";
    this.root = document.createElement("section");
    this.root.className = "Awtsmoos-quest-log Awtsmoos-gameplay";
    this.root.hidden = true;
    document.body.appendChild(this.root);
    this.unsubscribe = store.onChange(() => this.render());
    this.render();
  }
  setOpen(open) {
    this.open = Boolean(open);
    this.root.hidden = !this.open;
    if (this.open) this.render();
  }
  toggle() {
    this.setOpen(!this.open);
  }
  render() {
    const snapshot2 = this.store.snapshot();
    this.root.innerHTML = `
			<header class="Awtsmoos-panel-header">
				<h2>\u{1F4DC} Shlichus Log</h2><span>${snapshot2.active.length} active</span>
				<button class="Awtsmoos-quest-button" data-close>Close</button>
			</header>
			<nav class="Awtsmoos-quest-tabs" aria-label="Quest states">
				${tabButton("active", snapshot2.active.length, this.tab)}
				${tabButton("available", snapshot2.available.length, this.tab)}
				${tabButton("completed", snapshot2.completed.length, this.tab)}
			</nav>
			<div data-quest-list></div>
		`;
    this.root.querySelector("[data-close]").addEventListener("click", () => this.setOpen(false));
    this.root.querySelectorAll("[data-tab]").forEach((button2) => {
      button2.addEventListener("click", () => {
        this.tab = button2.dataset.tab;
        this.render();
      });
    });
    const records = snapshot2[this.tab] || [];
    this.root.querySelector("[data-quest-list]").replaceChildren(...records.map((record) => this.questCard(record)));
  }
  questCard(record) {
    const card = document.createElement("article");
    card.className = "Awtsmoos-quest-card";
    const objective3 = record.objectives[record.objectiveIndex] || record.objectives.at(-1);
    const progress = objective3 ? objective3.progress / objective3.count : 1;
    card.innerHTML = `
			<h3>${record.pinned ? "\u{1F4CC} " : ""}${escapeHtml(record.definition.name)}</h3>
			<p>${escapeHtml(record.definition.description)}</p>
			${objective3 ? `<p><b>${escapeHtml(objective3.description)}</b> ${objective3.progress}/${objective3.count}</p><div class="Awtsmoos-progress"><span style="width:${Math.min(100, progress * 100)}%"></span></div>` : ""}
			<p>Reward: ${record.definition.reward.xp} XP \xB7 ${record.definition.reward.mitzvahPoints} points</p>
			<footer></footer>
		`;
    const footer = card.querySelector("footer");
    if (record.status === "active") {
      footer.append(
        actionButton2(record.pinned ? "Unpin" : "Pin", () => this.store.togglePin(record.definition.id)),
        actionButton2("Abandon", () => this.store.abandon(record.definition.id))
      );
    }
    if (["available", "declined", "offered"].includes(record.status)) {
      footer.append(actionButton2("Accept", () => this.store.accept(record.definition.id)));
    }
    return card;
  }
  destroy() {
    this.unsubscribe();
    this.root.remove();
  }
};
function tabButton(id, count, selected) {
  return `<button data-tab="${id}" aria-selected="${id === selected}">${id} (${count})</button>`;
}
function actionButton2(label, action2) {
  const button2 = document.createElement("button");
  button2.className = "Awtsmoos-quest-button";
  button2.type = "button";
  button2.textContent = label;
  button2.addEventListener("click", action2);
  return button2;
}
function escapeHtml(value3) {
  return String(value3).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/QuestOfferPanel.js
var QuestOfferPanel = class {
  constructor(store) {
    this.store = store;
    this.questId = null;
    this.root = document.createElement("div");
    this.root.className = "Awtsmoos-modal-backdrop Awtsmoos-gameplay";
    this.root.hidden = true;
    document.body.appendChild(this.root);
  }
  open(questId) {
    const record = this.store.get(questId);
    if (!record) throw new Error(`Unknown quest offer: ${questId}`);
    this.questId = questId;
    this.store.offer(questId);
    this.render(record.definition);
    this.root.hidden = false;
  }
  close() {
    this.root.hidden = true;
    this.questId = null;
  }
  render(definition) {
    this.root.replaceChildren(createOffer(definition));
    this.root.querySelector("[data-accept]").addEventListener("click", () => {
      this.store.accept(definition.id);
      this.close();
    });
    this.root.querySelector("[data-decline]").addEventListener("click", () => {
      this.store.decline(definition.id);
      this.close();
    });
  }
  destroy() {
    this.root.remove();
  }
};
function createOffer(definition) {
  const panel = document.createElement("article");
  panel.className = "Awtsmoos-quest-offer";
  const title2 = document.createElement("h2");
  title2.textContent = `! ${definition.name}`;
  const giver = document.createElement("p");
  giver.className = "giver";
  giver.textContent = `Offered by ${definition.giver.name}`;
  const description = document.createElement("p");
  description.textContent = definition.description;
  const objectives = document.createElement("ol");
  objectives.className = "Awtsmoos-objectives";
  for (const objective3 of definition.objectives) {
    const item2 = document.createElement("li");
    item2.textContent = `${objective3.description} (${objective3.count})`;
    objectives.appendChild(item2);
  }
  const reward2 = document.createElement("p");
  reward2.textContent = `Reward: ${definition.reward.xp} XP \xB7 ${definition.reward.mitzvahPoints} mitzvah points`;
  const actions = document.createElement("div");
  actions.className = "Awtsmoos-offer-actions";
  actions.append(button("Decline", "decline"), button("Accept Shlichus", "accept"));
  panel.append(title2, giver, description, objectives, reward2, actions);
  return panel;
}
function button(label, action2) {
  const element2 = document.createElement("button");
  element2.type = "button";
  element2.dataset[action2] = "";
  element2.textContent = label;
  return element2;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/QuestTracker.js
var QuestTracker = class {
  constructor(store, onOpenLog = () => {
  }) {
    this.store = store;
    this.onOpenLog = onOpenLog;
    this.root = document.createElement("aside");
    this.root.className = "Awtsmoos-quest-tracker Awtsmoos-gameplay";
    document.body.appendChild(this.root);
    this.unsubscribe = store.onChange((snapshot2) => this.render(snapshot2));
    this.render(store.snapshot());
  }
  render(snapshot2) {
    this.root.hidden = snapshot2.pinned.length === 0;
    this.root.replaceChildren();
    if (!snapshot2.pinned.length) return;
    const header = document.createElement("button");
    header.className = "Awtsmoos-quest-button";
    header.textContent = "\u{1F4DC} Pinned Shlichus";
    header.addEventListener("click", this.onOpenLog);
    this.root.appendChild(header);
    for (const record of snapshot2.pinned) this.root.appendChild(trackedQuest(record));
  }
  destroy() {
    this.unsubscribe();
    this.root.remove();
  }
};
function trackedQuest(record) {
  const objective3 = record.objectives[record.objectiveIndex];
  const item2 = document.createElement("div");
  item2.className = "Awtsmoos-tracked-quest";
  const title2 = document.createElement("b");
  title2.textContent = record.definition.name;
  const progress = document.createElement("div");
  progress.textContent = objective3 ? `${objective3.description} ${objective3.progress}/${objective3.count}` : "Return for the reward.";
  item2.append(title2, progress);
  return item2;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/ShliachProfilePanel.js
var ShliachProfilePanel = class {
  constructor(store, options = {}) {
    this.store = store;
    this.onAllocate = options.onAllocate || ((id, points) => store.allocate(id, points));
    this.onActivate = options.onActivate || ((id) => store.activate(id));
    this.open = false;
    this.root = document.createElement("section");
    this.root.className = "Awtsmoos-sheet Awtsmoos-profile-panel Awtsmoos-gameplay";
    this.root.hidden = true;
    document.body.appendChild(this.root);
    this.unsubscribe = store.onChange((state) => this.render(state));
    this.render(store.snapshot());
  }
  setOpen(open) {
    this.open = Boolean(open);
    this.root.hidden = !this.open;
    if (this.open) this.render(this.store.snapshot());
  }
  render(state) {
    this.root.innerHTML = `
			<header class="Awtsmoos-sheet-header">
				<div><small>Level ${state.level}</small><h2>\u{1F31F} Shliach Profile</h2></div>
				<button data-close aria-label="Close profile">\xD7</button>
			</header>
			<div class="Awtsmoos-profile-summary">
				<span>Power <b>${state.derived.powerRating}</b></span>
				<span>Perutas <b>${state.perutas}</b></span>
				<span>Points <b>${state.unspentPoints}</b></span>
			</div>
			<h3>Attributes</h3><div class="Awtsmoos-stat-grid" data-attributes></div>
			<h3>Derived Strength</h3><div class="Awtsmoos-derived-grid">${derivedHtml(state.derived)}</div>
			<h3>Timed Powerups</h3><div class="Awtsmoos-powerup-grid" data-powerups></div>
			<p class="Awtsmoos-panel-message" data-message></p>
		`;
    this.root.querySelector("[data-close]").addEventListener("click", () => this.setOpen(false));
    this.root.querySelector("[data-attributes]").replaceChildren(...attributeCards(state));
    this.root.querySelector("[data-powerups]").replaceChildren(...powerupCards(state));
    this.bindActions();
  }
  bindActions() {
    this.root.querySelectorAll("[data-allocate]").forEach((button2) => {
      button2.addEventListener("click", () => this.perform(() => this.onAllocate(button2.dataset.allocate, 1)));
    });
    this.root.querySelectorAll("[data-powerup]").forEach((button2) => {
      button2.addEventListener("click", () => this.perform(() => this.onActivate(button2.dataset.powerup)));
    });
  }
  async perform(operation) {
    try {
      const result = await operation();
      if (result?.shliach || result?.attributes) this.store.synchronize(result);
      this.render(this.store.snapshot());
    } catch (error) {
      this.root.querySelector("[data-message]").textContent = humanError(error);
    }
  }
  destroy() {
    this.unsubscribe();
    this.root.remove();
  }
};
function attributeCards(state) {
  return Object.entries(state.attributesCatalog).map(([id, definition]) => {
    const card = document.createElement("article");
    card.className = "Awtsmoos-stat-card";
    card.innerHTML = `<span>${definition.icon}</span><div><b>${definition.name}</b><small>${definition.effect}</small></div><strong>${state.attributes[id]}</strong><button data-allocate="${id}" ${state.unspentPoints < 1 || state.attributes[id] >= definition.maximum ? "disabled" : ""}>+</button>`;
    return card;
  });
}
function powerupCards(state) {
  return Object.entries(state.powerupsCatalog).map(([id, definition]) => {
    const active = state.activePowerups[id];
    const card = document.createElement("article");
    card.className = "Awtsmoos-powerup-card";
    card.innerHTML = `<span>${definition.icon}</span><div><b>${definition.name}</b><small>${definition.cost} Perutas \xB7 ${Math.round(definition.durationMs / 1e3)}s</small></div><button data-powerup="${id}" ${active || state.perutas < definition.cost ? "disabled" : ""}>${active ? "Active" : "Activate"}</button>`;
    return card;
  });
}
function derivedHtml(stats3) {
  return `<span>\u2694\uFE0F +${stats3.damageBonus}</span><span>\u{1F6E1}\uFE0F ${stats3.armor}</span><span>\u{1F4D8} ${stats3.focusMaximum}</span><span>\u{1F9ED} ${stats3.trackingRange}m</span>`;
}
function humanError(error) {
  return String(error?.message || error).replaceAll("_", " ").toLowerCase();
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/StatusRibbon.js
var StatusRibbon = class {
  constructor(profileStore) {
    this.store = profileStore;
    this.root = document.createElement("aside");
    this.root.className = "Awtsmoos-status-ribbon Awtsmoos-gameplay";
    document.body.appendChild(this.root);
    this.unsubscribe = profileStore.onChange((state) => this.render(state));
    this.render(profileStore.snapshot());
  }
  render(state) {
    const effects = Object.entries(state.activePowerups).map(([powerupId, active]) => {
      const definition = state.powerupsCatalog[powerupId];
      const seconds = Math.max(0, Math.ceil((active.expiresAt - Date.now()) / 1e3));
      return `<span title="${escapeHtml2(definition.name)}">${definition.icon}${seconds}s</span>`;
    }).join("");
    this.root.innerHTML = `
			<strong>Lv ${state.level}</strong>
			<span title="Shliach power">\u{1F31F} ${state.derived.powerRating}</span>
			<span title="Perutas">\u{1FA99} ${state.perutas}</span>
			<span title="Mitzvah points">\u2728 ${state.mitzvahPoints}</span>
			<span title="Focus maximum">\u{1F4D8} ${state.derived.focusMaximum}</span>
			<span title="Armor">\u{1F6E1}\uFE0F ${state.derived.armor}</span>
			<span class="Awtsmoos-powerup-timers">${effects}</span>
		`;
  }
  destroy() {
    this.unsubscribe();
    this.root.remove();
  }
};
function escapeHtml2(value3) {
  return String(value3 ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/TorahLibraryPanel.js
var TorahLibraryPanel = class {
  constructor(inventoryStore, options = {}) {
    this.store = inventoryStore;
    this.getFocus = options.getFocus || (() => null);
    this.onAssign = options.onAssign || (() => {
    });
    this.onUse = options.onUse || (() => {
    });
    this.open = false;
    this.dirty = false;
    this.domUpdates = 0;
    this.root = document.createElement("section");
    this.root.className = "Awtsmoos-torah-library Awtsmoos-gameplay";
    this.root.hidden = true;
    document.body.appendChild(this.root);
    this.unsubscribe = inventoryStore.onChange(() => this.changed());
    this.render(true);
  }
  changed() {
    if (this.open) this.render();
    else this.dirty = true;
  }
  setOpen(open) {
    this.open = Boolean(open);
    this.root.hidden = !this.open;
    if (this.open && this.dirty) this.render();
  }
  toggle() {
    this.setOpen(!this.open);
  }
  render(force = false) {
    if (!this.open && !force) {
      this.dirty = true;
      return false;
    }
    const state = this.store.snapshot();
    const focus = this.getFocus() || { current: state.stats.focus, maximum: state.stats.focus };
    this.root.innerHTML = `
			<header class="Awtsmoos-panel-header">
				<h2>\u{1F4DA} Torah Sefarim</h2><span>Focus ${Math.floor(focus.current)} / ${Math.floor(focus.maximum)}</span>
				<button class="Awtsmoos-quest-button" data-close>Close</button>
			</header>
			<p>Learn a passage, use it directly, or place it on the Torah action bar.</p>
			<div class="Awtsmoos-book-grid" data-books></div>
		`;
    this.root.querySelector("[data-close]").addEventListener("click", () => this.setOpen(false));
    this.root.querySelector("[data-books]").replaceChildren(...TORAH_BOOKS.map((book2) => this.bookCard(book2, state)));
    this.dirty = false;
    this.domUpdates += 1;
    return true;
  }
  bookCard(book2, state) {
    const owned = state.items.some((item2) => item2.itemId === book2.id);
    const card = document.createElement("article");
    card.className = "Awtsmoos-book";
    const title2 = document.createElement("h3");
    title2.textContent = `${book2.icon} ${book2.name}${owned ? "" : " \xB7 not owned"}`;
    card.appendChild(title2);
    for (const passage2 of book2.passages) card.appendChild(this.passageCard(book2, passage2, state, owned));
    return card;
  }
  passageCard(book2, passage2, state, owned) {
    const learned = state.learned.includes(passage2.id);
    const pinned = state.pinnedPassages.includes(passage2.id);
    const row2 = document.createElement("div");
    row2.className = "Awtsmoos-passage";
    const copy = document.createElement("div");
    copy.append(
      text2("b", passage2.name),
      text2("p", passage2.text),
      text2("small", `${passage2.damage} light \xB7 ${passage2.focusCost} focus \xB7 ${passage2.cooldownMs}ms \xB7 ${passage2.aspect}`)
    );
    const actions = document.createElement("div");
    if (!learned) actions.appendChild(actionButton3("Learn", !owned, () => this.store.learn(passage2.id)));
    if (learned) this.addLearnedActions(actions, book2, passage2, pinned);
    row2.append(copy, actions);
    return row2;
  }
  addLearnedActions(actions, book2, passage2, pinned) {
    const ability3 = torahAbilityForPassage(passage2.id);
    actions.append(
      actionButton3(pinned ? "Unpin" : "Pin", false, () => this.store.togglePassagePin(passage2.id)),
      actionButton3("Use", false, () => this.onUse({ ...passage2, bookId: book2.id }))
    );
    if (!ability3) return;
    const assign = actionButton3("Add to bar", false, () => this.onAssign(ability3.id));
    assign.dataset.torahAbilityId = ability3.id;
    assign.draggable = true;
    actions.appendChild(assign);
  }
  snapshot() {
    return { dirty: this.dirty, domUpdates: this.domUpdates, open: this.open };
  }
  destroy() {
    this.unsubscribe();
    this.root.remove();
  }
};
function actionButton3(label, disabled, action2) {
  const button2 = document.createElement("button");
  button2.className = "Awtsmoos-quest-button";
  button2.disabled = disabled;
  button2.textContent = label;
  button2.addEventListener("click", action2);
  return button2;
}
function text2(tagName, value3) {
  const element2 = document.createElement(tagName);
  element2.textContent = value3;
  return element2;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/VendorPanel.js
var SALE_IDS = Object.freeze([
  "forest-axe",
  "wooden-staff",
  "spark-blade",
  "village-shield",
  "chumash-light",
  "tanya-pocket",
  "wool-kippah",
  "walking-boots"
]);
var VendorPanel = class {
  constructor(inventoryStore, options = {}) {
    this.store = inventoryStore;
    this.onBuy = options.onBuy || ((itemId, quantity2) => storeBuy(inventoryStore, itemId, quantity2));
    this.open = false;
    this.root = document.createElement("section");
    this.root.className = "Awtsmoos-sheet Awtsmoos-vendor-panel Awtsmoos-gameplay";
    this.root.hidden = true;
    document.body.appendChild(this.root);
    this.unsubscribe = inventoryStore.onChange(() => this.render());
    this.render();
  }
  setOpen(open) {
    this.open = Boolean(open);
    this.root.hidden = !this.open;
    if (this.open) this.render();
  }
  render() {
    const state = this.store.snapshot();
    const perutas = state.items.find((item2) => item2.itemId === "perutas")?.quantity || 0;
    this.root.innerHTML = `
			<header class="Awtsmoos-sheet-header">
				<div><small>Village Market</small><h2>\u{1F3EA} Shliach Supplies</h2></div>
				<button data-close aria-label="Close market">\xD7</button>
			</header>
			<p class="Awtsmoos-wallet">\u{1FA99} ${perutas} Perutas available</p>
			<div class="Awtsmoos-vendor-grid" data-items></div>
			<p class="Awtsmoos-panel-message" data-message></p>
		`;
    this.root.querySelector("[data-close]").addEventListener("click", () => this.setOpen(false));
    this.root.querySelector("[data-items]").replaceChildren(...SALE_IDS.map((itemId) => itemCard(itemId, state, perutas)));
    this.root.querySelectorAll("[data-buy]").forEach((button2) => {
      button2.addEventListener("click", () => this.buy(button2.dataset.buy));
    });
  }
  async buy(itemId) {
    try {
      await this.onBuy(itemId, 1);
      this.render();
    } catch (error) {
      this.root.querySelector("[data-message]").textContent = humanError2(error);
    }
  }
  destroy() {
    this.unsubscribe();
    this.root.remove();
  }
};
function itemCard(itemId, state, perutas) {
  const definition = INVENTORY_CATALOG[itemId];
  const owned = state.items.some((item2) => item2.itemId === itemId);
  const disabled = owned || perutas < definition.price;
  const card = document.createElement("article");
  card.className = "Awtsmoos-vendor-card";
  card.innerHTML = `
		<span>${definition.icon}</span>
		<div><b>${definition.name}</b><small>${definition.category} \xB7 \u2694 ${definition.stats.damage} \xB7 \u{1F6E1} ${definition.stats.defense} \xB7 \u2728 ${definition.stats.focus}</small></div>
		<button data-buy="${itemId}" ${disabled ? "disabled" : ""}>${owned ? "Owned" : `${definition.price} \u{1FA99}`}</button>
	`;
  return card;
}
function storeBuy(store, itemId, quantity2) {
  return store.buy(itemId, quantity2);
}
function humanError2(error) {
  return String(error?.message || error).replaceAll("_", " ").toLowerCase();
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/WorldMinimap.js
var WORLD_RADIUS = 210;
var WorldMinimap = class {
  constructor(store) {
    this.store = store;
    this.position = { x: 0, z: 0 };
    this.root = document.createElement("section");
    this.root.className = "Awtsmoos-minimap Awtsmoos-gameplay";
    this.root.dataset.expanded = "false";
    document.body.appendChild(this.root);
    this.unsubscribe = store.onChange(() => this.render());
    this.render();
  }
  setPosition(position) {
    const x = Number(position?.x || 0);
    const z = Number(position?.z || 0);
    if (Math.hypot(x - this.position.x, z - this.position.z) < 1.5) return;
    this.position = { x, z };
    this.renderMarkers();
  }
  toggleExpanded() {
    this.root.dataset.expanded = String(this.root.dataset.expanded !== "true");
  }
  render() {
    this.root.innerHTML = `
			<header><strong>\u{1F5FA}\uFE0F Village Map</strong><button class="Awtsmoos-quest-button" data-expand>Expand</button></header>
			<div class="Awtsmoos-map-canvas" data-map aria-label="Quest map"></div>
		`;
    this.root.querySelector("[data-expand]").addEventListener("click", () => this.toggleExpanded());
    this.renderMarkers();
  }
  renderMarkers() {
    const map = this.root.querySelector("[data-map]");
    if (!map) return;
    map.replaceChildren(playerMarker(this.position));
    const snapshot2 = this.store.snapshot();
    for (const record of snapshot2.available.slice(0, 12)) {
      map.appendChild(marker("!", record.definition.giver.position, record.definition.name, "giver"));
    }
    for (const record of snapshot2.active) {
      const objective3 = record.objectives[record.objectiveIndex];
      if (objective3?.marker) map.appendChild(marker("\u25C6", objective3.marker, objective3.description, "objective"));
    }
  }
  destroy() {
    this.unsubscribe();
    this.root.remove();
  }
};
function playerMarker(position) {
  const element2 = document.createElement("span");
  element2.className = "Awtsmoos-map-player";
  place(element2, position);
  element2.title = "You";
  return element2;
}
function marker(icon, position, label, kind) {
  const element2 = document.createElement("button");
  element2.className = "Awtsmoos-map-marker";
  element2.dataset.kind = kind;
  element2.type = "button";
  element2.textContent = icon;
  element2.title = label;
  place(element2, position);
  return element2;
}
function place(element2, position) {
  element2.style.left = `${percentage(position.x)}%`;
  element2.style.top = `${100 - percentage(position.z)}%`;
}
function percentage(value3) {
  return Math.max(2, Math.min(98, (Number(value3 || 0) + WORLD_RADIUS) / (WORLD_RADIUS * 2) * 100));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/GameplayPanelSuite.js
var GameplayPanelSuite = class {
  constructor(options) {
    this.adventures = options.adventures;
    this.inventory = options.inventory;
    this.profile = options.profile;
    this.inventoryPanel = options.inventoryPanel;
    this.coordinator = new PanelCoordinator();
    this.questLog = new QuestLogPanel(this.adventures);
    this.questOffer = new QuestOfferPanel(this.adventures);
    this.minimap = new WorldMinimap(this.adventures);
    this.torah = new TorahLibraryPanel(this.inventory, {
      getFocus: options.getTorahFocus,
      onAssign: options.onAssignAbility,
      onUse: options.onUsePassage
    });
    this.profilePanel = new ShliachProfilePanel(this.profile, {
      onActivate: options.onActivatePowerup,
      onAllocate: options.onAllocateAttribute
    });
    this.vendor = new VendorPanel(this.inventory, { onBuy: options.onBuyItem });
    this.tracker = new QuestTracker(
      this.adventures,
      () => this.coordinator.open("quests")
    );
    this.ribbon = new StatusRibbon(this.profile);
    this.registerPanels();
  }
  registerPanels() {
    this.coordinator.register("quests", this.questLog);
    this.coordinator.register("torah", this.torah);
    this.coordinator.register("bag", this.inventoryPanel);
    this.coordinator.register("profile", this.profilePanel);
    this.coordinator.register("vendor", this.vendor);
    this.coordinator.register("map", {
      setOpen: (open) => {
        this.minimap.root.dataset.expanded = String(Boolean(open));
      }
    });
  }
  toggle(panelId) {
    return this.coordinator.toggle(panelId);
  }
  notifyInventory(open) {
    this.coordinator.notify("bag", open);
  }
  updatePosition(position) {
    this.minimap.setPosition(position);
  }
  snapshot() {
    return { torahLibrary: this.torah.snapshot() };
  }
  destroy() {
    this.coordinator.destroy();
    this.questLog.destroy();
    this.questOffer.destroy();
    this.minimap.destroy();
    this.torah.destroy();
    this.profilePanel.destroy();
    this.vendor.destroy();
    this.tracker.destroy();
    this.ribbon.destroy();
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/GameplayUiStyles.js
var STYLE_ID2 = "Awtsmoos-gameplay-ui-style";
function installGameplayUiStyles() {
  if (document.getElementById(STYLE_ID2)) {
    return;
  }
  const style = document.createElement("style");
  style.id = STYLE_ID2;
  style.textContent = createGameplayCss();
  document.head.appendChild(style);
}
function createGameplayCss() {
  return `
		:root {
			--ui-gold: #f2c66f;
			--ui-gold-bright: #ffe6a5;
			--ui-ink: #07110f;
			--ui-panel: rgba(7, 17, 15, 0.94);
			--ui-panel-soft: rgba(15, 31, 27, 0.9);
			--ui-line: rgba(242, 198, 111, 0.34);
			--ui-text: #f6f2e8;
			--ui-muted: #b9cbc4;
			--ui-danger: #e46f5f;
			--ui-success: #7bd7a9;
		}
		.Awtsmoos-gameplay,
		.Awtsmoos-gameplay button,
		.Awtsmoos-gameplay input {
			font-family: Inter, ui-sans-serif, system-ui, sans-serif;
		}
		.Awtsmoos-gameplay button {
			border: 1px solid rgba(242, 198, 111, 0.46);
			border-radius: 11px;
			background: linear-gradient(180deg, #493116, #25180c);
			color: #fff0c7;
			font-weight: 800;
			cursor: pointer;
			transition: transform 120ms ease, border-color 120ms ease, filter 120ms ease;
		}
		.Awtsmoos-gameplay button:hover {
			transform: translateY(-1px);
			border-color: var(--ui-gold-bright);
			filter: brightness(1.08);
		}
		.Awtsmoos-gameplay button:focus-visible,
		.Awtsmoos-gameplay [tabindex]:focus-visible {
			outline: 3px solid #ffe08a;
			outline-offset: 3px;
		}
		.Awtsmoos-modal-backdrop {
			position: fixed;
			inset: 0;
			z-index: 910;
			display: grid;
			place-items: center;
			padding: 16px;
			background: rgba(2, 5, 4, 0.72);
			backdrop-filter: blur(10px);
		}
		.Awtsmoos-modal-backdrop[hidden] {
			display: none;
		}
		.Awtsmoos-quest-offer,
		.Awtsmoos-quest-log,
		.Awtsmoos-torah-library {
			border: 1px solid var(--ui-line);
			background: linear-gradient(150deg, rgba(27, 35, 28, 0.97), rgba(6, 14, 12, 0.98));
			color: var(--ui-text);
			box-shadow: 0 26px 90px rgba(0, 0, 0, 0.52), inset 0 1px rgba(255, 255, 255, 0.06);
		}
		.Awtsmoos-quest-offer {
			width: min(620px, 94vw);
			max-height: 88vh;
			overflow: auto;
			padding: 28px;
			border-radius: 24px;
			font-size: 15px;
			line-height: 1.6;
		}
		.Awtsmoos-quest-offer h2,
		.Awtsmoos-panel-header h2 {
			margin: 0;
			color: var(--ui-gold-bright);
			font-family: Georgia, serif;
		}
		.Awtsmoos-quest-offer h2 {
			font-size: clamp(30px, 6vw, 42px);
		}
		.Awtsmoos-quest-offer .giver {
			color: #9fd9c0;
		}
		.Awtsmoos-objectives {
			padding-left: 22px;
		}
		.Awtsmoos-objectives li {
			margin: 8px 0;
		}
		.Awtsmoos-offer-actions {
			display: flex;
			justify-content: flex-end;
			gap: 10px;
		}
		.Awtsmoos-offer-actions button,
		.Awtsmoos-quest-button {
			padding: 11px 15px;
		}
		.Awtsmoos-quest-log,
		.Awtsmoos-torah-library {
			position: fixed;
			inset: 7vh 7vw;
			z-index: 890;
			overflow: auto;
			padding: 20px;
			border-radius: 22px;
			content-visibility: auto;
		}
		.Awtsmoos-quest-log[hidden],
		.Awtsmoos-torah-library[hidden] {
			display: none;
		}
		.Awtsmoos-panel-header {
			position: sticky;
			top: 0;
			z-index: 2;
			display: flex;
			align-items: center;
			gap: 10px;
			padding: 10px 0 14px;
			background: linear-gradient(180deg, #0a1614 70%, transparent);
		}
		.Awtsmoos-panel-header button {
			margin-left: auto;
		}
		.Awtsmoos-quest-tabs {
			display: flex;
			gap: 7px;
			overflow: auto;
			margin: 10px 0 14px;
		}
		.Awtsmoos-quest-tabs button {
			padding: 8px 12px;
			border-color: rgba(126, 166, 150, 0.38);
			border-radius: 999px;
			background: rgba(22, 43, 36, 0.86);
			color: #d8e8e1;
		}
		.Awtsmoos-quest-tabs button[aria-selected="true"] {
			border-color: var(--ui-gold);
			background: #3b2914;
			color: var(--ui-gold-bright);
		}
		.Awtsmoos-quest-card {
			margin: 9px 0;
			padding: 15px;
			border: 1px solid rgba(116, 151, 137, 0.28);
			border-radius: 14px;
			background: linear-gradient(145deg, rgba(18, 35, 30, 0.94), rgba(9, 22, 19, 0.94));
		}
		.Awtsmoos-quest-card h3 {
			margin: 0 0 6px;
			color: #f4d18c;
		}
		.Awtsmoos-quest-card footer {
			display: flex;
			flex-wrap: wrap;
			gap: 7px;
		}
		.Awtsmoos-progress {
			height: 8px;
			overflow: hidden;
			border-radius: 999px;
			background: rgba(255, 255, 255, 0.08);
		}
		.Awtsmoos-progress span {
			display: block;
			height: 100%;
			background: linear-gradient(90deg, #bd8431, #f5d07b, #fff0b5);
		}
		.Awtsmoos-quest-tracker {
			position: fixed;
			top: 78px;
			right: 14px;
			z-index: 720;
			width: min(310px, 42vw);
			padding: 11px;
			border: 1px solid var(--ui-line);
			border-radius: 15px;
			background: var(--ui-panel);
			color: var(--ui-text);
			box-shadow: 0 14px 38px rgba(0, 0, 0, 0.28);
			font-size: 12px;
			backdrop-filter: blur(10px);
		}
		.Awtsmoos-quest-tracker[hidden] {
			display: none;
		}
		.Awtsmoos-tracked-quest {
			margin: 6px 0;
			padding: 8px;
			border-radius: 9px;
			background: rgba(255, 255, 255, 0.045);
		}
		.Awtsmoos-tracked-quest b {
			color: #ffd47e;
		}
		.Awtsmoos-minimap {
			position: fixed;
			right: 14px;
			bottom: 14px;
			z-index: 710;
			width: 220px;
			overflow: hidden;
			border: 1px solid var(--ui-line);
			border-radius: 16px;
			background: var(--ui-panel);
			color: white;
			box-shadow: 0 16px 46px rgba(0, 0, 0, 0.34);
		}
		.Awtsmoos-minimap[data-expanded="true"] {
			right: 4vw;
			bottom: 8vh;
			z-index: 900;
			width: min(720px, 92vw);
			height: min(620px, 82vh);
		}
		.Awtsmoos-minimap header {
			display: flex;
			align-items: center;
			padding: 8px 10px;
		}
		.Awtsmoos-minimap header button {
			margin-left: auto;
		}
		.Awtsmoos-map-canvas {
			position: relative;
			aspect-ratio: 1;
			overflow: hidden;
			background: radial-gradient(circle at 46% 43%, #4d6e50, #1a3128 48%, #0b1814 72%);
		}
		.Awtsmoos-map-canvas::before {
			content: "";
			position: absolute;
			inset: 0;
			background:
				linear-gradient(120deg, transparent 44%, rgba(125, 182, 186, 0.5) 45% 48%, transparent 49%),
				radial-gradient(ellipse at 40% 53%, rgba(83, 127, 164, 0.48) 0 12%, transparent 13%);
		}
		.Awtsmoos-map-marker,
		.Awtsmoos-map-player {
			position: absolute;
			transform: translate(-50%, -50%);
		}
		.Awtsmoos-map-marker {
			border: 0;
			background: transparent;
			font-size: 18px;
			filter: drop-shadow(0 2px 2px #000);
		}
		.Awtsmoos-map-player {
			width: 12px;
			height: 12px;
			border-radius: 50%;
			background: #66e4ff;
			box-shadow: 0 0 10px #55dfff;
		}
		.Awtsmoos-book-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			gap: 11px;
		}
		.Awtsmoos-book {
			padding: 14px;
			border: 1px solid rgba(242, 198, 111, 0.2);
			border-radius: 14px;
			background: rgba(28, 22, 16, 0.9);
		}
		.Awtsmoos-passage {
			display: grid;
			grid-template-columns: 1fr auto;
			gap: 8px;
			margin: 7px 0;
			padding: 10px;
			border-radius: 9px;
			background: rgba(255, 255, 255, 0.045);
		}
		.Awtsmoos-passage small {
			color: #d3c096;
		}
		.Awtsmoos-status-dock {
			position: fixed;
			left: 18px;
			bottom: 18px;
			z-index: 735;
			display: grid;
			gap: 9px;
			width: min(350px, calc(100vw - 36px));
			pointer-events: none;
		}
		.Awtsmoos-status-dock .status-card {
			display: grid;
			grid-template-columns: 54px 1fr auto;
			align-items: center;
			gap: 12px;
			padding: 12px 14px;
			border: 1px solid var(--ui-line);
			border-radius: 17px;
			background: linear-gradient(145deg, rgba(13, 29, 25, 0.94), rgba(5, 14, 12, 0.96));
			color: var(--ui-text);
			box-shadow: 0 16px 42px rgba(0, 0, 0, 0.36), inset 0 1px rgba(255, 255, 255, 0.06);
			backdrop-filter: blur(12px);
			contain: content;
		}
		.Awtsmoos-status-dock .target-card {
			border-color: rgba(242, 198, 111, 0.58);
			background: linear-gradient(145deg, rgba(53, 37, 17, 0.94), rgba(16, 22, 18, 0.97));
		}
		.Awtsmoos-status-dock .status-face {
			display: grid;
			place-items: center;
			width: 50px;
			height: 50px;
			border: 1px solid rgba(242, 198, 111, 0.36);
			border-radius: 15px;
			background: rgba(255, 255, 255, 0.055);
			font-size: 28px;
		}
		.Awtsmoos-status-dock b,
		.Awtsmoos-status-dock small,
		.Awtsmoos-status-dock label {
			display: block;
		}
		.Awtsmoos-status-dock b {
			color: #fff0c6;
			font-size: 14px;
		}
		.Awtsmoos-status-dock small,
		.Awtsmoos-status-dock label {
			margin-top: 2px;
			color: var(--ui-muted);
			font-size: 10px;
		}
		.Awtsmoos-status-dock meter,
		.Awtsmoos-status-dock progress {
			display: block;
			width: 100%;
			height: 7px;
			margin-top: 5px;
			accent-color: var(--ui-success);
		}
		.Awtsmoos-status-dock .target-card meter {
			accent-color: var(--ui-danger);
		}
		.Awtsmoos-status-dock article > strong {
			color: var(--ui-gold-bright);
			font: 700 18px Georgia, serif;
		}
		.Awtsmoos-npc-dialogue {
			position: fixed;
			left: 50%;
			bottom: 28px;
			z-index: 820;
			width: min(640px, calc(100vw - 28px));
			transform: translate(-50%, 18px);
			opacity: 0;
			pointer-events: none;
			transition: transform 160ms ease, opacity 160ms ease;
		}
		.Awtsmoos-npc-dialogue[data-open="true"] {
			transform: translate(-50%, 0);
			opacity: 1;
			pointer-events: auto;
		}
		.Awtsmoos-npc-dialogue section {
			padding: 20px;
			border: 1px solid rgba(242, 198, 111, 0.58);
			border-radius: 20px;
			background: linear-gradient(150deg, rgba(31, 36, 27, 0.98), rgba(6, 14, 12, 0.98));
			color: var(--ui-text);
			box-shadow: 0 24px 70px rgba(0, 0, 0, 0.5), inset 0 1px rgba(255, 255, 255, 0.06);
		}
		.Awtsmoos-npc-dialogue header {
			display: flex;
			align-items: center;
			gap: 12px;
		}
		.Awtsmoos-npc-dialogue header b {
			color: var(--ui-gold-bright);
			font: 600 22px Georgia, serif;
		}
		.Awtsmoos-npc-dialogue header button {
			margin-left: auto;
			width: 38px;
			height: 38px;
		}
		.Awtsmoos-npc-dialogue p {
			color: #d6e3dd;
			line-height: 1.58;
		}
		.Awtsmoos-npc-dialogue section > button {
			margin: 6px 7px 0 0;
			padding: 10px 13px;
		}
		.Awtsmoos-golden-marker {
			position: fixed;
			z-index: 650;
			color: #ffd353;
			font: 700 34px Georgia, serif;
			text-shadow: 0 0 8px #ffb300, 0 3px 3px #000;
			animation: AwtsmoosMarker 1.2s ease-in-out infinite alternate;
		}
		@keyframes AwtsmoosMarker {
			to {
				transform: translateY(-8px);
				filter: brightness(1.25);
			}
		}
		@media (max-width: 650px) {
			.Awtsmoos-quest-log,
			.Awtsmoos-torah-library {
				inset: 3vh 3vw;
			}
			.Awtsmoos-quest-tracker {
				top: 68px;
				right: 8px;
				width: 56vw;
			}
			.Awtsmoos-minimap {
				right: 8px;
				bottom: 82px;
				width: 150px;
			}
			.Awtsmoos-status-dock {
				left: 8px;
				bottom: 82px;
				width: min(310px, calc(100vw - 16px));
			}
			.Awtsmoos-npc-dialogue {
				bottom: 12px;
			}
		}
		@media (prefers-reduced-motion: reduce) {
			.Awtsmoos-gameplay *,
			.Awtsmoos-gameplay *::before,
			.Awtsmoos-gameplay *::after {
				animation-duration: 0.001ms !important;
				transition-duration: 0.001ms !important;
			}
		}
	`;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/ResponsiveGameplayStyles.js
var STYLE_ID3 = "Awtsmoos-responsive-gameplay-style";
function installResponsiveGameplayStyles() {
  if (document.getElementById(STYLE_ID3)) {
    return;
  }
  const style = document.createElement("style");
  style.id = STYLE_ID3;
  style.textContent = responsiveCss();
  document.head.appendChild(style);
}
function responsiveCss() {
  return `
		.Awtsmoos-sheet {
			position: fixed;
			top: max(64px, env(safe-area-inset-top));
			right: max(10px, env(safe-area-inset-right));
			bottom: max(64px, env(safe-area-inset-bottom));
			z-index: 905;
			width: min(400px, calc(100vw - 20px));
			overflow: auto;
			padding: 13px;
			border: 1px solid #9b7844;
			border-radius: 14px;
			background: rgba(5, 16, 15, .98);
			color: #f5eee0;
			box-shadow: 0 16px 44px rgba(0, 0, 0, .48);
			font: 13px/1.42 system-ui;
		}
		.Awtsmoos-sheet[hidden] {
			display: none;
		}
		.Awtsmoos-sheet-header {
			position: sticky;
			top: 0;
			z-index: 2;
			display: flex;
			align-items: center;
			gap: 9px;
			background: #07100f;
		}
		.Awtsmoos-sheet-header h2 {
			margin: 0;
			color: #ffd784;
		}
		.Awtsmoos-sheet-header small {
			color: #9ec8b6;
		}
		.Awtsmoos-sheet-header button {
			margin-left: auto;
		}
		.Awtsmoos-sheet button {
			min-width: 38px;
			min-height: 38px;
			border: 1px solid #9a7239;
			border-radius: 9px;
			background: #34240f;
			color: #ffe8b1;
			font-weight: 800;
		}
		.Awtsmoos-status-ribbon {
			position: fixed;
			top: max(8px, env(safe-area-inset-top));
			left: 50%;
			z-index: 735;
			display: flex;
			gap: 7px;
			align-items: center;
			max-width: 72vw;
			overflow: auto;
			padding: 6px 10px;
			border: 1px solid #796844;
			border-radius: 999px;
			background: rgba(5, 16, 15, .96);
			color: #fff;
			font: 11px system-ui;
			white-space: nowrap;
			transform: translateX(-50%);
		}
		.Awtsmoos-profile-summary,
		.Awtsmoos-derived-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 7px;
			margin: 10px 0;
		}
		.Awtsmoos-profile-summary span,
		.Awtsmoos-derived-grid span {
			padding: 7px;
			border-radius: 8px;
			background: rgba(255, 255, 255, .045);
			text-align: center;
		}
		.Awtsmoos-stat-grid,
		.Awtsmoos-powerup-grid,
		.Awtsmoos-vendor-grid {
			display: grid;
			gap: 7px;
		}
		.Awtsmoos-stat-card,
		.Awtsmoos-powerup-card,
		.Awtsmoos-vendor-card {
			display: grid;
			grid-template-columns: 32px 1fr auto auto;
			gap: 7px;
			align-items: center;
			padding: 8px;
			border: 1px solid #30473f;
			border-radius: 9px;
			background: #111d19;
		}
		.Awtsmoos-powerup-card,
		.Awtsmoos-vendor-card {
			grid-template-columns: 32px 1fr auto;
		}
		.Awtsmoos-stat-card span,
		.Awtsmoos-powerup-card span,
		.Awtsmoos-vendor-card span {
			font-size: 21px;
		}
		.Awtsmoos-stat-card small,
		.Awtsmoos-powerup-card small,
		.Awtsmoos-vendor-card small {
			display: block;
			color: #b9c9c2;
		}
		.Awtsmoos-panel-message {
			min-height: 20px;
			color: #ffca76;
		}
		.Awtsmoos-wallet {
			padding: 8px;
			border-radius: 8px;
			background: #3b2a12;
			color: #ffe2a2;
			font-weight: 800;
		}
		@media (max-width: 700px) {
			.Awtsmoos-sheet {
				top: auto;
				right: 0;
				bottom: 0;
				left: 0;
				width: auto;
				max-height: min(76vh, 680px);
				padding: 12px max(12px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
				border-radius: 16px 16px 0 0;
			}
			.Awtsmoos-profile-summary,
			.Awtsmoos-derived-grid {
				grid-template-columns: repeat(2, 1fr);
			}
			.Awtsmoos-stat-card {
				grid-template-columns: 30px 1fr auto auto;
			}
		}
	`;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/GameplayUiController.js
var GameplayUiController = class {
  constructor(bus, options = {}) {
    installGameplayUiStyles();
    installResponsiveGameplayStyles();
    this.bus = bus;
    this.adventures = options.adventures || new AdventureStore();
    this.inventory = options.inventory || new InventoryStore();
    this.profile = options.profile || new ShliachProfileStore({ inventory: this.inventory });
    this.shlichus = options.shlichus || new ShlichusRuntimeCoordinator({
      adventures: this.adventures,
      bus,
      inventory: this.inventory,
      persistence: options.shlichusPersistence,
      persistenceOptions: options.shlichusPersistenceOptions,
      profile: this.profile
    });
    this.gateway = new GameplayActionGateway({
      actions: options.actions,
      inventory: this.inventory,
      profile: this.profile
    });
    this.combat = options.combat || new TorahCombatController({
      bus,
      clock: options.clock,
      focus: options.focus,
      inventory: this.inventory,
      profile: this.profile
    });
    this.actionBar = options.actionBar || new ActionBarRuntimeCoordinator({
      bus,
      clock: options.clock,
      combat: this.combat,
      inventory: this.inventory,
      persistence: options.actionBarPersistence,
      persistenceOptions: options.actionBarPersistenceOptions,
      playerId: options.playerId
    });
    this.melee = options.melee || new PlayerMeleeController({
      attack: options.meleeAttack,
      bus,
      clock: options.clock
    });
    this.panels = new GameplayPanelSuite({
      adventures: this.adventures,
      getTorahFocus: () => this.combat.snapshot().focus,
      inventory: this.inventory,
      inventoryPanel: options.inventoryPanel,
      onActivatePowerup: (id) => this.gateway.activatePowerup(id),
      onAllocateAttribute: (id, points) => this.gateway.allocateAttribute(id, points),
      onAssignAbility: (id) => this.actionBar.assignFirstAvailable(id),
      onBuyItem: (id, quantity2) => this.gateway.buyItem(id, quantity2),
      onUsePassage: (passage2) => this.combat.usePassage(passage2),
      profile: this.profile
    });
    this.unsubscribers = [];
    this.bind();
  }
  bind() {
    for (const [eventType, panelId] of Object.entries(PANEL_EVENTS)) {
      this.listen(eventType, () => this.panels.toggle(panelId));
    }
    this.listen("inventory:state", (detail) => this.panels.notifyInventory(detail.open));
    this.listen("quest:offer", (detail) => this.panels.questOffer.open(detail.questId));
    this.listen("quest:event", (event) => this.adventures.recordEvent(event));
    this.listen("inventory:add", (detail) => this.inventory.add(detail.itemId, detail.quantity));
    this.listen("inventory:equip", (detail) => this.inventory.equip(detail.itemId));
    this.listen("profile:synchronize", (detail) => this.profile.synchronize(detail));
  }
  listen(type, listener) {
    this.unsubscribers.push(this.bus.on(type, listener));
  }
  updatePosition(position) {
    this.panels.updatePosition(position);
  }
  snapshot() {
    return {
      actionBar: this.actionBar.snapshot(),
      adventures: this.adventures.snapshot(),
      combat: this.combat.snapshot(),
      inventory: this.inventory.snapshot(),
      melee: this.melee.snapshot(),
      panels: this.panels.snapshot(),
      profile: this.profile.snapshot(),
      shlichusPersistence: this.shlichus.snapshot()
    };
  }
  destroy() {
    for (const unsubscribe of this.unsubscribers) unsubscribe();
    this.actionBar.destroy();
    this.shlichus.destroy();
    this.combat.destroy();
    this.melee.destroy();
    this.panels.destroy();
    this.profile.destroy();
  }
};
var PANEL_EVENTS = Object.freeze({
  "map:toggle": "map",
  "profile:toggle": "profile",
  "questlog:toggle": "quests",
  "torah:toggle": "torah",
  "vendor:toggle": "vendor"
});

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/InventoryPanelView.js
function inventoryPanelHtml(state) {
  return `
		<section class="Awtsmoos-inventory-panel" data-open="false" aria-hidden="true">
			<header>
				<b>\u{1F392} B"H Bag</b>
				<span>\u{1FA99} ${quantity(state, "perutas")} \xB7 \u2694 ${state.stats.damage} \xB7 \u{1F6E1} ${state.stats.defense} \xB7 \u2728 ${state.stats.focus}</span>
				<button data-close aria-label="Close bag">\xD7</button>
			</header>
			<div class="inv-body">
				<aside><h3>Equipped</h3><div class="equip-grid" data-equipment></div></aside>
				<main><h3>Backpack</h3><div class="bag-grid" data-items></div><div class="item-card" data-item-card>Select an item.</div></main>
			</div>
			<div class="inv-context-menu" data-open="false" data-menu></div>
		</section>
	`;
}
function renderInventoryItems(container, state) {
  container.replaceChildren(...state.items.map((stack2) => itemButton(stack2)));
  const emptyCount = Math.max(0, 24 - state.items.length);
  for (let index = 0; index < emptyCount; index += 1) {
    container.appendChild(emptyButton());
  }
}
function renderEquipment(container, state) {
  container.replaceChildren(...Object.entries(state.equipment).map(([slot, itemId]) => {
    const stack2 = state.items.find((item2) => item2.itemId === itemId);
    const definition = stack2?.definition;
    const button2 = document.createElement("button");
    button2.className = "inv-slot equip";
    button2.dataset.itemId = itemId;
    button2.dataset.slot = slot;
    button2.innerHTML = `<span>${escapeHtml3(definition?.icon || "\u2728")}</span><b>${escapeHtml3(definition?.name || itemId)}</b><small>${escapeHtml3(slot)}</small>`;
    return button2;
  }));
}
function renderInventoryCard(container, stack2) {
  if (!stack2?.definition) {
    container.textContent = "Select an item.";
    return;
  }
  const definition = stack2.definition;
  container.innerHTML = `
		<h4>${escapeHtml3(definition.icon)} ${escapeHtml3(definition.name)}</h4>
		<p><b>${escapeHtml3(definition.category)}</b> \xB7 quantity ${stack2.quantity}</p>
		<p>${escapeHtml3(definition.description)}</p>
		<p>Damage ${definition.stats.damage} \xB7 Defense ${definition.stats.defense} \xB7 Focus ${definition.stats.focus}</p>
	`;
}
function renderInventoryMenu(menu, stack2) {
  menu.replaceChildren();
  if (!stack2?.definition) return;
  const title2 = document.createElement("h4");
  title2.textContent = `${stack2.definition.icon} ${stack2.definition.name}`;
  const actions = document.createElement("div");
  for (const action2 of stack2.definition.actions) {
    const button2 = document.createElement("button");
    button2.dataset.action = action2;
    button2.textContent = actionLabel(action2);
    actions.appendChild(button2);
  }
  menu.append(title2, actions);
  menu.dataset.open = "true";
}
function itemButton(stack2) {
  const button2 = document.createElement("button");
  button2.className = "inv-slot";
  button2.dataset.itemId = stack2.itemId;
  button2.innerHTML = `<span>${escapeHtml3(stack2.definition.icon)}</span><b>${escapeHtml3(stack2.definition.name)}</b><small>${stack2.quantity > 1 ? `\xD7${stack2.quantity}` : escapeHtml3(stack2.definition.category)}</small>`;
  return button2;
}
function emptyButton() {
  const button2 = document.createElement("button");
  button2.className = "inv-slot empty";
  button2.disabled = true;
  button2.innerHTML = "<span>\uFF0B</span><b>Empty</b><small>available</small>";
  return button2;
}
function quantity(state, itemId) {
  return state.items.find((item2) => item2.itemId === itemId)?.quantity || 0;
}
function actionLabel(action2) {
  return action2.charAt(0).toUpperCase() + action2.slice(1);
}
function escapeHtml3(value3) {
  return String(value3 ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/InventoryPanel.js
var InventoryPanel = class {
  constructor(host, bus, options = {}) {
    this.host = host || makeHost2();
    this.bus = bus;
    this.store = options.store;
    if (!this.store) throw new Error("InventoryPanel requires an InventoryStore.");
    this.open = false;
    this.selectedItemId = null;
    this.unsubscribers = [];
    this.build();
  }
  build() {
    this.host.classList.add("Awtsmoos-inventory-shell");
    this.host.innerHTML = inventoryPanelHtml(this.store.snapshot());
    this.panel = this.host.querySelector(".Awtsmoos-inventory-panel");
    this.menu = this.host.querySelector("[data-menu]");
    this.panel.addEventListener("click", (event) => this.onClick(event));
    this.unsubscribers.push(this.bus.on("inventory:toggle", () => this.setOpen(!this.open)));
    this.unsubscribers.push(this.bus.on("inventory:open", () => this.setOpen(true)));
    this.unsubscribers.push(this.store.onChange(() => this.render()));
    this.render();
  }
  render() {
    const state = this.store.snapshot();
    renderInventoryItems(this.panel.querySelector("[data-items]"), state);
    renderEquipment(this.panel.querySelector("[data-equipment]"), state);
    const selected = state.items.find((item2) => item2.itemId === this.selectedItemId);
    renderInventoryCard(this.panel.querySelector("[data-item-card]"), selected);
    this.panel.querySelector("header span").textContent = summaryText(state);
  }
  onClick(event) {
    if (event.target.closest("[data-close]")) {
      this.setOpen(false);
      return;
    }
    const itemButton2 = event.target.closest("[data-item-id]");
    if (itemButton2) {
      this.select(itemButton2.dataset.itemId, itemButton2);
      return;
    }
    const actionButton4 = event.target.closest("[data-action]");
    if (actionButton4) this.runAction(actionButton4.dataset.action);
  }
  select(itemId, button2) {
    this.selectedItemId = itemId;
    const stack2 = this.store.snapshot().items.find((item2) => item2.itemId === itemId);
    renderInventoryCard(this.panel.querySelector("[data-item-card]"), stack2);
    renderInventoryMenu(this.menu, stack2);
    const rectangle = button2.getBoundingClientRect();
    this.menu.style.left = `${Math.max(8, Math.min(innerWidth - 230, rectangle.left))}px`;
    this.menu.style.top = `${Math.max(8, Math.min(innerHeight - 180, rectangle.bottom + 6))}px`;
  }
  runAction(action2) {
    const definition = this.store.snapshot().items.find((item2) => item2.itemId === this.selectedItemId)?.definition;
    if (!definition) return;
    try {
      if (action2 === "equip") this.store.equip(definition.id);
      if (action2 === "drop") this.store.remove(definition.id, 1);
      if (action2 === "open" && definition.category === "book") this.bus.emit("torah:toggle");
      if (action2 === "open" && definition.id === "quest-scroll") this.bus.emit("questlog:toggle");
      if (action2 === "pin" && definition.category === "book") this.store.toggleBookPin(definition.id);
      this.bus.emit("inventory:action", { action: action2, itemId: definition.id });
      this.menu.dataset.open = "false";
      this.render();
    } catch (error) {
      this.panel.querySelector("[data-item-card]").textContent = error.message;
    }
  }
  setOpen(open) {
    this.open = Boolean(open);
    this.panel.dataset.open = String(this.open);
    this.panel.setAttribute("aria-hidden", String(!this.open));
    if (!this.open) this.menu.dataset.open = "false";
    this.bus.emit("inventory:state", { open: this.open });
  }
  destroy() {
    for (const unsubscribe of this.unsubscribers) unsubscribe();
  }
};
function summaryText(state) {
  const coins = state.items.find((item2) => item2.itemId === "perutas")?.quantity || 0;
  return `\u{1FA99} ${coins} \xB7 \u2694 ${state.stats.damage} \xB7 \u{1F6E1} ${state.stats.defense} \xB7 \u2728 ${state.stats.focus}`;
}
function makeHost2() {
  const host = document.createElement("div");
  document.body.appendChild(host);
  return host;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/NpcHudMarkup.js
function npcDialogueMarkup(data, questId) {
  return `
		<section>
			<header>
				<b>${escapeHtml4(data.face || "\u{1F9D4}")} ${escapeHtml4(data.name)}</b>
				<button data-close>\xD7</button>
			</header>
			<p>B"H. Read the shlichus before deciding, train nearby, or continue exploring.</p>
			<button data-quest="${escapeHtml4(questId)}">\u2728 View Golden Shlichus</button>
			<button data-level="lava">\u{1F525} Training Course</button>
			<button data-level="stay">Continue Exploring</button>
		</section>`;
}
function npcPlayerCard(player) {
  return `
		<article class="status-card player-card">
			<div class="status-face">${escapeHtml4(player.face)}</div>
			<div>
				<b>${escapeHtml4(player.name)}</b>
				<small>Level ${player.level} \xB7 Health ${player.health}</small>
				<meter min="0" max="100" value="${player.health}"></meter>
				<label>\u2B50 XP ${player.xp}/${player.xpMax}</label>
				<progress max="${player.xpMax}" value="${player.xp}"></progress>
			</div>
			<strong>${player.level}</strong>
		</article>`;
}
function npcTargetCard(target) {
  const maximum = Math.max(1, Number(target.maxHealth || 100));
  const value3 = Number(target.health ?? maximum);
  const role = target.role || target.level || "Village resident";
  const emblem = target.faction === "hostile" ? "\u2694" : "!";
  return `
		<article class="status-card target-card">
			<div class="status-face">${escapeHtml4(target.face || "\u{1F9D4}")}</div>
			<div>
				<b>${escapeHtml4(target.name)}</b>
				<small>${escapeHtml4(role)}</small>
				<meter min="0" max="${maximum}" value="${value3}"></meter>
			</div>
			<strong>${emblem}</strong>
		</article>`;
}
function escapeHtml4(value3) {
  return String(value3 ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/NpcHud.js
var DEFAULT_QUEST = "sparks-at-east-gate";
var NpcHud = class {
  constructor(targetHost, dialogueHost, bus) {
    this.host = targetHost || makeHost3("npcTarget");
    this.dialogueHost = dialogueHost || makeHost3("npcDialogue");
    this.bus = bus;
    this.player = defaultPlayer();
    this.target = null;
    this.unsubscribers = [];
    this.build();
  }
  build() {
    this.host.classList.add("Awtsmoos-status-dock");
    this.dialogueHost.classList.add("Awtsmoos-npc-dialogue");
    this.dialogueHost.dataset.open = "false";
    this.unsubscribers.push(this.bus.on("npc:target", (data) => this.showTarget(data)));
    this.unsubscribers.push(this.bus.on("npc:dialogue", (data) => this.showDialogue(data)));
    this.unsubscribers.push(this.bus.on("npc:clear", () => this.clearTarget()));
    this.unsubscribers.push(this.bus.on("enemy:attack", (data) => {
      this.updatePlayer({ health: data.playerHealth });
    }));
    this.dialogueHost.addEventListener("click", (event) => this.click(event));
    this.render();
  }
  updatePlayer(data = {}) {
    this.player = { ...this.player, ...data };
    this.render();
  }
  showTarget(data) {
    this.target = data;
    this.render();
  }
  clearTarget() {
    this.target = null;
    this.close();
    this.render();
  }
  showDialogue(data) {
    if (data.faction === "hostile") return;
    this.showTarget(data);
    const questId = data.questId || DEFAULT_QUEST;
    this.dialogueHost.dataset.open = "true";
    this.dialogueHost.innerHTML = npcDialogueMarkup(data, questId);
  }
  render() {
    const targetMarkup = this.target ? npcTargetCard(this.target) : "";
    this.host.innerHTML = `${npcPlayerCard(this.player)}${targetMarkup}`;
    this.host.dataset.hasTarget = String(Boolean(this.target));
  }
  click(event) {
    const close = event.target.closest("[data-close]");
    const quest2 = event.target.closest("[data-quest]");
    const level = event.target.closest("[data-level]");
    if (quest2) {
      this.bus.emit("quest:offer", { questId: quest2.dataset.quest });
      this.close();
      return;
    }
    if (level?.dataset.level === "lava") {
      this.bus.emit("level:lava", { from: this.target });
      this.close();
      return;
    }
    if (close || level?.dataset.level === "stay") this.close();
  }
  close() {
    this.dialogueHost.dataset.open = "false";
  }
  destroy() {
    for (const unsubscribe of this.unsubscribers) unsubscribe();
  }
};
function defaultPlayer() {
  return {
    face: "\u{1F3A9}",
    health: 100,
    level: 1,
    name: "Chossid",
    xp: 0,
    xpMax: 100
  };
}
function makeHost3(id) {
  const element2 = document.createElement("div");
  element2.id = id;
  document.body.appendChild(element2);
  return element2;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzUiSystem.js?v=20260720-canonical-valley-pass-06
function createEretzUi(runtime, options = {}) {
  const equipment = createEquipment(runtime.model);
  const gameplayClock = options.clock || (() => performance.now());
  const inventoryStore = options.inventoryStore || new InventoryStore();
  const inventoryPanel = new InventoryPanel(
    runtime.inventoryHost,
    runtime.bus,
    { store: inventoryStore }
  );
  const gameplayUi = new GameplayUiController(runtime.bus, {
    actionBarPersistence: options.actionBarPersistence,
    actionBarPersistenceOptions: options.actionBarPersistenceOptions,
    actions: options.gameplayActions,
    adventures: options.adventures,
    clock: gameplayClock,
    inventory: inventoryStore,
    inventoryPanel,
    playerId: options.playerId,
    profile: options.profile
  });
  const actionBar = new ActionBar(
    runtime.actionHost,
    runtime.bus,
    runtime.state
  );
  const combatActionBar = new ActionBarHud(gameplayUi.actionBar, runtime.bus, {
    clock: gameplayClock,
    host: options.combatActionBarHost,
    playerId: options.playerId
  });
  const npcHud = new NpcHud(
    runtime.npcHost,
    runtime.dialogueHost,
    runtime.bus
  );
  wireWorldEvents(runtime);
  const cameraModeToggle = createCameraModeToggle(runtime, options);
  return Object.assign(runtime, {
    actionBar,
    cameraModeToggle,
    combatActionBar,
    equipment,
    gameplayUi,
    inventoryPanel,
    inventoryStore,
    npcHud,
    profileStore: gameplayUi.profile
  });
}
function createCameraModeToggle(runtime, options) {
  const root = options.cameraModeHost || runtime.cameraModeHost || globalThis.document?.body;
  return root ? new CameraModeToggle(root, runtime.bus, runtime.orbit.mode) : null;
}
function wireWorldEvents(runtime) {
  runtime.bus.on("mode:toggle-run", () => {
    runtime.state.runMode = !runtime.state.runMode;
    runtime.bus.emit("mode:changed", { runMode: runtime.state.runMode });
  });
  runtime.bus.on("camera:toggle", () => {
    const mode = nextCameraMode(runtime.orbit.mode);
    runtime.orbit.setMode(mode);
    runtime.model.visible = mode === "orbit";
    runtime.bus.emit("camera:changed", { mode });
  });
  runtime.bus.on("level:lava", () => runtime.worldMode.enterLava());
  runtime.bus.on("level:return-eretz", () => runtime.worldMode.returnEretz());
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzViewport.js
var DEFAULT_RENDER_SCALE = 1;
var MAXIMUM_RENDER_SCALE = 1;
var MINIMUM_EFFECTIVE_DPR = 1;
function installViewport(runtime, environment = globalThis) {
  if (!Number.isFinite(runtime.adaptiveRenderScale)) {
    runtime.adaptiveRenderScale = DEFAULT_RENDER_SCALE;
  }
  const resize = () => {
    const width = Math.max(1, Number(environment.innerWidth) || 1);
    const height = Math.max(1, Number(environment.innerHeight) || 1);
    const maximumDpr = runtime.qualityProfile?.maxDpr ?? MAX_RENDER_DPR;
    const density = resolveViewportDensity(
      environment.devicePixelRatio,
      maximumDpr,
      runtime.adaptiveRenderScale
    );
    runtime.minimumRenderScale = density.minimumScale;
    runtime.adaptiveRenderScale = density.scale;
    runtime.camera.aspect = width / height;
    runtime.renderer.setSize(
      Math.max(1, Math.round(width * density.effectiveDpr)),
      Math.max(1, Math.round(height * density.effectiveDpr))
    );
    publishViewportStats(runtime, density);
  };
  runtime.resizeViewport = resize;
  environment.addEventListener?.("resize", resize, { passive: true });
  resize();
  return resize;
}
function resolveViewportDensity(deviceDpr, profileMaximumDpr, requestedScale) {
  const availableDpr = Math.max(1, Number(deviceDpr) || 1);
  const maximumDpr = Math.max(1, Number(profileMaximumDpr) || 1);
  const cappedDpr = Math.min(availableDpr, maximumDpr);
  const minimumScale = Math.min(
    MAXIMUM_RENDER_SCALE,
    MINIMUM_EFFECTIVE_DPR / cappedDpr
  );
  const scale2 = clamp2(
    Number(requestedScale) || DEFAULT_RENDER_SCALE,
    minimumScale,
    MAXIMUM_RENDER_SCALE
  );
  return {
    cappedDpr,
    effectiveDpr: cappedDpr * scale2,
    minimumScale,
    scale: scale2
  };
}
function publishViewportStats(runtime, density) {
  const stats3 = runtime.terrain.stats;
  stats3.renderDpr = density.effectiveDpr;
  stats3.renderScale = density.scale;
  stats3.renderScaleFloor = density.minimumScale;
  stats3.renderPixels = [
    runtime.renderer.canvas.width,
    runtime.renderer.canvas.height
  ];
}
function clamp2(value3, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value3));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzCoreRuntimeAssembly.js
function assembleEretzCoreRuntime(foundation, options, qualityProfile, boot) {
  boot.begin("actors-and-interface");
  const actors = createEretzActors(foundation);
  const runtime = createEretzUi(actors, options.ui || {});
  runtime.worldModels = null;
  installViewport(runtime);
  installRuntimePerformanceMonitor(runtime);
  boot.begin("diagnostics-and-loop");
  const diagnostics3 = installWorldDiagnostics(runtime);
  const movement = options.startLoop === false ? null : startEretzRuntime(runtime, diagnostics3);
  const localRpg = options.localRpg || new MitzvahWorldLocalRpgSession(options);
  attachRuntimeDiagnostics(diagnostics3, runtime, movement, localRpg);
  diagnostics3.bootPhases = () => boot.snapshot();
  diagnostics3.qualityProfile = { ...qualityProfile };
  return { diagnostics: diagnostics3, movement, runtime };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/ChossidOutfitPalette.js
var variantCache = /* @__PURE__ */ new WeakMap();
function chossidMaterialResolver(outfitDefinition) {
  const definition = normalizeOutfit(outfitDefinition);
  return (material) => materialVariant(material, definition);
}
function applyChossidOutfit(scene, outfitDefinition) {
  const definition = normalizeOutfit(outfitDefinition);
  const stats3 = { hiddenNodes: 0, visibleNodes: 0 };
  scene.traverse((node) => {
    const visibility = clothingVisibility(node.name, definition);
    if (visibility === null) return;
    node.visible = visibility;
    stats3[visibility ? "visibleNodes" : "hiddenNodes"] += 1;
  });
  scene.userData.chossidOutfit = definition;
  return stats3;
}
function materialVariant(material, definition) {
  if (!material) return material;
  const role = materialRole(material.name);
  const color = definition.colors[role];
  if (!color) return material;
  let variants = variantCache.get(material);
  if (!variants) {
    variants = /* @__PURE__ */ new Map();
    variantCache.set(material, variants);
  }
  const key = `${role}:${color}`;
  if (variants.has(key)) return variants.get(key);
  const variant = Object.assign(
    Object.create(Object.getPrototypeOf(material)),
    material
  );
  variant.color = rgba(color, material.color?.[3] ?? 1);
  variant.name = `${material.name || role}@${color}`;
  variant.userData = {
    ...material.userData || {},
    chossidPaletteKey: key
  };
  variants.set(key, variant);
  return variant;
}
function clothingVisibility(nameValue, definition) {
  const name = String(nameValue || "").toLowerCase();
  if (name === "top-hat") return definition.headwear === "top-hat";
  if (name === "yarmalka") return definition.headwear !== "top-hat";
  if (name === "jacket") return definition.jacket && !definition.tefillin;
  if (name === "jacket-teffilin") return definition.jacket && definition.tefillin;
  if (name === "outer-shirt") return true;
  if (/teffilin|tefillin|batim|shinleft|shinright|ritzooyoys/.test(name)) {
    return definition.tefillin;
  }
  return null;
}
function materialRole(nameValue) {
  const name = String(nameValue || "").toLowerCase();
  if (name.startsWith("jacket")) return "coat";
  if (name === "shirt" || name === "outer-shirt") return "shirt";
  if (name === "pants") return "pants";
  if (name === "hair") return "hair";
  if (name === "glasses-frame") return "glasses";
  if (name === "eye-color") return "eyes";
  return name;
}
function normalizeOutfit(value3 = {}) {
  return {
    colors: {
      coat: value3.colors?.coat || "#202226",
      eyes: value3.colors?.eyes || "#4d6b8a",
      glasses: value3.colors?.glasses || "#26384a",
      hair: value3.colors?.hair || "#4b2410",
      pants: value3.colors?.pants || "#17181a",
      shirt: value3.colors?.shirt || "#f4efe6"
    },
    headwear: value3.headwear || "yarmulke",
    id: value3.id || "default",
    jacket: value3.jacket !== false,
    tefillin: value3.tefillin === true
  };
}
function rgba(hex, alpha) {
  const value3 = Number.parseInt(String(hex).replace("#", ""), 16);
  return [
    (value3 >> 16 & 255) / 255,
    (value3 >> 8 & 255) / 255,
    (value3 & 255) / 255,
    alpha
  ];
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-static-batch-material.js
function createStaticBatchMaterial(source = {}) {
  const material = new MeshStandardMaterial({
    alphaCutoff: source.alphaCutoff,
    alphaMode: source.alphaMode,
    color: [1, 1, 1, 1],
    doubleSided: source.doubleSided,
    name: `${source.name || "material"}:static-batch-neutral`,
    opacity: source.opacity,
    transparent: source.transparent
  });
  Object.assign(material, source);
  material.color = [1, 1, 1, 1];
  material.name = `${source.name || "material"}:static-batch-neutral`;
  material.userData = {
    ...source.userData || {},
    AwtsmoosStaticBatchMaterial: {
      originalTint: [...source.color || [0.75, 0.7, 0.62, 1]],
      tintBakedIntoVertexColor: true
    }
  };
  return material;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/ChossidConsolidationGeometry.js
function buildChossidConsolidatedMesh(group) {
  if (!group.meshes.length) return null;
  const streams = createStreams();
  for (const mesh of group.meshes) appendGeometry(streams, mesh, group.anchor);
  if (streams.positions.length < 9) return null;
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", attribute4(streams.positions, 3));
  geometry.setAttribute("normal", attribute4(streams.normals, 3));
  geometry.setAttribute("color", attribute4(streams.colors, 4));
  geometry.setAttribute("uv", attribute4(streams.uvs, 2));
  if (group.skinned) {
    geometry.setAttribute("joints", attribute4(streams.joints, 4));
    geometry.setAttribute("weights", attribute4(streams.weights, 4));
  }
  geometry.setIndex(new BufferAttribute(indexArray2(streams.indices), 1));
  const batch = new Mesh(geometry, createStaticBatchMaterial(group.meshes[0].material));
  batch.name = `AwtsmoosChossidBatch:${group.skinned ? "skin" : "rigid"}:${group.meshes.length}`;
  batch.isSkinnedMesh = group.skinned;
  batch.skeleton = group.skeleton;
  batch.userData.AwtsmoosChossidConsolidation = {
    anchor: group.anchor?.name || "root",
    members: group.meshes.length,
    skinned: group.skinned,
    tintBakedIntoVertexColor: true,
    triangles: streams.indices.length / 3,
    vertices: streams.positions.length / 3
  };
  batch.setBaseTransform();
  return batch;
}
function appendGeometry(streams, mesh, anchor2) {
  const geometry = mesh.geometry;
  const transform = multiply(inverse(anchor2.matrixWorld), mesh.matrixWorld);
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const color = geometry.attributes.color;
  const uv2 = geometry.attributes.uv;
  const joints = geometry.attributes.joints;
  const weights = geometry.attributes.weights;
  const tint = mesh.material?.color || [0.75, 0.7, 0.62, 1];
  const vertexOffset = streams.positions.length / 3;
  for (let index = 0; index < position.count; index += 1) {
    appendPosition(streams.positions, position, index, transform);
    appendNormal(streams.normals, normal, index, transform);
    streams.colors.push(
      value(color, index, 0, 1) * (tint[0] ?? 0.75),
      value(color, index, 1, 1) * (tint[1] ?? 0.7),
      value(color, index, 2, 1) * (tint[2] ?? 0.62),
      value(color, index, 3, 1)
    );
    streams.uvs.push(value(uv2, index, 0, 0), value(uv2, index, 1, 0));
    if (joints) appendVector(streams.joints, joints, index, [0, 0, 0, 0]);
    if (weights) appendVector(streams.weights, weights, index, [1, 0, 0, 0]);
  }
  const source = geometry.index?.array || Array.from({ length: position.count }, (_, index) => index);
  for (const index of source) streams.indices.push(index + vertexOffset);
}
function appendPosition(target, source, index, matrix) {
  const x = value(source, index, 0, 0);
  const y = value(source, index, 1, 0);
  const z = value(source, index, 2, 0);
  target.push(
    matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
    matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
    matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
  );
}
function appendNormal(target, source, index, matrix) {
  const x = value(source, index, 0, 0);
  const y = value(source, index, 1, 1);
  const z = value(source, index, 2, 0);
  target.push(
    matrix[0] * x + matrix[4] * y + matrix[8] * z,
    matrix[1] * x + matrix[5] * y + matrix[9] * z,
    matrix[2] * x + matrix[6] * y + matrix[10] * z
  );
}
function appendVector(target, source, index, fallback) {
  for (let component = 0; component < 4; component += 1) {
    target.push(value(source, index, component, fallback[component]));
  }
}
function createStreams() {
  return { colors: [], indices: [], joints: [], normals: [], positions: [], uvs: [], weights: [] };
}
function attribute4(values, size) {
  return new BufferAttribute(new Float32Array(values), size);
}
function value(attributeValue, index, component, fallback) {
  if (!attributeValue || component >= attributeValue.itemSize) return fallback;
  return Number(attributeValue.array[index * attributeValue.itemSize + component] ?? fallback);
}
function indexArray2(indices) {
  let maximum = 0;
  for (const index of indices) if (index > maximum) maximum = index;
  return maximum > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-webgl-utils.js
var materialModeCache = /* @__PURE__ */ new WeakMap();
function drawMode(gl, mode) {
  return {
    0: gl.POINTS,
    1: gl.LINES,
    2: gl.LINE_LOOP,
    3: gl.LINE_STRIP,
    4: gl.TRIANGLES,
    5: gl.TRIANGLE_STRIP,
    6: gl.TRIANGLE_FAN
  }[mode ?? 4] || gl.TRIANGLES;
}
function attributeType(gl, attribute5) {
  const array = attribute5.array;
  if (array instanceof Float32Array) return gl.FLOAT;
  if (array instanceof Uint8Array) return gl.UNSIGNED_BYTE;
  if (array instanceof Uint16Array) return gl.UNSIGNED_SHORT;
  if (array instanceof Uint32Array) return gl.UNSIGNED_INT;
  if (array instanceof Int8Array) return gl.BYTE;
  if (array instanceof Int16Array) return gl.SHORT;
  return gl.FLOAT;
}
function createShader(gl, type, source, label, errors) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const info = gl.getShaderInfoLog(shader);
  if (info) errors.push(`${label} shader: ${info}`);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`${label} shader failed: ${info}`);
  }
  return shader;
}
function createProgram(gl, vertexSource, fragmentSource, label, errors) {
  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexSource, label, errors));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentSource, label, errors));
  gl.linkProgram(program);
  const info = gl.getProgramInfoLog(program);
  if (info) errors.push(`${label} program: ${info}`);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`${label} program failed: ${info}`);
  }
  return program;
}
function materialColor(material) {
  const color = material?.color || [0.75, 0.7, 0.62, 1];
  return new Float32Array([
    color[0] ?? 0.75,
    color[1] ?? 0.7,
    color[2] ?? 0.62,
    material?.opacity ?? color[3] ?? 1
  ]);
}
function alphaModeCode(material) {
  if (material?.alphaMode === "MASK") return 1;
  if (material?.alphaMode === "BLEND") return 2;
  return 0;
}
function materialModeCode(mesh) {
  const material = mesh.material || {};
  const policy2 = material.texturePolicy || {};
  const cached = materialModeCache.get(mesh);
  if (cached && sameModeFacts(cached, mesh, material, policy2)) return cached.code;
  const code = classifyMaterialMode(mesh, policy2);
  materialModeCache.set(mesh, captureModeFacts(mesh, material, policy2, code));
  return code;
}
function classifyMaterialMode(mesh, policy2) {
  const identity2 = materialIdentity2(mesh);
  if (policy2.shader?.includes("terrain-layered")) return 5;
  if (policy2.shader?.includes("water") || /water|lake|stream/.test(identity2)) return 1;
  if (policy2.proceduralSky || /world-sky|sky_dome|atmosphere_dome/.test(identity2)) return 4;
  if (policy2.practicalLightProxy || /lamp-pane|window|fire|ember|flame/.test(identity2)) return 3;
  if (policy2.shader?.includes("wind") || policy2.alpha?.includes("cutout") || /leaves|botanical|flower|petal|fern|reed|bush/.test(identity2)) return 2;
  return 0;
}
function captureModeFacts(mesh, material, policy2, code) {
  return {
    alpha: policy2.alpha,
    code,
    family: mesh.userData?.family,
    material,
    materialName: material.name,
    meshName: mesh.name,
    parent: mesh.parent,
    parentFamily: mesh.parent?.userData?.family,
    policy: policy2,
    practicalLightProxy: policy2.practicalLightProxy,
    proceduralSky: policy2.proceduralSky,
    shader: policy2.shader
  };
}
function sameModeFacts(value3, mesh, material, policy2) {
  return value3.material === material && value3.policy === policy2 && value3.meshName === mesh.name && value3.materialName === material.name && value3.family === mesh.userData?.family && value3.parent === mesh.parent && value3.parentFamily === mesh.parent?.userData?.family && value3.shader === policy2.shader && value3.alpha === policy2.alpha && value3.proceduralSky === policy2.proceduralSky && value3.practicalLightProxy === policy2.practicalLightProxy;
}
function materialIdentity2(mesh) {
  const values = [mesh.name, mesh.material?.name];
  let parent = mesh;
  while (parent) {
    values.push(parent.userData?.family, parent.userData?.AwtsmoosForestLayer?.layer);
    parent = parent.parent;
  }
  return values.filter(Boolean).join(" ").toLowerCase();
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-material-signature-state.js
function captureMaterialSignatureState(mesh, textureState2) {
  const material = mesh.material || {};
  const color = material.color || [0.75, 0.7, 0.62, 1];
  const grass = mesh.userData?.AwtsmoosYardGrass || {};
  return {
    alphaCutoff: material.alphaCutoff ?? 0.5,
    alphaMode: material.alphaMode || "OPAQUE",
    anisotropy: material.anisotropy ?? 2,
    color0: color[0] ?? 0.75,
    color1: color[1] ?? 0.7,
    color2: color[2] ?? 0.62,
    cullingDisabled: material.backfaceCull === false,
    doubleSided: material.doubleSided === true,
    emissiveStrength: material.emissiveStrength ?? 1.8,
    geometryMode: mesh.geometry?.mode ?? mesh.primitiveMode ?? 4,
    grassRadius: grass.interactionRadius ?? 2.2,
    grassReactive: grass.reactsToPlayer === true,
    grassWind: grass.windStrength ?? 0.085,
    material,
    materialMode: materialModeCode(mesh),
    opacity: material.opacity ?? color[3] ?? 1,
    textureState: textureState2
  };
}
function sameMaterialSignatureState(state, mesh, textureState2) {
  if (!state) return false;
  const material = mesh.material || {};
  const color = material.color || [0.75, 0.7, 0.62, 1];
  const grass = mesh.userData?.AwtsmoosYardGrass || {};
  return state.material === material && state.textureState === textureState2 && state.color0 === (color[0] ?? 0.75) && state.color1 === (color[1] ?? 0.7) && state.color2 === (color[2] ?? 0.62) && state.opacity === (material.opacity ?? color[3] ?? 1) && state.alphaMode === (material.alphaMode || "OPAQUE") && state.alphaCutoff === (material.alphaCutoff ?? 0.5) && state.doubleSided === (material.doubleSided === true) && state.cullingDisabled === (material.backfaceCull === false) && state.emissiveStrength === (material.emissiveStrength ?? 1.8) && state.anisotropy === (material.anisotropy ?? 2) && state.materialMode === materialModeCode(mesh) && state.grassReactive === (grass.reactsToPlayer === true) && state.grassRadius === (grass.interactionRadius ?? 2.2) && state.grassWind === (grass.windStrength ?? 0.085) && state.geometryMode === (mesh.geometry?.mode ?? mesh.primitiveMode ?? 4);
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-material-texture-signature.js
function appendTextureSignature(values, state, identity2) {
  values.push(
    identity2(state.mapImage),
    state.mapReady ? 1 : 0,
    state.mapRepeat0,
    state.mapRepeat1,
    identity2(state.mixImage),
    state.mixReady ? 1 : 0,
    state.mixRepeat0,
    state.mixRepeat1,
    ...state.mapPolicySignature,
    ...state.mixPolicySignature,
    state.mixStrength,
    state.patchScale,
    state.patchSharpness
  );
  for (const layer of state.layers) appendLayer(values, layer, identity2);
  return values;
}
function appendLayer(values, layer, identity2) {
  values.push(
    identity2(layer.image),
    layer.ready ? 1 : 0,
    layer.repeat0,
    layer.repeat1,
    layer.strength,
    layer.role,
    layer.angle,
    ...layer.policySignature,
    ...layer.zones,
    ...layer.slope,
    ...layer.height,
    layer.wetness
  );
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-texture-source.js
function sourceReady(source) {
  return !!(source && sourceWidth(source) && sourceHeight(source) && source.complete !== false);
}
function sourceWidth(source) {
  return source?.naturalWidth || source?.videoWidth || source?.width || 0;
}
function sourceHeight(source) {
  return source?.naturalHeight || source?.videoHeight || source?.height || 0;
}
function createDefaultTexture(gl) {
  const texture2 = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([255, 255, 255, 255])
  );
  setTextureParameters(gl, gl.NEAREST, gl.NEAREST, gl.CLAMP_TO_EDGE);
  return texture2;
}
function setTextureParameters(gl, minification, magnification, wrap2) {
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minification);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magnification);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap2);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap2);
}
function isPowerOfTwo(value3) {
  return value3 > 0 && (value3 & value3 - 1) === 0;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-native-texture-density.js
var DEFAULT_NATIVE_TEXELS_PER_WORLD = 96;
function resolveNativeTextureRepeat(source, authoredRepeat, policy2 = {}, overrides = {}) {
  const resolvedPolicy = { ...policy2, ...overrides };
  const fallback = finitePair(authoredRepeat, [1, 1]);
  if (!nativeDensityEnabled(resolvedPolicy)) return fallback;
  const dimensions = textureDimensions(source);
  if (!dimensions.ready) return fallback;
  const density = positivePair(
    resolvedPolicy.texelsPerWorld,
    [DEFAULT_NATIVE_TEXELS_PER_WORLD, DEFAULT_NATIVE_TEXELS_PER_WORLD]
  );
  const surface = optionalPositivePair(resolvedPolicy.surfaceWorldSize);
  if (surface) {
    return [
      surface[0] * density[0] / dimensions.width,
      surface[1] * density[1] / dimensions.height
    ];
  }
  const uvUnits = uvUnitsPerWorld(resolvedPolicy);
  if (!uvUnits) return fallback;
  return [
    density[0] / (dimensions.width * uvUnits[0]),
    density[1] / (dimensions.height * uvUnits[1])
  ];
}
function nativeTexturePolicySignature(policy2 = {}) {
  const density = positivePair(policy2.texelsPerWorld, [0, 0]);
  const surface = finitePair(policy2.surfaceWorldSize, [0, 0]);
  const uvUnits = uvUnitsPerWorld(policy2) || [0, 0];
  return [
    policy2.nativeTexelDensity === false ? 0 : nativeDensityEnabled(policy2) ? 1 : 0,
    density[0],
    density[1],
    uvUnits[0],
    uvUnits[1],
    surface[0],
    surface[1]
  ];
}
function nativeDensityEnabled(policy2) {
  if (policy2.nativeTexelDensity === false) return false;
  return policy2.nativeTexelDensity === true || Boolean(optionalPositivePair(policy2.uvUnitsPerWorld)) || Boolean(optionalPositivePair(policy2.surfaceWorldSize)) || Boolean(optionalPositivePair(policy2.tileWorld));
}
function uvUnitsPerWorld(policy2) {
  const explicit = optionalPositivePair(policy2.uvUnitsPerWorld);
  if (explicit) return explicit;
  const tileWorld = optionalPositivePair(policy2.tileWorld);
  return tileWorld ? [1 / tileWorld[0], 1 / tileWorld[1]] : null;
}
function textureDimensions(source) {
  const width = sourceWidth(source);
  const height = sourceHeight(source);
  return { height, ready: width > 0 && height > 0 && source?.complete !== false, width };
}
function optionalPositivePair(value3) {
  if (Array.isArray(value3)) {
    const pair3 = [Number(value3[0]), Number(value3[1])];
    return pair3.every((item2) => Number.isFinite(item2) && item2 > 0) ? pair3 : null;
  }
  const number = Number(value3);
  return Number.isFinite(number) && number > 0 ? [number, number] : null;
}
function positivePair(value3, fallback) {
  return optionalPositivePair(value3) || [...fallback];
}
function finitePair(value3, fallback) {
  if (!Array.isArray(value3)) return [...fallback];
  return value3.slice(0, 2).map((item2, index) => Number.isFinite(Number(item2)) ? Number(item2) : fallback[index]);
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-terrain-layer-policy.js
var TERRAIN_LAYER_TARGET = 6;
var TERRAIN_RESERVED_FRAGMENT_UNITS = 2;
var TERRAIN_FIRST_TEXTURE_UNIT = 3;
function terrainLayerCapacity(gl) {
  const fragmentLimit = numericLimit(gl, gl.MAX_TEXTURE_IMAGE_UNITS, 8);
  const combinedLimit = numericLimit(gl, gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS, 8);
  return Math.max(0, Math.min(
    TERRAIN_LAYER_TARGET,
    fragmentLimit - TERRAIN_RESERVED_FRAGMENT_UNITS,
    combinedLimit - TERRAIN_FIRST_TEXTURE_UNIT
  ));
}
function terrainLayerUnits(count = TERRAIN_LAYER_TARGET) {
  const capacity = Math.max(0, Math.min(TERRAIN_LAYER_TARGET, Math.floor(count)));
  return Object.freeze(Array.from({ length: capacity }, (_, index) => {
    return TERRAIN_FIRST_TEXTURE_UNIT + index;
  }));
}
function numericLimit(gl, key, fallback) {
  const value3 = Number(gl.getParameter?.(key));
  return Number.isFinite(value3) && value3 > 0 ? value3 : fallback;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-layered-texture-state.js
var TERRAIN_LAYER_COUNT = TERRAIN_LAYER_TARGET;
var TERRAIN_LAYER_UNITS = terrainLayerUnits(TERRAIN_LAYER_TARGET);
function layeredTextureState(material = {}) {
  if (!Array.isArray(material.textureLayers)) return [];
  return Array.from({ length: TERRAIN_LAYER_COUNT }, (_, index) => layerState(material.textureLayers[index] || {}, material));
}
function sameLayeredTextureState(left = [], right = []) {
  if (left.length !== right.length) return false;
  return left.every((layer, index) => sameLayer(layer, right[index]));
}
function layerState(layer, material) {
  const policy2 = { ...material.texturePolicy || {}, ...layer.texturePolicy || {} };
  const repeat = resolveNativeTextureRepeat(layer.image, layer.repeat || [1, 1], policy2);
  return {
    angle: finite2(layer.angle, 0),
    height: pair2(layer.height, [-1e4, 1e4]),
    image: layer.image || null,
    policySignature: nativeTexturePolicySignature(policy2),
    ready: sourceReady(layer.image),
    repeat0: repeat[0],
    repeat1: repeat[1],
    role: layer.role || "",
    slope: pair2(layer.slope, [0, 1]),
    strength: finite2(layer.strength, 0),
    wetness: finite2(layer.wetness, 0),
    zones: vector4(layer.zones)
  };
}
function sameLayer(left, right) {
  return Boolean(right) && left.image === right.image && left.ready === right.ready && left.repeat0 === right.repeat0 && left.repeat1 === right.repeat1 && left.strength === right.strength && left.role === right.role && left.angle === right.angle && sameArray(left.policySignature, right.policySignature) && sameArray(left.zones, right.zones) && sameArray(left.slope, right.slope) && sameArray(left.height, right.height) && left.wetness === right.wetness;
}
function pair2(value3, fallback) {
  if (!Array.isArray(value3)) return [...fallback];
  return [finite2(value3[0], fallback[0]), finite2(value3[1], fallback[1])];
}
function vector4(value3) {
  return Array.from({ length: 4 }, (_, index) => finite2(value3?.[index], 1));
}
function finite2(value3, fallback) {
  return Number.isFinite(Number(value3)) ? Number(value3) : fallback;
}
function sameArray(left, right) {
  return left.length === right.length && left.every((value3, index) => value3 === right[index]);
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-texture-state-fingerprint-core.js
function captureSourceFingerprint(source) {
  return {
    ready: sourceReady(source),
    source: source || null
  };
}
function sameSourceFingerprint(fingerprint, source) {
  return fingerprint.source === (source || null) && fingerprint.ready === sourceReady(source);
}
function capturePair(value3, fallback = [1, 1]) {
  return [
    finite3(value3?.[0], fallback[0]),
    finite3(value3?.[1], fallback[1])
  ];
}
function samePair(pair3, value3, fallback = [1, 1]) {
  return pair3[0] === finite3(value3?.[0], fallback[0]) && pair3[1] === finite3(value3?.[1], fallback[1]);
}
function capturePolicy(policy2 = {}) {
  return {
    nativeTexelDensity: policy2.nativeTexelDensity,
    surfaceWorldSize: capturePair(policy2.surfaceWorldSize, [0, 0]),
    texelsPerWorld: policy2.texelsPerWorld,
    tileWorld: policy2.tileWorld,
    uvUnitsPerWorld: policy2.uvUnitsPerWorld
  };
}
function samePolicy(fingerprint, policy2 = {}) {
  return fingerprint.nativeTexelDensity === policy2.nativeTexelDensity && fingerprint.texelsPerWorld === policy2.texelsPerWorld && fingerprint.tileWorld === policy2.tileWorld && fingerprint.uvUnitsPerWorld === policy2.uvUnitsPerWorld && samePair(fingerprint.surfaceWorldSize, policy2.surfaceWorldSize, [0, 0]);
}
function captureVector(value3, length2, fallback) {
  return Array.from({ length: length2 }, (_, index) => {
    return finite3(value3?.[index], fallback[index]);
  });
}
function sameVector(vector3, value3, fallback) {
  return vector3.every((entry, index) => {
    return entry === finite3(value3?.[index], fallback[index]);
  });
}
function finite3(value3, fallback) {
  const number = Number(value3);
  return Number.isFinite(number) ? number : fallback;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-texture-layer-fingerprint.js
var EMPTY_LAYERS = Object.freeze([]);
var HEIGHT_DEFAULT = [-1e4, 1e4];
var SLOPE_DEFAULT = [0, 1];
var ZONE_DEFAULT = [1, 1, 1, 1];
function captureLayerFingerprints(material = {}) {
  const layers = material.textureLayers || EMPTY_LAYERS;
  return {
    layers,
    records: layers.map((layer) => captureLayer(layer))
  };
}
function sameLayerFingerprints(fingerprint, material = {}) {
  const layers = material.textureLayers || EMPTY_LAYERS;
  if (fingerprint.layers !== layers) return false;
  if (fingerprint.records.length !== layers.length) return false;
  return fingerprint.records.every((record, index) => {
    return sameLayer2(record, layers[index] || {});
  });
}
function captureLayer(layer = {}) {
  return {
    angle: numeric(layer.angle, 0),
    height: captureVector(layer.height, 2, HEIGHT_DEFAULT),
    image: captureSourceFingerprint(layer.image),
    layer,
    policy: capturePolicy(layer.texturePolicy),
    repeat: capturePair(layer.repeat, [1, 1]),
    role: layer.role || "",
    slope: captureVector(layer.slope, 2, SLOPE_DEFAULT),
    strength: numeric(layer.strength, 0),
    wetness: numeric(layer.wetness, 0),
    zones: captureVector(layer.zones, 4, ZONE_DEFAULT)
  };
}
function sameLayer2(record, layer) {
  return record.layer === layer && record.angle === numeric(layer.angle, 0) && record.role === (layer.role || "") && record.strength === numeric(layer.strength, 0) && record.wetness === numeric(layer.wetness, 0) && sameSourceFingerprint(record.image, layer.image) && samePair(record.repeat, layer.repeat, [1, 1]) && samePolicy(record.policy, layer.texturePolicy) && sameVector(record.zones, layer.zones, ZONE_DEFAULT) && sameVector(record.slope, layer.slope, SLOPE_DEFAULT) && sameVector(record.height, layer.height, HEIGHT_DEFAULT);
}
function numeric(value3, fallback) {
  const number = Number(value3);
  return Number.isFinite(number) ? number : fallback;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-texture-state-fingerprint.js
function captureTextureFingerprint(material = {}) {
  return {
    layers: captureLayerFingerprints(material),
    mapImage: captureSourceFingerprint(material.mapImage),
    mapPolicy: capturePolicy(material.texturePolicy),
    mapRepeat: capturePair(material.mapRepeat, [1, 1]),
    mixImage: captureSourceFingerprint(material.mixImage),
    mixPolicy: capturePolicy(material.mixTexturePolicy),
    mixRepeat: capturePair(material.mixRepeat, [1, 1]),
    mixStrength: numberOr(material.mixStrength, 0),
    patchScale: numberOr(material.mixPatchScale, 0),
    patchSharpness: numberOr(material.mixPatchSharpness, 0.58)
  };
}
function sameTextureFingerprint(fingerprint, material = {}) {
  return Boolean(fingerprint) && fingerprint.mixStrength === numberOr(material.mixStrength, 0) && fingerprint.patchScale === numberOr(material.mixPatchScale, 0) && fingerprint.patchSharpness === numberOr(material.mixPatchSharpness, 0.58) && sameSourceFingerprint(fingerprint.mapImage, material.mapImage) && sameSourceFingerprint(fingerprint.mixImage, material.mixImage) && samePair(fingerprint.mapRepeat, material.mapRepeat, [1, 1]) && samePair(fingerprint.mixRepeat, material.mixRepeat, [1, 1]) && samePolicy(fingerprint.mapPolicy, material.texturePolicy) && samePolicy(fingerprint.mixPolicy, material.mixTexturePolicy) && sameLayerFingerprints(fingerprint.layers, material);
}
function numberOr(value3, fallback) {
  const number = Number(value3);
  return Number.isFinite(number) ? number : fallback;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-texture-state.js
var cache = /* @__PURE__ */ new WeakMap();
var diagnostics = {
  hits: 0,
  invalidations: 0,
  misses: 0
};
function textureState(material = {}) {
  if (!material || typeof material !== "object") return buildTextureState({});
  const cached = cache.get(material);
  if (cached && sameTextureFingerprint(cached.fingerprint, material)) {
    diagnostics.hits += 1;
    return cached.state;
  }
  if (cached) diagnostics.invalidations += 1;
  else diagnostics.misses += 1;
  const state = buildTextureState(material);
  cache.set(material, {
    fingerprint: captureTextureFingerprint(material),
    state
  });
  return state;
}
function sameTextureState(left, right) {
  if (left === right) return true;
  if (!left || !right) return false;
  return left.mapImage === right.mapImage && left.mapReady === right.mapReady && left.mapRepeat0 === right.mapRepeat0 && left.mapRepeat1 === right.mapRepeat1 && left.mixImage === right.mixImage && left.mixReady === right.mixReady && left.mixRepeat0 === right.mixRepeat0 && left.mixRepeat1 === right.mixRepeat1 && left.mixStrength === right.mixStrength && left.patchScale === right.patchScale && left.patchSharpness === right.patchSharpness && sameLayeredTextureState(left.layers, right.layers);
}
function buildTextureState(material) {
  const mapRepeat = resolveNativeTextureRepeat(
    material.mapImage,
    material.mapRepeat || [1, 1],
    material.texturePolicy
  );
  const mixPolicy = {
    ...material.texturePolicy || {},
    ...material.mixTexturePolicy || {}
  };
  const mixRepeat = resolveNativeTextureRepeat(
    material.mixImage,
    material.mixRepeat || [1, 1],
    material.texturePolicy,
    material.mixTexturePolicy
  );
  return Object.freeze({
    layers: layeredTextureState(material),
    mapImage: material.mapImage || null,
    mapPolicySignature: nativeTexturePolicySignature(material.texturePolicy),
    mapReady: sourceReady(material.mapImage),
    mapRepeat0: mapRepeat[0],
    mapRepeat1: mapRepeat[1],
    mixImage: material.mixImage || null,
    mixPolicySignature: nativeTexturePolicySignature(mixPolicy),
    mixReady: sourceReady(material.mixImage),
    mixRepeat0: mixRepeat[0],
    mixRepeat1: mixRepeat[1],
    mixStrength: material.mixStrength ?? 0,
    patchScale: material.mixPatchScale ?? 0,
    patchSharpness: material.mixPatchSharpness ?? 0.58
  });
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-material-signature.js
var cache2 = /* @__PURE__ */ new WeakMap();
var objectIds = /* @__PURE__ */ new WeakMap();
var diagnostics2 = { hits: 0, invalidations: 0, misses: 0 };
var nextObjectId = 1;
function materialSignature2(mesh) {
  return cachedSignatures(mesh).full;
}
function staticBatchMaterialSignature(mesh) {
  return cachedSignatures(mesh).batch;
}
function objectIdentity(object) {
  if (!object || typeof object !== "object") return 0;
  if (!objectIds.has(object)) {
    objectIds.set(object, nextObjectId);
    nextObjectId += 1;
  }
  return objectIds.get(object);
}
function cachedSignatures(mesh) {
  const textures = textureState(mesh.material || {});
  const cached = cache2.get(mesh);
  if (cached && sameMaterialSignatureState(cached.observed, mesh, textures)) {
    diagnostics2.hits += 1;
    return cached;
  }
  if (cached) diagnostics2.invalidations += 1;
  else diagnostics2.misses += 1;
  const observed = captureMaterialSignatureState(mesh, textures);
  const signatures = Object.freeze({
    batch: buildSignature(observed, false),
    full: buildSignature(observed, true),
    observed
  });
  cache2.set(mesh, signatures);
  return signatures;
}
function buildSignature(state, includeColor) {
  const values = [];
  if (includeColor) values.push(state.color0, state.color1, state.color2);
  values.push(
    state.opacity,
    state.alphaMode,
    state.alphaCutoff,
    surfaceSidedness(state),
    state.emissiveStrength,
    state.materialMode
  );
  appendTextureSignature(values, state.textureState, objectIdentity);
  values.push(
    state.anisotropy,
    state.grassReactive ? 1 : 0,
    state.grassRadius,
    state.grassWind,
    state.geometryMode
  );
  return values.join("|");
}
function surfaceSidedness(state) {
  if (state.doubleSided) return "double-sided";
  if (state.cullingDisabled) return "culling-disabled";
  return "backface-culling";
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/ChossidConsolidationGrouping.js
function collectChossidConsolidationGroups(root) {
  const groups = /* @__PURE__ */ new Map();
  let prunedHelpers = 0;
  root.traverse((mesh) => {
    if (!eligibleMesh(mesh) || !visibleHierarchy(mesh)) return;
    if (!mesh.geometry.attributes.normal) {
      mesh.visible = false;
      prunedHelpers += 1;
      return;
    }
    const skinned = Boolean(mesh.isSkinnedMesh && mesh.skeleton);
    const anchor2 = skinned ? mesh.parent : nearestAnimatedAnchor(mesh, root);
    const key = groupKey(mesh, anchor2, skinned);
    if (!groups.has(key)) {
      groups.set(key, {
        anchor: anchor2,
        key,
        meshes: [],
        skinned,
        skeleton: skinned ? mesh.skeleton : null
      });
    }
    groups.get(key).meshes.push(mesh);
  });
  return { groups: [...groups.values()], prunedHelpers };
}
function eligibleMesh(mesh) {
  return Boolean(
    mesh?.geometry?.attributes?.position && (mesh.geometry.mode ?? mesh.primitiveMode ?? 4) === 4 && mesh.material && mesh.material.transparent !== true && mesh.material.alphaMode !== "BLEND" && !mesh.userData?.AwtsmoosChossidConsolidation
  );
}
function visibleHierarchy(object) {
  for (let current = object; current; current = current.parent) {
    if (current.visible === false) return false;
  }
  return true;
}
function nearestAnimatedAnchor(mesh, root) {
  for (let current = mesh.parent; current && current !== root; current = current.parent) {
    if (current.isBone) return current;
  }
  return root;
}
function groupKey(mesh, anchor2, skinned) {
  return [
    skinned ? "skin" : "rigid",
    objectIdentity(anchor2),
    skinned ? objectIdentity(mesh.skeleton) : 0,
    staticBatchMaterialSignature(mesh)
  ].join(":");
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/ChossidMeshConsolidator.js
function consolidateChossidMeshes(root) {
  if (!root?.traverse) return emptyStats();
  root.updateWorldMatrix?.();
  const collected = collectChossidConsolidationGroups(root);
  const batches = [];
  let originalDraws = 0;
  let skinnedSources = 0;
  let rigidSources = 0;
  for (const group of collected.groups) {
    const batch = buildChossidConsolidatedMesh(group);
    if (!batch) continue;
    group.anchor.add(batch);
    for (const mesh of group.meshes) mesh.visible = false;
    batches.push(batch);
    originalDraws += group.meshes.length;
    if (group.skinned) skinnedSources += group.meshes.length;
    else rigidSources += group.meshes.length;
  }
  const stats3 = Object.freeze({
    batches: batches.length,
    consolidatedDraws: batches.length,
    originalDraws,
    prunedHelpers: collected.prunedHelpers,
    rigidSources,
    savedDraws: Math.max(0, originalDraws - batches.length),
    skinnedSources,
    tintBakedBatches: batches.length
  });
  root.userData.AwtsmoosChossidConsolidation = stats3;
  return stats3;
}
function emptyStats() {
  return Object.freeze({
    batches: 0,
    consolidatedDraws: 0,
    originalDraws: 0,
    prunedHelpers: 0,
    rigidSources: 0,
    savedDraws: 0,
    skinnedSources: 0,
    tintBakedBatches: 0
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/ModelMaterialBinder.js
function bindImportedModelMaterials(scene, textureUrl = TEXTURE_URLS.fabric.tanCloth) {
  const image = cachedTextureImage(textureUrl);
  const stats3 = {
    textureUrl,
    imageAvailable: !!image,
    materialsVisited: 0,
    materialsBound: 0,
    materialsAlreadyTextured: 0
  };
  visit(scene, (material) => {
    stats3.materialsVisited += 1;
    if (material.mapImage) {
      stats3.materialsAlreadyTextured += 1;
      return;
    }
    if (!image) return;
    material.mapImage = image;
    material.textureUrl = material.textureUrl || textureUrl;
    material.mapRepeat = material.mapRepeat || [1, 1];
    material.anisotropy = material.anisotropy ?? 2;
    material.texturePolicy = {
      ...material.texturePolicy || {},
      publicFirebase: true,
      realMapImage: true,
      modelFallbackDetail: true
    };
    stats3.materialsBound += 1;
  });
  return stats3;
}
function visit(node, onMaterial) {
  if (!node) return;
  const materials = Array.isArray(node.material) ? node.material : [node.material];
  for (const material of materials.filter(Boolean)) onMaterial(material);
  for (const child of node.children || []) visit(child, onMaterial);
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-cache.js
var SkinPaletteCache = class {
  constructor() {
    this.frameToken = null;
    this.meshWorld = new Float32Array(16);
    this.valid = false;
    this.revision = 0;
  }
  /** Returns true only when a fresh palette computation is required. */
  needsUpdate(frameToken, meshWorld) {
    if (!validFrameToken(frameToken) || !this.valid) {
      return true;
    }
    if (this.frameToken !== frameToken) {
      return true;
    }
    return !matrixEquals(this.meshWorld, meshWorld);
  }
  /** Records the exact transform and increments the palette revision. */
  markUpdated(frameToken, meshWorld) {
    this.frameToken = frameToken;
    copyMatrix(this.meshWorld, meshWorld);
    this.valid = validFrameToken(frameToken);
    this.revision += 1;
    return this.revision;
  }
  invalidate() {
    this.valid = false;
    this.frameToken = null;
  }
};
function matrixEquals(left, right) {
  if (!left || !right || left.length !== 16 || right.length !== 16) {
    return false;
  }
  for (let index = 0; index < 16; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }
  return true;
}
function copyMatrix(target, source) {
  if (!source || source.length !== 16) {
    target.fill(Number.NaN);
    return;
  }
  for (let index = 0; index < 16; index += 1) {
    target[index] = source[index];
  }
}
function validFrameToken(frameToken) {
  return Number.isInteger(frameToken) && frameToken >= 0;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-lines.js
function skeletonLinePositions(root) {
  const positions = [];
  root.traverse((node) => {
    const skeletons = node.userData?.skeletons;
    if (!(skeletons instanceof Map)) {
      return;
    }
    for (const skeleton of skeletons.values()) {
      appendSkeletonLines(skeleton, positions);
    }
  });
  return new Float32Array(positions);
}
function appendSkeletonLines(skeleton, positions) {
  const jointSet = new Set(skeleton.joints.filter(Boolean));
  for (const joint of jointSet) {
    const parent = joint.parent;
    if (!parent || !jointSet.has(parent)) {
      continue;
    }
    positions.push(
      parent.matrixWorld[12],
      parent.matrixWorld[13],
      parent.matrixWorld[14],
      joint.matrixWorld[12],
      joint.matrixWorld[13],
      joint.matrixWorld[14]
    );
  }
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-matrix.js
function readSkinMatrix(accessor, index) {
  const source = accessor?.array || accessor;
  if (!source) {
    return identity();
  }
  const matrix = new Float32Array(16);
  for (let component = 0; component < 16; component += 1) {
    matrix[component] = source[index * 16 + component] ?? (component % 5 === 0 ? 1 : 0);
  }
  return matrix;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-binding.js
function bindSceneSkeletons(root, doc, accessors, createSkeleton) {
  const nodeMap = root.userData?.nodeMap || /* @__PURE__ */ new Map();
  const skeletons = /* @__PURE__ */ new Map();
  let maxJoints = 0;
  let missingJoints = 0;
  for (let skinIndex = 0; skinIndex < (doc.skins || []).length; skinIndex += 1) {
    const skinDefinition = doc.skins[skinIndex] || {};
    const inverseBindAccessor = skinDefinition.inverseBindMatrices === void 0 ? null : accessors[skinDefinition.inverseBindMatrices];
    const skeleton = createSkeleton({
      inverseBindAccessor,
      nodeMap,
      skinDef: skinDefinition,
      skinIndex
    });
    skeletons.set(skinIndex, skeleton);
    maxJoints = Math.max(maxJoints, skeleton.jointCount);
    missingJoints += skeleton.joints.filter((joint) => !joint).length;
  }
  const meshStats = bindMeshes(root, skeletons);
  root.userData.skeletons = skeletons;
  return {
    maxJoints,
    missingJoints,
    skeletonCount: skeletons.size,
    ...meshStats
  };
}
function bindMeshes(root, skeletons) {
  let rigidMeshes = 0;
  let skinnedMeshes = 0;
  root.traverse((node) => {
    if (!node.isMesh) return;
    const hasSkinAttributes = Boolean(
      node.geometry?.attributes?.joints && node.geometry?.attributes?.weights
    );
    node.skeleton = skeletons.get(node.skinIndex) || null;
    node.isSkinnedMesh = Boolean(node.skeleton && hasSkinAttributes);
    if (node.isSkinnedMesh) skinnedMeshes += 1;
    else rigidMeshes += 1;
  });
  return {
    rigidMeshes,
    skinnedMeshes
  };
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-scene.js
function collectWorldMatrices(root, reusableWorldByNode = null) {
  const worldByNode = reusableWorldByNode instanceof Map ? reusableWorldByNode : /* @__PURE__ */ new Map();
  worldByNode.clear();
  const stats3 = reusableStats(worldByNode.stats);
  updateVisibleBranch(
    root,
    ROOT_WORLD_MATRIX,
    0,
    worldByNode,
    stats3,
    true
  );
  worldByNode.stats = stats3;
  return worldByNode;
}
function updateVisibleBranch(node, parentWorld, parentRevision, worldByNode, stats3, parentVisible) {
  const visible = parentVisible && node.visible !== false;
  if (!visible) {
    stats3.skippedSubtrees += 1;
    return;
  }
  const changed = updateCachedWorldMatrix(
    node,
    parentWorld,
    parentRevision
  );
  if (changed) stats3.updatedNodes += 1;
  else stats3.reusedNodes += 1;
  node.userData ||= {};
  node.userData.worldMatrix = node.matrixWorld;
  worldByNode.set(node, node.matrixWorld);
  for (const child of node.children || []) {
    updateVisibleBranch(
      child,
      node.matrixWorld,
      node._worldRevision || 0,
      worldByNode,
      stats3,
      visible
    );
  }
}
function reusableStats(stats3) {
  const result = stats3 || {
    reusedNodes: 0,
    skippedSubtrees: 0,
    updatedNodes: 0
  };
  result.reusedNodes = 0;
  result.skippedSubtrees = 0;
  result.updatedNodes = 0;
  return result;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-skin-system.js
var MAX_TINY_JOINTS = 96;
var TinySkeleton = class {
  constructor({
    skinIndex = 0,
    skinDef = {},
    nodeMap = /* @__PURE__ */ new Map(),
    inverseBindAccessor = null
  } = {}) {
    this.skinIndex = skinIndex;
    this.name = skinDef.name || `Skin_${skinIndex}`;
    this.joints = (skinDef.joints || []).map((index) => nodeMap.get(index));
    this.inverseBindMatrices = this.joints.map((_, index) => readSkinMatrix(inverseBindAccessor, index));
    this.jointCount = this.joints.length;
    this.jointMatrices = new Float32Array(Math.max(1, this.jointCount) * 16);
    this.paletteCache = new SkinPaletteCache();
    this.paletteRevision = 0;
    this.lastPaletteRecomputed = false;
    this.resetPalette();
  }
  resetPalette() {
    for (let index = 0; index < Math.max(1, this.jointCount); index += 1) {
      this.jointMatrices.set(identity(), index * 16);
    }
  }
  update(meshWorld = identity()) {
    this.computePalette(meshWorld);
    this.paletteRevision += 1;
    this.paletteCache.invalidate();
    this.lastPaletteRecomputed = true;
    return Math.min(this.jointCount, MAX_TINY_JOINTS);
  }
  updateCached(meshWorld = identity(), frameToken) {
    if (!this.paletteCache.needsUpdate(frameToken, meshWorld)) {
      this.lastPaletteRecomputed = false;
      return Math.min(this.jointCount, MAX_TINY_JOINTS);
    }
    this.computePalette(meshWorld);
    this.paletteCache.markUpdated(frameToken, meshWorld);
    this.paletteRevision += 1;
    this.lastPaletteRecomputed = true;
    return Math.min(this.jointCount, MAX_TINY_JOINTS);
  }
  invalidatePaletteCache() {
    this.paletteCache.invalidate();
  }
  computePalette(meshWorld) {
    const inverseMesh = inverse(meshWorld);
    const count = Math.min(this.jointCount, MAX_TINY_JOINTS);
    for (let index = 0; index < count; index += 1) {
      const joint = this.joints[index];
      const jointWorld = joint?.userData?.worldMatrix || joint?.matrixWorld || identity();
      const skinMatrix = multiply(
        inverseMesh,
        multiply(jointWorld, this.inverseBindMatrices[index])
      );
      this.jointMatrices.set(skinMatrix, index * 16);
    }
  }
};
function bindTinySkeletons(root, doc, accessors) {
  return bindSceneSkeletons(
    root,
    doc,
    accessors,
    (configuration) => new TinySkeleton(configuration)
  );
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-materials.js
var DEFAULT_COLOR = [1, 1, 1, 1];
async function createTinyMaterials(doc, buffers, baseUrl) {
  const images = await loadImages(doc, buffers, baseUrl);
  const materials = (doc.materials || []).map((def, index) => materialFromDef(doc, def, index, images));
  return { materials, images, diagnostics: materialDiagnostics(doc, materials, images) };
}
function materialFromDef(doc, def = {}, index = 0, images = []) {
  const pbr = def.pbrMetallicRoughness || {}, factor = pbr.baseColorFactor || DEFAULT_COLOR;
  const tex2 = textureImage(doc, pbr.baseColorTexture, images);
  const color = tex2 ? factor : displayColor(factor);
  const mat = new MeshStandardMaterial({ name: def.name || `material_${index}`, color, opacity: factor[3] ?? 1, alphaMode: def.alphaMode || "OPAQUE", alphaCutoff: def.alphaCutoff ?? 0.5, transparent: (def.alphaMode || "OPAQUE") === "BLEND" || (factor[3] ?? 1) < 1, doubleSided: def.doubleSided === true });
  Object.assign(mat, { metallicFactor: pbr.metallicFactor ?? 1, roughnessFactor: pbr.roughnessFactor ?? 1, baseColorFactor: factor, sourceColorSpace: tex2 ? "texture+sRGB-factor" : "gltf-factor-linear-to-display", mapImage: tex2?.image || null, textureUrl: tex2?.url || null, mapRepeat: tex2?.repeat || [1, 1], anisotropy: true });
  return mat;
}
function defaultTinyMaterial() {
  const mat = new MeshStandardMaterial({ name: "material_default", color: DEFAULT_COLOR, opacity: 1, alphaMode: "OPAQUE" });
  Object.assign(mat, { sourceColorSpace: "neutral-default", mapRepeat: [1, 1], anisotropy: true });
  return mat;
}
function textureImage(doc, info, images) {
  if (!info) return null;
  const tex2 = doc.textures?.[info.index];
  if (!tex2) return null;
  const image = images[tex2.source];
  if (!image) return null;
  const sampler = doc.samplers?.[tex2.sampler] || {};
  return { image, url: image.dataset?.url || image.src || `image_${tex2.source}`, repeat: sampler.wrapS === 33071 || sampler.wrapT === 33071 ? [1, 1] : [1, 1] };
}
async function loadImages(doc, buffers, baseUrl) {
  return await Promise.all((doc.images || []).map((image, index) => loadOneImage(doc, buffers, baseUrl, image, index)));
}
async function loadOneImage(doc, buffers, baseUrl, image, index) {
  if (image.uri) return await loadUriImage(new URL(image.uri, baseUrl).href, index);
  if (image.bufferView !== void 0) {
    const bv = doc.bufferViews[image.bufferView], buffer = buffers[bv.buffer];
    const bytes = buffer.slice(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
    const blob = new Blob([bytes], { type: image.mimeType || "image/png" });
    const url = URL.createObjectURL(blob);
    try {
      return await loadUriImage(url, index, `glb-bufferView:${image.bufferView}`);
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 2e3);
    }
  }
  return null;
}
function loadUriImage(src, index, label = src) {
  return new Promise((resolve) => {
    const img = new Image();
    let done = false;
    const finish = (value3) => {
      if (!done) {
        done = true;
        resolve(value3);
      }
    };
    img.crossOrigin = src.startsWith("blob:") ? null : "anonymous";
    img.onload = () => {
      img.dataset.url = label;
      img.dataset.index = String(index);
      finish(img);
    };
    img.onerror = () => finish(null);
    img.src = src;
  });
}
function displayColor(color) {
  return [toSrgb(color[0] ?? 1), toSrgb(color[1] ?? 1), toSrgb(color[2] ?? 1), color[3] ?? 1];
}
function toSrgb(v2) {
  v2 = Math.max(0, Math.min(1, v2));
  return v2 <= 31308e-7 ? v2 * 12.92 : 1.055 * Math.pow(v2, 1 / 2.4) - 0.055;
}
function materialDiagnostics(doc, materials, images) {
  return { count: materials.length, images: images.filter(Boolean).length, textures: (doc.textures || []).length, defaultColor: DEFAULT_COLOR, colorsConverted: true, entries: materials.map((m, i) => ({ i, name: m.name, color: m.color, raw: m.baseColorFactor, hasMap: !!m.mapImage, textureSize: m.mapImage ? `${m.mapImage.naturalWidth}x${m.mapImage.naturalHeight}` : null, sourceColorSpace: m.sourceColorSpace })).slice(0, 64) };
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-loader.js
var GLB_MAGIC = 1179937895;
var JSON_CHUNK = 1313821514;
var BIN_CHUNK = 5130562;
var ATTR = { POSITION: "position", NORMAL: "normal", TEXCOORD_0: "uv", COLOR_0: "color", JOINTS_0: "joints", WEIGHTS_0: "weights" };
async function fetchBuffer(url) {
  const r = await fetch(url, { mode: "cors" });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return await r.arrayBuffer();
}
function dataUri(uri) {
  const raw = atob(uri.split(",")[1] || ""), out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out.buffer;
}
async function loadBuffers(doc, baseUrl, bin) {
  return await Promise.all((doc.buffers || []).map((b) => b.uri ? b.uri.startsWith("data:") ? dataUri(b.uri) : fetchBuffer(new URL(b.uri, baseUrl).href) : bin));
}
function parseGlb(buffer) {
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== GLB_MAGIC) throw new Error("Not a GLB container");
  let json = null, bin = null, chunks = [];
  for (let off = 12; off + 8 <= buffer.byteLength; ) {
    const len = view.getUint32(off, true), type = view.getUint32(off + 4, true), bytes = buffer.slice(off + 8, off + 8 + len);
    chunks.push({ type, byteOffset: off + 8, byteLength: len });
    if (type === JSON_CHUNK) json = JSON.parse(new TextDecoder().decode(bytes));
    if (type === BIN_CHUNK) bin = bytes;
    off += 8 + len;
  }
  if (!json) throw new Error("GLB missing JSON chunk");
  return { json, bin, chunks };
}
function markBones(doc) {
  const bones = /* @__PURE__ */ new Set();
  for (const s of doc.skins || []) for (const j of s.joints || []) bones.add(j);
  return bones;
}
function makeAccessorGetter(doc, buffers, cache3) {
  return (i) => cache3[i] || (cache3[i] = readAccessor(doc, buffers, i));
}
function warmAnimationAccessors(doc, getAccessor) {
  for (const a of doc.animations || []) for (const s of a.samplers || []) {
    if (s.input !== void 0) getAccessor(s.input);
    if (s.output !== void 0) getAccessor(s.output);
  }
}
function primitiveMesh(materials, getAccessor, primitive2, meshDef, nodeDef, primitiveIndex) {
  const geometry = new BufferGeometry();
  geometry.mode = primitive2.mode ?? 4;
  geometry.userData = { primitive: primitive2, primitiveIndex };
  for (const [semantic, accessorIndex] of Object.entries(primitive2.attributes || {})) {
    const key = ATTR[semantic];
    if (!key) continue;
    let attribute5 = getAccessor(accessorIndex);
    if (key === "weights") attribute5 = normalizeWeightsAttribute(attribute5);
    geometry.setAttribute(key, attribute5);
  }
  if (primitive2.indices !== void 0) geometry.setIndex(getAccessor(primitive2.indices));
  const mesh = new Mesh(geometry, primitive2.material !== void 0 ? materials[primitive2.material] : defaultTinyMaterial());
  mesh.name = meshDef.name || nodeDef.name || `mesh_${nodeDef.mesh}_${primitiveIndex}`;
  mesh.skinIndex = nodeDef.skin ?? null;
  mesh.primitiveMode = geometry.mode;
  mesh.userData = { meshDef, primitive: primitive2, primitiveIndex };
  return mesh;
}
function applyNodeTransform(obj, nodeDef, index) {
  obj.userData.nodeIndex = index;
  obj.userData.gltfNode = nodeDef;
  if (nodeDef.name) {
    obj.name = nodeDef.name;
    obj.userData.name = nodeDef.name;
  }
  if (nodeDef.matrix) obj.matrix = mat4FromArray(nodeDef.matrix);
  else {
    if (nodeDef.translation) obj.position.fromArray(nodeDef.translation);
    if (nodeDef.rotation) obj.quaternion.fromArray(nodeDef.rotation);
    if (nodeDef.scale) obj.scale.fromArray(nodeDef.scale);
  }
  obj.setBaseTransform();
}
function buildNodes(doc, materials, getAccessor, bones, stats3) {
  const nodeMap = /* @__PURE__ */ new Map(), nodes = [];
  for (let i = 0; i < (doc.nodes || []).length; i++) {
    const def = doc.nodes[i] || {}, node = bones.has(i) ? new Bone() : new Group();
    applyNodeTransform(node, def, i);
    nodes[i] = node;
    nodeMap.set(i, node);
    stats3.nodes++;
    if (def.skin !== void 0) stats3.skinnedNodes++;
  }
  for (let i = 0; i < nodes.length; i++) {
    const def = doc.nodes[i] || {}, node = nodes[i], meshDef = doc.meshes?.[def.mesh];
    if (!meshDef) continue;
    for (let p = 0; p < (meshDef.primitives || []).length; p++) {
      const mesh = primitiveMesh(materials, getAccessor, meshDef.primitives[p], meshDef, def, p);
      mesh.nodeIndex = i;
      mesh.setBaseTransform();
      node.add(mesh);
      stats3.meshes++;
      stats3.primitives++;
      if (mesh.skinIndex !== null && mesh.geometry.attributes.joints && mesh.geometry.attributes.weights) stats3.skinnedPrimitives++;
    }
  }
  for (let i = 0; i < nodes.length; i++) for (const childIndex of doc.nodes[i]?.children || []) nodes[i].add(nodes[childIndex]);
  return { nodes, nodeMap };
}
function skinDetails(doc) {
  return (doc.skins || []).map((s, index) => ({ index, name: s.name || null, joints: (s.joints || []).length, skeleton: s.skeleton ?? null, hasInverseBind: s.inverseBindMatrices !== void 0, inverseBindAccessor: s.inverseBindMatrices }));
}
function accessorDetails(doc) {
  const out = [];
  for (const m of doc.meshes || []) for (const p of m.primitives || []) for (const [sem, i] of Object.entries(p.attributes || {})) if (sem === "JOINTS_0" || sem === "WEIGHTS_0") out.push(`${sem}: ${accessorSummary(doc, i)}`);
  return [...new Set(out)].slice(0, 24);
}
async function loadTinyGltf(url) {
  const started = performance.now(), buffer = await fetchBuffer(url), glb = parseGlb(buffer), doc = glb.json, buffers = await loadBuffers(doc, url, glb.bin), accessors = [], getAccessor = makeAccessorGetter(doc, buffers, accessors), root = new Group(), bones = markBones(doc), materialPack = await createTinyMaterials(doc, buffers, url);
  root.name = "AwtsmoosTinyGltfRoot";
  const stats3 = { nodes: 0, meshes: 0, primitives: 0, materials: (doc.materials || []).length, images: (doc.images || []).length, textures: (doc.textures || []).length, animations: (doc.animations || []).length, skins: (doc.skins || []).length, skinnedNodes: 0, skinnedPrimitives: 0, bytes: buffer.byteLength, chunks: glb.chunks, skinDetails: skinDetails(doc), animationDetails: summarizeAnimations(doc), accessorDetails: accessorDetails(doc), materialDetails: materialPack.diagnostics };
  for (let i = 0; i < (doc.accessors || []).length; i++) if (doc.accessors[i].type === "MAT4" || doc.accessors[i].type === "SCALAR") getAccessor(i);
  warmAnimationAccessors(doc, getAccessor);
  const built = buildNodes(doc, materialPack.materials, getAccessor, bones, stats3), scene = doc.scenes?.[doc.scene || 0] || doc.scenes?.[0] || { nodes: built.nodes.map((_, i) => i) };
  for (const nodeIndex of scene.nodes || []) root.add(built.nodes[nodeIndex]);
  Object.assign(root.userData, { gltf: doc, nodeMap: built.nodeMap, allNodes: built.nodes, skins: doc.skins || [], accessors, sourceUrl: url, materials: materialPack.materials, materialDetails: materialPack.diagnostics });
  const clips = parseTinyAnimations(doc, accessors, built.nodeMap);
  Object.assign(stats3, bindTinySkeletons(root, doc, accessors));
  stats3.joints = (doc.skins || []).reduce((n, s) => n + (s.joints?.length || 0), 0);
  stats3.skeletonName = doc.skins?.[0]?.name || null;
  stats3.hasInverseBind = !!doc.skins?.[0]?.inverseBindMatrices;
  stats3.clips = clips.map((c) => ({ index: c.index, name: c.name, duration: c.duration, channels: c.channels.length }));
  stats3.ms = Math.round(performance.now() - started);
  root.userData.animations = clips;
  return { scene: root, json: doc, stats: stats3, animations: clips, experimental: true };
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-gltf-instance.js
function instantiateTinyGltf(template, options = {}) {
  if (!template?.scene) throw new Error("A parsed GLTF template is required.");
  const nodeMap = /* @__PURE__ */ new Map();
  const resources = {
    geometries: /* @__PURE__ */ new Set(),
    materials: /* @__PURE__ */ new Set()
  };
  const scene = cloneNode(
    template.scene,
    nodeMap,
    resources,
    options.materialResolver
  );
  const sourceData = template.scene.userData || {};
  const document2 = template.json || sourceData.gltf || {};
  const accessors = sourceData.accessors || [];
  const sourceNodes = sourceData.allNodes || [];
  const allNodes = sourceNodes.map((_, index) => nodeMap.get(index) || null);
  Object.assign(scene.userData, {
    accessors,
    allNodes,
    gltf: document2,
    instanceLabel: options.label || "instance",
    materials: sourceData.materials || [],
    nodeMap,
    sharedSourceUrl: sourceData.sourceUrl || null,
    skins: document2.skins || []
  });
  const skinStats = bindTinySkeletons(scene, document2, accessors);
  const animations = parseTinyAnimations(document2, accessors, nodeMap);
  scene.userData.animations = animations;
  scene.name = `${options.label || "instance"}_shared_gltf_scene`;
  return {
    animations,
    experimental: true,
    json: document2,
    scene,
    stats: {
      ...template.stats || {},
      ...skinStats,
      instanceLabel: options.label || "instance",
      sharedGeometries: resources.geometries.size,
      sharedMaterials: resources.materials.size,
      sharedTemplate: true
    }
  };
}
function cloneNode(source, nodeMap, resources, materialResolver) {
  const target = createNode(source, resources, materialResolver);
  copyNodeState(source, target);
  const nodeIndex = source.userData?.nodeIndex;
  if (Number.isInteger(nodeIndex)) nodeMap.set(nodeIndex, target);
  for (const child of source.children || []) {
    target.add(cloneNode(child, nodeMap, resources, materialResolver));
  }
  target.setBaseTransform();
  return target;
}
function createNode(source, resources, materialResolver) {
  if (source.isBone) return new Bone();
  if (!source.isMesh) return new Group();
  resources.geometries.add(source.geometry);
  collectMaterials(resources.materials, source.material);
  const material = resolveMaterial(
    source.material,
    source,
    materialResolver
  );
  const mesh = new Mesh(source.geometry, material);
  mesh.skinIndex = source.skinIndex;
  mesh.primitiveMode = source.primitiveMode;
  mesh.nodeIndex = source.nodeIndex;
  return mesh;
}
function copyNodeState(source, target) {
  target.name = source.name;
  target.visible = source.visible !== false;
  target.position.copy(source.position);
  target.quaternion.copy(source.quaternion);
  target.scale.copy(source.scale);
  target.matrix = source.matrix ? copyMat4(source.matrix) : null;
  target.userData = { ...source.userData || {} };
}
function resolveMaterial(material, node, resolver) {
  if (Array.isArray(material)) {
    return material.map((item2) => resolver?.(item2, node) || item2);
  }
  return resolver?.(material, node) || material;
}
function collectMaterials(target, material) {
  for (const item2 of Array.isArray(material) ? material : [material]) {
    if (item2) target.add(item2);
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/ModelAssetLoader.js
var templatePromises = /* @__PURE__ */ new Map();
var templateLoads = 0;
var instancesCreated = 0;
async function loadSharedGltfTemplate(url) {
  const resourceUrl = absoluteUrl(url);
  if (!templatePromises.has(resourceUrl)) {
    templateLoads += 1;
    templatePromises.set(resourceUrl, loadTinyGltf(resourceUrl));
  }
  return templatePromises.get(resourceUrl);
}
async function loadIsolatedGltf(url, label, options = {}) {
  const resourceUrl = absoluteUrl(url);
  const template = await loadSharedGltfTemplate(resourceUrl);
  const gltf = instantiateTinyGltf(template, {
    label,
    materialResolver: options.materialResolver
  });
  instancesCreated += 1;
  gltf.scene.userData.isolatedModelLoad = {
    instanceLabel: label,
    originalUrl: url,
    sharedNetworkResource: resourceUrl,
    sharedTemplate: true
  };
  return gltf;
}
function sharedGltfAssetStats() {
  return {
    instancesCreated,
    templateLoads,
    templatesCached: templatePromises.size
  };
}
function absoluteUrl(url) {
  const base = globalThis.location?.href || "http://localhost/";
  return new URL(url, base).href;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/assets/ChossidOutfitCatalog.js
var CHOSSID_OUTFITS = Object.freeze([
  outfit("elder", "#17181b", "#f2eee5", "#18191c", "top-hat"),
  outfit("teacher", "#243a55", "#f4efe5", "#20242d", "top-hat"),
  outfit("shepherd", "#6a4a2d", "#e9ddc5", "#34302a", "yarmulke", false),
  outfit("provider", "#4f3028", "#f1e5cf", "#24231f", "top-hat"),
  outfit("gardener", "#31513e", "#eee2c8", "#293027", "yarmulke", false),
  outfit("watchman", "#34445b", "#e8e0d4", "#232833", "top-hat"),
  outfit("scribe", "#59452f", "#f2eadb", "#26231f", "yarmulke"),
  outfit("ranger", "#384b32", "#dfd2b8", "#242a22", "yarmulke", false),
  outfit("carpenter", "#74442d", "#efe1cb", "#302620", "yarmulke", false),
  outfit("shliach", "#202226", "#f7f4ed", "#151619", "top-hat")
]);
function chossidOutfitFor(index) {
  return CHOSSID_OUTFITS[index % CHOSSID_OUTFITS.length];
}
function outfit(id, coat, shirt, pants, headwear, jacket = true) {
  return Object.freeze({
    colors: Object.freeze({ coat, pants, shirt }),
    headwear,
    id,
    jacket,
    tefillin: false
  });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/npc/FriendlyNpcLifeCatalog.js
var SPECS = /* @__PURE__ */ new Map([
  ["great-spark-refinement", spec("elder shliach", "H12", "beis-chabad-courtyard", "guide-visitors", "inner refinement", [])],
  ["light-at-river-crossing", spec("bridge keeper", "H27", "village-stone-bridge", "maintain-bridge", "responsibility", ["treated-timber"])],
  ["sparks-at-east-gate", spec("rabbi", "H20", "east-gate", "counsel-travelers", "courage", [])],
  ["guard-the-shul", spec("gabbai", "H17", "shul-plaza", "prepare-shul", "communal prayer", [])],
  ["shepherds-mercy", spec("shepherd", "H26", "upper-pasture", "tend-flock", "mercy", ["animal-feed"])],
  ["kosher-provision", spec("provisioner", "H24", "market-provisions", "prepare-provisions", "mindful eating", ["bread", "cheese"])],
  ["orchard-defense", spec("orchard keeper", "H23", "east-orchard", "tend-orchard", "guardianship", ["orchard-fruit"])],
  ["wings-over-lake", spec("watchman", "H25", "lake-overlook", "watch-lake", "vigilance", [])],
  ["wood-for-the-shul", spec("carpenter", "H16", "carpenter-workshop", "shape-timber", "building together", ["treated-timber"])],
  ["flowers-for-shabbos", spec("gardener", "H22", "riverfront-gardens", "tend-flowers", "Shabbos beauty", ["flower-bundle"])],
  ["lost-scroll-by-stream", spec("scribe", "H18", "scribe-study", "write-scroll", "careful remembrance", ["ink", "parchment"])],
  ["forest-predator-patrol", spec("ranger", "H21", "forest-gate", "patrol-forest", "protecting life", [])],
  ["words-of-light", spec("teacher", "H19", "beis-midrash", "teach-torah", "words of light", [])]
]);
var PASSAGES = Object.freeze([
  "modeh-ani",
  "shema-unity",
  "guardian-path",
  "peace-prayer",
  "living-water"
]);
function friendlyNpcLifeMetadata(quest2, index, name = quest2.giver.name) {
  const details = SPECS.get(quest2.id) || spec("village resident", "H10", "market-square", "serve-neighbors", "kindness", []);
  const homeSite = CANONICAL_HOUSES_BY_ID[details.homeId] || CANONICAL_HOUSES_BY_ID.H10;
  const home = place2(homeSite.id, `House ${homeSite.id}`, homeSite.x, homeSite.z);
  const workplace = place2(details.workplaceId, title(details.workplaceId), quest2.giver.position.x, quest2.giver.position.z);
  const vendor = details.inventory.length ? Object.freeze({
    currency: "perutas",
    inventory: details.inventory
  }) : null;
  return Object.freeze({
    dailyAnchors: Object.freeze({
      morning: anchor(gatheringPlace("shul-plaza", -72, -48, index), "pray-shacharis"),
      day: anchor(workplace, details.dayAction),
      evening: anchor(gatheringPlace("market-square", -62, 30, index), "join-village-gathering"),
      night: anchor(home, "rest-at-home")
    }),
    dialogue: dialogue(name, details, quest2, vendor),
    dialogueModes: dialogueModes(vendor),
    home,
    quest: Object.freeze({ giver: true, ids: Object.freeze([quest2.id]) }),
    relationship: Object.freeze({ initial: "neighbor", targetable: true }),
    role: details.role,
    torah: Object.freeze({ passageIds: Object.freeze([PASSAGES[index % PASSAGES.length]]), topic: details.topic }),
    vendor,
    workplace
  });
}
function spec(role, homeId, workplaceId, dayAction, topic, inventory) {
  return Object.freeze({ dayAction, homeId, inventory: Object.freeze(inventory), role, topic, workplaceId });
}
function dialogue(name, details, quest2, vendor) {
  return Object.freeze({
    combatWarning: "Stay near the lanterns when concealment gathers.",
    farewell: "Go in peace, and return safely.",
    greeting: `Shalom. I am ${name}, the village ${details.role}.`,
    questCompletion: "Your help has brought lasting light to our neighbors.",
    questOffer: quest2.storyIntroduction || quest2.description,
    questProgress: "Let us review what remains in this Shlichus.",
    torahDiscussion: `We can learn together about ${details.topic}.`,
    vendor: vendor ? "These provisions are set aside for honest village work." : null
  });
}
function dialogueModes(vendor) {
  const modes = ["greeting", "quest-offer", "quest-progress", "quest-completion", "torah-discussion", "combat-warning", "farewell"];
  if (vendor) modes.splice(4, 0, "vendor");
  return Object.freeze(modes);
}
function gatheringPlace(id, x, z, index) {
  const angle = index * 2.399963;
  const radius = 2.2 + index % 4 * 1.15;
  return place2(`${id}-${index + 1}`, title(id), x + Math.cos(angle) * radius, z + Math.sin(angle) * radius);
}
function anchor(location2, action2) {
  return Object.freeze({ action: action2, location: location2 });
}
function place2(id, label, x, z) {
  return Object.freeze({ id, label, x: Number(x), z: Number(z) });
}
function title(id) {
  return id.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/npc/FriendlyNpcProfiles.js
var PRIMARY_QUEST_ID = "great-spark-refinement";
var QUALITY_COUNTS = Object.freeze({ cinematic: 12, high: 7, low: 3, medium: 4 });
var ALL_PROFILES = Object.freeze(buildFriendlyNpcProfiles());
function friendlyNpcProfiles(quality = "medium") {
  const count = QUALITY_COUNTS[quality] || QUALITY_COUNTS.medium;
  return ALL_PROFILES.slice(0, count);
}
function buildFriendlyNpcProfiles() {
  const primaryQuest = ADVENTURE_CATALOG.find((quest2) => quest2.id === PRIMARY_QUEST_ID);
  const primary = createProfile(primaryQuest, 0, {
    id: "reb-mendel",
    name: "Reb Mendel",
    primary: true,
    x: -8.2,
    z: 43.5
  });
  const questGivers = ADVENTURE_CATALOG.filter((quest2) => quest2.id !== PRIMARY_QUEST_ID).map((quest2, index) => createProfile(quest2, index + 1));
  return [primary, ...questGivers];
}
function createProfile(quest2, index, overrides = {}) {
  const x = overrides.x ?? quest2.giver.position.x;
  const z = overrides.z ?? quest2.giver.position.z;
  const lifeQuest = withWorkPosition(quest2, x, z);
  return Object.freeze({
    ...friendlyNpcLifeMetadata(lifeQuest, index, overrides.name || quest2.giver.name),
    id: overrides.id || quest2.giver.id,
    interactionRadius: 4.5,
    motionPhase: index === 0 ? 0.7 : (index - 1) * 1.37,
    motionSpeed: index === 0 ? 0.18 : 0.2 + (index - 1) % 3 * 0.035,
    name: overrides.name || quest2.giver.name,
    outfit: chossidOutfitFor(index),
    primary: Boolean(overrides.primary),
    questId: quest2.id,
    walkSpeed: 1.1 + index % 3 * 0.12,
    wanderRadius: index === 0 ? 1.45 : 1.7 + (index - 1) % 4 * 0.55,
    x,
    z
  });
}
function withWorkPosition(quest2, x, z) {
  if (x === quest2.giver.position.x && z === quest2.giver.position.z) return quest2;
  return { ...quest2, giver: { ...quest2.giver, position: { x, y: 0, z } } };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzFallbackActorTemplate.js
var COLORS = Object.freeze({
  beard: Object.freeze([0.12, 0.075, 0.045, 1]),
  black: Object.freeze([0.035, 0.038, 0.036, 1]),
  coat: Object.freeze([0.055, 0.06, 0.058, 1]),
  shirt: Object.freeze([0.82, 0.81, 0.73, 1]),
  skin: Object.freeze([0.72, 0.52, 0.38, 1])
});
function createFallbackActorGltf(label = "fallback-chossid", options = {}) {
  const scene = new Group();
  scene.name = `Awtsmoos_${label}_immediate_local_chossid`;
  scene.userData.isolatedModelLoad = {
    fallback: true,
    instanceLabel: label,
    sharedTemplate: false,
    source: "local-procedural-chossid-silhouette"
  };
  const coat = resolveCoatColor(options.outfit);
  const parts = [
    part2("coat", [0.64, 1.12, 0.34], [0, 0.89, 0], coat),
    part2("shirt", [0.22, 0.26, 0.03], [0, 1.29, 0.19], COLORS.shirt),
    part2("left-arm", [0.18, 0.92, 0.22], [-0.41, 0.94, 0], coat),
    part2("right-arm", [0.18, 0.92, 0.22], [0.41, 0.94, 0], coat),
    part2("left-hand", [0.17, 0.18, 0.17], [-0.41, 0.43, 0], COLORS.skin),
    part2("right-hand", [0.17, 0.18, 0.17], [0.41, 0.43, 0], COLORS.skin),
    part2("left-leg", [0.22, 0.7, 0.24], [-0.18, 0.02, 0], COLORS.black),
    part2("right-leg", [0.22, 0.7, 0.24], [0.18, 0.02, 0], COLORS.black),
    part2("left-shoe", [0.25, 0.14, 0.42], [-0.18, -0.39, 0.08], COLORS.black),
    part2("right-shoe", [0.25, 0.14, 0.42], [0.18, -0.39, 0.08], COLORS.black),
    part2("head", [0.37, 0.4, 0.34], [0, 1.63, 0], COLORS.skin),
    part2("beard", [0.34, 0.38, 0.17], [0, 1.42, 0.2], COLORS.beard),
    part2("hat-brim", [0.56, 0.07, 0.5], [0, 1.88, 0], COLORS.black),
    part2("hat-crown", [0.4, 0.25, 0.4], [0, 2.03, 0], COLORS.black)
  ];
  for (const definition of parts) {
    scene.add(createFallbackBoxMesh(
      `${label}-${definition.name}`,
      definition.size,
      definition.position,
      definition.color
    ));
  }
  scene.setBaseTransform();
  return {
    animations: [],
    scene,
    userData: { fallback: true }
  };
}
function part2(name, size, position, color) {
  return { color, name, position, size };
}
function resolveCoatColor(outfit2) {
  const value3 = outfit2?.coatColor || outfit2?.coat;
  if (Array.isArray(value3) && value3.length >= 3) {
    return [value3[0], value3[1], value3[2], value3[3] ?? 1];
  }
  return COLORS.coat;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzActorAssetLoader.js
async function loadEretzActorAssets(options = {}) {
  const quality = options.quality || "medium";
  const npcProfiles = friendlyNpcProfiles(quality);
  const playerGltf = await loadCanonicalPlayer(options);
  const npcGltfs = npcProfiles.map((profile3, index) => createFallbackActorGltf(
    `friendly-npc-${index}-${profile3.id}`,
    { outfit: profile3.outfit }
  ));
  return {
    actorAssetStats: {
      ...sharedGltfAssetStats(),
      fallbackActors: npcGltfs.length,
      playerBlockingRequests: 1,
      strategy: "canonical-player-first-deferred-npc-enrichment"
    },
    actorHydration: scheduleNpcHydration(options, npcProfiles),
    importedModelMaterials: {
      npcs: npcProfiles.map((profile3) => ({ fallback: true, profileId: profile3.id })),
      player: preparePlayer(playerGltf)
    },
    npcGltf: npcGltfs[0],
    npcGltfs,
    npcProfiles,
    playerGltf
  };
}
async function loadRemoteEretzActorAssets(options = {}, npcProfiles = null) {
  const profiles = npcProfiles || friendlyNpcProfiles(options.quality || "medium");
  const npcGltfs = await Promise.all(profiles.map((profile3, index) => loadIsolatedGltf(
    PLAYER_MODEL_URL,
    `friendly-npc-${index}-${profile3.id}`,
    { materialResolver: chossidMaterialResolver(profile3.outfit) }
  )));
  return {
    actorAssetStats: sharedGltfAssetStats(),
    importedModelMaterials: {
      npcs: npcGltfs.map((gltf, index) => prepareNpc(gltf, profiles[index]))
    },
    npcGltf: npcGltfs[0],
    npcGltfs,
    npcProfiles: profiles
  };
}
async function loadCanonicalPlayer(options) {
  const loader = options.playerActorLoader || loadIsolatedGltf;
  try {
    return await loader(PLAYER_MODEL_URL, "player");
  } catch (error) {
    if (options.allowPlayerFallback === true) return createFallbackActorGltf("player");
    throw new Error(`Canonical player chossid.glb failed to load: ${error?.message || error}`);
  }
}
function scheduleNpcHydration(options, npcProfiles) {
  const state = { error: null, startedAt: null, status: "scheduled", value: null };
  const remoteLoader = options.remoteActorLoader || loadRemoteEretzActorAssets;
  state.promise = new Promise((resolve) => setTimeout(async () => {
    state.startedAt = now();
    state.status = "loading";
    try {
      state.value = await remoteLoader(options, npcProfiles);
      state.status = "ready";
      resolve(state.value);
    } catch (error) {
      state.error = error?.message || String(error);
      state.status = "degraded";
      resolve(null);
    }
  }, options.actorStreamingDelayMs ?? 0));
  return state;
}
function preparePlayer(gltf) {
  return {
    ...bindImportedModelMaterials(gltf.scene),
    ...applyChossidOutfit(gltf.scene, {}),
    consolidation: consolidateChossidMeshes(gltf.scene)
  };
}
function prepareNpc(gltf, profile3) {
  return {
    ...bindImportedModelMaterials(gltf.scene),
    ...applyChossidOutfit(gltf.scene, profile3.outfit),
    consolidation: consolidateChossidMeshes(gltf.scene),
    profileId: profile3.id
  };
}
function now() {
  return globalThis.performance?.now?.() ?? Date.now();
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzAssetLoader.js
async function loadEretzAssets(options = {}) {
  const boot = options.boot || globalThis.AwtsmoosBootTracker;
  const actorLoader = options.actorLoader || loadEretzActorAssets;
  const houseLoader = options.houseLoader || loadHouseAssets;
  boot?.begin("actors-and-solid-materials");
  boot?.progress("shared-actor", 0, 1, "Loading the canonical animated player");
  const [actors, assets] = await Promise.all([
    actorLoader(options),
    houseLoader(async () => null)
  ]);
  boot?.progress("shared-actor", 1, 1, "Player ready; building playable geometry", "ready");
  assets.actorAssets = actors.actorAssetStats;
  assets.importedModelMaterials = actors.importedModelMaterials;
  assets.publicMaterialCache = publicMaterialCacheStats();
  assets.publicMaterialPolicy = Object.freeze({
    blockingTextureRequests: 0,
    fallbackFirst: true,
    strategy: "solid-first-gameplay-gated-texture-streaming"
  });
  assets.publicMaterialStreaming = createTextureStream(assets, options, boot);
  assets.publicMaterialHydration = assets.publicMaterialStreaming;
  return { ...actors, assets, grassImage: firstCachedImage(GRASS_URLS) };
}
function createTextureStream(assets, options, boot) {
  if (options.textureScheduler) return options.textureScheduler(assets, options, boot);
  let delegate = null;
  let error = null;
  let phase2 = "waiting-for-gameplay";
  let resolvePromise;
  let startedAt = null;
  const state = {
    get completed() {
      return delegate?.completed ?? 0;
    },
    get error() {
      return delegate?.error || error;
    },
    promise: new Promise((resolve) => {
      resolvePromise = resolve;
    }),
    get startedAt() {
      return delegate?.startedAt ?? startedAt;
    },
    get status() {
      return delegate?.status || phase2;
    },
    get total() {
      return delegate?.total ?? 0;
    },
    async start() {
      if (delegate) return state.promise;
      startedAt = globalThis.performance?.now?.() ?? Date.now();
      phase2 = "scheduled";
      try {
        const module = await import("./chunks/EretzTextureStreaming-NXPJ2HAO.js");
        delegate = module.scheduleEretzTextureStreaming(assets, options, boot);
        const value3 = await Promise.resolve(delegate.promise || delegate);
        phase2 = delegate?.status || value3?.status || "ready";
        resolvePromise(value3);
      } catch (caught) {
        error = caught?.message || String(caught);
        phase2 = "degraded";
        boot?.degrade("texture-stream", caught);
        resolvePromise(null);
      }
      return state.promise;
    }
  };
  return state;
}
function firstCachedImage(urls) {
  for (const url of urls) {
    const image = cachedTextureImage(url);
    if (image) return image;
  }
  return null;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-bounds.js
var BOUNDS_KEY = "AwtsmoosTinyBounds";
var WORLD_BOUNDS = /* @__PURE__ */ new WeakMap();
function worldBoundingSphere(mesh) {
  const local = localBoundingSphere(mesh?.geometry);
  const matrix = mesh?.matrixWorld;
  if (!local || !matrix) return null;
  const revision = mesh?._worldRevision ?? 0;
  let cached = WORLD_BOUNDS.get(mesh);
  if (cached && cached.local === local && cached.matrix === matrix && cached.revision === revision) return cached.sphere;
  if (!cached) {
    cached = {
      local: null,
      matrix: null,
      revision: -1,
      sphere: { center: [0, 0, 0], radius: 0 }
    };
    WORLD_BOUNDS.set(mesh, cached);
  }
  transformCenter(cached.sphere.center, matrix, local.center);
  cached.sphere.radius = local.radius * maximumMatrixScale(matrix);
  cached.local = local;
  cached.matrix = matrix;
  cached.revision = revision;
  return cached.sphere;
}
function localBoundingSphere(geometry) {
  if (!geometry) return null;
  geometry.userData ||= {};
  if (geometry.userData[BOUNDS_KEY]) return geometry.userData[BOUNDS_KEY];
  const position = geometry.attributes?.position;
  if (!position?.array || position.itemSize < 3 || position.count < 1) return null;
  const bounds = computeBounds(position);
  geometry.userData[BOUNDS_KEY] = bounds;
  return bounds;
}
function computeBounds(position) {
  const array = position.array;
  const itemSize = position.itemSize;
  let minimumX = Infinity;
  let minimumY = Infinity;
  let minimumZ = Infinity;
  let maximumX = -Infinity;
  let maximumY = -Infinity;
  let maximumZ = -Infinity;
  for (let index = 0; index < position.count; index += 1) {
    const offset = index * itemSize;
    const x = Number(array[offset] || 0);
    const y = Number(array[offset + 1] || 0);
    const z = Number(array[offset + 2] || 0);
    minimumX = Math.min(minimumX, x);
    minimumY = Math.min(minimumY, y);
    minimumZ = Math.min(minimumZ, z);
    maximumX = Math.max(maximumX, x);
    maximumY = Math.max(maximumY, y);
    maximumZ = Math.max(maximumZ, z);
  }
  const center = [
    (minimumX + maximumX) / 2,
    (minimumY + maximumY) / 2,
    (minimumZ + maximumZ) / 2
  ];
  let radius = 0;
  for (let index = 0; index < position.count; index += 1) {
    const offset = index * itemSize;
    const distance4 = Math.hypot(
      Number(array[offset] || 0) - center[0],
      Number(array[offset + 1] || 0) - center[1],
      Number(array[offset + 2] || 0) - center[2]
    );
    radius = Math.max(radius, distance4);
  }
  return { center, radius };
}
function transformCenter(target, matrix, center) {
  const x = center[0];
  const y = center[1];
  const z = center[2];
  target[0] = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
  target[1] = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
  target[2] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
}
function maximumMatrixScale(matrix) {
  return Math.max(
    Math.hypot(matrix[0], matrix[1], matrix[2]),
    Math.hypot(matrix[4], matrix[5], matrix[6]),
    Math.hypot(matrix[8], matrix[9], matrix[10]),
    1e-6
  );
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-static-batch-key.js
var STATIC_CELL_SIZE = 384;
var DISTANCE_BUCKET_SIZE = 64;
function staticBatchGroupKey(mesh, metadata) {
  const center = worldBoundingSphere(mesh)?.center || [0, 0, 0];
  const cell = center.map((value3) => Math.round(value3 / STATIC_CELL_SIZE));
  const distanceBucket = Math.ceil(
    Math.max(0, Number(metadata.renderDistance) || 0) / DISTANCE_BUCKET_SIZE
  ) * DISTANCE_BUCKET_SIZE;
  return [
    STATIC_CELL_SIZE,
    distanceBucket,
    ...cell,
    staticBatchMaterialSignature(mesh)
  ].join("::");
}
function staticBatchMembershipToken(entries) {
  return entries.map((entry) => entryToken(entry)).join(",");
}
function entryToken(entry) {
  const mesh = entry.mesh;
  return [
    objectIdentity(mesh),
    objectIdentity(mesh.matrixWorld),
    materialSignature2(mesh)
  ].join("@");
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-static-batch-sequence.js
var StaticBatchSequence = class {
  constructor() {
    this.records = [];
    this.stats = {
      captures: 0,
      checks: 0,
      hits: 0,
      misses: 0
    };
  }
  matches(entries) {
    this.stats.checks += 1;
    if (entries.length !== this.records.length || entries.length === 0) {
      this.stats.misses += 1;
      return false;
    }
    for (let index = 0; index < entries.length; index += 1) {
      if (!sameEntry(this.records[index], entries[index])) {
        this.stats.misses += 1;
        return false;
      }
    }
    this.stats.hits += 1;
    return true;
  }
  capture(entries) {
    this.records = entries.map((entry) => captureEntry(entry));
    this.stats.captures += 1;
    return this;
  }
  diagnostics() {
    return {
      ...this.stats,
      length: this.records.length
    };
  }
};
function captureEntry(entry) {
  return {
    geometry: entry.mesh.geometry || null,
    materialSignature: materialSignature2(entry.mesh),
    matrixWorld: entry.mesh.matrixWorld || null,
    mesh: entry.mesh,
    renderDistance: Number(entry.metadata.renderDistance) || 0
  };
}
function sameEntry(record, entry) {
  return record.mesh === entry.mesh && record.geometry === (entry.mesh.geometry || null) && record.matrixWorld === (entry.mesh.matrixWorld || null) && record.renderDistance === (Number(entry.metadata.renderDistance) || 0) && record.materialSignature === materialSignature2(entry.mesh);
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-static-batch-stats.js
function createStaticBatchStats() {
  return {
    batchMeshes: 0,
    batchedSourceMeshes: 0,
    batchedTriangles: 0,
    candidateGroups: 0,
    candidateMeshes: 0,
    families: {},
    mergeableGroups: 0,
    potentialSavedDraws: 0,
    savedDraws: 0,
    singletonGroups: 0
  };
}
function recordStaticBatchGroup(stats3, members) {
  const family = members[0]?.metadata?.family || "unclassified";
  const familyStats = stats3.families[family] || {
    groups: 0,
    mergeableGroups: 0,
    meshes: 0,
    potentialSavedDraws: 0,
    singletonGroups: 0
  };
  stats3.candidateGroups += 1;
  stats3.candidateMeshes += members.length;
  familyStats.groups += 1;
  familyStats.meshes += members.length;
  if (members.length < 2) {
    stats3.singletonGroups += 1;
    familyStats.singletonGroups += 1;
  } else {
    const savings = members.length - 1;
    stats3.mergeableGroups += 1;
    stats3.potentialSavedDraws += savings;
    familyStats.mergeableGroups += 1;
    familyStats.potentialSavedDraws += savings;
  }
  stats3.families[family] = familyStats;
}
function recordStaticBatchSuccess(stats3, members, batch) {
  stats3.batchMeshes += 1;
  stats3.batchedSourceMeshes += members.length;
  stats3.savedDraws += members.length - 1;
  stats3.batchedTriangles += batch.geometry.attributes.position.count / 3;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-static-geometry-source.js
function appendWorldGeometry(mesh, target) {
  const geometry = mesh.geometry;
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const color = geometry.attributes.color;
  const uv2 = geometry.attributes.uv;
  const indices = geometry.index?.array || null;
  const count = indices ? geometry.index.count : position.count;
  const tint = materialTint(mesh.material);
  for (let offset = 0; offset < count; offset += 1) {
    const vertexIndex = indices ? indices[offset] : offset;
    appendPosition2(target.position, position, vertexIndex, mesh.matrixWorld);
    appendNormal2(target.normal, normal, vertexIndex, mesh.matrixWorld);
    appendColor(target.color, color, vertexIndex, tint);
    appendUv(target.uv, uv2, vertexIndex);
  }
  return count;
}
function appendPosition2(target, attribute5, index, matrix) {
  const x = value2(attribute5, index, 0, 0);
  const y = value2(attribute5, index, 1, 0);
  const z = value2(attribute5, index, 2, 0);
  target.push(
    matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
    matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
    matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
  );
}
function appendNormal2(target, attribute5, index, matrix) {
  if (!attribute5) {
    target.push(0, 1, 0);
    return;
  }
  const x = value2(attribute5, index, 0, 0);
  const y = value2(attribute5, index, 1, 1);
  const z = value2(attribute5, index, 2, 0);
  target.push(
    matrix[0] * x + matrix[4] * y + matrix[8] * z,
    matrix[1] * x + matrix[5] * y + matrix[9] * z,
    matrix[2] * x + matrix[6] * y + matrix[10] * z
  );
}
function appendColor(target, attribute5, index, tint) {
  target.push(
    value2(attribute5, index, 0, 1) * tint[0],
    value2(attribute5, index, 1, 1) * tint[1],
    value2(attribute5, index, 2, 1) * tint[2],
    value2(attribute5, index, 3, 1)
  );
}
function appendUv(target, attribute5, index) {
  if (!attribute5) {
    target.push(0, 0);
    return;
  }
  target.push(value2(attribute5, index, 0, 0), value2(attribute5, index, 1, 0));
}
function materialTint(material = {}) {
  const color = material.color || [0.75, 0.7, 0.62, 1];
  return [
    color[0] ?? 0.75,
    color[1] ?? 0.7,
    color[2] ?? 0.62
  ];
}
function value2(attribute5, index, component, fallback) {
  if (!attribute5 || component >= attribute5.itemSize) return fallback;
  const raw = Number(attribute5.array[index * attribute5.itemSize + component] ?? fallback);
  if (!attribute5.normalized) return raw;
  const array = attribute5.array;
  if (array instanceof Uint8Array) return raw / 255;
  if (array instanceof Int8Array) return Math.max(-1, raw / 127);
  if (array instanceof Uint16Array) return raw / 65535;
  if (array instanceof Int16Array) return Math.max(-1, raw / 32767);
  if (array instanceof Uint32Array) return raw / 4294967295;
  if (array instanceof Int32Array) return Math.max(-1, raw / 2147483647);
  return raw;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-static-geometry-merge.js
function mergeStaticMeshes(meshes, metadata) {
  if (!meshes?.length) return null;
  const streams = {
    color: [],
    normal: [],
    position: [],
    uv: []
  };
  let vertexCount = 0;
  for (const mesh of meshes) vertexCount += appendWorldGeometry(mesh, streams);
  if (vertexCount < 3) return null;
  const geometry = new BufferGeometry();
  geometry.mode = 4;
  geometry.setAttribute("position", floatAttribute(streams.position, 3));
  geometry.setAttribute("normal", floatAttribute(streams.normal, 3));
  geometry.setAttribute("color", floatAttribute(streams.color, 4));
  geometry.setAttribute("uv", floatAttribute(streams.uv, 2));
  geometry.userData.AwtsmoosStaticBatch = {
    memberCount: meshes.length,
    tintBakedIntoVertexColor: true,
    vertexCount
  };
  const batchMaterial = createStaticBatchMaterial(meshes[0].material);
  const batch = new Mesh(geometry, batchMaterial);
  batch.name = `AwtsmoosStaticBatch:${metadata.family}:${meshes.length}`;
  batch.matrix = identity();
  batch.matrixWorld = identity();
  batch.userData = {
    family: metadata.family,
    renderDistance: metadata.renderDistance,
    AwtsmoosStaticBatch: {
      memberCount: meshes.length,
      tintBakedIntoVertexColor: true,
      vertexCount
    }
  };
  return batch;
}
function floatAttribute(values, itemSize) {
  return new BufferAttribute(new Float32Array(values), itemSize, false);
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-static-opaque-batcher.js
var StaticOpaqueBatcher = class {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
    this.cacheBuilds = 0;
    this.previousResult = null;
    this.sequence = new StaticBatchSequence();
    this.sequenceReuses = 0;
    this.stats = createStaticBatchStats();
  }
  resolve(entries) {
    if (this.previousResult && this.sequence.matches(entries)) {
      this.sequenceReuses += 1;
      this.previousResult.stats.sequenceReuses = this.sequenceReuses;
      this.previousResult.stats.sequence = this.sequence.diagnostics();
      return this.previousResult;
    }
    const groups = groupEntries(entries);
    const activeKeys = /* @__PURE__ */ new Set();
    const meshes = [];
    const originals = [];
    const stats3 = createStaticBatchStats();
    for (const [key, members] of groups) {
      activeKeys.add(key);
      recordStaticBatchGroup(stats3, members);
      if (members.length < 2) {
        originals.push(members[0].mesh);
        continue;
      }
      const batch = this.resolveBatch(key, members);
      if (!batch) {
        originals.push(...members.map((member) => member.mesh));
        continue;
      }
      meshes.push(batch);
      recordStaticBatchSuccess(stats3, members, batch);
    }
    this.removeInactive(activeKeys);
    this.sequence.capture(entries);
    stats3.cacheBuilds = this.cacheBuilds;
    stats3.sequenceReuses = this.sequenceReuses;
    stats3.sequence = this.sequence.diagnostics();
    this.stats = stats3;
    this.previousResult = { meshes, originals, stats: stats3 };
    return this.previousResult;
  }
  resolveBatch(key, members) {
    const token = staticBatchMembershipToken(members);
    const cached = this.cache.get(key);
    if (cached?.token === token) return cached.mesh;
    const mesh = mergeStaticMeshes(
      members.map((member) => member.mesh),
      members[0].metadata
    );
    if (!mesh) return null;
    this.cacheBuilds += 1;
    this.cache.set(key, { mesh, token });
    return mesh;
  }
  removeInactive(activeKeys) {
    for (const key of this.cache.keys()) {
      if (!activeKeys.has(key)) this.cache.delete(key);
    }
  }
};
function groupEntries(entries) {
  const groups = /* @__PURE__ */ new Map();
  for (const entry of entries) {
    const key = staticBatchGroupKey(entry.mesh, entry.metadata);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }
  return groups;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-gl-state-model.js
var CACHED_GL_METHODS = [
  "useProgram",
  "bindBuffer",
  "activeTexture",
  "bindTexture",
  "enable",
  "disable",
  "cullFace",
  "blendFunc",
  "enableVertexAttribArray",
  "disableVertexAttribArray",
  "vertexAttribPointer",
  "vertexAttrib4fv"
];
function createGlStateModel() {
  return {
    program: unknownValue(),
    activeTexture: unknownValue(),
    cullFace: unknownValue(),
    blendFunction: unknownValue(),
    buffers: /* @__PURE__ */ new Map(),
    textures: /* @__PURE__ */ new Map(),
    capabilities: /* @__PURE__ */ new Map(),
    attributes: /* @__PURE__ */ new Map(),
    pointers: /* @__PURE__ */ new Map(),
    constants: /* @__PURE__ */ new Map()
  };
}
function decideGlStateCall(name, args, state, gl) {
  if (name === "useProgram") return valueDecision(state.program, args[0]);
  if (name === "activeTexture") return valueDecision(state.activeTexture, args[0]);
  if (name === "cullFace") return valueDecision(state.cullFace, args[0]);
  if (name === "blendFunc") {
    return valueDecision(
      state.blendFunction,
      `${args[0]}:${args[1]}`
    );
  }
  if (name === "bindBuffer") {
    return mapDecision(state.buffers, args[0], args[1]);
  }
  if (name === "bindTexture") {
    if (!state.activeTexture.known) return alwaysExecute();
    const key = `${state.activeTexture.value}:${args[0]}`;
    return mapDecision(state.textures, key, args[1]);
  }
  if (name === "enable") {
    return mapDecision(state.capabilities, args[0], true);
  }
  if (name === "disable") {
    return mapDecision(state.capabilities, args[0], false);
  }
  if (name === "enableVertexAttribArray") {
    return mapDecision(state.attributes, args[0], true);
  }
  if (name === "disableVertexAttribArray") {
    return mapDecision(state.attributes, args[0], false);
  }
  if (name === "vertexAttribPointer") {
    if (!state.buffers.has(gl.ARRAY_BUFFER)) return alwaysExecute();
    return pointerDecision(
      state.pointers,
      args[0],
      state.buffers.get(gl.ARRAY_BUFFER),
      args.slice(1).join(":")
    );
  }
  return mapDecision(
    state.constants,
    args[0],
    Array.from(args[1] || []).join(",")
  );
}
function valueDecision(slot, value3) {
  return {
    skip: slot.known && slot.value === value3,
    commit() {
      slot.known = true;
      slot.value = value3;
    }
  };
}
function mapDecision(map, key, value3) {
  return {
    skip: map.has(key) && map.get(key) === value3,
    commit: () => {
      map.set(key, value3);
    }
  };
}
function pointerDecision(map, index, arrayBuffer, values) {
  const previous = map.get(index);
  return {
    skip: !!previous && previous.arrayBuffer === arrayBuffer && previous.values === values,
    commit: () => {
      map.set(index, { arrayBuffer, values });
    }
  };
}
function alwaysExecute() {
  return { skip: false, commit() {
  } };
}
function unknownValue() {
  return { known: false, value: void 0 };
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-gl-state-cache.js
var CACHE_SYMBOL = /* @__PURE__ */ Symbol.for("Awtsmoos.tinyGlStateCache");
function installGlStateCache(gl) {
  const existingCache = gl[CACHE_SYMBOL];
  if (existingCache) return existingCache;
  const originalMethods = captureOriginalMethods(gl);
  const cache3 = createCacheController(gl, originalMethods);
  installCachedMethods(gl, cache3, originalMethods);
  gl[CACHE_SYMBOL] = cache3;
  return cache3;
}
function captureOriginalMethods(gl) {
  return new Map(CACHED_GL_METHODS.map((methodName) => [
    methodName,
    gl[methodName]
  ]));
}
function createCacheController(gl, originalMethods) {
  const cache3 = {
    state: createGlStateModel(),
    stats: createStats(),
    invalidate() {
      cache3.state = createGlStateModel();
      cache3.stats.invalidations += 1;
    },
    invalidateVertexArrayState() {
      cache3.state.buffers.clear();
      cache3.state.attributes.clear();
      cache3.state.pointers.clear();
      cache3.stats.vertexArrayInvalidations += 1;
    },
    restore() {
      for (const [methodName, originalMethod] of originalMethods) {
        gl[methodName] = originalMethod;
      }
      delete gl[CACHE_SYMBOL];
    }
  };
  return cache3;
}
function installCachedMethods(gl, cache3, originalMethods) {
  for (const [methodName, originalMethod] of originalMethods) {
    gl[methodName] = function cachedGlStateCall(...argumentsList) {
      const methodStats = cache3.stats.methods[methodName];
      methodStats.calls += 1;
      const decision = decideGlStateCall(
        methodName,
        argumentsList,
        cache3.state,
        gl
      );
      if (decision.skip) {
        methodStats.skips += 1;
        return void 0;
      }
      const result = originalMethod.apply(this, argumentsList);
      decision.commit();
      return result;
    };
  }
}
function createStats() {
  const methods = CACHED_GL_METHODS.map((methodName) => [
    methodName,
    {
      calls: 0,
      skips: 0
    }
  ]);
  return {
    invalidations: 0,
    vertexArrayInvalidations: 0,
    methods: Object.fromEntries(methods)
  };
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-buffer-resources.js
var ATTRIBUTE_NAMES = [
  "position",
  "normal",
  "color",
  "uv",
  "zone",
  "joints",
  "weights"
];
var RenderBufferResources = class {
  constructor(gl) {
    this.gl = gl;
    this.cache = /* @__PURE__ */ new WeakMap();
  }
  has(geometry) {
    return Boolean(geometry && this.cache.has(geometry));
  }
  forMesh(mesh) {
    const geometry = mesh?.geometry;
    if (!geometry) return null;
    const existing = this.cache.get(geometry);
    if (existing) return existing;
    const position = geometry.attributes?.position;
    if (!position) return null;
    const resource = this.createResource(geometry, position);
    this.cache.set(geometry, resource);
    return resource;
  }
  createResource(geometry, position) {
    const attributes = {};
    for (const name of ATTRIBUTE_NAMES) {
      const attribute5 = geometry.attributes?.[name];
      attributes[name] = attribute5 ? {
        attribute: attribute5,
        buffer: this.createBuffer(this.gl.ARRAY_BUFFER, attribute5.array)
      } : null;
    }
    const resource = {
      attributes,
      count: position.count,
      geometry,
      index: null,
      indexType: null,
      mode: geometry.mode ?? 4
    };
    if (geometry.index) this.addIndex(resource, geometry.index);
    return resource;
  }
  createBuffer(target, data) {
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(target, buffer);
    this.gl.bufferData(target, data, this.gl.STATIC_DRAW);
    return buffer;
  }
  addIndex(resource, index) {
    if (index.array instanceof Uint32Array) this.gl.getExtension("OES_element_index_uint");
    resource.index = this.createBuffer(this.gl.ELEMENT_ARRAY_BUFFER, index.array);
    resource.indexType = index.array instanceof Uint32Array ? this.gl.UNSIGNED_INT : this.gl.UNSIGNED_SHORT;
    resource.count = index.count;
  }
};

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-attribute-fallbacks.js
var ATTRIBUTE_FALLBACKS = Object.freeze({
  color: new Float32Array([1, 1, 1, 1]),
  joints: new Float32Array([0, 0, 0, 0]),
  normal: new Float32Array([0, 1, 0, 0]),
  position: new Float32Array([0, 0, 0, 1]),
  uv: new Float32Array([0, 0, 0, 1]),
  weights: new Float32Array([1, 0, 0, 0]),
  zone: new Float32Array([1, 0, 0, 0])
});

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-manual-attributes.js
var ATTRIBUTE_NAMES2 = ["position", "normal", "color", "uv", "zone"];
var RenderManualAttributes = class {
  constructor(gl) {
    this.gl = gl;
    this.stats = null;
    this.invalidate();
  }
  beginFrame(stats3) {
    this.stats = stats3;
    stats3.manualAttributeBindings = 0;
  }
  invalidate() {
    this.arrayBuffer = null;
    this.elementBuffer = null;
    this.attributes = /* @__PURE__ */ new Map();
  }
  bind(resource, locations, skinned) {
    for (const name of ATTRIBUTE_NAMES2) {
      this.bindNamed(name, resource, locations);
    }
    this.bindNamed("joints", resource, locations, skinned);
    this.bindNamed("weights", resource, locations, skinned);
    this.bindElement(resource.index);
    if (this.stats) this.stats.manualAttributeBindings += 1;
  }
  bindNamed(name, resource, locations, enabled = true) {
    const location2 = locations[name];
    if (!Number.isInteger(location2) || location2 < 0) return;
    const entry = enabled ? resource.attributes[name] : null;
    if (!entry) {
      this.bindFallback(location2, ATTRIBUTE_FALLBACKS[name]);
      return;
    }
    const signature = [
      entry.buffer,
      entry.attribute.itemSize,
      attributeType(this.gl, entry.attribute),
      Boolean(entry.attribute.normalized)
    ];
    if (sameAttribute(this.attributes.get(location2), signature)) {
      this.recordSkip();
      return;
    }
    this.bindArray(entry.buffer);
    this.gl.enableVertexAttribArray(location2);
    this.gl.vertexAttribPointer(location2, signature[1], signature[2], signature[3], 0, 0);
    this.attributes.set(location2, signature);
    this.recordUpload();
  }
  bindFallback(location2, values) {
    const signature = ["fallback", ...values];
    if (sameAttribute(this.attributes.get(location2), signature)) {
      this.recordSkip();
      return;
    }
    this.gl.disableVertexAttribArray(location2);
    this.gl.vertexAttrib4fv(location2, values);
    this.attributes.set(location2, signature);
    this.recordUpload();
  }
  bindArray(buffer) {
    if (this.arrayBuffer === buffer) return;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.arrayBuffer = buffer;
  }
  bindElement(buffer) {
    if (this.elementBuffer === buffer) {
      this.recordSkip();
      return;
    }
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
    this.elementBuffer = buffer;
    this.recordUpload();
  }
  recordSkip() {
    if (this.stats) this.stats.bufferStateSkips += 1;
  }
  recordUpload() {
    if (this.stats) this.stats.bufferStateUploads += 1;
  }
};
function sameAttribute(left, right) {
  return Boolean(left) && left.length === right.length && left.every((value3, index) => value3 === right[index]);
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-vertex-array-builder.js
var ATTRIBUTE_NAMES3 = [
  "position",
  "normal",
  "color",
  "uv",
  "zone",
  "joints",
  "weights"
];
function createVertexArrayEntry(options) {
  const vertexArray = options.extension.createVertexArrayOES();
  if (!vertexArray) {
    throw new Error("OES vertex array creation returned no vessel.");
  }
  const fallbacks = [];
  options.extension.bindVertexArrayOES(vertexArray);
  try {
    for (const name of ATTRIBUTE_NAMES3) {
      configureAttribute({
        enabled: options.skinned || name !== "joints" && name !== "weights",
        fallbacks,
        gl: options.gl,
        location: options.locations[name],
        name,
        resource: options.resource
      });
    }
    options.gl.bindBuffer(
      options.gl.ELEMENT_ARRAY_BUFFER,
      options.resource.index
    );
  } finally {
    options.extension.bindVertexArrayOES(null);
    options.onHiddenStateChange?.();
  }
  return { fallbacks, vertexArray };
}
function configureAttribute(options) {
  if (!Number.isInteger(options.location) || options.location < 0) return;
  const entry = options.enabled ? options.resource.attributes[options.name] : null;
  if (!entry) {
    options.gl.disableVertexAttribArray(options.location);
    options.fallbacks.push({
      location: options.location,
      values: ATTRIBUTE_FALLBACKS[options.name]
    });
    return;
  }
  options.gl.bindBuffer(options.gl.ARRAY_BUFFER, entry.buffer);
  options.gl.enableVertexAttribArray(options.location);
  options.gl.vertexAttribPointer(
    options.location,
    entry.attribute.itemSize,
    attributeType(options.gl, entry.attribute),
    Boolean(entry.attribute.normalized),
    0,
    0
  );
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-vertex-array-fallbacks.js
function bindVertexArrayFallbacks(owner, entry) {
  for (const fallback of entry.fallbacks) {
    const previous = owner.fallbackValues.get(fallback.location);
    if (sameValues(previous, fallback.values)) {
      owner.stats.vertexArrays.fallbackSkips += 1;
      continue;
    }
    owner.gl.vertexAttrib4fv(fallback.location, fallback.values);
    owner.fallbackValues.set(fallback.location, fallback.values);
    owner.stats.vertexArrays.fallbackUploads += 1;
  }
}
function sameValues(left, right) {
  return Boolean(left) && left.length === right.length && left.every((value3, index) => value3 === right[index]);
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-vertex-arrays.js
var RenderVertexArrays = class {
  constructor(gl, glStateCache = null) {
    this.cache = /* @__PURE__ */ new WeakMap();
    this.creations = 0;
    this.current = null;
    this.entries = /* @__PURE__ */ new Set();
    this.extension = gl.getExtension("OES_vertex_array_object");
    this.failures = 0;
    this.fallbackValues = /* @__PURE__ */ new Map();
    this.gl = gl;
    this.glStateCache = glStateCache;
    this.invalidations = 0;
    this.stats = null;
  }
  beginFrame(stats3) {
    this.stats = stats3;
    stats3.vertexArrays = {
      binds: 0,
      creations: this.creations,
      fallbackSkips: 0,
      fallbackUploads: 0,
      failures: this.failures,
      invalidations: this.invalidations,
      skips: 0,
      supported: Boolean(this.extension)
    };
  }
  bind(resource, locations, skinned) {
    if (!this.extension) return false;
    let entry;
    try {
      entry = this.entryFor(resource, locations, skinned);
    } catch {
      this.failures += 1;
      this.stats.vertexArrays.failures = this.failures;
      this.releaseToDefault();
      return false;
    }
    this.bindEntry(entry);
    bindVertexArrayFallbacks(this, entry);
    return true;
  }
  bindEntry(entry) {
    if (this.current === entry.vertexArray) {
      this.stats.vertexArrays.skips += 1;
      return;
    }
    this.extension.bindVertexArrayOES(entry.vertexArray);
    this.current = entry.vertexArray;
    this.stats.vertexArrays.binds += 1;
  }
  releaseToDefault() {
    if (!this.extension || this.current === null) return false;
    this.extension.bindVertexArrayOES(null);
    this.current = null;
    return true;
  }
  dispose() {
    if (!this.extension) return;
    this.releaseToDefault();
    for (const entry of this.entries) {
      this.extension.deleteVertexArrayOES(entry.vertexArray);
    }
    this.entries.clear();
  }
  entryFor(resource, locations, skinned) {
    let branches = this.cache.get(resource);
    if (!branches) {
      branches = /* @__PURE__ */ new Map();
      this.cache.set(resource, branches);
    }
    const key = skinned ? "skin" : "rigid";
    let entry = branches.get(key);
    if (entry) return entry;
    this.releaseToDefault();
    this.prepareRecording();
    entry = createVertexArrayEntry({
      extension: this.extension,
      gl: this.gl,
      locations,
      onHiddenStateChange: () => this.invalidateHiddenState(),
      resource,
      skinned
    });
    branches.set(key, entry);
    this.entries.add(entry);
    this.creations += 1;
    this.stats.vertexArrays.creations = this.creations;
    return entry;
  }
  prepareRecording() {
    this.glStateCache?.invalidateVertexArrayState?.();
  }
  invalidateHiddenState() {
    this.invalidations += 1;
    this.glStateCache?.invalidateVertexArrayState?.();
    if (this.stats) {
      this.stats.vertexArrays.invalidations = this.invalidations;
    }
  }
};

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-buffers.js
var RenderBufferCache = class {
  constructor(gl, glStateCache = null) {
    this.gl = gl;
    this.glStateCache = glStateCache;
    this.resources = new RenderBufferResources(gl);
    this.manual = new RenderManualAttributes(gl);
    this.vertexArrays = new RenderVertexArrays(gl, glStateCache);
  }
  beginFrame(stats3) {
    stats3.bufferStateSkips = 0;
    stats3.bufferStateUploads = 0;
    this.manual.beginFrame(stats3);
    this.vertexArrays.beginFrame(stats3);
  }
  forMesh(mesh) {
    const geometry = mesh?.geometry;
    if (!geometry) {
      return null;
    }
    if (this.resources.has(geometry)) {
      return this.resources.forMesh(mesh);
    }
    this.vertexArrays.releaseToDefault();
    this.manual.invalidate();
    this.glStateCache?.invalidateVertexArrayState?.();
    return this.resources.forMesh(mesh);
  }
  bindMesh(resource, locations, skinned) {
    if (this.vertexArrays.bind(resource, locations, skinned)) {
      return "vertex-array";
    }
    this.vertexArrays.releaseToDefault();
    if (this.vertexArrays.extension) {
      this.manual.invalidate();
    }
    this.manual.bind(resource, locations, skinned);
    return "manual";
  }
  dispose() {
    this.vertexArrays.dispose();
  }
};

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-policy.js
var PrimitiveMode = Object.freeze({
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6
});
function isSurfaceMode(mode = PrimitiveMode.TRIANGLES) {
  return mode === PrimitiveMode.TRIANGLES || mode === PrimitiveMode.TRIANGLE_STRIP || mode === PrimitiveMode.TRIANGLE_FAN;
}
function isLineMode(mode = PrimitiveMode.TRIANGLES) {
  return mode === PrimitiveMode.LINES || mode === PrimitiveMode.LINE_LOOP || mode === PrimitiveMode.LINE_STRIP;
}
function shouldRenderMode(mode, options = {}) {
  if (isSurfaceMode(mode)) return options.showTriangles !== false;
  if (isLineMode(mode)) return options.showHelperLines === true;
  if (mode === PrimitiveMode.POINTS) return options.showHelperPoints === true;
  return false;
}
function defaultRenderOptions() {
  return {
    distanceScale: 1,
    showTriangles: true,
    showHelperLines: false,
    showHelperPoints: false,
    showSkeleton: false
  };
}
function helperKind(mode) {
  if (isLineMode(mode)) return "line";
  if (mode === PrimitiveMode.POINTS) return "point";
  return "surface";
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-surface-policy.js
function isTransparent(mesh) {
  const material = mesh?.material;
  if (material?.alphaMode === "MASK") return false;
  if (material?.alphaMode === "BLEND") return true;
  return material?.transparent === true || (material?.opacity ?? 1) < 1;
}
function shouldCullBackfaces(mesh, transparent = isTransparent(mesh)) {
  const mode = mesh?.geometry?.mode ?? mesh?.primitiveMode ?? 4;
  if (!isSurfaceMode(mode)) return false;
  const material = mesh?.material || {};
  if (material.doubleSided === true) return false;
  if (material.backfaceCull === false) return false;
  return true;
}
function isLitMode(mode) {
  return isSurfaceMode(mode ?? 4);
}
function pointSizeForMode() {
  return 1;
}
function triangleCountForMode(mode, count) {
  if ((mode ?? 4) === 4) return Math.floor(count / 3);
  if ((mode ?? 4) === 5 || (mode ?? 4) === 6) {
    return Math.max(0, count - 2);
  }
  return 0;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-culling.js
var FAMILY_DISTANCE = Object.freeze({
  "lake-shore-foam": 520,
  "lake-shore-stone": 340,
  "procedural-lofted-creature": 170,
  "procedural-text-landmark": 420,
  "reference-cottage-detail-batch": 330,
  "reference-forest-edge": 230,
  "reference-practical-lighting": 320,
  "reference-village-district": 380,
  "stream-reeds": 260,
  "village-botanical-garden": 210,
  "village-bushes": 220,
  "village-garden-bed": 210,
  "village-npc-population": 160
});
var ROLE_DISTANCE = Object.freeze({
  flora: 220,
  livestock: 180,
  prop: 240,
  terrain: 360,
  wildlife: 170
});
var ALWAYS_VISIBLE = /* @__PURE__ */ new Set([
  "reference-atmospheric-mountains",
  "sky",
  "world-sky"
]);
function meshCullingReason(mesh, camera, options = {}, context = null) {
  if (!camera || options.culling === false) return null;
  const metadata = inheritedRenderMetadata(mesh);
  if (metadata.alwaysVisible || ALWAYS_VISIBLE.has(metadata.family)) return null;
  const sphere = worldBoundingSphere(mesh);
  if (!sphere) return null;
  const basis = context || cameraCullContext(camera);
  const distanceLimit = renderDistance(metadata, camera, options);
  const relativeX = sphere.center[0] - basis.eyeX;
  const relativeY = sphere.center[1] - basis.eyeY;
  const relativeZ = sphere.center[2] - basis.eyeZ;
  const distance4 = Math.hypot(relativeX, relativeY, relativeZ);
  if (distance4 - sphere.radius > distanceLimit) return "distance";
  const depth = relativeX * basis.forwardX + relativeY * basis.forwardY + relativeZ * basis.forwardZ;
  if (depth + sphere.radius < camera.near) return "frustum";
  if (depth - sphere.radius > camera.far) return "frustum";
  if (depth <= -sphere.radius) return "frustum";
  const verticalLimit = Math.max(0, depth) * basis.tangent + sphere.radius;
  const horizontalLimit = verticalLimit * (camera.aspect || 1);
  const horizontal = relativeX * basis.rightX + relativeY * basis.rightY + relativeZ * basis.rightZ;
  if (Math.abs(horizontal) > horizontalLimit) return "frustum";
  const vertical = relativeX * basis.upX + relativeY * basis.upY + relativeZ * basis.upZ;
  if (Math.abs(vertical) > verticalLimit) return "frustum";
  return null;
}
function cameraCullContext(camera) {
  if (!camera) return null;
  const eyeX = camera.position.x;
  const eyeY = camera.position.y;
  const eyeZ = camera.position.z;
  const target = camera.target || [0, 0, 4];
  let forwardX = target[0] - eyeX;
  let forwardY = target[1] - eyeY;
  let forwardZ = target[2] - eyeZ;
  const inverseForward = 1 / (Math.hypot(forwardX, forwardY, forwardZ) || 1);
  forwardX *= inverseForward;
  forwardY *= inverseForward;
  forwardZ *= inverseForward;
  let rightX = -forwardZ;
  const rightY = 0;
  let rightZ = forwardX;
  const inverseRight = 1 / (Math.hypot(rightX, rightZ) || 1);
  rightX *= inverseRight;
  rightZ *= inverseRight;
  const upX = rightY * forwardZ - rightZ * forwardY;
  const upY = rightZ * forwardX - rightX * forwardZ;
  const upZ = rightX * forwardY - rightY * forwardX;
  return {
    eyeX,
    eyeY,
    eyeZ,
    forwardX,
    forwardY,
    forwardZ,
    rightX,
    rightY,
    rightZ,
    tangent: Math.tan((camera.fov || 45) * Math.PI / 360),
    upX,
    upY,
    upZ
  };
}
function inheritedRenderMetadata(object) {
  const result = {};
  let current = object;
  while (current) {
    const userData = current.userData || {};
    if (result.family == null && userData.family) result.family = userData.family;
    if (result.role == null && userData.AwtsmoosWorldModel?.definition?.role) {
      result.role = userData.AwtsmoosWorldModel.definition.role;
    }
    if (result.renderDistance == null && Number.isFinite(userData.renderDistance)) {
      result.renderDistance = userData.renderDistance;
    }
    if (userData.alwaysVisible === true) result.alwaysVisible = true;
    current = current.parent;
  }
  return result;
}
function renderDistance(metadata, camera, options) {
  const scale2 = Math.max(0.45, Math.min(1.25, options.distanceScale ?? 1));
  if (Number.isFinite(metadata.renderDistance)) return metadata.renderDistance * scale2;
  if (Number.isFinite(FAMILY_DISTANCE[metadata.family])) return FAMILY_DISTANCE[metadata.family] * scale2;
  if (Number.isFinite(ROLE_DISTANCE[metadata.role])) return ROLE_DISTANCE[metadata.role] * scale2;
  return Math.min(camera.far || 1e3, options.defaultRenderDistance || 520) * scale2;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-static-batch-policy.js
var STATIC_FAMILIES = /* @__PURE__ */ new Set([
  "functional-house",
  "lake-shore-stone",
  "procedural-text-landmark",
  "reference-arrival-composition",
  "reference-atmospheric-mountain-snow",
  "reference-atmospheric-mountains",
  "reference-cottage-detail-batch",
  "reference-cottage-ornament-batch",
  "reference-forest-edge",
  "reference-practical-lighting",
  "reference-village-cottage-roof",
  "reference-village-district",
  "reference-village-landmark",
  "stream-reeds",
  "village-botanical-garden",
  "village-bushes",
  "village-garden-bed",
  "village-static-props"
]);
var DYNAMIC_NAME = /animal|chossid|creature|door|enemy|npc|player|remote|wildlife/i;
var DYNAMIC_KEYS = /* @__PURE__ */ new Set([
  "animated",
  "doorId",
  "dynamic",
  "interactive",
  "npcId",
  "playerId",
  "remotePlayerId"
]);
function staticBatchMetadata(mesh) {
  if (!eligibleSurface(mesh)) return null;
  const metadata = inheritedRenderMetadata(mesh);
  if (!STATIC_FAMILIES.has(metadata.family)) return null;
  if (dynamicHierarchy(mesh)) return null;
  return metadata;
}
function eligibleSurface(mesh) {
  const material = mesh.material || {};
  const mode = mesh.geometry?.mode ?? mesh.primitiveMode ?? 4;
  const materialMode = materialModeCode(mesh);
  if (mesh.isSkinnedMesh || mesh.skeleton) return false;
  if (mode !== 4) return false;
  if (material.transparent === true || material.alphaMode === "BLEND") return false;
  if ((material.opacity ?? 1) < 1) return false;
  if (mesh.userData?.AwtsmoosYardGrass?.reactsToPlayer) return false;
  return materialMode === 0 || materialMode === 3;
}
function dynamicHierarchy(mesh) {
  for (let current = mesh; current; current = current.parent) {
    if (DYNAMIC_NAME.test(current.name || "")) return true;
    const userData = current.userData || {};
    for (const key of DYNAMIC_KEYS) {
      if (userData[key]) return true;
    }
    if (userData.AwtsmoosWorldModel?.definition?.dynamic === true || userData.AwtsmoosWorldModel?.definition?.animated === true) return true;
  }
  return false;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-collection.js
function collectSceneMeshes(root, options = {}) {
  const result = {
    batchCandidates: [],
    hidden: { line: 0, point: 0, other: 0 },
    invisibleSubtrees: 0,
    opaque: [],
    transparent: []
  };
  visit2(root, true, (object) => classify(object, options, result), result);
  return result;
}
function classify(object, options, result) {
  if (!object.isMesh) return;
  const mode = object.geometry?.mode ?? object.primitiveMode ?? 4;
  if (!shouldRenderMode(mode, options)) {
    const kind = helperKind(mode);
    result.hidden[kind] = (result.hidden[kind] || 0) + 1;
    return;
  }
  if (isTransparent(object)) {
    result.transparent.push(object);
    return;
  }
  const metadata = options.staticBatcher ? staticBatchMetadata(object) : null;
  if (metadata) {
    result.batchCandidates.push({ mesh: object, metadata });
    return;
  }
  result.opaque.push(object);
}
function visit2(object, parentVisible, callback, result) {
  const visible = parentVisible && object.visible !== false;
  if (!visible) {
    result.invisibleSubtrees += 1;
    return;
  }
  callback(object);
  for (const child of object.children || []) {
    visit2(child, visible, callback, result);
  }
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-order.js
function orderOpaqueMeshes(meshes) {
  const stateKeys = /* @__PURE__ */ new WeakMap();
  for (const mesh of meshes) {
    stateKeys.set(mesh, materialSignature2(mesh));
  }
  meshes.sort((left, right) => {
    return programRank(left) - programRank(right) || cullRank(left) - cullRank(right) || compareText(stateKeys.get(left), stateKeys.get(right)) || objectIdentity(left.geometry) - objectIdentity(right.geometry) || objectIdentity(left.material) - objectIdentity(right.material);
  });
  return {
    meshes,
    stats: summarizeOrder(meshes, stateKeys)
  };
}
function summarizeOrder(meshes, stateKeys) {
  let geometryGroups = 0;
  let stateGroups = 0;
  let previousGeometry = null;
  let previousState = null;
  for (const mesh of meshes) {
    const state = stateKeys.get(mesh);
    const geometry = mesh.geometry || null;
    if (state !== previousState) {
      stateGroups += 1;
      previousState = state;
      previousGeometry = null;
    }
    if (geometry !== previousGeometry) {
      geometryGroups += 1;
      previousGeometry = geometry;
    }
  }
  return {
    geometryGroups,
    meshCount: meshes.length,
    stateGroups
  };
}
function programRank(mesh) {
  return mesh.isSkinnedMesh && mesh.skeleton ? 1 : 0;
}
function cullRank(mesh) {
  return mesh.material?.backfaceCull ? 0 : 1;
}
function compareText(left, right) {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-draw-list.js
function collectMeshes(root, camera = null, options = {}) {
  const collected = collectSceneMeshes(root, options);
  const batched = options.staticBatcher ? options.staticBatcher.resolve(collected.batchCandidates) : unbatched(collected.batchCandidates);
  const opaque = [];
  const transparent = [];
  const culled = {
    distance: 0,
    frustum: 0,
    invisibleSubtrees: collected.invisibleSubtrees
  };
  const cullingContext = cameraCullContext(camera);
  appendVisibleMeshes(collected.opaque, opaque, camera, options, culled, cullingContext);
  appendVisibleMeshes(batched.originals, opaque, camera, options, culled, cullingContext);
  appendVisibleMeshes(batched.meshes, opaque, camera, options, culled, cullingContext);
  appendVisibleMeshes(collected.transparent, transparent, camera, options, culled, cullingContext);
  const ordered = orderOpaqueMeshes(opaque);
  sortTransparentMeshes(transparent, camera);
  return {
    culled,
    hidden: collected.hidden,
    opaque: ordered.meshes,
    renderOrder: ordered.stats,
    staticBatch: batched.stats,
    transparent
  };
}
function sortTransparentMeshes(meshes, camera) {
  const eye = camera?.position;
  if (!eye || meshes.length < 2) return meshes;
  meshes.sort((left, right) => distanceSquared(right, eye) - distanceSquared(left, eye));
  return meshes;
}
function unbatched(candidates2) {
  return {
    meshes: [],
    originals: candidates2.map((entry) => entry.mesh),
    stats: null
  };
}
function appendVisibleMeshes(meshes, output, camera, options, culled, cullingContext) {
  for (const mesh of meshes) {
    const reason = meshCullingReason(mesh, camera, options, cullingContext);
    if (reason) {
      culled[reason] += 1;
      continue;
    }
    output.push(mesh);
  }
}
function distanceSquared(mesh, eye) {
  const sphere = worldBoundingSphere(mesh);
  const matrix = mesh?.matrixWorld;
  const center = sphere?.center;
  const x = center?.[0] ?? matrix?.[12] ?? mesh?.position?.x ?? 0;
  const y = center?.[1] ?? matrix?.[13] ?? mesh?.position?.y ?? 0;
  const z = center?.[2] ?? matrix?.[14] ?? mesh?.position?.z ?? 0;
  const dx = x - eye.x;
  const dy = y - eye.y;
  const dz = z - eye.z;
  return dx * dx + dy * dy + dz * dz;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-gl-state-stats.js
function createInitialRendererStats() {
  return {
    draws: 0,
    triangles: 0,
    skinnedMeshes: 0,
    jointsUploaded: 0,
    skinPaletteRecomputes: 0,
    skinPaletteReuses: 0,
    glStateCache: disabledSummary()
  };
}
function recordGlStateCacheStats(renderer) {
  renderer.stats.glStateCache = summarizeGlStateCache(renderer.glStateCache);
}
function summarizeGlStateCache(cache3) {
  if (!cache3?.stats?.methods) {
    return disabledSummary();
  }
  const methods = {};
  let calls = 0;
  let skips = 0;
  for (const [methodName, source] of Object.entries(cache3.stats.methods)) {
    const methodCalls = Number(source.calls) || 0;
    const methodSkips = Number(source.skips) || 0;
    methods[methodName] = {
      calls: methodCalls,
      skips: methodSkips
    };
    calls += methodCalls;
    skips += methodSkips;
  }
  return {
    enabled: true,
    calls,
    skips,
    skipRatio: calls > 0 ? skips / calls : 0,
    invalidations: Number(cache3.stats.invalidations) || 0,
    vertexArrayInvalidations: Number(
      cache3.stats.vertexArrayInvalidations
    ) || 0,
    methods
  };
}
function disabledSummary() {
  return {
    enabled: false,
    calls: 0,
    skips: 0,
    skipRatio: 0,
    invalidations: 0,
    vertexArrayInvalidations: 0,
    methods: {}
  };
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-skin.js
function bindSkin(renderer, locations, mesh) {
  const skeleton = mesh.skeleton;
  const uploadedJoints = skeleton.updateCached(
    mesh.matrixWorld || renderer.identityMatrix,
    renderer.frameToken
  );
  recordPaletteWork(renderer, skeleton);
  renderer.stats.skinnedMeshes += 1;
  renderer.stats.jointsUploaded += uploadedJoints;
  renderer.stats.skinGpuUploads += 1;
  uploadJoints(renderer, skeleton, locations);
}
function recordPaletteWork(renderer, skeleton) {
  const metric = skeleton.lastPaletteRecomputed ? "skinPaletteRecomputes" : "skinPaletteReuses";
  renderer.stats[metric] += 1;
}
function uploadJoints(renderer, skeleton, locations) {
  if (renderer.jointMode === "texture") {
    uploadJointTexture(renderer, skeleton, locations);
    return;
  }
  uploadJointUniforms(renderer, skeleton, locations);
}
function uploadJointTexture(renderer, skeleton, locations) {
  const gl = renderer.gl;
  const count = Math.max(1, skeleton.jointCount);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, renderer.skinTexture);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    4,
    count,
    0,
    gl.RGBA,
    gl.FLOAT,
    skeleton.jointMatrices
  );
  gl.uniform1i(locations.jointTexture, 0);
  gl.uniform1f(locations.jointTextureHeight, count);
  renderer.stats.skinTextureUploads += 1;
}
function uploadJointUniforms(renderer, skeleton, locations) {
  const gl = renderer.gl;
  const count = Math.min(
    skeleton.jointCount,
    renderer.maxUniformJoints
  );
  if (skeleton.jointCount > renderer.maxUniformJoints) {
    renderer.errors.push(
      `Joint uniform overflow: ${skeleton.jointCount} > ${renderer.maxUniformJoints}`
    );
  }
  gl.uniformMatrix4fv(
    locations.jointMatrices,
    false,
    skeleton.jointMatrices.subarray(0, count * 16)
  );
  renderer.stats.skinUniformUploads += 1;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-water-material-mode.js
var WATER_MODE = Object.freeze({
  NONE: 0,
  LAKE: 1,
  RIVER: 2,
  WATERFALL: 3,
  FOAM: 4,
  MIST: 5
});
var VARIANT_CODES = Object.freeze({
  foam: WATER_MODE.FOAM,
  lake: WATER_MODE.LAKE,
  mist: WATER_MODE.MIST,
  river: WATER_MODE.RIVER,
  stream: WATER_MODE.RIVER,
  waterfall: WATER_MODE.WATERFALL
});
function waterModeCode(mesh) {
  const variant = String(mesh?.material?.texturePolicy?.waterVariant || "").toLowerCase();
  if (VARIANT_CODES[variant] !== void 0) return VARIANT_CODES[variant];
  const identity2 = materialIdentity3(mesh);
  if (/mist|spray/.test(identity2)) return WATER_MODE.MIST;
  if (/foam|whitewater|rapid/.test(identity2)) return WATER_MODE.FOAM;
  if (/waterfall|cascade|fall-sheet/.test(identity2)) return WATER_MODE.WATERFALL;
  if (/river|stream/.test(identity2)) return WATER_MODE.RIVER;
  if (/lake|water/.test(identity2)) return WATER_MODE.LAKE;
  return WATER_MODE.NONE;
}
function materialIdentity3(mesh) {
  const values = [mesh?.name, mesh?.material?.name];
  let parent = mesh;
  while (parent) {
    values.push(parent.userData?.family, parent.userData?.part);
    parent = parent.parent;
  }
  return values.filter(Boolean).join(" ").toLowerCase();
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-uniforms.js
function uploadFrameUniforms(renderer, locations) {
  const gl = renderer.gl;
  const environment = renderer.environment;
  const camera = renderer.frameCameraPosition;
  if (locations.ambient) gl.uniform3fv(locations.ambient, environment.ambient);
  if (locations.sunDirection) gl.uniform3fv(locations.sunDirection, environment.sunDirection);
  if (locations.sunColor) gl.uniform3fv(locations.sunColor, environment.sunColor);
  if (locations.cameraPosition) gl.uniform3f(locations.cameraPosition, camera.x, camera.y, camera.z);
  if (locations.fogColor) gl.uniform3fv(locations.fogColor, environment.fogColor);
  if (locations.fogNear) gl.uniform1f(locations.fogNear, environment.fogNear);
  if (locations.fogFar) gl.uniform1f(locations.fogFar, environment.fogFar);
  if (locations.exposure) gl.uniform1f(locations.exposure, environment.exposure);
  if (locations.interactor) {
    gl.uniform3f(locations.interactor, renderer.interactor.x, renderer.interactor.y, renderer.interactor.z);
  }
  if (locations.time) gl.uniform1f(locations.time, renderer.timeSeconds);
}
function uploadObjectUniforms(renderer, locations, model, mvp) {
  renderer.gl.uniformMatrix4fv(locations.mvp, false, mvp);
  renderer.gl.uniformMatrix4fv(locations.model, false, model);
}
function uploadMaterialUniforms(renderer, locations, mesh, buffers) {
  const gl = renderer.gl;
  const material = mesh.material || {};
  const materialMode = materialModeCode(mesh);
  const metadata = mesh.userData?.AwtsmoosYardGrass;
  const reactive = Boolean(metadata?.reactsToPlayer);
  gl.uniform4fv(locations.colorUniform, materialColor(material));
  gl.uniform1f(locations.alphaCutoff, material.alphaCutoff ?? 0.5);
  gl.uniform1i(locations.alphaMode, alphaModeCode(material));
  gl.uniform1i(locations.lit, isLitMode(buffers.mode) ? 1 : 0);
  gl.uniform1f(locations.pointSize, pointSizeForMode(buffers.mode));
  if (locations.materialMode) gl.uniform1i(locations.materialMode, materialMode);
  if (locations.waterMode) gl.uniform1i(locations.waterMode, waterModeCode(mesh));
  if (locations.emissiveStrength) {
    gl.uniform1f(locations.emissiveStrength, material.emissiveStrength ?? 1.8);
  }
  if (locations.grassReactive) gl.uniform1i(locations.grassReactive, reactive ? 1 : 0);
  if (locations.windMode) gl.uniform1i(locations.windMode, materialMode === 2 ? 1 : 0);
  if (locations.grassRadius) gl.uniform1f(locations.grassRadius, metadata?.interactionRadius ?? 2.2);
  if (locations.grassWindStrength) {
    gl.uniform1f(locations.grassWindStrength, metadata?.windStrength ?? 0.085);
  }
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-mesh.js
function drawRenderMesh(renderer, mesh, projectionView, transparent) {
  const resource = renderer.buffers.forMesh(mesh);
  if (!resource) return;
  const skinned = Boolean(
    mesh.isSkinnedMesh && mesh.skeleton && resource.attributes.joints && resource.attributes.weights
  );
  const kind = skinned ? "skin" : "rigid";
  const locations = renderer.loc[kind];
  const model = mesh.matrixWorld || renderer.identityMatrix;
  applyCull(renderer, mesh, transparent);
  activateProgram(renderer, kind, locations);
  renderer.buffers.bindMesh(resource, locations, skinned);
  bindSkinBranch(renderer, locations, mesh, skinned);
  renderer._objectMvpMatrix ||= new Float32Array(16);
  multiplyInto(renderer._objectMvpMatrix, projectionView, model);
  uploadObjectUniforms(
    renderer,
    locations,
    model,
    renderer._objectMvpMatrix
  );
  if (renderer.materialState.needsUpload(mesh, resource)) {
    uploadMaterialUniforms(renderer, locations, mesh, resource);
  }
  renderer.textures.bind(locations, mesh.material, renderer.stats);
  issueDraw(renderer, resource);
  recordDraw(renderer, mesh, resource, skinned, transparent);
}
function activateProgram(renderer, kind, locations) {
  const program = renderer.programs[kind];
  if (renderer.activeProgram !== program) {
    renderer.gl.useProgram(program);
    renderer.activeProgram = program;
    renderer.materialState.previous = null;
    renderer.textures.invalidate();
    renderer.stats.programSwitches += 1;
  }
  renderer._frameUniformTokens ||= /* @__PURE__ */ new Map();
  if (renderer._frameUniformTokens.get(program) === renderer.frameToken) return;
  uploadFrameUniforms(renderer, locations);
  renderer._frameUniformTokens.set(program, renderer.frameToken);
  renderer.frameUniformToken = renderer.frameToken;
  renderer.stats.frameUniformUploads += 1;
}
function bindSkinBranch(renderer, locations, mesh, skinned) {
  if (renderer.activeSkinBranch !== skinned) {
    if (locations.useSkin) {
      renderer.gl.uniform1i(locations.useSkin, skinned ? 1 : 0);
    }
    renderer.activeSkinBranch = skinned;
  }
  if (skinned) bindSkin(renderer, locations, mesh);
}
function applyCull(renderer, mesh, transparent) {
  if (shouldCullBackfaces(mesh, transparent)) {
    renderer.gl.enable(renderer.gl.CULL_FACE);
    renderer.gl.cullFace(renderer.gl.BACK);
    renderer.stats.culledBackfaceMeshes += 1;
    return;
  }
  renderer.gl.disable(renderer.gl.CULL_FACE);
}
function multiplyInto(target, left, right) {
  for (let column = 0; column < 4; column += 1) {
    const offset = column * 4;
    const right0 = right[offset];
    const right1 = right[offset + 1];
    const right2 = right[offset + 2];
    const right3 = right[offset + 3];
    target[offset] = left[0] * right0 + left[4] * right1 + left[8] * right2 + left[12] * right3;
    target[offset + 1] = left[1] * right0 + left[5] * right1 + left[9] * right2 + left[13] * right3;
    target[offset + 2] = left[2] * right0 + left[6] * right1 + left[10] * right2 + left[14] * right3;
    target[offset + 3] = left[3] * right0 + left[7] * right1 + left[11] * right2 + left[15] * right3;
  }
}
function issueDraw(renderer, resource) {
  const gl = renderer.gl;
  const mode = drawMode(gl, resource.mode);
  if (resource.index) {
    gl.drawElements(mode, resource.count, resource.indexType, 0);
    return;
  }
  gl.drawArrays(mode, 0, resource.count);
}
function recordDraw(renderer, mesh, resource, skinned, transparent) {
  renderer.stats.draws += 1;
  renderer.stats.triangles += triangleCountForMode(
    resource.mode,
    resource.count
  );
  if (!skinned) renderer.stats.rigidMeshes += 1;
  if (transparent) renderer.stats.transparentMeshes += 1;
  if (mesh.userData?.AwtsmoosYardGrass?.reactsToPlayer) {
    renderer.stats.reactiveGrassMeshes += 1;
  }
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-skeleton.js
function drawSkeleton(renderer, scene, projectionView) {
  const gl = renderer.gl;
  const points = skeletonLinePositions(scene);
  if (!points.length) return false;
  if (!renderer.skeletonBuffer) renderer.skeletonBuffer = gl.createBuffer();
  const locations = renderer.loc.rigid;
  gl.useProgram(renderer.programs.rigid);
  gl.bindBuffer(gl.ARRAY_BUFFER, renderer.skeletonBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(locations.position);
  gl.vertexAttribPointer(locations.position, 3, gl.FLOAT, false, 0, 0);
  renderer.buffers.bindAttribute(locations.normal, null, null, [0, 1, 0, 0]);
  renderer.buffers.bindAttribute(locations.color, null, null, [1, 1, 1, 1]);
  renderer.buffers.bindAttribute(locations.uv, null, null, [0, 0, 0, 1]);
  gl.uniformMatrix4fv(locations.mvp, false, projectionView);
  gl.uniformMatrix4fv(locations.model, false, renderer.identityMatrix);
  gl.uniform4fv(locations.colorUniform, new Float32Array([0.2, 1, 0.9, 1]));
  gl.uniform1f(locations.alphaCutoff, 0.5);
  gl.uniform1i(locations.alphaMode, 0);
  gl.uniform1i(locations.lit, 0);
  gl.uniform1f(locations.pointSize, 1);
  renderer.textures.bind(locations, null, renderer.stats);
  gl.drawArrays(gl.LINES, 0, points.length / 3);
  renderer.stats.skeletonSegments = points.length / 6;
  return true;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-frame.js
function renderFrame(renderer, scene, camera) {
  const gl = renderer.gl;
  renderer.frameToken += 1;
  updateFrameCameraPosition(renderer, camera);
  renderer.worldByNode = collectWorldMatrices(scene, renderer.worldByNode);
  const renderList = collectMeshes(scene, camera, renderer.options);
  renderer.stats = createFrameStats(renderer, renderList);
  renderer.buffers.beginFrame(renderer.stats);
  renderer.materialState.beginFrame(renderer.stats);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(...renderer.clearColor);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const projectionView = projectionViewMatrix(renderer, camera);
  drawOpaquePass(renderer, renderList.opaque, projectionView);
  drawTransparentPass(renderer, renderList.transparent, projectionView);
  drawSkeletonPass(renderer, scene, projectionView);
  recordGlStateCacheStats(renderer);
}
function updateFrameCameraPosition(renderer, camera) {
  renderer.frameCameraPosition ||= { x: 0, y: 0, z: 0 };
  renderer.frameCameraPosition.x = camera.position.x;
  renderer.frameCameraPosition.y = camera.position.y;
  renderer.frameCameraPosition.z = camera.position.z;
}
function projectionViewMatrix(renderer, camera) {
  const cache3 = frameMatrixCache(renderer);
  const aspect = camera.aspect || 1;
  if (cache3.fov !== camera.fov || cache3.aspect !== aspect || cache3.near !== camera.near || cache3.far !== camera.far) {
    writePerspective(
      cache3.projection,
      camera.fov,
      aspect,
      camera.near,
      camera.far
    );
    cache3.fov = camera.fov;
    cache3.aspect = aspect;
    cache3.near = camera.near;
    cache3.far = camera.far;
  }
  writeLookAt(cache3.view, camera);
  multiplyInto2(cache3.projectionView, cache3.projection, cache3.view);
  return cache3.projectionView;
}
function frameMatrixCache(renderer) {
  if (!renderer._frameMatrixCache) {
    renderer._frameMatrixCache = {
      aspect: Number.NaN,
      far: Number.NaN,
      fov: Number.NaN,
      near: Number.NaN,
      projection: new Float32Array(16),
      projectionView: new Float32Array(16),
      view: new Float32Array(16)
    };
  }
  return renderer._frameMatrixCache;
}
function writePerspective(target, fovDegrees, aspect, near, far) {
  target.fill(0);
  const factor = 1 / Math.tan(fovDegrees * Math.PI / 360);
  const depth = 1 / (near - far);
  target[0] = factor / aspect;
  target[5] = factor;
  target[10] = (far + near) * depth;
  target[11] = -1;
  target[14] = 2 * far * near * depth;
}
function writeLookAt(target, camera) {
  const eyeX = camera.position.x;
  const eyeY = camera.position.y;
  const eyeZ = camera.position.z;
  const cameraTarget = camera.target;
  const targetX = cameraTarget?.[0] ?? 0;
  const targetY = cameraTarget?.[1] ?? 0;
  const targetZ = cameraTarget?.[2] ?? 4;
  const rawForwardX = eyeX - targetX;
  const rawForwardY = eyeY - targetY;
  const rawForwardZ = eyeZ - targetZ;
  const inverseForward = 1 / (Math.hypot(rawForwardX, rawForwardY, rawForwardZ) || 1);
  const forwardX = rawForwardX * inverseForward;
  const forwardY = rawForwardY * inverseForward;
  const forwardZ = rawForwardZ * inverseForward;
  const rawRightX = forwardZ;
  const rawRightZ = -forwardX;
  const inverseRight = 1 / (Math.hypot(rawRightX, 0, rawRightZ) || 1);
  const rightX = rawRightX * inverseRight;
  const rightY = 0;
  const rightZ = rawRightZ * inverseRight;
  const upwardX = forwardY * rightZ - forwardZ * rightY;
  const upwardY = forwardZ * rightX - forwardX * rightZ;
  const upwardZ = forwardX * rightY - forwardY * rightX;
  target[0] = rightX;
  target[1] = upwardX;
  target[2] = forwardX;
  target[3] = 0;
  target[4] = rightY;
  target[5] = upwardY;
  target[6] = forwardY;
  target[7] = 0;
  target[8] = rightZ;
  target[9] = upwardZ;
  target[10] = forwardZ;
  target[11] = 0;
  target[12] = -(rightX * eyeX + rightY * eyeY + rightZ * eyeZ);
  target[13] = -(upwardX * eyeX + upwardY * eyeY + upwardZ * eyeZ);
  target[14] = -(forwardX * eyeX + forwardY * eyeY + forwardZ * eyeZ);
  target[15] = 1;
}
function multiplyInto2(target, left, right) {
  for (let column = 0; column < 4; column += 1) {
    const offset = column * 4;
    const right0 = right[offset];
    const right1 = right[offset + 1];
    const right2 = right[offset + 2];
    const right3 = right[offset + 3];
    target[offset] = left[0] * right0 + left[4] * right1 + left[8] * right2 + left[12] * right3;
    target[offset + 1] = left[1] * right0 + left[5] * right1 + left[9] * right2 + left[13] * right3;
    target[offset + 2] = left[2] * right0 + left[6] * right1 + left[10] * right2 + left[14] * right3;
    target[offset + 3] = left[3] * right0 + left[7] * right1 + left[11] * right2 + left[15] * right3;
  }
}
function drawOpaquePass(renderer, meshes, projectionView) {
  const gl = renderer.gl;
  gl.disable(gl.BLEND);
  gl.depthMask(true);
  for (const mesh of meshes) {
    drawRenderMesh(renderer, mesh, projectionView, false);
    renderer.stats.opaqueMeshes += 1;
  }
}
function drawTransparentPass(renderer, meshes, projectionView) {
  if (!meshes.length) return;
  const gl = renderer.gl;
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.depthMask(false);
  for (const mesh of meshes) {
    drawRenderMesh(renderer, mesh, projectionView, true);
  }
  gl.depthMask(true);
  gl.disable(gl.BLEND);
}
function drawSkeletonPass(renderer, scene, projectionView) {
  if (!renderer.options.showSkeleton) return;
  renderer.gl.disable(renderer.gl.CULL_FACE);
  if (!drawSkeleton(renderer, scene, projectionView)) return;
  renderer.activeProgram = renderer.programs.rigid;
  renderer.materialState.previous = null;
}
function createFrameStats(renderer, renderList) {
  return {
    culledBackfaceMeshes: 0,
    culledMeshes: renderList.culled,
    draws: 0,
    errors: renderer.errors,
    floatTexture: renderer.floatTexture,
    frameUniformUploads: 0,
    grassInteractor: renderer.interactor,
    hiddenHelpers: renderList.hidden,
    jointMode: renderer.jointMode,
    jointsUploaded: 0,
    matrixNodes: renderer.worldByNode.stats || {},
    maxUniformJoints: renderer.maxUniformJoints,
    maxVertexTextures: renderer.maxVertexTextures,
    maxVertexUniformVectors: renderer.maxVertexUniformVectors,
    opaqueMeshes: 0,
    perMeshSkinUpdate: true,
    programSwitches: 0,
    reactiveGrassMeshes: 0,
    renderOrder: renderList.renderOrder,
    rigidMeshes: 0,
    sharedSkinPaletteCache: true,
    staticBatch: renderList.staticBatch || null,
    skinGpuUploadReuses: 0,
    skinGpuUploads: 0,
    skinPaletteRecomputes: 0,
    skinPaletteReuses: 0,
    skinTextureUploads: 0,
    skinUniformUploads: 0,
    skinnedMeshes: 0,
    transparentMeshes: 0,
    triangles: 0
  };
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-material-state.js
var RenderMaterialState = class {
  constructor() {
    this.previous = null;
    this.skips = 0;
    this.uploads = 0;
  }
  beginFrame(stats3) {
    stats3.materialStateSkips = 0;
    stats3.materialStateUploads = 0;
    this.frameStats = stats3;
  }
  needsUpload(mesh, buffers) {
    const next = snapshot(mesh, buffers);
    if (sameSnapshot(this.previous, next)) {
      this.skips += 1;
      this.frameStats.materialStateSkips += 1;
      return false;
    }
    this.previous = next;
    this.uploads += 1;
    this.frameStats.materialStateUploads += 1;
    return true;
  }
};
function snapshot(mesh, buffers) {
  const material = mesh.material || {};
  const color = material.color || [0.75, 0.7, 0.62, 1];
  const grass = mesh.userData?.AwtsmoosYardGrass;
  const mode = materialModeCode(mesh);
  return {
    alphaCutoff: material.alphaCutoff ?? 0.5,
    alphaMode: alphaModeCode(material),
    color0: color[0] ?? 0.75,
    color1: color[1] ?? 0.7,
    color2: color[2] ?? 0.62,
    color3: material.opacity ?? color[3] ?? 1,
    emissive: material.emissiveStrength ?? 1.8,
    lit: isLitMode(buffers.mode) ? 1 : 0,
    mode,
    pointSize: pointSizeForMode(buffers.mode),
    reactive: grass?.reactsToPlayer ? 1 : 0,
    radius: grass?.interactionRadius ?? 2.2,
    waterMode: waterModeCode(mesh),
    wind: grass?.windStrength ?? 0.085,
    windMode: mode === 2 ? 1 : 0
  };
}
function sameSnapshot(left, right) {
  if (!left) return false;
  for (const key of Object.keys(right)) {
    if (left[key] !== right[key]) return false;
  }
  return true;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-locations.js
function rendererLocations(gl, program, layerCount = TERRAIN_LAYER_TARGET) {
  const attribute5 = (name) => gl.getAttribLocation(program, name);
  const uniform = (name) => gl.getUniformLocation(program, name);
  return {
    position: attribute5("aPosition"),
    normal: attribute5("aNormal"),
    color: attribute5("aColor"),
    uv: attribute5("aUv"),
    zone: attribute5("aZone"),
    joints: attribute5("aJoints"),
    weights: attribute5("aWeights"),
    mvp: uniform("uMvp"),
    model: uniform("uModel"),
    colorUniform: uniform("uColor"),
    alphaCutoff: uniform("uAlphaCutoff"),
    alphaMode: uniform("uAlphaMode"),
    lit: uniform("uLit"),
    pointSize: uniform("uPointSize"),
    map: uniform("uMap"),
    useMap: uniform("uUseMap"),
    mapRepeat: uniform("uMapRepeat"),
    mixMap: uniform("uMixMap"),
    useMixMap: uniform("uUseMixMap"),
    mixRepeat: uniform("uMixRepeat"),
    mixStrength: uniform("uMixStrength"),
    mixPatchScale: uniform("uMixPatchScale"),
    mixPatchSharpness: uniform("uMixPatchSharpness"),
    terrainLayers: terrainLayerLocations(uniform, layerCount),
    materialMode: uniform("uMaterialMode"),
    waterMode: uniform("uWaterMode"),
    emissiveStrength: uniform("uEmissiveStrength"),
    ambient: uniform("uAmbient"),
    sunDirection: uniform("uSunDirection"),
    sunColor: uniform("uSunColor"),
    cameraPosition: uniform("uCameraPosition"),
    fogColor: uniform("uFogColor"),
    fogNear: uniform("uFogNear"),
    fogFar: uniform("uFogFar"),
    exposure: uniform("uExposure"),
    grassReactive: uniform("uGrassReactive"),
    windMode: uniform("uWindMode"),
    interactor: uniform("uInteractor"),
    grassRadius: uniform("uGrassRadius"),
    grassWindStrength: uniform("uGrassWindStrength"),
    time: uniform("uTime"),
    jointMatrices: uniform("uJointMatrices[0]"),
    jointTexture: uniform("uJointTexture"),
    jointTextureHeight: uniform("uJointTextureHeight")
  };
}
function terrainLayerLocations(uniform, layerCount) {
  return Array.from({ length: Math.max(0, Math.floor(layerCount)) }, (_, index) => ({
    angle: uniform(`uTerrainLayerAngle${index}`),
    height: uniform(`uTerrainLayerHeight${index}`),
    map: uniform(`uTerrainLayer${index}`),
    repeat: uniform(`uTerrainLayerRepeat${index}`),
    slope: uniform(`uTerrainLayerSlope${index}`),
    strength: uniform(`uTerrainLayerStrength${index}`),
    use: uniform(`uUseTerrainLayer${index}`),
    wetness: uniform(`uTerrainLayerWetness${index}`),
    zones: uniform(`uTerrainLayerZones${index}`)
  }));
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-fragment-lighting-functions.js
var fragmentLightingFunctions = `
vec3 litSurface(vec3 albedo,vec3 normal){
	vec3 sun=uSunDirection;
	vec3 viewDirection=normalize(uCameraPosition-vWorld);
	vec3 halfDirection=normalize(sun+viewDirection);
	float direct=max(dot(normal,sun),0.0);
	float wrapped=max((dot(normal,sun)+0.24)/1.24,0.0);
	float skyFacing=normal.y*0.5+0.5;
	float horizonFacing=1.0-abs(normal.y);
	float highlightBase=max(dot(normal,halfDirection),0.0);
	float highlight2=highlightBase*highlightBase;
	float highlight4=highlight2*highlight2;
	float highlight8=highlight4*highlight4;
	float highlight=highlight8*highlight8*highlight8*direct;
	vec3 coolSky=vec3(0.24,0.38,0.58)*skyFacing;
	vec3 earthBounce=vec3(0.24,0.15,0.075)*(1.0-skyFacing);
	vec3 horizonFill=vec3(0.16,0.11,0.075)*horizonFacing;
	vec3 sunlight=uSunColor*(direct*0.88+wrapped*0.14);
	vec3 specular=uSunColor*highlight*(0.035+max(max(albedo.r,albedo.g),albedo.b)*0.045);
	return albedo*(uAmbient+coolSky*0.30+earthBounce*0.16+horizonFill*0.10+sunlight)+specular;
}
vec3 waterRippleNormal(vec3 normal){
	float speed=uWaterMode==2?2.7:uWaterMode==3?6.8:1.25;
	float scale=uWaterMode==2?0.72:uWaterMode==3?1.35:0.31;
	float first=sin((vWorld.x+vWorld.z*0.54)*scale+uTime*speed);
	float second=cos((vWorld.z-vWorld.x*0.38)*scale*1.73-uTime*speed*0.81);
	if(uWaterMode==3){
		first=sin(vUv.x*34.0+vUv.y*9.0-uTime*8.4);
		second=cos(vUv.x*17.0-vUv.y*15.0+uTime*5.7);
	}
	float strength=uWaterMode==1?0.075:uWaterMode==2?0.12:uWaterMode==3?0.16:0.055;
	return normalize(normal+vec3(first*strength,0.34,second*strength));
}
float waterFoamMask(){
	float current=valueNoise(vWorld.xz*0.11+vec2(uTime*0.09,-uTime*0.04));
	if(uWaterMode==2){
		float bank=smoothstep(0.58,0.97,abs(vUv.y*2.0-1.0));
		return clamp(bank*0.82+smoothstep(0.76,0.98,current)*0.24,0.0,1.0);
	}
	if(uWaterMode==3){
		float crest=1.0-smoothstep(0.02,0.20,vUv.y);
		float impact=smoothstep(0.70,1.0,vUv.y);
		float streak=smoothstep(0.62,0.98,sin(vUv.x*29.0-vUv.y*11.0+uTime*7.2)*0.5+0.5);
		return clamp(crest*0.42+impact*0.78+streak*0.24,0.0,1.0);
	}
	if(uWaterMode==4)return 0.72+current*0.28;
	if(uWaterMode==5)return smoothstep(0.36,0.88,current)*(1.0-vUv.y*0.42);
	return smoothstep(0.82,0.99,current)*0.32;
}
vec3 waterSurface(vec3 albedo,vec3 normal){
	float foam=waterFoamMask();
	if(uWaterMode==5){
		vec3 mist=mix(vec3(0.42,0.66,0.72),vec3(0.88,0.94,0.91),foam);
		return mix(albedo*0.34,mist,0.72);
	}
	vec3 ripple=waterRippleNormal(normal);
	vec3 viewDirection=normalize(uCameraPosition-vWorld);
	float facing=max(dot(viewDirection,ripple),0.0);
	float fresnel=pow(1.0-facing,uWaterMode==3?2.1:3.2);
	vec3 reflectedDirection=reflect(-normalize(uSunDirection),ripple);
	float sparkleBase=max(dot(reflectedDirection,viewDirection),0.0);
	float sparkle2=sparkleBase*sparkleBase;
	float sparkle4=sparkle2*sparkle2;
	float sparkle8=sparkle4*sparkle4;
	float sparkle=sparkle8*sparkle8*sparkle8;
	float depth=valueNoise(vWorld.xz*0.021+vec2(4.1,8.7));
	vec3 deep=mix(vec3(0.008,0.055,0.085),vec3(0.018,0.19,0.23),depth);
	if(uWaterMode==3)deep=vec3(0.035,0.24,0.29);
	if(uWaterMode==4)deep=vec3(0.22,0.48,0.52);
	vec3 sourceTint=mix(deep,albedo*vec3(0.22,0.64,0.76),uWaterMode==3?0.72:0.58);
	vec3 sky=mix(vec3(0.24,0.43,0.61),uFogColor,0.38);
	vec3 glint=uSunColor*sparkle*(uWaterMode==3?1.9:1.45);
	vec3 foamTint=vec3(0.78,0.91,0.88)*foam*(uWaterMode==4?0.72:0.31);
	return mix(sourceTint,sky,0.14+fresnel*0.68)+glint+foamTint;
}
vec3 toneMap(vec3 color){
	vec3 exposed=max(color,vec3(0.0))*uExposure;
	vec3 mapped=(exposed*(2.51*exposed+0.03))/(exposed*(2.43*exposed+0.59)+0.14);
	return sqrt(clamp(mapped,0.0,1.0));
}
`;

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-fragment-main-function.js
var fragmentMainFunction = `
void main(){
	vec3 normal=normalize(vNormal);
	vec4 texel=uMaterialMode==5
		?layeredTerrainTexel(normal)
		:baseTexel();
	if(uMaterialMode!=5&&uUseMixMap==1&&uMixStrength>0.001&&uMaterialMode!=1){
		vec4 other=texture2D(uMixMap,mirrorRepeat(vUv*uMixRepeat));
		texel=mix(texel,other,uMixStrength*patchMask(vWorld.xz));
	}
	vec4 mixedColor=uColor*vColor*texel;
	if(uAlphaMode==1&&mixedColor.a<uAlphaCutoff)discard;
	if(mixedColor.a<=0.003)discard;
	vec3 encoded=max(mixedColor.rgb,vec3(0.0));
	vec3 textureLinear=encoded*encoded;
	vec3 rgb=textureLinear;
	if(uMaterialMode==4){
		rgb=textureLinear*uExposure;
	}else if(uMaterialMode==1){
		rgb=waterSurface(textureLinear,normal);
	}else if(uMaterialMode==3){
		rgb=litSurface(textureLinear,normal)+textureLinear*uEmissiveStrength;
	}else if(uLit==1){
		rgb=litSurface(textureLinear,normal);
		if(uMaterialMode==2){
			float back=max(dot(-normal,normalize(uSunDirection)),0.0);
			rgb+=textureLinear*uSunColor*back*0.22;
		}
	}
	vec3 cameraDelta=uCameraPosition-vWorld;
	float distanceSquared=dot(cameraDelta,cameraDelta);
	float fog=smoothstep(uFogNear*uFogNear,uFogFar*uFogFar,distanceSquared);
	if(uMaterialMode!=4){
		rgb=mix(rgb,uFogColor*uFogColor,fog*0.88);
	}
	gl_FragColor=vec4(toneMap(rgb),mixedColor.a);
}
`;

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-fragment-sampling-functions.js
var fragmentSamplingFunctions = `
vec2 mirrorRepeat(vec2 value){
	vec2 fraction=fract(value);
	vec2 odd=mod(floor(value),2.0);
	return mix(fraction,1.0-fraction,odd);
}
float hash21(vec2 point){
	point=fract(point*vec2(123.34,456.21));
	point+=dot(point,point+45.32);
	return fract(point.x*point.y);
}
float valueNoise(vec2 point){
	vec2 cell=floor(point);
	vec2 local=fract(point);
	local=local*local*(3.0-2.0*local);
	float low=mix(hash21(cell),hash21(cell+vec2(1.0,0.0)),local.x);
	float high=mix(hash21(cell+vec2(0.0,1.0)),hash21(cell+vec2(1.0,1.0)),local.x);
	return mix(low,high,local.y);
}
float patchMask(vec2 worldPosition){
	if(uMixPatchScale<=0.00001)return 1.0;
	float broad=valueNoise(worldPosition*uMixPatchScale);
	float detail=valueNoise(worldPosition*uMixPatchScale*2.17+vec2(7.3,3.1));
	return smoothstep(uMixPatchSharpness,1.0,broad*0.78+detail*0.22);
}
vec2 primaryWaterFlow(){
	vec2 uv=vUv*uMapRepeat;
	if(uWaterMode==2)return uv+vec2(-uTime*0.34,sin(uTime*0.43)*0.035);
	if(uWaterMode==3)return uv+vec2(sin(vUv.y*8.0+uTime)*0.08,-uTime*1.18);
	if(uWaterMode==4)return uv+vec2(-uTime*0.48,uTime*0.07);
	if(uWaterMode==5)return uv+vec2(uTime*0.05,-uTime*0.24);
	return uv+vec2(uTime*0.022,uTime*0.014);
}
vec2 detailWaterFlow(){
	vec2 uv=vUv*uMixRepeat;
	if(uWaterMode==2)return uv*1.37+vec2(-uTime*0.57,-uTime*0.045);
	if(uWaterMode==3)return uv*1.61+vec2(-uTime*0.09,-uTime*1.83);
	if(uWaterMode==4)return uv*1.42+vec2(-uTime*0.71,uTime*0.11);
	if(uWaterMode==5)return uv*1.28+vec2(-uTime*0.04,-uTime*0.37);
	return uv*1.53+vec2(-uTime*0.016,uTime*0.025);
}
vec4 waterTexel(){
	vec4 primary=uUseMap==1?texture2D(uMap,mirrorRepeat(primaryWaterFlow())):vec4(1.0);
	if(uUseMixMap!=1)return primary;
	vec4 detail=texture2D(uMixMap,mirrorRepeat(detailWaterFlow()));
	float current=valueNoise(vWorld.xz*0.055+vec2(uTime*0.04,0.0));
	float strength=clamp(uMixStrength*(0.56+current*0.28),0.0,0.72);
	return mix(primary,detail,strength);
}
vec4 baseTexel(){
	if(uMaterialMode==1)return waterTexel();
	if(uUseMap!=1)return vec4(1.0);
	return texture2D(uMap,mirrorRepeat(vUv*uMapRepeat));
}
`;

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-terrain-fragment-declarations.js
var terrainFragmentDeclarations = terrainDeclarationsForLayerCount(
  TERRAIN_LAYER_TARGET
);
function terrainDeclarationsForLayerCount(layerCount) {
  const count = normalizedCount(layerCount);
  const declarations2 = ["varying vec4 vZone;"];
  for (let index = 0; index < count; index += 1) {
    declarations2.push(`uniform sampler2D uTerrainLayer${index};`);
    declarations2.push(`uniform int uUseTerrainLayer${index};`);
    declarations2.push(`uniform vec2 uTerrainLayerRepeat${index};`);
    declarations2.push(`uniform float uTerrainLayerStrength${index};`);
    declarations2.push(`uniform float uTerrainLayerAngle${index};`);
    declarations2.push(`uniform vec4 uTerrainLayerZones${index};`);
    declarations2.push(`uniform vec2 uTerrainLayerSlope${index};`);
    declarations2.push(`uniform vec2 uTerrainLayerHeight${index};`);
    declarations2.push(`uniform float uTerrainLayerWetness${index};`);
  }
  const lineBreak = String.fromCharCode(10);
  return [lineBreak, declarations2.join(lineBreak), lineBreak].join("");
}
function normalizedCount(value3) {
  const count = Math.floor(Number(value3) || 0);
  return Math.max(0, Math.min(TERRAIN_LAYER_TARGET, count));
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-fragment-standard-declarations.js
var standardFragmentDeclarations = standardDeclarations(
  terrainFragmentDeclarations
);
function standardDeclarationsForLayerCount(layerCount) {
  return standardDeclarations(terrainDeclarationsForLayerCount(layerCount));
}
function standardDeclarations(terrainDeclarations) {
  return `
precision highp float;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;
varying vec3 vWorld;
${terrainDeclarations}
uniform vec4 uColor;
uniform float uAlphaCutoff;
uniform int uAlphaMode;
uniform int uLit;
uniform int uUseMap;
uniform sampler2D uMap;
uniform vec2 uMapRepeat;
uniform int uUseMixMap;
uniform sampler2D uMixMap;
uniform vec2 uMixRepeat;
uniform float uMixStrength;
uniform float uMixPatchScale;
uniform float uMixPatchSharpness;
uniform int uMaterialMode;
uniform int uWaterMode;
uniform float uEmissiveStrength;
uniform float uTime;
uniform vec3 uAmbient;
uniform vec3 uSunDirection;
uniform vec3 uSunColor;
uniform vec3 uCameraPosition;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform float uExposure;
`;
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-terrain-fragment-functions.js
var terrainFragmentFunctions = terrainFunctionsForLayerCount(
  TERRAIN_LAYER_TARGET
);
function terrainFunctionsForLayerCount(layerCount) {
  const count = normalizedCount2(layerCount);
  const lineBreak = String.fromCharCode(10);
  const layerMixes = Array.from({ length: count }, (_, index) => layerMix(index)).join(lineBreak);
  return `
vec2 terrainUv(vec2 repeatValue,float angle){
	vec2 world=vWorld.xz*0.035;
	float cosine=cos(angle);
	float sine=sin(angle);
	mat2 rotation=mat2(cosine,-sine,sine,cosine);
	return mirrorRepeat(rotation*world*repeatValue);
}
float terrainMacro(float seed){
	vec2 world=vWorld.xz;
	float broad=valueNoise(world*0.0065+vec2(seed,seed*1.731));
	float medium=valueNoise(world*0.021+vec2(seed*2.17,seed*0.613));
	float fine=valueNoise(world*0.073+vec2(seed*0.47,seed*3.11));
	return broad*0.52+medium*0.33+fine*0.15;
}
float terrainPatch(float seed){
	float source=terrainMacro(seed);
	float ridge=abs(source-0.5)*2.0;
	return smoothstep(0.14,0.88,source*0.82+(1.0-ridge)*0.18);
}
float terrainBand(float value,vec2 rangeValue){
	float width=max(0.025,(rangeValue.y-rangeValue.x)*0.18);
	float enters=smoothstep(rangeValue.x-width,rangeValue.x+width,value);
	float leaves=1.0-smoothstep(rangeValue.y-width,rangeValue.y+width,value);
	return clamp(enters*leaves,0.0,1.0);
}
float terrainLayerMask(
	vec4 zones,vec2 slopeRange,vec2 heightRange,float strength,
	float wetness,float seed,vec3 surfaceNormal
){
	float slope=1.0-clamp(surfaceNormal.y,0.0,1.0);
	float zoneWeight=clamp(dot(vZone,zones),0.0,1.0);
	float slopeWeight=terrainBand(slope,slopeRange);
	float heightWeight=terrainBand(vWorld.y,heightRange);
	float patch=terrainPatch(seed);
	float distanceFade=1.0-smoothstep(110.0,360.0,distance(uCameraPosition,vWorld));
	float macro=mix(0.34+patch*0.42,0.12+patch*0.88,distanceFade);
	float waterZone=clamp(vZone.y+vZone.z,0.0,1.0);
	float wetContribution=waterZone*wetness*0.28;
	return clamp(zoneWeight*slopeWeight*heightWeight*macro*strength+wetContribution,0.0,1.0);
}
vec4 layeredTerrainTexel(vec3 surfaceNormal){
	vec4 result=uUseMap==1
		?texture2D(uMap,terrainUv(uMapRepeat,0.0))
		:vec4(1.0);
	if(uUseMixMap==1){
		vec4 dirt=texture2D(uMixMap,terrainUv(uMixRepeat,-0.16));
		float wear=clamp((0.12+terrainPatch(2.7)*0.68)*vZone.x,0.0,1.0);
		result=mix(result,dirt,wear*uMixStrength);
	}
${layerMixes}
	return result;
}
`;
}
function layerMix(index) {
  const seed = (index + 1) * 3.17;
  return `
	if(uUseTerrainLayer${index}==1){
		vec4 layer${index}=texture2D(
			uTerrainLayer${index},
			terrainUv(uTerrainLayerRepeat${index},uTerrainLayerAngle${index})
		);
		float tone${index}=0.88+terrainMacro(${(seed + 11.7).toFixed(2)})*0.22;
		layer${index}.rgb*=tone${index};
		float weight${index}=terrainLayerMask(
			uTerrainLayerZones${index},uTerrainLayerSlope${index},
			uTerrainLayerHeight${index},uTerrainLayerStrength${index},
			uTerrainLayerWetness${index},${seed.toFixed(2)},surfaceNormal
		);
		result=mix(result,layer${index},weight${index});
	}`;
}
function normalizedCount2(value3) {
  return Math.max(0, Math.min(TERRAIN_LAYER_TARGET, Math.floor(Number(value3) || 0)));
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-fragment-shader.js
var fragmentShader = fragmentShaderForLayerCount(TERRAIN_LAYER_TARGET);
function fragmentShaderForLayerCount(layerCount) {
  return [
    standardDeclarationsForLayerCount(layerCount),
    fragmentSamplingFunctions,
    terrainFunctionsForLayerCount(layerCount),
    fragmentLightingFunctions,
    fragmentMainFunction
  ].join(String.fromCharCode(10));
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-unified-shaders.js
var declarations = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec4 aColor;
attribute vec2 aUv;
attribute vec4 aZone;
attribute vec4 aJoints;
attribute vec4 aWeights;
uniform mat4 uMvp;
uniform mat4 uModel;
uniform float uPointSize;
uniform int uUseSkin;
uniform int uGrassReactive;
uniform int uWindMode;
uniform vec3 uInteractor;
uniform float uGrassRadius;
uniform float uGrassWindStrength;
uniform float uTime;
varying vec3 vNormal;
varying vec4 vColor;
varying vec2 vUv;
varying vec3 vWorld;
varying vec4 vZone;
`;
var mainFunction = `
void main(){
	mat4 skin=mat4(1.0);
	if(uUseSkin==1){
		vec4 weights=aWeights;
		float sum=weights.x+weights.y+weights.z+weights.w;
		if(sum>0.0)weights/=sum;
		skin=jointAt(aJoints.x)*weights.x
			+jointAt(aJoints.y)*weights.y
			+jointAt(aJoints.z)*weights.z
			+jointAt(aJoints.w)*weights.w;
	}
	vec3 localPosition=aPosition;
	vec4 baseWorld=uModel*vec4(aPosition,1.0);
	float heightFactor=clamp(aUv.y,0.0,1.0);
	if(uUseSkin==0&&uGrassReactive==1){
		vec2 difference=baseWorld.xz-uInteractor.xz;
		float distanceToPlayer=length(difference);
		vec2 away=distanceToPlayer>0.001?difference/distanceToPlayer:vec2(1.0,0.0);
		float influence=1.0-smoothstep(0.0,uGrassRadius,distanceToPlayer);
		localPosition.xz+=away*influence*heightFactor*0.72;
	}
	if(uUseSkin==0&&(uGrassReactive==1||uWindMode==1)){
		float phase=baseWorld.x*0.31+baseWorld.z*0.23+aPosition.y*0.17;
		float wind=sin(uTime*1.35+phase)+sin(uTime*0.71+phase*1.83)*0.36;
		float strength=uGrassReactive==1?uGrassWindStrength:0.055;
		localPosition.x+=wind*strength*(0.32+heightFactor*heightFactor);
		localPosition.z+=wind*strength*0.34*(0.25+heightFactor);
	}
	vec4 local=skin*vec4(localPosition,1.0);
	vec4 world=uModel*local;
	vWorld=world.xyz;
	vNormal=mat3(uModel*skin)*aNormal;
	vColor=aColor;
	vUv=aUv;
	vZone=aZone;
	gl_Position=uMvp*local;
	gl_PointSize=uPointSize;
}
`;
function unifiedUniformVertexShader(maxJoints) {
  return `${declarations}
uniform mat4 uJointMatrices[${maxJoints}];
mat4 jointAt(float joint){
	return uJointMatrices[int(joint)];
}
${mainFunction}`;
}
var unifiedTextureVertexShader = `${declarations}
precision highp float;
uniform sampler2D uJointTexture;
uniform float uJointTextureHeight;
mat4 jointAt(float joint){
	float y=(joint+0.5)/uJointTextureHeight;
	return mat4(
		texture2D(uJointTexture,vec2(0.125,y)),
		texture2D(uJointTexture,vec2(0.375,y)),
		texture2D(uJointTexture,vec2(0.625,y)),
		texture2D(uJointTexture,vec2(0.875,y))
	);
}
${mainFunction}`;

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-programs.js
function initializeRendererPrograms(renderer) {
  const gl = renderer.gl;
  renderer.maxVertexUniformVectors = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) || 128;
  renderer.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) || 0;
  renderer.maxFragmentTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS) || 8;
  renderer.terrainLayerCapacity = terrainLayerCapacity(gl);
  renderer.floatTexture = Boolean(gl.getExtension("OES_texture_float"));
  renderer.maxUniformJoints = Math.max(
    8,
    Math.min(96, Math.floor((renderer.maxVertexUniformVectors - 32) / 4))
  );
  renderer.jointMode = renderer.maxUniformJoints >= 72 ? "uniform" : renderer.maxVertexTextures > 0 && renderer.floatTexture ? "texture" : "uniform";
  const vertexShader = renderer.jointMode === "texture" ? unifiedTextureVertexShader : unifiedUniformVertexShader(renderer.maxUniformJoints);
  const fragmentShader2 = fragmentShaderForLayerCount(renderer.terrainLayerCapacity);
  const program = createProgram(
    gl,
    vertexShader,
    fragmentShader2,
    `unified-${renderer.jointMode}-${renderer.terrainLayerCapacity}-layers`,
    renderer.errors
  );
  const sharedLocations = rendererLocations(
    gl,
    program,
    renderer.terrainLayerCapacity
  );
  sharedLocations.useSkin = gl.getUniformLocation(program, "uUseSkin");
  renderer.programs = { rigid: program, skin: program };
  renderer.loc = { rigid: sharedLocations, skin: sharedLocations };
  renderer.skinTexture = gl.createTexture();
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-gpu-texture-diagnostics.js
var RECENT_UPLOAD_LIMIT = 16;
function createGpuTextureStats() {
  return {
    activeUnitChanges: 0,
    activeUnitSkips: 0,
    bindingChanges: 0,
    bindingSkips: 0,
    cacheHits: 0,
    lastError: null,
    recentUploads: [],
    uploadAttempts: 0,
    uploadFailures: 0,
    uploads: 0
  };
}
function recordGpuTextureUpload(stats3, material, width, height, powerOfTwo) {
  stats3.recentUploads.push({
    height,
    powerOfTwo,
    url: material?.textureUrl || material?.mixTextureUrl || null,
    width
  });
  if (stats3.recentUploads.length > RECENT_UPLOAD_LIMIT) stats3.recentUploads.shift();
}
function gpuTextureDiagnostics(stats3) {
  return {
    ...stats3,
    recentUploads: stats3.recentUploads.map((item2) => ({ ...item2 }))
  };
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-gpu-texture-cache.js
var GpuTextureCache = class {
  constructor(gl) {
    this.gl = gl;
    this.cache = /* @__PURE__ */ new WeakMap();
    this.defaultTexture = createDefaultTexture(gl);
    this.activeUnit = 0;
    this.boundTextures = /* @__PURE__ */ new Map([[0, this.defaultTexture]]);
    this.anisotropy = gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
    this.stats = createGpuTextureStats();
  }
  bind(unit, uniform, texture2) {
    if (this.boundTextures.get(unit) !== texture2) {
      this.activateUnit(unit);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture2);
      this.boundTextures.set(unit, texture2);
      this.stats.bindingChanges += 1;
    } else {
      this.stats.bindingSkips += 1;
      this.stats.activeUnitSkips += 1;
    }
    if (uniform) this.gl.uniform1i(uniform, unit);
  }
  activateUnit(unit) {
    if (this.activeUnit === unit) {
      this.stats.activeUnitSkips += 1;
      return;
    }
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.activeUnit = unit;
    this.stats.activeUnitChanges += 1;
  }
  textureFor(source, material) {
    if (this.cache.has(source)) {
      this.stats.cacheHits += 1;
      return this.cache.get(source);
    }
    this.stats.uploadAttempts += 1;
    const texture2 = this.gl.createTexture();
    const width = sourceWidth(source);
    const height = sourceHeight(source);
    const powerOfTwo = isPowerOfTwo(width) && isPowerOfTwo(height);
    try {
      this.upload(texture2, source, powerOfTwo, material);
      this.cache.set(source, texture2);
      this.stats.uploads += 1;
      recordGpuTextureUpload(this.stats, material, width, height, powerOfTwo);
      return texture2;
    } catch (error) {
      this.stats.uploadFailures += 1;
      this.stats.lastError = error?.message || String(error);
      this.gl.deleteTexture?.(texture2);
      throw error;
    }
  }
  upload(texture2, source, powerOfTwo, material) {
    const gl = this.gl;
    this.activateUnit(0);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    this.boundTextures.set(0, texture2);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    if (powerOfTwo) gl.generateMipmap(gl.TEXTURE_2D);
    setTextureParameters(
      gl,
      powerOfTwo ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR,
      gl.LINEAR,
      powerOfTwo ? gl.REPEAT : gl.CLAMP_TO_EDGE
    );
    this.applyAnisotropy(material);
  }
  applyAnisotropy(material) {
    if (!this.anisotropy || material?.anisotropy === false) return;
    const gl = this.gl;
    const maximum = gl.getParameter(this.anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 4;
    const requested = material?.anisotropy === true ? 4 : Number(material?.anisotropy || 2);
    gl.texParameterf(
      gl.TEXTURE_2D,
      this.anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,
      Math.min(requested, maximum)
    );
  }
  diagnostics() {
    return gpuTextureDiagnostics(this.stats);
  }
};

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-layered-texture-binder.js
var LayeredTextureBinder = class {
  constructor(textureCache) {
    this.textureCache = textureCache;
    this.layerCapacity = terrainLayerCapacity(textureCache.gl);
    this.layerUnits = terrainLayerUnits(this.layerCapacity);
  }
  bind(locations, material, layers, stats3) {
    if (!layers.length) return;
    const uniforms = locations.terrainLayers || [];
    for (let index = 0; index < uniforms.length; index += 1) {
      this.bindLayer(
        uniforms[index],
        material,
        layers[index],
        this.layerUnits[index]
      );
    }
    const available = Math.min(uniforms.length, this.layerCapacity);
    const ready = layers.slice(0, available).filter((layer) => layer.ready).length;
    stats3.terrainLayerCapacity = available;
    stats3.terrainLayerLogicalCount = material.textureLayers?.length || 0;
    stats3.terrainLayerTextures = Math.max(stats3.terrainLayerTextures || 0, ready);
  }
  bindLayer(uniforms = {}, material, layer, unit) {
    const cache3 = this.textureCache;
    const ready = Boolean(layer?.ready && Number.isFinite(unit));
    const texture2 = ready ? cache3.textureFor(layer.image, material) : cache3.defaultTexture;
    if (Number.isFinite(unit)) cache3.bind(unit, uniforms.map, texture2);
    if (uniforms.use) cache3.gl.uniform1i(uniforms.use, ready ? 1 : 0);
    if (uniforms.repeat) {
      cache3.gl.uniform2f(uniforms.repeat, layer?.repeat0 || 1, layer?.repeat1 || 1);
    }
    if (uniforms.strength) cache3.gl.uniform1f(uniforms.strength, layer?.strength || 0);
    if (uniforms.angle) cache3.gl.uniform1f(uniforms.angle, layer?.angle || 0);
    if (uniforms.zones) cache3.gl.uniform4fv(uniforms.zones, layer?.zones || [1, 1, 1, 1]);
    if (uniforms.slope) cache3.gl.uniform2fv(uniforms.slope, layer?.slope || [0, 1]);
    if (uniforms.height) {
      cache3.gl.uniform2fv(uniforms.height, layer?.height || [-1e4, 1e4]);
    }
    if (uniforms.wetness) cache3.gl.uniform1f(uniforms.wetness, layer?.wetness || 0);
  }
};

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-texture-stats.js
function addMapStats(material, stats3) {
  stats3.texturedMeshes = (stats3.texturedMeshes || 0) + 1;
  stats3.textureUrl = material?.textureUrl || material.mapImage.src || material.mapImage.dataset?.url || "generated-canvas";
  stats3.textureSize = `${sourceWidth(material.mapImage)}x${sourceHeight(material.mapImage)}`;
  stats3.textureRepeat = material?.mapRepeat || [1, 1];
  stats3.textureAnisotropy = material?.anisotropy ?? true;
  stats3.texturePolicy = material?.texturePolicy || null;
}
function addMixStats(material, stats3) {
  const mapRepeat = material?.mapRepeat || [1, 1];
  const mixRepeat = material?.mixRepeat || [1, 1];
  stats3.mixedTerrain = true;
  stats3.mixTextureUrl = material?.mixTextureUrl || material.mixImage.src || material.mixImage.dataset?.url || "generated-canvas";
  stats3.mixTextureSize = `${sourceWidth(material.mixImage)}x${sourceHeight(material.mixImage)}`;
  stats3.mixRepeat = mixRepeat;
  stats3.mixStrength = material?.mixStrength ?? 0;
  stats3.mixPatchScale = material?.mixPatchScale ?? 0;
  stats3.mixMapRepeatMatches = mapRepeat[0] === mixRepeat[0] && mapRepeat[1] === mixRepeat[1];
  stats3.mixShaderFunction = "mix()-world-space-patches";
}

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-render-textures.js
var MaterialTextureBinder = class {
  constructor(gl) {
    this.gl = gl;
    this.gpu = new GpuTextureCache(gl);
    this.layers = new LayeredTextureBinder(this.gpu);
    this.previous = null;
    this.skips = 0;
    this.uploads = 0;
  }
  invalidate() {
    this.previous = null;
  }
  bind(locations, material = {}, stats3) {
    const state = textureState(material);
    if (state.mapReady) addMapStats(material, stats3);
    if (state.mixReady) addMixStats(material, stats3);
    if (sameTextureState(this.previous, state)) {
      this.skips += 1;
      stats3.textureStateSkips = (stats3.textureStateSkips || 0) + 1;
      return;
    }
    this.previous = state;
    this.uploads += 1;
    stats3.textureStateUploads = (stats3.textureStateUploads || 0) + 1;
    this.bindMap(locations, material, state);
    this.bindMix(locations, material, state);
    this.layers.bind(locations, material, state.layers, stats3);
  }
  bindMap(locations, material, state) {
    const texture2 = state.mapReady ? this.gpu.textureFor(state.mapImage, material) : this.gpu.defaultTexture;
    this.gpu.bind(1, locations.map, texture2);
    this.gl.uniform1i(locations.useMap, state.mapReady ? 1 : 0);
    this.gl.uniform2f(locations.mapRepeat, state.mapRepeat0, state.mapRepeat1);
  }
  bindMix(locations, material, state) {
    const texture2 = state.mixReady ? this.gpu.textureFor(state.mixImage, material) : this.gpu.defaultTexture;
    this.gpu.bind(2, locations.mixMap, texture2);
    this.gl.uniform1i(locations.useMixMap, state.mixReady ? 1 : 0);
    this.gl.uniform2f(locations.mixRepeat, state.mixRepeat0, state.mixRepeat1);
    this.gl.uniform1f(locations.mixStrength, state.mixStrength);
    if (locations.mixPatchScale) this.gl.uniform1f(locations.mixPatchScale, state.patchScale);
    if (locations.mixPatchSharpness) {
      this.gl.uniform1f(locations.mixPatchSharpness, state.patchSharpness);
    }
  }
  diagnostics() {
    return {
      gpu: this.gpu.diagnostics(),
      layerCapacity: this.layers.layerCapacity,
      layerUnits: [...this.layers.layerUnits],
      stateSkips: this.skips,
      stateUploads: this.uploads
    };
  }
};

// geelooy/games/mitzvahWorld/experiments/light-three-gltf/tiny-webgl-renderer.js
var TinyWebGLRenderer = class {
  constructor({ canvas, alpha = true, antialias = true } = {}) {
    if (!canvas) throw new Error("TinyWebGLRenderer requires a canvas.");
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl", {
      alpha,
      antialias,
      premultipliedAlpha: true
    });
    if (!this.gl) throw new Error("WebGL is not available.");
    this.errors = [];
    this.glStateCache = installRendererStateCache(this);
    this.options = defaultRenderOptions();
    this.identityMatrix = identity();
    this.frameToken = 0;
    this.clearColor = [0.36, 0.56, 0.72, 1];
    this.interactor = { x: 0, y: 0, z: 0 };
    this.frameCameraPosition = { x: 0, y: 0, z: 0 };
    this.timeSeconds = 0;
    this.environment = defaultEnvironment();
    initializeRendererPrograms(this);
    this.buffers = new RenderBufferCache(this.gl, this.glStateCache);
    this.textures = new MaterialTextureBinder(this.gl);
    this.materialState = new RenderMaterialState();
    this.stats = createInitialRendererStats();
  }
  setSize(width, height) {
    this.canvas.width = Math.max(1, Math.floor(width));
    this.canvas.height = Math.max(1, Math.floor(height));
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
  setClearColor(red, green, blue, alpha = 1) {
    this.clearColor = [red, green, blue, alpha];
  }
  setInteractor(position, timeSeconds = performance.now() / 1e3) {
    this.interactor = {
      x: position?.x || 0,
      y: position?.renderY ?? position?.y ?? 0,
      z: position?.z || 0
    };
    this.timeSeconds = timeSeconds;
  }
  setEnvironment(values = {}) {
    for (const key of ["ambient", "sunDirection", "sunColor", "fogColor"]) {
      if (values[key]) this.environment[key] = [...values[key]];
    }
    for (const key of ["fogNear", "fogFar", "exposure"]) {
      if (Number.isFinite(values[key])) this.environment[key] = values[key];
    }
  }
  render(scene, camera) {
    renderFrame(this, scene, camera);
  }
  dispose() {
    this.buffers?.dispose?.();
    for (const program of new Set(Object.values(this.programs || {}))) {
      this.gl.deleteProgram(program);
    }
    if (this.skinTexture) this.gl.deleteTexture(this.skinTexture);
    this.glStateCache?.restore?.();
  }
};
function defaultEnvironment() {
  return {
    ambient: [0.2, 0.23, 0.25],
    sunDirection: [-0.42, 0.76, 0.49],
    sunColor: [1.26, 0.94, 0.68],
    fogColor: [0.52, 0.66, 0.72],
    fogNear: 145,
    fogFar: 560,
    exposure: 1.04
  };
}
function installRendererStateCache(renderer) {
  try {
    return installGlStateCache(renderer.gl);
  } catch (error) {
    renderer.errors.push(`WebGL state cache unavailable: ${error.message}`);
    return null;
  }
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraClipSystem.js
function desiredCameraEye(target, yaw, pitch, distanceValue) {
  const cosine = Math.cos(pitch);
  return {
    x: target.x - Math.sin(yaw) * distanceValue * cosine,
    y: target.y + Math.sin(pitch) * distanceValue,
    z: target.z - Math.cos(yaw) * distanceValue * cosine
  };
}
function clipCameraEye(target, desired, octree, minimumSafe) {
  if (!octree) {
    return { eye: desired, hit: null };
  }
  const direction = {
    x: desired.x - target.x,
    y: desired.y - target.y,
    z: desired.z - target.z
  };
  const length2 = Math.hypot(direction.x, direction.y, direction.z) || 1;
  const hit = octree.raycast(new Ray(target, direction), length2);
  if (!hit) {
    return { eye: desired, hit: null };
  }
  const safe = Math.max(minimumSafe, hit.distance - 0.42);
  return {
    eye: {
      x: target.x + direction.x / length2 * safe,
      y: target.y + direction.y / length2 * safe,
      z: target.z + direction.z / length2 * safe
    },
    hit
  };
}
function buildCameraStats(context, target, clipped, distanceValue) {
  return {
    mode: context.mode,
    target,
    position: clipped.eye,
    distance: distanceValue,
    hitKind: clipped.hit?.item?.kind || clipped.hit?.kind || null,
    ceilingHit: (clipped.hit?.item?.kind || clipped.hit?.kind || "").includes("ceiling"),
    wallHit: !!clipped.hit,
    activeHouse: context.activeHouse,
    activeFloor: context.activeFloor,
    stairId: context.stairId
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraClipCache.js
var DEFAULT_REUSE_FRAMES = 2;
var TARGET_REFRESH_DISTANCE = 0.72;
var DESIRED_REFRESH_DISTANCE = 1.05;
var DIRECTION_REFRESH_RADIANS = 0.085;
var CameraClipCache = class {
  constructor(options = {}) {
    this.maximumReuseFrames = options.maximumReuseFrames ?? DEFAULT_REUSE_FRAMES;
    this.entry = null;
    this.stats = { hits: 0, misses: 0, revisionInvalidations: 0 };
  }
  resolve(target, desired, octree, minimumSafe) {
    if (this.shouldRefresh(target, desired, octree)) {
      return this.refresh(target, desired, octree, minimumSafe);
    }
    this.entry.reusedFrames += 1;
    this.stats.hits += 1;
    return {
      cached: true,
      eye: eyeAtDistance(target, desired, this.entry.safeDistance),
      hit: this.entry.hit
    };
  }
  clear() {
    this.entry = null;
  }
  diagnostics() {
    return Object.freeze({
      ...this.stats,
      maximumReuseFrames: this.maximumReuseFrames,
      reusedFrames: this.entry?.reusedFrames || 0
    });
  }
  shouldRefresh(target, desired, octree) {
    if (!this.entry) return true;
    if (this.entry.octree !== octree) return true;
    if (this.entry.revision !== collisionRevisionFor3(octree)) {
      this.stats.revisionInvalidations += 1;
      return true;
    }
    if (this.entry.reusedFrames >= this.maximumReuseFrames) return true;
    if (distance2(target, this.entry.target) > TARGET_REFRESH_DISTANCE) return true;
    if (distance2(desired, this.entry.desired) > DESIRED_REFRESH_DISTANCE) return true;
    return directionAngle(target, desired, this.entry.target, this.entry.desired) > DIRECTION_REFRESH_RADIANS;
  }
  refresh(target, desired, octree, minimumSafe) {
    const resolved = clipCameraEye(target, desired, octree, minimumSafe);
    this.entry = {
      desired: copyPoint(desired),
      hit: resolved.hit,
      octree,
      reusedFrames: 0,
      revision: collisionRevisionFor3(octree),
      safeDistance: distance2(target, resolved.eye),
      target: copyPoint(target)
    };
    this.stats.misses += 1;
    return { ...resolved, cached: false };
  }
};
function eyeAtDistance(target, desired, safeDistance) {
  const direction = subtract(desired, target);
  const length2 = Math.hypot(direction.x, direction.y, direction.z) || 1;
  const distanceValue = Math.min(length2, safeDistance);
  return {
    x: target.x + direction.x / length2 * distanceValue,
    y: target.y + direction.y / length2 * distanceValue,
    z: target.z + direction.z / length2 * distanceValue
  };
}
function directionAngle(firstTarget, firstEye, secondTarget, secondEye) {
  const first = normalized(subtract(firstEye, firstTarget));
  const second = normalized(subtract(secondEye, secondTarget));
  const dot4 = Math.max(-1, Math.min(1, first.x * second.x + first.y * second.y + first.z * second.z));
  return Math.acos(dot4);
}
function collisionRevisionFor3(octree) {
  return octree?.revision === void 0 ? "revision:none" : String(octree.revision);
}
function distance2(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y, first.z - second.z);
}
function normalized(point3) {
  const length2 = Math.hypot(point3.x, point3.y, point3.z) || 1;
  return { x: point3.x / length2, y: point3.y / length2, z: point3.z / length2 };
}
function subtract(first, second) {
  return { x: first.x - second.x, y: first.y - second.y, z: first.z - second.z };
}
function copyPoint(point3) {
  return { x: point3.x, y: point3.y, z: point3.z };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraGestureMath.js
var MAXIMUM_CAMERA_PITCH = 1.42;
var MINIMUM_CAMERA_PITCH = -1.35;
function cameraLookAngles(yaw, pitch, deltaX, deltaY, options = {}) {
  const yawSensitivity = Number(options.yawSensitivity ?? 26e-4);
  const pitchSensitivity = Number(options.pitchSensitivity ?? 24e-4);
  return {
    pitch: clampCameraPitch(Number(pitch) + Number(deltaY) * pitchSensitivity),
    yaw: Number(yaw) - Number(deltaX) * yawSensitivity
  };
}
function clampCameraPitch(value3) {
  return clamp3(Number(value3), MINIMUM_CAMERA_PITCH, MAXIMUM_CAMERA_PITCH);
}
function cameraPointerPoint(event) {
  return {
    x: Number(event.clientX) || 0,
    y: Number(event.clientY) || 0
  };
}
function cameraPointerDistance(first, second) {
  return Math.hypot(first.x - second.x, first.y - second.y);
}
function boundedCameraDistance(value3, minimum, maximum) {
  return clamp3(Number(value3), Number(minimum), Number(maximum));
}
function clamp3(value3, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value3));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraLegacyZoom.js
function applyLegacyWheelZoom(orbit, event) {
  event.preventDefault();
  if (orbit.isFirstPerson?.()) {
    return;
  }
  const next = orbit.distance * Math.exp(event.deltaY * 1e-3);
  orbit.distance = boundedCameraDistance(next, orbit.min, orbit.max);
}
function beginLegacyPinch(orbit, pointers) {
  if (orbit.isFirstPerson?.() || pointers.size < 2) {
    return null;
  }
  const [first, second] = [...pointers.values()];
  return {
    cameraDistance: orbit.distance,
    distance: cameraPointerDistance(first, second)
  };
}
function updateLegacyPinch(orbit, pointers, pinch) {
  if (orbit.isFirstPerson?.() || pointers.size < 2) {
    return pinch;
  }
  const state = pinch || beginLegacyPinch(orbit, pointers);
  const [first, second] = [...pointers.values()];
  const current = Math.max(18, cameraPointerDistance(first, second));
  const next = state.cameraDistance * state.distance / current;
  orbit.distance = boundedCameraDistance(next, orbit.min, orbit.max);
  return state;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraGestureController.js
var CameraGestureController = class {
  constructor(canvas, orbit) {
    this.canvas = canvas;
    this.orbit = orbit;
    this.pointers = /* @__PURE__ */ new Map();
    this.drag = null;
    this.pinch = null;
    this.bind();
  }
  bind() {
    this.canvas.style.touchAction = "none";
    this.canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    this.canvas.addEventListener("dblclick", () => this.canvas.requestPointerLock?.());
    this.canvas.addEventListener("pointerdown", (event) => this.down(event));
    this.canvas.addEventListener("pointermove", (event) => this.move(event));
    this.canvas.addEventListener("pointerup", (event) => this.up(event));
    this.canvas.addEventListener("pointercancel", (event) => this.up(event));
    this.canvas.addEventListener("wheel", (event) => {
      applyLegacyWheelZoom(this.orbit, event);
    }, { passive: false });
  }
  down(event) {
    this.canvas.setPointerCapture?.(event.pointerId);
    this.pointers.set(event.pointerId, cameraPointerPoint(event));
    if (this.pointers.size > 1) {
      this.pinch = beginLegacyPinch(this.orbit, this.pointers);
      return;
    }
    this.beginDrag(event);
  }
  up(event) {
    this.pointers.delete(event.pointerId);
    this.drag = null;
    this.pinch = null;
  }
  move(event) {
    if (document.pointerLockElement === this.canvas) {
      this.applyLook(event.movementX || 0, event.movementY || 0);
      return;
    }
    if (!this.pointers.has(event.pointerId)) {
      return;
    }
    this.pointers.set(event.pointerId, cameraPointerPoint(event));
    if (this.pointers.size > 1) {
      this.pinch = updateLegacyPinch(
        this.orbit,
        this.pointers,
        this.pinch
      );
      return;
    }
    this.updateDrag(event);
  }
  beginDrag(event) {
    this.drag = {
      buttons: event.buttons || 0,
      pitch: this.orbit.pitch,
      x: event.clientX,
      y: event.clientY,
      yaw: this.orbit.yaw
    };
  }
  updateDrag(event) {
    this.drag ||= {
      buttons: event.buttons || 1,
      pitch: this.orbit.pitch,
      x: event.clientX,
      y: event.clientY,
      yaw: this.orbit.yaw
    };
    if (!((event.buttons || this.drag.buttons) & 3)) {
      return;
    }
    this.orbit.yaw = this.drag.yaw - (event.clientX - this.drag.x) * 7e-3;
    this.orbit.pitch = clampCameraPitch(
      this.drag.pitch + (event.clientY - this.drag.y) * 6e-3
    );
  }
  applyLook(deltaX, deltaY) {
    const angles = cameraLookAngles(
      this.orbit.yaw,
      this.orbit.pitch,
      deltaX,
      deltaY
    );
    this.orbit.yaw = angles.yaw;
    this.orbit.pitch = angles.pitch;
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/camera/FirstPersonCameraPose.js
var DEFAULT_LOOK_DISTANCE = 100;
var DEFAULT_FORWARD_OFFSET = 0.24;
var MAXIMUM_PITCH = 1.42;
function firstPersonLookVector(yaw, pitch) {
  const safePitch = clamp4(Number(pitch) || 0, -MAXIMUM_PITCH, MAXIMUM_PITCH);
  const cosine = Math.cos(safePitch);
  return {
    x: Math.sin(Number(yaw) || 0) * cosine,
    y: -Math.sin(safePitch),
    z: Math.cos(Number(yaw) || 0) * cosine
  };
}
function firstPersonCameraPose(anchor2, yaw, pitch, options = {}) {
  const direction = firstPersonLookVector(yaw, pitch);
  const forwardOffset = finiteOr(options.forwardOffset, DEFAULT_FORWARD_OFFSET);
  const lookDistance = finiteOr(options.lookDistance, DEFAULT_LOOK_DISTANCE);
  const eye = {
    x: Number(anchor2.x) + Math.sin(Number(yaw) || 0) * forwardOffset,
    y: Number(anchor2.y),
    z: Number(anchor2.z) + Math.cos(Number(yaw) || 0) * forwardOffset
  };
  return {
    direction,
    eye,
    target: {
      x: eye.x + direction.x * lookDistance,
      y: eye.y + direction.y * lookDistance,
      z: eye.z + direction.z * lookDistance
    }
  };
}
function finiteOr(value3, fallback) {
  return Number.isFinite(Number(value3)) ? Number(value3) : fallback;
}
function clamp4(value3, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value3));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/camera/LegacyOrbitCameraPose.js
function applyLegacyOrbitCamera(options) {
  const blend = Math.min(1, options.deltaTime * 7);
  const targetDistance = Math.min(
    options.distance,
    options.context.profile.maxDistance
  );
  const currentDistance = options.currentDistance + (targetDistance - options.currentDistance) * blend;
  const currentTargetLift = options.currentTargetLift + (options.context.profile.targetLift - options.currentTargetLift) * blend;
  const adjustedTarget = {
    ...options.target,
    y: options.target.y + currentTargetLift
  };
  const pitch = clamp5(
    options.pitch + options.context.profile.pitchBias,
    -1.35,
    1.42
  );
  const desired = desiredCameraEye(
    adjustedTarget,
    options.yaw,
    pitch,
    currentDistance
  );
  const clipped = resolveClip(options, adjustedTarget, desired);
  options.camera.position.set(clipped.eye.x, clipped.eye.y, clipped.eye.z);
  options.camera.target = [adjustedTarget.x, adjustedTarget.y, adjustedTarget.z];
  return {
    currentDistance,
    currentTargetLift,
    stats: {
      ...buildCameraStats(
        options.context,
        adjustedTarget,
        clipped,
        currentDistance
      ),
      clipCache: options.clipCache?.diagnostics?.() || null
    }
  };
}
function resolveClip(options, target, desired) {
  if (options.clipCache) {
    return options.clipCache.resolve(
      target,
      desired,
      options.octree,
      options.context.profile.minSafe
    );
  }
  return clipCameraEye(
    target,
    desired,
    options.octree,
    options.context.profile.minSafe
  );
}
function clamp5(value3, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value3));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraProfileSystem.js
var CAMERA_PROFILES = Object.freeze({
  outdoor: Object.freeze({ maxDistance: 220, targetLift: 0, pitchBias: 0, minSafe: 0.75 }),
  indoor: Object.freeze({ maxDistance: 10.5, targetLift: 1.05, pitchBias: -0.04, minSafe: 0.9 }),
  stairs: Object.freeze({ maxDistance: 8.5, targetLift: 1.55, pitchBias: 0.08, minSafe: 1.05 })
});
function resolveCameraContext(state, houses = [], stairs = []) {
  for (const house2 of houses) {
    const local = worldToHouse(house2, state.x, state.z);
    const inside = Math.abs(local.x) < house2.width / 2 - house2.wallThickness && Math.abs(local.z) < house2.depth / 2 - house2.wallThickness && state.y >= house2.floorY - 0.5 && state.y <= house2.floorY + house2.wallHeight + 2;
    if (!inside) {
      continue;
    }
    const activeFloor = Math.max(0, Math.min(
      house2.floors - 1,
      Math.floor((state.y - house2.floorY) / house2.storyHeight)
    ));
    const stair = stairs.find((layout) => layout.houseId === house2.id && containsStair(layout, local));
    return {
      mode: stair ? "stairs" : "indoor",
      profile: CAMERA_PROFILES[stair ? "stairs" : "indoor"],
      activeHouse: house2.id,
      activeFloor,
      local,
      stairId: stair?.id || null
    };
  }
  return {
    mode: "outdoor",
    profile: CAMERA_PROFILES.outdoor,
    activeHouse: null,
    activeFloor: null,
    local: null,
    stairId: null
  };
}
function containsStair(layout, local) {
  const zValues = layout.steps.map((step2) => step2.centerZ);
  zValues.push(layout.lowerLanding.centerZ);
  const minimumZ = Math.min(...zValues) - layout.treadDepth;
  const maximumZ = Math.max(...zValues) + layout.lowerLanding.depth / 2;
  return Math.abs(local.x - layout.opening.centerX) <= layout.width / 2 + 1.1 && local.z >= minimumZ && local.z <= maximumZ;
}
function worldToHouse(house2, x, z) {
  const dx = x - house2.x;
  const dz = z - house2.z;
  const cosine = Math.cos(house2.yaw);
  const sine = Math.sin(house2.yaw);
  return {
    x: dx * cosine + dz * sine,
    z: -dx * sine + dz * cosine
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/camera/CameraOrbitController.js
var CameraOrbitController = class {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.mode = options.mode || "orbit";
    this.distance = options.distance ?? 7;
    this.eyeForward = options.eyeForward ?? 0.24;
    this.pitch = options.pitch ?? 0.34;
    this.yaw = options.yaw ?? Math.PI;
    this.min = options.min ?? 1.35;
    this.max = options.max ?? 48;
    this.currentDistance = this.distance;
    this.currentTargetLift = 0;
    this.spatial = { state: null, houses: [], stairs: [] };
    this.stats = { mode: this.mode };
    this.clipCache = new CameraClipCache(options.clipCache);
    this.gestures = new CameraGestureController(canvas, this);
  }
  setSpatialContext(context = {}) {
    this.spatial = { ...this.spatial, ...context };
    return this;
  }
  setMode(mode) {
    if (!["firstPerson", "orbit"].includes(mode)) {
      throw new Error(`Unknown camera mode: ${mode}`);
    }
    if (mode === "orbit" && this.isFirstPerson()) {
      this.currentDistance = Math.max(this.min, this.eyeForward);
    }
    this.mode = mode;
    this.clipCache.clear();
    return this;
  }
  isFirstPerson() {
    return this.mode === "firstPerson";
  }
  forward() {
    return { x: Math.sin(this.yaw), z: Math.cos(this.yaw) };
  }
  right() {
    return { x: Math.cos(this.yaw), z: -Math.sin(this.yaw) };
  }
  apply(camera, target, octree, deltaTime = 1 / 60) {
    const context = resolveCameraContext(
      this.spatial.state || target,
      this.spatial.houses,
      this.spatial.stairs
    );
    if (this.isFirstPerson()) {
      this.applyFirstPerson(camera, target, context);
      return;
    }
    this.applyOrbit(camera, target, octree, deltaTime, context);
  }
  applyFirstPerson(camera, target, context) {
    const pose = firstPersonCameraPose(target, this.yaw, this.pitch, {
      forwardOffset: this.eyeForward
    });
    camera.position.set(pose.eye.x, pose.eye.y, pose.eye.z);
    camera.target = [pose.target.x, pose.target.y, pose.target.z];
    this.currentDistance = this.eyeForward;
    this.currentTargetLift = 0;
    this.stats = {
      activeFloor: context.activeFloor,
      activeHouse: context.activeHouse,
      distance: this.eyeForward,
      mode: "first-person",
      pitch: this.pitch,
      position: pose.eye,
      stairId: context.stairId,
      target: pose.target,
      yaw: this.yaw
    };
  }
  applyOrbit(camera, target, octree, deltaTime, context) {
    const result = applyLegacyOrbitCamera({
      camera,
      clipCache: this.clipCache,
      context,
      currentDistance: this.currentDistance,
      currentTargetLift: this.currentTargetLift,
      deltaTime,
      distance: this.distance,
      octree,
      pitch: this.pitch,
      target,
      yaw: this.yaw
    });
    this.currentDistance = result.currentDistance;
    this.currentTargetLift = result.currentTargetLift;
    this.stats = { ...result.stats, mode: "third-person" };
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/input/JumpButton.js
var JumpButton = class {
  constructor(host) {
    this.host = host || makeHost4();
    this.queued = false;
    this.held = false;
    this.build();
  }
  build() {
    this.button = document.createElement("button");
    this.button.className = "Awtsmoos-jump-button";
    this.button.type = "button";
    this.button.textContent = "\u2B06\uFE0F";
    this.button.setAttribute("aria-label", "Jump");
    this.host.append(this.button);
    this.bind();
  }
  bind() {
    this.button.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      this.held = true;
      this.queued = true;
      this.button.setPointerCapture?.(e.pointerId);
    });
    this.button.addEventListener("pointerup", () => {
      this.held = false;
    });
    this.button.addEventListener("pointercancel", () => {
      this.held = false;
    });
    addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (!this.held) this.queued = true;
        this.held = true;
      }
    });
    addEventListener("keyup", (e) => {
      if (e.code === "Space") this.held = false;
    });
  }
  consume() {
    const out = this.queued;
    this.queued = false;
    return out;
  }
};
function makeHost4() {
  const host = document.createElement("div");
  host.id = "jump";
  document.body.append(host);
  return host;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/input/MobileJoystick.js
var MobileJoystick = class {
  constructor(host) {
    this.host = host;
    this.vector = { x: 0, y: 0, magnitude: 0 };
    this.active = false;
    this.build();
  }
  build() {
    this.base = document.createElement("div");
    this.knob = document.createElement("div");
    this.base.className = "Awtsmoos-joy-base";
    this.knob.className = "Awtsmoos-joy-knob";
    this.base.append(this.knob);
    this.host.append(this.base);
    this.bind();
  }
  bind() {
    this.base.addEventListener("pointerdown", (e) => this.start(e));
    this.base.addEventListener("pointermove", (e) => this.move(e));
    this.base.addEventListener("pointerup", () => this.end());
    this.base.addEventListener("pointercancel", () => this.end());
  }
  start(e) {
    this.active = true;
    this.base.setPointerCapture?.(e.pointerId);
    this.move(e);
  }
  move(e) {
    if (!this.active) return;
    const r = this.base.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = e.clientX - cx, dy = e.clientY - cy;
    const d = Math.hypot(dx, dy), m = Math.min(1, d / 54);
    const nx = d ? dx / d : 0, ny = d ? dy / d : 0;
    this.vector = { x: nx, y: ny, magnitude: m };
    this.knob.style.transform = `translate(${nx * m * 38}px, ${ny * m * 38}px)`;
  }
  end() {
    this.active = false;
    this.vector = { x: 0, y: 0, magnitude: 0 };
    this.knob.style.transform = "translate(0,0)";
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/input/UiEventSystem.js
var UiEventSystem = class {
  constructor(target = window) {
    this.target = target;
    this.keys = /* @__PURE__ */ new Set();
    this.buttons = 0;
    this.pointer = emptyPointer();
  }
  install(bus) {
    addEventListener("keydown", (event) => this.key(event, true, bus));
    addEventListener("keyup", (event) => this.key(event, false, bus));
    this.target.addEventListener("contextmenu", (event) => event.preventDefault());
    this.target.addEventListener("pointerdown", (event) => this.pointerEvent(event, true, bus));
    this.target.addEventListener("pointermove", (event) => {
      this.pointerEvent(event, this.pointer.down, bus);
    });
    this.target.addEventListener("pointerup", (event) => this.pointerEvent(event, false, bus));
    this.target.addEventListener("pointercancel", (event) => this.pointerEvent(event, false, bus));
    return this;
  }
  key(event, down, bus) {
    if (down) {
      this.keys.add(event.code);
    } else {
      this.keys.delete(event.code);
    }
    bus.emit("input:key", this.state());
  }
  pointerEvent(event, down, bus) {
    this.buttons = event.buttons ?? (down ? 1 << (event.button || 0) : 0);
    const previous = this.pointer;
    const left = (this.buttons & 1) !== 0;
    const right = (this.buttons & 2) !== 0;
    const middle = (this.buttons & 4) !== 0;
    this.pointer = {
      bothMain: left && right,
      down: down || this.buttons !== 0,
      left,
      middle,
      mode: pointerMode(left, right, middle),
      movementX: event.movementX ?? event.clientX - previous.x,
      movementY: event.movementY ?? event.clientY - previous.y,
      right,
      x: event.clientX,
      y: event.clientY
    };
    bus.emit("input:pointer", this.pointer);
  }
  axis() {
    return {
      turn: keySign(this.keys, "KeyA", "KeyD") + keySign(this.keys, "ArrowRight", "ArrowLeft"),
      x: keySign(this.keys, "KeyE", "KeyQ"),
      y: keySign(this.keys, "KeyS", "KeyW") + (this.pointer.bothMain ? -1 : 0)
    };
  }
  state() {
    return {
      axis: this.axis(),
      controlScheme: {
        look: "mouse, touch, reversed A/D, or left/right arrows",
        move: "W/S forward and backward",
        pointerLock: "double-click the world",
        strafe: "Q/E"
      },
      keys: [...this.keys],
      pointer: this.pointer
    };
  }
};
function emptyPointer() {
  return {
    bothMain: false,
    down: false,
    left: false,
    middle: false,
    mode: "hover",
    movementX: 0,
    movementY: 0,
    right: false,
    x: 0,
    y: 0
  };
}
function pointerMode(left, right, middle) {
  if (left && right) {
    return "forward-look";
  }
  if (left || right) {
    return "first-person-look";
  }
  if (middle) {
    return "auxiliary";
  }
  return "hover";
}
function keySign(keys, positive, negative) {
  return (keys.has(positive) ? 1 : 0) - (keys.has(negative) ? 1 : 0);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodControllerMath.js
function desiredLodVisibility({
  currentlyVisible,
  alwaysVisible,
  distance: distance4,
  maximumDistance,
  hysteresis = 0.12
}) {
  if (alwaysVisible || maximumDistance === Infinity) return true;
  const margin = Math.max(0, Math.min(0.49, hysteresis));
  const threshold = currentlyVisible ? maximumDistance * (1 + margin) : maximumDistance * (1 - margin);
  return distance4 <= threshold;
}
function lodSphereDistance(position, center, radius = 0) {
  return Math.max(0, Math.hypot(
    finiteLodNumber(position?.x) - finiteLodNumber(center?.x),
    finiteLodNumber(position?.y) - finiteLodNumber(center?.y),
    finiteLodNumber(position?.z) - finiteLodNumber(center?.z)
  ) - Math.max(0, finiteLodNumber(radius)));
}
function lodTransitionPriority(visible, distance4) {
  return visible ? 1e5 - distance4 : distance4;
}
function createInitialLodStats() {
  return {
    registered: 0,
    events: 0,
    evaluations: 0,
    transitions: 0,
    lastTier: null,
    lastEventKey: null
  };
}
function finiteLodNumber(value3, fallback = 0) {
  return Number.isFinite(value3) ? value3 : fallback;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodPolicy.js
var CLASS_ALIASES = Object.freeze({
  architecture: "building",
  creature: "actor",
  mountain: "terrain"
});
var CLASS_POLICIES = Object.freeze({
  actor: policy(Infinity, 100, true),
  terrain: policy(Infinity, 100, true),
  water: policy(260, 90, true),
  sky: policy(Infinity, 100, true),
  landmark: policy(Infinity, 100, true),
  building: policy(190, 80, false),
  vegetation: policy(130, 35, false),
  grass: policy(46, 12, false),
  detail: policy(58, 20, false),
  edge: policy(72, 18, false),
  other: policy(145, 45, false)
});
function normalizeLodClass(className = "other") {
  const normalized3 = CLASS_ALIASES[className] || className;
  return CLASS_POLICIES[normalized3] ? normalized3 : "other";
}
function inferLodClass(name = "", metadata = {}) {
  if (metadata?.AwtsmoosLod?.className) {
    return normalizeLodClass(metadata.AwtsmoosLod.className);
  }
  if (metadata?.AwtsmoosYardGrass) return "grass";
  if (metadata?.AwtsmoosFence) return "edge";
  const text3 = String(name).toLowerCase();
  if (matches(text3, /(visible_player|clickable_chossid|player|npc|actor|creature|armature|skeleton|bone)/)) return "actor";
  if (matches(text3, /(terrain|ground|mountain|valley|road|path)/)) return "terrain";
  if (matches(text3, /(water|stream|lake|river|foam|reed)/)) return "water";
  if (matches(text3, /(sky|sun|cloud|horizon|atmosphere)/)) return "sky";
  if (matches(text3, /(shul|market|chabad|bridge|sign|beis|synagogue)/)) return "landmark";
  if (matches(text3, /(grass|flower|garden|petal|tuft)/)) return "grass";
  if (matches(text3, /(forest|tree|branch|leaf|bark|shrub|bush)/)) return "vegetation";
  if (matches(text3, /(edge|outline|trim|ornament|railing|fence)/)) return "edge";
  if (matches(text3, /(lantern|lamp|bench|crate|barrel|well|gazebo|prop)/)) return "detail";
  if (matches(text3, /(house|cottage|roof|wall|door|window|chimney|balcony|porch)/)) return "building";
  return "other";
}
function lodClassPolicy(className) {
  return CLASS_POLICIES[normalizeLodClass(className)];
}
function lodMaximumDistance(className, tierName = "high") {
  const normalizedClass = normalizeLodClass(className);
  const classPolicy = lodClassPolicy(normalizedClass);
  if (classPolicy.protected || classPolicy.maximumDistance === Infinity) return Infinity;
  const tier2 = qualityTier(tierName);
  const scale2 = normalizedClass === "vegetation" || normalizedClass === "grass" ? tier2.vegetationDistanceScale : tier2.decorativeDistanceScale;
  return classPolicy.maximumDistance * scale2;
}
function policy(maximumDistance, importance, protectedObject) {
  return Object.freeze({ maximumDistance, importance, protected: protectedObject });
}
function matches(text3, pattern) {
  return pattern.test(text3);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodSpatialKey.js
var TAU2 = Math.PI * 2;
function lodSpatialKey({
  position,
  yaw = 0,
  cellSize = 12,
  sectorCount = 16
}) {
  return {
    cellX: quantize(position?.x, cellSize),
    cellY: quantize(position?.y, cellSize),
    cellZ: quantize(position?.z, cellSize),
    cameraSector: yawSector(yaw, sectorCount)
  };
}
function lodSpatialKeyString(key) {
  return [
    key?.cellX ?? 0,
    key?.cellY ?? 0,
    key?.cellZ ?? 0,
    key?.cameraSector ?? 0
  ].join(":");
}
function yawSector(yaw, sectorCount = 16) {
  const count = Math.max(1, sectorCount | 0);
  const normalized3 = positiveModulo(yaw, TAU2);
  return Math.min(
    count - 1,
    Math.floor(normalized3 / TAU2 * count)
  );
}
function quantize(value3, cellSize) {
  const safeValue = Number.isFinite(value3) ? value3 : 0;
  const safeCellSize = Number.isFinite(cellSize) && cellSize > 0 ? cellSize : 1;
  return Math.floor(safeValue / safeCellSize);
}
function positiveModulo(value3, divisor) {
  const safeValue = Number.isFinite(value3) ? value3 : 0;
  return (safeValue % divisor + divisor) % divisor;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodController.js
var LodController = class {
  constructor({ cellSize = 12, sectorCount = 16, hysteresis = 0.12 } = {}) {
    this.cellSize = cellSize;
    this.sectorCount = sectorCount;
    this.hysteresis = hysteresis;
    this.entries = /* @__PURE__ */ new Map();
    this.queue = new LodTransitionQueue();
    this.previousEventKey = null;
    this.stats = createInitialLodStats();
  }
  register({ id, node, className, center, radius = 0, alwaysVisible = false }) {
    if (!id || !node || !center || this.entries.has(id)) return false;
    const originalVisible = node.visible !== false;
    this.entries.set(id, {
      id,
      node,
      className,
      center: { ...center },
      radius: Math.max(0, finiteLodNumber(radius)),
      alwaysVisible,
      originalVisible,
      desiredVisible: originalVisible
    });
    this.stats.registered = this.entries.size;
    return true;
  }
  /** Forces the next update to evaluate newly streamed registrations. */
  invalidate() {
    this.previousEventKey = null;
  }
  update({ position, yaw = 0, tierName = "high" }) {
    const eventKey = this.eventKey(position, yaw, tierName);
    if (eventKey !== this.previousEventKey) {
      this.previousEventKey = eventKey;
      this.stats.events += 1;
      this.stats.lastTier = tierName;
      this.stats.lastEventKey = eventKey;
      this.evaluateEntries(position, tierName);
    }
    const processed = this.queue.process({
      maximumTransitions: qualityTier(tierName).transitionBudget
    });
    this.stats.transitions += processed.results.filter((result) => result.ok).length;
    return {
      eventKey,
      processed,
      pending: this.queue.size,
      stats: { ...this.stats }
    };
  }
  eventKey(position, yaw, tierName) {
    const spatial = lodSpatialKey({
      position,
      yaw,
      cellSize: this.cellSize,
      sectorCount: this.sectorCount
    });
    return `${lodSpatialKeyString(spatial)}:${tierName}`;
  }
  evaluateEntries(position, tierName) {
    for (const entry of this.entries.values()) {
      this.stats.evaluations += 1;
      this.evaluateEntry(entry, position, tierName);
    }
  }
  evaluateEntry(entry, position, tierName) {
    const distance4 = lodSphereDistance(position, entry.center, entry.radius);
    const maximumDistance = lodMaximumDistance(entry.className, tierName);
    const visible = desiredLodVisibility({
      currentlyVisible: entry.desiredVisible,
      alwaysVisible: entry.alwaysVisible,
      distance: distance4,
      maximumDistance,
      hysteresis: this.hysteresis
    });
    if (visible === entry.desiredVisible) return;
    entry.desiredVisible = visible;
    this.queue.enqueue({
      id: entry.id,
      priority: lodTransitionPriority(visible, distance4),
      apply: () => {
        entry.node.visible = visible;
      },
      metadata: { visible, distance: distance4, maximumDistance }
    });
  }
  restore() {
    this.queue.clear();
    for (const entry of this.entries.values()) {
      entry.node.visible = entry.originalVisible;
      entry.desiredVisible = entry.originalVisible;
    }
    this.invalidate();
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodGeometryBounds.js
var GEOMETRY_BOUNDS = /* @__PURE__ */ new WeakMap();
function geometryLodBounds(geometry) {
  if (!geometry || typeof geometry !== "object") return emptyBounds();
  if (GEOMETRY_BOUNDS.has(geometry)) return GEOMETRY_BOUNDS.get(geometry);
  const position = geometry.attributes?.position;
  const values = position?.array;
  const itemSize = position?.itemSize || 3;
  if (!values?.length || itemSize < 3) return cacheBounds(geometry, emptyBounds());
  const minimum = { x: Infinity, y: Infinity, z: Infinity };
  const maximum = { x: -Infinity, y: -Infinity, z: -Infinity };
  let validVertices = 0;
  let invalidCoordinates = 0;
  for (let offset = 0; offset + 2 < values.length; offset += itemSize) {
    const x = values[offset];
    const y = values[offset + 1];
    const z = values[offset + 2];
    invalidCoordinates += invalidCount(x, y, z);
    if (![x, y, z].every(Number.isFinite)) continue;
    validVertices += 1;
    minimum.x = Math.min(minimum.x, x);
    minimum.y = Math.min(minimum.y, y);
    minimum.z = Math.min(minimum.z, z);
    maximum.x = Math.max(maximum.x, x);
    maximum.y = Math.max(maximum.y, y);
    maximum.z = Math.max(maximum.z, z);
  }
  if (!validVertices) return cacheBounds(geometry, emptyBounds(invalidCoordinates));
  const center = midpoint(minimum, maximum);
  return cacheBounds(geometry, {
    center,
    geometryValid: invalidCoordinates === 0,
    invalidCoordinates,
    maximum,
    minimum,
    radius: distance3(center, maximum),
    triangles: triangleCount(geometry, position, values, itemSize),
    vertices: position.count || Math.floor(values.length / itemSize)
  });
}
function cacheBounds(geometry, bounds) {
  GEOMETRY_BOUNDS.set(geometry, bounds);
  return bounds;
}
function distance3(left, right) {
  return Math.hypot(right.x - left.x, right.y - left.y, right.z - left.z);
}
function emptyBounds(invalidCoordinates = 0) {
  return {
    center: { x: 0, y: 0, z: 0 },
    geometryValid: false,
    invalidCoordinates,
    maximum: { x: 0, y: 0, z: 0 },
    minimum: { x: 0, y: 0, z: 0 },
    radius: 0,
    triangles: 0,
    vertices: 0
  };
}
function invalidCount(...values) {
  return values.filter((value3) => !Number.isFinite(value3)).length;
}
function midpoint(minimum, maximum) {
  return {
    x: (minimum.x + maximum.x) / 2,
    y: (minimum.y + maximum.y) / 2,
    z: (minimum.z + maximum.z) / 2
  };
}
function triangleCount(geometry, position, values, itemSize) {
  return geometry.index?.array?.length ? Math.floor(geometry.index.array.length / 3) : Math.floor((position.count || values.length / itemSize) / 3);
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodWorldBounds.js
var IDENTITY_MATRIX = new Float32Array([
  1,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  1
]);
function worldLodBounds(localBounds, matrixWorld) {
  const matrix = matrixWorld || IDENTITY_MATRIX;
  const transformed = transformPoint(
    matrix,
    localBounds.center.x,
    localBounds.center.y,
    localBounds.center.z
  );
  return {
    center: {
      x: transformed[0],
      y: transformed[1],
      z: transformed[2]
    },
    radius: localBounds.radius * maximumWorldScale(matrix)
  };
}
function maximumWorldScale(matrix) {
  const maximumScale = Math.max(
    Math.hypot(matrix[0], matrix[1], matrix[2]),
    Math.hypot(matrix[4], matrix[5], matrix[6]),
    Math.hypot(matrix[8], matrix[9], matrix[10])
  );
  return Number.isFinite(maximumScale) ? maximumScale : 1;
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/lod/LodSceneCandidate.js
var OWNED_CLASSES = /* @__PURE__ */ new Set(["detail", "edge", "grass", "vegetation"]);
function createLodSceneCandidate(node, id) {
  if (!isExplicitStaticMesh(node)) return null;
  const metadata = node.userData || {};
  const className = inferLodClass(node.name, metadata);
  const classPolicy = lodClassPolicy(className);
  if (!OWNED_CLASSES.has(className) || classPolicy.protected) return null;
  const localBounds = geometryLodBounds(node.geometry);
  if (!localBounds.geometryValid || localBounds.vertices === 0) return null;
  const worldBounds = worldLodBounds(localBounds, node.matrixWorld);
  return {
    registration: {
      id,
      node,
      className,
      center: worldBounds.center,
      radius: worldBounds.radius
    },
    record: {
      id,
      node,
      className,
      radius: worldBounds.radius,
      triangles: localBounds.triangles,
      vertices: localBounds.vertices
    }
  };
}
function isExplicitStaticMesh(node) {
  if (!node?.isMesh || !node.geometry || node.visible === false) return false;
  if (node.isSkinnedMesh || node.skeleton) return false;
  const metadata = node.userData || {};
  const lod = metadata.AwtsmoosLod || {};
  if (lod.disabled === true || lod.alwaysVisible === true) return false;
  return Boolean(
    metadata.AwtsmoosLod || metadata.AwtsmoosYardGrass || metadata.AwtsmoosFence
  );
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/lod/SceneLodDiagnostics.js
function sceneLodDiagnostics(records, controller, runtime = {}) {
  const totals = {
    registered: records.length,
    visible: 0,
    hidden: 0,
    triangles: 0,
    hiddenTriangles: 0,
    vertices: 0,
    byClass: {}
  };
  for (const record of records) accumulateRecord(totals, record);
  return {
    ...totals,
    controller: { ...controller.stats },
    queue: { ...controller.queue.stats, pending: controller.queue.size },
    refreshes: runtime.refreshes || 0,
    lastRefreshRegistrations: runtime.lastRefreshRegistrations || 0,
    lastSceneRevision: runtime.lastSceneRevision ?? null
  };
}
function accumulateRecord(totals, record) {
  const visible = record.node.visible !== false;
  const classTotals = totals.byClass[record.className] || createClassTotals();
  totals.visible += visible ? 1 : 0;
  totals.hidden += visible ? 0 : 1;
  totals.triangles += record.triangles;
  totals.hiddenTriangles += visible ? 0 : record.triangles;
  totals.vertices += record.vertices;
  classTotals.registered += 1;
  classTotals.visible += visible ? 1 : 0;
  classTotals.hidden += visible ? 0 : 1;
  classTotals.triangles += record.triangles;
  totals.byClass[record.className] = classTotals;
}
function createClassTotals() {
  return {
    registered: 0,
    visible: 0,
    hidden: 0,
    triangles: 0
  };
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/lod/SceneLodRuntime.js
var SceneLodRuntime = class {
  constructor({ scene, controllerOptions = {} }) {
    this.scene = scene;
    this.controller = new LodController(controllerOptions);
    this.registeredNodes = /* @__PURE__ */ new WeakSet();
    this.records = [];
    this.sequence = 0;
    this.refreshes = 0;
    this.lastRefreshRegistrations = 0;
    this.lastSceneRevision = null;
  }
  /** Scans only when explicitly called after foundational or streamed world installation. */
  refresh() {
    if (!this.scene?.traverse) return 0;
    this.scene.updateWorldMatrix?.();
    let registrations = 0;
    this.scene.traverse((node) => {
      if (this.registeredNodes.has(node)) return;
      const candidate = createLodSceneCandidate(node, this.nextId(node));
      if (!candidate) return;
      if (!this.controller.register(candidate.registration)) return;
      this.registeredNodes.add(node);
      this.records.push(candidate.record);
      registrations += 1;
    });
    this.refreshes += 1;
    this.lastRefreshRegistrations = registrations;
    this.lastSceneRevision = this.scene._sceneGraphRevision ?? null;
    if (registrations > 0) this.controller.invalidate();
    return registrations;
  }
  update(context) {
    return this.controller.update(context);
  }
  diagnostics() {
    return sceneLodDiagnostics(this.records, this.controller, this);
  }
  destroy() {
    this.controller.restore();
    this.records.length = 0;
    this.registeredNodes = /* @__PURE__ */ new WeakSet();
    this.lastRefreshRegistrations = 0;
  }
  nextId(node) {
    this.sequence += 1;
    const name = String(node?.name || "mesh").replace(/[^a-z0-9_-]+/gi, "-");
    return `scene-lod-${this.sequence}-${name}`;
  }
};

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/ui/AwtsmoosEventBus.js
var HISTORY_LIMIT2 = 24;
var AwtsmoosEventBus = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
    this.history = [];
  }
  on(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
    return () => this.off(type, listener);
  }
  off(type, listener) {
    const listeners = this.listeners.get(type) || [];
    this.listeners.set(
      type,
      listeners.filter((candidate) => candidate !== listener)
    );
  }
  emit(type, detail = {}) {
    this.history.unshift({
      at: currentTime(),
      detail,
      type
    });
    this.history.length = Math.min(HISTORY_LIMIT2, this.history.length);
    for (const listener of this.listeners.get(type) || []) {
      listener(detail);
    }
    if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") {
      window.dispatchEvent(new CustomEvent(`Awtsmoos:${type}`, { detail }));
    }
  }
};
function currentTime() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/world/village/VillageArrivalContract.js?v=20260720-canonical-valley-pass-04
var VILLAGE_ARRIVAL_PLAYER2 = Object.freeze({
  facing: Math.PI,
  x: 0,
  z: 104
});
var VILLAGE_ARRIVAL_CAMERA = Object.freeze({
  clearingRadius: 20,
  clearingX: 0,
  clearingZ: 122,
  distance: 18,
  fov: 62,
  maxDistance: 52,
  minDistance: 2.2,
  pitch: 0.24,
  yaw: 2.86
});
var VILLAGE_ARRIVAL_SIGN = Object.freeze({
  x: -7,
  yaw: 0.12,
  z: 96
});
var VILLAGE_ARRIVAL_ENTRANCE = Object.freeze({
  x: 0,
  z: 101
});
var VILLAGE_ARRIVAL_CLEARINGS = Object.freeze([
  Object.freeze({ id: "arrival-spawn", radius: 16, x: 0, z: 104 }),
  Object.freeze({
    id: "arrival-camera",
    radius: VILLAGE_ARRIVAL_CAMERA.clearingRadius,
    x: VILLAGE_ARRIVAL_CAMERA.clearingX,
    z: VILLAGE_ARRIVAL_CAMERA.clearingZ
  })
]);

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzFoundationServices.js
var GOLDEN_HOUR_ENVIRONMENT = referenceEnvironment(REFERENCE_GOLDEN_HOUR);
function createEretzFoundationServices(hosts, qualityProfile) {
  const scene = new Scene();
  const camera = new PerspectiveCamera(
    VILLAGE_ARRIVAL_CAMERA.fov,
    innerWidth / innerHeight,
    0.08,
    1600
  );
  const renderer = createRenderer(hosts.canvas, qualityProfile);
  const bus = new AwtsmoosEventBus();
  const input = new UiEventSystem(hosts.canvas).install(bus);
  return {
    bus,
    camera,
    input,
    joystick: new MobileJoystick(hosts.joystickHost),
    jumpButton: new JumpButton(hosts.jumpHost),
    orbit: createArrivalOrbit(hosts.canvas),
    renderer,
    scene,
    sceneLod: new SceneLodRuntime({ scene })
  };
}
function createRenderer(canvas, qualityProfile) {
  const renderer = new TinyWebGLRenderer({ canvas });
  renderer.options.culling = true;
  renderer.options.defaultRenderDistance = qualityProfile.renderDistance;
  renderer.options.staticBatcher = new StaticOpaqueBatcher();
  renderer.setClearColor(...GOLDEN_HOUR_ENVIRONMENT.fogColor, 1);
  renderer.setEnvironment({
    ...GOLDEN_HOUR_ENVIRONMENT,
    fogFar: qualityProfile.renderDistance * 1.08,
    fogNear: qualityProfile.renderDistance * 0.38
  });
  return renderer;
}
function createArrivalOrbit(canvas) {
  return new CameraOrbitController(canvas, {
    distance: VILLAGE_ARRIVAL_CAMERA.distance,
    eyeForward: 0.24,
    max: VILLAGE_ARRIVAL_CAMERA.maxDistance,
    min: VILLAGE_ARRIVAL_CAMERA.minDistance,
    mode: "orbit",
    pitch: VILLAGE_ARRIVAL_CAMERA.pitch,
    yaw: VILLAGE_ARRIVAL_CAMERA.yaw
  });
}
function referenceEnvironment(reference) {
  const cool = reference.coolShadow;
  const horizon = reference.horizonColor;
  const sun = reference.sunCore;
  return Object.freeze({
    ambient: Object.freeze([
      cool[0] * 0.72 + 0.13,
      cool[1] * 0.7 + 0.1,
      cool[2] * 0.66 + 0.08
    ]),
    exposure: 1.18,
    fogColor: Object.freeze([
      cool[0] * 0.66 + horizon[0] * 0.34,
      cool[1] * 0.68 + horizon[1] * 0.32,
      cool[2] * 0.74 + horizon[2] * 0.26
    ]),
    sunColor: Object.freeze([
      sun[0] * 1.18,
      sun[1] * 1.02,
      sun[2] * 0.82
    ]),
    sunDirection: Object.freeze(normalized2(reference.sunPosition))
  });
}
function normalized2(vector3) {
  const length2 = Math.hypot(vector3[0], vector3[1], vector3[2]) || 1;
  return [vector3[0] / length2, vector3[1] / length2, vector3[2] / length2];
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/RuntimeLaunchProgress.js
function reportLaunchProgress(options, message, progress = null) {
  options?.onProgress?.({
    message: String(message),
    progress: Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : null
  });
}
function throwIfLaunchAborted(signal) {
  if (!signal?.aborted) return;
  throw signal.reason instanceof Error ? signal.reason : Object.assign(new Error("World entry was cancelled."), { name: "AbortError" });
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/app/WorldCollisionOctree.js
async function buildWorldCollisionOctreeAsync(colliders, options = {}) {
  const octree = createOctree();
  const yieldWork = options.yieldWork || browserYield;
  const batchSize = Math.max(64, Number(options.batchSize) || 384);
  for (let index = 0; index < colliders.length; index += 1) {
    octree.insert(colliders[index]);
    if ((index + 1) % batchSize !== 0) continue;
    options.onProgress?.({
      message: "Indexing movement collision\u2026",
      progress: 0.88 + 0.05 * (index + 1) / colliders.length
    });
    await yieldWork();
  }
  return octree;
}
function createOctree() {
  return new AwtsmoosOctree(Aabb.centerSize(
    { x: 0, y: 0, z: 0 },
    { x: 780, y: 180, z: 780 }
  ));
}
function browserYield() {
  if (typeof globalThis.scheduler?.yield === "function") return globalThis.scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/bundles/PlayableRuntimeBundleEntry.js
async function createPlayableEretzRuntime(hosts, options = {}, boot) {
  const qualityProfile = resolveWorldQuality(options);
  throwIfLaunchAborted(options.signal);
  reportLaunchProgress(options, "Opening the crystal-clear renderer\u2026", 0.12);
  const services = createEretzFoundationServices(hosts, qualityProfile);
  reportLaunchProgress(options, "Loading the player and solid village forms\u2026", 0.24);
  const loaded = await loadEretzAssets({
    ...options.assets || {},
    boot,
    quality: qualityProfile.quality
  });
  throwIfLaunchAborted(options.signal);
  const phaseOneGround = createGroundSampler({ terrainHeightAt: heightAt });
  const obstacles = createObstacleField(loaded.assets, phaseOneGround);
  const terrain = await createTerrainPackage(
    obstacles,
    loaded.grassImage,
    loaded.assets.terrainMixImage,
    phaseOneGround,
    {
      boot,
      environment: options.environment,
      onProgress: options.onProgress,
      quality: qualityProfile.quality
    }
  );
  throwIfLaunchAborted(options.signal);
  reportLaunchProgress(options, "Indexing responsive movement collision\u2026", 0.9);
  const mainOctree = await buildWorldCollisionOctreeAsync(terrain.colliders, {
    onProgress: options.onProgress
  });
  const chunkRuntime = createWorldChunkRuntime({ mainOctree, terrain });
  const collisionQuery = chunkRuntime.collisionQuery;
  const groundSampler = phaseOneGround.withOctree(collisionQuery);
  const ground = new WorldGround({ octree: collisionQuery, terrainHeightAt: terrain.heightAt });
  terrain.stats.groundSampler = groundSampler.stats().mode;
  terrain.stats.qualityProfile = { ...qualityProfile };
  services.scene.add(createSky3D(qualityProfile.quality));
  services.scene.add(terrain.group);
  const foundation = {
    ...hosts,
    ...loaded,
    ...services,
    chunkRegistry: chunkRuntime.registry,
    chunkRuntime,
    collisionQuery,
    ground,
    groundSampler,
    mainOctree,
    obstacles,
    phaseOneGround,
    qualityProfile,
    terrain
  };
  foundation.initialLodRegistrations = services.sceneLod.refresh();
  foundation.materialCanonicalization = canonicalizeSceneMaterials(services.scene);
  reportLaunchProgress(options, "Awakening actors, controls, and movement\u2026", 0.96);
  const core = assembleEretzCoreRuntime(foundation, options, qualityProfile, boot);
  return { ...core, foundation, qualityProfile };
}
export {
  createPlayableEretzRuntime
};
