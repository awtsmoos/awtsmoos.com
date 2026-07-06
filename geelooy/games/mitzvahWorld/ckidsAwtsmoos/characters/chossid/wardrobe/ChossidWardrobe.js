// B"H
const SLOT_MATCHERS = Object.freeze({
  shirt:[/shirt$/i, /outer-shirt/i],
  coat:[/jacket/i, /coat/i],
  pants:[/pants/i, /trouser/i],
  shoes:[/shoes?/i, /boots?/i],
  hat:[/tophat/i, /top-hat/i, /yamulka/i, /yarmalka/i, /yarmulke/i]
});

export const CHOSSID_WARDROBE_COLORS = Object.freeze({
  black:"#070707",
  white:"#f4efe4",
  brown:"#6f4325",
  tan:"#b98f62",
  blue:"#2f75d6",
  navy:"#1e3158",
  gray:"#62666d",
  cream:"#ead8b2",
  gold:"#d9a72e",
  burgundy:"#662435"
});

export const CHOSSID_HAT_STYLES = Object.freeze(["topHat", "blackHat", "yamulka", "yarmalka", "cap", "none"]);

function clean(value) {
  return String(value || "").trim();
}

function lower(value) {
  return clean(value).toLowerCase();
}

function colorOf(value, fallback) {
  const key = lower(value);
  return CHOSSID_WARDROBE_COLORS[key] || clean(value) || fallback;
}

function objectName(object) {
  return lower(`${object?.userData?.garment || ""} ${object?.name || ""} ${object?.material?.name || ""}`);
}

function materialNames(child) {
  const materials = Array.isArray(child?.material) ? child.material : child?.material ? [child.material] : [];
  return materials.map(material => lower(material?.name));
}

function matchesSlot(child, slot) {
  const haystack = [objectName(child), ...materialNames(child)].join(" ");
  return SLOT_MATCHERS[slot]?.some(matcher => matcher.test(haystack));
}

function cloneMaterialOnce(child) {
  if (!child?.material || child.userData?.chossidWardrobeCloned) return;
  child.material = Array.isArray(child.material)
    ? child.material.map(material => material.clone())
    : child.material.clone();
  child.userData = child.userData || {};
  child.userData.chossidWardrobeCloned = true;
}

function setMaterialColor(child, color) {
  cloneMaterialOnce(child);
  const materials = Array.isArray(child.material) ? child.material : [child.material];
  for (const material of materials) {
    if (!material) continue;
    material.color?.set?.(color);
    material.needsUpdate = true;
  }
}

function isTopHat(child) {
  const name = objectName(child);
  return /top-hat|tophat/.test(name);
}

function isYamulka(child) {
  const name = objectName(child);
  return /yamulka|yarmalka|yarmulke/.test(name);
}

function normalizeHat(value) {
  const hat = lower(value || "topHat");
  if (hat === "blackhat" || hat === "tophat" || hat === "hat") return "topHat";
  if (hat === "yarmulke") return "yamulka";
  if (hat === "none" || hat === "nohat") return "none";
  if (hat === "cap") return "cap";
  return hat || "topHat";
}

export function normalizeChossidClothes(clothes = {}) {
  return {
    hat:normalizeHat(clothes.hat),
    shirt:colorOf(clothes.shirt, "#f4efe4"),
    coat:colorOf(clothes.coat, "#202020"),
    pants:colorOf(clothes.pants, "#151515"),
    shoes:colorOf(clothes.shoes, "#080808")
  };
}

function findHead(root) {
  let head = null;
  root?.traverse?.(child => {
    if (!head && child?.name === "mixamorig:Head") head = child;
  });
  root?.traverse?.(child => {
    if (!head && child?.isBone && /head$/i.test(child.name || "")) head = child;
  });
  root?.traverse?.(child => {
    if (!head && /head$/i.test(child?.name || "")) head = child;
  });
  return head;
}

function removeGeneratedCap(root) {
  const stale = [];
  root?.traverse?.(child => {
    if (child?.userData?.chossidGeneratedCap) stale.push(child);
  });
  for (const child of stale) child.parent?.remove?.(child);
}

function makeCapMesh(THREE, color) {
  const group = new THREE.Group();
  group.name = "chossid_generated_cap";
  group.userData.chossidGeneratedCap = true;

  const capMat = new THREE.MeshStandardMaterial({ color, roughness:.68, metalness:.02 });
  const crown = new THREE.Mesh(new THREE.SphereGeometry(.23, 20, 10, 0, Math.PI * 2, 0, Math.PI * .52), capMat);
  crown.name = "cap_crown";
  crown.scale.set(1.05, .38, .92);
  crown.rotation.x = Math.PI;
  crown.position.set(0, .19, 0);
  crown.userData.chossidGeneratedCap = true;
  group.add(crown);

  const brim = new THREE.Mesh(new THREE.BoxGeometry(.34, .035, .18), capMat);
  brim.name = "cap_brim";
  brim.position.set(0, .16, -.18);
  brim.rotation.x = -.18;
  brim.userData.chossidGeneratedCap = true;
  group.add(brim);
  return group;
}

function addCap(THREE, root, clothes) {
  if (!THREE || clothes.hat !== "cap") return null;
  const head = findHead(root);
  if (!head) return null;
  const cap = makeCapMesh(THREE, colorOf(clothes.coat, "#2f75d6"));
  cap.position.set(0, .18, .015);
  cap.scale.setScalar(1);
  head.add(cap);
  return cap;
}

export function collectChossidWardrobeSlots(root) {
  const slots = { shirt:[], coat:[], pants:[], shoes:[], hats:[], topHat:null, yamulka:null, generatedCap:null };
  root?.traverse?.(child => {
    if (!child?.isMesh && !child?.isSkinnedMesh) return;
    for (const slot of ["shirt", "coat", "pants", "shoes"]) {
      if (matchesSlot(child, slot)) slots[slot].push(child.name || child.material?.name || slot);
    }
    if (matchesSlot(child, "hat")) {
      slots.hats.push(child.name || child.material?.name || "hat");
      if (isTopHat(child)) slots.topHat = child.name || "top-hat";
      if (isYamulka(child)) slots.yamulka = child.name || "yarmalka";
    }
    if (child.userData?.chossidGeneratedCap) slots.generatedCap = child.name;
  });
  return slots;
}

export function applyChossidWardrobe(root, clothes = {}, options = {}) {
  const normalized = normalizeChossidClothes(clothes);
  const changed = { shirt:0, coat:0, pants:0, shoes:0, hats:0, generatedCap:false };
  removeGeneratedCap(root);

  root?.traverse?.(child => {
    if (!child?.isMesh && !child?.isSkinnedMesh) return;
    if (matchesSlot(child, "shirt")) { setMaterialColor(child, normalized.shirt); changed.shirt += 1; }
    if (matchesSlot(child, "coat")) { setMaterialColor(child, normalized.coat); changed.coat += 1; }
    if (matchesSlot(child, "pants")) { setMaterialColor(child, normalized.pants); changed.pants += 1; }
    if (matchesSlot(child, "shoes")) { setMaterialColor(child, normalized.shoes); changed.shoes += 1; }
    if (isTopHat(child)) {
      child.visible = normalized.hat === "topHat";
      if (normalized.hat === "topHat") setMaterialColor(child, colorOf(clothes.hatColor || clothes.coat, "#070707"));
      changed.hats += 1;
    }
    if (isYamulka(child)) {
      child.visible = normalized.hat === "yamulka";
      if (normalized.hat === "yamulka") setMaterialColor(child, colorOf(clothes.hatColor || clothes.coat, "#070707"));
      changed.hats += 1;
    }
  });

  const cap = addCap(options.THREE, root, normalized);
  changed.generatedCap = Boolean(cap);
  root.userData = root.userData || {};
  root.userData.chossidWardrobe = { clothes:normalized, changed, slots:collectChossidWardrobeSlots(root) };
  return root.userData.chossidWardrobe;
}

export function createChossidCharacterWardrobe(character = {}, defaults = {}) {
  return normalizeChossidClothes({ ...defaults, ...(character.clothes || character.wardrobe || {}) });
}

export default { applyChossidWardrobe, collectChossidWardrobeSlots, createChossidCharacterWardrobe, normalizeChossidClothes };
