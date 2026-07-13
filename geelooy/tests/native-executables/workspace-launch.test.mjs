//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
	openExplorerItem,
	openFile
} from "../../os/programs/awtsmoos-file-explorer/api/openers.js";

/**
 * The VFS launch test follows real bytes across File Explorer into the chosen
 * OS program. The Awtsmoos creates path, manifest, and inner executable together;
 * Awtsmoos.com verifies byte identity survives every doorway without suffix lies.
 */

const MACOS_X64_ARTIFACT = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/ai_thoughts/20260713T161824Z_native_executable_environment/verification/artifacts/macos-x64/awtsmoos-macos-x64-hello";

test("routes a real extensionless Mach-O to the executable host", async () => {
	const bytes = await readFile(MACOS_X64_ARTIFACT);
	const harness = createHarness({ "/workspace/hello": bytes });
	const response = await openFile({
		os: harness.os,
		item: { name: "hello", path: "/workspace/hello", kind: "file" }
	});
	assert.equal(response.artifactIdentity.format, "mach-o");
	assert.equal(response.descriptor.programName, "awtsmoosExecutable");
	assert.equal(harness.windows[0].detectedArchitecture, "x86_64");
});

test("opens unknown binary bytes in the existing binary viewer", async () => {
	const harness = createHarness({ "/workspace/mystery.bin": Uint8Array.from([1, 2, 3]) });
	const response = await openFile({
		os: harness.os,
		item: { name: "mystery.bin", path: "/workspace/mystery.bin", kind: "file" }
	});
	assert.equal(response.artifactIdentity.format, "unknown");
	assert.equal(response.descriptor.programName, "awtsmoosBinaryViewer");
	assert.equal(response.descriptor.intent, "inspect");
});

test("routes a shell launcher to the guarded command program", async () => {
	const harness = createHarness({ "/workspace/start.sh": "#!/bin/sh\necho guarded\n" });
	const response = await openFile({
		os: harness.os,
		item: { name: "start.sh", path: "/workspace/start.sh", kind: "file" }
	});
	assert.equal(response.descriptor.programName, "awtsmoosCommand");
	assert.equal(harness.windows[0].launcherPath, "/workspace/start.sh");
});

test("resolves an app bundle through Info.plist and real Mach-O bytes", async () => {
	const bytes = await readFile(MACOS_X64_ARTIFACT);
	const bundlePath = "/Applications/Awtsmoos.app";
	const harness = createHarness({
		[`${bundlePath}/Contents/Info.plist`]: plist("AwtsmoosMain"),
		[`${bundlePath}/Contents/MacOS/AwtsmoosMain`]: bytes
	});
	const response = await openExplorerItem({
		os: harness.os,
		navigate: async path => path,
		item: { name: "Awtsmoos.app", path: bundlePath, kind: "folder" }
	});
	assert.equal(response.descriptor.detectedFormat, "mach-o");
	assert.equal(harness.windows[0].programName, "awtsmoosExecutable");
	assert.equal(harness.windows[0].inspectOnly, true);
});

function createHarness(contents) {
	const windows = [];
	return {
		windows,
		os: {
			vfs: {
				async read(path) {
					if (!Object.hasOwn(contents, path)) {
						throw new Error(`missing_fixture:${path}`);
					}
					return contents[path];
				}
			},
			addWindow(options) {
				windows.push(options);
			}
		}
	};
}

function plist(executableName) {
	return `<?xml version="1.0"?><plist><dict><key>CFBundleExecutable</key><string>${executableName}</string></dict></plist>`;
}
