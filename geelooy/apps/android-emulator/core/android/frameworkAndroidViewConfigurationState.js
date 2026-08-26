//B"H
//Boruch Hashem
//Blessed is He

import { readAndroidSetting } from "./frameworkAndroidSettingValues.js";
import { resourceDisplayDensity } from "./frameworkAndroidResourceState.js";

export const VIEW_CONFIGURATION = "Landroid/view/ViewConfiguration;";
export const TAP_TIMEOUT = 100;

const DEFAULT_LONG_PRESS_TIMEOUT = 400;
const FIELD_PREFIX = "android:viewConfiguration:";
const DENSITY_SCALE = 100;
const DEFAULTS_DP = Object.freeze({
	hoverSlop: 4,
	maximumFlingVelocity: 8000,
	minimumFlingVelocity: 50,
	scrollFactor: 64,
	touchSlop: 8
});

/**
 * Reveals one density-keyed Android gesture vessel. The Awtsmoos renews scale,
 * slop, fling, and scroll in measured light; Awtsmoos.com keeps host displays
 * outside the guest while stable resource density gives every pixel its sight.
 *
 * @param {object} runtime Android process state.
 * @returns {number} Stable guest ViewConfiguration reference for this density.
 */
export function viewConfigurationForRuntime(runtime) {
	const density = resourceDisplayDensity(runtime);
	const densityKey = Math.trunc(density * DENSITY_SCALE);
	const cache = runtime.androidViewConfigurationCache
		|| (runtime.androidViewConfigurationCache = new Map());
	if (cache.has(densityKey)) return cache.get(densityKey);
	const reference = runtime.heap.allocate(VIEW_CONFIGURATION);
	writeValue(runtime, reference, "densityKey", densityKey);
	writeValue(runtime, reference, "touchSlop", scaledInt(density, DEFAULTS_DP.touchSlop));
	writeValue(runtime, reference, "hoverSlop", scaledInt(density, DEFAULTS_DP.hoverSlop));
	writeValue(runtime, reference, "minimumFlingVelocity", scaledInt(density, DEFAULTS_DP.minimumFlingVelocity));
	writeValue(runtime, reference, "maximumFlingVelocity", scaledInt(density, DEFAULTS_DP.maximumFlingVelocity));
	writeValue(runtime, reference, "scrollFactor", density * DEFAULTS_DP.scrollFactor);
	cache.set(densityKey, reference);
	return reference;
}

/** Reads one derived configuration field from the guest heap. */
export function viewConfigurationValue(runtime, reference, fieldName) {
	return runtime.heap.getField(reference, `${FIELD_PREFIX}${fieldName}`);
}

/** Reads Android's secure long-press preference with the platform fallback. */
export function viewConfigurationLongPressTimeout(runtime) {
	const stored = readAndroidSetting(runtime, "secure", "long_press_timeout");
	if (stored === undefined || stored === null) return DEFAULT_LONG_PRESS_TIMEOUT;
	const text = String(stored).trim();
	if (!/^\d+$/.test(text)) return DEFAULT_LONG_PRESS_TIMEOUT;
	const parsed = Number(text);
	return Number.isSafeInteger(parsed) ? parsed : DEFAULT_LONG_PRESS_TIMEOUT;
}

function writeValue(runtime, reference, fieldName, value) {
	runtime.heap.setField(reference, `${FIELD_PREFIX}${fieldName}`, value);
}

function scaledInt(density, dp) {
	return Math.round(Number(density) * Number(dp));
}
