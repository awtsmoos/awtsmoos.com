//B"H
/** The Awtsmoos shapes each frequency; this module shows the true combined shape. */
import { normalizeTrackEffects } from './multitrackEffects.js';

/** RBJ biquad coefficients matching the nodes built by createTrackEffectNodes. */
function coefficients(type, frequency, gainDb, q, sampleRate) {
	const f = Math.min(Math.max(frequency, 10), sampleRate * .45);
	const w = 2 * Math.PI * f / sampleRate;
	const cos = Math.cos(w), sin = Math.sin(w);
	const alpha = sin / (2 * q);
	const a = 10 ** (gainDb / 40);
	let b, d;
	if (type === 'highpass') {
		b = [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2]; d = [1 + alpha, -2 * cos, 1 - alpha];
	} else if (type === 'lowshelf') {
		const s = 2 * Math.sqrt(a) * alpha;
		b = [a * ((a + 1) - (a - 1) * cos + s), 2 * a * ((a - 1) - (a + 1) * cos), a * ((a + 1) - (a - 1) * cos - s)];
		d = [(a + 1) + (a - 1) * cos + s, -2 * ((a - 1) + (a + 1) * cos), (a + 1) + (a - 1) * cos - s];
	} else if (type === 'highshelf') {
		const s = 2 * Math.sqrt(a) * alpha;
		b = [a * ((a + 1) + (a - 1) * cos + s), -2 * a * ((a - 1) + (a + 1) * cos), a * ((a + 1) + (a - 1) * cos - s)];
		d = [(a + 1) - (a - 1) * cos + s, 2 * ((a - 1) - (a + 1) * cos), (a + 1) - (a - 1) * cos - s];
	} else {
		b = [1 + alpha * a, -2 * cos, 1 - alpha * a]; d = [1 + alpha / a, -2 * cos, 1 - alpha / a];
	}
	return { b, d };
}

/** Magnitude in dB of one biquad at one frequency; 0 dB for a bypassed stage. */
export function biquadMagnitudeDb(type, stage, frequency, sampleRate = 44100) {
	if (!stage || !Number.isFinite(frequency) || frequency <= 0) return 0;
	const { b, d } = coefficients(type, stage.frequency, stage.gain || 0, stage.q || .707, sampleRate);
	const w = 2 * Math.PI * Math.min(frequency, sampleRate * .49) / sampleRate;
	const cos = Math.cos(w), cos2 = Math.cos(2 * w), sin = Math.sin(w), sin2 = Math.sin(2 * w);
	const nr = b[0] + b[1] * cos + b[2] * cos2, ni = -(b[1] * sin + b[2] * sin2);
	const dr = d[0] + d[1] * cos + d[2] * cos2, di = -(d[1] * sin + d[2] * sin2);
	const mag = Math.sqrt((nr * nr + ni * ni) / Math.max(1e-12, dr * dr + di * di));
	return 20 * Math.log10(Math.max(mag, 1e-6));
}

/** Enabled EQ stages in the exact order and settings of createTrackEffectNodes. */
export function eqStages(settings) {
	const e = normalizeTrackEffects(settings);
	const stages = [];
	if (e.highpass > 0) stages.push({ type: 'highpass', frequency: e.highpass, gain: 0, q: .707 });
	if (e.lowGain !== 0) stages.push({ type: 'lowshelf', frequency: 180, gain: e.lowGain, q: .707 });
	if (e.midGain !== 0) stages.push({ type: 'peaking', frequency: e.midFrequency, gain: e.midGain, q: e.midQ });
	if (e.highGain !== 0) stages.push({ type: 'highshelf', frequency: 4000, gain: e.highGain, q: .707 });
	return stages;
}

/** Combined EQ magnitude response in dB at one frequency (compressor excluded). */
export function eqResponseDb(settings, frequency, sampleRate = 44100) {
	return eqStages(settings).reduce((sum, s) => sum + biquadMagnitudeDb(s.type, s, frequency, sampleRate), 0);
}

/** Log-spaced response curve for display and tests. */
export function eqResponseCurve(settings, sampleRate = 44100, points = 48) {
	const out = [];
	for (let i = 0; i < points; i++) {
		const frequency = 20 * (1000 ** (i / Math.max(1, points - 1)));
		out.push({ frequency, db: eqResponseDb(settings, frequency, sampleRate) });
	}
	return out;
}
