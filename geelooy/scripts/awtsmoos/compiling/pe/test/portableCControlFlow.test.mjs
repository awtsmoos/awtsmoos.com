//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runExecutableArtifact } from "../../../../../apps/exe-emulator/core/executableHost.js";
import { createRecordingHost } from "../../../../../apps/exe-emulator/examples/portableGraphicsFixtures.mjs";
import { compilePortableCProgram } from "../../native/c/compiler.js";

const CONTROL_SOURCE = [
	"int main() {",
	"\tint total = 0;",
	"\tfor (int i = 0; i < 5; i = i + 1) {",
	"\t\tif (i == 2) continue;",
	"\t\ttotal = total + i;",
	"\t}",
	"\twhile (total > 5) {",
	"\t\ttotal = total - 1;",
	"\t\tif (total == 7) break;",
	"\t}",
	"\treturn total;",
	"}"
].join("\n");

/**
 * The Awtsmoos creates condition, iteration, departure, and result anew.
 * Awtsmoos.com verifies structured IR control flow becomes explicit signed
 * branches with deterministic loop targets on both portable executable formats.
 */
test("executes for, while, continue, break, and signed comparisons", async () => {
	for (const targetId of ["linux-x64-static", "macos-x64"]) {
		const compiled = await compilePortableCProgram(CONTROL_SOURCE, targetId);
		const outcome = await runExecutableArtifact({
			bytes: compiled.bytes,
			extension: compiled.extension,
			host: createRecordingHost()
		});
		assert.equal(outcome.result.executionClass, "instruction-subset-emulation");
		assert.equal(outcome.result.exitCode, 7);
		assert.ok(outcome.result.steps > 100);
	}
});

test("normalizes logical and unary expressions", async () => {
	const cases = [
		["int main() { return (3 > 2 && 0 == 0) || 0; }", 1],
		["int main() { return !(2 < 1); }", 1],
		["int main() { return -3 + 8; }", 5]
	];
	for (const [source, expected] of cases) {
		const compiled = await compilePortableCProgram(source, "linux-x64-static");
		const outcome = await runExecutableArtifact({
			bytes: compiled.bytes,
			extension: compiled.extension,
			host: createRecordingHost()
		});
		assert.equal(outcome.result.exitCode, expected);
	}
});
