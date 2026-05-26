#!/usr/bin/env node
/**
 * B"H
 * Chapter 3: The renderer membrane walks through the headless night.
 *
 * The Awtsmoos lets the Emerald world breathe even where no canvas shines.
 * This audit proves the capability vessel can be imported and used in Node
 * without summoning browser-only Three loaders, while preserving neutral
 * vectors, neutral primitive factories, neutral GLTF JSON loading, procedural
 * descriptors for future plain WebGL, graceful Olam init, and creation words
 * that loosen direct renderer bondage.
 */
import { assert } from './assertions.js';
import olamInit from '../../ckidsAwtsmoos/Olam/init.js';
import { createRendererCapabilities, loadRendererConstructors } from '../../ckidsAwtsmoos/Olam/graphics/RendererCapabilities.js';

const constructors = await loadRendererConstructors();
assert(constructors.GLTFLoader === null, 'Headless GLTFLoader constructor should stay null', constructors);
assert(constructors.DRACOLoader === null, 'Headless DRACOLoader constructor should stay null', constructors);

const renderer = await createRendererCapabilities();
const gltfModel = await renderer.loadModel('/virtual/tree.gltf', {
  fetcher: async () => ({
    text: async () => JSON.stringify({
      asset: { version: '2.0', generator: 'AwtsmoosNeutralTest' },
      scene: 0,
      scenes: [{ name: 'TestScene', nodes: [0] }],
      nodes: [{ name: 'RootTree', mesh: 0, translation: [1, 2, 3] }],
      meshes: [{ name: 'TreeMesh', primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 0 }] }],
      materials: [{ name: 'LeafLight', doubleSided: true }],
      buffers: [{ uri: 'tree.bin', byteLength: 36 }],
      bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36 }],
      accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3' }]
    })
  })
});
assert(gltfModel.kind === 'neutralGltf', 'GLTF JSON should load through the neutral procedural loader', gltfModel);
assert(gltfModel.nodes[0].name === 'RootTree' && gltfModel.meshes[0].primitives[0].attributes.POSITION === 0, 'Neutral GLTF should preserve node and primitive structure', gltfModel);

const vector = renderer.createVector3(1, 2, 3).add({ x: 4, y: 5, z: 6 });
assert(vector.x === 5 && vector.y === 7 && vector.z === 9, 'Neutral vector should support basic math', vector);

const phaseOneFactories = {
  quaternion: renderer.createQuaternion(1, 2, 3, 4),
  euler: renderer.createEuler(0.1, 0.2, 0.3, 'YXZ'),
  camera: renderer.createPerspectiveCamera(75, 1.5, 0.1, 500),
  instancedMesh: renderer.createInstancedMesh('geo', 'mat', 7),
  line: renderer.createLine('lineGeo', 'lineMat'),
  sphere: renderer.createSphere(3, 12, 6),
  directionalLight: renderer.createDirectionalLight(0xffeeaa, 2),
  ambientLight: renderer.createAmbientLight(0x112233, 0.5),
  texture: renderer.createTexture('image-token'),
  audioListener: renderer.createAudioListener()
};

for (const [name, descriptor] of Object.entries(phaseOneFactories)) {
  assert(descriptor?.rendererNeutral === true, `Headless ${name} should be a renderer-neutral descriptor`, descriptor);
}

const neutralRenderable = renderer.describeRenderable({
  geometry: renderer.describeBox(2, 3, 4),
  material: renderer.describeMaterial('lambert', { color: 0x5cb85c }),
  metadata: { source: 'audit' },
  semanticAnchors: ['plain-webgl-ready']
});
assert(neutralRenderable.rendererNeutral === true && neutralRenderable.geometry.type === 'box', 'Procedural descriptors should be renderer-neutral and serializable', neutralRenderable);
assert(JSON.parse(JSON.stringify(neutralRenderable)).semanticAnchors[0] === 'plain-webgl-ready', 'Procedural descriptors should survive JSON serialization', neutralRenderable);

const group = renderer.createGroup();
group.add({ name: 'spark' });
assert(Array.isArray(group.children) && group.children.length === 1, 'Headless group should collect children', group);
assert(renderer.createRaycaster() === null, 'Headless raycaster should remain absent until renderer exists');
assert(renderer.createGltfLoader() === null, 'Headless GLTF loader factory should return null');
assert(renderer.createDracoLoader() === null, 'Headless Draco loader factory should return null');

const olam = {};
const ok = await olamInit(olam);
assert(ok === true, 'Olam init should complete without browser loader constructors', { ok });
assert(olam.rendererCapabilities, 'Olam init should attach renderer capabilities', olam);
assert(!olam.loader, 'Headless Olam init should not fake a GLTF loader', olam);

console.log(JSON.stringify({
  ok: true,
  checks: {
    constructorsNull: true,
    neutralGltf: { nodes: gltfModel.nodes.length, meshes: gltfModel.meshes.length, materials: gltfModel.materials.length },
    vector: vector.toJSON(),
    phaseOneFactories: Object.keys(phaseOneFactories),
    proceduralDescriptor: neutralRenderable.semanticAnchors[0],
    groupChildren: group.children.length,
    olamHasCapabilities: Boolean(olam.rendererCapabilities),
    loaderAbsentInHeadless: !olam.loader
  }
}, null, 2));
