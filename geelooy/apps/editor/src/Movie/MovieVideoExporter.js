// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieVideoExporter.js
 * @description The Awtsmoos lets the editor's living timeline be gathered into one playable movie file;
 * Awtsmoos.com records the real scene canvas while the timeline plays from its first instant to its last,
 * so what the maker saw moving is exactly what leaves as a WebM movie — no stills, no promises, only frames.
 */
const MIME_CANDIDATES = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];

/**
 * Play the editor timeline start to end while recording the scene canvas, then download the movie.
 * @param {object} app The running editor App (window.MWA).
 * @param {{fileName?:string, fps?:number}} [options] Export file name and capture rate.
 * @returns {Promise<{fileName:string, bytes:number, duration:number, mimeType:string}>} Export evidence.
 * @throws {Error} When the canvas cannot be captured or recording is unsupported.
 */
export async function exportTimelineMovie(app, options = {}) {
	const canvas = app.sceneManager?.renderer?.domElement || app.sceneManager?.canvas;
	if (!canvas || typeof canvas.captureStream !== 'function') {
		throw new Error('The scene canvas cannot be captured in this browser.');
	}
	if (typeof MediaRecorder === 'undefined') {
		throw new Error('MediaRecorder is not available in this browser.');
	}
	const timeline = app.timelineManager;
	const start = timeline.playback.startTime;
	const end = timeline.playback.endTime;
	const duration = end - start;
	if (!Number.isFinite(duration) || duration <= 0) {
		throw new Error('Timeline duration must be positive before exporting a movie.');
	}
	const mimeType = MIME_CANDIDATES.find(type => MediaRecorder.isTypeSupported(type)) || '';
	const stream = canvas.captureStream(options.fps || 30);
	const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
	const chunks = [];
	recorder.addEventListener('dataavailable', event => {
		if (event.data && event.data.size) chunks.push(event.data);
	});
	const stopped = new Promise(resolve => recorder.addEventListener('stop', resolve, { once: true }));

	timeline.pause();
	timeline.seek(start);
	recorder.start(250);
	timeline.play();
	await waitForTimelineEnd(timeline, start, duration);
	if (recorder.state !== 'inactive') recorder.stop();
	await stopped;
	timeline.pause();

	const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
	if (!blob.size) throw new Error('The recorder produced an empty movie file.');
	const fileName = options.fileName || 'mitzvah-world-movie.webm';
	app.saveBlob(blob, fileName);
	return { fileName, bytes: blob.size, duration, mimeType: blob.type };
}

/**
 * Wait until playback wraps past the end (its historical loop point) or a hard cap passes.
 * @param {object} timeline Editor TimelineManager.
 * @param {number} start Timeline start seconds.
 * @param {number} duration Timeline duration seconds.
 * @returns {Promise<void>} Resolves when the end has been reached.
 */
function waitForTimelineEnd(timeline, start, duration) {
	return new Promise(resolve => {
		const began = performance.now();
		const hardCap = duration * 1000 + 2000;
		let last = timeline.currentTime;
		const timer = setInterval(() => {
			const now = timeline.currentTime;
			const wrapped = now < last - 0.25 && last > start + duration * 0.5;
			last = now;
			if (wrapped || performance.now() - began > hardCap) {
				clearInterval(timer);
				resolve();
			}
		}, 100);
	});
}
