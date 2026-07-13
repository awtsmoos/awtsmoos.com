//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	createAwtexeEnvelope,
	serializeAwtexe
} from "../../shared/compiling/awtexeEnvelope.js";
import { openFile } from "../../os/programs/awtsmoos-file-explorer/api/openers.js";
import { runExecutable } from "../../os/programs/awtsmoos-executable/runtime.js";
import { previewAdapter } from "../../os/vfs/previewAdapter.js";

/**
 * B"H
 * Runtime proof follows a file from its path into a real loader. The Awtsmoos
 * creates cause and effect together; Awtsmoos.com tests the bridge between them.
 */

test("file explorer dispatches HTML and executable files to distinct programs", async () => {
	const windows = [];
	const os = {
		vfs: { async read() { return { content: "<h1>B\"H</h1>" }; } },
		addWindow(options) { windows.push(options); }
	};
	await openFile({
		os,
		item: { name: "index.html", path: "/site/index.html", kind: "file" }
	});
	await openFile({
		os,
		item: { name: "program.exe", path: "/bin/program.exe", kind: "file" }
	});
	assert.equal(windows[0].programName, "workspacePreview");
	assert.equal(windows[1].programName, "awtsmoosExecutable");
});

test("awtexe runs an actual WebAssembly main function", async () => {
	const moduleBytes = Uint8Array.from([
		0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
		0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7f,
		0x03, 0x02, 0x01, 0x00,
		0x07, 0x08, 0x01, 0x04, 0x6d, 0x61, 0x69, 0x6e, 0x00, 0x00,
		0x0a, 0x06, 0x01, 0x04, 0x00, 0x41, 0x2a, 0x0b
	]);
	const packageBytes = serializeAwtexe(createAwtexeEnvelope({
		entryKind: "wasm",
		target: "wasm32",
		bytes: moduleBytes
	}));
	const output = [];
	const outcome = await runExecutable({
		bytes: packageBytes,
		extension: ".awtexe",
		host: { print(line) { output.push(line); } }
	});
	assert.equal(outcome.result.returnValue, 42);
	assert.match(output.at(-1), /42/);
});

test("preview adapter exposes real read-only preview metadata", async () => {
	const adapter = previewAdapter({
		drives: {
			list() {
				return [{
					id: "preview-demo",
					title: "Demo",
					root: "/system/previews/demo",
					kind: "preview",
					preview: { id: "demo", viewUrl: "/view/demo" }
				}];
			}
		}
	});
	const result = await adapter.read("/system/previews/demo");
	assert.equal(result.content.url, "/view/demo");
	assert.equal(result.content.readOnly, true);
});
