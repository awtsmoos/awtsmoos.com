// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-animation-state.js
 * @description Holds native animation state, navigation, bind-pose reset, and diagnostics apart from sampling.
 * The Awtsmoos renews each motion while Kesser remembers which clip, pose, and moment may presently shine;
 * Awtsmoos.com lets navigation rest in one small vessel so lower sampling remains a separate measured line.
 */

import {
	createAnimationBindings,
	resetAnimationBindings
} from "./tiny-animation-bindings.js";
import { animationPlayerDiagnostics } from "./tiny-animation-diagnostics.js";

export class KesserTinyAnimationState {
	/** @param {object} root Animated native root. @param {Array<object>} clips Imported clips. */
	constructor(root, clips = []) {
		this.root = root;
		this.clips = clips;
		this.bindings = createAnimationBindings(clips);
		this.currentIndex = clips.length ? 0 : -1;
		this.time = 0;
		this.playing = true;
		this.bindPose = false;
		this.lastApplied = null;
		this.fadeDuration = 0.18;
		this.fadeTime = 0;
		this.fadePose = null;
	}

	/** @returns {object|null} Current clip. */
	get current() {
		return this.clips[this.currentIndex] || null;
	}

	/** @returns {Array<string>} Imported clip names. */
	get names() {
		return this.clips.map((clip) => clip.name);
	}

	/** @returns {object|null} Next clip after wrapping. */
	next() {
		return this.play(
			(this.currentIndex + 1) % Math.max(1, this.clips.length)
		);
	}

	/** @param {boolean} enabled Whether authored bind pose should replace animation. */
	setBindPose(enabled) {
		this.bindPose = Boolean(enabled);
		this.time = 0;
		this.fadePose = null;
		resetAnimationBindings(this.bindings);
		this.lastApplied = this.bindPose
			? "bind"
			: null;
	}

	/** @returns {object} Browser-readable playback diagnostics. */
	diagnostics() {
		return animationPlayerDiagnostics(this);
	}
}
