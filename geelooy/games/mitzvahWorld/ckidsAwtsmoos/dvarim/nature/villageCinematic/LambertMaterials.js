// B"H
/**
 * @file LambertMaterials.js
 * @description
 * Chapter 57: The old local material spring now feeds from the worker-safe
 * library river. This compatibility file keeps any older imports alive without
 * bringing back the forbidden `document.createElement` wound.
 */
export { lambertBark as barkMaterial, lambertNoise as stoneMaterial, lambertNoise as dirtMaterial, lambertLeaf as leafCardMaterial } from "../../../../../../libs/awtsmoos3d/lambert.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
