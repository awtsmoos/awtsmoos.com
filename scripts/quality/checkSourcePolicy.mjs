//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file checkSourcePolicy.mjs
 * @description
 * Audits explicit paths or the current Git working set. It never rewrites source;
 * CI and agents receive exact violations and must modularize rather than minify.
 * Canonical generated production vessels remain under repository-hygiene policy instead.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { sourcePolicyViolations } from "./SourcePolicyRules.mjs";
import { isAuthoredSourceCandidate } from "./SourcePolicyScope.mjs";

const repositoryRoot = process.cwd();
const requested = process.argv.slice(2);
const files = requested.length ? requested : changedFiles(repositoryRoot);
const failures = [];
const audited = [];

for (const relativePath of [...new Set(files)].sort()) {
	if (!isAuthoredSourceCandidate(relativePath)) continue;
	const absolutePath = path.resolve(repositoryRoot, relativePath);
	if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) continue;
	audited.push(relativePath);
	const violations = sourcePolicyViolations(relativePath, fs.readFileSync(absolutePath, "utf8"));
	for (const violation of violations) failures.push(`${relativePath}: ${violation}`);
}

if (failures.length) {
	console.error(`B"H source policy failed (${failures.length} violation${failures.length === 1 ? "" : "s"})`);
	for (const failure of failures) console.error(`- ${failure}`);
	process.exitCode = 1;
} else {
	console.log(`B"H source policy passed for ${audited.length} authored candidate${audited.length === 1 ? "" : "s"}.`);
}

/** @param {string} root Git repository root. @returns {string[]} Modified, staged, and untracked paths. */
function changedFiles(root) {
	const tracked = git(root, ["diff", "--name-only", "--diff-filter=ACMR", "HEAD"]);
	const untracked = git(root, ["ls-files", "--others", "--exclude-standard"]);
	return [...tracked, ...untracked].filter(Boolean);
}

/** @param {string} root Repository root. @param {string[]} args Git arguments. @returns {string[]} Output lines. */
function git(root, args) {
	try {
		return execFileSync("git", args, { cwd: root, encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
	} catch {
		return [];
	}
}
