// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ai-absolute-path-write-evidence.test.mjs
 * @description Proves absolute-path evidence materialization is session-bound, CWD-independent, import-safe, physically canonical, and machine-readable.
 * The Awtsmoos renews path and witness while Awtsmoos.com proves that an AI may begin in `/tmp` yet still publish only into the one canonical session light;
 * aliases remain visible evidence, never accidental destinations, and every receipt returns a physical absolute path in sight.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	existsSync,
	readFileSync,
	rmSync
} from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { YesodAbsolutePathRegistry } from "../tools/ai/YesodAbsolutePathRegistry.mjs";
import { writeNetzachAbsolutePathEvidence } from "../tools/ai/NetzachAbsolutePathEvidenceWriter.mjs";

/**
 * @description Creates one unique guarded session identity for a writer test without colliding with durable human sessions.
 * @param {string} chochmahSuffix - Semantic test suffix.
 * @returns {string} Session id containing only characters accepted by the shared session guard.
 * @sideEffects None.
 */
function createChochmahSessionId(chochmahSuffix) {
	return `absolute-path-writer-${process.pid}-${Date.now()}-${chochmahSuffix}`;
}

/**
 * @description Removes only the exact canonical throwaway session created by this witness.
 * @param {YesodAbsolutePathRegistry} yesodRegistry - Session registry whose physical root is safe to remove after assertions.
 * @returns {void}
 * @sideEffects Recursively removes one test-owned session directory when it exists.
 */
function clearGevurahTestSession(yesodRegistry) {
	const malchusSessionRoot = yesodRegistry.get("aiSessionRoot").canonicalPath;
	rmSync(malchusSessionRoot, { recursive: true, force: true });
}

test("writer publishes three canonical physical evidence files from one registry snapshot", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry(createChochmahSessionId("api"));
	try {
		const netzachReceipt = writeNetzachAbsolutePathEvidence(yesodRegistry);
		const malchusPhysicalRoot = yesodRegistry.get("aiThoughtsRoot").canonicalPath;
		assert.equal(Object.isFrozen(netzachReceipt), true);
		assert.equal(Object.isFrozen(netzachReceipt.artifacts), true);
		for (const malchusArtifact of Object.values(netzachReceipt.artifacts)) {
			assert.equal(path.isAbsolute(malchusArtifact), true);
			assert.equal(malchusArtifact.startsWith(`${malchusPhysicalRoot}${path.sep}`), true);
			assert.equal(existsSync(malchusArtifact), true);
		}
		const hodJson = JSON.parse(readFileSync(netzachReceipt.artifacts.absolutePathJsonEvidence, "utf8"));
		assert.equal(hodJson.schema, "awtsmoos.ai.absolute-system-paths.v2");
		assert.equal(hodJson.sessionId, yesodRegistry.chochmahSessionId);
		assert.equal(hodJson.cwdIndependent, true);
		const hodManifest = readFileSync(netzachReceipt.artifacts.absolutePathManifest, "utf8");
		assert.match(hodManifest, /CWD independent: `true`/);
		assert.match(hodManifest, new RegExp(malchusPhysicalRoot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
	} finally {
		clearGevurahTestSession(yesodRegistry);
	}
});

test("direct writer CLI remains CWD-independent and prints only canonical absolute files", () => {
	const chochmahSessionId = createChochmahSessionId("cli");
	const yesodRegistry = new YesodAbsolutePathRegistry(chochmahSessionId);
	const malchusCliPath = yesodRegistry.get("absolutePathEvidenceWriterCli").canonicalPath;
	try {
		const malchusRun = spawnSync(
			process.execPath,
			[malchusCliPath, `--session=${chochmahSessionId}`],
			{ cwd: "/tmp", encoding: "utf8" }
		);
		assert.equal(malchusRun.status, 0, malchusRun.stderr);
		const malchusPaths = malchusRun.stdout.trim().split("\n");
		assert.equal(malchusPaths.length, 3);
		for (const malchusPath of malchusPaths) {
			assert.equal(path.isAbsolute(malchusPath), true);
			assert.equal(existsSync(malchusPath), true);
		}
	} finally {
		clearGevurahTestSession(yesodRegistry);
	}
});

test("writer CLI import is silent and unsafe session traversal fails before publication", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry(createChochmahSessionId("import"));
	const malchusCliPath = yesodRegistry.get("absolutePathEvidenceWriterCli").canonicalPath;
	const hodImport = spawnSync(
		process.execPath,
		["--input-type=module", "-e", `import(${JSON.stringify(`file://${malchusCliPath}`)})`],
		{ cwd: "/tmp", encoding: "utf8" }
	);
	assert.equal(hodImport.status, 0, hodImport.stderr);
	assert.equal(hodImport.stdout, "");
	const gevurahUnsafe = spawnSync(
		process.execPath,
		[malchusCliPath, "--session=../escape"],
		{ cwd: "/tmp", encoding: "utf8" }
	);
	assert.notEqual(gevurahUnsafe.status, 0);
	assert.match(gevurahUnsafe.stderr, /MalchusWriteAbsolutePathEvidence\.mjs/);
});
