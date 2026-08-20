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
 * Proves every Object-side value doorway resolves to one live family. The
 * Awtsmoos recreates import, method envelope, and dispatch anew; Awtsmoos.com
 * rejects dead aliases and duplicate claims instead of trusting a magic count.
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
	assert.equal(source.includes("frameworkJavaFloats.js"), true);
	assert.equal(source.includes("frameworkJavaByteOrders.js"), true);
	assert.equal(source.includes("frameworkJsonObjects.js"), true);
});

test("recovered registry routes every measured value family exactly once", () => {
	const runtime = { heap: createDalvikObjectHeap() };
	const families = createFrameworkJavaValueFamilies(runtime);
	const measured = [
		["Ljava/math/BigInteger;", "valueOf", "(J)Ljava/math/BigInteger;"],
		["Ljava/lang/Boolean;", "valueOf", "(Z)Ljava/lang/Boolean;"],
		["Ljava/lang/Float;", "valueOf", "(F)Ljava/lang/Float;"],
		["Ljava/lang/Double;", "compare", "(DD)I"],
		["Ljava/lang/Short;", "valueOf", "(S)Ljava/lang/Short;"],
		["Ljava/lang/Number;", "intValue", "()I"],
		["Ljava/nio/ByteOrder;", "nativeOrder", "()Ljava/nio/ByteOrder;"],
		["Ljava/io/ObjectStreamField;", "getName", "()Ljava/lang/String;"],
		["Lorg/json/JSONObject;", "length", "()I"]
	];
	for (const [classType, name, descriptor] of measured) {
		assert.equal(claimCount(families, classType, name, descriptor), 1);
	}
	assert.equal(
		claimCount(families, "Lkotlin/jvm/internal/Intrinsics;", "checkNotNull", "(Ljava/lang/Object;)V"),
		0
	);
});

function claimCount(families, classType, name, descriptor) {
	const record = {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
	return families.filter(family => family.canHandle(record)).length;
}
