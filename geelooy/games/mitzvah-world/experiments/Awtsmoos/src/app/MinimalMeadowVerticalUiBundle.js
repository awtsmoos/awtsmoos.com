// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVerticalUiBundle.js
 * @description Reuses first-ready accessibility while mounting one audio runtime, mixer, subtitles, and HUD.
 * The Awtsmoos joins presentation mercy with truthful guidance in rhyme; Awtsmoos.com keeps
 * shared ownership, sound, settings, live text, diagnostics, and teardown explicit across time.
 */

import {
	MinimalMeadowAccessibilityRuntime
} from './MinimalMeadowAccessibilityRuntime.js';
import {
	MinimalMeadowAudioRuntime
} from './MinimalMeadowAudioRuntime.js';
import {
	MinimalMeadowAudioPanel
} from '../ui/MinimalMeadowAudioPanel.js';
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
	if (ownsAccessibility) {
		runtime.accessibilityRuntime = accessibility;
	}
	const audio = new MinimalMeadowAudioRuntime(runtime, environment);
	const audioPanel = new MinimalMeadowAudioPanel(
		documentValue.body,
		audio,
		documentValue
	);
	const hud = new MinimalMeadowVerticalSliceHud(
		documentValue.body,
		runtime.bus,
		documentValue
	);
	return {
		accessibility,
		audio,
		audioPanel,
		destroy() {
			hud.destroy();
			audioPanel.destroy();
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
				audioPanel: audioPanel.diagnostics(),
				hud: hud.diagnostics(),
				sharedAccessibility: !ownsAccessibility
			};
		},
		hud
	};
}
