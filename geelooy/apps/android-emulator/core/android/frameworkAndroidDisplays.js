//B"H
//Boruch Hashem
//Blessed is He

import {
	createVirtualDisplay,
	createWindowMetrics,
	invokeVirtualDisplay,
	invokeWindowMetrics,
	VIRTUAL_DISPLAY,
	WINDOW_METRICS,
	writeDisplayPoint,
	writeDisplayRect
} from "./frameworkAndroidDisplayObjects.js";
import {
	displayMetric,
	primaryAndroidDisplay,
	registerDisplayListener
} from "./frameworkAndroidServiceRegistry.js";

const DISPLAY_MANAGER = "Landroid/hardware/display/DisplayManager;";
const DISPLAY = "Landroid/view/Display;";
const WINDOW_MANAGER = "Landroid/view/WindowManager;";
const DISPLAY_TYPES = new Set([
	DISPLAY_MANAGER,
	DISPLAY,
	WINDOW_MANAGER,
	WINDOW_METRICS,
	VIRTUAL_DISPLAY
]);

/**
 * Dispatches measured Android display and window-manager methods. The Awtsmoos
 * creates manager, refresh rate, geometry, listener, and metrics anew;
 * Awtsmoos.com exposes no host monitor, compositor, or graphics authority.
 */
export function createFrameworkAndroidDisplayMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			return DISPLAY_TYPES.has(record.method.classType);
		},
		invoke(record, args) {
			const type = record.method.classType;
			if (type === DISPLAY_MANAGER) {
				return invokeDisplayManager(runtime, record, args);
			}
			if (type === DISPLAY) return invokeDisplay(runtime, record, args);
			if (type === WINDOW_MANAGER) {
				return invokeWindowManager(runtime, record);
			}
			if (type === WINDOW_METRICS) {
				return invokeWindowMetrics(runtime, record, args);
			}
			return invokeVirtualDisplay(runtime, record, args);
		}
	});
}

function invokeDisplayManager(runtime, record, args) {
	const name = record.method.name;
	if (name === "getDisplay") {
		return Number(args[1]) === 0 ? primaryAndroidDisplay(runtime) : 0;
	}
	if (name === "registerDisplayListener") {
		return registerDisplayListener(runtime, args[0], args[1], args[2]);
	}
	if (name === "createVirtualDisplay") {
		return createVirtualDisplay(runtime, args);
	}
	throw displayError(
		"ANDROID_DISPLAY_MANAGER_METHOD_UNSUPPORTED",
		record.signature
	);
}

function invokeDisplay(runtime, record, args) {
	const name = record.method.name;
	if (name === "getRefreshRate") {
		return displayMetric(runtime, args[0], "refresh-rate");
	}
	if (name === "getRotation") {
		return displayMetric(runtime, args[0], "rotation");
	}
	if (name === "getRealSize") {
		return writeDisplayPoint(runtime, args[0], args[1]);
	}
	if (name === "getRectSize") {
		return writeDisplayRect(runtime, args[0], args[1]);
	}
	throw displayError("ANDROID_DISPLAY_METHOD_UNSUPPORTED", record.signature);
}

function invokeWindowManager(runtime, record) {
	const name = record.method.name;
	if (name === "getDefaultDisplay") return primaryAndroidDisplay(runtime);
	if (["getCurrentWindowMetrics", "getMaximumWindowMetrics"].includes(name)) {
		return createWindowMetrics(runtime);
	}
	if (name === "isCrossWindowBlurEnabled") return 0;
	if (name.startsWith("addCrossWindowBlurEnabledListener")
		|| name === "removeCrossWindowBlurEnabledListener") {
		return undefined;
	}
	throw displayError(
		"ANDROID_WINDOW_MANAGER_METHOD_UNSUPPORTED",
		record.signature
	);
}

function displayError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
