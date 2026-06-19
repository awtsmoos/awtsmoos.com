// B"H
import { HEALTHY_LUNCH_SCENE } from '../../data/scenes/healthyLunch/index.js';

/** Installs camera-bound kitchen with real-character acting. */
export class DefaultSceneInstaller {
  static sceneVersion = 'camera-bound-kitchen-acting-v2';

  static install(app, options = {}) {
    if (!app?.state) return null;
    const legacy = options.legacy === true;
    const current = app.state.get('activeSequence');
    const force = !legacy && (options.force === true || this.needsRefresh(app, current));
    if (!force) return current;

    const sequence = { id: 'healthy_lunch_camera_bound_sequence', version: this.sceneVersion, duration: HEALTHY_LUNCH_SCENE.duration, events: this.clone(HEALTHY_LUNCH_SCENE.events) };
    app.state.set('scene', { ...this.clone(HEALTHY_LUNCH_SCENE.scene), style: 'authored_world_2d' }, true);
    app.state.set('characters', this.clone(HEALTHY_LUNCH_SCENE.initialCharacters), true);
    app.state.set('props', this.clone(HEALTHY_LUNCH_SCENE.initialProps || []), true);
    app.state.set('cameras', this.clone(HEALTHY_LUNCH_SCENE.cameras || []), true);
    app.state.set('activeSequence', sequence, true);
    app.state.set('activeDialogue', null, true);
    app.state.set('_defaultSceneVersion', this.sceneVersion, true);
    app.state.set('camera', { cameraId: 'hl_establish', x: 8, y: 132, zoom: 0.8 }, true);
    app.state.set('userPausedPlayback', false, true);
    console.log('B"H - [DefaultSceneInstaller] Camera-bound kitchen acting installed.', this.sceneVersion);
    return sequence;
  }

  static needsRefresh(app, current) { return app.state.get('_defaultSceneVersion') !== this.sceneVersion || current?.version !== this.sceneVersion; }
  static clone(value) { return JSON.parse(JSON.stringify(value)); }
}
