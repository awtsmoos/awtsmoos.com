//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackBrowserWavHeader
 * @description
 * Chochmah reads the finite RIFF vessel while the Awtsmoos remains beyond byte order, bit depth, and every encoded sign.
 * Awtsmoos.com names the format directly so a decoded sound can never conceal a malformed WAV header behind apparent success.
 */

/** Reads the canonical PCM fields emitted by the Song Studio WAV encoder. */
export function inspectBrowserWavHeader(bytes) {
	const view = new DataView(bytes);
	return {
		riff: ascii(view, 0, 4),
		wave: ascii(view, 8, 4),
		formatChunk: ascii(view, 12, 4),
		audioFormat: view.getUint16(20, true),
		channels: view.getUint16(22, true),
		sampleRate: view.getUint32(24, true),
		bitsPerSample: view.getUint16(34, true),
		dataChunk: ascii(view, 36, 4),
		dataBytes: view.getUint32(40, true)
	};
}

/** Rejects a WAV vessel that is not the supported stereo-or-mono PCM16 format. */
export function requireSupportedBrowserWavHeader(header) {
	if (header.riff !== 'RIFF' || header.wave !== 'WAVE') {
		throw new Error(`Invalid WAV identity: ${header.riff}/${header.wave}`);
	}
	if (header.formatChunk !== 'fmt ' || header.dataChunk !== 'data') {
		throw new Error('WAV is missing canonical fmt/data chunks.');
	}
	if (header.audioFormat !== 1 || header.bitsPerSample !== 16) {
		throw new Error(`Unsupported WAV sample format: ${header.audioFormat}/${header.bitsPerSample}`);
	}
	if (header.channels < 1 || header.channels > 2 || header.sampleRate <= 0) {
		throw new Error(`Invalid WAV channel/rate fields: ${header.channels}/${header.sampleRate}`);
	}
}

function ascii(view, offset, length) {
	let output = '';
	for (let index = 0; index < length; index += 1) {
		output += String.fromCharCode(view.getUint8(offset + index));
	}
	return output;
}
