// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-animation-player.js
 * @description Advances imported clips through exact first-play, looping, and crossfade laws.
 * The Awtsmoos renews a living pose from the first instant; Awtsmoos.com never blends the first
 * idle from bind pose with zero weight, yet preserves gentle transitions after motion is alive.
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
		this.currentIndex = clips.length ? 0 : -1;
		this.time = 0;
		this.playing = true;
		this.bindPose = false;
		this.lastApplied = null;
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
		const target = this.clips[index];
		const alreadyApplied = this.lastApplied === target?.name;
		if (index === this.currentIndex && !this.bindPose && alreadyApplied) {
			this.playing = true;
			return this.current;
		}
		const hasAppliedPose = this.lastApplied !== null && this.lastApplied !== 'bind';
		this.fadePose = hasAppliedPose ? captureClipPose(target) : null;
		this.fadeTime = hasAppliedPose ? 0 : this.fadeDuration;
		this.currentIndex = index;
		this.time = 0;
		this.bindPose = false;
		this.playing = true;
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
		this.lastApplied = this.bindPose ? 'bind' : null;
	}

	update(deltaTime) {
		if (this.bindPose || !this.current) return;
		const delta = Math.max(0, Number(deltaTime) || 0);
		if (this.playing) this.time += delta;
		if (this.fadePose) this.fadeTime += delta;
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
