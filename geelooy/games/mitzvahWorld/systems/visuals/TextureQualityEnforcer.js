// B"H
/** @file TextureQualityEnforcer.js @description Boot-pass guard against pixelated live textures. */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { applyTexturePolicy, applyMaterialPolicy } from "./HyperrealTexturePolicy.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { stampDetailIntent } from "./MaterialDetailLayers.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";

const MAPS = Object.freeze(["map", "normalMap", "roughnessMap", "metalnessMap", "bumpMap", "alphaMap", "aoMap", "emissiveMap", "specularMap", "displacementMap"]);

function mats(object) {
  return (Array.isArray(object?.material) ? object.material : [object?.material]).filter(Boolean);
}

function label(object, material, texture) {
  return [object?.name, object?.type, object?.userData?.kind, object?.userData?.species, material?.name, texture?.name, texture?.userData?.kind, texture?.source?.data?.src].filter(Boolean).join(" ");
}

function forceMipmapPingPong(texture, policy) {
  if (!texture) return;
  texture.wrapS = policy?.wrap || THREE.MirroredRepeatWrapping;
  texture.wrapT = policy?.wrap || THREE.MirroredRepeatWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
}

export function enforceTextureQuality(scene, scope = globalThis) {
  const report = { scanned:0, materials:0, textures:0, detailIntents:0, examples:[] };
  scene?.traverse?.(object => {
    report.scanned++;
    for (const material of mats(object)) {
      report.materials++;
      const materialLabel = label(object, material, null);
      const kind = applyMaterialPolicy(material, materialLabel, scope)?.kind;
      stampDetailIntent(material, kind || "default", 1);
      report.detailIntents++;
      for (const key of MAPS) {
        const texture = material[key];
        if (!texture) continue;
        const policy = applyTexturePolicy(texture, label(object, material, texture), scope);
        forceMipmapPingPong(texture, policy);
        report.textures++;
        if (report.examples.length < 20) report.examples.push({ object:object.name || object.type, key, kind:policy?.kind, repeat:policy?.repeat });
      }
    }
  });
  scope.__AWTSMOOS_TEXTURE_QUALITY_ENFORCER__ = report;
  return report;
}

export default enforceTextureQuality;
