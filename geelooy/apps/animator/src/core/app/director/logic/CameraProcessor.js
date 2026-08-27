// B"H
import { CameraRigRegistry } from '../../../../camera/core/CameraRigRegistry.js';
import { CameraSwitcher } from '../../../../camera/core/CameraSwitcher.js';
import { CinematicCameraEnforcer } from './CinematicCameraEnforcer.js';
import { AutomaticShotPlanner } from '../../../../camera/planning/AutomaticShotPlanner.js';
import { ShotContinuityEngine } from '../../../../camera/continuity/ShotContinuityEngine.js';

/** Camera event processor: explicit rigs still work, automatic film grammar now directs target-list shots. */
export class CameraProcessor {
  static process(state, event = {}, t = 0) {
    const world = { characters: state.get('characters') || {}, props: state.get('props') || {} };
    if (this.shouldAuto(event)) {
      const planned = ShotContinuityEngine.apply(AutomaticShotPlanner.plan(event, state, { safe: state.get('safeFrame') || {} }), state);
      state.set('camera', CinematicCameraEnforcer.apply({ ...planned, cameraId: event.cameraId || planned.shotType, shot: planned.shotType, subtitle: true }, event, state), true);
      return;
    }
    const scene = this.scene(state);
    const now = globalThis.performance?.now?.() || Date.now();
    const registry = this.registry(state, scene);
    const switcher = this.switcher(state, registry);
    const cameraId = event.cameraId || event.shot || event.id;
    if (cameraId && t <= 0.08) switcher.switchTo(cameraId, { transition: event.transition || (event.cut === true ? 'cut' : undefined), duration: event.duration || 220 }, world, now);
    const camera = cameraId ? switcher.sample(world, now) : this.fallbackCamera(event, t, state.get('camera'));
    state.set('camera', CinematicCameraEnforcer.apply(camera, event, state), true);
  }
  static shouldAuto(e = {}) { return e.autoShot === true || Boolean(e.targets || e.shotIntent || e.angleIntent || e.movementIntent || e.primaryTarget || e.objectTarget); }
  static scene(state) { return { ...(state.get('scene') || {}), cameras: state.get('cameras') || [], ...(state.get('activeSequence') || {}) }; }
  static registry(state, scene) { const signature = JSON.stringify(scene.cameras || []); let registry = state.get('_cameraRigRegistry'); if (!registry || state.get('_cameraRigSignature') !== signature) { registry = new CameraRigRegistry({ ...scene, initialCharacters: state.get('characters') || {} }); state.set('_cameraRigRegistry', registry, true); state.set('_cameraRigSignature', signature, true); state.set('_cameraSwitcher', null, true); } return registry; }
  static switcher(state, registry) { let switcher = state.get('_cameraSwitcher'); if (!switcher) { switcher = new CameraSwitcher(registry); state.set('_cameraSwitcher', switcher, true); } return switcher; }
  static fallbackCamera(event, t, current = {}) { return { x: Number.isFinite(event.x) ? event.x : Number(current?.x || 0), y: Number.isFinite(event.y) ? event.y : Number(current?.y || 128), zoom: Number.isFinite(event.zoom) ? event.zoom : Number(current?.zoom || 0.9), shot: event.shot || current?.shot || 'custom', cameraId: event.cameraId || current?.cameraId || event.shot || 'custom', subtitle: true }; }
}
