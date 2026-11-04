// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieMp4Exporter.js
 * @description The Awtsmoos lets the editor's living timeline leave as a real MP4;
 * Awtsmoos.com feeds the Animator's proven browser encoder stack (capability
 * probe, MediaBunny worker, H.264 mux) with exact-timestamp frames of the
 * editor's own scene — seek, pose, render, capture — so the MP4 shows the
 * editor's true pixels, never a second renderer's guess. The editor timeline
 * carries no soundtrack, so the export is honestly video-only: no score is
 * synthesized for it. The historical WebM recorder remains beside it.
 *
 * The Animator stack is imported lazily, only when an MP4 export is truly
 * requested: its module graph belongs to the Animator app, and the editor
 * page must never pay for it — or risk it — at load time.
 */

/**
 * Exact-timestamp frame source over the editor's real scene. Seeking the
 * editor timeline poses every animated object synchronously (the playback
 * engine's seek updates the animator), so each capture renders precisely
 * the requested moment without playing or waiting for a frame tick.
 */
export class EditorTimelineFrameSource {
	constructor(app) {
		this.app = app;
		this.timeline = app.timelineManager;
		this.sceneManager = app.sceneManager;
		this.canvas = app.sceneManager?.renderer?.domElement || app.sceneManager?.canvas;
		if (!this.canvas || !this.timeline || !this.sceneManager) {
			throw new Error('The editor scene is unavailable for MP4 export.');
		}
		this.startSeconds = Number(this.timeline.playback.startTime) || 0;
		this.restoreTime = this.timeline.currentTime;
		this.wasPlaying = Boolean(this.timeline.playback.isPlaying);
	}

	async prepare() {
		this.timeline.pause();
		this.timeline.seek(this.startSeconds);
	}

	async capture(timeMs, width, height) {
		this.timeline.seek(this.startSeconds + Math.max(0, Number(timeMs) || 0) / 1000);
		this.sceneManager.render();
		return globalThis.createImageBitmap(this.canvas, {
			resizeWidth: width,
			resizeHeight: height,
			resizeQuality: 'high'
		});
	}

	/** Returns the editor to the exact playhead state the export found. */
	restore() {
		this.timeline.pause();
		this.timeline.seek(this.restoreTime);
		this.sceneManager.render();
		if (this.wasPlaying) this.timeline.play();
	}
}

/**
 * Export the editor timeline as an MP4 through the Animator browser stack.
 * @param {object} app The running editor App (window.MWA).
 * @param {{fileName?:string, fps?:number, width?:number, height?:number, onStatus?:Function}} [options]
 * @returns {Promise<{fileName:string, bytes:number, duration:number, mimeType:string, silent:boolean}>} Export evidence.
 */
export async function exportTimelineMovieMp4(app, options = {}) {
	const frameSource = new EditorTimelineFrameSource(app);
	const timeline = app.timelineManager;
	const start = Number(timeline.playback.startTime) || 0;
	const end = Number(timeline.playback.endTime) || 0;
	const durationSeconds = end - start;
	if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
		throw new Error('Timeline duration must be positive before exporting a movie.');
	}
	const canvas = frameSource.canvas;
	const width = Number(options.width || canvas.width || 640);
	const height = Number(options.height || canvas.height || 360);
	const fps = Number(options.fps || 30);
	const plan = {
		id: 'mitzvah-world-editor',
		title: 'Mitzvah World Editor Movie',
		duration: Math.round(durationSeconds * 1000),
		characters: [],
		sequences: [],
		shots: [],
		dialogue: [],
		performances: [],
		settings: { width, height, fps }
	};
	try {
		const { AnimatorBrowserExportController } = await import(
			'../../../animator/src/studio/export/browser/AnimatorBrowserExportController.js'
		);
		const result = await AnimatorBrowserExportController.export(plan, {
			fileName: options.fileName || 'mitzvah-world-movie.mp4',
			fps,
			width,
			height,
			frameSource,
			soundtrack: false,
			onStatus: options.onStatus
		});
		return {
			fileName: result.fileName,
			bytes: result.blob?.size || 0,
			duration: durationSeconds,
			mimeType: result.blob?.type || 'video/mp4',
			silent: result.silent === true
		};
	} finally {
		frameSource.restore();
	}
}
