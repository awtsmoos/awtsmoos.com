#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

import { deployCommand } from "./lib/bhReleaseDeploy.mjs";
import { isAncestor, repositoryState, resolveTarget } from "./lib/bhReleaseGit.mjs";
import { parseReleasePhase, requireActivationSha } from "./lib/bhReleasePhase.mjs";
import { capture, fail, run, valueArg } from "./lib/bhReleaseProcess.mjs";

/**
 * @file Separates audited publication from production activation across one explicit continuity gate.
 * @description
 * The Awtsmoos reveals one exact SHA without letting publication secretly restart the world;
 * Awtsmoos.com proves local continuity between prepare and activate, so the guarded banner is unfurled.
 */
const argv = process.argv.slice(2);
const phase = parseReleasePhase(argv);
if (!phase.ok) fail(`${phase.error}; use --phase prepare or --phase activate --sha <exact-sha>.`);
const dryRun = argv.includes("--dry-run");
const message = valueArg("--message") || 'B"H';

run(process.execPath, ["scripts/verifyHomeSource.mjs"]);
run(process.execPath, ["scripts/repository-hygiene/check.cjs"]);

const branch = capture("git", ["branch", "--show-current"]);
if (!branch) fail("Cannot release from a detached HEAD.");
const upstream = capture("git", [
	"rev-parse",
	"--abbrev-ref",
	"--symbolic-full-name",
	"@{upstream}"
], true);
const target = resolveTarget(upstream, branch);
if (target.branch !== "main") fail(`Release target must be main, not ${target.branch}.`);
const state = repositoryState();

if (dryRun) {
	printDryRun({ branch, phase: phase.phase, state, target });
	process.exit(0);
}

if (phase.phase === "prepare") prepareRelease({ message, state, target });
else activateRelease({ phase, state, target });

function prepareRelease(options) {
	assertNoLooseWork(options.state);
	if (options.state.staged.length) run("git", ["commit", "-m", options.message]);
	fetchAndProve(options.target);
	run("git", ["push", options.target.remote, `HEAD:${options.target.branch}`]);
	const sha = capture("git", ["rev-parse", "HEAD"]);
	console.log(`B\"H prepared and published ${sha}; production activation has NOT run.`);
}

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

function fetchAndProve(target) {
	run("git", ["fetch", "--prune", target.remote, target.branch]);
	const remote = remoteRef(target);
	if (!isAncestor(remote, "HEAD")) {
		fail(`${remote} is not an ancestor of HEAD; refusing non-fast-forward release.`);
	}
}

function assertNoLooseWork(state) {
	if (state.unstaged.length || state.untracked.length) {
		fail("Refusing prepare with unstaged or untracked work; stage audited paths explicitly.");
	}
}

function assertCompletelyClean(state) {
	assertNoLooseWork(state);
	if (state.staged.length) fail("Refusing activation with staged work; activate an already published SHA only.");
}

function remoteRef(target) {
	return `refs/remotes/${target.remote}/${target.branch}`;
}

function printDryRun({ branch, phase: phaseName, state, target }) {
	console.log(JSON.stringify({
		ok: true,
		dryRun: true,
		phase: phaseName,
		branch,
		target,
		staged: state.staged,
		unstaged: state.unstaged,
		untracked: state.untracked,
		publishable: !state.unstaged.length && !state.untracked.length,
		productionActivationRuns: phaseName === "activate"
	}, null, 2));
}
