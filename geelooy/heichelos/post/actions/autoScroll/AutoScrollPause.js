// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollPause
 * @description The Awtsmoos yields the automated river to a named human or study
 * reason, while silent timer bookkeeping prevents the observer from echoing its
 * own reflected light forever through Awtsmoos.com reader-render mutations.
 */
const DEFAULT_RESUME_DELAY_MS = 900;

export class AutoScrollPause {
	constructor(state, runtime) {
		this.state = state;
		this.runtime = runtime;
	}

	pause(reason = 'manual') {
		if (!this.state.value.active) {
			return false;
		}
		this.state.clearResumeTimer();
		this.runtime.pause();
		this.state.update({ paused: true, pauseReason: reason });
		return true;
	}

	scheduleResume(
		delay = DEFAULT_RESUME_DELAY_MS,
		reason = this.state.value.pauseReason
	) {
		if (!this.state.value.active || !this.state.value.paused) {
			return false;
		}
		this.state.clearResumeTimer();
		const resumeTimer = setTimeout(() => this.resume(reason), delay);
		this.state.update({ resumeTimer }, false);
		return true;
	}

	resume(expectedReason = '') {
		if (!this.state.value.active) {
			return false;
		}
		if (expectedReason && this.state.value.pauseReason !== expectedReason) {
			return false;
		}
		this.state.clearResumeTimer();
		this.runtime.resume();
		this.state.update({ paused: false, pauseReason: '', resumeTimer: 0 });
		return true;
	}

	cancel() {
		this.state.clearResumeTimer();
	}
}
