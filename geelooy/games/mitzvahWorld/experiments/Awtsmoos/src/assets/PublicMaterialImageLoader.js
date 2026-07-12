// B"H

/**
 * Loads one public material into a real browser Image and returns structured evidence.
 * The promise never rejects: network, decode, and timeout failures become explicit records.
 *
 * @param {string} url Public image URL.
 * @param {number} timeoutMs Maximum wait before the attempt is marked timed out.
 * @returns {Promise<object>} Load record containing the Image only when it is usable.
 */
export function loadPublicMaterialImage(url, timeoutMs = 8000) {
	const startedAt = performance.now();
	return new Promise((resolve) => {
		const image = new Image();
		let settled = false;
		const settle = (record) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			image.onload = null;
			image.onerror = null;
			resolve({
				url,
				durationMs: Math.round(performance.now() - startedAt),
				...record
			});
		};
		const timer = setTimeout(() => {
			image.src = '';
			settle({ ok: false, image: null, width: 0, height: 0, error: 'timeout' });
		}, timeoutMs);
		image.crossOrigin = 'anonymous';
		image.decoding = 'async';
		image.onload = () => {
			const width = image.naturalWidth || 0;
			const height = image.naturalHeight || 0;
			if (!width || !height) {
				settle({ ok: false, image: null, width, height, error: 'zero-dimension-image' });
				return;
			}
			image.dataset.publicUrl = url;
			image.dataset.url = url;
			image.dataset.loadedFromPublicUrl = image.src === url ? 'true' : 'false';
			settle({ ok: true, image, width, height, error: null });
		};
		image.onerror = () => settle({
			ok: false,
			image: null,
			width: 0,
			height: 0,
			error: 'network-or-decode-error'
		});
		image.src = url;
	});
}

/** Removes the non-serializable Image while preserving all browser evidence. */
export function serializableImageRecord(record) {
	return {
		url: record.url,
		ok: record.ok,
		width: record.width,
		height: record.height,
		durationMs: record.durationMs,
		error: record.error || null,
		fromCache: !!record.fromCache
	};
}
