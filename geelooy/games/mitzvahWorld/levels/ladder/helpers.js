// B"H
/**
 * @file helpers.js
 * @description Chapter 12: Cleaner desert ladder geometry and vivid materials.
 */

const SPIKE_HEIGHT = 1.65;
const TERRAIN_TOP_Y = -3;
const SPIKE_CENTER_Y = TERRAIN_TOP_Y + SPIKE_HEIGHT / 2;

export const platform = (name, x, y, z, width, depth, color = 0xc6aa62) => ({
  name,
  width,
  height: 1,
  depth,
  color,
  textureSeed: name,
  position: { x, y, z }
});

export const stairs = (name, x, y, z, width, height, depth) => ({
  name,
  dimensions: { x: width, y: height, z: depth },
  position: { x, y, z },
  golem: {
    guf: { StairGeometry: [width, height, depth] },
    toyr: { MeshLambertMaterial: { color: 0xb16a3c, emissive: 0x2a1200, map: 'awtsmoosTex://brick' } }
  }
});

export const sky = (name = 'Calm_Desert_Sky') => ({ name, timeOfDay: 10, timeMultiplier: 0, position: { x: 0, y: 0, z: 0 } });

export const coin = (name, x, y, z, value = 1) => ({
  name,
  value,
  rotationSpeed: 0.025,
  position: { x, y, z },
  golem: {
    guf: { CylinderGeometry: [0.45, 0.45, 0.12, 24] },
    toyr: { MeshStandardMaterial: { color: 0xffd54a, emissive: 0xaa7700, metalness: 0.9, roughness: 0.2 } }
  }
});

export const bonus = (name, x, y, z, globalValue = 3) => ({
  ...coin(name, x, y, z, 1),
  globalValue,
  rotationSpeed: 0.04
});

export const spike = (name, x, z, penalty = 0) => ({
  name,
  radius: 1.28,
  height: SPIKE_HEIGHT,
  proximity: 1.38,
  verticalHitRange: 2.85,
  groundY: TERRAIN_TOP_Y,
  penalty,
  resetDelayMs: 999999,
  position: { x, y: SPIKE_CENTER_Y, z },
  golem: {
    guf: { ConeGeometry: [1.1, SPIKE_HEIGHT, 4] },
    toyr: { MeshStandardMaterial: { color: 0xff2233, emissive: 0xaa1100, roughness: 0.7, metalness: 0.1 } }
  }
});

export const door = (name, x, y, z, next = null) => ({ name, label: name, next, destination: next || 'next', isSolid: false, interactable: true, proximity: 3.2, position: { x, y, z } });

export const terrain = (name, textureType = 'sand') => ({ name, width: 180, depth: 120, thickness: 3, segments: 4, isSolid: true, textureType, position: { x: 22, y: TERRAIN_TOP_Y, z: 0 } });

export const player = (x = -8, y = 5, z = 0) => ({ name: 'The Chossid', height: 1.5, radius: 0.45, speed: 65, speedScale: 2.0, jumpHeight: 15, interactable: true, path: 'https://models-3122d.web.app/chossid.glb?k=2', position: { x, y, z } });

export const resetPit = (name, x, y, z, width, depth) => ({ name, width, height: 0.4, depth, proximity: 6, penalty: 0, color: 0x330000, position: { x, y, z } });

export const spikeFloor = ({ minX, maxX, minZ, maxZ, step = 2.15 }) => {
  const out = [];
  let count = 0;
  for (let x = minX; x <= maxX; x += step) {
    for (let z = minZ; z <= maxZ; z += step) {
      out.push(spike(`spike_floor_${String(count).padStart(3, '0')}`, x, z));
      count += 1;
    }
  }
  return out;
};

export const level = (shaym, requiredPerutos, nextLevel, nivrayim) => ({ shaym, requiredPerutos, nextLevel, globalCoinStorageKey: 'awtsmoosMitzvahGlobalCoins', nivrayim });
