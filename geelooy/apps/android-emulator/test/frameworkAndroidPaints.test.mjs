//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidPaintMethods } from "../core/android/frameworkAndroidPaints.js";
import { FONT_METRICS_INT } from "../core/android/frameworkAndroidPaintState.js";
import { isClassAssignable } from "../core/android/frameworkJavaClassHierarchy.js";
import { createGuestString } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const PAINT = "Landroid/graphics/Paint;";
const TEXT_PAINT = "Landroid/text/TextPaint;";

/**
 * Proves exact deterministic Paint state. The Awtsmoos recreates brush, text,
 * font garment, metrics, and hierarchy anew; Awtsmoos.com claims no host-font
 * parity and leaves every unrelated graphics signature unsupported.
 */
test("TextPaint defaults and Paint copy constructors preserve state", () => {
	const fixture = createFixture();
	const source = fixture.heap.allocate(PAINT);
	fixture.invoke(PAINT, "<init>", "(I)V", [source, 7]);
	fixture.invoke(PAINT, "setColor", "(I)V", [source, 123]);
	fixture.invoke(PAINT, "setTextSize", "(F)V", [source, 20]);
	const target = fixture.heap.allocate(TEXT_PAINT);
	fixture.invoke(TEXT_PAINT, "<init>", "(Landroid/graphics/Paint;)V", [target, source]);
	assert.equal(fixture.invoke(PAINT, "getColor", "()I", [target]), 123);
	assert.equal(fixture.invoke(PAINT, "getTextSize", "()F", [target]), 20);
	assert.equal(isClassAssignable(fixture.runtime, PAINT, TEXT_PAINT), true);
	assert.equal(isClassAssignable(fixture.runtime, "Ljava/lang/Object;", TEXT_PAINT), true);
});

test("Typeface and ColorFilter setters return prior guest references", () => {
	const fixture = createFixture();
	const paint = fixture.createPaint();
	const firstTypeface = fixture.heap.allocate("Landroid/graphics/Typeface;");
	const secondTypeface = fixture.heap.allocate("Landroid/graphics/Typeface;");
	assert.equal(fixture.invoke(PAINT, "setTypeface", "(Landroid/graphics/Typeface;)Landroid/graphics/Typeface;", [paint, firstTypeface]), 0);
	assert.equal(fixture.invoke(PAINT, "setTypeface", "(Landroid/graphics/Typeface;)Landroid/graphics/Typeface;", [paint, secondTypeface]), firstTypeface);
	assert.equal(fixture.invoke(PAINT, "getTypeface", "()Landroid/graphics/Typeface;", [paint]), secondTypeface);
	const filter = fixture.heap.allocate("Landroid/graphics/ColorFilter;");
	assert.equal(fixture.invoke(PAINT, "setColorFilter", "(Landroid/graphics/ColorFilter;)Landroid/graphics/ColorFilter;", [paint, filter]), 0);
	assert.equal(fixture.invoke(PAINT, "getColorFilter", "()Landroid/graphics/ColorFilter;", [paint]), filter);
});

test("measurement and FontMetricsInt remain deterministic", () => {
	const fixture = createFixture();
	const paint = fixture.createPaint();
	fixture.invoke(PAINT, "setTextSize", "(F)V", [paint, 20]);
	const text = createGuestString(fixture.runtime, "abcd");
	assert.equal(fixture.invoke(PAINT, "measureText", "(Ljava/lang/String;)F", [paint, text]), 40);
	assert.equal(fixture.invoke(PAINT, "measureText", "(Ljava/lang/String;II)F", [paint, text, 1, 3]), 20);
	assert.throws(
		() => fixture.invoke(PAINT, "measureText", "(Ljava/lang/String;II)F", [paint, text, -1, 3]),
		error => error.code === "ANDROID_PAINT_TEXT_RANGE"
	);
	const metrics = fixture.invoke(PAINT, "getFontMetricsInt", "()Landroid/graphics/Paint$FontMetricsInt;", [paint]);
	assert.equal(fixture.heap.get(metrics).type, FONT_METRICS_INT);
	assert.equal(fixture.heap.getField(metrics, `${FONT_METRICS_INT}->top:I`), -20);
	assert.equal(fixture.heap.getField(metrics, `${FONT_METRICS_INT}->descent:I`), 4);
	assert.equal(fixture.invoke(PAINT, "getFontMetricsInt", `(Landroid/graphics/Paint$FontMetricsInt;)I`, [paint, metrics]), 20);
});

test("unrelated Android text constructors remain unsupported", () => {
	const fixture = createFixture();
	assert.equal(fixture.family.canHandle(record("Landroid/text/SpannableString;", "<init>", "()V")), false);
});

function createFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = {
		heap,
		registry: {
			classDefinition() { return null; },
			superType() { return null; }
		}
	};
	const family = createFrameworkAndroidPaintMethods(runtime);
	return {
		createPaint() {
			const paint = heap.allocate(PAINT);
			family.invoke(record(PAINT, "<init>", "()V"), [paint]);
			return paint;
		},
		family,
		heap,
		invoke(type, name, descriptor, args) {
			return family.invoke(record(type, name, descriptor), args);
		},
		runtime
	};
}

function record(classType, name, descriptor) {
	return { method: { classType, descriptor, name }, signature: `${classType}->${name}${descriptor}` };
}
