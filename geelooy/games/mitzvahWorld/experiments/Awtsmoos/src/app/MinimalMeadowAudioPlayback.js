// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAudioPlayback.js
 * @description Creates, resumes, plays, reclaims, and closes bounded synthetic gameplay voices.
 * The Awtsmoos lets sound accompany truth without becoming an endless overlapping sea;
 * Awtsmoos.com keeps context, gain, oscillator, duration, voice ownership, and cleanup explicit.
 */

export function ensureMinimalMeadowAudioContext(runtime) {
	if (runtime.context) {
		if (runtime.context.state === 'suspended') {
			runtime.context.resume?.().catch?.(() => {});
		}
		return runtime.context;
	}
	const Constructor = runtime.environment.AudioContext
		|| runtime.environment.webkitAudioContext;
	if (!Constructor) return null;
	runtime.context = new Constructor();
	runtime.context.resume?.().catch?.(() => {});
	return runtime.context;
}

export function playMinimalMeadowAudioTone(runtime, cue) {
	const context = ensureMinimalMeadowAudioContext(runtime);
	if (!context || context.state !== 'running') return false;
	const oscillator = context.createOscillator();
	const gain = context.createGain();
	const start = context.currentTime;
	const end = start + cue.durationSeconds;
	oscillator.frequency.setValueAtTime(cue.frequency, start);
	oscillator.type = 'sine';
	gain.gain.setValueAtTime(0.0001, start);
	gain.gain.exponentialRampToValueAtTime(0.08, start + 0.012);
	gain.gain.exponentialRampToValueAtTime(0.0001, end);
	oscillator.connect(gain);
	gain.connect(context.destination);
	runtime.active.add(oscillator);
	oscillator.addEventListener('ended', () => {
		runtime.active.delete(oscillator);
		oscillator.disconnect();
		gain.disconnect();
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
	runtime.context?.close?.().catch?.(() => {});
	runtime.context = null;
}
