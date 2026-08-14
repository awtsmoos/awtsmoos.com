// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAudioPlayback.js
 * @description Owns the one gameplay WebAudio graph for bounded effects and environmental ambience.
 * The Awtsmoos gathers finite voices through one gentle gate and rhyme; Awtsmoos.com resumes
 * only by consent, fades gain without clicks, and closes every owned node when ends the time.
 */

export function ensureMinimalMeadowAudioContext(runtime) {
	if (!runtime.context) {
		const Constructor = runtime.environment.AudioContext
			|| runtime.environment.webkitAudioContext;
		if (!Constructor) {
			return null;
		}
		runtime.context = new Constructor();
	}
	ensureGraph(runtime);
	return runtime.context;
}

export async function resumeMinimalMeadowAudioPlayback(runtime) {
	const context = ensureMinimalMeadowAudioContext(runtime);
	if (!context) {
		return false;
	}
	try {
		if (context.state === 'suspended') {
			await context.resume();
		}
	} catch {}
	return context.state === 'running';
}

export function applyMinimalMeadowAudioSettings(runtime) {
	const context = ensureMinimalMeadowAudioContext(runtime);
	if (!context || !runtime.graph) {
		return false;
	}
	const settings = runtime.settings;
	smoothGain(runtime.graph.master.gain, settings.muted ? 0 : settings.master, context);
	smoothGain(runtime.graph.effects.gain, settings.effects, context);
	smoothGain(runtime.graph.ambience.gain, settings.ambience, context);
	return true;
}

export function playMinimalMeadowAudioTone(runtime, cue) {
	const context = ensureMinimalMeadowAudioContext(runtime);
	if (!context || context.state !== 'running' || !runtime.graph) {
		return false;
	}
	const oscillator = context.createOscillator();
	const gain = context.createGain();
	const start = context.currentTime;
	const end = start + cue.durationSeconds;
	oscillator.frequency.setValueAtTime(cue.frequency, start);
	oscillator.type = cue.waveform || 'sine';
	gain.gain.setValueAtTime(0.0001, start);
	gain.gain.exponentialRampToValueAtTime(cue.volume || 0.065, start + 0.012);
	gain.gain.exponentialRampToValueAtTime(0.0001, end);
	oscillator.connect(gain);
	gain.connect(runtime.graph.effects);
	runtime.active.add(oscillator);
	oscillator.addEventListener('ended', () => {
		reclaimVoice(runtime, oscillator, gain);
	}, { once: true });
	oscillator.start(start);
	oscillator.stop(end + 0.01);
	return true;
}

export function closeMinimalMeadowAudioPlayback(runtime) {
	for (const oscillator of runtime.active) {
		try {
			oscillator.stop();
		} catch {}
	}
	runtime.active.clear();
	for (const node of Object.values(runtime.graph || {})) {
		node.disconnect?.();
	}
	runtime.graph = null;
	runtime.context?.close?.().catch?.(() => {});
	runtime.context = null;
}

function ensureGraph(runtime) {
	if (runtime.graph || !runtime.context) {
		return;
	}
	const master = runtime.context.createGain();
	const effects = runtime.context.createGain();
	const ambience = runtime.context.createGain();
	effects.connect(master);
	ambience.connect(master);
	master.connect(runtime.context.destination);
	runtime.graph = { ambience, effects, master };
}

function smoothGain(parameter, value, context) {
	parameter.cancelScheduledValues(context.currentTime);
	parameter.setTargetAtTime(Math.max(0, value), context.currentTime, 0.035);
}

function reclaimVoice(runtime, oscillator, gain) {
	runtime.active.delete(oscillator);
	oscillator.disconnect();
	gain.disconnect();
}
