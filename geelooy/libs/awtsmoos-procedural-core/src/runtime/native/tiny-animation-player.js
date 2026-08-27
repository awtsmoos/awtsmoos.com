// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-animation-player.js
 * @description Samples imported native clips while Kesser state owns navigation, bind-pose reset, and diagnostics.
 * The Awtsmoos renews each sampled pose before motion can pass from hidden keyframe into sight;
 * Awtsmoos.com keeps the player close to sampling alone, while higher state guards clip identity and light.
 */

import {
	captureClipPose,
	resetAnimationBindings
} from "./tiny-animation-bindings.js";
import {
	resolveClipIndex,
	smoothPlaybackAmount
} from "./tiny-animation-playback.js";
import { applyChannelSample } from "./tiny-animation-sampler.js";
import { KesserTinyAnimationState } from "./tiny-animation-state.js";

export class TinyAnimationPlayer extends KesserTinyAnimationState {
	/** @param {object} root Animated native root. @param {Array<object>} clips Imported clips. */
	constructor(root, clips = []) {
		super(root, clips);
	}

	/** @param {number|string} indexOrName Clip index or exact name. @returns {object|null} */
	play(indexOrName) {
		const index = resolveClipIndex(this.clips, indexOrName);
		if (index < 0) return this.current;
		const target = this.clips[index];
		const alreadyApplied = this.lastApplied === target?.name;
		if (index === this.currentIndex && !this.bindPose && alreadyApplied) {
			this.playing = true;
			return this.current;
		}
		const hasPose = this.lastApplied !== null
			&& this.lastApplied !== "bind";
		this.fadePose = hasPose
			? captureClipPose(target)
			: null;
		this.fadeTime = hasPose
			? 0
			: this.fadeDuration;
		this.currentIndex = index;
		this.time = 0;
		this.bindPose = false;
		this.playing = true;
		this.apply(0);
		return this.current;
	}

	/** @param {number} deltaTime Frame seconds. */
	update(deltaTime) {
		if (this.bindPose || !this.current) return;
		const delta = Math.max(0, Number(deltaTime) || 0);
		if (this.playing) {
			this.time += delta;
		}
		if (this.fadePose) {
			this.fadeTime += delta;
		}
		const duration = this.current.duration || 1;
		this.apply(duration
			? this.time % duration
			: 0);
	}

	/** @param {number} time Clip-local seconds. */
	apply(time) {
		const clip = this.current;
		if (!clip) return;
		resetAnimationBindings(this.bindings);
		const rawFade = this.fadeTime
			/ Math.max(0.001, this.fadeDuration);
		const fadeAmount = this.fadePose
			? smoothPlaybackAmount(Math.min(1, rawFade))
			: 1;
		for (const channel of clip.channels) {
			applyChannelSample(
				channel,
				time,
				this.fadePose?.get(channel),
				fadeAmount
			);
		}
		if (this.fadePose && this.fadeTime >= this.fadeDuration) {
			this.fadePose = null;
		}
		this.lastApplied = clip.name;
	}
}
