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
import UniversePulsator from '../oyved/UniversePulsator.js?v=worker-message-pump-20260622-bh1';
import RenderTrace from './canvas/RenderTrace.js?v=village-polish-20260612-bh811';
import { signalWorldFinalReady } from '../worlds/mitzvahWorld/runtime/WorldFinalReadySignal.js?v=zone-reality-20260614-bh817';
import { getDynamicActorPartition } from '../worlds/mitzvahWorld/runtime/DynamicActorPartition.js?v=awtsmoos-dynamic-partition-20260614-bh2';

const FOCUS_MOVING_EPSILON_SQ = 0.0001;
const VANITY_TYPES = new Set(['LineSegments', 'Line', 'Points', 'AxesHelper', 'GridHelper', 'BoxHelper']);
const MAX_ENTITY_WARNINGS = 10;
const PARTITIONED_TYPES = new Set(['interactiveNpc', 'customNpc', 'medabeir', 'mazik', 'enemy', 'animal', 'wildlife']);

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

function budgetOf() { return globalThis?.__AWTSMOOS_PERFORMANCE_MODE__?.budget || {}; }

function partitionFor(self) {
  const b = budgetOf();
  return getDynamicActorPartition(self).configure({ near:b.npcDistance || 48, mid:(b.npcDistance || 48) * 1.8, far:(b.treeDistance || 120) * 2.2 });
}

function shouldPartitionNivra(nivra, self) {
  if (!nivra || nivra === self.chossid || nivra === self.player || nivra.type === 'chossid') return false;
  if (nivra.type === 'livingRegionTicker' || nivra.type === 'discoveryTicker') return false;
  return Boolean(nivra.mesh && (PARTITIONED_TYPES.has(nivra.type) || nivra.userData?.wildlifeActor || nivra.isNpc || nivra.isEnemy));
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

function confirmRenderedFrame(self, loopCounter, activeEye) {
  if (!self.__firstRenderConfirmed) {
    self.__firstRenderConfirmed = true;
    safeRenderTrace('heesHawvoos:first_render_confirmed', {
      frame: loopCounter,
      sceneChildren: self.scene?.children?.length || 0,
      cameraPosition: activeEye.position ? copyVector(activeEye.position) : null
    });
    self.ayshPeula?.('rendered first time');
  }
  signalWorldFinalReady(self, { frame: loopCounter });
}

function crispPixelRatio(self) {
  const renderer = self.renderer;
  if (!renderer || typeof renderer.getPixelRatio !== "function") return null;
  return Number(renderer.getPixelRatio()) || null;
}

function reportWorkerFps(self, dt, loopCounter) {
  self.__workerFpsStats ||= { at: 0, frameAt: 0, frames: 0, dtTotal: 0, dtMax: 0, wallTotal: 0, wallMax: 0, lastFps: 0 };
  const stats = self.__workerFpsStats;
  const now = Date.now();
  if (stats.frameAt) {
    const wall = (now - stats.frameAt) / 1000;
    stats.wallTotal += wall;
    stats.wallMax = Math.max(stats.wallMax, wall);
  }
  stats.frameAt = now;
  stats.frames += 1;
  stats.dtTotal += dt;
  stats.dtMax = Math.max(stats.dtMax, dt);
  if (!stats.at) stats.at = now;
  if (now - stats.at < 1000) return;
  const seconds = Math.max(0.001, (now - stats.at) / 1000);
  const fps = Math.round(stats.frames / seconds);
  const avgDt = stats.dtTotal / Math.max(1, stats.frames);
  const pixelRatio = crispPixelRatio(self);
  const renderInfo = self.renderer?.info?.render || {};
  const payload = {
    fps,
    avgFrameMs: Math.round(avgDt * 10000) / 10,
    maxFrameMs: Math.round(stats.dtMax * 10000) / 10,
    avgWallFrameMs: Math.round((stats.wallTotal / Math.max(1, stats.frames - 1)) * 10000) / 10,
    maxWallFrameMs: Math.round(stats.wallMax * 10000) / 10,
    renderCostMs: Math.round(Number(self.__lastRenderCostMs || 0) * 10) / 10,
    updateCostMs: Math.round(Number(self.__lastUpdateCostMs || 0) * 10) / 10,
    stages: self.__lastFrameStages || null,
    renderInfo: {
      calls: Number(renderInfo.calls || 0),
      triangles: Number(renderInfo.triangles || 0),
      points: Number(renderInfo.points || 0),
      lines: Number(renderInfo.lines || 0)
    },
    layerStats: renderLayerStats(self.scene),
    pixelRatio: pixelRatio ? Math.round(pixelRatio * 100) / 100 : null,
    frame: loopCounter,
    scheduler: globalThis.__AWTSMOOS_PULSATOR_MODE__ || "unknown",
    source: "worker-gameplay-render-loop"
  };
  stats.lastFps = fps;
  stats.frames = 0;
  stats.dtTotal = 0;
  stats.dtMax = 0;
  stats.wallTotal = 0;
  stats.wallMax = 0;
  stats.at = now;
  globalThis.__AWTSMOOS_WORKER_GAMEPLAY_FPS__ = payload;
  globalThis.postMessage?.({ type: "worker_gameplay_fps", payload });
}

function renderLayerStats(scene) {
  const roots = [];
  const region = scene?.getObjectByName?.("AWTSMOOS_LIVING_REGION_FULLY_GROUNDED_RUNTIME");
  if (region?.children?.length) roots.push(...region.children);
  else if (scene?.children?.length) roots.push(...scene.children);
  return roots.map(root => {
    const stats = { name:root.name || root.type || "layer", meshes:0, instanced:0, instances:0, visible:root.visible !== false, triangles:0 };
    root.traverse?.(object => {
      if (object.visible === false) return;
      if (object.isMesh || object.isInstancedMesh || object.isSkinnedMesh) {
        stats.meshes += 1;
        if (object.isInstancedMesh) { stats.instanced += 1; stats.instances += Number(object.count || 0); }
        const geometry = object.geometry;
        const tris = geometry?.index ? geometry.index.count / 3 : (geometry?.attributes?.position?.count || 0) / 3;
        stats.triangles += Math.round(tris * Math.max(1, Number(object.count || 1)));
      }
    });
    return stats;
  }).sort((a, b) => b.meshes - a.meshes || b.triangles - a.triangles).slice(0, 10);
}

export default class HeesHawvoosManager {
  async heesHawvoos() {
    const self = this;
    let loopCounter = 0;
    ensureWorkerWindowVessel();
    safeRenderTrace('heesHawvoos:ignite', { hasRenderer: Boolean(self.renderer), hasScene: Boolean(self.scene), hasAyin: Boolean(self.ayin), hasCamera: Boolean(self.activeCamera || self.ayin?.camera), sceneChildren: self.scene?.children?.length || 0, nivrayim: self.nivrayim?.length || 0 });
    this.updateStep = (dt) => {
      if (self.__renderPausedAfterFatal) return;
      const frameStart = performance.now();
      const stages = {};
      loopCounter += 1;
      const shouldLog = loopCounter <= 3 || loopCounter % 1000 === 0;
      let t = performance.now();
      try { this.updateSystems(self, dt); } catch (e) { if (shouldLog) console.error('B"H | HEES_SYSTEM_FAILED_ONCE', compactError(e)); }
      stages.systems = Math.round((performance.now() - t) * 10) / 10; t = performance.now();
      try { this.updateOctreeFoci(self); } catch (e) { if (shouldLog) console.error('B"H | HEES_OCTREE_FAILED_ONCE', compactError(e)); }
      stages.octree = Math.round((performance.now() - t) * 10) / 10; t = performance.now();
      try { this.updateNivrayim(self, dt); } catch (e) { if (shouldLog) console.error('B"H | HEES_ENTITY_LOOP_FAILED_ONCE', compactError(e)); }
      stages.nivrayim = Math.round((performance.now() - t) * 10) / 10; t = performance.now();
      try {
        const combat = self.combatManager;
        const hasProjectiles = Boolean(combat?.projectiles?.projectiles?.length);
        if (hasProjectiles) combat.update?.(dt);
        else this.runEvery(self, "combat", .16, dt, step => combat?.update?.(step));
      } catch (e) { if (shouldLog) console.error('B"H | HEES_COMBAT_FAILED_ONCE', compactError(e)); }
      stages.combat = Math.round((performance.now() - t) * 10) / 10; t = performance.now();
      try { self.ayin?.update?.(dt); } catch (e) { if (shouldLog) console.error('B"H | HEES_CAMERA_FAILED_ONCE', compactError(e)); }
      stages.camera = Math.round((performance.now() - t) * 10) / 10; t = performance.now();
      if (loopCounter === 1 || self.__renderTreeDirty) { purgeWorkerHostileRenderNodes(self.scene); self.__renderTreeDirty = false; }
      stages.purge = Math.round((performance.now() - t) * 10) / 10;
      const renderStart = performance.now();
      this.renderFrame(self, loopCounter);
      self.__lastRenderCostMs = performance.now() - renderStart;
      stages.render = Math.round(self.__lastRenderCostMs * 10) / 10;
      self.__lastUpdateCostMs = performance.now() - frameStart - self.__lastRenderCostMs;
      stages.total = Math.round((performance.now() - frameStart) * 10) / 10;
      self.__lastFrameStages = stages;
      reportWorkerFps(self, dt, loopCounter);
    };
    this.pulsator = new UniversePulsator(this);
    this.pulsator.ignite();
  }

  runEvery(self, key, interval, dt, callback) {
    const state = self.__frameBudgetAccumulators ||= {};
    const slot = state[key] ||= { acc:0 };
    slot.acc += Math.min(.05, Number(dt) || 1 / 60);
    if (slot.acc < interval) return false;
    const step = Math.min(.25, slot.acc);
    slot.acc = 0;
    callback(step);
    return true;
  }

  updateSystems(self, dt) {
    self.shlichusHandler?.update?.(dt);
    self.placementManager?.update?.(dt);
    this.runEvery(self, "environment", .12, dt, step => self.environment?.update?.(step));
  }

  updateOctreeFoci(self) {
    if (!self.worldOctree) return;
    const now = performance.now();
    const p = self.chossid || self.player;
    const pos = p?.mesh?.position;
    const last = self.__lastOctreeFocusPosition;
    const movedSq = pos && last ? ((pos.x-last.x)**2 + (pos.y-last.y)**2 + (pos.z-last.z)**2) : Infinity;
    if (self.__lastOctreeFocusAt && now - self.__lastOctreeFocusAt < 48 && movedSq < .0225) return;
    const foci = [];
    if (p?.mesh?.position && p?.velocity && !p.__spikeColliderDisabled) foci.push({ position: p.mesh.position, velocity: p.velocity });
    for (const n of self.nivrayim || []) {
      if (n !== p && n?.velocity && n?.mesh?.position && n?.onFloor !== undefined && n?.isReady && shouldDriveOctreeFocus(n, self) && !n.__spikeColliderDisabled) foci.push({ position: n.mesh.position, velocity: n.velocity });
    }
    if (foci.length > 0) {
      self.worldOctree.update(foci, null);
      self.__lastOctreeFocusAt = now;
      if (pos) self.__lastOctreeFocusPosition = { x:pos.x, y:pos.y, z:pos.z };
    }
  }

  updateNivrayim(self, dt) {
    const partition = partitionFor(self);
    for (const nivra of self.nivrayim || []) {
      if (nivra?.isReady && nivra?.heesHawveh && typeof nivra.heesHawvoos === 'function') {
        if (nivra.type === "livingRegionTicker") {
          this.runEvery(self, `ticker:${nivra.name || "living"}`, .18, dt, step => { try { nivra.heesHawvoos(step); } catch (err) { warnOncePerEntity(self, nivra, err); } });
          continue;
        }
        if (shouldPartitionNivra(nivra, self) && !partition.shouldUpdate(nivra, self)) continue;
        try { nivra.heesHawvoos(dt); } catch (err) { warnOncePerEntity(self, nivra, err); }
      }
    }
    self.__AWTSMOOS_DYNAMIC_PARTITION_STATS__ = partition.stats;
  }

  renderFrame(self, loopCounter) {
    if (!self.renderer || !self.scene) return loopCounter <= 5 && safeRenderTrace('heesHawvoos:no_renderer_or_scene', { frame: loopCounter, hasRenderer: Boolean(self.renderer), hasScene: Boolean(self.scene) });
    const activeEye = self.activeCamera || self.ayin?.camera || null;
    if (!activeEye) return loopCounter <= 5 && safeRenderTrace('heesHawvoos:no_active_camera', { frame: loopCounter, hasAyin: Boolean(self.ayin), hasAyinCamera: Boolean(self.ayin?.camera) });
    try {
      ensureWorkerWindowVessel();
      const useAsync = self.__useAsyncRenderFrames === true && typeof self.renderer.renderAsync === 'function';
      if (useAsync && self.__renderInFlight) return;
      const result = useAsync ? self.renderer.renderAsync(self.scene, activeEye) : self.renderer.render(self.scene, activeEye);
      if (result?.then) {
        self.__renderInFlight = true;
        result
          .then(() => confirmRenderedFrame(self, loopCounter, activeEye))
          .catch(error => handleRenderFailure(self, loopCounter, error))
          .finally(() => { self.__renderInFlight = false; });
      } else {
        confirmRenderedFrame(self, loopCounter, activeEye);
      }
    } catch (renderErr) { handleRenderFailure(self, loopCounter, renderErr); }
  }
}
