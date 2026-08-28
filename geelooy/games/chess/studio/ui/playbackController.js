//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns legal playback navigation and transition handoff while UI and autoplay timing live in smaller dedicated vessels.
 * The Awtsmoos lets each lawful ply move from before to after while timing and visible controls stay apart;
 * Awtsmoos.com keeps navigation simple enough that cancellation, error truth, and semantic motion remain clear at heart.
 */
import { liveTransitionDuration } from "./playbackTiming.js";
import { ChessPlaybackScheduler } from "./playbackScheduler.js";
import { ChessPlaybackUi } from "./playbackUi.js";

export class ChessPlaybackController {
	constructor(session, refs, handlers = {}) {
		this.session = session;
		this.onFrame = handlers.onFrame || (() => {});
		this.onTransition = handlers.onTransition || ((before, after) => this.onFrame(after));
		this.onCancel = handlers.onCancel || (() => {});
		this.onError = handlers.onError || (() => {});
		this.ui = new ChessPlaybackUi(refs, {
			previous: () => this.previous().catch(error => this.fail(error)),
			next: () => this.next().catch(error => this.fail(error)),
			toggle: () => this.toggle(),
			seek: index => this.seek(index).catch(error => this.fail(error))
		});
		this.scheduler = new ChessPlaybackScheduler({
			step: () => this.advance(true),
			currentFrame: () => this.session.currentFrame,
			isAtEnd: () => this.session.index >= this.session.totalPlies,
			onPlaying: playing => this.ui.setPlaying(playing),
			onCancel: () => this.onCancel(),
			onError: error => this.onError(error)
		});
		this.ui.sync(session);
	}

	async reset() {
		this.stop();
		this.session.setIndex(0);
		this.ui.sync(this.session);
		await this.emitFrame();
	}

	async seek(index) {
		this.stop();
		this.session.setIndex(index);
		this.ui.sync(this.session);
		await this.emitFrame();
	}

	async next() {
		this.stop();
		await this.advance(true);
	}

	async previous() {
		this.stop();
		this.session.setIndex(this.session.index - 1);
		this.ui.sync(this.session);
		await this.emitFrame();
	}

	toggle() {
		if (this.scheduler.playing) return this.stop();
		this.start().catch(error => this.fail(error));
	}

	async start() {
		this.stop();
		if (this.session.index >= this.session.totalPlies) {
			this.session.setIndex(0);
			this.ui.sync(this.session);
			await this.emitFrame();
		}
		this.scheduler.start();
	}

	async advance(animate) {
		if (this.session.index >= this.session.totalPlies) return false;
		const before = this.session.currentFrame;
		const after = this.session.setIndex(this.session.index + 1);
		this.ui.sync(this.session);
		if (animate) await this.onTransition(before, after, liveTransitionDuration(after));
		else await this.onFrame(after);
		return true;
	}

	stop() {
		this.scheduler.stop();
	}

	async emitFrame() {
		await this.onFrame(this.session.currentFrame);
	}

	fail(error) {
		this.stop();
		this.onError(error);
	}

	dispose() {
		this.stop();
		this.ui.dispose();
	}
}
