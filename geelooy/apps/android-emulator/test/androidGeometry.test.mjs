//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";
import { createFrameworkAndroidGeometryMethods } from "../core/android/frameworkAndroidGeometry.js";
import { readGuestText } from "../core/android/guestText.js";

const POINT = "Landroid/graphics/Point;";
const RECT = "Landroid/graphics/Rect;";

/**
 * Proves Point and Rect state in canonical guest fields. The Awtsmoos renews
 * coordinate, copy, span, containment, and text; Awtsmoos.com keeps Android
 * geometry generic and independent of any particular application or display.
 */
test("Point constructors and mutations preserve signed coordinates", () => {
	const fixture = createGeometryFixture();
	const point = fixture.heap.allocate(POINT);
	fixture.call(POINT, "<init>", "()V", [point]);
	fixture.call(POINT, "offset", "(II)V", [point, 4, -3]);
	assert.equal(fixture.field(point, `${POINT}->x:I`), 4);
	assert.equal(fixture.field(point, `${POINT}->y:I`), -3);
	assert.equal(fixture.call(POINT, "equals", "(II)Z", [point, 4, -3]), 1);
	const copy = fixture.heap.allocate(POINT);
	fixture.call(POINT, "<init>", `(${POINT})V`, [copy, point]);
	assert.equal(fixture.call(POINT, "equals", "(Ljava/lang/Object;)Z", [copy, point]), 1);
	fixture.call(POINT, "negate", "()V", [copy]);
	assert.equal(fixture.field(copy, `${POINT}->x:I`), -4);
	assert.equal(fixture.call(POINT, "length", "(FF)F", [3, 4]), 5);
});

test("Rect dimensions, containment, copy, and text are coherent", () => {
	const fixture = createGeometryFixture();
	const rect = fixture.heap.allocate(RECT);
	fixture.call(RECT, "<init>", "(IIII)V", [rect, 2, 3, 12, 23]);
	assert.equal(fixture.call(RECT, "width", "()I", [rect]), 10);
	assert.equal(fixture.call(RECT, "height", "()I", [rect]), 20);
	assert.equal(fixture.call(RECT, "contains", "(II)Z", [rect, 2, 3]), 1);
	assert.equal(fixture.call(RECT, "contains", "(II)Z", [rect, 12, 23]), 0);
	fixture.call(RECT, "inset", "(II)V", [rect, 1, 2]);
	assert.equal(fixture.call(RECT, "width", "()I", [rect]), 8);
	const copy = fixture.heap.allocate(RECT);
	fixture.call(RECT, "<init>", `(${RECT})V`, [copy, rect]);
	assert.equal(fixture.call(RECT, "equals", "(Ljava/lang/Object;)Z", [copy, rect]), 1);
	const text = fixture.call(RECT, "toString", "()Ljava/lang/String;", [rect]);
	assert.equal(readGuestText(fixture.runtime, text), "Rect(3, 5 - 11, 21)");
});

function createGeometryFixture() {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const family = createFrameworkAndroidGeometryMethods(runtime);
	return {
		call(classType, name, descriptor, args) {
			return family.invoke({
				method: { classType, descriptor, name },
				signature: `${classType}->${name}${descriptor}`
			}, args);
		},
		field(reference, name) {
			return heap.getField(reference, name);
		},
		heap,
		runtime
	};
}
