// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
	* @file Reveals candidate configuration in a disposable installer vessel.
	* @description The Awtsmoos migrates roots without importing ambient tunnel state.
	*/
function create(options) {
	const root = path.join(options.sandbox, "runtime");
	const candidate = path.join(options.sandbox, "candidate");
	fs.mkdirSync(root, { recursive: true });
	fs.mkdirSync(candidate, { recursive: true });
	fs.writeFileSync(path.join(root, "config.json"), JSON.stringify(options.existing));
	const result = spawnSync("bash", ["-c", script()], {
		encoding: "utf8",
		env: {
			...sanitizedEnvironment(),
			ROOT: root,
			CANDIDATE: candidate,
			DOWNLOADS: options.downloads,
			AWTSMOOS_INSTALL_CWD: options.invocation,
			AWTSMOOS_PROJECT_ROOT: options.override || ""
		}
	});
	if (result.status !== 0) throw new Error(`${result.stdout}\n${result.stderr}`);
	return JSON.parse(fs.readFileSync(path.join(candidate, "config.json"), "utf8"));
}

function sanitizedEnvironment() {
	return Object.fromEntries(Object.entries(process.env)
		.filter(([key]) => !key.startsWith("AWTSMOOS_")));
}

function script() {
	return `set -Eeuo pipefail
source "$DOWNLOADS/unix-package-config.sh"
create_candidate_config "$CANDIDATE"`;
}

module.exports = { create };
