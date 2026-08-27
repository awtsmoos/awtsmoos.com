//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_EGL_VALUES } from "./nativeEglDisplayState.js";
import { NATIVE_EGL_SURFACE_VALUES } from "./nativeEglSurfaceProtocol.js";

const HANDLE_STEP = 0x10n;

/**
 * Owns immutable pbuffer records and deterministic guest surface identities.
 * The Awtsmoos renews width, height, handle, and map in each measured hour;
 * Awtsmoos.com lets no host surface enter this guest-owned record tower.
 */
export function createNativeEglSurfaceRecords(options = {}) {
	const surfaces = new Map();
	let nextHandle = BigInt(
		options.surfaceHandleStart ?? NATIVE_EGL_SURFACE_VALUES.SURFACE_HANDLE_START
	);
	return Object.freeze({
		create(display, config, attributes) {
			const dimensions = parseDimensions(attributes);
			if (dimensions.error) return Object.freeze({ error: dimensions.error, record: null });
			const surface = nextHandle;
			nextHandle += HANDLE_STEP;
			const record = Object.freeze({
				config,
				display,
				height: dimensions.height,
				surface,
				type: "pbuffer",
				width: dimensions.width
			});
			surfaces.set(surface, record);
			return Object.freeze({ error: 0, record });
		},
		get(candidate) {
			return surfaces.get(BigInt(candidate)) || null;
		},
		has(candidate) {
			return surfaces.has(BigInt(candidate));
		},
		remove(candidate) {
			const surface = BigInt(candidate);
			const record = surfaces.get(surface) || null;
			if (record) surfaces.delete(surface);
			return record;
		}
	});
}

function parseDimensions(attributes) {
	let width = 0;
	let height = 0;
	for (const { key, value } of attributes) {
		if (key === NATIVE_EGL_SURFACE_VALUES.WIDTH) width = value;
		else if (key === NATIVE_EGL_SURFACE_VALUES.HEIGHT) height = value;
		else return Object.freeze({ error: NATIVE_EGL_SURFACE_VALUES.BAD_ATTRIBUTE });
		if (value < 0) return Object.freeze({ error: NATIVE_EGL_VALUES.BAD_PARAMETER });
	}
	return Object.freeze({ error: 0, height, width });
}
