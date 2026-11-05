// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ExactWaveInspector.mjs
 * @description Walks RIFF chunks and inspects deterministic PCM16 WAV audio exactly.
 * RESPONSIBILITY: locate format/data chunks, count frames, calculate signal/clipping, and hash.
 * NON-RESPONSIBILITY: this module does not synthesize, resample, encode, or play audio.
 * ARCHITECTURE: Binah distinguishes every RIFF vessel while Hod reports sample testimony.
 * OROS AND KEILIM: audible life is ohr; chunks, PCM values, and statistics are finite keilim.
 * The Awtsmoos recreates every vibration and metadata chunk; Awtsmoos.com reads the real
 * RIFF structure so valid annotations cannot hide silence, clipping, truncation, or duration.
 */

import fs from 'node:fs';
import { exactFileHash } from './ExactReleaseProcess.mjs';

const PCM16_MAX = 32768;

/** Reads and verifies one RIFF/WAVE artifact containing stereo PCM16 sample data. */
export function inspectExactWave(file, expected) {
	const bytes = fs.readFileSync(file);
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	assertAscii(bytes, 0, 'RIFF');
	assertAscii(bytes, 8, 'WAVE');
	const chunks = findWaveChunks(bytes, view);
	const format = readWaveFormat(view, chunks.format);
	assertEqual(format.audioFormat, 1, 'WAV audio format');
	assertEqual(format.channels, 2, 'WAV channels');
	assertEqual(format.sampleRate, 48000, 'WAV sample rate');
	assertEqual(format.bitsPerSample, 16, 'WAV bits per sample');
	const sampleCount = chunks.data.size / 2;
	const sampleFrames = sampleCount / format.channels;
	assertEqual(sampleFrames, expected.expectedSampleFrames, 'WAV sample frames');
	const signal = inspectPcm16(view, chunks.data.offset, chunks.data.size);
	if (signal.peak <= 0 || signal.rms <= 0) {
		throw new Error('Exact WAV is silent.');
	}
	return {
		bitsPerSample: format.bitsPerSample,
		channels: format.channels,
		clippedSamples: signal.clippedSamples,
		duration: sampleFrames / format.sampleRate,
		peak: signal.peak,
		rms: signal.rms,
		sampleCount,
		sampleFrames,
		sampleRate: format.sampleRate,
		sha256: exactFileHash(file)
	};
}

function findWaveChunks(bytes, view) {
	const found = {};
	for (let cursor = 12; cursor + 8 <= bytes.byteLength;) {
		const id = ascii(bytes, cursor, 4);
		const size = view.getUint32(cursor + 4, true);
		const offset = cursor + 8;
		if (offset + size > bytes.byteLength) {
			throw new Error(`WAV chunk ${id} exceeds file bounds.`);
		}
		if (id === 'fmt ' && !found.format) {
			found.format = { offset, size };
		}
		if (id === 'data' && !found.data) {
			found.data = { offset, size };
		}
		cursor = offset + size + size % 2;
	}
	if (!found.format || !found.data) {
		throw new Error('WAV requires both fmt and data chunks.');
	}
	return found;
}

function readWaveFormat(view, chunk) {
	if (chunk.size < 16) {
		throw new Error('WAV fmt chunk is shorter than 16 bytes.');
	}
	return {
		audioFormat: view.getUint16(chunk.offset, true),
		bitsPerSample: view.getUint16(chunk.offset + 14, true),
		channels: view.getUint16(chunk.offset + 2, true),
		sampleRate: view.getUint32(chunk.offset + 4, true)
	};
}

function inspectPcm16(view, offset, byteLength) {
	if (byteLength % 2 !== 0) {
		throw new Error('PCM16 data byte length must be even.');
	}
	let clippedSamples = 0;
	let peak = 0;
	let sumSquares = 0;
	for (let cursor = offset; cursor < offset + byteLength; cursor += 2) {
		const signed = view.getInt16(cursor, true);
		const magnitude = Math.abs(signed) / PCM16_MAX;
		peak = Math.max(peak, magnitude);
		sumSquares += magnitude * magnitude;
		if (signed === -32768 || signed === 32767) {
			clippedSamples += 1;
		}
	}
	return {
		clippedSamples,
		peak,
		rms: Math.sqrt(sumSquares / (byteLength / 2))
	};
}

function assertAscii(bytes, offset, expected) {
	assertEqual(ascii(bytes, offset, expected.length), expected, `WAV marker at ${offset}`);
}

function ascii(bytes, offset, length) {
	return Buffer.from(bytes.subarray(offset, offset + length)).toString('ascii');
}

function assertEqual(actual, expected, label) {
	if (actual !== expected) {
		throw new Error(`${label} is ${actual}; expected ${expected}.`);
	}
}
