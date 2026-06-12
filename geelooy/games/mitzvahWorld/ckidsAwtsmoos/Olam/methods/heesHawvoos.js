// B"H
/**
 * @file heesHawvoos.js
 * @description Chapter 71: the render river receives a worker-safe window.
 * The Awtsmoos has no body and no form, yet He grants every vessel exactly the
 * boundary it needs. Here the OffscreenCanvas worker had sky, breath, scene,
 * and renderer, but the local Three fork whispered `window.wowd` inside a
 * debug catch. In worker-land that name is void. This module therefore raises a
 * tiny harmless mirror before rendering, so the canvas can keep singing.
 */
import UniversePulsator from '../oyved/UniversePulsator.js';
import RenderTrace from './canvas/RenderTrace.js?v=village-polish-20260612-bh811';

const FOCUS_MOVING_EPSILON_SQ = 0.0001;
const VANITY_TYPES = new Set(['LineSegments', 'Line', 'Points', 'AxesHelper', 'GridHelper', 'BoxHelper']);
const MAX_ENTITY_WARNINGS = 10;

function ensureWorkerWindowVessel() {
  if (typeof globalThis.window !== 'undefined') return globalThis.window;
  const vessel = globalThis;
  try { Object.defineProperty(globalThis, 'window', { value: vessel, configurable: true }); }
  catch (_) { globalThis.window = vessel; }
  vessel.wowd = vessel.wowd || false;
  return vessel;
}

function shouldDriveOctreeFocus(nivra, self) {
  if (!nivra) return false;
  if (nivra === self.chossid || nivra === self.player || nivra.type === 'chossid') return true;
  const moving = nivra.moving || {};
  const hasIntent = Boolean(moving.forward || moving.backward || moving.stridingLeft || moving.stridingRight || moving.turningLeft || moving.turningRight || moving.jump || nivra.movingAutomatically || nivra.navTarget || nivra.currentPath || nivra._isMoving);
  return hasIntent || ((nivra.velocity?.lengthSq?.() || 0) > FOCUS_MOVING_EPSILON_SQ);
}

function isWorkerHostileRenderNode(node) {
  if (!node) return false;
  if (node.isLine || node.isLineSegments || node.isPoints) return true;
  if (VANITY_TYPES.has(node.type)) return true;
  const geometryType = String(node.geometry?.type || '');
  return geometryType.includes('BufferGeometry') && (node.material?.isLineBasicMaterial || node.material?.isPointsMaterial);
}

function purgeWorkerHostileRenderNodes(scene) {
  if (!scene?.traverse) return 0;
  let hidden = 0;
  scene.traverse(node => {
    if (!isWorkerHostileRenderNode(node)) return;
    if (node.visible !== false) hidden += 1;
    node.visible = false;
    node.frustumCulled = true;
    node.renderOrder = -999;
    node.userData ||= {};
    node.userData.workerRenderExiled = true;
  });
  return hidden;
}

function safeRenderTrace(name, data) {
  if (globalThis.__AWTSMOOS_RENDER_TRACE__ !== true) return;
  try { RenderTrace.speak(name, data); }
  catch (error) { console.warn('B"H | RENDER_TRACE_FAILED', { name, message: error?.message || String(error) }); }
}

function compactError(error) {
  return { name: error?.name || 'Error', message: error?.message || String(error), stack: String(error?.stack || '').split('\n').slice(0, 5).join(' | ') };
}

function numberOk(value) { return Number.isFinite(Number(value)); }
function vectorOk(v) { return !v || (numberOk(v.x) && numberOk(v.y) && numberOk(v.z)); }
function matrixOk(m) { return !m?.elements || m.elements.every(numberOk); }
function nodeOwnerName(node) { return node?.nivraAwtsmoos?.name || node?.parent?.nivraAwtsmoos?.name || node?.name || '(unnamed)'; }
function copyVector(v) { return v ? { x: Number(v.x), y: Number(v.y), z: Number(v.z) } : null; }

function inspectBadRenderNodes(scene, limit = 8) {
  const bad = [];
  scene?.traverse?.(node => {
    if (bad.length >= limit) return;
    const invalid = !vectorOk(node.position) || !vectorOk(node.scale) || !vectorOk(node.rotation) || !matrixOk(node.matrix) || !matrixOk(node.matrixWorld);
    if (!invalid) return;
    bad.push({ name: nodeOwnerName(node), type: node.type, objectName: node.name, position: copyVector(node.position), scale: copyVector(node.scale) });
  });
  return bad;
}

function exileBadRenderNodes(scene) {
  let count = 0;
  scene?.traverse?.(node => {
    const invalid = !vectorOk(node.position) || !vectorOk(node.scale) || !vectorOk(node.rotation) || !matrixOk(node.matrix) || !matrixOk(node.matrixWorld);
    if (!invalid) return;
    node.visible = false;
    node.userData ||= {};
    node.userData.awtsmoosRenderExiled = true;
    count += 1;
  });
  return count;
}

function reportFatalOnce(self, key, payload) {
  self.__renderFatalReports ||= new Set();
  if (self.__renderFatalReports.has(key)) return false;
  self.__renderFatalReports.add(key);
  console.error('B"H | AWTSMOOS_RENDER_FATAL_ONCE', payload);
  safeRenderTrace('heesHawvoos:render_fatal_once', payload);
  self.ayshPeula?.('ui event', 'effectsOverlay', { text: `Render error: ${payload.message}`, color: '#ff6b6b', fatal: true, details: payload.badNodes });
  globalThis.postMessage?.({ type: 'awtsmoosRenderFatal', payload });
  return true;
}

function stopRenderLoop(self) {
  self.__renderPausedAfterFatal = true;
  self.pulsator?.stop?.();
  self.renderer?.setAnimationLoop?.(null);
}

function handleRenderFailure(self, loopCounter, error) {
  if (self.__renderPausedAfterFatal) return;
  const compact = compactError(error);
  const badNodes = inspectBadRenderNodes(self.scene);
  const exiled = exileBadRenderNodes(self.scene) + purgeWorkerHostileRenderNodes(self.scene);
  const key = `${compact.name}:${compact.message}:${badNodes.map(n => n.name).join('|')}`;
  stopRenderLoop(self);
  reportFatalOnce(self, key, { frame: loopCounter, ...compact, badNodes, exiled, paused: true, stopped: true });
}

function warnOncePerEntity(self, nivra, error) {
  self.__entityLoopWarnings ||= new Set();
  const key = `${nivra?.type}:${nivra?.name}:${error?.message || error}`;
  if (self.__entityLoopWarnings.size >= MAX_ENTITY_WARNINGS || self.__entityLoopWarnings.has(key)) return;
  self.__entityLoopWarnings.add(key);
  console.warn('B"H | ENTITY_LOOP_FAILED_ONCE', { type: nivra?.type, name: nivra?.name, ...compactError(error) });
}

export default class HeesHawvoosManager {
  async heesHawvoos() {
    const self = this;
    let loopCounter = 0;
    ensureWorkerWindowVessel();
    safeRenderTrace('heesHawvoos:ignite', { hasRenderer: Boolean(self.renderer), hasScene: Boolean(self.scene), hasAyin: Boolean(self.ayin), hasCamera: Boolean(self.activeCamera || self.ayin?.camera), sceneChildren: self.scene?.children?.length || 0, nivrayim: self.nivrayim?.length || 0 });
    this.updateStep = (dt) => {
      if (self.__renderPausedAfterFatal) return;
      loopCounter += 1;
      const shouldLog = loopCounter <= 3 || loopCounter % 1000 === 0;
      try { self.shlichusHandler?.update?.(dt); self.environment?.update?.(dt); self.placementManager?.update?.(dt); } catch (e) { if (shouldLog) console.error('B"H | HEES_SYSTEM_FAILED_ONCE', compactError(e)); }
      try { this.updateOctreeFoci(self); } catch (e) { if (shouldLog) console.error('B"H | HEES_OCTREE_FAILED_ONCE', compactError(e)); }
      try { this.updateNivrayim(self, dt); } catch (e) { if (shouldLog) console.error('B"H | HEES_ENTITY_LOOP_FAILED_ONCE', compactError(e)); }
      try { self.combatManager?.update?.(dt); } catch (e) { if (shouldLog) console.error('B"H | HEES_COMBAT_FAILED_ONCE', compactError(e)); }
      try { self.ayin?.update?.(dt); } catch (e) { if (shouldLog) console.error('B"H | HEES_CAMERA_FAILED_ONCE', compactError(e)); }
      if (loopCounter === 1 || self.__renderTreeDirty) { purgeWorkerHostileRenderNodes(self.scene); self.__renderTreeDirty = false; }
      this.renderFrame(self, loopCounter);
    };
    this.pulsator = new UniversePulsator(this);
    this.pulsator.ignite();
  }

  updateOctreeFoci(self) {
    if (!self.worldOctree) return;
    const foci = [];
    const p = self.chossid || self.player;
    if (p?.mesh?.position && p?.velocity && !p.__spikeColliderDisabled) foci.push({ position: p.mesh.position, velocity: p.velocity });
    for (const n of self.nivrayim || []) {
      if (n !== p && n?.velocity && n?.mesh?.position && n?.onFloor !== undefined && n?.isReady && shouldDriveOctreeFocus(n, self) && !n.__spikeColliderDisabled) foci.push({ position: n.mesh.position, velocity: n.velocity });
    }
    if (foci.length > 0) self.worldOctree.update(foci, null);
  }

  updateNivrayim(self, dt) {
    for (const nivra of self.nivrayim || []) {
      if (nivra?.isReady && nivra?.heesHawveh && typeof nivra.heesHawvoos === 'function') {
        try { nivra.heesHawvoos(dt); } catch (err) { warnOncePerEntity(self, nivra, err); }
      }
    }
  }

  renderFrame(self, loopCounter) {
    if (!self.renderer || !self.scene) return loopCounter <= 5 && safeRenderTrace('heesHawvoos:no_renderer_or_scene', { frame: loopCounter, hasRenderer: Boolean(self.renderer), hasScene: Boolean(self.scene) });
    const activeEye = self.activeCamera || self.ayin?.camera || null;
    if (!activeEye) return loopCounter <= 5 && safeRenderTrace('heesHawvoos:no_active_camera', { frame: loopCounter, hasAyin: Boolean(self.ayin), hasAyinCamera: Boolean(self.ayin?.camera) });
    if (self.__renderInFlight) return;
    try {
      ensureWorkerWindowVessel();
      const result = typeof self.renderer.renderAsync === 'function' ? self.renderer.renderAsync(self.scene, activeEye) : self.renderer.render(self.scene, activeEye);
      if (result?.then) {
        self.__renderInFlight = true;
        result.catch(error => handleRenderFailure(self, loopCounter, error)).finally(() => { self.__renderInFlight = false; });
      }
      if (loopCounter > 3 && !self.__firstRenderConfirmed) {
        self.__firstRenderConfirmed = true;
        safeRenderTrace('heesHawvoos:first_render_confirmed', { frame: loopCounter, sceneChildren: self.scene?.children?.length || 0, cameraPosition: activeEye.position ? copyVector(activeEye.position) : null });
        self.ayshPeula?.('rendered first time');
      }
    } catch (renderErr) { handleRenderFailure(self, loopCounter, renderErr); }
  }
}
