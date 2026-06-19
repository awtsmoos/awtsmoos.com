// B"H
/**
 * @file ProceduralTextureKit.js
 * @description Grain, veins, bark rings, stone flecks, cloth threads, flower
 * dust, fur softness, and now dense dirt strata. This keeps texture features;
 * it does not flatten the world into colors.
 */
import * as THREE from "/games/scripts/build/three.module.js";
const cache = new Map();
const PALE = [238, 226, 199], PALE_GREEN = [134, 196, 86], PALE_BLUE = [126, 194, 222], PALE_GOLD = [255, 224, 92];
const P = Object.freeze({ grass:[[22,64,20],[56,132,48],PALE_GREEN,[42,86,30]], leaf:[[28,76,25],[72,146,48],[154,214,86],[18,50,18]], dirt:[[42,27,15],[96,58,28],[184,124,62],[25,17,10]], stone:[[82,80,74],[146,140,126],[226,218,192],[96,96,92]], brick:[[72,30,24],[128,52,38],[190,82,54],[165,135,105]], wood:[[38,22,12],[86,48,22],[154,94,42],[56,32,16]], gold:[[96,62,10],[180,126,28],PALE_GOLD,[140,82,12]], fabric:[[72,66,54],[132,122,96],[224,210,166],[96,88,70]], flower:[[170,120,80],[232,210,130],[255,244,194],[210,170,100]], fur:[[92,72,48],[164,126,78],PALE,[52,36,24]], glass:[[78,130,146],[130,190,205],PALE_BLUE,[54,96,120]], water:[[42,110,146],[86,180,218],[170,230,245],[28,78,120]] });
function keyName(value) { return String(value || "stone").toLowerCase(); }
function kindFor(value) { const name = keyName(value); if (name.includes("grass")) return "grass"; if (name.includes("leaf") || name.includes("cabbage") || name.includes("onion") || name.includes("frog")) return "leaf"; if (name.includes("brick")) return "brick"; if (name.includes("wood") || name.includes("bark")) return "wood"; if (name.includes("gold")) return "gold"; if (name.includes("glass")) return "glass"; if (name.includes("water")) return "water"; if (name.includes("fur") || name.includes("feather")) return "fur"; if (name.includes("fabric") || name.includes("linen") || name.includes("cotton")) return "fabric"; if (name.includes("flower") || name.includes("petal") || name.includes("mushroom")) return "flower"; if (name.includes("dirt") || name.includes("earth") || name.includes("trail") || name.includes("skin") || name.includes("straw")) return "dirt"; return "stone"; }
function speedMode() { return globalThis?.__AWTSMOOS_PERFORMANCE_MODE__?.budget?.seal === "speed-scene-budget-bh4"; }
function textureSize(size, resolved) { const raw = Number(size) || (resolved === "dirt" ? 512 : 384); if (!speedMode()) return raw; return Math.min(raw, resolved === "grass" || resolved === "leaf" ? 192 : 160); }
function hash(x, y, s = 1) { const v = Math.sin(x * 12.9898 + y * 78.233 + s * 37.719) * 43758.5453; return v - Math.floor(v); }
function clamp(v) { return Math.max(0, Math.min(255, v | 0)); }
function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function noisy(c, amount) { return [clamp(c[0]+amount), clamp(c[1]+amount), clamp(c[2]+amount)]; }
function dirtColor(x, y, size, p) {
  const u = x / size, v = y / size;
  const macro = hash(Math.floor(u * 18), Math.floor(v * 18), 22), micro = hash(x, y, 31), pebble = hash(Math.floor(x / 3), Math.floor(y / 3), 41);
  const wagon = Math.abs(Math.sin(u * 26 + Math.sin(v * 11) * .9));
  const stratum = Math.sin(v * 190 + hash(Math.floor(u * 16), 0, 9) * 3.4);
  let color = mix(p[0], p[1], .2 + macro * .7);
  color = mix(color, p[2], Math.max(0, stratum) * .16);
  color = mix(color, p[3], (1 - wagon) * .18);
  if (pebble > .94) color = mix(color, [210,165,105], .55);
  if (pebble < .035) color = mix(color, [18,13,8], .62);
  const grain = (micro - .5) * 48 + (hash(x, y, 72) > .82 ? 18 : 0);
  return noisy(color, grain);
}
function patternedColor(kind, x, y, size) {
  const u = x / size, v = y / size, p = P[kind] || P.stone;
  if (kind === "dirt") return dirtColor(x, y, size, p);
  const macro = hash(Math.floor(u * 12), Math.floor(v * 12), 2), micro = hash(x, y, 9), fiber = Math.sin(u * 70 + v * 11);
  let color = mix(p[0], p[1], macro * .6 + micro * .3);
  if (kind === "grass") color = mix(color, micro > .62 ? p[2] : p[3], .25 + Math.max(0, fiber) * .25);
  if (kind === "wood") color = mix(color, p[2], Math.pow(.5 + .5 * fiber, 5) * .6);
  if (kind === "leaf") color = mix(color, p[2], Math.pow(.5 + .5 * Math.sin((u - .5) * 90), 8) * .45);
  if (kind === "water" || kind === "glass") color = mix(color, p[2], Math.pow(.5 + .5 * Math.sin((u + v) * 44), 6) * .5);
  if (kind === "fur") color = mix(color, p[2], Math.pow(.5 + .5 * Math.sin(u * 96 + v * 14), 5) * .42);
  if (kind === "brick" && (x % 48 < 3 || y % 28 < 3)) color = p[3];
  const grain = (hash(x, y, 14) - .5) * 28;
  return noisy(color, grain);
}
export function proceduralTexture(kind = "stone", size = 384) {
  const resolved = kindFor(kind), key = resolved + ":" + size + ":grain2";
  if (cache.has(key)) return cache.get(key);
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) { const c = patternedColor(resolved, x, y, size), i = (y * size + x) * 4; data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]; data[i + 3] = 255; }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(resolved === "dirt" ? 6 : 3, resolved === "dirt" ? 6 : 3); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.needsUpdate = true; tex.userData.proceduralTextureKit = resolved; tex.userData.intenseGrain = resolved === "dirt";
  cache.set(key, tex); return tex;
}
export function materialWithTexture(kind = "stone", options = {}) {
  const side = options.side === undefined ? THREE.FrontSide : options.side, resolved = kindFor(kind);
  const map = proceduralTexture(kind, textureSize(options.size, resolved));
  map.anisotropy = speedMode() ? 1 : map.anisotropy;
  const mat = new THREE.MeshLambertMaterial({ color:0xffffff, map, side, transparent:Boolean(options.transparent), alphaTest:options.alphaTest || 0 });
  mat.name = `awtsmoos_grainy_textured_${kind}`; mat.userData = { proceduralTextureKit:resolved, grainyNoise:true, intenseGrain:resolved === "dirt", noSolidColor:true }; return mat;
}
