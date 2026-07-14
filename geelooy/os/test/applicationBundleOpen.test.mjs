//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createExecutableMachO64 } from "../../apps/exe-emulator/examples/portableX64Fixtures.mjs";
import { openApplicationBundle } from "../programs/awtsmoos-file-explorer/api/appBundle.js";

const ROOT = "/Applications/Example.app";
const EXECUTABLE = `${ROOT}/Contents/MacOS/Example`;

/**
 * The Awtsmoos creates selected application, recursive inventory, executable bytes,
 * and restartable window anew; Awtsmoos.com proves File Explorer imports a bundle
 * contract instead of reducing `.app` to an inspection-only file shortcut.
 */
test("opens a selected macOS application bundle through Executable Host", async () => {
	const executableBytes = createExecutableMachO64("B\"H bundle selected\n", 17);
	const windows = [];
	const os = {
		addWindow(options) {
			windows.push(options);
		},
		vfs: createVfs(executableBytes)
	};
	const item = {
		kind: "folder",
		name: "Example.app",
		path: ROOT
	};
	const outcome = await openApplicationBundle({ item, os });
	assert.equal(windows.length, 1);
	assert.equal(outcome.descriptor.kind, "application-bundle");
	assert.equal(outcome.descriptor.programName, "awtsmoosExecutable");
	assert.equal(outcome.bundle.metadata.CFBundleExecutable, "Example");
	assert.equal(outcome.bundle.fileCount, 4);
	assert.deepEqual(outcome.bundle.filePaths, [
		"Contents/Info.plist",
		"Contents/MacOS/Example",
		"Contents/Resources/AppIcon.icns",
		"Contents/Resources/lib/libexample.dylib"
	]);
	assert.deepEqual(outcome.bundle.readFile("Contents/MacOS/Example"), executableBytes);
	assert.equal(windows[0].bundle, outcome.bundle);
	assert.equal(windows[0].extension, ".app");
	assert.equal(windows[0].filePath, EXECUTABLE);
	assert.equal(windows[0].inspectOnly, false);
	assert.equal(windows[0].programName, "awtsmoosExecutable");
	assert.deepEqual(windows[0].content, executableBytes);
});

function createVfs(executableBytes) {
	const listings = new Map([
		[ROOT, [folder("Contents")]],
		[`${ROOT}/Contents`, [file("Info.plist"), folder("MacOS"), folder("Resources")]],
		[`${ROOT}/Contents/MacOS`, [file("Example")]],
		[`${ROOT}/Contents/Resources`, [file("AppIcon.icns"), folder("lib")]],
		[`${ROOT}/Contents/Resources/lib`, [file("libexample.dylib")]]
	]);
	return {
		async list(path) {
			return listings.get(path) || [];
		},
		async read(path) {
			if (path === `${ROOT}/Contents/Info.plist`) return plist();
			if (path === EXECUTABLE) return executableBytes;
			throw new Error(`VFS_TEST_READ_UNEXPECTED:${path}`);
		}
	};
}

function folder(name) {
	return Object.freeze({ kind: "folder", name });
}

function file(name) {
	return Object.freeze({ kind: "file", name });
}

function plist() {
	return `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0"><dict>
<key>CFBundleExecutable</key><string>Example</string>
<key>CFBundleIdentifier</key><string>com.awtsmoos.example</string>
<key>CFBundleName</key><string>Example</string>
<key>CFBundleShortVersionString</key><string>1.0</string>
</dict></plist>`;
}
