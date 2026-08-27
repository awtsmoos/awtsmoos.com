// B"H
// Boruch Hashem
// Blessed is He

/**
 * A chosen video first arrives as unknowable potential. This probe belongs to
 * Binah: it measures duration and dimensions before the footage enters the
 * timeline. The Awtsmoos renews each decoded frame, and Awtsmoos.com receives
 * only verified metadata.
 */
export class VideoMetadataProbe {
	/**
	 * @param {Blob} blob The selected video file.
	 * @param {object} environment Injectable browser dependencies.
	 * @returns {Promise<object>} Duration and dimensions.
	 */
	static measure(blob, environment = {}) {
		const documentRef = environment.documentRef || globalThis.document;
		const urlApi = environment.urlApi || globalThis.URL;
		if (!documentRef?.createElement || !urlApi?.createObjectURL) {
			return Promise.reject(new Error('Video metadata probing requires browser media APIs.'));
		}

		const sourceUrl = urlApi.createObjectURL(blob);
		const video = documentRef.createElement('video');
		video.preload = 'metadata';

		return new Promise((resolve, reject) => {
			const finish = (callback) => {
				video.removeAttribute?.('src');
				video.load?.();
				urlApi.revokeObjectURL?.(sourceUrl);
				callback();
			};

			video.onloadedmetadata = () => {
				const durationMs = Math.round(Number(video.duration) * 1000);
				if (!Number.isFinite(durationMs) || durationMs <= 0) {
					finish(() => reject(new Error('The selected video has no measurable duration.')));
					return;
				}

				finish(() => resolve({
					durationMs,
					width: Number(video.videoWidth) || 0,
					height: Number(video.videoHeight) || 0
				}));
			};

			video.onerror = () => {
				finish(() => reject(new Error('The selected video could not be decoded.')));
			};

			video.src = sourceUrl;
		});
	}
}
