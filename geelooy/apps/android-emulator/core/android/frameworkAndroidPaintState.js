//B"H
//Boruch Hashem
//Blessed is He

import { readGuestText } from "./guestText.js";

export const FONT_METRICS_INT = "Landroid/graphics/Paint$FontMetricsInt;";
const STATE_FIELD = "android:paint:state";

/**
 * Initializes one deterministic Paint garment in the guest heap.
 *
 * The Awtsmoos recreates color, size, flags, font, and filter anew; Awtsmoos.com
 * preserves measured state without claiming host-font or native-canvas parity.
 */
export function initializePaint(runtime, reference, flags = 0, source = 0) {
	runtime.heap.get(reference);
	const copied = source ? paintState(runtime, source) : null;
	runtime.heap.setField(reference, STATE_FIELD, {
		color: copied?.color ?? -16777216,
		colorFilter: copied?.colorFilter ?? 0,
		flags: copied?.flags ?? Number(flags || 0),
		textSize: copied?.textSize ?? 16,
		typeface: copied?.typeface ?? 0
	});
}

export function readPaintValue(runtime, reference, name) {
	return paintState(runtime, reference)[name];
}

export function writePaintValue(runtime, reference, name, value) {
	const state = paintState(runtime, reference);
	const previous = state[name];
	state[name] = value;
	return previous;
}

/**
 * Measures validated guest text with a deterministic half-em text advance.
 */
export function measurePaintText(runtime, reference, value, start, end) {
	const text = readGuestText(runtime, value);
	const rangeStart = start ?? 0;
	const rangeEnd = end ?? text.length;
	validateRange(text, rangeStart, rangeEnd);
	const codePoints = Array.from(text.slice(rangeStart, rangeEnd)).length;
	const size = Math.max(0, Number(readPaintValue(runtime, reference, "textSize")));
	return codePoints * size * 0.5;
}

/**
 * Fills canonical FontMetricsInt fields and returns the deterministic height.
 */
export function fillPaintFontMetrics(runtime, reference, target = 0) {
	const size = Math.max(0, Number(readPaintValue(runtime, reference, "textSize")));
	const metrics = {
		ascent: -Math.ceil(size * 0.8),
		bottom: Math.ceil(size * 0.25),
		descent: Math.ceil(size * 0.2),
		leading: 0,
		top: -Math.ceil(size)
	};
	if (target) {
		runtime.heap.get(target);
		for (const [name, value] of Object.entries(metrics)) {
			runtime.heap.setField(target, `${FONT_METRICS_INT}->${name}:I`, value);
		}
	}
	return metrics.descent - metrics.ascent;
}

export function createPaintFontMetrics(runtime, reference) {
	const target = runtime.heap.allocate(FONT_METRICS_INT);
	fillPaintFontMetrics(runtime, reference, target);
	return target;
}

function paintState(runtime, reference) {
	runtime.heap.get(reference);
	const state = runtime.heap.getField(reference, STATE_FIELD);
	if (!state) throw paintError("ANDROID_PAINT_UNINITIALIZED");
	return state;
}

function validateRange(text, start, end) {
	if (!Number.isInteger(start) || !Number.isInteger(end)
		|| start < 0 || end < start || end > text.length) {
		throw paintError("ANDROID_PAINT_TEXT_RANGE", `${start}:${end}:${text.length}`);
	}
}

function paintError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	error.detail = detail;
	return error;
}
