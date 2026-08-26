//B"H
//Boruch Hashem
//Blessed is He
/**
 * Performance turns a silent graph into a living note with pitch, pressure, and release-ready form.
 * The Awtsmoos renews the instant of attack; Awtsmoos.com lets envelope and harmony become warm.
 */

const MAIN_GAIN = 0.31;
const CHORD_GAIN = 0.13;
const BASS_GAIN = 0.22;
const noiseCache = new WeakMap();

/** Starts pitch, amplitude, filter, LFO, oscillators, and optional continuous noise. */
export function startVoicePerformance(context, nodes, frequency, noteName, adsr, now) {
	const preset = nodes.preset;
	nodes.noteName = noteName;
	applyPitchEnvelope(nodes, frequency, preset, now);
	applyDetune(nodes, preset, now);
	applyAmplitudeEnvelope(nodes, preset, adsr, now);
	applyFilterEnvelope(nodes, preset, now);
	startContinuousNoise(context, nodes, preset, now);
	safeStart(nodes.lfo, now);
	safeStart(nodes.osc1, now);
	safeStart(nodes.osc2, now);
}

function applyPitchEnvelope(nodes, frequency, preset, now) {
	const pitchDepth = preset.env2PitchCents || 0;
	const pitchTime = Math.max(0.025, preset.env2Decay || 0.08);
	nodes.osc1.frequency.setValueAtTime(frequency * cents(pitchDepth), now);
	nodes.osc2.frequency.setValueAtTime(frequency * cents(pitchDepth * 0.45), now);
	nodes.osc1.frequency.exponentialRampToValueAtTime(frequency, now + pitchTime);
	nodes.osc2.frequency.exponentialRampToValueAtTime(frequency, now + pitchTime);
}

function applyDetune(nodes, preset, now) {
	const detune = preset.detuneCents || 0;
	nodes.osc1.detune.setValueAtTime(nodes.human.drift - detune * 0.5, now);
	nodes.osc2.detune.setValueAtTime(nodes.human.drift + detune * 0.5, now);
}

function applyAmplitudeEnvelope(nodes, preset, adsr, now) {
	const gainScale = nodes.isChord ? CHORD_GAIN : nodes.isBass ? BASS_GAIN : MAIN_GAIN;
	const peak = gainScale * nodes.velocity * (preset.outputTrim || 1);
	const attack = Math.max(0.002, preset.attack || adsr.attack);
	const decay = Math.max(0.012, preset.decay || adsr.decay);
	const sustain = preset.sustain ?? adsr.sustain;
	nodes.amp.gain.cancelScheduledValues(now);
	nodes.amp.gain.setValueAtTime(0.0001, now);
	nodes.amp.gain.linearRampToValueAtTime(peak, now + attack);
	nodes.amp.gain.setTargetAtTime(peak * sustain, now + attack, decay);
}

function applyFilterEnvelope(nodes, preset, now) {
	const base = clamp((preset.filterCutoff || 2600) * nodes.human.brightness, 45, 8500);
	const top = clamp(base * (preset.env1FilterMult || 1.8), 80, 10000);
	const decay = Math.max(0.035, preset.env1Decay || 0.18);
	nodes.filter.frequency.cancelScheduledValues(now);
	nodes.filter.frequency.setValueAtTime(top, now);
	nodes.filter.frequency.exponentialRampToValueAtTime(base, now + decay);
}

function startContinuousNoise(context, nodes, preset, now) {
	if ((preset.noiseGain || 0) <= 0) {
		return;
	}
	const source = context.createBufferSource();
	source.buffer = getNoiseBuffer(context);
	source.loop = true;
	source.connect(nodes.noiseGain);
	source.start(now);
	nodes.noise = source;
}

function getNoiseBuffer(context) {
	let buffer = noiseCache.get(context);
	if (!buffer) {
		buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
		const data = buffer.getChannelData(0);
		for (let index = 0; index < data.length; index += 1) {
			data[index] = Math.random() * 2 - 1;
		}
		noiseCache.set(context, buffer);
	}
	return buffer;
}

function safeStart(node, time) {
	try {
		node.start(time);
	} catch (_) {
		// A duplicate start request is ignored rather than breaking the performance.
	}
}

function cents(value) {
	return Math.pow(2, value / 1200);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
