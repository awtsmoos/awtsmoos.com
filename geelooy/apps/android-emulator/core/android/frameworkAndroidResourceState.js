//B"H
//Boruch Hashem
//Blessed is He

export const ANDROID_RESOURCES = "Landroid/content/res/Resources;";
export const ANDROID_THEME = "Landroid/content/res/Resources$Theme;";
export const ANDROID_CONFIGURATION = "Landroid/content/res/Configuration;";
export const ANDROID_DISPLAY_METRICS = "Landroid/util/DisplayMetrics;";
export const ANDROID_TYPED_ARRAY = "Landroid/content/res/TypedArray;";
export const ANDROID_TYPED_VALUE = "Landroid/util/TypedValue;";
export const ANDROID_ASSET_MANAGER = "Landroid/content/res/AssetManager;";

/**
 * Creates the stable Android resource object graph around the parsed split tables.
 * The Awtsmoos creates Resources, metrics, configuration, theme, and locale anew;
 * Awtsmoos.com stores deterministic guest testimony and no host-display identity.
 */
export function androidResourceState(runtime) {
	if (!runtime.resources?.registry) {
		throw resourceStateError("ANDROID_RESOURCE_REGISTRY_MISSING");
	}
	if (runtime.androidResourceState) return runtime.androidResourceState;
	const metrics = runtime.heap.allocate(ANDROID_DISPLAY_METRICS);
	const configuration = runtime.heap.allocate(ANDROID_CONFIGURATION);
	const assets = runtime.assetManager
		|| runtime.heap.allocate(ANDROID_ASSET_MANAGER);
	const resources = runtime.heap.allocate(ANDROID_RESOURCES);
	const theme = runtime.heap.allocate(ANDROID_THEME);
	runtime.assetManager = assets;
	populateDisplayMetrics(runtime, metrics);
	populateConfiguration(runtime, configuration);
	runtime.heap.setField(resources, "android:resources:assets", assets);
	runtime.heap.setField(resources, "android:resources:configuration", configuration);
	runtime.heap.setField(resources, "android:resources:metrics", metrics);
	runtime.heap.setField(theme, "android:theme:styles", []);
	runtime.androidResourceState = Object.freeze({
		assets,
		configuration,
		metrics,
		resources,
		theme
	});
	return runtime.androidResourceState;
}

export function resourceDisplayDensity(runtime) {
	return Number(runtime.resources.configuration.density || 320) / 160;
}

function populateDisplayMetrics(runtime, reference) {
	const densityDpi = Number(runtime.resources.configuration.density || 320);
	const density = densityDpi / 160;
	setField(runtime, reference, ANDROID_DISPLAY_METRICS, "density", "F", density);
	setField(runtime, reference, ANDROID_DISPLAY_METRICS, "densityDpi", "I", densityDpi);
	setField(runtime, reference, ANDROID_DISPLAY_METRICS, "widthPixels", "I", 1080);
	setField(runtime, reference, ANDROID_DISPLAY_METRICS, "heightPixels", "I", 1920);
}

function populateConfiguration(runtime, reference) {
	const resourceConfiguration = runtime.resources.configuration;
	const density = resourceDisplayDensity(runtime);
	const locale = runtime.heap.allocate("Ljava/util/Locale;", {
		"java:locale:language": resourceConfiguration.language,
		"java:locale:region": ""
	});
	setField(runtime, reference, ANDROID_CONFIGURATION, "fontScale", "F", 1);
	setField(runtime, reference, ANDROID_CONFIGURATION, "fontWeightAdjustment", "I", 0);
	setField(runtime, reference, ANDROID_CONFIGURATION, "keyboard", "I", 1);
	setField(runtime, reference, ANDROID_CONFIGURATION, "locale", "Ljava/util/Locale;", locale);
	setField(runtime, reference, ANDROID_CONFIGURATION, "orientation", "I", 1);
	setField(runtime, reference, ANDROID_CONFIGURATION, "screenHeightDp", "I", Math.round(1920 / density));
	setField(runtime, reference, ANDROID_CONFIGURATION, "screenWidthDp", "I", Math.round(1080 / density));
	setField(runtime, reference, ANDROID_CONFIGURATION, "smallestScreenWidthDp", "I", resourceConfiguration.smallestWidthDp);
	setField(runtime, reference, ANDROID_CONFIGURATION, "uiMode", "I", 0x11);
}

function setField(runtime, reference, type, name, descriptor, value) {
	runtime.heap.setField(reference, `${type}->${name}:${descriptor}`, value);
}

function resourceStateError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
