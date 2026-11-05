// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceAudioAsset.js
 * @description Converts optional microphone Blobs into reload-safe data, duration, and bounded waveform.
 * The Awtsmoos gives voice a finite digital vessel without making it required for bodily motion;
 * Awtsmoos.com keeps permission, latency, MIME, duration, waveform, and recovery evidence in rhyme.
 */

export async function prepareMoviePerformanceAudioAsset(
	audio,
	environment = globalThis
) {
	if (!audio?.blob?.size) {
		return null;
	}
	const dataUrl = await blobToDataUrl(audio.blob, environment);
	const decoded = await decodeWaveform(audio.blob, environment);
	return {
		dataUrl,
		duration: decoded.duration,
		latencyMs: Math.max(0, Number(audio.latencyMs) || 0),
		mimeType: audio.mimeType || audio.blob.type || 'audio/webm',
		size: audio.blob.size,
		waveform: decoded.waveform,
		warning: decoded.warning
	};
}

async function blobToDataUrl(blob, environment) {
	if (typeof environment.FileReader !== 'function') {
		const bytes = new Uint8Array(await blob.arrayBuffer());
		let binary = '';
		for (const byte of bytes) {
			binary += String.fromCharCode(byte);
		}
		return `data:${blob.type};base64,${environment.btoa(binary)}`;
	}
	return new Promise((resolve, reject) => {
		const reader = new environment.FileReader();
		reader.onerror = () => reject(
			new Error('PERFORMANCE_AUDIO_DATA_URL_FAILED')
		);
		reader.onload = () => resolve(String(reader.result));
		reader.readAsDataURL(blob);
	});
}

async function decodeWaveform(blob, environment) {
	const Context = environment.AudioContext
		|| environment.webkitAudioContext;
	if (!Context) {
		return fallback('AUDIO_DECODE_UNAVAILABLE');
	}
	const context = new Context();
	try {
		const buffer = await context.decodeAudioData(
			await blob.arrayBuffer()
		);
		return {
			duration: buffer.duration,
			waveform: sampleWaveform(buffer),
			warning: null
		};
	} catch (error) {
		return fallback(
			`AUDIO_DECODE_FAILED:${String(error?.message || error)}`
		);
	} finally {
		await context.close?.();
	}
}

function sampleWaveform(buffer) {
	const channel = buffer.getChannelData(0);
	const count = Math.min(512, Math.max(32, Math.ceil(buffer.duration * 40)));
	const size = Math.max(1, Math.floor(channel.length / count));
	return Array.from({ length: count }, (unused, index) => {
		let peak = 0;
		const start = index * size;
		const end = Math.min(channel.length, start + size);
		for (let cursor = start; cursor < end; cursor += 1) {
			peak = Math.max(peak, Math.abs(channel[cursor]));
		}
		return Number(peak.toFixed(4));
	});
}

function fallback(warning) {
	return {
		duration: 0,
		waveform: [],
		warning
	};
}
