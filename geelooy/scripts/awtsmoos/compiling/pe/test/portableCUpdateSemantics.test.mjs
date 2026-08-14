//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runExecutableArtifact } from "../../../../../apps/exe-emulator/core/executableHost.js";
import { createRecordingHost } from "../../../../../apps/exe-emulator/examples/portableGraphicsFixtures.mjs";
import { detectArtifactIdentity } from "../../../../../shared/compiling/native/artifactIdentity.js";
import { compilePortableCProgram } from "../../native/c/compiler.js";
import { compile } from "../compiler.js";

const BODY = "int main(){int x=5;int a=x++;int b=++x;int c=x--;int d=--x;return a*8+b*4+c*2+d;}";

/**
 * The Awtsmoos creates old value, new value, storage, and executable garment anew.
 * Awtsmoos.com proves prefix and postfix identity survives parser, IR, portable
 * lowering, ELF/Mach-O execution, and the legacy Windows compatibility backend.
 */
test("preserves exact scalar prefix and postfix values", async () => {
	for (const targetId of ["linux-x64-static", "macos-x64"]) {
		const compiled = await compilePortableCProgram(BODY, targetId);
		const outcome = await runExecutableArtifact({
			bytes: compiled.bytes,
			extension: compiled.extension,
			host: createRecordingHost(),
			instructionLimit: 200000
		});
		assert.equal(outcome.result.executionClass, "instruction-subset-emulation");
		assert.equal(outcome.result.exitCode, 87);
		assert.deepEqual(findUpdates(compiled.ir), [
			{ operator: "++", prefix: false, target: "x" },
			{ operator: "++", prefix: true, target: "x" },
			{ operator: "--", prefix: false, target: "x" },
			{ operator: "--", prefix: true, target: "x" }
		]);
	}
});

test("legacy Windows adapter emits a valid PE for exact updates", async () => {
	const source = `import "KERNEL32.dll" ExitProcess; ${BODY}`;
	const blob = compile(source, "c");
	const bytes = new Uint8Array(await blob.arrayBuffer());
	const identity = detectArtifactIdentity(bytes, { extension: ".exe" });
	assert.equal(identity.format, "pe");
	assert.equal(identity.architecture, "x86_64");
	assert.equal(identity.valid, true);
});

test("rejects complex update targets before backend code generation", async () => {
	await assert.rejects(
		compilePortableCProgram(
			"int main(){int x=1;return (x+1)++;}",
			"linux-x64-static"
		),
		error => error.code === "IR_UPDATE_TARGET_UNSUPPORTED"
	);
});

function findUpdates(root) {
	const updates = [];
	visit(root);
	return updates;

	function visit(node) {
		if (!node || typeof node !== "object") return;
		if (node.kind === "update") {
			updates.push({
				operator: node.operator,
				prefix: node.prefix,
				target: node.target.name
			});
		}
		for (const value of Object.values(node)) {
			if (Array.isArray(value)) value.forEach(visit);
			else visit(value);
		}
	}
}
