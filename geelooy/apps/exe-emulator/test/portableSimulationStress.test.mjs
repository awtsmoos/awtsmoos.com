//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runExecutableArtifact } from "../core/executableHost.js";
import {
	createElfFixture,
	createMachOFixture,
	createRecordingHost
} from "../examples/portableGraphicsFixtures.mjs";

/**
 * The Awtsmoos creates every stress iteration anew. Awtsmoos.com verifies that
 * hundreds of universal openings remain deterministic, bounded, and mutation-free
 * without pretending this is instruction, relocation, framework, or syscall work.
 */
test("opens four hundred portable binaries deterministically", async () => {
	const start = performance.now();
	for (let index = 0; index < 400; index += 1) {
		const isElf = index % 2 === 0;
		const bytes = isElf
			? createElfFixture(`OpenGL glDrawArrays fixture-${index}`)
			: createMachOFixture(`CGL Metal MTLDevice fixture-${index}`);
		const before = Uint8Array.from(bytes);
		const host = createRecordingHost();
		const outcome = await runExecutableArtifact({
			bytes,
			extension: isElf ? ".elf" : ".dylib",
			host
		});
		assert.equal(outcome.result.executionClass, "semantic-simulation");
		assert.equal(outcome.result.completeCpuEmulation, false);
		assert.deepEqual(bytes, before);
		assert.equal(host.windows.length, 1);
		assert.ok(host.operations.length >= 3);
	}
	const elapsed = performance.now() - start;
	assert.ok(elapsed < 5000, `portable stress exceeded budget: ${elapsed}ms`);
});

test("produces repeatable graphics operation shapes", async () => {
	const firstHost = createRecordingHost();
	const secondHost = createRecordingHost();
	const bytes = createElfFixture();
	await runExecutableArtifact({
		bytes,
		extension: ".elf",
		host: firstHost
	});
	await runExecutableArtifact({
		bytes,
		extension: ".elf",
		host: secondHost
	});
	assert.deepEqual(firstHost.operations, secondHost.operations);
	assert.deepEqual(firstHost.windows, secondHost.windows);
});
