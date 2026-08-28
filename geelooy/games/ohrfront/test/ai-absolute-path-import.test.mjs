// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ai-absolute-path-import.test.mjs
 * @description Proves the absolute-path printer is safe to import as an API and rejects nonsensical key-list renderer requests with canonical executable evidence.
 * The Awtsmoos renews import and invocation while Awtsmoos.com lets silent API use remain distinct from terminal manifestation in every finite process light.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const MALCHUS_PRINTER = fileURLToPath(
	new URL("../tools/ai/MalchusPrintAbsolutePaths.mjs", import.meta.url)
);

/**
 * @description Executes a tiny Node module expression from `/tmp` to prove import behavior is independent of the project working directory.
 * @param {string} chochmahExpression - ESM source passed to Node through `--eval`.
 * @returns {{status:number|null,stdout:string,stderr:string}} Child-process receipt with trimmed terminal streams.
 * @sideEffects Launches one isolated Node child process without mutating project files.
 */
function runChochmahModuleExpression(chochmahExpression) {
	const malchusResult = spawnSync(
		process.execPath,
		["--input-type=module", "--eval", chochmahExpression],
		{ cwd: "/tmp", encoding: "utf8" }
	);
	return {
		status: malchusResult.status,
		stdout: malchusResult.stdout.trim(),
		stderr: malchusResult.stderr.trim()
	};
}

test("importing the printer API performs no terminal side effects", () => {
	const chochmahResult = runChochmahModuleExpression(
		`await import(${JSON.stringify(`file://${MALCHUS_PRINTER}`)});`
	);
	assert.equal(chochmahResult.status, 0);
	assert.equal(chochmahResult.stdout, "");
	assert.equal(chochmahResult.stderr, "");
});

test("imported API can return one absolute path without CLI execution", () => {
	const chochmahResult = runChochmahModuleExpression(
		`const m=await import(${JSON.stringify(`file://${MALCHUS_PRINTER}`)}); process.stdout.write(m.manifestMalchusAbsolutePaths(["--key=ohrfrontRoot"]));`
	);
	assert.equal(chochmahResult.status, 0);
	assert.ok(chochmahResult.stdout.startsWith("/"));
	assert.equal(chochmahResult.stderr, "");
});

test("invalid key-list renderer fails with the canonical absolute printer path", () => {
	const malchusResult = spawnSync(
		process.execPath,
		[MALCHUS_PRINTER, "--keys", "--format=env"],
		{ cwd: "/tmp", encoding: "utf8" }
	);
	assert.notEqual(malchusResult.status, 0);
	assert.equal(malchusResult.stdout.trim(), "");
	assert.ok(malchusResult.stderr.trim().startsWith(`${MALCHUS_PRINTER}:`));
	assert.match(malchusResult.stderr, /Key discovery cannot use env format/);
});
