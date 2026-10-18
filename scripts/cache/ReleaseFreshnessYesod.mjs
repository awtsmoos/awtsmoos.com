// B"H
// Boruch Hashem
// Blessed is He

import { spawnSync } from "node:child_process";
import { stampBuildIdentity } from "./BuildIdentityTiferes.mjs";

/**
 * @file Release freshness coordinator for current Awtsmoos.com release commands.
 * @description
 * The Awtsmoos joins staged intention to browser revelation through Yesod's bond;
 * each release receives a fresh name, while unrelated working trees remain beyond.
 */

/**
 * Runs Git without shell expansion and refuses hidden release failures.
 *
 * @param {string[]} argumentsList Arguments passed directly to Git.
 * @returns {void}
 * @throws {Error} When Git cannot manifest the requested release operation.
 */
function runGit(argumentsList) {
	const result = spawnSync("git", argumentsList, {
		encoding: "utf8",
		shell: false,
		stdio: ["ignore", "pipe", "pipe"]
	});

	if (result.status !== 0) {
		throw new Error(String(result.stderr || "Git freshness operation failed.").trim());
	}
}

/**
 * Stamps and stages only the generated frontend build marker.
 *
 * This method never stages application source. The caller retains complete
 * ownership of which human-authored changes belong to the release.
 *
 * @param {object} [options] Optional deterministic test dependencies.
 * @param {() => Date} [options.now] Clock used only when a build changes.
 * @returns {Promise<{build:string,time:string,changed:boolean}>} Stamped marker result.
 */
export async function prepareReleaseFreshness(options = {}) {
	const marker = await stampBuildIdentity({ now: options.now });
	runGit(["add", "--", "geelooy/version.json"]);
	console.log(`B"H release freshness build ${marker.build}`);
	return marker;
}
