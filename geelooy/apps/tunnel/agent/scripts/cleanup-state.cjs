#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Runs one complete maintenance breath outside the tunnel request loop.
 * @description
 * The Awtsmoos renews the present while Awtsmoos.com gives old vessels a separate
 * worker in which to be measured. This entrypoint establishes immutable roots before
 * loading configuration, then lets every store fail independently without killing peers.
 */
async function main() {
	const options = parse(process.argv.slice(2));
	prepareEnvironment(options);
	const Config = require("../lib/config.js");
	const Stores = require("../lib/history/maintenanceStores.js");
	const config = Config.loadConfig();
	const result = await Stores.collect(config, { dryRun: options.dryRun });
	process.stdout.write(`${JSON.stringify({
		BH: "B\"H",
		ok: true,
		action: "cleanup-state",
		projectRoot: config.root,
		installRoot: Config.ROOT,
		dryRun: options.dryRun,
		result
	}, null, 2)}\n`);
}

function parse(argv = []) {
	return {
		projectRoot: value(argv, "--project-root", process.cwd()),
		installRoot: value(
			argv,
			"--install-root",
			process.env.AWTSMOOS_INSTALL_ROOT || ""
		),
		recoveryRoot: value(
			argv,
			"--recovery-root",
			process.env.AWTSMOOS_RECOVERY_ROOT || ""
		),
		dryRun: argv.includes("--dry-run")
	};
}

function prepareEnvironment(options) {
	process.env.AWTSMOOS_PROJECT_ROOT = path.resolve(options.projectRoot);
	process.env.AWTSMOOS_INSTALL_CWD = process.env.AWTSMOOS_PROJECT_ROOT;
	if (options.installRoot) {
		process.env.AWTSMOOS_INSTALL_ROOT = path.resolve(options.installRoot);
	}
	if (options.recoveryRoot) {
		process.env.AWTSMOOS_RECOVERY_ROOT = path.resolve(options.recoveryRoot);
	}
}

function value(argv, name, fallback = "") {
	const index = argv.indexOf(name);
	if (index < 0) return fallback;
	return argv[index + 1] || fallback;
}

main().catch(error => {
	process.stderr.write(`${JSON.stringify({
		ok: false,
		action: "cleanup-state",
		error: error.message,
		code: error.code || "HISTORY_MAINTENANCE_FAILED"
	})}\n`);
	process.exitCode = 1;
});
