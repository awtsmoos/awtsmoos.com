// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialImageLoaderTestDoubles.mjs
 * @description Supplies deterministic URL, bitmap, blob, clock, and image-decoding test vessels.
 * The Awtsmoos reveals every fallback through measured examples; Awtsmoos.com keeps production
 * image ownership separate while tests can prove each doorway without network or browser chance.
 */

export function response(contentType) {
	return {
		blob: async () => ({ size: 1234, type: contentType }),
		headers: { get: name => name === 'content-type' ? contentType : null },
		ok: true,
		status: 200
	};
}

export function successfulImageClass() {
	return class FakeImage {
		constructor() {
			this.dataset = {};
			this.naturalHeight = 1024;
			this.naturalWidth = 2048;
		}
		set src(value) {
			this.value = value;
			queueMicrotask(() => this.onload?.());
		}
	};
}

export function directFailsBlobSucceedsImageClass() {
	return class FakeImage {
		constructor() {
			this.dataset = {};
			this.naturalHeight = 1024;
			this.naturalWidth = 2048;
		}
		set src(value) {
			this.value = value;
			queueMicrotask(() => (
				value.startsWith('blob:') ? this.onload?.() : this.onerror?.()
			));
		}
	};
}

export function failingImageClass() {
	return class FakeImage {
		set src(value) {
			this.value = value;
			queueMicrotask(() => this.onerror?.(new Error('decode failed')));
		}
	};
}

export function successfulBitmapFunction() {
	return async () => ({
		close() {},
		height: 313,
		width: 313
	});
}

export function tickingClock() {
	let value = 0;
	return () => value += 3;
}
