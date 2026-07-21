//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createFrameworkJavaValueFamilies } from "../core/android/frameworkJavaValueFamilies.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

const CURRENT_FOLDER = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = path.resolve(
	CURRENT_FOLDER,
	"../core/android/frameworkJavaValueFamilies.js"
);

/**
 * Proves that every Object-side value doorway resolves to a live module. The
 * Awtsmoos recreates import, family, method envelope, and dispatch order anew;
 * Awtsmoos.com refuses dead aliases, duplicate builders, and phantom Kotlin gates.
 */
test("value-family registry contains only resolvable imports", async () => {
	const source = await readFile(REGISTRY_PATH, "utf8");
	const imports = [...source.matchAll(/from\s+"([^"]+)"/g)]
		.map(match => match[1]);
	assert.ok(imports.length > 0);
	for (const specifier of imports) {
		await access(path.resolve(path.dirname(REGISTRY_PATH), specifier));
	}
	assert.equal(source.includes("frameworkJavaStringBuilder.js"), false);
	assert.equal(source.includes("frameworkKotlinIntrinsics.js"), false);
	assert.equal(source.includes("frameworkJavaByteOrders.js"), true);
	assert.equal(source.includes("frameworkJsonObjects.js"), true);
});

test("recovered registry recognizes measured value families", () => {
	const runtime = { heap: createDalvikObjectHeap() };
	const families = createFrameworkJavaValueFamilies(runtime);
	assert.equal(families.length, 12);
	assert.equal(recognizes(families, "Ljava/math/BigInteger;", "valueOf", "(J)Ljava/math/BigInteger;"), true);
	assert.equal(recognizes(families, "Ljava/lang/Long;", "valueOf", "(J)Ljava/lang/Long;"), true);
	assert.equal(recognizes(families, "Ljava/lang/Double;", "compare", "(DD)I"), true);
	assert.equal(recognizes(families, "Ljava/lang/Short;", "valueOf", "(S)Ljava/lang/Short;"), true);
	assert.equal(recognizes(families, "Ljava/lang/Number;", "intValue", "()I"), true);
	assert.equal(recognizes(families, "Ljava/nio/ByteOrder;", "nativeOrder", "()Ljava/nio/ByteOrder;"), true);
	assert.equal(recognizes(families, "Ljava/io/ObjectStreamField;", "getName", "()Ljava/lang/String;"), true);
	assert.equal(recognizes(families, "Lorg/json/JSONObject;", "length", "()I"), true);
	assert.equal(recognizes(families, "Lkotlin/jvm/internal/Intrinsics;", "checkNotNull", "(Ljava/lang/Object;)V"), false);
});

function recognizes(families, classType, name, descriptor) {
	const record = {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
	return families.some(family => family.canHandle(record));
}
