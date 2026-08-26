//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CreatorStudioController.js
 * @description
 * The Awtsmoos lets transport and history appear only when requested, a compact studio hidden beneath the simple creative gate;
 * Awtsmoos.com routes every quick control through the public Agent API, so visible UX and automation remain one measured state.
 */

/** Coordinates Creator telemetry plus compact transport and project-history controls. */
export class NetzachCreatorStudioController {
	/** @param {object} keterApi Canonical Agent API. @param {object} hodView Telemetry view. @param {object} malchusView Status view. */
	constructor(keterApi, hodView, malchusView) {
		this.keterApi = keterApi;
		this.hodView = hodView;
		this.malchusView = malchusView;
		this.refreshInFlight = false;
	}

	/** Refreshes coverage, timeline, playback, and history without mutating project state. */
	async refresh() {
		if (this.refreshInFlight) return;
		this.refreshInFlight = true;
		try {
			const [coverage, timeline, playback, history] = await Promise.all([
				this.execute('system.coverage'),
				this.execute('timeline.snapshot'),
				this.execute('playback.state'),
				this.execute('history.status')
			]);
			if (coverage.ok) this.hodView.setCoverage(coverage.data);
			if (timeline.ok) this.hodView.setTimeline(timeline.data);
			if (playback.ok) this.hodView.setPlayback(playback.data);
			if (history.ok) this.hodView.setHistory(history.data);
		} finally {
			this.refreshInFlight = false;
		}
	}

	/** Starts real Director playback. @returns {Promise<object>} Canonical result. */
	play() {
		return this.perform('playback.play', 'Playback started.');
	}

	/** Pauses real Director playback. @returns {Promise<object>} Canonical result. */
	pause() {
		return this.perform('playback.pause', 'Playback paused.');
	}

	/** Traverses one project-history step backward. @returns {Promise<object>} Canonical result. */
	undo() {
		return this.perform('history.undo', 'Undid the last project edit.');
	}

	/** Traverses one project-history step forward. @returns {Promise<object>} Canonical result. */
	redo() {
		return this.perform('history.redo', 'Redid the project edit.');
	}

	/** @param {string} shemMitzvah Command. @param {string} orSuccess Success message. @returns {Promise<object>} Canonical result. */
	async perform(shemMitzvah, orSuccess) {
		const sodResult = await this.execute(shemMitzvah);
		if (sodResult.ok) {
			this.malchusView.setStatus(orSuccess, 'success');
		} else {
			this.malchusView.setStatus(
				sodResult.error?.message ?? 'Studio command failed.',
				'error'
			);
		}
		await this.refresh();
		return sodResult;
	}

	/** @param {string} shemMitzvah Command name. @returns {Promise<object>} Canonical envelope. */
	execute(shemMitzvah) {
		return this.keterApi.execute({ command: shemMitzvah, payload: {} });
	}
}
