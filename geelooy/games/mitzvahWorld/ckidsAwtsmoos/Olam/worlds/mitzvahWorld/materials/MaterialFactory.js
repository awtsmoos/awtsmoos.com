// B"H
/** @file MaterialFactory.js @description Every factory material receives grain, texture, and parser-clear clone data. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { materialWithTexture } from "./ProceduralTextureKit.js?compact=true&v=awtsmoos-texture-kit-20260614-bh2";
function textured(kind, overrides = {}) { const m = materialWithTexture(kind, { side:overrides.side }); if (overrides.opacity !== undefined) { m.transparent = true; m.opacity = overrides.opacity; } if (overrides.color) { m.color.set(0xffffff); m.userData.tint = overrides.color; } return m; }
export const MATERIALS = Object.freeze({ JERUSALEM_STONE:textured("stone"), RED_BRICK:textured("brick"), DARK_WOOD:textured("wood"), SKY_GLASS:textured("glass", { opacity:.5, side:THREE.DoubleSide }), METAL:textured("stone"), GOLD:textured("gold"), LEAVES:textured("leaf", { side:THREE.DoubleSide }), FLARE:new THREE.MeshBasicMaterial({ map:null, color:0xffffff, transparent:true, opacity:.72, blending:THREE.AdditiveBlending, side:THREE.DoubleSide, depthWrite:false }) });
function cloneMap(base, clone) { if (base.map) clone.map = base.map; }
function cloneUserData(base, clone, name) { clone.userData = Object.assign({}, base.userData || {}, { noSolidColor:true, materialFactoryName:name }); }
export function getMaterial(name, overrides = {}) { const base = MATERIALS[name] || MATERIALS.JERUSALEM_STONE; const clone = base.clone(); cloneMap(base, clone); if (overrides.opacity !== undefined) { clone.transparent = true; clone.opacity = overrides.opacity; } cloneUserData(base, clone, name); return clone; }
