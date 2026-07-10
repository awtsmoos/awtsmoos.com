// B"H
/** DoorWallSystem: one doorway covenant makes wall hole and hinged door agree forever. */
export function createDoorWallSet(spec, material = {}) {
  const wall = doorWallDef(spec, material);
  const door = doorDefFromWall(spec, material.doorMaterial || {});
  return { wall, door, spec: normalize(spec) };
}
export function doorWallDef(spec, material = {}) {
  const s = normalize(spec);
  return {
    id: s.wallId,
    shape: 'doorway',
    solid: true,
    walkable: false,
    color: material.color || s.wallColor,
    mapImage: material.mapImage || null,
    textureUrl: material.textureUrl || material.mapImage?.dataset?.url || material.mapImage?.src || null,
    mapRepeat: material.mapRepeat || [3, 2],
    position: { x: s.x, y: s.floorY + s.wallH / 2, z: s.z },
    size: { x: s.wallW, y: s.wallH, z: s.wallT },
    door: { x: s.doorW, y: s.doorH },
    yaw: s.yaw,
    rotation: { y: s.yaw },
    userData: { AwtsmoosDoorWallSpec: s }
  };
}
export function doorDefFromWall(spec, material = {}) {
  const s = normalize(spec), gap = s.panelGap;
  return {
    id: s.doorId,
    position: { x: s.x, y: 0, z: s.z },
    yaw: s.yaw,
    width: s.doorW - gap,
    height: s.doorH - gap,
    thickness: s.doorThickness,
    centerY: s.floorY + (s.doorH - gap) / 2,
    depth: 0,
    opening: { width: s.doorW, height: s.doorH, wall: s.wallId },
    color: material.color || s.doorColor,
    mapImage: material.mapImage || null,
    textureUrl: material.textureUrl || material.mapImage?.dataset?.url || material.mapImage?.src || null,
    mapRepeat: material.mapRepeat || [1, 1.7],
    userData: { AwtsmoosDoorWallSpec: s }
  };
}
export function normalize(spec = {}) {
  const floorY = spec.floorY ?? 0;
  return {
    wallId: spec.wallId || `${spec.id || 'Awtsmoos'}-doorway-wall`,
    doorId: spec.doorId || `${spec.id || 'Awtsmoos'}-hinged-door`,
    x: spec.x ?? 0,
    y: spec.y ?? floorY,
    z: spec.z ?? 0,
    floorY,
    yaw: spec.yaw ?? 0,
    wallW: spec.wallW ?? 8,
    wallH: spec.wallH ?? 3.5,
    wallT: spec.wallT ?? .55,
    doorW: spec.doorW ?? 2.4,
    doorH: spec.doorH ?? 2.7,
    doorThickness: spec.doorThickness ?? .22,
    panelGap: spec.panelGap ?? .10,
    wallColor: spec.wallColor || '#ddd3c6',
    doorColor: spec.doorColor || '#8a5228'
  };
}
