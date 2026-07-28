// B"H
// Boruch Hashem
// Blessed is He

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
	* @file Recovers cancelled Git worktree creation before creating one cleanly.
	* @description The Awtsmoos removes only proven dangling workspace garments.
	*/
export function ensureWorktree({ repo, target, branch, startPoint = "HEAD" }) {
	const root = path.resolve(repo);
	const destination = path.resolve(target);
	const registered = registeredWorktrees(root);
	if (registered.includes(destination)) {
		verifyWorktree(destination);
		return { created: false, recovered: false, target: destination };
	}
	let recovered = false;
	if (fs.existsSync(destination)) {
		verifyDanglingTarget(root, destination);
		fs.rmSync(destination, { recursive: true, force: true });
		recovered = true;
	}
	runGit(root, ["worktree", "prune", "--expire", "now"]);
	try {
		const branchExists = runGit(root, [
			"show-ref", "--verify", "--quiet", `refs/heads/${branch}`
		], true).status === 0;
		const args = branchExists
			? ["worktree", "add", destination, branch]
			: ["worktree", "add", "-b", branch, destination, startPoint];
		runGit(root, args);
		verifyWorktree(destination);
		return { created: true, recovered, target: destination };
	} catch (error) {
		if (!registeredWorktrees(root).includes(destination)) {
			fs.rmSync(destination, { recursive: true, force: true });
			runGit(root, ["worktree", "prune", "--expire", "now"], true);
		}
		throw error;
	}
}

export function registeredWorktrees(repo) {
	const result = runGit(repo, ["worktree", "list", "--porcelain"]);
	return result.stdout.split("\n")
		.filter(line => line.startsWith("worktree "))
		.map(line => path.resolve(line.slice("worktree ".length)));
}

function verifyDanglingTarget(repo, target) {
	const marker = path.join(target, ".git");
	if (!fs.statSync(marker).isFile()) {
		throw new Error(`unsafe_existing_worktree_target:${target}`);
	}
	const value = fs.readFileSync(marker, "utf8").trim();
	if (!value.startsWith("gitdir: ")) {
		throw new Error(`invalid_worktree_pointer:${target}`);
	}
	const gitdir = path.resolve(target, value.slice("gitdir: ".length));
	if (fs.existsSync(gitdir) || registeredWorktrees(repo).includes(target)) {
		throw new Error(`worktree_target_not_dangling:${target}`);
	}
}

function verifyWorktree(target) {
	const result = runGit(target, ["rev-parse", "--is-inside-work-tree"]);
	if (result.stdout.trim() !== "true") {
		throw new Error(`worktree_verification_failed:${target}`);
	}
}

function runGit(cwd, args, allowFailure = false) {
	const result = spawnSync("git", args, { cwd, encoding: "utf8" });
	if (!allowFailure && result.status !== 0) {
		throw new Error(String(result.stderr || result.stdout || "git_failed").trim());
	}
	return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const [repo, target, branch, startPoint] = process.argv.slice(2);
	console.log(JSON.stringify(ensureWorktree({ repo, target, branch, startPoint }), null, 2));
}
