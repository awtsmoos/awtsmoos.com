// B"H
/** @file LivingModelSanitizer.js @description Sanitizes living model trees without optional-chain or logical-assignment syntax. */
const HIDDEN_NODE_NAMES = new Set(["Camera","Camera.001","NurbsPath","Plane.001","Plane.002","teeth","tooth-distance"]);
const HIDDEN_MATERIAL_NAMES = new Set(["teffilinStrap"]);
const CARRIER_NAMES = new Set(["NPC_INVISIBLE_CARRIER","GUIDE_EXPLICIT_TAP_COLLIDER_RAYCAST_ONLY"]);
function dataOf(node) { return node && node.userData ? node.userData : {}; }
function materialName(node) { const material = Array.isArray(node.material) ? node.material[0] : node.material; return material && material.name ? material.name : ""; }
function isMeshLike(child) { return Boolean(child && (child.isMesh || child.isSkinnedMesh)); }
function visit(root, fn) { if (root && typeof root.traverse === "function") root.traverse(fn); }
export function isDrawableMaterial(material) { if (!material) return false; if (material.visible === false) return false; if (Number(material.opacity) === 0) return false; return true; }
export function shouldHideLivingNode(node) { if (!node) return false; if (CARRIER_NAMES.has(node.name)) return true; const data = dataOf(node); if (data.awtsmoosRayProxy || data.isPlayerFallback) return true; for (let current = node; current; current = current.parent) if (HIDDEN_NODE_NAMES.has(current.name)) return true; return HIDDEN_MATERIAL_NAMES.has(materialName(node)); }
export function hasVisibleLivingRenderable(root) { let found = false; visit(root, child => { if (found || !isMeshLike(child)) return; if (child.visible === false || shouldHideLivingNode(child)) return; const materials = Array.isArray(child.material) ? child.material : [child.material]; if (!materials.some(isDrawableMaterial)) return; const geometry = child.geometry || {}, attributes = geometry.attributes || {}, position = attributes.position || {}; const count = position.count || (geometry.index ? geometry.index.count : 0) || 0; if (count > 0) found = true; }); return found; }
export function cloneLivingMaterial(material) { if (Array.isArray(material)) return material.map(cloneLivingMaterial); return material && typeof material.clone === "function" ? material.clone() : material; }
export function sanitizeLivingModelTree(root, flags = {}) { visit(root, child => { if (!child.userData) child.userData = {}; Object.assign(child.userData, { isLiving:true, skipOctree:true, noOctree:true }, flags); if (shouldHideLivingNode(child)) child.visible = false; if (!isMeshLike(child)) return; if (child.material) child.material = cloneLivingMaterial(child.material); child.castShadow = false; child.receiveShadow = true; child.frustumCulled = flags.isNpc === true; }); return root; }
