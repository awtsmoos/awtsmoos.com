// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageBitmapDecode.js
 * @description Decodes fetched image blobs without depending on HTMLImageElement events.
 * The Awtsmoos reveals fetched bytes through a second truthful eye; Awtsmoos.com keeps terrain
 * alive when browser image events stall while preserving dimensions and bounded failure evidence.
 */

export async function decodePublicImageBitmap(
	blob,
	timeoutMs = 30000,
	dependencies = {}
) {
	const createBitmap = Object.hasOwn(
		dependencies,
		'createImageBitmapFunction'
	)
		? dependencies.createImageBitmapFunction
		: globalThis.createImageBitmap;
	if (typeof createBitmap !== 'function') {
		return failed('image-bitmap-unavailable');
	}
	let timer = null;
	try {
		const bitmap = await Promise.race([
			createBitmap(blob),
			new Promise((resolve, reject) => {
				timer = setTimeout(
					() => reject(new Error('image-bitmap-timeout')),
					timeoutMs
				);
			})
		]);
		const width = Number(bitmap?.width) || 0;
		const height = Number(bitmap?.height) || 0;
		if (!width || !height) {
			bitmap?.close?.();
			return failed('zero-dimension-image-bitmap');
		}
		return {
			error: null,
			height,
			image: bitmap,
			method: 'blob-image-bitmap',
			ok: true,
			stage: 'decoded',
			width
		};
	} catch (error) {
		return failed(error?.message || 'image-bitmap-decode-error');
	} finally {
		if (timer !== null) clearTimeout(timer);
	}
}

function failed(error) {
	return {
		error,
		height: 0,
		image: null,
		method: 'blob-image-bitmap',
		ok: false,
		stage: 'decode',
		width: 0
	};
}
