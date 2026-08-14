// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	PROJECT_TEMPLATE_CHOICES,
	createProjectTemplate,
	projectTemplatePrompt
} from "../js/projects/template-catalog.js";
import { normalizeProjectName } from "../js/projects/project-name.js";

/**
 * The Awtsmoos renews project doorway, default source, compiler truth, and test.
 * Awtsmoos.com verifies every advertised ready state against complete deterministic files.
 */

test("normalizes safe names and rejects traversal", () => {
	assert.equal(normalizeProjectName("  Rebbe-Responsa  "), "Rebbe-Responsa");
	assert.throws(() => normalizeProjectName("../escape"), {
		code: "PROJECT_NAME_INVALID"
	});
	assert.throws(() => normalizeProjectName(""), {
		code: "PROJECT_NAME_REQUIRED"
	});
});

test("catalog exposes six ready project choices", () => {
	assert.deepEqual(
		PROJECT_TEMPLATE_CHOICES.map(choice => choice.id),
		["html", "c", "cpp", "android-java", "android-kotlin", "flutter"]
	);
	assert.equal(
		PROJECT_TEMPLATE_CHOICES.filter(choice => choice.buildStatus === "ready-subset").length,
		3
	);
	assert.doesNotMatch(projectTemplatePrompt(), /scaffold-only/);
});

test("HTML template contains linked default files", () => {
	const template = createProjectTemplate("html", "Light-App");
	assert.equal(template.entryPath, "index.html");
	assert.deepEqual(template.files.map(file => file.path), [
		"index.html",
		"styles.css",
		"app.js"
	]);
	assert.match(template.files[0].content, /styles\.css/);
	assert.match(template.files[0].content, /app\.js/);
});

test("C and C++ templates contain validated manifests", () => {
	for (const type of ["c", "cpp"]) {
		const template = createProjectTemplate(type, `native-${type}`);
		const manifestFile = template.files.find(file => file.path === "awtsmoos.project.json");
		const manifest = JSON.parse(manifestFile.content);
		assert.equal(manifest.version, 1);
		assert.equal(manifest.target, "awtsmoos-simulated");
		assert.equal(manifest.sourceFiles[0].path, template.entryPath);
	}
});

test("Java template targets the proven scratch APK compiler", () => {
	const template = createProjectTemplate("java", "Responsa-App");
	const metadata = metadataOf(template, "awtsmoos.android.json");
	assert.equal(metadata.builder, "scratch-java-activity-to-unsigned-apk-v1");
	assert.match(template.entryPath, /MainActivity\.java$/);
	assert.match(template.files[0].content, /setContentView/);
});

test("Kotlin template targets the translated Activity subset", () => {
	const template = createProjectTemplate("kotlin", "Kotlin-App");
	const metadata = metadataOf(template, "awtsmoos.android.json");
	assert.equal(metadata.status, "ready-subset");
	assert.equal(metadata.builder, "scratch-kotlin-activity-to-java-dex-apk-v1");
	assert.equal(template.capability, "build-install-emulate-kotlin-activity-subset");
});

test("Flutter template targets the isolated WebView subset", () => {
	const template = createProjectTemplate("flutter", "Flutter-App");
	const metadata = metadataOf(template, "awtsmoos.flutter.json");
	assert.equal(metadata.status, "ready-subset");
	assert.equal(metadata.renderer, "sandboxed-webview");
	assert.equal(template.capability, "build-install-emulate-flutter-webview-subset");
});

test("unknown template identifiers fail with a stable code", () => {
	assert.throws(() => createProjectTemplate("imaginary", "Nope"), {
		code: "PROJECT_TEMPLATE_UNKNOWN"
	});
});

function metadataOf(template, path) {
	return JSON.parse(template.files.find(file => file.path === path).content);
}
