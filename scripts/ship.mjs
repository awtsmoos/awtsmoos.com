#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

import { spawnSync } from "node:child_process";

/**
 * @file Commits and pushes only after the Git vessel passes repository hygiene.
 * @description
 * The Awtsmoos reveals a release through measured source, not accumulated shadow;
 * Awtsmoos.com refuses logs, caches, proofs, archives, and accidental bulk at ship time.
 */

const message = process.argv.slice(2).join(" ").trim() || "B_H automatic update";
const pushRetries = Number(process.env.AWTSMOOS_SHIP_PUSH_RETRIES || 2);

function environment() {
	return {
		...process.env,
		GIT_TRACE_PERFORMANCE: process.env.GIT_TRACE_PERFORMANCE || "1"
	};
}

function run(command, argumentsList, options = {}) {
	const result = spawnSync(command, argumentsList, {
		stdio: "inherit",
		shell: false,
		env: environment()
	});

	if (result.status !== 0 && !options.allowFailure) {
		process.exit(result.status ?? 1);
	}

	return result.status ?? 0;
}

function capture(command, argumentsList, options = {}) {
	const result = spawnSync(command, argumentsList, {
		encoding: "utf8",
		shell: false,
		env: environment()
	});

	if (result.status !== 0 && !options.allowFailure) {
		process.exit(result.status ?? 1);
	}

	return String(result.stdout || "").trim();
}

function resolvePushArguments() {
	const upstream = capture("git", [
		"rev-parse",
		"--abbrev-ref",
		"--symbolic-full-name",
		"@{upstream}"
	], { allowFailure: true });

	if (upstream.includes("/")) {
		const separator = upstream.indexOf("/");
		return [
			"push",
			"--progress",
			upstream.slice(0, separator),
			`HEAD:${upstream.slice(separator + 1)}`
		];
	}

	const branch = capture("git", ["branch", "--show-current"]);

	if (!branch) {
		throw new Error("Cannot ship a detached HEAD without an upstream branch.");
	}

	return ["push", "--progress", "--set-upstream", "origin", `HEAD:${branch}`];
}

function pushWithRetry() {
	const argumentsList = resolvePushArguments();

	for (let attempt = 1; attempt <= pushRetries; attempt += 1) {
		console.log(`B"H git push attempt ${attempt}/${pushRetries}`);

		if (run("git", argumentsList, { allowFailure: true }) === 0) {
			return;
		}

		run("git", ["fetch", "--prune", "origin"], { allowFailure: true });
	}

	process.exit(1);
}

function printDiagnostics() {
	console.log('B"H guarded ship diagnostics');
	run("git", ["status", "--short"], { allowFailure: true });
	run("git", ["count-objects", "-vH"], { allowFailure: true });
}

run("git", ["add", "-A"]);
run("node", ["scripts/repository-hygiene/check.cjs"]);
const staged = capture("git", ["diff", "--cached", "--name-only"]);

if (staged) {
	run("git", ["commit", "-m", message]);
} else {
	console.log('B"H nothing to commit; continuing with the verified branch.');
}

printDiagnostics();
pushWithRetry();
