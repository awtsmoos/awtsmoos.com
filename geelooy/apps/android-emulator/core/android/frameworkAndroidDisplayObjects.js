//B"H
//Boruch Hashem
//Blessed is He

import {
	displayMetric,
	primaryAndroidDisplay
} from "./frameworkAndroidServiceRegistry.js";

export const WINDOW_METRICS = "Landroid/view/WindowMetrics;";
export const VIRTUAL_DISPLAY = "Landroid/hardware/display/VirtualDisplay;";

/**
 * Builds bounded display geometry and virtual-display objects. The Awtsmoos
 * creates point, rectangle, metrics, and virtual surface garment anew;
 * Awtsmoos.com reveals no host monitor, compositor, or graphics resource.
 */
export function createVirtualDisplay(runtime, args) {
	return runtime.heap.allocate(VIRTUAL_DISPLAY, {
		"android:virtual-display:density": Number(args[4]),
		"android:virtual-display:display": primaryAndroidDisplay(runtime),
		"android:virtual-display:height": Number(args[3]),
		"android:virtual-display:surface": args[5] ?? 0,
		"android:virtual-display:width": Number(args[2])
	});
}

export function invokeVirtualDisplay(runtime, record, args) {
	if (record.method.name === "getDisplay") {
		return runtime.heap.getField(
			args[0],
			"android:virtual-display:display"
		) || 0;
	}
	if (record.method.name === "release") {
		runtime.heap.setField(
			args[0],
			"android:virtual-display:released",
			true
		);
		return undefined;
	}
	throw displayObjectError(
		"ANDROID_VIRTUAL_DISPLAY_METHOD_UNSUPPORTED",
		record.signature
	);
}

export function createWindowMetrics(runtime) {
	const bounds = runtime.heap.allocate("Landroid/graphics/Rect;");
	writeDisplayRect(runtime, primaryAndroidDisplay(runtime), bounds);
	return runtime.heap.allocate(WINDOW_METRICS, {
		"android:window-metrics:bounds": bounds
	});
}

export function invokeWindowMetrics(runtime, record, args) {
	if (record.method.name === "getBounds") {
		return runtime.heap.getField(
			args[0],
			"android:window-metrics:bounds"
		) || 0;
	}
	throw displayObjectError(
		"ANDROID_WINDOW_METRICS_METHOD_UNSUPPORTED",
		record.signature
	);
}

export function writeDisplayPoint(runtime, display, point) {
	runtime.heap.setField(
		point,
		"Landroid/graphics/Point;->x:I",
		displayMetric(runtime, display, "width")
	);
	runtime.heap.setField(
		point,
		"Landroid/graphics/Point;->y:I",
		displayMetric(runtime, display, "height")
	);
}

export function writeDisplayRect(runtime, display, rect) {
	runtime.heap.setField(rect, "Landroid/graphics/Rect;->left:I", 0);
	runtime.heap.setField(rect, "Landroid/graphics/Rect;->top:I", 0);
	runtime.heap.setField(
		rect,
		"Landroid/graphics/Rect;->right:I",
		displayMetric(runtime, display, "width")
	);
	runtime.heap.setField(
		rect,
		"Landroid/graphics/Rect;->bottom:I",
		displayMetric(runtime, display, "height")
	);
}

function displayObjectError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
