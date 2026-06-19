// B"H

/**
 * @file CameraRig.js
 * @description
 * A named cinematic camera with purpose, target, framing, lens, transition,
 * and render detail intent.
 */
export class CameraRig {
  /**
   * Creates a camera rig.
   *
   * @param {Object} spec - Camera spec.
   */
  constructor(spec = {}) {
    this.id = spec.id || 'camera';
    this.name = spec.name || this.id;
    this.type = spec.type || 'custom';
    this.targetMode = spec.targetMode || 'fixed';
    this.targetActors = spec.targetActors || [];
    this.targetProp = spec.targetProp || null;
    this.x = Number.isFinite(spec.x) ? spec.x : 0;
    this.y = Number.isFinite(spec.y) ? spec.y : -122;
    this.zoom = Number.isFinite(spec.zoom) ? spec.zoom : 0.6;
    this.lens = spec.lens || 'normal';
    this.framing = spec.framing || 'medium';
    this.composition = spec.composition || 'center';
    this.movement = spec.movement || 'static';
    this.transition = spec.transition || 'cut';
    this.duration = Number.isFinite(spec.duration) ? spec.duration : 500;
    this.followStrength = Number.isFinite(spec.followStrength) ? spec.followStrength : 0.7;
    this.renderDetailMode = spec.renderDetailMode || 'medium';
  }

  /**
   * Serializes to camera state.
   *
   * @returns {Object} Camera state.
   */
  toState() {
    return {
      cameraId: this.id,
      x: this.x,
      y: this.y,
      zoom: this.zoom,
      shot: this.type,
      lens: this.lens,
      framing: this.framing,
      composition: this.composition,
      movement: this.movement,
      renderDetailMode: this.renderDetailMode,
      subtitle: true
    };
  }
}