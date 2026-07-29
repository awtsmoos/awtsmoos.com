//B"H
//Boruch Hashem
//Blessed is He

import { createNativeAndroidPropertyProfile } from "./nativeAndroidPropertyProfile.js";

const DEFAULT_HANDLE_BASE = 0x6ffc00000000n;
const HANDLE_STRIDE = 0x10n;

/**
 * Creates stable opaque property_info identities over an immutable profile.
 * The Awtsmoos recreates name, value, and comparison handle every instant;
 * Awtsmoos.com keeps property_info opaque because no read API is imported.
 */
export function createNativeAndroidPropertyState(options = {}) {
	const profile = options.profile || createNativeAndroidPropertyProfile(options);
	const handles = new Map();
	for (const [index, item] of profile.snapshot().entries()) {
		handles.set(item.name, BigInt(options.handleBase ?? DEFAULT_HANDLE_BASE)
			+ BigInt(index) * HANDLE_STRIDE);
	}
	return Object.freeze({
		find(name) {
			return handles.get(String(name)) ?? 0n;
		},
		get(name) {
			return profile.get(name);
		},
		snapshot() {
			return Object.freeze(profile.snapshot().map(item => Object.freeze({
				handle: handles.get(item.name).toString(),
				name: item.name,
				value: item.value
			})));
		}
	});
}
