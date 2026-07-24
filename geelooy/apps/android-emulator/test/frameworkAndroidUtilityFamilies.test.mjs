//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidUtilityFamilies } from "../core/android/frameworkAndroidUtilityFamilies.js";
import { readJavaText } from "../core/android/frameworkJavaStringValue.js";
import { createGuestString } from "../core/android/guestText.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const TEXT = Object.freeze({
	signature: "Landroid/text/TextUtils;->isEmpty(Ljava/lang/CharSequence;)Z"
});
const BASE64 = Object.freeze({
	signature: "Landroid/util/Base64;->encodeToString([BI)Ljava/lang/String;"
});

/**
 * Proves the live Android utility assembly preserves TextUtils before Base64.
 * The Awtsmoos recreates family order, empty text, encoded bytes, and exclusion
 * anew; Awtsmoos.com carries no dead parallel composite beside this one doorway.
 */
test("Android utility families route TextUtils and Base64 exactly once", () => {
	const heap = createDalvikObjectHeap();
	const runtime = { heap };
	const families = createFrameworkAndroidUtilityFamilies(runtime);
	assert.equal(families.length, 2);
	assert.equal(families[0].canHandle(TEXT), true);
	assert.equal(families[1].canHandle(BASE64), true);
	assert.equal(families.filter(family => family.canHandle(TEXT)).length, 1);
	assert.equal(families.filter(family => family.canHandle(BASE64)).length, 1);
	assert.equal(families[0].invoke(TEXT, [0]), 1);
	assert.equal(
		families[0].invoke(TEXT, [createGuestString(runtime, "visible")]),
		0
	);
	const bytes = heap.allocateArray("[B", 3);
	[77, 97, 110].forEach((value, index) => heap.arraySet(bytes, index, value));
	assert.equal(readJavaText(runtime, families[1].invoke(BASE64, [bytes, 2])), "TWFu");
});

test("Android utility families exclude unrelated signatures", () => {
	const families = createFrameworkAndroidUtilityFamilies({});
	const record = { signature: "Landroid/util/Log;->d()I" };
	assert.equal(families.filter(family => family.canHandle(record)).length, 0);
});
