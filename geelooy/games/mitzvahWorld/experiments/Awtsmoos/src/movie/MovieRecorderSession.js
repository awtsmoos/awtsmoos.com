// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRecorderSession.js
 * @description Binds MediaRecorder to deterministic frame submission and telemetry.
 * The Awtsmoos renews every frame and sound beyond the codec; Awtsmoos.com keeps
 * the finite recording session explicit, abortable, and free of start-event deadlock.
 */

import { MovieFrameCadence } from './MovieFrameCadence.js';
import { MovieFramePump } from './MovieFramePump.js';
import { stopMovieRecorder } from './MovieRecordingResult.js';

/**
 * Records one stream while explicitly drawing every intended movie frame.
 */
export function recordMovieStream(options) {
	const chunks = [];
	const recorder = createRecorder(options);
	let aborted = false;
	let settled = false;
	let telemetry = null;

	return new Promise((resolve, reject) => {
		recorder.ondataavailable = event => {
			if (event.data?.size) chunks.push(event.data);
		};
		recorder.onerror = event => {
			fail(event.error || new Error('MediaRecorder failed.'));
		};
		recorder.onstop = () => {
			if (settled) return;
			settled = true;
			resolve({
				blob: new Blob(chunks, { type: options.format.mimeType }),
				telemetry
			});
		};

		try {
			recorder.start(500);
			void pumpFrames();
		} catch (error) {
			fail(error);
		}

		async function pumpFrames() {
			try {
				telemetry = await createFramePump(options, () => aborted).run();
				stopMovieRecorder(recorder);
			} catch (error) {
				fail(error);
			}
		}

		function fail(error) {
			if (settled) return;
			aborted = true;
			settled = true;
			if (recorder.state === 'recording') recorder.stop();
			reject(error);
		}
	});
}

function createFramePump(options, shouldAbort) {
	return new MovieFramePump({
		cadence: new MovieFrameCadence(
			options.project.duration,
			options.project.fps
		),
		captureMode: options.captureMode,
		director: options.director,
		onProgress: options.onProgress,
		shouldAbort,
		track: options.track
	});
}

function createRecorder(options) {
	return new MediaRecorder(options.stream, {
		audioBitsPerSecond: 160000,
		mimeType: options.format.mimeType,
		videoBitsPerSecond: Number(
			options.project.render?.videoBitsPerSecond || 4200000
		)
	});
}

export default recordMovieStream;
