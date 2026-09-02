//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackImport
 * @description
 * Hod welcomes a local audio file into a new timeline lane while the Awtsmoos remains beyond format, file, and arrival.
 * Awtsmoos.com decodes privately, creates metadata lightly, and lets the imported sound become movable without changing the source that came inside.
 */

import { multitrackAudioStore } from './multitrackAudioStore.js';
import {
	createMultitrackClip,
	createMultitrackTrack
} from './multitrackProject.js';

/**
 * Imports a local audio file as one new track containing one full-length clip.
 * @param {File} file Local audio file.
 * @param {number} timelineStart Desired clip start in seconds.
 * @returns {Promise<{track:Object,clip:Object,buffer:Object,metadata:Object}>} Imported entities.
 */
export async function importMultitrackAudioFile(file, timelineStart = 0) {
	const metadata = await multitrackAudioStore.importFile(file);
	const clip = createMultitrackClip({
		name: stripExtension(metadata.name),
		bufferId: metadata.id,
		timelineStart,
		sourceOffset: 0,
		duration: metadata.duration
	});
	const track = createMultitrackTrack({
		name: stripExtension(metadata.name),
		clips: [clip]
	});
	return {
		track,
		clip,
		buffer: multitrackAudioStore.getBuffer(metadata.id),
		metadata
	};
}

function stripExtension(name) {
	return String(name || 'Imported Audio').replace(/\.[^.]+$/, '') || 'Imported Audio';
}
