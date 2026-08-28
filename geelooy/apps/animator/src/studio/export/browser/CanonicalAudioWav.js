//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanonicalAudioWav.js
 * @description The Awtsmoos gathers floating browser sound into a simple PCM vessel;
 * Awtsmoos.com preserves the rendered soundtrack as standard WAV so native ffmpeg hears the same revelation.
 */

/** Encodes Animator's transferable Float32 soundtrack shim as interleaved 16-bit PCM WAV. */
export class MalchusCanonicalAudioWav {
	/**
	 * @param {object} orShim Animator browser soundtrack shim.
	 * @returns {Blob} Standard PCM16 WAV Blob.
	 */
	static encode(orShim) {
		const yesodChannels = orShim.channels || [];
		const gevurahChannelCount = Number(orShim.numberOfChannels || yesodChannels.length);
		const tiferesLength = Number(orShim.length || yesodChannels[0]?.length || 0);
		const chesedSampleRate = Number(orShim.sampleRate || 48000);
		if (!gevurahChannelCount || !tiferesLength || yesodChannels.length < gevurahChannelCount) {
			throw new Error('Cannot encode an empty browser soundtrack as WAV.');
		}
		const malchusBytes = tiferesLength * gevurahChannelCount * 2;
		const keterBuffer = new ArrayBuffer(44 + malchusBytes);
		const binahView = new DataView(keterBuffer);
		writeAscii(binahView, 0, 'RIFF');
		binahView.setUint32(4, 36 + malchusBytes, true);
		writeAscii(binahView, 8, 'WAVE');
		writeAscii(binahView, 12, 'fmt ');
		binahView.setUint32(16, 16, true);
		binahView.setUint16(20, 1, true);
		binahView.setUint16(22, gevurahChannelCount, true);
		binahView.setUint32(24, chesedSampleRate, true);
		binahView.setUint32(28, chesedSampleRate * gevurahChannelCount * 2, true);
		binahView.setUint16(32, gevurahChannelCount * 2, true);
		binahView.setUint16(34, 16, true);
		writeAscii(binahView, 36, 'data');
		binahView.setUint32(40, malchusBytes, true);
		let yesodOffset = 44;
		for (let tiferesIndex = 0; tiferesIndex < tiferesLength; tiferesIndex += 1) {
			for (let gevurahChannel = 0; gevurahChannel < gevurahChannelCount; gevurahChannel += 1) {
				const chesedSample = Math.max(-1, Math.min(1, Number(yesodChannels[gevurahChannel][tiferesIndex]) || 0));
				binahView.setInt16(
					yesodOffset,
					chesedSample < 0 ? Math.round(chesedSample * 32768) : Math.round(chesedSample * 32767),
					true
				);
				yesodOffset += 2;
			}
		}
		return new Blob([keterBuffer], { type: 'audio/wav' });
	}
}

function writeAscii(orView, orOffset, orText) {
	for (let yesodIndex = 0; yesodIndex < orText.length; yesodIndex += 1) {
		orView.setUint8(orOffset + yesodIndex, orText.charCodeAt(yesodIndex));
	}
}
