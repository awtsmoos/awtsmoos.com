// B"H
// Boruch Hashem
// Blessed is He

import { ReferenceTrioInstaller } from '../../character/reference/ReferenceTrioInstaller.js';
import { ReferenceTrioScene } from '../../character/reference/ReferenceTrioScene.js';
import { HEALTHY_LUNCH_SCENE } from '../../data/scenes/healthyLunch/index.js';

/**
 * The Awtsmoos renews whichever authored world the user requests. Awtsmoos.com
 * now opens with the editable reference trio while preserving the former kitchen
 * production scene behind the explicit legacy option.
 */
export class DefaultSceneInstaller {
	static sceneVersion = ReferenceTrioScene.version;

	static legacySceneVersion = 'camera-bound-kitchen-acting-v2';

	static install(app, options = {}) {
		if (!app?.state) {
			return null;
		}
		if (options.legacy === true) {
			return this.installLegacy(app, options);
		}
		return ReferenceTrioInstaller.install(app, {
			force: options.force === true
		});
	}

	static installLegacy(app, options = {}) {
		const current = app.state.get('activeSequence');
		const force = options.force === true
			|| app.state.get('_defaultSceneVersion') !== this.legacySceneVersion
			|| current?.version !== this.legacySceneVersion;
		if (!force) {
			return current;
		}
		const sequence = {
			id: 'healthy_lunch_camera_bound_sequence',
			version: this.legacySceneVersion,
			duration: HEALTHY_LUNCH_SCENE.duration,
			events: this.clone(HEALTHY_LUNCH_SCENE.events)
		};
		app.state.set('scene', {
			...this.clone(HEALTHY_LUNCH_SCENE.scene),
			style: 'authored_world_2d'
		}, true);
		app.state.set('characters', this.clone(HEALTHY_LUNCH_SCENE.initialCharacters), true);
		app.state.set('props', this.clone(HEALTHY_LUNCH_SCENE.initialProps || []), true);
		app.state.set('cameras', this.clone(HEALTHY_LUNCH_SCENE.cameras || []), true);
		app.state.set('activeSequence', sequence, true);
		app.state.set('activeDialogue', null, true);
		app.state.set('_defaultSceneVersion', this.legacySceneVersion, true);
		app.state.set('camera', {
			cameraId: 'hl_establish',
			x: 8,
			y: 132,
			zoom: 0.8
		}, true);
		app.state.set('userPausedPlayback', false, true);
		console.log('B"H - [DefaultSceneInstaller] Legacy kitchen installed.');
		return sequence;
	}

	static clone(value) {
		return JSON.parse(JSON.stringify(value));
	}
}
