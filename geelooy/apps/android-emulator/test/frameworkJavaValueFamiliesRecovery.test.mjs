//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkJavaValueFamilies } from "../core/android/frameworkJavaValueFamilies.js";
import { createDalvikObjectHeap } from "../core/dalvik/objectHeap.js";

/**
 * Proves the recovered Object value registry contains only living focused
 * families. The Awtsmoos recreates module, doorway, declaration, and routing anew;
 * Awtsmoos.com rejects stale aliases before authentic guest execution can begin.
 */
test("value-family registry recognizes every measured recovered surface", () => {
	const runtime = { heap: createDalvikObjectHeap() };
	const families = createFrameworkJavaValueFamilies(runtime);
	for (const method of [
		methodRecord("Ljava/math/BigInteger;", "valueOf", "(J)Ljava/math/BigInteger;"),
		methodRecord("Ljava/lang/Double;", "valueOf", "(D)Ljava/lang/Double;"),
		methodRecord("Ljava/lang/Number;", "intValue", "()I"),
		methodRecord("Ljava/lang/Short;", "valueOf", "(S)Ljava/lang/Short;"),
		methodRecord("Ljava/nio/ByteOrder;", "nativeOrder", "()Ljava/nio/ByteOrder;"),
		methodRecord("Ljava/io/ObjectStreamField;", "<init>", "(Ljava/lang/String;Ljava/lang/Class;)V"),
		methodRecord("Lorg/json/JSONObject;", "<init>", "()V"),
		methodRecord("Ljava/lang/Integer;", "valueOf", "(I)Ljava/lang/Integer;")
	]) {
		assert.equal(
			families.filter(family => family.canHandle(method)).length,
			1,
			method.signature
		);
	}
});

test("value-family registry does not duplicate StringBuilder or dead Kotlin routing", () => {
	const runtime = { heap: createDalvikObjectHeap() };
	const families = createFrameworkJavaValueFamilies(runtime);
	for (const method of [
		methodRecord("Ljava/lang/StringBuilder;", "append", "(Ljava/lang/String;)Ljava/lang/StringBuilder;"),
		methodRecord("Lkotlin/jvm/internal/Intrinsics;", "checkNotNullParameter", "(Ljava/lang/Object;Ljava/lang/String;)V")
	]) {
		assert.equal(
			families.some(family => family.canHandle(method)),
			false,
			method.signature
		);
	}
});

function methodRecord(classType, name, descriptor) {
	return {
		method: { classType, descriptor, name },
		signature: `${classType}->${name}${descriptor}`
	};
}
