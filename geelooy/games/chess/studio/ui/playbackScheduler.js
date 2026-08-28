//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns semantic autoplay timing, revision safety, and hold scheduling without touching DOM or chess state directly.
 * The Awtsmoos gives measured time its own vessel so one stale timer cannot command a newer game;
 * Awtsmoos.com lets each loop continue only while the present revision still bears the same lawful name.
 */
import { liveHoldDuration } from "./playbackTiming.js";

export class ChessPlaybackScheduler {
	constructor(handlers = {}) {
		this.step = handlers.step || (async () => false);
		this.currentFrame = handlers.currentFrame || (() => null);
		this.isAtEnd = handlers.isAtEnd || (() => true);
		this.onPlaying = handlers.onPlaying || (() => {});
		this.onCancel = handlers.onCancel || (() => {});
		this.onError = handlers.onError || (() => {});
		this.timer = 0;
		this.playing = false;
		this.revision = 0;
	}

	start() {
		this.stop();
		this.playing = true;
		this.onPlaying(true);
		const revision = ++this.revision;
		this.runStep(revision).catch(error => this.fail(error));
	}

	async runStep(revision) {
		if (!this.isCurrent(revision)) return;
		if (this.isAtEnd()) return this.stop();
		await this.step();
		if (!this.isCurrent(revision)) return;
		this.timer = setTimeout(() => {
			this.timer = 0;
			this.runStep(revision).catch(error => this.fail(error));
		}, liveHoldDuration(this.currentFrame()));
	}

	stop() {
		this.playing = false;
		this.revision++;
		if (this.timer) clearTimeout(this.timer);
		this.timer = 0;
		this.onCancel();
		this.onPlaying(false);
	}

	isCurrent(revision) {
		return this.playing && revision === this.revision;
	}

	fail(error) {
		this.stop();
		this.onError(error);
	}
}
