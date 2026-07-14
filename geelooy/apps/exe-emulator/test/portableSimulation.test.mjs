//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runExecutableArtifact } from "../core/executableHost.js";

/**
 * The Awtsmoos creates ELF, Mach-O, loader truth, and visible possibility anew.
 * Awtsmoos.com verifies universal opening without renaming semantic simulation as
 * instruction execution, native launch, relocation processing, or syscall work.
 */
test("opens ELF graphics intent through semantic WebGL translation", async () => {
	const host = recordingHost();
	const outcome = await runExecutableArtifact({
		bytes: elfFixture("OpenGL glDrawArrays EGL_CreateContext"),
		extension: ".elf",
		host
	});
	assert.equal(outcome.identity.format, "elf");
	assert.equal(outcome.result.executionClass, "semantic-simulation");
	assert.equal(outcome.result.completeCpuEmulation, false);
	assert.equal(outcome.result.graphics.translation, "native-graphics-hints-to-webgl");
	assert.ok(outcome.result.graphics.apis.includes("opengl"));
	assert.ok(host.operations.some(operation => operation.type === "opengl-triangles"));
	assert.equal(host.windows.length, 1);
});

test("opens Mach-O graphics intent without claiming Cocoa execution", async () => {
	const host = recordingHost();
	const outcome = await runExecutableArtifact({
		bytes: machOFixture("CGL OpenGL CAMetalLayer MTLDevice"),
		extension: ".dylib",
		host
	});
	assert.equal(outcome.identity.format, "mach-o");
	assert.equal(outcome.result.executionClass, "semantic-simulation");
	assert.ok(outcome.result.graphics.apis.includes("opengl"));
	assert.ok(outcome.result.graphics.apis.includes("metal"));
	assert.match(outcome.result.unsupportedBoundary, /Cocoa frameworks/);
});

test("preserves loader inspection when inspectOnly is requested", async () => {
	const host = recordingHost();
	const outcome = await runExecutableArtifact({
		bytes: elfFixture("OpenGL"),
		extension: ".elf",
		host,
		inspectOnly: true
	});
	assert.equal(outcome.result.mode, "loader-inspection");
	assert.equal(outcome.result.executionSupported, false);
	assert.equal(host.windows.length, 0);
	assert.equal(host.operations.length, 0);
});

function recordingHost() {
	const operations = [];
	const prints = [];
	const windows = [];
	return {
		operations,
		prints,
		windows,
		draw(operation) {
			operations.push(operation);
		},
		openWindow(title, body) {
			windows.push({ body, title });
		},
		print(message) {
			prints.push(message);
		}
	};
}

function elfFixture(text) {
	const bytes = new Uint8Array(64 + text.length);
	bytes.set([0x7f, 0x45, 0x4c, 0x46, 2, 1, 1, 3]);
	const view = new DataView(bytes.buffer);
	view.setUint16(16, 2, true);
	view.setUint16(18, 62, true);
	view.setBigUint64(24, 0x401000n, true);
	writeAscii(bytes, 64, text);
	return bytes;
}

function machOFixture(text) {
	const bytes = new Uint8Array(32 + text.length);
	bytes.set([0xcf, 0xfa, 0xed, 0xfe]);
	const view = new DataView(bytes.buffer);
	view.setUint32(4, 0x01000007, true);
	view.setUint32(16, 2, true);
	writeAscii(bytes, 32, text);
	return bytes;
}

function writeAscii(bytes, offset, text) {
	for (let index = 0; index < text.length; index += 1) {
		bytes[offset + index] = text.charCodeAt(index);
	}
}
