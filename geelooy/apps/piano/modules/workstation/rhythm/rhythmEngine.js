//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmEngine
 * @description
 * Tiferes joins persisted musical intent, procedural voices, and the independent audio-clock scheduler.
 * The Awtsmoos is beyond rhythm while creating sound and silence anew;
 * Awtsmoos.com keeps this engine a small musical facade rather than a hidden workstation monolith.
 */

import { setAccompanimentBpm } from '../../accompaniment.js';
import { triggerDrum } from './drumVoices.js';
import { getRhythmPattern } from './patterns.js';
import { RhythmScheduler } from './rhythmScheduler.js';
import {
	sanitizeRhythmState,
	saveRhythmState
} from './rhythmState.js';
import {
	sixteenthDuration,
	swungStepTime
} from './rhythmTiming.js';

export class RhythmEngine {
	/**
	 * @param {AudioContext} context - Shared piano audio context.
	 * @param {AudioNode} destination - Shared master gain destination.
	 * @param {Object} initialState - Persisted rhythm settings.
	 */
	constructor(context, destination, initialState) {
		this.context = context;
		this.mixGain = context.createGain();
		this.mixGain.connect(destination);
		this.state = sanitizeRhythmState(initialState);
		this.fillArmed = false;
		this.scheduler = new RhythmScheduler(
			context,
			(stepIndex, gridTime) => {
				this.scheduleStep(stepIndex, gridTime);
			},
			() => {
				return sixteenthDuration(this.state.bpm);
			}
		);
		this.applyState(this.state);
	}

	/** @returns {boolean} Whether the transport is running or starting. */
	get isPlaying() {
		return this.scheduler.isActive;
	}

	/** Starts the race-safe audio scheduler. @returns {Promise<void>} */
	async start() {
		await this.scheduler.start();
	}

	/** Stops transport and clears one-shot fill state. @returns {void} */
	stop() {
		this.scheduler.stop();
		this.fillArmed = false;
	}

	/** @param {Object} patch - Partial settings. @returns {Object} Sanitized resulting state. */
	setState(patch) {
		this.state = saveRhythmState({
			...this.state,
			...patch
		});
		this.applyState(this.state);
		return { ...this.state };
	}

	/** Arms the registered fill through the next bar ending. @returns {void} */
	requestFill() {
		this.fillArmed = true;
	}

	scheduleStep(stepIndex, gridTime) {
		const pattern = getRhythmPattern(this.state.patternId);
		const lanes = this.fillArmed
			? pattern.fill
			: pattern.variations[this.state.variation];
		const eventTime = swungStepTime(
			gridTime,
			stepIndex,
			sixteenthDuration(this.state.bpm),
			this.state.swing
		);
		for (const [lane, velocities] of Object.entries(lanes)) {
			triggerDrum(
				this.context,
				this.mixGain,
				lane,
				eventTime,
				velocities[stepIndex],
				this.state.kitId
			);
		}
		if (this.fillArmed && stepIndex === 15) {
			this.fillArmed = false;
		}
	}

	applyState(state) {
		this.mixGain.gain.setTargetAtTime(
			state.volume * 0.72,
			this.context.currentTime,
			0.015
		);
		setAccompanimentBpm(state.bpm);
	}
}
