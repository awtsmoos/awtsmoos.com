// B"H
/**
 * @file boyrayNivra.js
 * @description
 * Chapter 439: model loading becomes quiet and exact.
 *
 * The Awtsmoos sees every garment without shouting every stitch into the
 * console. Real living GLBs are cloned, sanctified, and traced in memory only;
 * fallbacks are last-resort bodies, never a second body layered over a real one.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import * as SkeletonUtils from '/games/scripts/jsm/utils/SkeletonUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import Utils from '../../utils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import BoneSanctifier from './boyrayNivra/BoneSanctifier.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import AttributeHealer from './boyrayNivra/AttributeHealer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import generateThreeJsMesh from './helpers/generateMesh.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { hasVisibleLivingRenderable, sanitizeLivingModelTree, shouldHideLivingNode } from '../worlds/mitzvahWorld/npcs/LivingModelSanitizer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { sanitizeRenderGeometryTree } from '../worlds/mitzvahWorld/runtime/RenderGeometrySanitizer.js?compact=true&v=total-overhaul-render-sanitize-20260705-bh1';

const TRACE_SEAL = 'visible-root-binding-20260610-bh710';
const livingTypes = new Set(['chossid', 'medabeir', 'customNpc', 'interactiveNpc']);

function isLiving(nivra) { return livingTypes.has(nivra?.type); }
function fallbackColor(nivra) { return nivra?.type === 'interactiveNpc' ? 0xf7f2df : 0x1f6fff; }
function fallbackGolem(nivra) { return { guf: { BoxGeometry: [0.9, Number(nivra?.height) || 1.8, 0.55] }, toyr: { MeshLambertMaterial: { color: fallbackColor(nivra) } } }; }
function debugConsole(method, ...args) { if (globalThis.__AWTSMOOS_DEBUG__ === true) console[method]?.(...args); }

function traceModel(stage, nivra, payload = {}) {
  const data = { seal: TRACE_SEAL, stage, name: nivra?.name, type: nivra?.type, path: nivra?.path || null, at: Date.now(), ...payload };
  try { globalThis.__AWTSMOOS_MODEL_LOAD_TRACE__ ||= []; globalThis.__AWTSMOOS_MODEL_LOAD_TRACE__.push(data); globalThis.__AWTSMOOS_MODEL_LOAD_TRACE__ = globalThis.__AWTSMOOS_MODEL_LOAD_TRACE__.slice(-180); } catch {}
  debugConsole('info', 'B"H | MODEL_LOAD_TRACE', data);
}
function visibleRenderableSummary(root) {
  const summary = { meshes: 0, visibleMeshes: 0, vertices: 0, hiddenByRule: 0, materials: [] };
  root?.traverse?.(child => {
    if (!child?.isMesh && !child?.isSkinnedMesh) return;
    summary.meshes += 1;
    const material = Array.isArray(child.material) ? child.material[0] : child.material;
    if (shouldHideLivingNode(child)) summary.hiddenByRule += 1;
    if (material?.name) summary.materials.push(material.name);
    const count = Number(child.geometry?.attributes?.position?.count || child.geometry?.index?.count || 0);
    if (child.visible !== false && material?.visible !== false && material?.opacity !== 0 && count > 0 && !shouldHideLivingNode(child)) { summary.visibleMeshes += 1; summary.vertices += count; }
  });
  summary.materials = [...new Set(summary.materials)].slice(0, 20);
  return summary;
}
function markLivingTree(root, nivra, fallback = false) {
  if (!root) return root;
  Object.assign(root.userData ||= {}, { isLiving: true, skipOctree: true, noOctree: true, awtsmoosGeneratedFallback: fallback });
  root.nivraAwtsmoos = nivra;
  root.traverse?.(child => {
    Object.assign(child.userData ||= {}, { isLiving: true, skipOctree: true, noOctree: true, awtsmoosGeneratedFallback: fallback });
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
  if (isLiving(nivra)) markLivingTree(mesh, nivra, true); else mesh.nivraAwtsmoos = nivra;
  traceModel('fallback-created', nivra, { reason, ...visibleRenderableSummary(mesh) });
  return mesh;
}
function prepareLoadedScene(scene, nivra) {
  const boneChildren = {}, garments = {}, materials = [];
  if (isLiving(nivra)) { markLivingTree(scene, nivra, false); sanitizeLivingModelTree(scene, nivra.type === 'interactiveNpc' ? { isNpc: true } : { isPlayer: true }); }
  scene.traverse(child => {
    if (isLiving(nivra) && shouldHideLivingNode(child)) child.visible = false;
    if (child.isMesh) { child.castShadow = false; child.receiveShadow = true; }
    BoneSanctifier.sanctify(child, boneChildren);
    AttributeHealer.heal(child);
    child.nivraAwtsmoos = nivra;
    if (child.material) { Utils.replaceMaterialWithLambert(child); materials.push(child.material); }
    if (child.userData?.garment) garments[child.userData.garment] = child;
  });
  sanitizeRenderGeometryTree(scene, { warn:false });
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
      debugConsole('error', `B"H - boyrayNivra failed for [${nivra.name}]`, error);
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
    traceModel('scene-cloned-before-prepare', nivra, visibleRenderableSummary(clonedScene));
    if (isLiving(nivra) && !hasVisibleLivingRenderable(clonedScene)) return await livingFallback(this, nivra, 'clone-has-no-visible-renderable');
    prepareLoadedScene(clonedScene, nivra);
    traceModel('scene-prepared-real-model', nivra, { ...visibleRenderableSummary(clonedScene), animations: baseGltf.animations?.length || 0, cameras: baseGltf.cameras?.length || 0 });
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
