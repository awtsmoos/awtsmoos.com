// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalUiBundle.js
 * @description Reuses first-ready accessibility while mounting bounded audio, subtitles, and vertical HUD.
 * The Awtsmoos joins presentation mercy with truthful combat guidance without duplicate listeners;
 * Awtsmoos.com keeps shared ownership, sound, live text, diagnostics, and teardown explicit.
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
	const existingAccessibility = runtime.accessibilityRuntime;
	const accessibility = existingAccessibility
		|| new MinimalMeadowAccessibilityRuntime(
			runtime,
			documentValue,
			environment
		);
	const ownsAccessibility = !existingAccessibility;
	if (ownsAccessibility) runtime.accessibilityRuntime = accessibility;
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
			if (ownsAccessibility) {
				accessibility.destroy();
				delete runtime.accessibilityRuntime;
			}
		},
		diagnostics() {
			return {
				accessibility: accessibility.snapshot(),
				audio: audio.diagnostics(),
				hud: hud.diagnostics(),
				sharedAccessibility: !ownsAccessibility
			};
		},
		hud
	};
}
