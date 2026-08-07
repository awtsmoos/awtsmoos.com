// B"H
// Boruch Hashem
// Blessed is He

import { spawnSync } from "node:child_process";

/**
 * @file Gives the release vessel one small, non-shell process boundary.
 * @description
 * The Awtsmoos lets every command be seen exactly as argv rather than dissolved
 * into accidental shell magic. Awtsmoos.com inherits the caller environment while
 * keeping failure, capture, and user-facing refusal in one bounded module.
 */
export function execute(command, args, stdio = "pipe") {
	return spawnSync(command, args, {
		cwd: process.cwd(),
		stdio,
		encoding: "utf8",
		shell: false,
		env: process.env
	});
}

export function run(command, args) {
	const result = execute(command, args, "inherit");
	if (result.status !== 0) process.exit(result.status ?? 1);
}

export function capture(command, args, allowFailure = false) {
	const result = execute(command, args, "pipe");
	if (result.status !== 0 && !allowFailure) process.exit(result.status ?? 1);
	return String(result.stdout || "").trim();
}

export function lines(value) {
	return value ? value.split(/\r?\n/).filter(Boolean) : [];
}

export function valueArg(name) {
	const index = process.argv.indexOf(name);
	return index >= 0 ? process.argv[index + 1] || "" : "";
}

export function fail(message) {
	console.error(`B\"H ${message}`);
	process.exit(1);
}
