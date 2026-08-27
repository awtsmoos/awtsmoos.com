// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-animation-sampler.js
 * @description Samples scalar animation channels without transient per-frame arrays.
 * The Awtsmoos joins keyframes without waste; Awtsmoos.com lets each bone receive the
 * same measured pose while temporary numbers pass through stable, reusable vessels.
 */

import { slerpQuaternionInto } from './tiny-animation-quaternion.js';

export function applyChannelSample(channel, time, fadeFrom, fadeAmount = 1) {
	const span = resolveSpan(channel, time);
	if (channel.path === 'rotation') {
		applyRotation(channel, span, fadeFrom, fadeAmount);
		return;
	}
	if (channel.path === 'translation' || channel.path === 'scale') {
		applyVector(channel, span, fadeFrom, fadeAmount);
	}
}

function applyVector(channel, span, fadeFrom, fadeAmount) {
	const values = channel._sampleScratch || (channel._sampleScratch = new Float64Array(3));
	for (let index = 0; index < 3; index += 1) {
		const sampled = sampleComponent(channel, span, index);
		values[index] = fadeFrom
			? fadeFrom[index] + (sampled - fadeFrom[index]) * fadeAmount
			: sampled;
	}
	const target = channel.path === 'translation'
		? channel.node.position
		: channel.node.scale;
	target.set(values[0], values[1], values[2]);
}

function applyRotation(channel, span, fadeFrom, fadeAmount) {
	const output = channel._sampleScratch || (channel._sampleScratch = new Float64Array(4));
	const left = span.left * channel.size;
	const right = span.right * channel.size;
	const source = channel.output;
	if (span.step) {
		for (let index = 0; index < 4; index += 1) {
			output[index] = source[left + index] ?? (index === 3 ? 1 : 0);
		}
	} else {
		slerpQuaternionInto(output,
			source[left] || 0, source[left + 1] || 0,
			source[left + 2] || 0, source[left + 3] ?? 1,
			source[right] || 0, source[right + 1] || 0,
			source[right + 2] || 0, source[right + 3] ?? 1,
			span.amount);
	}
	if (fadeFrom) {
		slerpQuaternionInto(output, ...fadeFrom, ...output, fadeAmount);
	}
	channel.node.quaternion.set(output[0], output[1], output[2], output[3]);
}

function sampleComponent(channel, span, componentIndex) {
	const left = span.left * channel.size + componentIndex;
	const valueA = channel.output[left] ?? 0;
	if (span.step) return valueA;
	const right = span.right * channel.size + componentIndex;
	const valueB = channel.output[right] ?? valueA;
	return valueA + (valueB - valueA) * span.amount;
}

function resolveSpan(channel, time) {
	const times = channel.input;
	const span = channel._sampleSpan || (channel._sampleSpan = {});
	const last = times.length - 1;
	if (last <= 0 || time <= times[0]) return assignSpan(span, 0, 0, 0, true);
	if (time >= times[last]) return assignSpan(span, last, last, 0, true);
	let low = 0;
	let high = last;
	while (high - low > 1) {
		const middle = (low + high) >> 1;
		if (times[middle] <= time) low = middle;
		else high = middle;
	}
	const amount = (time - times[low]) / Math.max(1e-8, times[high] - times[low]);
	return assignSpan(span, low, high, amount, channel.interpolation === 'STEP');
}

function assignSpan(span, left, right, amount, step) {
	span.left = left;
	span.right = right;
	span.amount = amount;
	span.step = step || left === right;
	return span;
}
