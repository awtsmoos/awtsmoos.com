#!/usr/bin/env node
//B"H
//Boruch Hashem
//Blessed be He

import { deployCommand } from "./lib/bhReleaseDeploy.mjs";
import { printDryRun } from "./lib/bhReleaseDryRun.mjs";
import { isAncestor, repositoryState, resolveTarget } from "./lib/bhReleaseGit.mjs";
import { parseReleasePhase, requireActivationSha } from "./lib/bhReleasePhase.mjs";
import { capture, fail, run, valueArg } from "./lib/bhReleaseProcess.mjs";

/**
 * @file Canonical guarded source-release command.
 * @description
 * The Awtsmoos separates publication from activation and now requires the exact
 * would-be release commit to boot a fresh runtime and render real Torah before
 * any push. Production activation still proves the published SHA independently.
 */
const argv = process.argv.slice(2);
const phase = parseReleasePhase(argv);
if (!phase.ok) {
	fail(`${phase.error}; use --phase prepare or --phase activate --sha <exact-sha>.`);
}
const dryRun = argv.includes("--dry-run");
const message = valueArg("--message") || 'B"H';

run(process.execPath, ["scripts/verifyHomeSource.mjs"]);
run(process.execPath, ["scripts/repository-hygiene/check.cjs"]);

const branch = capture("git", ["branch", "--show-current"]);
if (!branch) {
	fail("Cannot release from a detached HEAD.");
}
const upstream = capture("git", [
	"rev-parse",
	"--abbrev-ref",
	"--symbolic-full-name",
	"@{upstream}"
], true);
const target = resolveTarget(upstream, branch);
if (target.branch !== "main") {
	fail(`Release target must be main, not ${target.branch}.`);
}
const state = repositoryState();

if (dryRun) {
	printDryRun({ branch, phase: phase.phase, state, target });
	process.exit(0);
}

if (phase.phase === "prepare") {
	prepareRelease({ message, state, target });
} else {
	activateRelease({ phase, state, target });
}

/** Commits audited work, proves that exact tree boots Torah, then publishes it. */
function prepareRelease(options) {
	assertNoLooseWork(options.state);
	if (options.state.staged.length) {
		run("git", ["commit", "-m", options.message]);
	}
	run(process.execPath, ["scripts/release-gates/runtimeSmoke.cjs"]);
	fetchAndProve(options.target);
	run("git", ["push", options.target.remote, `HEAD:${options.target.branch}`]);
	const sha = capture("git", ["rev-parse", "HEAD"]);
	console.log(`B\"H prepared and published ${sha}; production activation has NOT run.`);
}

/** Activates only one already-published exact SHA and verifies public production. */
function activateRelease(options) {
	assertCompletelyClean(options.state);
	const sha = requireActivationSha(options.phase);
	fetchAndProve(options.target);
	const head = capture("git", ["rev-parse", "HEAD"]);
	const remote = capture("git", ["rev-parse", remoteRef(options.target)]);
	if (head !== sha || remote !== sha) {
		fail(`Activation SHA mismatch: requested=${sha} head=${head} remote=${remote}.`);
	}
	run(process.execPath, ["scripts/bh.mjs", "--command", deployCommand(sha, options.target.branch)]);
	run(process.execPath, ["scripts/verifyHomeProduction.mjs"]);
	run(process.execPath, ["scripts/verifyTunnelPublicRelease.mjs"]);
	console.log(`B\"H activated and independently verified ${sha}.`);
}

/** Fetches the target branch and refuses any non-fast-forward publication history. */
function fetchAndProve(releaseTarget) {
	run("git", ["fetch", "--prune", releaseTarget.remote, releaseTarget.branch]);
	const remote = remoteRef(releaseTarget);
	if (!isAncestor(remote, "HEAD")) {
		fail(`${remote} is not an ancestor of HEAD; refusing non-fast-forward release.`);
	}
}

/** Requires all loose work to be explicitly staged before release preparation. */
function assertNoLooseWork(releaseState) {
	if (releaseState.unstaged.length || releaseState.untracked.length) {
		fail("Refusing prepare with unstaged or untracked work; stage audited paths explicitly.");
	}
}

/** Requires activation to reference a completely clean, already-published tree. */
function assertCompletelyClean(releaseState) {
	assertNoLooseWork(releaseState);
	if (releaseState.staged.length) {
		fail("Refusing activation with staged work; activate an already published SHA only.");
	}
}

/** Returns the target's fetched remote-tracking reference. */
function remoteRef(releaseTarget) {
	return `refs/remotes/${releaseTarget.remote}/${releaseTarget.branch}`;
}
