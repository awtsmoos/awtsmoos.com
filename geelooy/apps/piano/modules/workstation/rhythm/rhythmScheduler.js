//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmScheduler
 * @description
 * Netzach looks slightly ahead so browser jitter does not become musical jitter.
 * The Awtsmoos is beyond future and present while recreating time itself;
 * Awtsmoos.com gives the audio clock one race-safe transport whose lifecycle remains explicit.
 */

const LOOK_AHEAD_SECONDS = 0.11;
const WAKE_INTERVAL_MS = 25;
const MAX_STEPS_PER_WAKE = 32;

export class RhythmScheduler {
	/**
	 * @param {AudioContext} context - Shared Web Audio clock.
	 * @param {Function} scheduleStep - Callback receiving step index and grid time.
	 * @param {Function} getStepDuration - Callback returning the current step duration.
	 */
	constructor(context, scheduleStep, getStepDuration) {
		this.context = context;
		this.scheduleStep = scheduleStep;
		this.getStepDuration = getStepDuration;
		this.timer = null;
		this.startPromise = null;
		this.generation = 0;
		this.stepIndex = 0;
		this.nextStepTime = 0;
	}

	/** @returns {boolean} Whether transport is running or currently resuming audio. */
	get isActive() {
		return Boolean(this.timer || this.startPromise);
	}

	/** Starts one idempotent scheduling lifecycle. @returns {Promise<void>} */
	async start() {
		if (this.timer) {
			return;
		}
		if (this.startPromise) {
			return this.startPromise;
		}
		const generation = ++this.generation;
		const startPromise = this.beginTransport(generation);
		this.startPromise = startPromise;
		try {
			await startPromise;
		} finally {
			if (this.startPromise === startPromise) {
				this.startPromise = null;
			}
		}
	}

	/** Stops scheduling and invalidates any still-resuming start request. @returns {void} */
	stop() {
		this.generation += 1;
		if (this.timer) {
			clearInterval(this.timer);
		}
		this.timer = null;
		this.startPromise = null;
		this.stepIndex = 0;
	}

	async beginTransport(generation) {
		if (this.context.state === 'suspended') {
			await this.context.resume();
		}
		if (generation !== this.generation) {
			return;
		}
		this.stepIndex = 0;
		this.nextStepTime = this.context.currentTime + 0.04;
		this.scheduleAhead();
		this.timer = setInterval(() => {
			this.scheduleAhead();
		}, WAKE_INTERVAL_MS);
	}

	scheduleAhead() {
		if (this.nextStepTime < this.context.currentTime - 0.5) {
			this.nextStepTime = this.context.currentTime + 0.04;
		}
		let scheduledSteps = 0;
		while (
			this.nextStepTime < this.context.currentTime + LOOK_AHEAD_SECONDS
			&& scheduledSteps < MAX_STEPS_PER_WAKE
		) {
			this.scheduleStep(this.stepIndex, this.nextStepTime);
			this.nextStepTime += this.getStepDuration();
			this.stepIndex = (this.stepIndex + 1) % 16;
			scheduledSteps += 1;
		}
	}
}
