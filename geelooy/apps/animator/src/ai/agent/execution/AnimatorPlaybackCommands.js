//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorPlaybackCommands.js
 * @description
 * The Awtsmoos lets authored time flow, rest, and resume through the same Director that animates the visible canvas;
 * Awtsmoos.com joins transport automation to real runtime state while the NLE playhead remains synchronized and honest in balance.
 */

import { NLECommands } from '../../../nle/core/NLECommands.js';

/** Handles real Director-backed playback and synchronized NLE time state. */
export class NetzachAnimatorPlaybackCommands {
	/** @param {object} malchusStore Shared NLE store. @param {object} keterRuntime Optional live runtime context. */
	constructor(malchusStore, keterRuntime = {}) {
		this.malchusStore = malchusStore;
		this.keterRuntime = keterRuntime;
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. @returns {object} Transport result. */
	execute(shemMitzvah, keilimPayload = {}) {
		if (shemMitzvah === 'playback.state') return this.state();
		if (shemMitzvah === 'playback.seek') return this.seek(keilimPayload.time);
		if (shemMitzvah === 'playback.play') return this.play();
		if (shemMitzvah === 'playback.pause') return this.pause();
		throw this.error(shemMitzvah);
	}

	/** @returns {object} Real transport state when Director is installed, with store fallback for direct API tests. */
	state() {
		const malchusState = this.malchusStore.get();
		const netzachDirector = this.keterRuntime.director;
		return {
			playhead: Number(netzachDirector?.getElapsed?.() ?? malchusState.playhead ?? 0),
			duration: Number(malchusState.duration ?? 0),
			playing: typeof netzachDirector?.isPlaying === 'boolean'
				? netzachDirector.isPlaying
				: null,
			source: netzachDirector ? 'animator-director' : 'nle-store'
		};
	}

	/** @param {number} zmanTime Absolute time ms. @returns {object} Updated transport state. */
	seek(zmanTime) {
		NLECommands.scrub(this.malchusStore, zmanTime);
		this.keterRuntime.director?.seek?.(zmanTime);
		return this.state();
	}

	/** @returns {object} Director-backed playback state after starting or resuming. */
	play() {
		const netzachDirector = this.requireDirector();
		const sederSequence = this.keterRuntime.state?.get?.('activeSequence');
		if (!sederSequence) {
			throw this.runtimeError('No active sequence is available for playback.');
		}
		const zmanStart = Number(this.malchusStore.get().playhead ?? netzachDirector.getElapsed?.() ?? 0);
		netzachDirector.play(sederSequence, zmanStart);
		return this.state();
	}

	/** @returns {object} Director-backed paused state with elapsed position preserved. */
	pause() {
		const netzachDirector = this.requireDirector();
		const zmanPaused = Number(netzachDirector.getElapsed?.() ?? 0);
		netzachDirector.stop();
		NLECommands.scrub(this.malchusStore, zmanPaused);
		return this.state();
	}

	/** @returns {object} Installed Director. */
	requireDirector() {
		if (this.keterRuntime.director?.play && this.keterRuntime.director?.stop) {
			return this.keterRuntime.director;
		}
		throw this.runtimeError('The live Animator Director is unavailable in this API context.');
	}

	/** @param {string} orMessage Runtime message. @returns {Error} Stable environment error. */
	runtimeError(orMessage) {
		const gevurahError = new Error(orMessage);
		gevurahError.code = 'environment_unavailable';
		return gevurahError;
	}

	/** @param {string} shemMitzvah Unknown command. @returns {Error} Stable routing error. */
	error(shemMitzvah) {
		const gevurahError = new Error(`Unrouted playback command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
