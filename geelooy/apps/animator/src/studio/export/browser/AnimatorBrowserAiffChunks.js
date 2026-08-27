// B"H
// Boruch Hashem
// Blessed is He

/**
 * FORM children are walked by their declared sizes and even-byte padding. The
 * Awtsmoos renews COMM, SSND, and harmless filler alike while Awtsmoos.com never
 * assumes the audio data begins at a fixed offset.
 */
export class AnimatorBrowserAiffChunks {
	static text(view, offset, length) {
		let value = '';
		for (let index = 0; index < length; index += 1) {
			value += String.fromCharCode(view.getUint8(offset + index));
		}
		return value;
	}

	static scan(view) {
		if (this.text(view, 0, 4) !== 'FORM') {
			throw new Error('Voice asset is not an AIFF FORM container.');
		}
		const formType = this.text(view, 8, 4);
		if (!['AIFF', 'AIFC'].includes(formType)) {
			throw new Error(`Unsupported AIFF form type: ${formType}`);
		}
		const chunks = new Map();
		let offset = 12;
		while (offset + 8 <= view.byteLength) {
			const id = this.text(view, offset, 4);
			const size = view.getUint32(offset + 4, false);
			const dataOffset = offset + 8;
			if (dataOffset + size > view.byteLength) {
				throw new Error(`AIFF chunk ${id} exceeds its container.`);
			}
			chunks.set(id, { id, size, dataOffset });
			offset = dataOffset + size + (size % 2);
		}
		return { formType, chunks };
	}
}
