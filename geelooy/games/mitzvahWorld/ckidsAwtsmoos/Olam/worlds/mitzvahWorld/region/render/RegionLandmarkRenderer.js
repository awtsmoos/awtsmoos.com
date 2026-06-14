// B"H
/**
 * @file RegionLandmarkRenderer.js
 * @description
 * Chapter 1003: the old blob landmark tree is gone.
 * The landmark layer no longer emits a single canopy blob on a stick. It emits
 * only stones and markers; complex trees are handled by the complex tree system.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { regionGeometry } from "./RegionGeometry.js?v=leaflet-grass-tuft-20260614-bh1";
import { regionMaterial } from "./RegionMaterials.js?v=actual-grass-texture-20260614-bh1";
import { groundY } from "./RegionGround.js";
import { sealRegionVisual } from "./RegionSeal.js";
function add(root, olam, kind, mat, x, z, s, yoff = 0) { const m = new THREE.Mesh(regionGeometry(kind), regionMaterial(mat, { simple: false })); m.position.set(x, groundY(olam, x, z) + yoff + s[1] * .5, z); m.scale.set(s[0], s[1], s[2]); root.add(m); return m; }
export function buildLandmarkRenderer(olam) { const root = new THREE.Group(); root.name = "living_region_landmarks_no_old_blob_tree"; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; add(root, olam, "rock", i % 3 ? "slateStone" : "marbleWhite", 168 + Math.cos(a) * 11, -88 + Math.sin(a) * 11, [1.2, 1.4, .8]); } add(root, olam, "rock", "goldHammered", 0, 10, [.42, .25, .42], .05); root.userData.stats = { landmarks: 13, oldBlobTreeRemoved: true }; return sealRegionVisual(root); }
