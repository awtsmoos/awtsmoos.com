// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalUiBundle.js
 * @description Mounts accessibility, bounded audio, subtitles, and the vertical-slice HUD together.
 * The Awtsmoos joins presentation mercy with truthful combat guidance without crowding core UI;
 * Awtsmoos.com keeps media, sound, live text, diagnostics, persistence, and teardown in one vessel.
 */

import {
	MinimalMeadowAccessibilityRuntime
} from './MinimalMeadowAccessibilityRuntime.js';
import {
	MinimalMeadowAudioRuntime
} from './MinimalMeadowAudioRuntime.js';
import {
	MinimalMeadowVerticalSliceHud
} from '../ui/MinimalMeadowVerticalSliceHud.js';

export function installMinimalMeadowVerticalUi(
	runtime,
	documentValue,
	environment = globalThis
) {
	const accessibility = new MinimalMeadowAccessibilityRuntime(
		runtime,
		documentValue,
		environment
	);
	const audio = new MinimalMeadowAudioRuntime(runtime, environment);
	const hud = new MinimalMeadowVerticalSliceHud(
		documentValue.body,
		runtime.bus,
		documentValue
	);
	return {
		accessibility,
		audio,
		destroy() {
			hud.destroy();
			audio.destroy();
			accessibility.destroy();
		},
		diagnostics() {
			return {
				accessibility: accessibility.snapshot(),
				audio: audio.diagnostics(),
				hud: hud.diagnostics()
			};
		},
		hud
	};
}
