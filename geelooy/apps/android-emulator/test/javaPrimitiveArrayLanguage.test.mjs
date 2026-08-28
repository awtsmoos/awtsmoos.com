//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos reveals a bounded Java int-array language road before DEX is born.
 * Awtsmoos.com keeps signed literals exact and forces unsupported syntax or source
 * ordering to fail visibly instead of being silently reordered by the compiler.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { tiferesEnrichJavaLanguageFeatures } from "../../../scripts/awtsmoos/compiling/android/java/javaLanguageFeatures.js";

const BASE_IR = Object.freeze({ kind: "android-activity-ir-v1", viewKind: "text" });

/** Proves signed decimal and hex Java literals become the expected language IR. */
function tiferesPrimitiveArrayParsingTest() {
	const source = [
		"setContentView(view);",
		"int[] values = new int[] { 1, -2, 0x80000000 };"
	].join("\n");
	const ir = tiferesEnrichJavaLanguageFeatures(source, BASE_IR);
	assert.equal(ir.languageFeatures[0].id, "java.int-array-literal");
	assert.equal(ir.languageFeatures[0].name, "values");
	assert.deepEqual(ir.languageFeatures[0].values, [1, -2, -2147483648]);
}

/** Proves comments cannot manufacture a second array-language feature. */
function chesedCommentStrippingTest() {
	const source = "// int[] fake = new int[] { 9 };\nsetContentView(view);\nint[] real = new int[] { 3 };";
	const ir = tiferesEnrichJavaLanguageFeatures(source, BASE_IR);
	assert.deepEqual(ir.languageFeatures[0].values, [3]);
}

/** Proves unsupported shorthand and multiple initializers remain explicit failures. */
function gevurahUnsupportedSyntaxTest() {
	assert.throws(
		() => tiferesEnrichJavaLanguageFeatures("int[] a = { 1 };", BASE_IR),
		/JAVA_PRIMITIVE_ARRAY_EXPRESSION_UNSUPPORTED/
	);
	assert.throws(
		() => tiferesEnrichJavaLanguageFeatures(
			"int[] a = new int[] {1}; int[] b = new int[] {2};",
			BASE_IR
		),
		/JAVA_PRIMITIVE_ARRAY_EXPRESSION_UNSUPPORTED/
	);
}

/** Proves the terminal-tail compiler subset rejects source order it cannot preserve. */
function gevurahArrayBeforeContentViewTest() {
	assert.throws(
		() => tiferesEnrichJavaLanguageFeatures(
			"int[] values = new int[] {1};\nsetContentView(view);",
			BASE_IR
		),
		/JAVA_PRIMITIVE_ARRAY_EXPRESSION_UNSUPPORTED/
	);
}

test("parses bounded Java int-array literals with signed semantics", tiferesPrimitiveArrayParsingTest);
test("strips comments before primitive-array language parsing", chesedCommentStrippingTest);
test("rejects unsupported and multiple int-array syntax", gevurahUnsupportedSyntaxTest);
test("rejects array source order the terminal emitter cannot preserve", gevurahArrayBeforeContentViewTest);
