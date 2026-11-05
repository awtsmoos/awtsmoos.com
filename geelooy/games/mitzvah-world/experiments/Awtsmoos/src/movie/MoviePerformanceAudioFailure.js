// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceAudioFailure.js
 * @description Classifies microphone permission, capability, device, recorder, and decode failures.
 * The Awtsmoos hides no broken vessel behind false success; Awtsmoos.com gives every
 * denied voice, absent device, lost stream, failed recorder, and decode warning a truthful rhyme.
 */

export function classifyMoviePerformanceAudioFailure(error, phase = 'capture') {
	const message = String(error?.message || error || 'PERFORMANCE_AUDIO_FAILED');
	const normalized = message.toLowerCase();
	if (normalized.includes('notallowed')
		|| normalized.includes('permission')
		|| normalized.includes('denied')) {
		return failure('PERFORMANCE_AUDIO_PERMISSION_DENIED', 'permission', message, phase);
	}
	if (normalized.includes('notfound')
		|| normalized.includes('no device')
		|| normalized.includes('devicesnotfound')) {
		return failure('PERFORMANCE_AUDIO_DEVICE_UNAVAILABLE', 'no-device', message, phase);
	}
	if (normalized.includes('device_lost')
		|| normalized.includes('device lost')
		|| normalized.includes('track ended')) {
		return failure('PERFORMANCE_AUDIO_DEVICE_LOST', 'device-loss', message, phase);
	}
	if (normalized.includes('unavailable')
		|| normalized.includes('unsupported')
		|| normalized.includes('mediarecorder is not')) {
		return failure('PERFORMANCE_AUDIO_UNSUPPORTED', 'unsupported', message, phase);
	}
	if (normalized.includes('decode')) {
		return failure('PERFORMANCE_AUDIO_DECODE_FAILED', 'decode', message, phase);
	}
	return failure('PERFORMANCE_AUDIO_RECORDER_FAILED', 'recorder', message, phase);
}

export function emitMoviePerformanceAudioFailure(emit, error, phase) {
	const detail = classifyMoviePerformanceAudioFailure(error, phase);
	emit(`performance:audio-${detail.kind}-failure`, detail);
	emit('performance:error', {
		code: detail.code,
		message: detail.message,
		source: `audio:${phase}`
	});
	return detail;
}

function failure(code, kind, message, phase) {
	return Object.freeze({
		code,
		kind,
		message,
		phase
	});
}
