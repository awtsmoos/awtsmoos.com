// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicInteractionField
 * @description
 * Hover, focus, sound, choice, and provenance are distinct vessels. The
 * Awtsmoos blends them without erasing their names, while Awtsmoos.com exposes
 * one restrained shader anchor so text always remains sovereign.
 */

const MAXIMUM_CHANNELS = 8;
const DEFAULT_COLOR = Object.freeze([0.21, 0.91, 1]);

/**
 * Stores bounded independently expiring interaction channels.
 */
export class InteractionField {
	constructor() {
		this.channels = new Map();
		this.current = [0.5, 0.5, 0, 0];
		this.color = [...DEFAULT_COLOR];
		this.targetColor = [...DEFAULT_COLOR];
	}

	/**
	 * Preserves the original one-anchor API through a named legacy channel.
	 * @param {{x:number,y:number,strength?:number,color?:number[]}|null} anchor Anchor.
	 */
	set(anchor) {
		if (anchor) {
			this.setChannel("legacy", anchor);
		} else {
			this.clearChannel("legacy");
		}
	}

	/**
	 * Creates or refreshes one semantic resonance channel.
	 * @param {string} name Stable channel name.
	 * @param {{x:number,y:number,strength?:number,color?:number[]}} anchor Anchor.
	 * @param {{priority?:number,duration?:number}} options Channel policy.
	 */
	setChannel(name, anchor, options = {}) {
		if (!name || !anchor) {
			return;
		}
		if (!this.channels.has(name) && this.channels.size >= MAXIMUM_CHANNELS) {
			this.channels.delete(this.channels.keys().next().value);
		}
		const duration = Math.max(0, Number(options.duration) || 0);
		this.channels.set(name, {
			x: clamp(anchor.x),
			y: clamp(anchor.y),
			strength: clamp(anchor.strength ?? 0.55),
			color: normalizeColor(anchor.color),
			priority: Math.max(0.1, Number(options.priority) || 1),
			expiresAt: duration ? performance.now() + duration : 0
		});
	}

	/**
	 * Removes one named resonance channel.
	 * @param {string} name Stable channel name.
	 */
	clearChannel(name) {
		this.channels.delete(name);
	}

	/**
	 * Blends active channels and advances shader-facing smooth state.
	 * @param {number} easing Smoothing factor.
	 * @param {number} now Current time.
	 * @returns {number[]} Normalized x, y, strength, and ambient energy.
	 */
	update(easing = 0.08, now = performance.now()) {
		const target = this.blend(now);
		for (let index = 0; index < 4; index += 1) {
			this.current[index] += (target[index] - this.current[index]) * easing;
		}
		for (let index = 0; index < 3; index += 1) {
			this.color[index] += (this.targetColor[index] - this.color[index]) * easing;
		}
		return this.current;
	}

	blend(now) {
		let weight = 0;
		let x = 0;
		let y = 0;
		let strength = 0;
		const color = [0, 0, 0];
		for (const [name, channel] of this.channels) {
			if (channel.expiresAt && channel.expiresAt <= now) {
				this.channels.delete(name);
				continue;
			}
			const channelWeight = channel.strength * channel.priority;
			weight += channelWeight;
			x += channel.x * channelWeight;
			y += channel.y * channelWeight;
			strength = Math.max(strength, channel.strength);
			color.forEach((_, index) => color[index] += channel.color[index] * channelWeight);
		}
		this.targetColor = weight ? color.map(value => value / weight) : [...DEFAULT_COLOR];
		return weight ? [x / weight, y / weight, strength, clamp(weight / 2)] : [0.5, 0.5, 0, 0];
	}
}

function clamp(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

function normalizeColor(color) {
	return Array.isArray(color) && color.length >= 3 ? color.slice(0, 3).map(clamp) : [...DEFAULT_COLOR];
}
