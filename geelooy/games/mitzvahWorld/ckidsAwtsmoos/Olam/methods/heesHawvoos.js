// B"H
/**
 * @file heesHawvoos.js
 * @description Chapter 70: the render river stops when poison is found. The
 * Awtsmoos reports one fatal error to the user, exiles bad matrices, catches
 * async renderer promises, and stops the pulsator so Three cannot keep chanting
 * the same NaN into the console after the diagnosis is known.
 */
import UniversePulsator from '../oyved/UniversePulsator.js';
import RenderTrace from './canvas/RenderTrace.js';

const FOCUS_MOVING_EPSILON_SQ = 0.0001;
const VANITY_TYPES = new Set(['LineSegments', 'Line', 'Points', 'AxesHelper', 'GridHelper', 'BoxHelper']);
const MAX_ENTITY_WARNINGS = 10;

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
    safeRenderTrace('heesHawvoos:ignite', { hasRenderer: Boolean(self.renderer), hasScene: Boolean(self.scene), hasAyin: Boolean(self.ayin), hasCamera: Boolean(self.activeCamera || self.ayin?.camera), sceneChildren: self.scene?.children?.length || 0, nivrayim: self.nivrayim?.length || 0 });
    this.updateStep = (dt) => {
      if (self.__renderPausedAfterFatal) return;
      loopCounter += 1;
      const shouldLog = loopCounter <= 3 || loopCounter % 1000 === 0;
      if (loopCounter <= 5) safeRenderTrace('heesHawvoos:frame_state', { frame: loopCounter, dt, hasRenderer: Boolean(self.renderer), hasScene: Boolean(self.scene), hasCamera: Boolean(self.activeCamera || self.ayin?.camera), sceneChildren: self.scene?.children?.length || 0, nivrayim: self.nivrayim?.length || 0 });
      try { self.shlichusHandler?.update?.(dt); self.environment?.update?.(dt); self.placementManager?.update?.(dt); }
      catch (e) { if (shouldLog) console.error('B"H | HEES_SYSTEM_FAILED_ONCE', compactError(e)); }
      try { this.updateOctreeFoci(self); }
      catch (e) { if (shouldLog) console.error('B"H | HEES_OCTREE_FAILED_ONCE', compactError(e)); }
      try { this.updateNivrayim(self, dt); }
      catch (e) { if (shouldLog) console.error('B"H | HEES_ENTITY_LOOP_FAILED_ONCE', compactError(e)); }
      try { self.combatManager?.update?.(dt); }
      catch (e) { if (shouldLog) console.error('B"H | HEES_COMBAT_FAILED_ONCE', compactError(e)); }
      try { self.ayin?.update?.(dt); }
      catch (e) { if (shouldLog) console.error('B"H | HEES_CAMERA_FAILED_ONCE', compactError(e)); }
      const exiled = loopCounter <= 8 || loopCounter % 30 === 0 ? purgeWorkerHostileRenderNodes(self.scene) : 0;
      if (exiled > 0 && (loopCounter <= 10 || loopCounter % 120 === 0)) console.warn('B"H | WORKER_RENDER_EXILED_VANITY', { frame: loopCounter, exiled });
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
      if (n !== self.chossid && n !== self.player && n?.velocity && n?.mesh?.position && n?.onFloor !== undefined && n?.isReady && shouldDriveOctreeFocus(n, self) && !n.__spikeColliderDisabled) foci.push({ position: n.mesh.position, velocity: n.velocity });
    }
    if (foci.length > 0) self.worldOctree.update(foci, null);
  }

  updateNivrayim(self, dt) {
    for (const nivra of self.nivrayim || []) {
      if (nivra?.isReady && nivra?.heesHawveh && typeof nivra.heesHawvoos === 'function') {
        try { nivra.heesHawvoos(dt); }
        catch (err) { warnOncePerEntity(self, nivra, err); }
      }
    }
  }

  renderFrame(self, loopCounter) {
    if (!self.renderer || !self.scene) return loopCounter <= 5 && safeRenderTrace('heesHawvoos:no_renderer_or_scene', { frame: loopCounter, hasRenderer: Boolean(self.renderer), hasScene: Boolean(self.scene) });
    const activeEye = self.activeCamera || self.ayin?.camera || null;
    if (!activeEye) return loopCounter <= 5 && safeRenderTrace('heesHawvoos:no_active_camera', { frame: loopCounter, hasAyin: Boolean(self.ayin), hasAyinCamera: Boolean(self.ayin?.camera) });
    try {
      const result = typeof self.renderer.renderAsync === 'function' ? self.renderer.renderAsync(self.scene, activeEye) : self.renderer.render(self.scene, activeEye);
      if (result?.catch) result.catch(error => handleRenderFailure(self, loopCounter, error));
      if (loopCounter > 3 && !self.__firstRenderConfirmed) {
        self.__firstRenderConfirmed = true;
        safeRenderTrace('heesHawvoos:first_render_confirmed', { frame: loopCounter, sceneChildren: self.scene?.children?.length || 0, cameraPosition: activeEye.position ? copyVector(activeEye.position) : null });
        self.ayshPeula?.('rendered first time');
      }
    } catch (renderErr) { handleRenderFailure(self, loopCounter, renderErr); }
  }
}
