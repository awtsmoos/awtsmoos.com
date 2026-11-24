//B"H
/**
 * True-peak limiting, honestly labeled: inter-sample peaks are estimated by
 * 4x Catmull-Rom oversampling (the same estimator as multitrackLoudness),
 * and a lookahead gain envelope keeps that estimate at or under the ceiling.
 * It is a careful estimator-based limiter, not a certified BS.1770 meter.
 */

/** One Catmull-Rom interpolated sample between b and c at fraction t. */
function cubic(a, b, c, d, t) {
	return .5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
}
/** Oversampled (4x) peak of one channel, linear scale. */
export function oversampledPeakOf(data) {
	let peak = 0;
	for (let i = 0; i < data.length; i++) {
		const a = data[i - 1] || 0, b = data[i] || 0, c = data[i + 1] || 0, d = data[i + 2] || 0;
		peak = Math.max(peak, Math.abs(b));
		for (const t of [.25, .5, .75]) peak = Math.max(peak, Math.abs(cubic(a, b, c, d, t)));
	}
	return peak;
}
export function measureTruePeakLinear(channels) {
	let peak = 0;
	for (const data of channels) peak = Math.max(peak, oversampledPeakOf(data));
	return peak;
}
const toDb = v => v > 0 ? 20 * Math.log10(v) : -Infinity;

/**
 * Limits channel arrays (copied, originals untouched). The gain envelope is
 * derived from the oversampled peak in a lookahead window, attacked instantly
 * within the window and released exponentially, then re-measured; a second
 * pass runs if the estimate still exceeds the ceiling.
 */
export function limitTruePeakChannels(channels, sampleRate = 44100, options = {}) {
	const ceilingDb = Number.isFinite(options.ceilingDb) ? Math.min(0, options.ceilingDb) : -1;
	const ceiling = 10 ** (ceilingDb / 20);
	const lookahead = Math.max(1, Math.round(sampleRate * (options.lookaheadMs ?? 5) / 1000));
	const releaseCoef = Math.exp(-1 / Math.max(1, sampleRate * (options.releaseMs ?? 100) / 1000));
	const out = channels.map(data => Float32Array.from(data));
	const before = measureTruePeakLinear(out);
	let maxReduction = 1;
	for (let pass = 0; pass < 2; pass++) {
		// Required gain per sample from the oversampled peak around it.
		const length = out[0]?.length || 0;
		const required = new Float32Array(length).fill(1);
		for (const data of out) {
			let windowPeak = 0;
			for (let i = 0; i < length; i++) {
				const a = data[i - 1] || 0, b = data[i] || 0, c = data[i + 1] || 0, d = data[i + 2] || 0;
				let local = Math.abs(b);
				for (const t of [.25, .5, .75]) local = Math.max(local, Math.abs(cubic(a, b, c, d, t)));
				windowPeak = Math.max(local, i >= lookahead ? 0 : windowPeak);
				if (local > 0) {
					const gain = Math.min(1, ceiling / local);
					for (let j = Math.max(0, i - lookahead); j <= i; j++) if (gain < required[j]) required[j] = gain;
				}
			}
		}
		// Release smoothing forward, then apply.
		let envelope = 1;
		for (let i = 0; i < length; i++) {
			envelope = required[i] < envelope ? required[i] : envelope + (required[i] - envelope) * (1 - releaseCoef);
			required[i] = envelope;
			if (envelope < maxReduction) maxReduction = envelope;
		}
		for (const data of out) for (let i = 0; i < length; i++) data[i] *= required[i];
		if (measureTruePeakLinear(out) <= ceiling * 1.001) break;
	}
	return {
		channels: out,
		beforeTruePeakDb: toDb(before),
		afterTruePeakDb: toDb(measureTruePeakLinear(out)),
		ceilingDb,
		maxGainReductionDb: maxReduction < 1 ? toDb(maxReduction) : 0
	};
}
/** Applies the limiter in place to a rendered buffer-like object; returns the report. */
export function applyTruePeakLimiter(buffer, options = {}) {
	const channels = [];
	for (let c = 0; c < buffer.numberOfChannels; c++) channels.push(buffer.getChannelData(c));
	const report = limitTruePeakChannels(channels, buffer.sampleRate || 44100, options);
	report.channels.forEach((data, c) => buffer.getChannelData(c).set(data));
	return report;
}
