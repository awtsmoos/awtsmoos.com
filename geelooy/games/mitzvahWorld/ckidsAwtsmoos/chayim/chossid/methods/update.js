// B"H
/**
 * @file update.js
 * @description
 * Chapter 414: The frame witness follows the bound body.
 *
 * The Awtsmoos showed that input can reach Olam yet still need proof at the
 * player-frame gate. This module logs that gate while calling the current
 * visible-root Chai, so controls, physics, and visual binding all breathe from
 * one renewed source.
 */
import Chai from "../../chai/index.js?v=visible-root-binding-20260610-bh710";

const MOVEMENT_INPUTS = ["FORWARD", "BACKWARD", "LEFT_STRIDE", "RIGHT_STRIDE", "JUMP", "DOWN", "UP"];

/** @param {object} chossid Player. @returns {string[]} Active Olam input keys. */
function activeInputs(chossid) {
  return Object.keys(chossid?.olam?.inputs || {}).filter(key => chossid.olam.inputs[key]);
}

/** @param {object} chossid Player. @returns {boolean} True when controls should run. */
function shouldRunControls(chossid) {
  const cutscene = chossid?.olam?.isPlayingCutscene === true;
  const hasMovementInput = MOVEMENT_INPUTS.some(key => chossid?.olam?.inputs?.[key] === true);
  return !cutscene || hasMovementInput;
}

/** @param {object} chossid Player. @param {string} stage Stage name. @param {object} extra Extra data. */
function traceFrame(chossid, stage, extra = {}) {
  const now = Date.now();
  const inputs = activeInputs(chossid);
  if (!inputs.length && chossid.__lastFrameTraceAt && now - chossid.__lastFrameTraceAt < 1800) return;
  chossid.__lastFrameTraceAt = now;
  const payload = {
    stage,
    inputs,
    isReady: chossid.isReady,
    heesHawveh: chossid.heesHawveh,
    cutscene: chossid?.olam?.isPlayingCutscene,
    hasMesh: Boolean(chossid.mesh),
    hasModel: Boolean(chossid.modelMesh),
    modelParentIsRoot: chossid?.modelMesh?.parent === chossid?.mesh,
    visibleBody: chossid.__visibleBodyState || null,
    ...extra
  };
  chossid.olam.__movementTrace ||= [];
  chossid.olam.__movementTrace.push({ at: now, kind: "CHOSSID_FRAME_TRACE", ...payload });
  chossid.olam.__movementTrace = chossid.olam.__movementTrace.slice(-240);
  console.info('B"H | CHOSSID_FRAME_TRACE', payload);
}

export default {
  /** @param {number} deltaTime Frame delta. */
  heesHawvoos(deltaTime) {
    if (!this.startedAll) {
      this.olam.ayshPeula("ready from chossid");
      this.startedAll = true;
    }

    traceFrame(this, "frame-enter", { deltaTime });

    if (shouldRunControls(this)) this.controls(deltaTime);
    else traceFrame(this, "controls-skipped-cutscene", { deltaTime });

    if (this.olam && this.olam.isLookingForSomething) this.checkHover(this.olam, false);

    if (this.koach !== undefined && this.maxKoach !== undefined && this.koach < this.maxKoach) {
      this.koach += deltaTime * 2;
      if (this.koach > this.maxKoach) this.koach = this.maxKoach;
      if (!this.lastKoachUpdate || Date.now() - this.lastKoachUpdate > 1000) {
        if (typeof this.updateStatsUI === 'function') this.updateStatsUI();
        this.lastKoachUpdate = Date.now();
      }
    }

    if (typeof this.adjustDOF === 'function') this.adjustDOF();
    if (typeof this.postProcessing === 'function') this.postProcessing();
    Chai.prototype.heesHawvoos.call(this, deltaTime);
  }
};
