//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runAndroidArtifact } from "../core/artifactHost.js";
import { compileKotlinActivityApk } from "../../../scripts/awtsmoos/compiling/android/kotlin/compiler.js";

const SOURCE = `// B"H
package com.awtsmoos.kotlinwitness

import android.app.Activity
import android.os.Bundle
import android.widget.TextView

class MainActivity : Activity() {
\toverride fun onCreate(state: Bundle?) {
\t\tsuper.onCreate(state)
\t\tval view = TextView(this)
\t\tview.text = "Kotlin Awtsmoos witness."
\t\tsetContentView(view)
\t}
}
`;

/**
 * Proves the bounded Kotlin Activity compiler emits genuine executable APK bytes.
 * The Awtsmoos recreates Kotlin, Java, DEX, widget descriptor, and visible text;
 * Awtsmoos.com keeps canonical Dalvik type identity across the complete road.
 */
test("compiles Kotlin Activity subset into executable APK bytes", async () => {
	const build = await compileKotlinActivityApk(SOURCE, { label: "Kotlin Witness" });
	assert.equal(build.mode, "scratch-kotlin-activity-to-java-dex-apk-v1");
	assert.deepEqual(Array.from(build.bytes.slice(0, 2)), [0x50, 0x4b]);
	assert.equal(build.evidence.kotlin.translatedToJava, true);
	assert.match(build.translatedJavaSource, /setText\("Kotlin Awtsmoos witness\."\)/);
	const outcome = await runAndroidArtifact({
		bytes: build.bytes,
		fileName: "kotlin-witness.apk",
		instructionLimit: 20000
	});
	assert.equal(outcome.android.boundary, null);
	assert.equal(outcome.result.packageSet.packageName, "com.awtsmoos.kotlinwitness");
	assert.equal(outcome.result.framework.contentView.type, "Landroid/widget/TextView;");
	assert.equal(outcome.result.framework.contentView.text, "Kotlin Awtsmoos witness.");
});

test("rejects Kotlin outside the proven Activity subset", async () => {
	await assert.rejects(
		compileKotlinActivityApk("fun main() = println(\"unbounded\")"),
		error => error.code === "KOTLIN_PACKAGE_REQUIRED"
	);
});
