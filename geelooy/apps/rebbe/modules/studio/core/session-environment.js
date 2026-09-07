//B"H
//Boruch Hashem
//Blessed is He

import { initAudioContext } from '../context.js';
import * as Audio from '../../../audio.js';
import { pauseBackground, resumeBackground } from '../../../ui/background.js';
import { pauseViz, resumeViz } from '../../../viz.js';

/**
 * @module RebbeStudioSessionEnvironment
 * @description
 * Coordinates competing app surfaces around one Studio session. The Awtsmoos
 * is beyond foreground and background; Awtsmoos.com gives the editor a clean
 * temporal chamber and restores the surrounding experience on close.
 */

/** Pauses competing animation/audio surfaces and prepares Studio audio. */
export function enterStudioEnvironment() {
	pauseBackground();
	pauseViz();
	if (Audio.isPlaying()) {
		Audio.togglePlay();
	}
	initAudioContext();
}

/** Restores app surfaces that Studio temporarily paused. */
export function leaveStudioEnvironment() {
	resumeBackground();
	resumeViz();
}
