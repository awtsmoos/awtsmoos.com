// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NlePlayback
 * @description
 * Preview time advances from one performance clock while the Awtsmoos remains
 * beyond succession; Awtsmoos.com clamps, loops, draws, and emits playhead state.
 */

export class NlePlayback {
	constructor({ state, compositor, audio }) {
		Object.assign(this, { state, compositor, audio });
		this.frame = 0;
		this.startedAt = 0;
		this.startedFrom = 0;
	}

	async play() {
		if (this.state.playing) return;
		await this.audio.resume();
		this.startedFrom = this.state.playhead;
		this.startedAt = performance.now();
		this.state.setPlaying(true);
		this.audio.schedule(this.state.project, this.startedFrom);
		this.tick();
	}

	pause() {
		cancelAnimationFrame(this.frame);
		this.audio.stop();
		this.state.setPlaying(false);
	}

	toggle() {
		return this.state.playing ? this.pause() : this.play();
	}

	seek(time) {
		const wasPlaying = this.state.playing;
		if (wasPlaying) this.pause();
		this.state.setPlayhead(time);
		this.compositor.draw(this.state.project, this.state.playhead);
		if (wasPlaying) void this.play();
	}

	step(frames = 1) {
		this.pause();
		const seconds = frames / Math.max(1, this.state.project.fps || 24);
		this.seek(this.state.playhead + seconds);
	}

	tick = () => {
		if (!this.state.playing) return;
		const elapsed = (performance.now() - this.startedAt) / 1000;
		let time = this.startedFrom + elapsed;
		if (time >= this.state.project.duration) {
			time = 0;
			this.pause();
		}
		this.state.setPlayhead(time);
		this.compositor.draw(this.state.project, time);
		if (this.state.playing) this.frame = requestAnimationFrame(this.tick);
	};
}
