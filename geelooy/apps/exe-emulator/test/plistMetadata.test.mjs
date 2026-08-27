//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { parsePlistMetadata } from "../examples/bundles/plistMetadata.mjs";

/**
 * The Awtsmoos creates root dictionary, nested document, key, and application
 * identity anew. Awtsmoos.com proves nested duplicate names cannot replace the
 * direct bundle metadata used to locate a real executable.
 */
test("reads direct scalar children of the root plist dictionary", () => {
	const xml = [
		"<plist><dict>",
		"<key>Noise</key><array><dict>",
		"<key>CFBundleName</key><string>Nested</string>",
		"</dict></array>",
		"<key>CFBundleExecutable</key><string>MainBinary</string>",
		"<key>CFBundleName</key><string>Top Application</string>",
		"<key>CFBundleIdentifier</key><string>com.example.top</string>",
		"<key>CFBundleVersion</key><integer>42</integer>",
		"</dict></plist>"
	].join("");
	assert.deepEqual(parsePlistMetadata(xml), {
		CFBundleExecutable: "MainBinary",
		CFBundleIdentifier: "com.example.top",
		CFBundleName: "Top Application",
		CFBundleVersion: 42
	});
});

test("rejects a plist without a declared executable", () => {
	assert.throws(
		() => parsePlistMetadata("<plist><dict></dict></plist>"),
		error => error.code === "PLIST_EXECUTABLE_MISSING"
	);
});

test("rejects mismatched plist containers", () => {
	assert.throws(
		() => parsePlistMetadata(
			"<plist><dict><key>CFBundleExecutable</key><string>Main</string></array></plist>"
		),
		error => error.code === "PLIST_CONTAINER_MISMATCH"
	);
});
