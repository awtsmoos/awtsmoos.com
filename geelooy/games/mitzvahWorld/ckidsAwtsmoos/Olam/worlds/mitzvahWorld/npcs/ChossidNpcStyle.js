/**
 * B\"H
 * @file ChossidNpcStyle.js
 * @description
 * Lightweight style variations for shared chossid.glb NPCs.
 */

const PALETTES = Object.freeze({
  default: { emissive: 0x000000, emissiveIntensity: 0 },
  scholar: { emissive: 0x003366, emissiveIntensity: 0.08 },
  healer: { emissive: 0x006633, emissiveIntensity: 0.08 },
  merchant: { emissive: 0x664400, emissiveIntensity: 0.08 },
  guardian: { emissive: 0x660000, emissiveIntensity: 0.08 }
});

function getRole(def) {
  return def.role || def.faction || "default";
}

export function applyChossidNpcStyle(npc, def = {}) {
  const role = getRole(def);
  const palette = PALETTES[role] || PALETTES.default;

  npc.userData.styleRole = role;
  npc.userData.equipped = def.equipped || {};

  npc.traverse(child => {
    if (!child?.isMesh || !child.material) return;

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach(material => {
      if (!material) return;
      if (material.emissive && palette.emissive) material.emissive.setHex(palette.emissive);
      if ("emissiveIntensity" in material) material.emissiveIntensity = palette.emissiveIntensity;
      material.needsUpdate = true;
    });
  });

  return npc;
}
