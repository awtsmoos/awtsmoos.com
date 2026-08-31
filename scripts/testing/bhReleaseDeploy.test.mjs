// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { deployCommand } from "../lib/bhReleaseDeploy.mjs";

/**
 * @file Proves exact-SHA production deployment advances canonical Git and imports immutable release tags without repainting their source.
 * @description
 * The Awtsmoos lets a later website garment reach production while an earlier tunnel-agent tag keeps its first flame;
 * Awtsmoos.com refuses dirt, divergence, force, and provenance drift so every public byte can answer truthfully when asked its name.
 */
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-canonical-deploy-"));
const origin = path.join(temporary, "origin.git");
const publisher = path.join(temporary, "publisher");
const production = path.join(temporary, "production");
const observed = path.join(temporary, "observed-head");
const releaseTag = "tunnel-agent-v1.0.570";

try {
	setup();
	const agentSha = publish("B");
	publishTag(releaseTag, agentSha);
	const siteSha = publish("C");
	assert.equal(execute(siteSha).status, 0);
	assert.equal(fs.readFileSync(observed, "utf8").trim(), siteSha);
	assert.equal(git(production, "rev-parse", "HEAD"), siteSha);
	assert.equal(git(production, "rev-parse", `${releaseTag}^{commit}`), agentSha);
	const dirtySha = publish("D");
	fs.writeFileSync(path.join(production, "dirty.txt"), "dirty\n");
	assert.notEqual(execute(dirtySha).status, 0);
	fs.rmSync(path.join(production, "dirty.txt"));
	commit(production, "local-divergence");
	const divergentSha = publish("E");
	assert.notEqual(execute(divergentSha).status, 0);
	const generated = deployCommand(divergentSha, "main");
	assert.match(generated, /fetch --prune --tags origin main/);
	for (const forbidden of ["BH.sh", "releases/current", "reset --hard", "clean -f", "push --force", "git stash"]) {
		assert.equal(generated.includes(forbidden), false, forbidden);
	}
	assert.throws(() => deployCommand(divergentSha, "feature"), /requires_main/);
	console.log(JSON.stringify({ ok: true, suite: "bh-release-deploy-canonical-tags" }));
} finally {
	fs.rmSync(temporary, { recursive: true, force: true });
}

/** Creates clean publisher, bare origin, and a production clone before any release tag exists. */
function setup() {
	git(temporary, "init", "--bare", origin);
	git(temporary, "init", "-b", "main", publisher);
	configure(publisher);
	fs.mkdirSync(path.join(publisher, "scripts", "production"), { recursive: true });
	fs.writeFileSync(path.join(publisher, "release.txt"), "A\n");
	writeActivation(publisher);
	git(publisher, "add", ".");
	git(publisher, "commit", "-m", "A");
	git(publisher, "remote", "add", "origin", origin);
	git(publisher, "push", "-u", "origin", "main");
	git(temporary, "clone", "--branch", "main", origin, production);
	configure(production);
}

/** Writes the tiny activation witness used by the generated production command. */
function writeActivation(repository) {
	const file = path.join(repository, "scripts", "production", "canonical-server-activate.sh");
	const script = "#!/bin/sh\nset -eu\ngit -C \"$AWTSMOOS_PRODUCTION_REPO\" rev-parse HEAD > \"$OBSERVED_HEAD\"\n";
	fs.writeFileSync(file, script, { mode: 0o755 });
}

/** Publishes one later main commit and returns its immutable SHA. */
function publish(label) {
	fs.writeFileSync(path.join(publisher, "release.txt"), `${label}\n`);
	git(publisher, "add", "release.txt");
	git(publisher, "commit", "-m", label);
	git(publisher, "push", "origin", "main");
	return git(publisher, "rev-parse", "HEAD");
}

/** Publishes one immutable tunnel-agent tag without advancing main. */
function publishTag(tag, sha) {
	git(publisher, "tag", tag, sha);
	git(publisher, "push", "origin", `refs/tags/${tag}`);
}

function commit(repository, label) {
	fs.writeFileSync(path.join(repository, `${label}.txt`), `${label}\n`);
	git(repository, "add", ".");
	git(repository, "commit", "-m", label);
}

function configure(repository) {
	git(repository, "config", "user.email", "test@awtsmoos.com");
	git(repository, "config", "user.name", "Awtsmoos Test");
}

function execute(sha) {
	return spawnSync("bash", ["-c", deployCommand(sha, "main")], {
		encoding: "utf8",
		env: { ...process.env, AWTSMOOS_PRODUCTION_REPO: production, OBSERVED_HEAD: observed }
	});
}

function git(repository, ...args) {
	const result = spawnSync("git", ["-C", repository, ...args], { encoding: "utf8" });
	if (result.status !== 0) throw new Error(result.stderr || result.stdout);
	return result.stdout.trim();
}
