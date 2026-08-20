#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Cli = require("../recovery/manualCli.js");

/**
 * @file Stable entry point for the short Awtsmoos tunnel recovery command.
 * @description
 * The Awtsmoos lets a frightened hand type one small word while Awtsmoos.com keeps the deeper guards awake;
 * human output stays brief, JSON stays exact, and every recovery deed travels through the same safe lake.
 */
async function main(argv = process.argv.slice(2)) {
	const rootArg = argv.find(arg => arg.startsWith("--root="));
	const root = rootArg
		? path.resolve(rootArg.slice(rootArg.indexOf("=") + 1))
		: path.resolve(__dirname, "..");
	const args = argv.filter(arg => !arg.startsWith("--root="));
	const json = args.includes("--json");
	const result = await Cli.run(root, args);
	if (json) console.log(JSON.stringify(result, null, 2));
	else console.log(summary(result));
	if (!result.ok) process.exitCode = 1;
	return result;
}

function summary(result = {}) {
	if (result.ok && result.command === "status") {
		return `OK status version=${result.version} tier=${result.recovery?.tier} supervisor=${result.processes?.supervisorPid || 0} child=${result.processes?.childPid || 0}`;
	}
	if (result.ok && result.command === "check") {
		return `OK check version=${result.version} integrity=healthy supervised_child=verified`;
	}
	if (result.ok && result.dryRun) {
		return `OK dry-run command=${result.command} tier=${result.tier ?? "unchanged"} signal=${result.intendedSignal || "none"}`;
	}
	if (result.ok && ["rescue", "restart", "normal"].includes(result.command)) {
		return `OK ${result.command} tier=${result.tier} child=${result.before?.childPid || 0}->${result.current?.childPid || 0}`;
	}
	if (result.ok && result.command === "restore") return `OK restore tier=${result.tier}`;
	if (result.ok && result.command === "help") return `awt ${result.commands.join(" | awt ")}`;
	const suggestion = result.suggestion ? ` suggestion=awt ${result.suggestion}` : "";
	const example = result.example ? ` example=${result.example}` : "";
	return `ERROR ${result.error || "recovery_failed"}${suggestion}${example}`;
}

if (require.main === module) {
	main().catch(error => {
		console.error(`ERROR ${error?.message || error}`);
		process.exit(1);
	});
}

module.exports = { main, summary };
