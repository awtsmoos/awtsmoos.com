#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Fails fast when a changed JS file cannot load.
 * @description
 * The Awtsmoos never promotes a file that cannot be read; a rename once
 * broke production because a require was missed (mitzvah-world) and the
 * service crash-looped ~28,275 times. Awtsmoos.com runs `node --check`
 * on every changed .js/.cjs/.mjs file (syntax) and statically verifies
 * every relative require()/import target exists (a missed rename fails
 * here, not in production). This is a pre-deploy gate, not a test runner.
 */

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const JS_EXTENSIONS = new Set([".js", ".cjs", ".mjs"]);
const REQUIRE_PATTERN = /(?:require\(\s*["']([^"']+)["']\s*\)|from\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\))/g;

function gitOutput(args) {
	try {
		return childProcess.execFileSync("git", args, {
			cwd: REPO_ROOT,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"]
		});
	} catch {
		return "";
	}
}

function changedJsFiles() {
	const seen = new Set();
	for (const args of [
		["diff", "--cached", "--name-only"],
		["diff", "--name-only"],
		["ls-files", "--others", "--exclude-standard"]
	]) {
		for (const line of gitOutput(args).split("\n")) {
			const file = line.trim();
			if (!file) continue;
			if (JS_EXTENSIONS.has(path.extname(file))) seen.add(file);
		}
	}
	return [...seen].sort();
}

function checkSyntax(file) {
	const absolute = path.join(REPO_ROOT, file);
	try {
		childProcess.execFileSync(process.execPath, ["--check", absolute], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"]
		});
		return null;
	} catch (error) {
		const detail = String((error && error.stderr) || error.message || "syntax error").trim().split("\n")[0];
		return { file, kind: "syntax", detail };
	}
}

function resolveRelativeTarget(fromFile, specifier) {
	const fromDir = path.dirname(path.join(REPO_ROOT, fromFile));
	const base = path.resolve(fromDir, specifier);
	const candidates = [base];
	for (const ext of [".js", ".cjs", ".mjs", ".json"]) {
		if (!base.endsWith(ext)) candidates.push(base + ext);
	}
	candidates.push(path.join(base, "index.js"));
	candidates.push(path.join(base, "index.cjs"));
	candidates.push(path.join(base, "index.mjs"));
	return candidates.find((candidate) => {
		try {
			return fs.statSync(candidate).isFile();
		} catch {
			return false;
		}
	}) || null;
}

function checkRequires(file) {
	const absolute = path.join(REPO_ROOT, file);
	let text;
	try {
		text = fs.readFileSync(absolute, "utf8");
	} catch {
		return null;
	}
	REQUIRE_PATTERN.lastIndex = 0;
	let match;
	while ((match = REQUIRE_PATTERN.exec(text)) !== null) {
		const specifier = match[1] || match[2] || match[3];
		if (!specifier || !specifier.startsWith(".")) continue;
		if (resolveRelativeTarget(file, specifier)) continue;
		return { file, kind: "unresolved_require", detail: specifier };
	}
	return null;
}

function run(options = {}) {
	const files = options.files || changedJsFiles();
	const failures = [];
	for (const file of files) {
		const syntax = checkSyntax(file);
		if (syntax) {
			failures.push(syntax);
			continue;
		}
		const unresolved = checkRequires(file);
		if (unresolved) failures.push(unresolved);
	}
	return { ok: failures.length === 0, files: files.length, failures };
}

if (require.main === module) {
	const result = run();
	if (!result.ok) {
		for (const failure of result.failures) {
			console.log(`B"H syntax-gate FAILED ${failure.kind} ${failure.file}: ${failure.detail}`);
		}
		process.exitCode = 1;
	} else {
		console.log(`B"H syntax-gate OK (${result.files} changed JS files checked)`);
	}
}

module.exports = { checkRequires, checkSyntax, changedJsFiles, run };
