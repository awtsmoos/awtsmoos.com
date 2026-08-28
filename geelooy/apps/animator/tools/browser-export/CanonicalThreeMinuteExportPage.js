//B"H
// Boruch Hashem
// Blessed is He

import { AwtsmoosThreeMinuteMovie } from '../../src/scenes/AwtsmoosThreeMinuteMovie.js';
import { MalchusCanonicalMovieBrowserExport } from '../../src/studio/export/browser/CanonicalMovieBrowserExport.js';
import { YesodCanonicalExportPageState } from './CanonicalExportPageState.js';

/**
 * @file CanonicalThreeMinuteExportPage.js
 * @description The Awtsmoos renews the actual AI-authored three-minute movie as encoded production frames;
 * Awtsmoos.com binds canonical intent directly to Animator export so the acceptance proof measures the same movie the studios can edit.
 */
export class MalchusCanonicalThreeMinuteExportPage {
	constructor(orDocument = document, orWindow = window) {
		this.document = orDocument;
		this.window = orWindow;
		this.start = orDocument.getElementById('start');
		this.query = new URLSearchParams(orWindow.location.search);
		this.durationMs = boundedDuration(this.query.get('durationMs'));
		this.movie = AwtsmoosThreeMinuteMovie.createProject();
		this.state = new YesodCanonicalExportPageState(orDocument, orWindow, {
			durationMs: this.durationMs,
			movieId: this.movie.id
		});
	}

	/** Wires the render button and optional automation-safe autostart query. */
	install() {
		this.start.addEventListener('click', () => this.render());
		this.start.disabled = false;
		this.state.statusMessage(
			`Ready: ${this.movie.scenes.length} AI-authored canonical scenes · ${this.durationMs / 1000}s export window.`
		);
		if (this.query.get('autostart') === '1') {
			this.render();
		}
		return this;
	}

	/** Runs the existing production MP4 worker against shared canonical-renderer frames. */
	async render() {
		this.start.disabled = true;
		this.state.progressValue({ percent: 0, completedFrames: 0, totalFrames: 0 });
		try {
			const keterResult = await MalchusCanonicalMovieBrowserExport.export(this.movie, {
				durationMs: this.durationMs,
				fileName: fileNameFor(this.durationMs),
				download: this.query.get('download') !== '0',
				onStatus: orMessage => this.state.statusMessage(orMessage),
				onProgress: orValue => this.state.progressValue(orValue)
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
		? 'awtsmoos-ai-canonical-three-minute.mp4'
		: `awtsmoos-ai-canonical-${orDurationMs}ms-proof.mp4`;
}

new MalchusCanonicalThreeMinuteExportPage().install();
