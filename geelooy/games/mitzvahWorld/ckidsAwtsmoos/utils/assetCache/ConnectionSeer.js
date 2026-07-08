// B"H
/**
 * @file ConnectionSeer.js
 * @description Chapter 90: uppercase compatibility gate. The public server had
 * stale imports into `utils/AssetCache/*`; this shim redirects them to the real
 * lowercase vessel so mobile Chrome receives JavaScript, not JSON.
 */
export { default } from '../assetCache/ConnectionSeer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
