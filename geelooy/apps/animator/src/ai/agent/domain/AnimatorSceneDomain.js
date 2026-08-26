//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorSceneDomain.js
 * @description
 * The Awtsmoos lets layered city, park, sitcom, legacy world, and safe stage geometry emerge as detached creative data;
 * Awtsmoos.com adapts the real scene composer without copying render logic or requiring a raw canvas in the public schema.
 */

import { SceneComposer } from '../../../scene/core/SceneComposer.js';
import { CityParkDayPreset } from '../../../scene/presets/CityParkDayPreset.js';
import { StageSafeArea } from '../../../stage/StageSafeArea.js';

/** Adapts stable scene composition and live stage geometry into Agent API results. */
export class MalchusAnimatorSceneDomain {
	/** @param {object} keterRuntime Optional live Animator runtime. */
	constructor(keterRuntime = {}) {
		this.keterRuntime = keterRuntime;
	}

	/** @returns {object} Stable scene composition capability summary. */
	capabilities() {
		return {
			styles: ['production', 'reference_sitcom_2d', 'legacy_layers'],
			presets: ['cityParkDay'],
			pureGraphComposition: true,
			liveSafeArea: Boolean(this.keterRuntime.app)
		};
	}

	/** @param {string} shemPreset Preset identity. @returns {object} Detached preset. */
	preset(shemPreset = 'cityParkDay') {
		if (shemPreset !== 'cityParkDay') {
			const gevurahError = new Error(`Unknown scene preset: ${shemPreset}`);
			gevurahError.code = 'unknown_scene_preset';
			throw gevurahError;
		}
		return structuredClone(CityParkDayPreset);
	}

	/** @param {object} keliSceneData Scene data. @param {object} keliFrame Width/height frame. @param {object} keilimOptions Additional context. @returns {object} Pure VirtualGraph scene. */
	compose(keliSceneData = {}, keliFrame = {}, keilimOptions = {}) {
		return SceneComposer.build({
			ctx: {
				width: Number(keliFrame.width) || 1280,
				height: Number(keliFrame.height) || 720
			},
			sceneData: keliSceneData,
			sequence: keilimOptions.sequence ?? null,
			realTime: Number(keilimOptions.realTime) || 0,
			directorTime: Number(keilimOptions.directorTime) || 0,
			camera: keilimOptions.camera ?? {},
			state: keilimOptions.state ?? null
		});
	}

	/** @returns {object} Live canvas safe-area geometry. */
	safeArea() {
		if (!this.keterRuntime.app) {
			const gevurahError = new Error('The live Animator stage is unavailable.');
			gevurahError.code = 'environment_unavailable';
			throw gevurahError;
		}
		return StageSafeArea.resolve(this.keterRuntime.app);
	}
}
