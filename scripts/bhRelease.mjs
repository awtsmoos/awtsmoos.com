#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

import { deployCommand } from "./lib/bhReleaseDeploy.mjs";
import { isAncestor, repositoryState, resolveTarget } from "./lib/bhReleaseGit.mjs";
import { capture, fail, run, valueArg } from "./lib/bhReleaseProcess.mjs";

/**
 * @file Publishes only an explicitly prepared Git vessel, then proves its public form.
 * @description
 * The Awtsmoos does not reveal a release through force or accidental staging.
 * Awtsmoos.com requires source truth, an audited index, fast-forward ancestry,
 * exact-SHA deployment, and public verification before calling the journey complete.
 */
const argumentsSet = new Set(process.argv.slice(2));
const dryRun = argumentsSet.has("--dry-run");
const message = valueArg("--message") || 'B"H';

run(process.execPath, ["scripts/verifyHomeSource.mjs"]);
run(process.execPath, ["scripts/repository-hygiene/check.cjs"]);

const branch = capture("git", ["branch", "--show-current"]);
if (!branch) fail("Cannot publish from a detached HEAD.");
const upstream = capture("git", [
	"rev-parse",
	"--abbrev-ref",
	"--symbolic-full-name",
	"@{upstream}"
], true);
const target = resolveTarget(upstream, branch);
const state = repositoryState();

if (dryRun) {
	console.log(JSON.stringify({
		ok: true,
		dryRun: true,
		branch,
		target,
		staged: state.staged,
		unstaged: state.unstaged,
		untracked: state.untracked,
		publishable: !state.unstaged.length && !state.untracked.length
	}, null, 2));
	process.exit(0);
}

if (state.unstaged.length || state.untracked.length) {
	fail("Refusing publish with unstaged or untracked work. Stage audited paths explicitly first.");
}
if (state.staged.length) run("git", ["commit", "-m", message]);

run("git", ["fetch", "--prune", target.remote, target.branch]);
const remoteRef = `refs/remotes/${target.remote}/${target.branch}`;
if (!isAncestor(remoteRef, "HEAD")) {
	fail(`${remoteRef} is not an ancestor of HEAD; refusing non-fast-forward publish.`);
}
run("git", ["push", target.remote, `HEAD:${target.branch}`]);
const sha = capture("git", ["rev-parse", "HEAD"]);
run(process.execPath, [
	"scripts/bh.mjs",
	"--command",
	deployCommand(sha, target.branch)
]);
run(process.execPath, ["scripts/verifyHomeProduction.mjs"]);
run(process.execPath, ["scripts/verifyTunnelPublicRelease.mjs"]);
console.log(`B"H published, deployed, and verified ${sha}.`);
