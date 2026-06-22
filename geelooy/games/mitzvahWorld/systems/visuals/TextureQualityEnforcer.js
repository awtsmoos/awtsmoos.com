// B"H
/** @file TextureQualityEnforcer.js @description Boot-pass guard against pixelated live textures. */
import * as THREE from "/games/scripts/build/three.module.js";
const MAPS = Object.freeze(["map", "normalMap", "roughnessMap", "metalnessMap", "bumpMap", "alphaMap", "aoMap", "emissiveMap", "specularMap", "displacementMap"]);
function mats(object) { return (Array.isArray(object?.material) ? object.material : [object?.material]).filter(Boolean); }
function rendererAniso() { try { return (globalThis.renderer || globalThis.__AWTSMOOS_RENDERER__)?.capabilities?.getMaxAnisotropy?.() || 8; } catch { return 8; } }
function tune(texture) { if (!texture) return false; texture.wrapS = THREE.MirroredRepeatWrapping; texture.wrapT = THREE.MirroredRepeatWrapping; texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearMipmapLinearFilter; texture.generateMipmaps = true; texture.anisotropy = Math.max(Number(texture.anisotropy) || 1, Math.min(16, rendererAniso())); texture.needsUpdate = true; texture.userData ||= {}; texture.userData.noPixelationEnforced = true; return true; }
export function enforceTextureQuality(scene) { const report = { scanned:0, materials:0, textures:0, examples:[] }; scene?.traverse?.(object => { report.scanned++; for (const material of mats(object)) { report.materials++; for (const key of MAPS) if (tune(material[key])) { report.textures++; if (report.examples.length < 20) report.examples.push({ object:object.name || object.type, key }); } } }); globalThis.__AWTSMOOS_TEXTURE_QUALITY_ENFORCER__ = report; return report; }
export default enforceTextureQuality;
