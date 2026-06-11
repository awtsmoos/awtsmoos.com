// B"H
/**
 * @file boyrayNivra.js
 * @description
 * Chapter 438: The Chossid garment is judged by rooted geometry.
 *
 * The Awtsmoos revealed that “loaded” and “visible” are different gates. This
 * factory traces model creation, counts renderable vertices, records whether
 * the real GLB was used, and shares the visible-root seal with the worker probe.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import * as SkeletonUtils from '/games/scripts/jsm/utils/SkeletonUtils.js';
import Utils from '../../utils.js';
import BoneSanctifier from './boyrayNivra/BoneSanctifier.js';
import AttributeHealer from './boyrayNivra/AttributeHealer.js';
import generateThreeJsMesh from './helpers/generateMesh.js';

const TRACE_SEAL = 'visible-root-binding-20260610-bh710';
const HIDDEN_PARTS = new Set(['Camera', 'Camera.001', 'NurbsPath', 'Plane.001', 'Plane.002', 'teeth', 'tooth-distance']);
const HIDDEN_MATERIALS = new Set(['teffilinStrap']);
const livingTypes = new Set(['chossid', 'medabeir', 'customNpc', 'interactiveNpc']);

function isLiving(nivra) { return livingTypes.has(nivra?.type); }
function materialNameOf(node) { const material = Array.isArray(node.material) ? node.material[0] : node.material; return material?.name || ''; }
function hasHiddenAncestor(node) { for (let cur = node; cur; cur = cur.parent) if (HIDDEN_PARTS.has(cur.name)) return true; return false; }
function shouldHideLivingPart(node) { return hasHiddenAncestor(node) || HIDDEN_MATERIALS.has(materialNameOf(node)); }
function fallbackColor(nivra) { return nivra?.type === 'interactiveNpc' ? 0xf7f2df : 0x1f6fff; }
function fallbackGolem(nivra) { return { guf: { BoxGeometry: [0.9, Number(nivra?.height) || 1.8, 0.55] }, toyr: { MeshLambertMaterial: { color: fallbackColor(nivra) } } }; }

function traceModel(stage, nivra, payload = {}) {
  const data = { seal: TRACE_SEAL, stage, name: nivra?.name, type: nivra?.type, path: nivra?.path || null, at: Date.now(), ...payload };
  try {
    globalThis.__AWTSMOOS_MODEL_LOAD_TRACE__ ||= [];
    globalThis.__AWTSMOOS_MODEL_LOAD_TRACE__.push(data);
    globalThis.__AWTSMOOS_MODEL_LOAD_TRACE__ = globalThis.__AWTSMOOS_MODEL_LOAD_TRACE__.slice(-180);
  } catch {}
  console.info('B"H | MODEL_LOAD_TRACE', data);
}

function visibleRenderableSummary(root) {
  const summary = { meshes: 0, visibleMeshes: 0, vertices: 0, hiddenByRule: 0, materials: [] };
  root?.traverse?.(child => {
    if (!child?.isMesh && !child?.isSkinnedMesh) return;
    summary.meshes += 1;
    const material = Array.isArray(child.material) ? child.material[0] : child.material;
    if (shouldHideLivingPart(child)) summary.hiddenByRule += 1;
    if (material?.name) summary.materials.push(material.name);
    const count = Number(child.geometry?.attributes?.position?.count || child.geometry?.index?.count || 0);
    if (child.visible !== false && material?.visible !== false && material?.opacity !== 0 && count > 0 && !shouldHideLivingPart(child)) {
      summary.visibleMeshes += 1;
      summary.vertices += count;
    }
  });
  summary.materials = [...new Set(summary.materials)].slice(0, 20);
  return summary;
}
function hasVisibleMesh(root) { return visibleRenderableSummary(root).visibleMeshes > 0; }

function markLivingTree(root, nivra, fallback = false) {
  if (!root) return root;
  root.userData ||= {};
  Object.assign(root.userData, { isLiving: true, skipOctree: true, noOctree: true, awtsmoosGeneratedFallback: fallback });
  root.nivraAwtsmoos = nivra;
  root.traverse?.(child => {
    child.userData ||= {};
    Object.assign(child.userData, { isLiving: true, skipOctree: true, noOctree: true, awtsmoosGeneratedFallback: fallback });
    if (nivra.type === 'interactiveNpc') child.userData.isNpc = true;
    if (nivra.type === 'chossid') child.userData.isPlayer = true;
    child.nivraAwtsmoos = nivra;
  });
  return root;
}

async function livingFallback(context, nivra, reason = 'unspecified') {
  traceModel('fallback-create-start', nivra, { reason });
  const mesh = await generateThreeJsMesh(isLiving(nivra) ? fallbackGolem(nivra) : { guf: { BoxGeometry: [0.5, 0.5, 0.5] } }, context);
  mesh.name = `${nivra?.name || 'AwtsmoosLiving'}_VISIBLE_FALLBACK`;
  if (isLiving(nivra)) markLivingTree(mesh, nivra, true);
  else mesh.nivraAwtsmoos = nivra;
  traceModel('fallback-created', nivra, { reason, ...visibleRenderableSummary(mesh) });
  return mesh;
}

function prepareLoadedScene(scene, nivra) {
  const boneChildren = {}, garments = {}, materials = [];
  if (isLiving(nivra)) markLivingTree(scene, nivra, false);
  scene.traverse(child => {
    if (isLiving(nivra) && shouldHideLivingPart(child)) child.visible = false;
    if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
    BoneSanctifier.sanctify(child, boneChildren);
    AttributeHealer.heal(child);
    child.nivraAwtsmoos = nivra;
    if (child.material) { Utils.replaceMaterialWithLambert(child); materials.push(child.material); }
    if (child.userData?.garment) garments[child.userData.garment] = child;
  });
  nivra.boneChildren = boneChildren;
  nivra.materials = materials;
  nivra.garments = garments;
}

export default class {
  async boyrayNivra(nivra) {
    try {
      traceModel('boyray-start', nivra, { hasPath: Boolean(nivra.path), hasGolem: Boolean(nivra.golem) });
      if (nivra.path && typeof nivra.path === 'string') return await this.loadPathNivra(nivra);
      return await this.loadGolemNivra(nivra);
    } catch (error) {
      traceModel('boyray-failed', nivra, { reason: error?.message || String(error), stack: String(error?.stack || '').split('\n').slice(0, 5).join(' | ') });
      console.error(`B"H - ⚡ boyrayNivra failed for [${nivra.name}]:`, error);
      return await livingFallback(this, nivra, 'boyray-exception');
    }
  }

  async loadPathNivra(nivra) {
    let derech = nivra.path;
    if (derech.startsWith('awtsmoos://')) derech = this.getComponent(derech);
    traceModel('path-resolved', nivra, { resolved: derech });
    if (!derech) return await livingFallback(this, nivra, 'missing-resolved-path');
    const baseGltf = await this.loadGLTF(derech);
    if (!baseGltf?.scene) return await livingFallback(this, nivra, 'gltf-missing-scene');
    const clonedScene = SkeletonUtils.clone(baseGltf.scene);
    const summaryBefore = visibleRenderableSummary(clonedScene);
    traceModel('scene-cloned-before-prepare', nivra, summaryBefore);
    if (isLiving(nivra) && !hasVisibleMesh(clonedScene)) return await livingFallback(this, nivra, 'clone-has-no-visible-renderable');
    prepareLoadedScene(clonedScene, nivra);
    const summaryAfter = visibleRenderableSummary(clonedScene);
    traceModel('scene-prepared-real-model', nivra, { ...summaryAfter, animations: baseGltf.animations?.length || 0, cameras: baseGltf.cameras?.length || 0 });
    return { scene: clonedScene, animations: baseGltf.animations, cameras: baseGltf.cameras };
  }

  async loadGolemNivra(nivra) {
    traceModel('golem-start', nivra);
    const mesh = await generateThreeJsMesh(nivra.golem || { guf: { BoxGeometry: [1, 1, 1] } }, this);
    mesh.name = nivra.name;
    mesh.nivraAwtsmoos = nivra;
    if (isLiving(nivra)) markLivingTree(mesh, nivra, false);
    traceModel('golem-created', nivra, visibleRenderableSummary(mesh));
    return mesh;
  }
}
