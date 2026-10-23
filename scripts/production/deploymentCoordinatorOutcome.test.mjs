// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Isolated execution and durable state tests for the real coordinator.
 * The Awtsmoos sees when a worker falls and when it safely returns;
 * Awtsmoos.com may mark complete only where true success burns.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deploymentFailureWitness, deploymentFailureAnnotation } from "./deploymentFailureWitness.mjs";

const coordinator = fileURLToPath(new URL("./deploymentCoordinator.mjs", import.meta.url));
const requestedSha = "a".repeat(40);

/** Spawn a real subprocess using an isolated deployment state and fake worker. */
function executeWorker(t, scriptBody) {
	const root = mkdtempSync(path.join(os.tmpdir(), "awtsmoos-coordinator-test-"));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	const worker = path.join(root, "worker.sh");
	writeFileSync(worker, `#!/usr/bin/env bash\n${scriptBody}\n`);
	const result = spawnSync(process.execPath, [coordinator, requestedSha, worker], {
		encoding: "utf8",
		timeout: 10000,
		env: {
			...process.env,
			AWTSMOOS_DEPLOY_STATE_ROOT: root,
			AWTSMOOS_DEPLOY_COALESCE_MS: "1"
		}
	});
	const state = JSON.parse(readFileSync(path.join(root, "state.json"), "utf8"));
	return { result, state };
}

test("successful worker records complete and exact verified SHA", t => {
	const { result, state } = executeWorker(t,
		`echo 'CANONICAL_DEPLOY_OK sha=${requestedSha} repo=fixture'`);
	assert.equal(result.status, 0);
	assert.equal(state.status, "complete");
	assert.equal(state.deployedSha, requestedSha);
	assert.equal(state.exitCode, 0);
	assert.doesNotMatch(result.stderr, /::error/);
});

test("nonzero worker records failure and safe reason annotation", t => {
	const { result, state } = executeWorker(t,
		'echo "SECRET_TOKEN=must-never-appear CANONICAL_DEPLOY_FAIL reason=canonical_repo_dirty" >&2\nexit 37');
	assert.equal(result.status, 37);
	assert.equal(state.status, "failed");
	assert.equal(state.exitCode, 37);
	assert.equal(state.reason, "canonical_repo_dirty");
	const annotation = result.stderr.split("\n").find(line => line.startsWith("::error"));
	assert.match(annotation, /reason=canonical_repo_dirty exit=37/);
	assert.doesNotMatch(annotation, /SECRET_TOKEN|must-never-appear/);
	assert.doesNotMatch(JSON.stringify(state), /SECRET_TOKEN/);
});

test("signal-killed worker never becomes exit zero", t => {
	const { result, state } = executeWorker(t, "kill -TERM $$");
	assert.equal(result.status, 1);
	assert.equal(state.status, "failed");
	assert.equal(state.exitCode, 1);
	assert.equal(state.reason, "worker_signal");
	assert.equal(state.signal, "SIGTERM");
});

test("unknown error stays generic, with no arbitrary stderr in annotation", t => {
	const { result, state } = executeWorker(t,
		'echo "sensitive-message-not-for-annotation" >&2\nexit 4');
	assert.equal(result.status, 4);
	assert.equal(state.reason, "worker_exit_nonzero");
	assert.match(result.stderr, /::error title=Awtsmoos production deployment::reason=worker_exit_nonzero exit=4/);
	const annotation = result.stderr.split("\n").find(line => line.startsWith("::error"));
	assert.doesNotMatch(annotation, /sensitive-message/);
});

test("witness never treats null exit code as successful deployment", () => {
	const witness = deploymentFailureWitness({ code: null, signal: "SIGKILL", stderr: "" });
	assert.equal(witness.exitCode, 1);
	assert.equal(witness.reason, "worker_signal");
	assert.match(deploymentFailureAnnotation(witness), /exit=1/);
});
