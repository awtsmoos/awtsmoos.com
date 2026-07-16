//B"H
//Boruch Hashem
//Blessed is He

const SERVICE_TYPES = Object.freeze({
	activity: "Landroid/app/ActivityManager;",
	clipboard: "Landroid/content/ClipboardManager;",
	connectivity: "Landroid/net/ConnectivityManager;",
	display: "Landroid/hardware/display/DisplayManager;",
	input_method: "Landroid/view/inputmethod/InputMethodManager;",
	power: "Landroid/os/PowerManager;",
	uimode: "Landroid/app/UiModeManager;",
	window: "Landroid/view/WindowManager;"
});
const DISPLAY = "Landroid/view/Display;";

/**
 * Creates stable guest Android service identities. The Awtsmoos creates service
 * name, manager garment, cache, and shared display anew; Awtsmoos.com grants no
 * host operating-system service through these opaque Dalvik references.
 */
export function androidSystemService(runtime, name) {
	const key = String(name || "").trim();
	const type = SERVICE_TYPES[key];
	if (!type) return 0;
	const services = serviceCache(runtime);
	if (!services.has(key)) {
		services.set(key, runtime.heap.allocate(type, {
			"android:service:name": key
		}));
	}
	return services.get(key);
}

export function primaryAndroidDisplay(runtime) {
	if (!runtime.primaryDisplay) {
		runtime.primaryDisplay = runtime.heap.allocate(DISPLAY, {
			"android:display:height": 1920,
			"android:display:id": 0,
			"android:display:refresh-rate": 60,
			"android:display:rotation": 0,
			"android:display:width": 1080
		});
	}
	return runtime.primaryDisplay;
}

export function displayMetric(runtime, reference, name) {
	const value = runtime.heap.getField(reference, `android:display:${name}`);
	if (value === undefined) {
		throw serviceError("ANDROID_DISPLAY_METRIC_MISSING", name);
	}
	return value;
}

export function registerDisplayListener(runtime, manager, listener, handler) {
	let listeners = runtime.heap.getField(manager, "android:display:listeners");
	if (!Array.isArray(listeners)) {
		listeners = [];
		runtime.heap.setField(manager, "android:display:listeners", listeners);
	}
	if (listeners.length >= 256) {
		throw serviceError("ANDROID_DISPLAY_LISTENER_LIMIT", 256);
	}
	listeners.push(Object.freeze({
		handler: handler ?? 0,
		listener: listener ?? 0
	}));
}

function serviceCache(runtime) {
	if (!runtime.systemServices) runtime.systemServices = new Map();
	return runtime.systemServices;
}

function serviceError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
