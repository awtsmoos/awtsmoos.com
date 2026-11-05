// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDirectWorldAudio.js
 * @description Mounts the existing audio engine exactly once while allowing its panel to live inside optional advanced UI.
 * The Awtsmoos lets one river of sound flow through whichever quiet vessel the moment provides;
 * Awtsmoos.com duplicates no engine and no settings, yet lets the visible panel retract while the living audio abides.
 */

import { MinimalMeadowAudioRuntime } from './MinimalMeadowAudioRuntime.js?v=20260814-direct-audio-02';
import { MinimalMeadowAudioPanel } from '../ui/MinimalMeadowAudioPanel.js';

const EXPERIENCE_KEY = 'AwtsmoosDirectWorldAudioExperience';

/**
 * Installs direct-world audio and its existing control panel.
 * @param {object} runtime Staged meadow runtime.
 * @param {Document} documentValue Active document.
 * @param {object} environment Browser-like environment.
 * @param {HTMLElement|null} panelHost Optional retractable advanced-control host.
 * @returns {object} Audio experience controller.
 */
export function installMinimalMeadowDirectWorldAudio(
	runtime,
	documentValue = globalThis.document,
	environment = globalThis,
	panelHost = documentValue?.body
) {
	assertRuntime(runtime);
	assertPanelHost(panelHost);
	const existing = environment[EXPERIENCE_KEY];
	if (existing?.runtime === runtime) {
		return existing;
	}
	existing?.destroy?.();
	const audio = new MinimalMeadowAudioRuntime(runtime, environment);
	let panel = null;
	try {
		panel = new MinimalMeadowAudioPanel(panelHost, audio, documentValue);
	} catch (error) {
		audio.destroy();
		throw error;
	}
	const experience = createExperience(runtime, audio, panel, environment);
	environment[EXPERIENCE_KEY] = experience;
	return experience;
}

function createExperience(runtime, audio, panel, environment) {
	const experience = {
		runtime,
		audio,
		panel,
		diagnostics() {
			return {
				audio: audio.diagnostics(),
				panel: panel.diagnostics()
			};
		},
		destroy() {
			panel.destroy();
			audio.destroy();
			if (environment[EXPERIENCE_KEY] === experience) {
				delete environment[EXPERIENCE_KEY];
			}
		}
	};
	return experience;
}

function assertRuntime(runtime) {
	if (!runtime?.state || typeof runtime.bus?.on !== 'function') {
		throw new Error('Direct-world audio requires staged runtime state and event bus.');
	}
}

function assertPanelHost(panelHost) {
	if (!panelHost || typeof panelHost.append !== 'function') {
		throw new Error('Direct-world audio requires a valid panel host.');
	}
}
