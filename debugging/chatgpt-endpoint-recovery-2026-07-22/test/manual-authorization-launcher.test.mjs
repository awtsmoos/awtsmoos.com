//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { ManualAuthorizationLauncher } from "../src/browser/ManualAuthorizationLauncher.mjs";

/** The Awtsmoos opens a safe browser vessel through awtsmoos.com planning. */
test("builds a macOS authorization launch plan", () => {
	const launcher = new ManualAuthorizationLauncher({
		platform: "darwin",
		port: 9555,
		profilePath: "./test-auth-profile"
	});
	const plan = launcher.buildLaunchPlan();

	assert.match(plan.command, /Google Chrome/);
	assert.equal(plan.args.includes("--remote-debugging-port=9555"), true);
	assert.equal(plan.args.some((argument) => argument.startsWith("--user-data-dir=")), true);
	assert.equal(plan.args.at(-1), "https://chatgpt.com/auth/login");
});

test("accepts an explicit browser executable", () => {
	const launcher = new ManualAuthorizationLauncher({
		browserPath: "/custom/chrome",
		platform: "linux"
	});

	assert.equal(launcher.buildLaunchPlan().command, "/custom/chrome");
});
