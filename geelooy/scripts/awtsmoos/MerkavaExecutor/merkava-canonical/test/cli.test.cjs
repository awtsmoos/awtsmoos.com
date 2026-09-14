//B"H
//Boruch Hashem
//Blessed be He

"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { executeCommand } = require("../cli/Commands.js");

/** Exercises compile, verify, targets, doctor, and readiness through one CLI API. */
async function run() {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "merkava-cli-"));
	try {
		fs.writeFileSync(path.join(directory, "index.html"), '<main id="out">B\\"H</main>');
		const output = path.join(directory, "app.merkava");
		const compiled = await executeCommand({
			command: "compile",
			flags: { target: "browser,macos" },
			positionals: [directory, output]
		});
		assert.strictEqual(compiled.ok, true);
		assert.ok(fs.statSync(output).size > 32);
		const verified = await executeCommand({ command: "verify", flags: {}, positionals: [output] });
		assert.strictEqual(verified.ok, true);
		assert.deepStrictEqual(verified.manifest.targets, ["browser", "macos"]);
		const targets = await executeCommand({ command: "targets", flags: {}, positionals: [] });
		assert.strictEqual(targets.packaging.android.artifact, "apk");
		const doctor = await executeCommand({ command: "doctor", flags: {}, positionals: [] });
		assert.strictEqual(typeof doctor.targets.browser, "boolean");
		const readiness = await executeCommand({ command: "readiness", flags: {}, positionals: [] });
		assert.strictEqual(readiness.ok, false);
		console.log(JSON.stringify({ bytes: compiled.bytes, doctor: doctor.targets, ok: true }));
	} finally {
		fs.rmSync(directory, { force: true, recursive: true });
	}
}

run().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
