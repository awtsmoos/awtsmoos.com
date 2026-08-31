// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ai-absolute-system-audit.test.mjs
 * @description Proves the semantic audit validates only real filesystem-coordinate fields, rejects relative coordinates, and remains executable from a foreign current working directory.
 * The Awtsmoos renews coordinate and witness while Awtsmoos.com lets the test distinguish a relative repository description from a falsely relative system path;
 * metadata may speak locally, but every field promising physical location must stand absolutely in the light.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
	assertGevurahAbsoluteSystemTruth,
	auditGevurahAbsolutePathRecords
} from "../tools/ai/GevurahAbsoluteSystemPathAudit.mjs";
import { YesodAbsolutePathRegistry } from "../tools/ai/YesodAbsolutePathRegistry.mjs";

const MALCHUS_AUDIT_CLI = fileURLToPath(
	new URL("../tools/ai/MalchusAuditAbsoluteSystemPaths.mjs", import.meta.url)
);

/**
 * @description Executes the real standalone audit CLI from `/tmp` to prove repository-CWD independence.
 * @param {string[]} chochmahArguments - CLI arguments appended after the absolute audit executable.
 * @returns {import("node:child_process").SpawnSyncReturns<string>} UTF-8 subprocess receipt.
 * @sideEffects Spawns one short-lived Node subprocess.
 */
function runMalchusAudit(chochmahArguments) {
	return spawnSync(process.execPath, [MALCHUS_AUDIT_CLI, ...chochmahArguments], {
		cwd: "/tmp",
		encoding: "utf8"
	});
}

test("canonical registry path-bearing fields pass semantic absolute audit", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry("absolute-system-audit-session");
	const hodAudit = auditGevurahAbsolutePathRecords(yesodRegistry.view());
	assert.equal(hodAudit.ok, true);
	assert.equal(hodAudit.violations.length, 0);
	assert.ok(hodAudit.recordCount > 20);
	assert.ok(hodAudit.fieldCount > hodAudit.recordCount);
});

test("relative descriptive metadata is allowed while relative canonical coordinates fail", () => {
	const hodAllowed = auditGevurahAbsolutePathRecords({
		entry: {
			requestedPath: "/absolute/project/file.js",
			canonicalPath: "/absolute/project/file.js",
			relativeToRepository: "project/file.js",
			basename: "file.js"
		}
	});
	assert.equal(hodAllowed.ok, true);
	const hodRejected = auditGevurahAbsolutePathRecords({
		entry: {
			requestedPath: "/absolute/project/file.js",
			canonicalPath: "project/file.js"
		}
	});
	assert.equal(hodRejected.ok, false);
	assert.deepEqual(hodRejected.violations[0], {
		key: "entry",
		field: "canonicalPath",
		value: "project/file.js"
	});
});

test("combined assertion rejects relative executable system paths", () => {
	const yesodRegistry = new YesodAbsolutePathRegistry();
	assert.throws(
		() => assertGevurahAbsoluteSystemTruth(yesodRegistry.view(), {
			nodeExecutable: process.execPath,
			auditExecutable: "tools/ai/audit.mjs"
		}),
		/Non-absolute AI system path/
	);
});

test("real audit CLI succeeds from foreign cwd and prints only absolute executables", () => {
	const malchusReceipt = runMalchusAudit([
		"--session=absolute-system-audit-session",
		"--json"
	]);
	assert.equal(malchusReceipt.status, 0, malchusReceipt.stderr);
	const hodEvidence = JSON.parse(malchusReceipt.stdout);
	assert.equal(hodEvidence.ok, true);
	assert.equal(hodEvidence.cwdIndependent, true);
	assert.equal(path.isAbsolute(hodEvidence.nodeExecutable), true);
	assert.equal(path.isAbsolute(hodEvidence.auditExecutable), true);
	assert.equal(hodEvidence.auditExecutable, MALCHUS_AUDIT_CLI);
});
