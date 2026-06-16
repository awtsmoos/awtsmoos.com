// B"H
/**
 * @file lifecycle.js
 * @description
 * Chapter 415: The Chossid is registered, visible, and rooted.
 *
 * The Awtsmoos revealed that a player may be present in memory yet still fail
 * the eye if its garment and root are divided. This lifecycle now calls the
 * current visible-root Chai and records whether the model is actually parented
 * to the moving root that camera and physics follow.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Chai from "../../chai/index.js?v=village-polish-20260612-bh810";
import { applyCameraStart } from './lifecycle/cameraStart.js?v=lava-camera-axis-20260609-bh640';
import { ensureFallbackBody } from './lifecycle/fallbackBody.js?v=chossid-visible-guarantee-20260610-bh707';
import { prepareChossidModel } from './lifecycle/model.js?v=visible-root-binding-20260610-bh710';

function traceVisibility(chossid, stage, extra = {}) {
  const payload = {
    seal: 'visible-root-binding-20260610-bh710',
    stage,
    name: chossid?.name,
    hasMesh: Boolean(chossid?.mesh),
    hasModel: Boolean(chossid?.modelMesh),
    meshName: chossid?.mesh?.name || null,
    modelName: chossid?.modelMesh?.name || null,
    modelParentIsRoot: chossid?.modelMesh?.parent === chossid?.mesh,
    visibleBody: chossid?.__visibleBodyState || null,
    at: Date.now(),
    ...extra
  };
  chossid.olam.__movementTrace ||= [];
  chossid.olam.__movementTrace.push({ kind: 'MODEL_VISIBILITY_TRACE', ...payload });
  chossid.olam.__movementTrace = chossid.olam.__movementTrace.slice(-260);
  if (globalThis.__AWTSMOOS_MODEL_VISIBILITY_LOGS__ === true) console.info('B"H | MODEL_VISIBILITY_TRACE', payload);
}

/** @param {object} chossid Player entity. @returns {boolean} True when real or fallback visible. */
function ensureVisibleChossidBody(chossid) {
  const realModelPrepared = prepareChossidModel(chossid);
  const fallbackVisible = ensureFallbackBody(chossid);
  chossid.__visibleBodyState = {
    realModelPrepared,
    fallbackVisible,
    modelParentIsRoot: chossid?.modelMesh?.parent === chossid?.mesh,
    at: Date.now()
  };
  traceVisibility(chossid, 'ensure-visible-body', { realModelPrepared, fallbackVisible });
  return realModelPrepared || fallbackVisible;
}

export default {
  async heescheel(olam) {
    await Chai.prototype.heescheel.call(this, olam);
    if (!this.position || isNaN(this.position.x)) this.setPosition(new THREE.Vector3(0, 5, 10));
    if (typeof this.setupInputListeners === 'function') this.setupInputListeners(olam);
    traceVisibility(this, 'after-heescheel');
  },

  async ready() {
    await Chai.prototype.ready.call(this);
    registerPlayer(this);
    ensureVisibleChossidBody(this);
    this.inventory?.hydrateItems?.();
    if (this.optionsSpeed) this.speed = this.optionsSpeed;
    this.inventory?.updateUI?.();
    this.updateAppearance?.();
    traceVisibility(this, 'after-ready');
  },

  async afterBriyah() {
    await Chai.prototype.afterBriyah.call(this, this);
    ensureVisibleChossidBody(this);
    this.updateAppearance?.();
    if (this.olam) this.olam.ayshPeula('save player position');
    this.olam.on('wheel', ({ deltaY }) => {
      if (this.activeObject && this.setDistanceFromRay) {
        this.distanceFromRay += deltaY * 0.005;
        this.setDistanceFromRay(this.distanceFromRay);
      } else if (this.olam.ayin) this.olam.ayin.zoom(deltaY);
    });
    traceVisibility(this, 'after-afterBriyah');
  },

  async started() {
    this.iconPath = 'chossid.svg';
    this.iconType = 'centered';
    this.setupDefaultInventory?.();
  }
};

/** @param {object} chossid Player entity. */
function registerPlayer(chossid) {
  if (!chossid?.olam) return;
  chossid.olam.chossid = chossid;
  chossid.olam.player = chossid;
  if (!chossid.olam.ayin) return;
  chossid.olam.ayin.target = chossid;
  applyCameraStart(chossid);
}
