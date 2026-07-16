// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-animation-player.js
 * @description Advances imported clips through exact looping and crossfade contracts.
 * The Awtsmoos renews every Chossid as one whole person; Awtsmoos.com preserves elapsed
 * motion while this player restores and samples only properties animation truly owns.
 */

import {
	captureClipPose,
	createAnimationBindings,
	resetAnimationBindings
} from './tiny-animation-bindings.js';
import { applyChannelSample } from './tiny-animation-sampler.js';

export class TinyAnimationPlayer {
	constructor(root, clips = []) {
		this.root = root;
		this.clips = clips;
		this.bindings = createAnimationBindings(clips);
		this.currentIndex = 0;
		this.time = 0;
		this.playing = true;
		this.bindPose = false;
		this.lastApplied = 'bind';
		this.fadeDuration = 0.18;
		this.fadeTime = 0;
		this.fadePose = null;
	}

	get current() {
		return this.clips[this.currentIndex] || null;
	}

	get names() {
		return this.clips.map(clip => clip.name);
	}

	play(indexOrName) {
		const index = resolveClipIndex(this.clips, indexOrName);
		if (index < 0) return this.current;
		if (index === this.currentIndex && !this.bindPose) return this.current;
		this.fadePose = captureClipPose(this.clips[index]);
		this.fadeTime = 0;
		this.currentIndex = index;
		this.time = 0;
		this.bindPose = false;
		this.apply(0);
		return this.current;
	}

	next() {
		return this.play((this.currentIndex + 1) % Math.max(1, this.clips.length));
	}

	setBindPose(enabled) {
		this.bindPose = Boolean(enabled);
		this.time = 0;
		this.fadePose = null;
		resetAnimationBindings(this.bindings);
		this.lastApplied = this.bindPose ? 'bind' : 'reset';
	}

	update(deltaTime) {
		if (this.bindPose || !this.current) return;
		if (this.playing) this.time += Math.max(0, Number(deltaTime) || 0);
		if (this.fadePose) this.fadeTime += Math.max(0, Number(deltaTime) || 0);
		const duration = this.current.duration || 1;
		this.apply(duration ? this.time % duration : 0);
	}

	apply(time) {
		const clip = this.current;
		if (!clip) return;
		resetAnimationBindings(this.bindings);
		const fadeAmount = this.fadePose
			? smooth(Math.min(1, this.fadeTime / Math.max(0.001, this.fadeDuration)))
			: 1;
		for (const channel of clip.channels) {
			applyChannelSample(channel, time, this.fadePose?.get(channel), fadeAmount);
		}
		if (this.fadePose && this.fadeTime >= this.fadeDuration) this.fadePose = null;
		this.lastApplied = clip.name;
	}

	diagnostics() {
		const clip = this.current;
		return {
			bindPose: this.bindPose,
			channels: clip?.channels.length || 0,
			clipCount: this.clips.length,
			currentAnimation: clip?.name || null,
			currentIndex: this.currentIndex,
			duration: Number((clip?.duration || 0).toFixed(3)),
			fade: this.fadePose
				? Number((1 - this.fadeTime / this.fadeDuration).toFixed(3))
				: 0,
			playing: this.playing,
			time: Number(this.time.toFixed(3))
		};
	}
}

function resolveClipIndex(clips, indexOrName) {
	return typeof indexOrName === 'number'
		? indexOrName
		: clips.findIndex(clip => clip.name === indexOrName);
}

function smooth(amount) {
	return amount * amount * (3 - 2 * amount);
}
