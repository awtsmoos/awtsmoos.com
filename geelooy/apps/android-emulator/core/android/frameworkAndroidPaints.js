//B"H
//Boruch Hashem
//Blessed is He

import {
	createPaintFontMetrics,
	fillPaintFontMetrics,
	initializePaint,
	measurePaintText,
	readPaintValue,
	writePaintValue
} from "./frameworkAndroidPaintState.js";

const PAINT = "Landroid/graphics/Paint;";
const TEXT_PAINT = "Landroid/text/TextPaint;";
const CONSTRUCTORS = new Set([
	"<init>()V",
	"<init>(I)V",
	"<init>(Landroid/graphics/Paint;)V"
]);
const METHODS = new Set([
	"getColor()I",
	"setColor(I)V",
	"getTextSize()F",
	"setTextSize(F)V",
	"getTypeface()Landroid/graphics/Typeface;",
	"setTypeface(Landroid/graphics/Typeface;)Landroid/graphics/Typeface;",
	"getColorFilter()Landroid/graphics/ColorFilter;",
	"setColorFilter(Landroid/graphics/ColorFilter;)Landroid/graphics/ColorFilter;",
	"measureText(Ljava/lang/String;)F",
	"measureText(Ljava/lang/String;II)F",
	"measureText(Ljava/lang/CharSequence;II)F",
	"getFontMetricsInt()Landroid/graphics/Paint$FontMetricsInt;",
	"getFontMetricsInt(Landroid/graphics/Paint$FontMetricsInt;)I"
]);

/**
 * Routes exact deterministic Paint and TextPaint operations.
 *
 * The Awtsmoos recreates brush state, text extent, font garment, and metrics
 * anew. Awtsmoos.com acknowledges no broad graphics or Android text wildcard.
 */
export function createFrameworkAndroidPaintMethods(runtime) {
	return Object.freeze({
		canHandle(record) {
			const type = record.method.classType;
			const operation = `${record.method.name}${record.method.descriptor}`;
			if (record.method.name === "<init>") {
				return (type === PAINT || type === TEXT_PAINT)
					&& CONSTRUCTORS.has(operation);
			}
			return (type === PAINT || type === TEXT_PAINT)
				&& METHODS.has(operation);
		},
		invoke(record, args) {
			return invokePaint(runtime, record, args);
		}
	});
}

function invokePaint(runtime, record, args) {
	const operation = `${record.method.name}${record.method.descriptor}`;
	if (record.method.name === "<init>") {
		const source = record.method.descriptor.includes("Landroid/graphics/Paint;")
			? args[1] : 0;
		const flags = record.method.descriptor === "(I)V" ? args[1] : 0;
		initializePaint(runtime, args[0], flags, source);
		return undefined;
	}
	if (operation === "getColor()I") return readPaintValue(runtime, args[0], "color");
	if (operation === "setColor(I)V") return setValue(runtime, args, "color");
	if (operation === "getTextSize()F") return readPaintValue(runtime, args[0], "textSize");
	if (operation === "setTextSize(F)V") return setValue(runtime, args, "textSize");
	if (operation.startsWith("getTypeface")) return readPaintValue(runtime, args[0], "typeface");
	if (operation.startsWith("setTypeface")) return writePaintValue(runtime, args[0], "typeface", args[1]);
	if (operation.startsWith("getColorFilter")) return readPaintValue(runtime, args[0], "colorFilter");
	if (operation.startsWith("setColorFilter")) return writePaintValue(runtime, args[0], "colorFilter", args[1]);
	if (operation === "measureText(Ljava/lang/String;)F") {
		return measurePaintText(runtime, args[0], args[1]);
	}
	if (operation.startsWith("measureText(")) {
		return measurePaintText(runtime, args[0], args[1], args[2], args[3]);
	}
	if (operation === "getFontMetricsInt()Landroid/graphics/Paint$FontMetricsInt;") {
		return createPaintFontMetrics(runtime, args[0]);
	}
	return fillPaintFontMetrics(runtime, args[0], args[1]);
}

function setValue(runtime, args, name) {
	writePaintValue(runtime, args[0], name, args[1]);
	return undefined;
}
