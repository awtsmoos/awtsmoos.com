// B"H
import { CameraTransitionController } from './CameraTransitionController.js';
import { CameraTargetResolver } from './CameraTargetResolver.js';

/**
 * @file CameraSwitcher.js
 * @description
 * Switches between named camera rigs with cut/ease/fade transitions.
 */
export class CameraSwitcher {
  /**
   * Creates switcher.
   *
   * @param {CameraRigRegistry} registry - Camera registry.
   */
  constructor(registry) {
    this.registry = registry;
    this.currentId = 'wide';
    this.from = null;
    this.to = null;
    this.startedAt = 0;
    this.duration = 1;
    this.transition = 'cut';
  }

  /**
   * Switches camera.
   *
   * @param {string} id - Camera id.
   * @param {Object} options - Options.
   * @param {Object} world - World.
   * @param {number} time - Time.
   * @returns {void}
   */
  switchTo(id, options = {}, world = {}, time = performance.now()) {
    const rig = this.registry.get(id);
    if (!rig) return;

    this.from = this.to || CameraTargetResolver.resolve(this.registry.get(this.currentId) || rig, world);
    this.to = CameraTargetResolver.resolve(rig, world);
    this.currentId = id;
    this.startedAt = time;
    this.duration = Math.max(1, Number(options.duration || rig.duration || 1));
    this.transition = options.transition || rig.transition || 'cut';
  }

  /**
   * Samples current camera.
   *
   * @param {Object} world - World.
   * @param {number} time - Time.
   * @returns {Object} Camera.
   */
  sample(world = {}, time = performance.now()) {
    const rig = this.registry.get(this.currentId);
    if (!rig) return { x: 0, y: -122, zoom: 0.58, shot: 'group' };

    const liveTo = CameraTargetResolver.resolve(rig, world);
    this.to = liveTo;

    const progress = Math.max(0, Math.min(1, (time - this.startedAt) / this.duration));
    return CameraTransitionController.sample(this.from || liveTo, liveTo, {
      progress,
      transition: this.transition
    });
  }
}