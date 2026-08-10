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
 * @file Proves production wears the requested SHA before BH.sh may restart it.
 * @description
 * The Awtsmoos lets a stale clean checkout advance only by fast-forward covenant;
 * Awtsmoos.com refuses dirty or diverged vessels before deployment can become an event.
 */
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-deploy-"));
const origin = path.join(temporary, "origin.git");
const publisher = path.join(temporary, "publisher");
const production = path.join(temporary, "production");
const home = path.join(temporary, "home");
const releases = path.join(temporary, "releases");
const shims = path.join(temporary, "shims");
const observed = path.join(home, "observed-head");

try {
	setupRepositories();
	fs.mkdirSync(home, { recursive: true });
	fs.mkdirSync(releases, { recursive: true });
	fs.mkdirSync(shims, { recursive: true });
	writeReadlinkShim();
	writeBh();
	const shaB = publish("B");
	assert.equal(execute(shaB).status, 0);
	assert.equal(fs.readFileSync(observed, "utf8").trim(), shaB);
	assert.equal(git(production, "rev-parse", "HEAD"), shaB);
	const shaC = publish("C");
	fs.rmSync(observed, { force: true });
	fs.writeFileSync(path.join(production, "dirty.txt"), "dirty\n");
	assert.notEqual(execute(shaC).status, 0);
	assert.equal(fs.existsSync(observed), false);
	fs.rmSync(path.join(production, "dirty.txt"));
	commit(production, "local-divergence");
	const shaD = publish("D");
	fs.rmSync(observed, { force: true });
	assert.notEqual(execute(shaD).status, 0);
	assert.equal(fs.existsSync(observed), false);
	const generated = deployCommand(shaD, "main");
	for (const forbidden of ["reset --hard", "push --force", "clean -f", "git stash", "checkout -b", "switch -c"]) {
		assert.equal(generated.includes(forbidden), false, forbidden);
	}
	console.log(JSON.stringify({
		ok: true,
		suite: "bh-release-deploy",
		fastForwardBeforeBh: true,
		dirtyRefusesBeforeBh: true,
		divergedRefusesBeforeBh: true
	}));
} finally {
	fs.rmSync(temporary, { recursive: true, force: true });
}

function setupRepositories() {
	git(temporary, "init", "--bare", origin);
	git(temporary, "init", "-b", "main", publisher);
	configure(publisher);
	fs.writeFileSync(path.join(publisher, "release.txt"), "A\n");
	git(publisher, "add", "release.txt");
	git(publisher, "commit", "-m", "A");
	git(publisher, "remote", "add", "origin", origin);
	git(publisher, "push", "-u", "origin", "main");
	git(temporary, "clone", "--branch", "main", origin, production);
	configure(production);
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

function writeBh() {
	const script = `#!/bin/sh\nset -eu\ngit -C "$AWTSMOOS_PRODUCTION_REPO" rev-parse HEAD > "$HOME/observed-head"\nmkdir -p "$AWTSMOOS_RELEASES_ROOT/awtsmoos-$EXPECTED_SHA"\nln -sfn "$AWTSMOOS_RELEASES_ROOT/awtsmoos-$EXPECTED_SHA" "$AWTSMOOS_RELEASES_ROOT/current"\n`;
	fs.writeFileSync(path.join(home, "BH.sh"), script, { mode: 0o755 });
}

function writeReadlinkShim() {
	const script = `#!/usr/bin/env node\nconst fs=require("node:fs");process.stdout.write(fs.realpathSync(process.argv.at(-1)));\n`;
	fs.writeFileSync(path.join(shims, "readlink"), script, { mode: 0o755 });
}

function execute(sha) {
	return spawnSync("bash", ["-c", deployCommand(sha, "main")], {
		encoding: "utf8",
		env: { ...process.env, HOME: home, EXPECTED_SHA: sha, AWTSMOOS_PRODUCTION_REPO: production, AWTSMOOS_RELEASES_ROOT: releases, PATH: `${shims}:${process.env.PATH}` }
	});
}

function git(repository, ...args) {
	const result = spawnSync("git", ["-C", repository, ...args], { encoding: "utf8" });
	if (result.status !== 0) throw new Error(result.stderr || result.stdout);
	return result.stdout.trim();
}
