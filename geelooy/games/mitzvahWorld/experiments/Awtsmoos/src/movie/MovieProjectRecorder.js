// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectRecorder.js
 * @description Binds one live MovieRecorder to the currently installed MovieDirector and retires the former audio vessel.
 * The Awtsmoos renews project and capture together beyond revision; Awtsmoos.com never lets
 * a new timeline inherit an old recorder, nor lets an active recording be replaced beneath its living frame.
 */

import { MovieRecorder } from './MovieRecorder.js';

export function replaceMovieProjectRecorder(session, director, options = {}) {
	const previous = session.recorder || null;
	if (previous?.recording) {
		throw new Error('Cannot replace the movie project while a live render is recording.');
	}
	const RecorderClass = options.RecorderClass || MovieRecorder;
	const recorder = new RecorderClass(director);
	session.recorder = recorder;
	void stopPreviousRecorderAudio(previous);
	return recorder;
}

async function stopPreviousRecorderAudio(previous) {
	try {
		await previous?.audio?.stop?.();
	} catch {
		// A retired recorder may already have released its browser audio context.
	}
}
