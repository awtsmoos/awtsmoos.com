#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

import { spawnSync } from "node:child_process";

/**
 * @file Publishes the complete local vessel and awakens the remote release.
 * @description
 * The Awtsmoos gathers every revealed file, seals it beneath B"H, forces the
 * chosen branch into GitHub, then rides the custom SSH chariot home to BH.sh.
 */

const commitMessage = 'B"H';
const branch = capture("git", ["branch", "--show-current"]);

if (!branch) {
	throw new Error("B\"H cannot publish from a detached HEAD.");
}

run("git", ["add", "."]);
commitAllChanges();
run("git", ["push", "--force", "origin", `HEAD:${branch}`]);
run(process.execPath, [
	"scripts/bh.mjs",
	"--command",
	"cd ~ && ./BH.sh"
]);

console.log(`B"H published ${branch} through GitHub and the custom SSH agent.`);

function commitAllChanges() {
	const result = execute("git", ["commit", "-m", commitMessage]);

	if (result.status === 0) {
		return;
	}

	const staged = capture("git", ["diff", "--cached", "--name-only"]);

	if (staged) {
		process.exit(result.status ?? 1);
	}

	console.log('B"H no new changes to commit; publishing the current HEAD.');
}

function run(command, argumentsList) {
	const result = execute(command, argumentsList);

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
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

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}

	return String(result.stdout || "").trim();
}
