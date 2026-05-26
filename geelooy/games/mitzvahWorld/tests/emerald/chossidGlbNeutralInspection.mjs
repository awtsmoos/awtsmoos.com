#!/usr/bin/env node
/**
 * B"H
 * Fetches the real chossid.glb URL and inspects it through the neutral GLB
 * parser, without Three.js GLTFLoader.
 */
import { assert } from './assertions.js';
import { CHOSSID_GLB_PATH } from '../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/npcs/ChossidGlbPath.js';
import { loadNeutralGltf } from '../../ckidsAwtsmoos/Olam/graphics/procedural/NeutralGltfLoader.js';

function lowerList(items) {
  return items.map(item => String(item.name || '').toLowerCase()).filter(Boolean);
}

function inferClothing(descriptor) {
  const names = [
    ...lowerList(descriptor.nodes),
    ...lowerList(descriptor.meshes),
    ...lowerList(descriptor.materials),
    ...lowerList(descriptor.images)
  ];
  const joined = names.join(' | ');
  const clues = [];
  for (const word of ['hat', 'cap', 'yarmulke', 'kippah', 'bekishe', 'kapote', 'coat', 'jacket', 'shirt', 'pants', 'trousers', 'shoes', 'boots', 'belt', 'tzitzis', 'tallit', 'talis', 'wedding', 'white', 'black']) {
    if (joined.includes(word)) clues.push(word);
  }
  return { clues, names: names.slice(0, 80) };
}

const descriptor = await loadNeutralGltf(CHOSSID_GLB_PATH, fetch);
assert(descriptor.kind === 'neutralGlb', 'Real chossid URL should parse as neutral GLB', descriptor.glb || {});
assert(descriptor.nodes.length > 0, 'chossid GLB should contain nodes', descriptor);
assert(descriptor.meshes.length > 0, 'chossid GLB should contain meshes', descriptor);

const clothing = inferClothing(descriptor);
const report = {
  ok: true,
  url: CHOSSID_GLB_PATH,
  glb: descriptor.glb,
  counts: {
    scenes: descriptor.scenes.length,
    nodes: descriptor.nodes.length,
    meshes: descriptor.meshes.length,
    materials: descriptor.materials.length,
    skins: descriptor.skins.length,
    animations: descriptor.animations.length,
    textures: descriptor.textures.length,
    images: descriptor.images.length,
    accessors: descriptor.accessors.length,
    bufferViews: descriptor.bufferViews.length
  },
  materialNames: descriptor.materials.map(material => material.name),
  meshNames: descriptor.meshes.map(mesh => mesh.name),
  nodeNames: descriptor.nodes.map(node => node.name).slice(0, 120),
  clothingInference: clothing
};
console.log(JSON.stringify(report, null, 2));
