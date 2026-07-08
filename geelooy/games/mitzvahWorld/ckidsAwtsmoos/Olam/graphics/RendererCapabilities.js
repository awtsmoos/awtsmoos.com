// B"H
/**
 * @file RendererCapabilities.js
 * @description
 * Chapter 1: The membrane of green fire.
 *
 * The Awtsmoos breathes existence through vessels, and this file is a tiny
 * vessel between Emerald's living meaning and the renderer that clothes it.
 * Three.js may still carry the visible garment today, but game systems should
 * increasingly ask for capabilities instead of gripping one renderer forever.
 *
 * This slice adds renderer-neutral creation words: quaternion, euler, camera,
 * instancing, lines, spheres, lights, textures, and audio listeners. When Three
 * is absent in Node, each factory returns serializable descriptors instead of
 * dead browser objects, so audits can keep walking through the night.
 */
import { createVector3, loadThree } from './ThreeBridge.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { loadModel } from './ModelLoader.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { boxDescriptor, geometryDescriptor, materialDescriptor, renderableDescriptor, sphereDescriptor } from './procedural/GeometryDescriptors.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { NeutralQuaternion, NeutralVector3 } from './procedural/NeutralMath.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

let cachedDracoLoaderCtor = null;
let cachedGltfLoaderCtor = null;

function canLoadBrowserModules() {
  return typeof window !== 'undefined' ||
    (typeof WorkerGlobalScope !== 'undefined' && globalThis.self instanceof WorkerGlobalScope);
}

async function loadBrowserConstructor(path, exportName, cacheGetter) {
  const cached = cacheGetter();
  if (cached) return cached;
  if (!canLoadBrowserModules()) return null;
  const mod = await import(path);
  return mod?.[exportName] || null;
}

function neutralDescriptor(kind, payload = {}) {
  return { kind, rendererNeutral: true, ...payload };
}

function createThreeOrDescriptor(three, ctorName, kind, args, payload = {}) {
  const Ctor = three?.[ctorName];
  return Ctor ? new Ctor(...args) : neutralDescriptor(kind, payload);
}

/**
 * Loads renderer constructors only when a browser renderer exists.
 * @returns {Promise<{GLTFLoader: Function|null, DRACOLoader: Function|null}>}
 */
export async function loadRendererConstructors() {
  cachedGltfLoaderCtor = await loadBrowserConstructor(
    '/games/scripts/jsm/loaders/GLTFLoader.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1',
    'GLTFLoader',
    () => cachedGltfLoaderCtor
  );
  cachedDracoLoaderCtor = await loadBrowserConstructor(
    '/games/scripts/jsm/loaders/DRACOLoader.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1',
    'DRACOLoader',
    () => cachedDracoLoaderCtor
  );
  return { GLTFLoader: cachedGltfLoaderCtor, DRACOLoader: cachedDracoLoaderCtor };
}

/**
 * Creates the current renderer capability vessel.
 * @param {object} options
 * @param {object|null} [options.three]
 * @returns {object}
 */
export async function createRendererCapabilities(options = {}) {
  const three = options.three || await loadThree();
  const constructors = await loadRendererConstructors();
  return {
    three,
    constructors,
    createVector3: (x = 0, y = 0, z = 0) => three?.Vector3 ? createVector3(x, y, z, three) : new NeutralVector3(x, y, z),
    createQuaternion: (x = 0, y = 0, z = 0, w = 1) => three?.Quaternion ? createThreeOrDescriptor(three, 'Quaternion', 'quaternion', [x, y, z, w], { x, y, z, w }) : new NeutralQuaternion(x, y, z, w),
    createEuler: (x = 0, y = 0, z = 0, order = 'XYZ') => createThreeOrDescriptor(three, 'Euler', 'euler', [x, y, z, order], { x, y, z, order }),
    createPerspectiveCamera: (fov = 60, aspect = 1, near = 0.1, far = 1000) => createThreeOrDescriptor(three, 'PerspectiveCamera', 'perspectiveCamera', [fov, aspect, near, far], { fov, aspect, near, far }),
    createGroup: () => three?.Group ? new three.Group() : { kind: 'group', rendererNeutral: true, children: [], add(child) { this.children.push(child); } },
    createRaycaster: (...args) => three?.Raycaster ? new three.Raycaster(...args) : null,
    createBox: (...args) => three?.BoxGeometry ? new three.BoxGeometry(...args) : neutralDescriptor('boxGeometry', { args }),
    createMaterial: (spec = {}) => three?.MeshBasicMaterial ? new three.MeshBasicMaterial(spec) : neutralDescriptor('material', { spec }),
    createMesh: (geometry = null, material = null) => three?.Mesh ? new three.Mesh(geometry, material) : neutralDescriptor('mesh', { geometry, material }),
    createInstancedMesh: (geometry = null, material = null, count = 0) => createThreeOrDescriptor(three, 'InstancedMesh', 'instancedMesh', [geometry, material, count], { geometry, material, count }),
    createLine: (geometry = null, material = null) => createThreeOrDescriptor(three, 'Line', 'line', [geometry, material], { geometry, material }),
    createSphere: (radius = 1, widthSegments = 16, heightSegments = 8) => createThreeOrDescriptor(three, 'SphereGeometry', 'sphereGeometry', [radius, widthSegments, heightSegments], { radius, widthSegments, heightSegments }),
    createDirectionalLight: (color = 0xffffff, intensity = 1) => createThreeOrDescriptor(three, 'DirectionalLight', 'directionalLight', [color, intensity], { color, intensity }),
    createAmbientLight: (color = 0xffffff, intensity = 1) => createThreeOrDescriptor(three, 'AmbientLight', 'ambientLight', [color, intensity], { color, intensity }),
    createTexture: (image = null) => createThreeOrDescriptor(three, 'Texture', 'texture', [image], { image }),
    createAudioListener: () => createThreeOrDescriptor(three, 'AudioListener', 'audioListener', [], {}),
    describeGeometry: geometryDescriptor,
    describeMaterial: materialDescriptor,
    describeRenderable: renderableDescriptor,
    describeBox: boxDescriptor,
    describeSphere: sphereDescriptor,
    loadModel,
    createGltfLoader: () => constructors.GLTFLoader ? new constructors.GLTFLoader() : null,
    createDracoLoader: () => constructors.DRACOLoader ? new constructors.DRACOLoader() : null
  };
}
