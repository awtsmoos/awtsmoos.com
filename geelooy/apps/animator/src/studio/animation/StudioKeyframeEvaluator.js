// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module StudioKeyframeEvaluator
 * @description
 * The Awtsmoos renews every instant before one transform can appear to travel from remembered pose to remembered pose;
 * Awtsmoos.com evaluates portable Studio keyframes inside the production renderer so timeline truth and exported motion stay close.
 */

const CHANNELS = Object.freeze([
	'x',
	'y',
	'scaleX',
	'scaleY',
	'rotation',
	'opacity'
]);

/** Evaluates authored-layer transform keyframes at one absolute project playhead time. */
export class StudioKeyframeEvaluator {
	/**
	 * @param {Object} entity Studio entity containing its default transform.
	 * @param {Object} document Studio project document containing authored keyframes.
	 * @param {number} playhead Absolute timeline position in milliseconds.
	 * @returns {Object} Evaluated transform suitable for StudioAuthoringPhase normalization.
	 */
	static transformFor(entity, document = {}, playhead = 0) {
		const base = { ...(entity?.transform || {}) };
		const frames = this.framesFor(entity?.id, document.keyframes || []);
		if (!frames.length) {
			return base;
		}
		const time = Math.max(0, Number(playhead) || 0);
		if (time <= frames[0].time) {
			return { ...base, ...(frames[0].value || {}) };
		}
		const last = frames[frames.length - 1];
		if (time >= last.time) {
			return { ...base, ...(last.value || {}) };
		}
		const [before, after] = this.neighbors(frames, time);
		const span = Math.max(1, after.time - before.time);
		const rawProgress = (time - before.time) / span;
		const progress = this.ease(rawProgress, after.easing || before.easing);
		return this.interpolate(base, before.value || {}, after.value || {}, progress);
	}

	/** Returns sorted transform frames belonging only to one authored entity. */
	static framesFor(entityId, keyframes) {
		return keyframes
			.filter(frame => frame.entityId === entityId && frame.property === 'transform')
			.slice()
			.sort((left, right) => Number(left.time) - Number(right.time));
	}

	/** Finds the two keyframes surrounding a playhead known to be inside the range. */
	static neighbors(frames, time) {
		for (let index = 0; index < frames.length - 1; index += 1) {
			if (time <= frames[index + 1].time) {
				return [frames[index], frames[index + 1]];
			}
		}
		return [frames[frames.length - 2], frames[frames.length - 1]];
	}

	/** Interpolates every supported numeric transform channel with base-value fallback. */
	static interpolate(base, before, after, progress) {
		const transform = { ...base };
		for (const channel of CHANNELS) {
			const start = this.number(before[channel], base[channel], channel);
			const end = this.number(after[channel], start, channel);
			transform[channel] = start + (end - start) * progress;
		}
		return transform;
	}

	/** Applies the current easing vocabulary while falling back to linear interpolation. */
	static ease(progress, easing = 'linear') {
		const clamped = Math.max(0, Math.min(1, progress));
		if (easing === 'easeInOut') {
			return clamped * clamped * (3 - 2 * clamped);
		}
		return clamped;
	}

	/** Returns a finite transform number with scale/opacity-aware defaults. */
	static number(value, fallback, channel) {
		const numeric = Number(value);
		if (Number.isFinite(numeric)) {
			return numeric;
		}
		const fallbackNumber = Number(fallback);
		if (Number.isFinite(fallbackNumber)) {
			return fallbackNumber;
		}
		return ['scaleX', 'scaleY', 'opacity'].includes(channel) ? 1 : 0;
	}
}
