// B"H
/**
 * @file SeamlessTextureTuning.js
 * @description
 * Chapter 613: every texture became a ping-pong river.
 *
 * The Awtsmoos does not tolerate a pixelated smear masquerading as grass, fur,
 * bark, robe, face, head, snout, or hill. This pass touches every live material
 * texture, forces mirrored repeat, linear mipmapped filtering, stronger
 * anisotropy, and special head/face repeats so skulls do not stretch one tiny
 * square across an entire thought.
 */
import * as THREE from "/games/scripts/build/three.module.js";

const MAP_KEYS = Object.freeze(["map", "normalMap", "roughnessMap", "metalnessMap", "bumpMap", "alphaMap", "aoMap", "emissiveMap", "specularMap", "displacementMap"]);
const SURFACE = /terrain|ground|grass|field|path|road|land|meadow|hill|soil|floor|roof|wall/i;
const FOLIAGE = /leaf|leaves|bark|tree|trunk|branch|flower|bush|shrub/i;
const ANIMAL = /fur|animal|fox|rabbit|deer|goat|cow|frog|bird|body|tail|leg|paw/i;
const HEAD = /head|face|snout|muzzle|ear|eye|nose|mouth|beard|hair/i;
const UI = /ui|hud|button|icon|glyph|marker|sprite|font|text/i;

function label(object, material, texture) {
  return [object?.name, object?.type, object?.userData?.kind, object?.userData?.species, material?.name, texture?.name, texture?.userData?.kind, texture?.source?.data?.src].filter(Boolean).join(" ");
}

function eachMaterial(object, visit) {
  const mats = Array.isArray(object?.material) ? object.material : [object?.material];
  for (const material of mats) if (material) visit(material, object);
}

function rendererAnisotropy() {
  try {
    const r = globalThis.__AWTSMOOS_RENDERER__ || globalThis.renderer || globalThis.mana?.renderer;
    return r?.capabilities?.getMaxAnisotropy?.() || 8;
  } catch { return 8; }
}

function repeatFor(name) {
  if (UI.test(name)) return [1, 1, "ui-safe"];
  if (HEAD.test(name)) return [3.5, 2.5, "head-face-unstretch"];
  if (SURFACE.test(name)) return [28, 28, "large-surface-pingpong"];
  if (FOLIAGE.test(name)) return [8, 8, "foliage-pingpong"];
  if (ANIMAL.test(name)) return [5, 3, "animal-fur-pingpong"];
  return [2, 2, "default-pingpong"];
}

function setFilter(texture, report) {
  if (!texture) return;
  if (texture.magFilter !== THREE.LinearFilter) { texture.magFilter = THREE.LinearFilter; report.linearized += 1; }
  const mip = THREE.LinearMipmapLinearFilter || THREE.LinearFilter;
  if (texture.minFilter !== mip) { texture.minFilter = mip; report.mipmapped += 1; }
  texture.generateMipmaps = texture.image !== undefined;
  texture.anisotropy = Math.max(Number(texture.anisotropy) || 1, Math.min(16, rendererAnisotropy()));
  texture.needsUpdate = true;
}

function pingPong(texture, repeatX, repeatY, reason, report) {
  if (!texture) return false;
  texture.wrapS = THREE.MirroredRepeatWrapping;
  texture.wrapT = THREE.MirroredRepeatWrapping;
  texture.repeat?.set?.(repeatX, repeatY);
  setFilter(texture, report);
  texture.userData ||= {};
  texture.userData.awtsmoosPingPongSeamless = { repeatX, repeatY, reason, at: Date.now() };
  report.pingpong += 1;
  return true;
}

function markMaterial(material, reason) {
  material.userData ||= {};
  material.userData.awtsmoosTextureFit = reason;
  material.needsUpdate = true;
  if (material.map) material.color?.convertSRGBToLinear?.();
}

export function tuneSeamlessTextures(scene) {
  const report = { scanned:0, materials:0, textures:0, pingpong:0, linearized:0, mipmapped:0, headFixes:0, skipped:0, examples:[] };
  scene?.traverse?.(object => {
    report.scanned += 1;
    eachMaterial(object, material => {
      report.materials += 1;
      let touched = false;
      for (const key of MAP_KEYS) {
        const texture = material?.[key];
        if (!texture) { report.skipped += 1; continue; }
        const name = label(object, material, texture);
        const [rx, ry, reason] = repeatFor(name);
        if (pingPong(texture, rx, ry, reason, report)) {
          report.textures += 1;
          touched = true;
          if (reason.includes("head")) report.headFixes += 1;
          if (report.examples.length < 18) report.examples.push({ object:object.name || object.type || "unnamed", material:material.name || "material", key, repeat:[rx, ry], reason });
        }
      }
      if (!touched && (SURFACE.test(label(object, material, null)) || HEAD.test(label(object, material, null)))) markMaterial(material, "material-no-map-but-classified");
      if (touched) markMaterial(material, "pingpong-repeat-linear-mipmap");
    });
  });
  globalThis.__AWTSMOOS_TEXTURE_PINGPONG_REPORT__ = report;
  return report;
}

export default tuneSeamlessTextures;
