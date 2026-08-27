// B"H
import { CameraRig } from './CameraRig.js';
import { ActorCameraFactory } from '../factory/ActorCameraFactory.js';

/**
 * @file CameraRigRegistry.js
 * @description
 * The lens registry once reached for `this.defaults`, an instance shadow that
 * was never born. The Awtsmoos now names the source: class defaults, steady and
 * explicit, so wide shots, close souls, and AI-born cartoon scenes can breathe.
 */
export class CameraRigRegistry {
  /** @param {Object} scene - Scene data. */
  constructor(scene = {}) {
    this.rigs = new Map();
    this.load(scene);
  }

  /** @param {Object} scene - Scene. @returns {void} */
  load(scene = {}) {
    const actors = scene.initialCharacters || scene.characters || {};
    const rigs = [
      ...this.fallbacks(),
      ...ActorCameraFactory.createForActors(actors),
      ...this.sceneRigs(scene)
    ];
    rigs.forEach((rig) => this.set(rig));
  }

  /** @param {Object} scene - Scene. @returns {Array<CameraRig>} */
  sceneRigs(scene = {}) {
    const raw = scene.cameras || scene.cameraRigs || [];
    const list = Array.isArray(raw) ? raw : Object.values(raw);
    return list.filter(Boolean).map((spec) => new CameraRig(this.normalizeSpec(spec)));
  }

  /** @param {Object} spec - Spec. @returns {Object} Normalized spec. */
  normalizeSpec(spec = {}) {
    const kind = this.kind(spec);
    const defaults = CameraRigRegistry.defaultFor(kind);
    const zoom = this.numberOr(spec.zoom, defaults.zoom);
    return {
      ...spec,
      id: spec.id || spec.cameraId || `scene_${kind}`,
      type: spec.type || kind,
      x: this.numberOr(spec.x, defaults.x),
      y: this.numberOr(spec.y, defaults.y),
      zoom: Math.max(zoom, defaults.zoom),
      transition: spec.transition || defaults.transition,
      duration: this.numberOr(spec.duration, defaults.duration),
      framing: spec.framing || kind,
      renderDetailMode: spec.renderDetailMode || defaults.detail
    };
  }

  /** @param {unknown} value @param {number} fallback @returns {number} */
  numberOr(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  /** @param {Object} spec - Spec. @returns {string} Kind. */
  kind(spec = {}) {
    const text = `${spec.id || ''} ${spec.type || ''} ${spec.framing || ''}`;
    if (/face|close|reaction|insert|catch/i.test(text)) return 'close';
    if (/two/i.test(text)) return 'two';
    if (/walk|tracking|action|throw|medium/i.test(text)) return 'medium';
    return /wide|group/i.test(text) ? 'wide' : 'medium';
  }

  /** @returns {Array<CameraRig>} Fallback rigs. */
  fallbacks() {
    return [
      new CameraRig({ id: 'wide', name: 'Wide', type: 'wide', x: 0, y: -122, zoom: 0.54, framing: 'wide', renderDetailMode: 'wide' }),
      new CameraRig({ id: 'group', name: 'Group', type: 'group', x: 0, y: -112, zoom: 0.68, framing: 'group', renderDetailMode: 'wide' }),
      new CameraRig({ id: 'two_shot', name: 'Two Shot', type: 'twoShot', targetMode: 'multi', targetActors: ['c2_speaker', 'c3_thrower'], y: 24, zoom: 1.12, framing: 'twoShot', renderDetailMode: 'medium' }),
      new CameraRig({ id: 'walk_tracking', name: 'Walk Tracking', type: 'tracking', targetMode: 'multi', targetActors: ['c1_walker', 'c2_speaker'], y: 10, zoom: 1.04, movement: 'walkAndTalkTracking', renderDetailMode: 'medium' }),
      new CameraRig({ id: 'throw_action', name: 'Throw Action', type: 'action', targetMode: 'actor', targetActors: ['c3_thrower'], y: 48, zoom: 1.26, movement: 'actionFollow', renderDetailMode: 'medium' }),
      new CameraRig({ id: 'catch_reaction', name: 'Catch Reaction', type: 'reaction', targetMode: 'actor', targetActors: ['c4_catcher'], y: 30, zoom: 2.28, framing: 'reaction', renderDetailMode: 'closeup' }),
      new CameraRig({ id: 'prop_insert', name: 'Prop Insert', type: 'insert', targetMode: 'prop', targetProp: 'golden_ball', y: 70, zoom: 1.8, framing: 'insert', renderDetailMode: 'closeup' })
    ];
  }

  /** @param {CameraRig} rig - Camera rig. @returns {void} */
  set(rig) { if (rig && rig.id) this.rigs.set(rig.id, rig); }

  /** @param {string} id - Camera id. @returns {CameraRig|null} */
  get(id) { return this.rigs.get(id) || this.rigs.get('group') || null; }

  /** @returns {Array<CameraRig>} Rigs. */
  list() { return Array.from(this.rigs.values()); }

  /** @param {string} kind - Kind. @returns {Object} Defaults. */
  static defaultFor(kind) { return CameraRigRegistry.defaults[kind] || CameraRigRegistry.defaults.medium; }

  static defaults = {
    wide: { x: 0, y: -122, zoom: 0.54, transition: 'cut', duration: 180, detail: 'wide' },
    medium: { x: 0, y: 18, zoom: 1.04, transition: 'ease', duration: 180, detail: 'medium' },
    two: { x: 0, y: 24, zoom: 1.12, transition: 'ease', duration: 180, detail: 'medium' },
    close: { x: 0, y: 30, zoom: 2.28, transition: 'cut', duration: 160, detail: 'closeup' }
  };
}
