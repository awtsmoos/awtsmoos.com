#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const fs = require("node:fs");
const Cli = require("../recovery/manualCli.js");

/**
 * @file Stable human entry for diagnosis, discoverable help, and layered tunnel recovery.
 * @description
 * The Awtsmoos lets a frightened hand speak briefly while Awtsmoos.com answers with the
 * exact safe road: inspect, reconcile, replace, verify, and only widen authority by consent.
 */

// --- Clever terminal presentation (Yaakov 2026-10-11: publish-ready CLI) ---
const TTY = process.stderr.isTTY && process.env.NO_COLOR !== "1" && process.env.TERM !== "dumb";
const C = TTY
	? { bold: "\x1b[1m", dim: "\x1b[2m", gold: "\x1b[1;33m", green: "\x1b[1;32m", red: "\x1b[1;31m", cyan: "\x1b[1;36m", off: "\x1b[0m" }
	: { bold: "", dim: "", gold: "", green: "", red: "", cyan: "", off: "" };

function readVersion(root) {
	try {
		const state = fs.readFileSync(path.join(root, "install-state.txt"), "utf8").trim();
		if (state) return state;
	} catch {}
	try {
		const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
		if (pkg.version) return String(pkg.version);
	} catch {}
	return "unknown";
}

function printBanner(out = process.stdout) {
	out.write(
		`${C.gold}  ✦  ${C.bold}AWTSMOOS TUNNEL${C.off}${C.gold}  ✦${C.off}\n` +
		`${C.dim}  ── secure doorway to your machines ──${C.off}\n`
	);
}

const HELP_TOPICS = [
	["status", "Show tunnel health, version, and supervised processes."],
	["diagnose", "Inspect what is wrong and get the safe recovery recommendation."],
	["doctor", "Deep diagnosis with repair guidance."],
	["check", "Verify install integrity and the supervised child."],
	["rescue", "Tiered rescue: restart the tunnel safely."],
	["restart", "Restart the tunnel agent."],
	["normal", "Return the tunnel to its normal tier."],
	["identity", "Show this device's tunnel identity."],
	["known-good", "Restore the last known-good verified release."],
	["sealed-emergency", "Guarded manual sealed takeover (consent required)."],
	["root-rebind", "Rebind the install root to a new location."],
	["restore", "Restore a tier from recovery state."],
];

function printHelp(root) {
	printBanner(process.stdout);
	const out = process.stdout;
	out.write(`${C.bold}Usage:${C.off}  awt ${C.cyan}<command>${C.off} [options]\n\n`);
	out.write(`${C.bold}Commands:${C.off}\n`);
	for (const [name, desc] of HELP_TOPICS) {
		out.write(`  ${C.cyan}${name.padEnd(18)}${C.off}${C.dim}${desc}${C.off}\n`);
	}
	out.write(`\n${C.bold}Options:${C.off}\n`);
	out.write(`  ${C.cyan}--version, -v${C.off}      Show the installed tunnel version.\n`);
	out.write(`  ${C.cyan}--help, -h${C.off}         Show this help.\n`);
	out.write(`  ${C.cyan}--json${C.off}             Emit machine-readable JSON.\n`);
	out.write(`  ${C.cyan}--root=<path>${C.off}      Operate on a different install root.\n`);
	out.write(`\n${C.dim}Install:${C.off}  curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash\n`);
	out.write(`${C.dim}Cancel:${C.off}   Ctrl+C at any time cancels cleanly (exit 130).\n`);
}

async function main(argv = process.argv.slice(2)) {
	const rootArg = argv.find(arg => arg.startsWith("--root="));
	const root = rootArg
		? path.resolve(rootArg.slice(rootArg.indexOf("=") + 1))
		: path.resolve(__dirname, "..");
	if (argv.includes("--version") || argv.includes("-v")) {
		printBanner(process.stdout);
		process.stdout.write(`  version ${C.green}${readVersion(root)}${C.off}\n`);
		return { ok: true, command: "version" };
	}
	if (argv.includes("--help") || argv.includes("-h") || argv.length === 0 || (argv[0] === "help" && argv.length === 1)) {
		printHelp(root);
		return { ok: true, command: "help" };
	}
	const args = argv.filter(arg => !arg.startsWith("--root="));
	const json = args.includes("--json");
	const result = await Cli.run(root, args);
	if (json) {
		console.log(JSON.stringify(result, null, 2));
	} else {
		console.log(summary(result));
	}
	if (!result.ok) {
		process.exitCode = 1;
	}
	return result;
}

/**
 * Converts structured recovery receipts into compact human-readable output.
 * @param {object} result Recovery result from the local CLI router.
 * @returns {string} One-line or focused multi-line recovery summary.
 */
function summary(result = {}) {
	if (result.ok && result.command === "help" && result.topic) {
		return topicHelp(result);
	}
	if (result.ok && result.command === "diagnose") {
		return `OK diagnose recommendation=${result.recommendation} identity=${result.identity?.state || "unknown"}`;
	}
	if (result.ok && result.command === "status") {
		return `OK status version=${result.version} tier=${result.recovery?.tier} supervisor=${result.processes?.supervisorPid || 0} child=${result.processes?.childPid || 0}`;
	}
	if (result.ok && result.command === "check") {
		return `OK check version=${result.version} integrity=healthy supervised_child=verified`;
	}
	if (result.command === "root-rebind") {
		return rootRebindSummary(result);
	}
	if (result.ok && result.dryRun) {
		return `OK dry-run command=${result.command} tier=${result.tier ?? "unchanged"} state=${result.state || "ready"}`;
	}
	if (result.ok && ["rescue", "restart", "normal"].includes(result.command)) {
		return `OK ${result.command} tier=${result.tier} child=${result.before?.childPid || 0}->${result.current?.childPid || 0}`;
	}
	if (result.ok && result.command === "identity") {
		return `OK identity state=${result.state} tunnel=${result.after?.tunnelId || result.tunnelId || "unknown"}`;
	}
	if (result.ok && result.command === "known-good") {
		return `OK known-good version=${result.version} productionReady=${result.productionReady === true}`;
	}
	if (result.ok && result.command === "sealed-emergency") {
		return `OK sealed-emergency state=${result.state} pid=${result.pid || 0}`;
	}
	if (result.ok && result.command === "restore") {
		return `OK restore tier=${result.tier}`;
	}
	if (result.ok && result.command === "help") {
		return `awt ${result.commands.join(" | awt ")}`;
	}
	return errorSummary(result);
}

function rootRebindSummary(result) {
	if (result.ok) {
		return `OK root-rebind state=${result.state} current=${result.currentRoot} target=${result.targetRoot} broad=${result.broad === true}`;
	}
	return `ERROR ${result.error || "root_rebind_failed"} current=${result.currentRoot || "unknown"} target=${result.targetRoot || "unknown"}${result.example ? ` example=${result.example}` : ""}`;
}

function errorSummary(result) {
	const suggestion = result.suggestion ? ` suggestion=awt ${result.suggestion}` : "";
	const example = result.example ? ` example=${result.example}` : "";
	return `ERROR ${result.error || "recovery_failed"}${suggestion}${example}`;
}

function topicHelp(result) {
	return [
		`awt help ${result.topic} — ${result.summary}`,
		`remote operations: ${result.operations.join(", ")}`,
		`safe order: ${result.safeOrder.join(" -> ")}`,
		`local fallbacks:\n- ${result.localFallbacks.join("\n- ")}`
	].join("\n");
}

if (require.main === module) {
	main().catch(error => {
		console.error(`ERROR ${error?.message || error}`);
		process.exit(1);
	});
}

module.exports = { errorSummary, main, rootRebindSummary, summary, topicHelp };
