// B"H
// Boruch Hashem
// Blessed is He

/**
 * A keyframe is a measured vessel for change. The Awtsmoos renews the value at
 * every instant; this engine evaluates numbers, vectors, and nested properties.
 */
export class KeyframeEngine {
	/** Interpolates two values through the requested easing law. */
	static interpolate(startValue, endValue, progress, easing = 'easeInOut') {
		const amount = this.ease(progress, easing);
		return this.blendValue(startValue, endValue, amount);
	}

	/** Evaluates one ordered channel at a production time. */
	static sample(channel = [], timeMs = 0) {
		const frames = [...channel].sort((left, right) => left.time - right.time);
		if (!frames.length) {
			return undefined;
		}
		if (timeMs <= frames[0].time) {
			return frames[0].value;
		}
		const last = frames.at(-1);
		if (timeMs >= last.time) {
			return last.value;
		}
		const rightIndex = frames.findIndex((frame) => frame.time >= timeMs);
		const left = frames[rightIndex - 1];
		const right = frames[rightIndex];
		const span = Math.max(1, right.time - left.time);
		const progress = (timeMs - left.time) / span;
		return this.interpolate(left.value, right.value, progress, right.easing);
	}

	/** Evaluates a named collection of arbitrary property channels. */
	static evaluate(channels = {}, timeMs = 0) {
		return Object.fromEntries(
			Object.entries(channels).map(([property, frames]) => {
				return [property, this.sample(frames, timeMs)];
			})
		);
	}

	/** Blends supported structured values without mutating either endpoint. */
	static blendValue(startValue, endValue, amount) {
		if (Number.isFinite(startValue) && Number.isFinite(endValue)) {
			return startValue + (endValue - startValue) * amount;
		}
		if (Array.isArray(startValue) && Array.isArray(endValue)) {
			return startValue.map((item, index) => {
				return this.blendValue(item, endValue[index] ?? item, amount);
			});
		}
		if (this.isObject(startValue) && this.isObject(endValue)) {
			const keys = new Set([...Object.keys(startValue), ...Object.keys(endValue)]);
			return Object.fromEntries([...keys].map((key) => {
				return [key, this.blendValue(startValue[key], endValue[key], amount)];
			}));
		}
		return amount < 1 ? startValue : endValue;
	}

	/** Resolves familiar cinematic easing names into a clamped progress. */
	static ease(progress, easing = 'easeInOut') {
		const value = Math.max(0, Math.min(1, Number(progress) || 0));
		if (easing === 'linear') {
			return value;
		}
		if (easing === 'easeIn') {
			return value * value;
		}
		if (easing === 'easeOut') {
			return 1 - (1 - value) ** 2;
		}
		return value < 0.5
			? 2 * value * value
			: 1 - ((-2 * value + 2) ** 2) / 2;
	}

	static isObject(value) {
		return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
	}
}
