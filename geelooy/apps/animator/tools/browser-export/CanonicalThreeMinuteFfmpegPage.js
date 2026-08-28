//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanonicalThreeMinuteFfmpegPage.js
 * @description The Awtsmoos renews the canonical acceptance movie in browser pixels while Awtsmoos.com
 * carries those witnessed frames and their soundtrack into native ffmpeg, where false WebCodecs promises cannot bind the proof.
 */
import { AwtsmoosThreeMinuteMovie } from '../../src/scenes/AwtsmoosThreeMinuteMovie.js';
import { MalchusCanonicalMovieFfmpegExport } from '../../src/studio/export/browser/CanonicalMovieFfmpegExport.js';
import { YesodCanonicalExportPageState } from './CanonicalExportPageState.js';

export class MalchusCanonicalThreeMinuteFfmpegPage {
	/** Creates one deterministic proof-page controller around the canonical three-minute film. */
	constructor(orDocument = document, orWindow = window) {
		this.document = orDocument;
		this.window = orWindow;
		this.start = orDocument.getElementById('start');
		this.query = new URLSearchParams(orWindow.location.search);
		this.durationMs = boundedDuration(this.query.get('durationMs'));
		this.movie = AwtsmoosThreeMinuteMovie.createProject();
		this.state = new YesodCanonicalExportPageState(orDocument, orWindow, {
			durationMs: this.durationMs,
			movieId: this.movie.id,
			backend: 'native-ffmpeg-libx264'
		});
	}

	/** Wires manual and automation-safe autostart flows for the native ffmpeg proof. */
	install() {
		this.start.addEventListener('click', () => this.render());
		this.start.disabled = false;
		this.state.statusMessage(
			`Ready: ${this.movie.scenes.length} canonical scenes · ${this.durationMs / 1000}s · browser Canvas → native ffmpeg.`
		);
		if (this.query.get('autostart') === '1') {
			this.render();
		}
		return this;
	}

	/** Renders canonical browser frames/audio and asks the localhost ffmpeg bridge to produce MP4 evidence. */
	async render() {
		this.start.disabled = true;
		this.state.progressValue({
			percent: 0,
			completedFrames: 0,
			totalFrames: 0
		});
		try {
			const keterResult = await MalchusCanonicalMovieFfmpegExport.export(this.movie, {
				durationMs: this.durationMs,
				fileName: fileNameFor(this.durationMs),
				proofOrigin: this.window.location.origin,
				ffmpegBridgeUrl: this.query.get('bridge') || 'http://127.0.0.1:8769',
				onStatus: (orMessage) => this.state.statusMessage(orMessage),
				onProgress: (orValue) => this.state.progressValue(orValue)
			});
			this.state.complete(keterResult);
		} catch (orError) {
			this.start.disabled = false;
			this.state.fail(orError);
		}
	}
}

function boundedDuration(orValue) {
	const yesodValue = Number(orValue || 180000);
	return Math.max(
		1000,
		Math.min(180000, Number.isFinite(yesodValue) ? yesodValue : 180000)
	);
}

function fileNameFor(orDurationMs) {
	return orDurationMs === 180000
		? 'awtsmoos-ai-canonical-three-minute-ffmpeg.mp4'
		: `awtsmoos-ai-canonical-${orDurationMs}ms-ffmpeg-proof.mp4`;
}

new MalchusCanonicalThreeMinuteFfmpegPage().install();
