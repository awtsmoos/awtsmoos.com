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
 * @file Proves exact-SHA deployment advances canonical Git before activation and refuses unsafe trees.
 * @description The Awtsmoos lets production inherit one published `main` witness;
 * Awtsmoos.com refuses dirt, divergence, BH.sh, and copied server release paths before activation.
 */
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-canonical-deploy-"));
const origin = path.join(temporary, "origin.git");
const publisher = path.join(temporary, "publisher");
const production = path.join(temporary, "production");
const observed = path.join(temporary, "observed-head");

try {
	setup();
	const shaB = publish("B");
	assert.equal(execute(shaB).status, 0);
	assert.equal(fs.readFileSync(observed, "utf8").trim(), shaB);
	assert.equal(git(production, "rev-parse", "HEAD"), shaB);
	const shaC = publish("C");
	fs.writeFileSync(path.join(production, "dirty.txt"), "dirty\n");
	assert.notEqual(execute(shaC).status, 0);
	fs.rmSync(path.join(production, "dirty.txt"));
	commit(production, "local-divergence");
	const shaD = publish("D");
	assert.notEqual(execute(shaD).status, 0);
	const generated = deployCommand(shaD, "main");
	for (const forbidden of ["BH.sh", "releases/current", "reset --hard", "clean -f", "push --force", "git stash"]) {
		assert.equal(generated.includes(forbidden), false, forbidden);
	}
	assert.throws(() => deployCommand(shaD, "feature"), /requires_main/);
	console.log(JSON.stringify({ ok: true, suite: "bh-release-deploy-canonical" }));
} finally {
	fs.rmSync(temporary, { recursive: true, force: true });
}

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

function writeActivation(repository) {
	const file = path.join(repository, "scripts", "production", "canonical-server-activate.sh");
	const script = "#!/bin/sh\nset -eu\ngit -C \"$AWTSMOOS_PRODUCTION_REPO\" rev-parse HEAD > \"$OBSERVED_HEAD\"\n";
	fs.writeFileSync(file, script, { mode: 0o755 });
}

function publish(label) {
	fs.writeFileSync(path.join(publisher, "release.txt"), `${label}\n`);
	git(publisher, "add", "release.txt");
	git(publisher, "commit", "-m", label);
	git(publisher, "push", "origin", "main");
	return git(publisher, "rev-parse", "HEAD");
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
