#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

import { spawnSync } from "node:child_process";

/**
 * @file Publishes the complete local vessel and proves the remote revelation.
 * @description The Awtsmoos verifies, gathers, seals, force-pushes, awakens
 * BH.sh through the custom SSH chariot, then tests the public world itself.
 */

const commitMessage = 'B"H';
const branch = capture("git", ["branch", "--show-current"]);

if (!branch) throw new Error("B\"H cannot publish from a detached HEAD.");

run(process.execPath, ["scripts/verifyHomeSource.mjs"]);
run("git", ["add", "."]);
commitAllChanges();
run("git", ["push", "--force", "origin", `HEAD:${branch}`]);
run(process.execPath, ["scripts/bh.mjs", "--command", "cd ~ && ./BH.sh"]);
run(process.execPath, ["scripts/verifyHomeProduction.mjs"]);

console.log(`B"H published and verified ${branch}.`);

function commitAllChanges() {
	const result = execute("git", ["commit", "-m", commitMessage]);
	if (result.status === 0) return;
	const staged = capture("git", ["diff", "--cached", "--name-only"]);
	if (staged) process.exit(result.status ?? 1);
	console.log('B"H no new changes to commit; publishing the current HEAD.');
}

function run(command, argumentsList) {
	const result = execute(command, argumentsList);
	if (result.status !== 0) process.exit(result.status ?? 1);
}

function execute(command, argumentsList) {
	return spawnSync(command, argumentsList, {
		cwd: process.cwd(),
		stdio: "inherit",
		shell: false,
		env: process.env
	});
}

function capture(command, argumentsList) {
	const result = spawnSync(command, argumentsList, {
		cwd: process.cwd(),
		encoding: "utf8",
		shell: false,
		env: process.env
	});
	if (result.status !== 0) process.exit(result.status ?? 1);
	return String(result.stdout || "").trim();
}
