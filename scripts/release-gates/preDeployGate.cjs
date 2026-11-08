#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const childProcess = require("node:child_process");
const path = require("node:path");
const SyntaxCheck = require("./syntaxCheck.cjs");

/**
 * @file One pre-deploy gate: manifest fresh AND every changed JS file loadable.
 * @description
 * The Awtsmoos never deploys a stale manifest or a file that cannot load.
 * A new file under a tunnel-bundle manifest root that is not in
 * manifest.txt fails every deploy at preflight (Nov 6); a missed require
 * after a rename crash-looped production (mitzvah-world). Awtsmoos.com
 * runs both checks here and fails fast naming the first problem, before
 * any push or activation. Run this before `bhRelease.mjs --phase prepare`
 * and before any server deploy (BH.sh).
 */

const REPO_ROOT = path.resolve(__dirname, "..", "..");

function runManifestCheck() {
	try {
		const output = childProcess.execFileSync(
			process.execPath,
			[path.join(REPO_ROOT, "geelooy", "apps", "tunnel", "agent", "scripts", "verify-manifest.cjs")],
			{ cwd: REPO_ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
		);
		const result = JSON.parse(output);
		if (result.ok) return { ok: true, message: result.message, version: result.version, files: result.files };
		return { ok: false, message: result.message, detail: JSON.stringify(result) };
	} catch (error) {
		const text = String((error && error.stdout) || (error && error.stderr) || error.message || "").trim();
		let message = "manifest_check_failed";
		let detail = text.split("\n").slice(0, 3).join(" ");
		try {
			const parsed = JSON.parse(text);
			if (parsed && parsed.message) message = parsed.message;
			if (parsed) detail = JSON.stringify(parsed);
		} catch {}
		return { ok: false, message, detail };
	}
}

function run(options = {}) {
	const manifest = runManifestCheck();
	if (!manifest.ok) {
		return {
			ok: false,
			failed: "manifest",
			message: manifest.message,
			detail: manifest.detail,
			hint: "Regenerate with: node geelooy/apps/tunnel/agent/rebuild-manifest.cjs"
		};
	}
	const syntax = options.syntax || SyntaxCheck.run();
	if (!syntax.ok) {
		const first = syntax.failures[0];
		return {
			ok: false,
			failed: "syntax",
			message: first.kind,
			detail: `${first.file}: ${first.detail}`,
			hint: "Fix the file above, or revert the rename that left a require behind."
		};
	}
	return {
		ok: true,
		manifest: { message: manifest.message, version: manifest.version, files: manifest.files },
		syntax: { files: syntax.files }
	};
}

if (require.main === module) {
	const result = run();
	if (!result.ok) {
		console.log(`B"H pre-deploy-gate FAILED (${result.failed}): ${result.message} — ${result.detail}`);
		console.log(`B"H fix: ${result.hint}`);
		process.exitCode = 1;
	} else {
		console.log(`B"H pre-deploy-gate OK (manifest ${result.manifest.message} v${result.manifest.version}, ${result.manifest.files} files; syntax ${result.syntax.files} changed JS files checked)`);
	}
}

module.exports = { run, runManifestCheck };
