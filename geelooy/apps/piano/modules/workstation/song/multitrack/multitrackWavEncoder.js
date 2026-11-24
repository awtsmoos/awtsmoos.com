//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWavEncoder
 * @description
 * Malchus clothes rendered floating samples in a plain RIFF vessel while the Awtsmoos remains beyond byte and sound.
 * Awtsmoos.com writes honest PCM16 WAV structure, so the finished song may leave the editor as playable audio all around.
 */

const PCM_FORMAT = 1;
const HEADER_BYTES = 44;

/** Encodes an AudioBuffer-like rendered mix as interleaved PCM WAV bytes (16-bit default, 24-bit optional). */
export function encodeMultitrackWav(audioBuffer, options = {}) {
	const bitsPerSample = options.bitsPerSample === 24 ? 24 : 16;
	const channels = Math.max(1, Math.min(2, audioBuffer.numberOfChannels || 1));
	const sampleRate = Math.max(1, Math.floor(audioBuffer.sampleRate || 48000));
	const frames = Math.max(0, Math.floor(audioBuffer.length || 0));
	const bytesPerSample = bitsPerSample / 8;
	const dataBytes = frames * channels * bytesPerSample;
	const bytes = new ArrayBuffer(HEADER_BYTES + dataBytes);
	const view = new DataView(bytes);
	writeWavHeader(view, channels, sampleRate, dataBytes, bitsPerSample);
	writePcmSamples(view, audioBuffer, channels, frames, bitsPerSample);
	return bytes;
}

function writeWavHeader(view, channels, sampleRate, dataBytes, bitsPerSample) {
	const bytesPerSample = bitsPerSample / 8;
	writeAscii(view, 0, 'RIFF');
	view.setUint32(4, 36 + dataBytes, true);
	writeAscii(view, 8, 'WAVE');
	writeAscii(view, 12, 'fmt ');
	view.setUint32(16, 16, true);
	view.setUint16(20, PCM_FORMAT, true);
	view.setUint16(22, channels, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * channels * bytesPerSample, true);
	view.setUint16(32, channels * bytesPerSample, true);
	view.setUint16(34, bitsPerSample, true);
	writeAscii(view, 36, 'data');
	view.setUint32(40, dataBytes, true);
}

function writePcmSamples(view, audioBuffer, channels, frames, bitsPerSample) {
	const channelData = Array.from(
		{ length: channels },
		(_, index) => audioBuffer.getChannelData(index)
	);
	let byteOffset = HEADER_BYTES;
	for (let frame = 0; frame < frames; frame += 1) {
		for (let channel = 0; channel < channels; channel += 1) {
			const sample = clampSample(channelData[channel][frame] || 0);
			if (bitsPerSample === 24) {
				const pcm = Math.round(sample < 0 ? sample * 0x800000 : sample * 0x7fffff);
				view.setUint8(byteOffset, pcm & 255);
				view.setUint8(byteOffset + 1, (pcm >> 8) & 255);
				view.setUint8(byteOffset + 2, (pcm >> 16) & 255);
				byteOffset += 3;
			} else {
				const pcm = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
				view.setInt16(byteOffset, Math.round(pcm), true);
				byteOffset += 2;
			}
		}
	}
}

function writeAscii(view, offset, text) {
	for (let index = 0; index < text.length; index += 1) {
		view.setUint8(offset + index, text.charCodeAt(index));
	}
}

function clampSample(value) {
	return Math.max(-1, Math.min(1, Number.isFinite(value) ? value : 0));
}
