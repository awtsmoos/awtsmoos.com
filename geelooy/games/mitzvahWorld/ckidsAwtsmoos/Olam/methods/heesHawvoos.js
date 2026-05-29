// B"H
/**
 * @file heesHawvoos.js
 * @description
 * Chapter 26: The worker render loop refuses browser-only vanity geometry.
 *
 * The Awtsmoos showed the blue-screen secret: after spike reset, a LineSegments
 * / helper geometry entered the OffscreenCanvas render river and Three touched
 * `window` from inside worker rendering. The cure is not another collider spell;
 * the cure is to continuously exile worker-hostile vanity nodes before every
 * render, without logging raw Three objects into DevTools.
 */
import UniversePulsator from '../oyved/UniversePulsator.js';
import RenderTrace from './canvas/RenderTrace.js';

const FOCUS_MOVING_EPSILON_SQ = 0.0001;
const VANITY_TYPES = new Set(['LineSegments', 'Line', 'Points', 'AxesHelper', 'GridHelper', 'BoxHelper']);

function shouldDriveOctreeFocus(nivra, self) {
  if (!nivra) return false;
  if (nivra === self.chossid || nivra === self.player || nivra.type === 'chossid') return true;
  const moving = nivra.moving || {};
  const hasIntent = Boolean(
    moving.forward || moving.backward || moving.stridingLeft || moving.stridingRight ||
    moving.turningLeft || moving.turningRight || moving.jump || nivra.movingAutomatically ||
    nivra.navTarget || nivra.currentPath || nivra._isMoving
  );
  return hasIntent || ((nivra.velocity?.lengthSq?.() || 0) > FOCUS_MOVING_EPSILON_SQ);
}

function isWorkerHostileRenderNode(node) {
  if (!node) return false;
  if (node.isLine || node.isLineSegments || node.isPoints) return true;
  if (VANITY_TYPES.has(node.type)) return true;
  const geometryType = String(node.geometry?.type || '');
  if (geometryType.includes('BufferGeometry') && (node.material?.isLineBasicMaterial || node.material?.isPointsMaterial)) return true;
  return false;
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
  return {
    name: error?.name || 'Error',
    message: error?.message || String(error),
    stack: String(error?.stack || '').split('\n').slice(0, 5).join(' | ')
  };
}

export default class HeesHawvoosManager {
  async heesHawvoos() {
    const self = this;
    let confirmedGaze = false;
    let loopCounter = 0;
    safeRenderTrace('heesHawvoos:ignite', {
      hasRenderer: Boolean(self.renderer),
      hasScene: Boolean(self.scene),
      hasAyin: Boolean(self.ayin),
      hasCamera: Boolean(self.activeCamera || self.ayin?.camera),
      sceneChildren: self.scene?.children?.length || 0,
      nivrayim: self.nivrayim?.length || 0
    });

    this.updateStep = (dt) => {
      loopCounter += 1;
      const shouldLog = loopCounter <= 3 || (loopCounter % 1000 === 0);
      if (loopCounter <= 5) {
        safeRenderTrace('heesHawvoos:frame_state', {
          frame: loopCounter,
          dt,
          hasRenderer: Boolean(self.renderer),
          hasScene: Boolean(self.scene),
          hasCamera: Boolean(self.activeCamera || self.ayin?.camera),
          sceneChildren: self.scene?.children?.length || 0,
          nivrayim: self.nivrayim?.length || 0
        });
      }

      try {
        if (self.shlichusHandler) self.shlichusHandler.update(dt);
        if (self.environment) self.environment.update(dt);
        if (self.placementManager) self.placementManager.update(dt);
      } catch (e) {
        if (shouldLog) console.error('B"H | HEES_SYSTEM_FAILED', compactError(e));
      }

      try {
        if (self.worldOctree) {
          const foci = [];
          if (self.chossid?.mesh?.position && self.chossid?.velocity && !self.chossid.__spikeColliderDisabled) {
            foci.push({ position: self.chossid.mesh.position, velocity: self.chossid.velocity });
          } else if (self.player?.mesh?.position && self.player?.velocity && !self.player.__spikeColliderDisabled) {
            foci.push({ position: self.player.mesh.position, velocity: self.player.velocity });
          }
          if (self.nivrayim) {
            for (const n of self.nivrayim) {
              if (n !== self.chossid && n !== self.player && n?.velocity && n?.mesh?.position && n?.onFloor !== undefined && n?.isReady && shouldDriveOctreeFocus(n, self) && !n.__spikeColliderDisabled) {
                foci.push({ position: n.mesh.position, velocity: n.velocity });
              }
            }
          }
          if (foci.length > 0) self.worldOctree.update(foci, null);
        }
      } catch (e) {
        if (shouldLog) console.error('B"H | HEES_OCTREE_FAILED', compactError(e));
      }

      try {
        const len = self.nivrayim ? self.nivrayim.length : 0;
        for (let i = 0; i < len; i += 1) {
          const nivra = self.nivrayim[i];
          if (nivra?.isReady && nivra?.heesHawveh && typeof nivra.heesHawvoos === 'function') {
            try { nivra.heesHawvoos(dt); }
            catch (err) { if (loopCounter <= 20) console.warn('B"H | ENTITY_LOOP_FAILED', { type: nivra.type, name: nivra.name, ...compactError(err) }); }
          }
        }
      } catch (e) {
        if (shouldLog) console.error('B"H | HEES_ENTITY_LOOP_FAILED', compactError(e));
      }

      try { if (self.combatManager) self.combatManager.update(dt); }
      catch (e) { if (shouldLog) console.error('B"H | HEES_COMBAT_FAILED', compactError(e)); }

      try { if (self.ayin?.update) self.ayin.update(dt); }
      catch (e) { if (shouldLog) console.error('B"H | HEES_CAMERA_FAILED', compactError(e)); }

      const exiled = purgeWorkerHostileRenderNodes(self.scene);
      if (exiled > 0 && (loopCounter <= 10 || loopCounter % 120 === 0)) {
        console.warn('B"H | WORKER_RENDER_EXILED_VANITY', { frame: loopCounter, exiled });
      }

      if (self.renderer && self.scene) {
        const activeEye = self.activeCamera || self.ayin?.camera || null;
        if (activeEye) {
          try {
            if (typeof self.renderer.renderAsync === 'function') self.renderer.renderAsync(self.scene, activeEye);
            else self.renderer.render(self.scene, activeEye);
            if (!confirmedGaze && loopCounter > 3) {
              confirmedGaze = true;
              safeRenderTrace('heesHawvoos:first_render_confirmed', {
                frame: loopCounter,
                sceneChildren: self.scene?.children?.length || 0,
                cameraPosition: activeEye.position ? { x: activeEye.position.x, y: activeEye.position.y, z: activeEye.position.z } : null
              });
              if (self.ayshPeula) self.ayshPeula('rendered first time');
            }
          } catch (renderErr) {
            console.error('B"H | HEES_RENDER_FAILED_COMPACT', compactError(renderErr));
            const exiledAfterFailure = purgeWorkerHostileRenderNodes(self.scene);
            safeRenderTrace('heesHawvoos:render_failed', {
              frame: loopCounter,
              exiledAfterFailure,
              message: renderErr?.message || String(renderErr)
            });
          }
        } else if (loopCounter <= 5) {
          safeRenderTrace('heesHawvoos:no_active_camera', { frame: loopCounter, hasAyin: Boolean(self.ayin), hasAyinCamera: Boolean(self.ayin?.camera) });
        }
      } else if (loopCounter <= 5) {
        safeRenderTrace('heesHawvoos:no_renderer_or_scene', { frame: loopCounter, hasRenderer: Boolean(self.renderer), hasScene: Boolean(self.scene) });
      }
    };

    this.pulsator = new UniversePulsator(this);
    this.pulsator.ignite();
  }
}
