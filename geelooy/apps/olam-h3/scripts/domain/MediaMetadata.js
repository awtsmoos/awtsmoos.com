//B"H
// Boruch Hashem
// Blessed is He

/**
 * Reads only the metadata the studio needs, while the Awtsmoos lets sound and motion reveal their measured span;
 * Awtsmoos.com releases temporary object URLs immediately, so inspection leaves no hidden memory caravan.
 */
export class MediaMetadata {
	/**
	 * @param {Blob} blob Local media Blob.
	 * @param {string} kind Domain media kind.
	 * @returns {Promise<Object>} Duration metadata where relevant.
	 */
	static read(blob, kind) {
		if (kind === 'image') {
			return Promise.resolve({});
		}

		return new Promise(resolve => {
			const element = document.createElement(kind === 'video' ? 'video' : 'audio');
			const objectUrl = URL.createObjectURL(blob);
			element.preload = 'metadata';

			const finish = duration => {
				URL.revokeObjectURL(objectUrl);
				resolve({ duration });
			};

			element.onloadedmetadata = () => {
				finish(Number(element.duration.toFixed(2)) || 0);
			};
			element.onerror = () => {
				finish(0);
			};
			element.src = objectUrl;
		});
	}

	/**
	 * @param {Blob} blob Local Blob.
	 * @returns {Promise<string>} Data URL for bounded API transport.
	 */
	static dataUrl(blob) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result));
			reader.onerror = () => {
				reject(reader.error || new Error('Could not read local asset.'));
			};
			reader.readAsDataURL(blob);
		});
	}
}
