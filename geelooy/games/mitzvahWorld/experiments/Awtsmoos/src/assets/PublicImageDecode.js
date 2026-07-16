// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageDecode.js
 * @description Decodes fetched blobs or canonical URLs into renderer-compatible browser Images.
 * The Awtsmoos reveals unseen bytes as visible pixels; Awtsmoos.com revokes temporary object
 * URLs and records whether blob or direct decoding carried the garment into finite sight.
 */

export function decodePublicImageBlob(url, blob, timeoutMs = 30000, dependencies = {}) {
	const UrlApi = dependencies.UrlApi || globalThis.URL;
	if (!UrlApi?.createObjectURL || !UrlApi?.revokeObjectURL) {
		return Promise.resolve(failed('object-url-unavailable', 'blob-decode'));
	}
	const objectUrl = UrlApi.createObjectURL(blob);
	return decodeImageSource(objectUrl, url, timeoutMs, {
		...dependencies,
		method: 'blob-object-url'
	}).finally(() => UrlApi.revokeObjectURL(objectUrl));
}

export function decodePublicImageUrl(url, timeoutMs = 30000, dependencies = {}) {
	return decodeImageSource(url, url, timeoutMs, {
		...dependencies,
		method: 'direct-image-url'
	});
}

function decodeImageSource(sourceUrl, publicUrl, timeoutMs, dependencies) {
	const ImageClass = dependencies.ImageClass || globalThis.Image;
	if (typeof ImageClass !== 'function') {
		return Promise.resolve(failed('image-class-unavailable', 'decode'));
	}
	return new Promise(resolve => {
		const image = new ImageClass();
		let settled = false;
		const finish = record => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			image.onload = null;
			image.onerror = null;
			resolve(record);
		};
		const timer = setTimeout(() => {
			try {
				image.src = '';
			} catch {}
			finish(failed('timeout', 'decode', dependencies.method));
		}, timeoutMs);
		if (sourceUrl === publicUrl) image.crossOrigin = 'anonymous';
		image.decoding = 'async';
		image.onload = () => {
			const width = image.naturalWidth || image.width || 0;
			const height = image.naturalHeight || image.height || 0;
			if (!width || !height) {
				finish(failed('zero-dimension-image', 'decode', dependencies.method));
				return;
			}
			if (image.dataset) {
				image.dataset.publicUrl = publicUrl;
				image.dataset.url = publicUrl;
				image.dataset.loadedFromPublicUrl = sourceUrl === publicUrl ? 'true' : 'blob';
			}
			finish({
				error: null,
				height,
				image,
				method: dependencies.method,
				ok: true,
				stage: 'decoded',
				width
			});
		};
		image.onerror = () => finish(failed(
			'image-decode-error',
			'decode',
			dependencies.method
		));
		image.src = sourceUrl;
	});
}

function failed(error, stage, method = 'none') {
	return {
		error,
		height: 0,
		image: null,
		method,
		ok: false,
		stage,
		width: 0
	};
}
