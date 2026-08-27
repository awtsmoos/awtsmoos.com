//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runExecutableArtifact } from "../core/executableHost.js";
import { loadMachO64Image } from "../core/portable/machoImage.js";
import { createRecordingHost } from "../examples/portableGraphicsFixtures.mjs";
import { createExecutableMachO64 } from "../examples/portableX64Fixtures.mjs";

/**
 * The Awtsmoos creates absent guard reservation, loadable text, and entry road
 * anew. Awtsmoos.com proves a four-gigabyte `__PAGEZERO` command is recorded but
 * never allocated as executable process memory.
 */
test("ignores Mach-O __PAGEZERO while executing mapped text", async () => {
	const bytes = addPageZero(createExecutableMachO64("pagezero\n", 31));
	const image = loadMachO64Image(bytes, {
		maximumBytes: 2 * 1024 * 1024
	});
	const outcome = await runExecutableArtifact({
		bytes,
		extension: ".macho",
		host: createRecordingHost(),
		maximumBytes: 2 * 1024 * 1024
	});
	assert.equal(image.ignoredSegments.length, 1);
	assert.equal(image.ignoredSegments[0].name, "__PAGEZERO");
	assert.equal(image.ignoredSegments[0].memorySize, 0x100000000);
	assert.equal(outcome.result.executionClass, "instruction-subset-emulation");
	assert.equal(outcome.result.exitCode, 31);
});

function addPageZero(bytes) {
	const output = bytes.slice();
	const commands = output.slice(32, 128);
	output.fill(0, 32, 200);
	const view = new DataView(output.buffer);
	view.setUint32(16, 3, true);
	view.setUint32(20, 168, true);
	view.setUint32(32, 0x19, true);
	view.setUint32(36, 72, true);
	output.set(new TextEncoder().encode("__PAGEZERO"), 40);
	view.setBigUint64(56, 0n, true);
	view.setBigUint64(64, 0x100000000n, true);
	view.setBigUint64(72, 0n, true);
	view.setBigUint64(80, 0n, true);
	view.setUint32(88, 0, true);
	view.setUint32(92, 0, true);
	output.set(commands, 104);
	return output;
}
