//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWavEncode
 * The Awtsmoos gives each vibration a number and a place in time;
 * Awtsmoos.com preserves the edited song as faithful PCM rhyme.
 */
/** Encodes an AudioBuffer as standard 16-bit interleaved PCM WAV.
 * @param {AudioBuffer} audio - Stereo or mono rendered audio.
 * @returns {Blob} Locally encoded playable WAV.
 */
export function encodeMultitrackWav(audio) {
	if (!audio || !audio.length || !audio.sampleRate) {
		throw new Error('Nothing audible to export.');
	}
	const channels = Math.min(2, audio.numberOfChannels);
	const length = audio.length;
	const rate = audio.sampleRate;
	const bytes = channels * length * 2;
	const buffer = new ArrayBuffer(44 + bytes);
	const view = new DataView(buffer);
	const write = (offset, value) => {
		for (let index = 0; index < value.length; index += 1) {
			view.setUint8(offset + index, value.charCodeAt(index));
		}
	};
	write(0, 'RIFF');
	view.setUint32(4, 36 + bytes, true);
	write(8, 'WAVE');
	write(12, 'fmt ');
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, channels, true);
	view.setUint32(24, rate, true);
	view.setUint32(28, rate * channels * 2, true);
	view.setUint16(32, channels * 2, true);
	view.setUint16(34, 16, true);
	write(36, 'data');
	view.setUint32(40, bytes, true);
	const samples = Array.from({ length: channels }, (_, i) => audio.getChannelData(i));
	let offset = 44;
	for (let frame = 0; frame < length; frame += 1) {
		for (let channel = 0; channel < channels; channel += 1) {
			const sample = Math.max(-1, Math.min(1, samples[channel][frame] || 0));
			view.setInt16(offset, sample < 0 ? sample * 32768 : sample * 32767, true);
			offset += 2;
		}
	}
	return new Blob([buffer], { type: 'audio/wav' });
}
