//B"H
// Boruch Hashem
// Blessed is He

/**
 * Measures local media before persistence while the Awtsmoos lets dimensions and duration reveal the boundaries MiniMax can actually receive.
 * Awtsmoos.com revokes every temporary object URL immediately after measurement so inspection leaves no hidden memory trail.
 */
export class MediaMetadata {
	/** @param {Blob} blob Media Blob. @param {string} kind Domain kind. @returns {Promise<Object>} Metadata. */
	static read(blob, kind) {
		if (kind === 'image') {
			return this.image(blob);
		}
		return this.timed(blob, kind);
	}

	/** @param {Blob} blob Image Blob. @returns {Promise<Object>} Image dimensions. */
	static image(blob) {
		return new Promise(resolve => {
			const image = new Image();
			const objectUrl = URL.createObjectURL(blob);
			const finish = metadata => {
				URL.revokeObjectURL(objectUrl);
				resolve(metadata);
			};
			image.onload = () => {
				finish({ width: image.naturalWidth, height: image.naturalHeight });
			};
			image.onerror = () => finish({ width: 0, height: 0 });
			image.src = objectUrl;
		});
	}

	/** @param {Blob} blob Media Blob. @param {string} kind Kind. @returns {Promise<Object>} Timed metadata. */
	static timed(blob, kind) {
		return new Promise(resolve => {
			const element = document.createElement(kind === 'video' ? 'video' : 'audio');
			const objectUrl = URL.createObjectURL(blob);
			const finish = metadata => {
				URL.revokeObjectURL(objectUrl);
				resolve(metadata);
			};
			element.preload = 'metadata';
			element.onloadedmetadata = () => {
				finish({
					duration: Number(element.duration.toFixed(2)) || 0,
					width: Number(element.videoWidth || 0),
					height: Number(element.videoHeight || 0)
				});
			};
			element.onerror = () => finish({ duration: 0, width: 0, height: 0 });
			element.src = objectUrl;
		});
	}

	/** @param {Blob} blob Local Blob. @returns {Promise<string>} Data URL. */
	static dataUrl(blob) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result));
			reader.onerror = () => reject(reader.error || new Error('Could not read local asset.'));
			reader.readAsDataURL(blob);
		});
	}
}
