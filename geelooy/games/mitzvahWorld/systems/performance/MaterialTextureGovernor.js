// B"H
/**
 * @file MaterialTextureGovernor.js
 * Texture realism is not giant files. It is tiny detailed maps, mirrored repeat,
 * mipmaps, anisotropy, correct filters, and no pixelated nearest betrayal.
 */
import { pingPongTexturePolicy } from './PingPongTexturePolicy.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11';

function findScene(scope = globalThis) {
  return scope.__AWTSMOOS_OLAM__?.scene || scope.olam?.scene || scope.mana?.activeOlam?.scene || scope.scene || null;
}
function asArray(v) { return Array.isArray(v) ? v : v ? [v] : []; }
function textureSlots(material = {}) {
  return ['map','normalMap','roughnessMap','metalnessMap','aoMap','emissiveMap','alphaMap','bumpMap','displacementMap'].map(k => [k, material[k]]).filter(([, v]) => v);
}
function constant(THREE, name) { return THREE?.[name] || null; }
function applyRepeat(texture, repeat) {
  if (!texture?.repeat?.set || !repeat) return false;
  texture.repeat.set(repeat[0], repeat[1]);
  return true;
}
function applyTextureLaw(texture, material, slot, THREE, budget) {
  const law = pingPongTexturePolicy(material, slot, budget);
  const mirrored = constant(THREE, law.wrapping);
  const repeat = constant(THREE, law.fallbackWrapping);
  const minFilter = constant(THREE, law.minFilter);
  const magFilter = constant(THREE, law.magFilter);
  const colorSpace = constant(THREE, law.colorSpace);
  const before = { magFilter:texture.magFilter, minFilter:texture.minFilter, wrapS:texture.wrapS, wrapT:texture.wrapT };
  if (mirrored || repeat) {
    texture.wrapS = mirrored || repeat;
    texture.wrapT = mirrored || repeat;
  }
  if (minFilter) texture.minFilter = minFilter;
  if (magFilter) texture.magFilter = magFilter;
  if (colorSpace && slot === 'map') texture.colorSpace = colorSpace;
  texture.generateMipmaps = true;
  if ('anisotropy' in texture) texture.anisotropy = Math.max(texture.anisotropy || 1, law.anisotropy);
  applyRepeat(texture, law.repeat);
  texture.needsUpdate = true;
  return { law, before, after:{ magFilter:texture.magFilter, minFilter:texture.minFilter, wrapS:texture.wrapS, wrapT:texture.wrapT, repeat:texture.repeat ? [texture.repeat.x, texture.repeat.y] : null } };
}
export function governMaterialTextures(scope = globalThis, policy = scope.__MITZVAH_MASTER_REALISM_POLICY__?.master?.textures) {
  const scene = findScene(scope);
  const THREE = scope.THREE;
  const budget = scope.__MITZVAH_WORLD_PERFORMANCE_BUDGET__;
  const materials = new Map();
  const textures = new Map();
  const detailClasses = {};
  const report = { at:Date.now(), scene:Boolean(scene), materials:0, textures:0, touchedTextures:0, sharedMaterials:0, pingPongRepeat:true, pixelationRisks:0, detailClasses, warnings:[], policy };
  scene?.traverse?.(object => {
    if (!object?.isMesh) return;
    for (const material of asArray(object.material)) {
      if (!material) continue;
      const key = material.uuid || material.name || material.type;
      materials.set(key, (materials.get(key) || 0) + 1);
      for (const [slot, texture] of textureSlots(material)) {
        const tkey = texture.uuid || texture.name || `${slot}:${texture.id || textures.size}`;
        textures.set(tkey, (textures.get(tkey) || 0) + 1);
        const result = applyTextureLaw(texture, material, slot, THREE, budget);
        report.touchedTextures += 1;
        detailClasses[result.law.detailClass] = (detailClasses[result.law.detailClass] || 0) + 1;
        if (String(result.before.magFilter).includes('Nearest') || String(result.before.minFilter).includes('Nearest')) report.pixelationRisks += 1;
      }
    }
  });
  report.materials = materials.size;
  report.textures = textures.size;
  report.sharedMaterials = [...materials.values()].filter(v => v > 1).length;
  if (report.materials > 600) report.warnings.push('high-material-count-use-atlases-and-shared-materials');
  if (report.textures > 300) report.warnings.push('high-texture-count-small-pingpong-atlases-required');
  if (report.pixelationRisks) report.warnings.push('nearest-filter-risk-corrected-to-linear-mipmap-policy');
  scope.__MITZVAH_TEXTURE_GOVERNOR_REPORT__ = report;
  return report;
}
export default governMaterialTextures;
