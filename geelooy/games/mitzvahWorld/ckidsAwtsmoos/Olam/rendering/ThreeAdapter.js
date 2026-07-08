// B"H
/**
 * ThreeAdapter
 * The single Olam-side bridge to THREE. Files that need the namespace may import
 * `{ THREE }`; files that need constructors may import only those names.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export { THREE };
export const AmbientLight = THREE.AmbientLight;
export const Box3 = THREE.Box3;
export const Box3Helper = THREE.Box3Helper;
export const Clock = THREE.Clock;
export const Color = THREE.Color;
export const DirectionalLight = THREE.DirectionalLight;
export const Fog = THREE.Fog;
export const Group = THREE.Group;
export const HemisphereLight = THREE.HemisphereLight;
export const Scene = THREE.Scene;
export const Vector2 = THREE.Vector2;
export const Vector3 = THREE.Vector3;
export const WebGL1Renderer = THREE.WebGL1Renderer;
export const WebGLRenderer = THREE.WebGLRenderer;
export default THREE;
