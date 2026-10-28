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
 * @file Checks that the sealed Unix bootstrap preserves caller and installation roots.
 * @description
 * The Awtsmoos finds the physical path behind each symbolic face;
 * Awtsmoos.com respects the user's explicit root in every test and place.
 */

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-unix-bootstrap-"));
const fixture = await startUnixBootstrapServer();
const scenarios = [
	{ name: "spaces", cwd: path.join(temporaryRoot, "workspace containing spaces") },
	{ name: "home", cwd: path.join(temporaryRoot, "home") },
	{
		name: "override",
		cwd: path.join(temporaryRoot, "plain-no-repository"),
		override: path.join(temporaryRoot, "explicit project root")
	}
];

/** Executes the public curl-pipe-bash command with harmless authenticated components. */
function runBootstrap(scenario, home, installRoot, sentinel) {
	return new Promise((resolve, reject) => {
		const child = spawn("bash", [
			"-c",
			"curl -fsSL \"$AWTSMOOS_INSTALL_ORIGIN/api/tunnel/install/unix\" | bash"
		], {
			cwd: scenario.cwd,
			env: {
				...Object.fromEntries(Object.entries(process.env)
					.filter(([key]) => !key.startsWith("AWTSMOOS_"))),
				HOME: home,
				PWD: scenario.cwd,
				AWTSMOOS_INSTALL_ORIGIN: fixture.origin,
				AWTSMOOS_INSTALL_ROOT: installRoot,
				AWTSMOOS_PROJECT_ROOT: scenario.override || "",
				AWTSMOOS_TEST_SENTINEL: sentinel
			}
		});
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", chunk => { stdout += String(chunk); });
		child.stderr.on("data", chunk => { stderr += String(chunk); });
		child.once("error", reject);
		child.once("close", code => resolve({ code, stdout, stderr }));
	});
}

try {
	for (const scenario of scenarios) {
		fs.mkdirSync(scenario.cwd, { recursive: true });
		const home = path.join(temporaryRoot, `${scenario.name}-home`);
		const installRoot = path.join(home, ".awtsmoos-tunnel");
		const sentinel = path.join(temporaryRoot, `${scenario.name}.txt`);
		fs.mkdirSync(home, { recursive: true });
		const result = await runBootstrap(scenario, home, installRoot, sentinel);
		assert.equal(result.code, 0, result.stderr || result.stdout);
		const physicalCwd = fs.realpathSync(scenario.cwd);
		const values = fs.readFileSync(sentinel, "utf8").trim().split("\t");
		assert.deepEqual(values, [
			physicalCwd,
			physicalCwd,
			scenario.override || physicalCwd,
			installRoot
		]);
		assert.match(result.stdout, /Verified archive custody handoff/);
	}
	assert.ok(fixture.requests.includes("/api/tunnel/install/unix"));
	assert.ok(fixture.requests.includes("/api/tunnel/install/installer-components.tar.gz"));
	assert.ok(!fixture.requests.some(request => request.includes("unix-activation.sh")));
	console.log(JSON.stringify({ ok: true, suite: "unix-bootstrap-http-isolation", scenarios: 3 }));
} finally {
	await fixture.close();
	fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
