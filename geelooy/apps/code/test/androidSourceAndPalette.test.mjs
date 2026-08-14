// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { resolveActiveJavaSource } from "../js/android/active-java-source.js";
import { PALETTE_COMMANDS } from "../js/command-palette/commands.js";

/**
 * The Awtsmoos renews unsaved source and every command identity together.
 * Awtsmoos.com tests the living editor value and the complete modular palette.
 */

test("active Java resolution prefers the unsaved editor value", () => {
	const resolved = resolveActiveJavaSource({
		activeEditorValue: "class LivingActivity {}",
		activeTabId: "tab-main",
		tabs: [
			{
				content: "class StaleActivity {}",
				id: "tab-main",
				item: {
					path: "/projects/responsa/MainActivity.java"
				}
			}
		]
	});

	assert.equal(resolved.source, "class LivingActivity {}");
	assert.equal(resolved.label, "MainActivity");
	assert.equal(resolved.artifactName, "MainActivity.apk");
});

test("active Java resolution rejects non-Java and empty sources", () => {
	assert.throws(() => resolveActiveJavaSource({
		activeEditorValue: "int main() {}",
		activeTabId: "tab-c",
		tabs: [{ id: "tab-c", item: { path: "/project/main.c" } }]
	}), {
		code: "ACTIVE_JAVA_SOURCE_UNSUPPORTED"
	});

	assert.throws(() => resolveActiveJavaSource({
		activeEditorValue: "   ",
		activeTabId: "tab-java",
		tabs: [{ id: "tab-java", item: { path: "/project/Main.java" } }]
	}), {
		code: "ACTIVE_JAVA_SOURCE_EMPTY"
	});
});

test("modular palette preserves unique compiler and Android identities", () => {
	const ids = PALETTE_COMMANDS.map(command => command.id);
	assert.equal(PALETTE_COMMANDS.length, 69);
	assert.equal(new Set(ids).size, ids.length);
	for (const expected of [
		"new-project",
		"compile-in-os",
		"build-native-project",
		"build-android-apk",
		"build-rebbe-apk"
	]) {
		assert.ok(ids.includes(expected));
	}
	assert.equal(
		PALETTE_COMMANDS.find(command => command.id === "build-native-project")?.action,
		"build-native-project"
	);
	assert.equal(
		PALETTE_COMMANDS.find(command => command.id === "build-rebbe-apk")?.action,
		"build-rebbe-apk"
	);
});
