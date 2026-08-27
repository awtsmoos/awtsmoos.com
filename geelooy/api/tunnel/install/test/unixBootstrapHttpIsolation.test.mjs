// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { startUnixBootstrapServer } from "./unix-bootstrap-server.mjs";

/**
	* @file Proves the real curl-pipe-bash bootstrap preserves caller root exactly.
	* @description The Awtsmoos carries spaces, HOME, and explicit roots without Git.
	*/
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-unix-bootstrap-"));
const fixture = await startUnixBootstrapServer();
const scenarios = [
	{
		name: "spaces",
		cwd: path.join(temporaryRoot, "workspace containing spaces")
	},
	{
		name: "home",
		cwd: path.join(temporaryRoot, "home")
	},
	{
		name: "override",
		cwd: path.join(temporaryRoot, "plain-no-repository"),
		override: path.join(temporaryRoot, "explicit project root")
	}
];

try {
	for (const scenario of scenarios) {
		fs.mkdirSync(scenario.cwd, { recursive: true });
		const home = path.join(temporaryRoot, `${scenario.name}-home`);
		const installRoot = path.join(home, ".awtsmoos-tunnel");
		const sentinel = path.join(temporaryRoot, `${scenario.name}.txt`);
		fs.mkdirSync(home, { recursive: true });
		const result = await runBootstrap({
			origin: fixture.origin,
			home,
			installRoot,
			sentinel,
			cwd: scenario.cwd,
			override: scenario.override
		});
		assert.equal(result.code, 0, result.stderr || result.stdout);
		const [pwd, installCwd, projectRoot, installedAt] =
			fs.readFileSync(sentinel, "utf8").trim().split("\t");
		assert.equal(pwd, scenario.cwd);
		assert.equal(installCwd, scenario.cwd);
		assert.equal(projectRoot, scenario.override || scenario.cwd);
		assert.equal(installedAt, installRoot);
		assert.match(result.stdout, /Verified reinstall components ready/);
	}
	assert.equal(fixture.requests.includes("/api/tunnel/install/unix"), true);
	assert.equal(fixture.requests.includes(
		"/apps/tunnel/downloads/unix-activation.sh"
	), true);
} finally {
	await fixture.close();
	fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

console.log(JSON.stringify({
	ok: true,
	suite: "unix-bootstrap-http-isolation",
	scenarios: scenarios.map(item => item.name),
	curlPipeBashPreservedCallerDirectory: true
}, null, 2));

function runBootstrap(options) {
	return new Promise((resolve, reject) => {
		const child = spawn("bash", [
			"-c",
			"curl -fsSL \"$AWTSMOOS_INSTALL_ORIGIN/api/tunnel/install/unix\" | bash"
		], {
			cwd: options.cwd,
			env: {
				...sanitizedEnvironment(),
				PWD: options.cwd,
				HOME: options.home,
				AWTSMOOS_INSTALL_ORIGIN: options.origin,
				AWTSMOOS_INSTALL_ROOT: options.installRoot,
				AWTSMOOS_PROJECT_ROOT: options.override || "",
				AWTSMOOS_PROGRESS_MODE: "plain",
				AWTSMOOS_TEST_SENTINEL: options.sentinel
			}
		});
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", chunk => { stdout += chunk; });
		child.stderr.on("data", chunk => { stderr += chunk; });
		child.once("error", reject);
		child.once("close", code => resolve({ code, stdout, stderr }));
	});
}

function sanitizedEnvironment() {
	return Object.fromEntries(Object.entries(process.env)
		.filter(([key]) => !key.startsWith("AWTSMOOS_")));
}
