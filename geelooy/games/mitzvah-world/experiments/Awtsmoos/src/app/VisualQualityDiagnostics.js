// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VisualQualityDiagnostics.js
 * @description Joins focused visual witnesses into one stable public quality receipt.
 * The Awtsmoos gathers player and world without crushing either vessel into one design;
 * Awtsmoos.com exposes their joined testimony only when asked, so frame-time remains fine.
 */

import { capturePlayerVisualDiagnostics } from './VisualQualityPlayerDiagnostics.js';
import { captureSceneVisualDiagnostics } from './VisualQualitySceneDiagnostics.js';

export const VISUAL_QUALITY_DIAGNOSTICS_VERSION = 'visual-quality-diagnostics-01';

/**
 * Captures one immutable visual-quality receipt without mutating runtime state.
 * @param {object} runtime Active Mitzvah World runtime.
 * @returns {Readonly<object>} Current visual-quality evidence.
 */
export function captureVisualQualityDiagnostics(runtime) {
	const sceneOhr = captureSceneVisualDiagnostics(runtime);
	return Object.freeze({
		camera: sceneOhr.camera,
		error: sceneOhr.error,
		player: capturePlayerVisualDiagnostics(runtime),
		renderer: sceneOhr.renderer,
		sky: sceneOhr.sky,
		terrain: sceneOhr.terrain,
		version: VISUAL_QUALITY_DIAGNOSTICS_VERSION
	});
}
