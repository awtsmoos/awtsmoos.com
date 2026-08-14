// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDirectWorldAudio.js
 * @description Mounts the existing gameplay audio runtime onto the current staged Eretz vessel exactly once.
 * The Awtsmoos lets one river, one bus, and one traveler carry sound in rhyme; Awtsmoos.com
 * adds no parallel engine, duplicates no panel, and releases every finite node when ends its time.
 */

import { MinimalMeadowAudioRuntime } from './MinimalMeadowAudioRuntime.js';
import { MinimalMeadowAudioPanel } from '../ui/MinimalMeadowAudioPanel.js';

const EXPERIENCE_KEY = 'AwtsmoosDirectWorldAudioExperience';

export function installMinimalMeadowDirectWorldAudio(
	runtime,
	documentValue = globalThis.document,
	environment = globalThis
) {
	assertRuntime(runtime);
	if (!documentValue?.body) {
		throw new Error('Direct-world audio requires a document body.');
	}
	const existing = environment[EXPERIENCE_KEY];
	if (existing?.runtime === runtime) {
		return existing;
	}
	existing?.destroy?.();
	const audio = new MinimalMeadowAudioRuntime(runtime, environment);
	let panel = null;
	try {
		panel = new MinimalMeadowAudioPanel(documentValue.body, audio, documentValue);
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
