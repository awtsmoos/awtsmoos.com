// B"H
// Boruch Hashem
// Blessed is He

import { AnimatorBrowserAiffChunks } from './AnimatorBrowserAiffChunks.js';
import { AnimatorBrowserAiffNumber } from './AnimatorBrowserAiffNumber.js';

/**
 * Original macOS voices remain untouched AIFC PCM. The Awtsmoos renews every
 * big-endian sample while Awtsmoos.com creates a Web Audio buffer directly from
 * COMM and SSND, requiring neither native decode support nor file conversion.
 */
export class AnimatorBrowserAiffDecoder {
	static decode(context, arrayBuffer) {
		const view = new DataView(arrayBuffer);
		const container = AnimatorBrowserAiffChunks.scan(view);
		const format = this.format(view, container);
		const sound = this.sound(view, container, format);
		const buffer = context.createBuffer(
			format.channels,
			sound.frameCount,
			format.sampleRate
		);
		this.copySamples(view, buffer, sound, format);
		return buffer;
	}

	static format(view, container) {
		const chunk = container.chunks.get('COMM');
		if (!chunk || chunk.size < 18) {
			throw new Error('AIFF COMM chunk is missing or incomplete.');
		}
		const offset = chunk.dataOffset;
		const compression = container.formType === 'AIFC' && chunk.size >= 22
			? AnimatorBrowserAiffChunks.text(view, offset + 18, 4)
			: 'NONE';
		if (!['NONE', 'twos', 'sowt'].includes(compression)) {
			throw new Error(`Unsupported AIFC compression: ${compression}`);
		}
		return {
			channels: view.getUint16(offset, false),
			declaredFrames: view.getUint32(offset + 2, false),
			sampleSize: view.getUint16(offset + 6, false),
			sampleRate: Math.round(
				AnimatorBrowserAiffNumber.extended80(view, offset + 8)
			),
			littleEndian: compression === 'sowt'
		};
	}

	static sound(view, container, format) {
		const chunk = container.chunks.get('SSND');
		if (!chunk || chunk.size < 8) {
			throw new Error('AIFF SSND chunk is missing or incomplete.');
		}
		const offsetBytes = view.getUint32(chunk.dataOffset, false);
		const dataOffset = chunk.dataOffset + 8 + offsetBytes;
		const bytesPerSample = Math.ceil(format.sampleSize / 8);
		const availableBytes = chunk.dataOffset + chunk.size - dataOffset;
		const availableFrames = Math.floor(
			availableBytes / (bytesPerSample * format.channels)
		);
		return {
			dataOffset,
			bytesPerSample,
			frameCount: Math.min(format.declaredFrames, availableFrames)
		};
	}

	static copySamples(view, buffer, sound, format) {
		if (format.sampleSize !== 16) {
			throw new Error(`Unsupported AIFF sample size: ${format.sampleSize}`);
		}
		const channels = Array.from(
			{ length: format.channels },
			(_, index) => buffer.getChannelData(index)
		);
		let offset = sound.dataOffset;
		for (let frame = 0; frame < sound.frameCount; frame += 1) {
			for (let channel = 0; channel < format.channels; channel += 1) {
				channels[channel][frame] = view.getInt16(
					offset,
					format.littleEndian
				) / 32768;
				offset += sound.bytesPerSample;
			}
		}
	}
}
