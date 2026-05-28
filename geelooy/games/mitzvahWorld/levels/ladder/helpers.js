// B"H
/**
 * @file helpers.js
 * @description
 * Chapter 6: The desert ladder is authored by small, data-only sparks.
 *
 * The black-screen repair is here too: Level 1 now explicitly asks for a bright
 * ProceduralSky so lights are born before Lambert platforms and spikes are seen.
 */

export const platform = (name, x, y, z, width, depth, color = 0xc6aa62) => ({
  name,
  width,
  height: 1,
  depth,
  color,
  textureSeed: name,
  position: { x, y, z }
});

export const sky = (name = "Bright_Desert_Sky") => ({
  name,
  timeOfDay: 10,
  timeMultiplier: 0.05,
  position: { x: 0, y: 0, z: 0 }
});

export const coin = (name, x, y, z, value = 1) => ({ name, value, rotationSpeed: 0.025, position: { x, y, z } });

export const bonus = (name, x, y, z, globalValue = 3) => ({
  name,
  value: 1,
  globalValue,
  rotationSpeed: 0.035,
  position: { x, y, z }
});

export const spike = (name, x, y, z, penalty = 0, radius = 1.15) => ({
  name,
  radius,
  height: 1.55,
  proximity: 1.65,
  penalty,
  resetDelayMs: 999999,
  position: { x, y, z }
});

export const door = (name, x, y, z, next = null) => ({
  name,
  label: name,
  next,
  destination: next || "next",
  isSolid: false,
  interactable: true,
  proximity: 3.2,
  position: { x, y, z }
});

export const terrain = (name, textureType = "sand") => ({
  name,
  width: 180,
  depth: 120,
  thickness: 3,
  segments: 4,
  isSolid: true,
  textureType,
  position: { x: 22, y: -3, z: 0 }
});

export const player = (x = -8, y = 5, z = 0) => ({
  name: "The Chossid",
  height: 1.5,
  speed: 65,
  jumpHeight: 15,
  interactable: true,
  path: "https://models-3122d.web.app/chossid.glb?k=2",
  position: { x, y, z }
});

export const resetPit = (name, x, y, z, width, depth) => ({
  name,
  width,
  height: 0.4,
  depth,
  proximity: 6,
  penalty: 0,
  color: 0x330000,
  position: { x, y, z }
});

export const spikeFloor = ({ minX, maxX, minZ, maxZ, y, step = 3.2 }) => {
  const out = [];
  let count = 0;
  for (let x = minX; x <= maxX; x += step) {
    for (let z = minZ; z <= maxZ; z += step) {
      const jitter = ((Math.sin((x * 13.7) + (z * 8.1)) + 1) * 0.18) - 0.18;
      out.push(spike(`spike_floor_${String(count).padStart(3, "0")}`, x, y + jitter, z, 0, 1.05));
      count += 1;
    }
  }
  return out;
};

export const level = (shaym, requiredPerutos, nextLevel, nivrayim) => ({
  shaym,
  requiredPerutos,
  nextLevel,
  globalCoinStorageKey: "awtsmoosMitzvahGlobalCoins",
  nivrayim
});
