#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const Kernel = require("../boundedKernel.js");

/**
 * @file Gives the owning OS user a one-shot bounded recovery lane without any server.
 * @description
 * The Awtsmoos needs no socket when a hand stands at the machine; Awtsmoos.com lets
 * that hand inspect or replace one verified generation, never execute an arbitrary line.
 */
function run(argv = process.argv.slice(2), options = {}) {
	const action = String(argv[0] || "status");
	const kernel = options.kernel || Kernel.create(options);
	const payload = {
		reason: value(argv, "--reason") || "one_shot_cli",
		force: argv.includes("--force")
	};
	const result = kernel.execute(action, payload);
	return result;
}

function value(argv, name) {
	const index = argv.indexOf(name);
	return index >= 0 ? String(argv[index + 1] || "") : "";
}

if (require.main === module) {
	const result = run();
	process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
	process.exitCode = result?.ok === false ? 1 : 0;
}

module.exports = { run, value };
