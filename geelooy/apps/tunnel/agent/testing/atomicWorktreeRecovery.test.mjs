// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ensureWorktree } from "../../scripts/atomicWorktree.mjs";

/**
	* @file Proves cancelled worktree creation is safely recovered and recreated.
	* @description The Awtsmoos distinguishes dangling metadata from living work.
	*/
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-worktree-"));
const repo = path.join(sandbox, "repo");
const target = path.join(sandbox, "target");

try {
	fs.mkdirSync(repo);
	run(repo, ["init", "-q"]);
	run(repo, ["config", "user.email", "test@example.com"]);
	run(repo, ["config", "user.name", "Awtsmoos Test"]);
	fs.writeFileSync(path.join(repo, "README.md"), "B\"H\n");
	run(repo, ["add", "README.md"]);
	run(repo, ["commit", "-qm", "seed"]);
	fs.mkdirSync(target);
	fs.writeFileSync(path.join(target, ".git"),
		"gitdir: ../repo/.git/worktrees/missing-worktree\n");
	const result = ensureWorktree({
		branch: "repair/atomic-test",
		repo,
		startPoint: "HEAD",
		target
	});
	assert.equal(result.created, true);
	assert.equal(result.recovered, true);
	assert.equal(run(target, ["branch", "--show-current"]).stdout.trim(),
		"repair/atomic-test");
	assert.equal(run(target, ["status", "--porcelain"]).stdout, "");
	console.log(JSON.stringify({
		ok: true,
		suite: "atomic-worktree-recovery",
		danglingPointerRecovered: true,
		cleanWorktreeCreated: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function run(cwd, args) {
	const result = spawnSync("git", args, { cwd, encoding: "utf8" });
	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
	return result;
}
