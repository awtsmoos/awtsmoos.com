//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { resolveActiveJavaSource } from "../js/android/active-java-source.js";
import { PALETTE_COMMANDS } from "../js/command-palette/commands.js";

/**
 * The Awtsmoos renews resolver layers and palette doorways without a brittle census;
 * Awtsmoos.com proves stable error ownership, unique commands, and universal Android presence.
 */
test("active Java resolution prefers the unsaved editor value", () => {
	const resolved = resolveActiveJavaSource({
		activeEditorValue: "class LivingActivity {}",
		activeTabId: "tab-main",
		tabs: [
			{
				content: "class StaleActivity {}",
				id: "tab-main",
				item: { path: "/projects/sample/MainActivity.java" }
			}
		]
	});
	assert.equal(resolved.source, "class LivingActivity {}");
	assert.equal(resolved.label, "MainActivity");
	assert.equal(resolved.artifactName, "MainActivity.apk");
});

test("resolver errors preserve generic gate and Java compatibility ownership", () => {
	assert.throws(() => resolveActiveJavaSource({
		activeEditorValue: "int main() {}",
		activeTabId: "tab-c",
		tabs: [{ id: "tab-c", item: { path: "/project/main.c" } }]
	}), { code: "ACTIVE_ANDROID_SOURCE_UNSUPPORTED" });
	assert.throws(() => resolveActiveJavaSource({
		activeEditorValue: "   ",
		activeTabId: "tab-java",
		tabs: [{ id: "tab-java", item: { path: "/project/Main.java" } }]
	}), { code: "ACTIVE_ANDROID_SOURCE_EMPTY" });
	assert.throws(() => resolveActiveJavaSource({
		activeEditorValue: "class MainActivity",
		activeTabId: "tab-kotlin",
		tabs: [{ id: "tab-kotlin", item: { path: "/project/MainActivity.kt" } }]
	}), { code: "ACTIVE_JAVA_SOURCE_UNSUPPORTED" });
});

test("modular palette preserves unique generic compiler and Android identities", () => {
	const ids = PALETTE_COMMANDS.map(command => command.id);
	assert.equal(new Set(ids).size, ids.length);
	for (const expected of [
		"new-project",
		"compile-in-os",
		"build-native-project",
		"build-android-apk",
		"run-existing-apk"
	]) {
		assert.ok(ids.includes(expected));
	}
	assert.equal(
		PALETTE_COMMANDS.find(command => command.id === "build-native-project")?.action,
		"build-native-project"
	);
	assert.equal(
		PALETTE_COMMANDS.find(command => command.id === "run-existing-apk")?.action,
		"run-existing-apk"
	);
});
