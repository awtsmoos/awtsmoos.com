// B"H
/**
 * @file garments.js
 * @description
 * Chapter 3: The Wardrobe Of The Moving Capsule.
 *
 * The player collider is plain physics, but the visible GLB wears named
 * garments. This file translates inventory and data declarations into direct
 * mesh visibility updates on those GLB garment nodes.
 */

const GARMENT_NAMES = [
    "jacket", "outer-shirt", "pants", "shoes", "yamulka", "yarmulke",
    "top-hat", "glasses", "teffilin-arm-straps", "teffiln-arm-box",
    "head-teffilin-straps", "tefillin-head-box", "teffilin-head-box",
    "jacket-teffilin"
];

const BOOLEAN_GARMENT_MAP = {
    jacket: "jacket",
    shirt: "outer-shirt",
    "outer-shirt": "outer-shirt",
    pants: "pants",
    shoes: "shoes",
    yamulka: "yamulka",
    yarmulke: "yamulka",
    kippah: "yamulka",
    "top-hat": "top-hat",
    hat: "top-hat",
    glasses: "glasses"
};

/**
 * Applies all active player garments to the visible GLB.
 *
 * @param {object} player Player entity with inventory and modelMesh.
 * @returns {void}
 */
export function applyPlayerGarments(player) {
    const target = player?.modelMesh || player?.mesh;
    if (!target?.traverse) return;
    const clothes = collectActiveClothes(player);
    hideAllGarments(target);
    for (const cloth of clothes) revealCloth(target, cloth);
}

/**
 * Collects inventory equipment and data-defined clothes into one format.
 *
 * @param {object} player Player entity.
 * @returns {Array<{meshName:string|string[],color?:string|number}>} Cloth specs.
 */
function collectActiveClothes(player) {
    const clothes = [];
    const equipment = player?.inventory?.equipment;
    if (equipment) {
        for (const ref of Object.values(equipment)) {
            const item = resolveInventoryItem(player.inventory, ref);
            if (item?.customData?.meshName) clothes.push(item.customData);
        }
    }
    clothes.push(...normalizeClothes(player?.originalOptions?.clothes));
    clothes.push(...normalizeClothes(player?.customData?.clothes));
    return clothes;
}

/**
 * Resolves an equipped slot reference into the underlying item data.
 *
 * @param {object} inventory Inventory manager.
 * @param {object|null} ref Equipment reference.
 * @returns {object|null} Item data or null.
 */
function resolveInventoryItem(inventory, ref) {
    if (!inventory || !ref) return null;
    if (ref.sourceType === "inventory") return inventory.slots?.[ref.index] || null;
    if (ref.sourceType === "action") return inventory.actionSlots?.[ref.index] || null;
    if (ref.sourceType === "container") return inventory.activeContainer?.customData?.slots?.[ref.index] || null;
    return ref.customData ? ref : null;
}

/**
 * Turns array or object clothes declarations into garment specs.
 *
 * @param {Array|object|null} value Clothes declaration.
 * @returns {Array<{meshName:string|string[],color?:string|number}>} Cloth specs.
 */
function normalizeClothes(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(item => item?.meshName);
    return Object.entries(value)
        .filter(([, enabled]) => enabled)
        .map(([name, enabled]) => ({
            meshName: BOOLEAN_GARMENT_MAP[name] || name,
            color: typeof enabled === "string" || typeof enabled === "number" ? enabled : undefined
        }));
}

/**
 * Hides all known garment meshes before applying the active list.
 *
 * @param {object} root Visible GLB root.
 * @returns {void}
 */
function hideAllGarments(root) {
    root.traverse(child => {
        const garment = garmentName(child);
        if (GARMENT_NAMES.includes(garment)) child.visible = false;
    });
}

/**
 * Reveals and optionally recolors one garment spec.
 *
 * @param {object} root Visible GLB root.
 * @param {{meshName:string|string[],color?:string|number}} cloth Cloth spec.
 * @returns {void}
 */
function revealCloth(root, cloth) {
    const names = new Set(Array.isArray(cloth.meshName) ? cloth.meshName : [cloth.meshName]);
    root.traverse(child => {
        if (!names.has(garmentName(child))) return;
        child.visible = true;
        if (cloth.color) tintMaterial(child, cloth.color);
    });
}

function garmentName(child) {
    return child?.userData?.garment || child?.name || "";
}

function tintMaterial(child, color) {
    if (!child.material) return;
    if (!child.userData.materialCloned && child.material.clone) {
        child.material = child.material.clone();
        child.userData.materialCloned = true;
    }
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach(material => material?.color?.set?.(color));
}
