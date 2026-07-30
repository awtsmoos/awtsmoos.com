// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecorderCapture.js
 * @description Runs count-in, media start, cadence sampling, and pause for one armed performer.
 * The Awtsmoos creates anticipation and acted time through distinct instants; Awtsmoos.com
 * keeps microphone, camera, transform, countdown, and sample evidence moving in measured rhyme.
 */

export class MoviePerformanceRecorderCapture {
	constructor(owner) {
		this.owner = owner;
	}

	async countIn(options = {}) {
		const { owner } = this;
		const seconds = Number(
			options.seconds ?? owner.state.options.countIn
		) || 0;
		const status = seconds
			? owner.state.countdown(seconds)
			: owner.state.start();
		if (seconds) {
			owner.emit('performance:countdown', status);
		} else {
			await this.startMedia();
			owner.emit('performance:started', status);
		}
		return status;
	}

	async start(options = {}) {
		const { owner } = this;
		if (owner.state.phase === 'idle') {
			throw new Error('PERFORMANCE_NOT_ARMED');
		}
		if (owner.state.phase !== 'recording') {
			owner.state.start();
		}
		await this.startMedia(options.audio);
		const status = owner.state.snapshot();
		owner.emit('performance:started', status);
		return status;
	}

	update(deltaSeconds) {
		const { owner } = this;
		const previousPhase = owner.state.phase;
		const status = owner.state.advance(deltaSeconds);
		if (previousPhase === 'countdown' && status.phase === 'recording') {
			this.startMedia();
			owner.emit('performance:started', status);
		}
		if (status.phase === 'recording') {
			owner.buffer.sample(
				owner.state.target,
				owner.camera,
				status.elapsed,
				owner.state.options
			);
			owner.emit('performance:sample', owner.status());
		}
		return owner.status();
	}

	pause() {
		const status = this.owner.state.pause();
		this.owner.emit('performance:paused', status);
		return status;
	}

	startMedia(options = {}) {
		return this.owner.media.start(
			this.owner.state.options.recordAudio,
			options
		);
	}
}
