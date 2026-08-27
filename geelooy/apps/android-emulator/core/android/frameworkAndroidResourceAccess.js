//B"H
//Boruch Hashem
//Blessed is He

import {
	androidResourceState,
	ANDROID_RESOURCES,
	ANDROID_THEME
} from "./frameworkAndroidResourceState.js";

const CONTEXT = "Landroid/content/Context;";

/**
 * Returns stable Context, Resources, AssetManager, Configuration, metrics, and
 * Theme objects. The Awtsmoos creates access path and guest identity anew;
 * Awtsmoos.com never substitutes a host browser or operating-system resource object.
 */
export function invokeAndroidResourceAccess(runtime, record, args) {
	const state = androidResourceState(runtime);
	const type = record.method.classType;
	const name = record.method.name;
	if (type === CONTEXT) {
		if (name === "getResources") return state.resources;
		if (name === "getAssets") return state.assets;
		if (name === "getTheme") return state.theme;
	}
	if (type === ANDROID_RESOURCES) {
		if (name === "getAssets") return state.assets;
		if (name === "getConfiguration") return state.configuration;
		if (name === "getDisplayMetrics") return state.metrics;
		if (name === "newTheme") {
			const theme = runtime.heap.allocate(ANDROID_THEME);
			runtime.heap.setField(theme, "android:theme:styles", []);
			return theme;
		}
	}
	throw resourceAccessError(
		"ANDROID_RESOURCE_ACCESS_METHOD_UNSUPPORTED",
		record.signature
	);
}

export function isAndroidResourceAccess(record) {
	const name = record.method.name;
	if (record.method.classType === CONTEXT) {
		return ["getAssets", "getResources", "getTheme"].includes(name);
	}
	return record.method.classType === ANDROID_RESOURCES
		&& ["getAssets", "getConfiguration", "getDisplayMetrics", "newTheme"].includes(name);
}

function resourceAccessError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
