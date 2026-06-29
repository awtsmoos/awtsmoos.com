// B"H
/**
 * @file InteractiveNpcPalette.js
 * @description
 * Garment color flows here. The Awtsmoos paints the NPC without tangling color
 * decisions into click handling or dialogue payloads.
 */
function garmentName(child) {
  return String(child?.userData?.garment || child?.name || "").toLowerCase();
}

function paletteColor(palette, name) {
  if (/jacket|coat|robe|outer-shirt|vest/.test(name)) return palette.coat;
  if (/shirt/.test(name)) return palette.shirt;
  if (/pants|trouser|leg/.test(name)) return palette.pants;
  if (/shoe|boot/.test(name)) return palette.shoes;
  if (/hat|yamulka|yarmulke/.test(name)) return palette.hatColor;
  return null;
}

function cloneMaterialOnce(child) {
  if (child.userData.npcPaletteCloned) return;
  child.material = Array.isArray(child.material)
    ? child.material.map(material => material.clone())
    : child.material.clone();
  child.userData.npcPaletteCloned = true;
}

export function applyNpcPalette(root, palette = {}) {
  root?.traverse?.(child => {
    if (!child?.isMesh && !child?.isSkinnedMesh) return;

    const name = garmentName(child);
    if (name === "top-hat" || name.includes("top_hat")) {
      child.visible = palette.hatStyle !== "yamulka";
    }
    if (/yamulka|yarmulke/.test(name)) {
      child.visible = palette.hatStyle === "yamulka";
    }

    const color = paletteColor(palette, name);
    if (!color || !child.material) return;

    cloneMaterialOnce(child);
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach(material => {
      material.color?.set?.(color);
      material.needsUpdate = true;
    });
  });
}
