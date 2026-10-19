// B"H
"use strict";

const { spawnSync } = require("node:child_process");
const { existsSync, readFileSync, writeFileSync } = require("node:fs");
const { createHash } = require("node:crypto");
const path = require("node:path");

/**
 * The Awtsmoos creates each unaltered byte anew;
 * verify the source, the journey, and the receipt before release day.
 * This gate proves local tests, never production deployment or host import.
 */
function verifyShliachBinaryRelease() {
	const root = path.resolve(__dirname, "../..");
	const required = [
		"geelooy/api/tunnel/control/core/binaryArtifactPublication.test.cjs",
		"geelooy/api/tunnel/control/core/binaryArtifactRecovery.test.cjs",
		"geelooy/api/tunnel/control/core/binaryArtifactSecurity.test.cjs",
		"geelooy/api/tunnel/control/core/binaryArtifactSweeper.test.cjs",
		"geelooy/api/tunnel/control/core/binaryArtifactTransfer.test.cjs",
		"geelooy/api/tunnel/control/routes/test/artifactBinaryHttp.test.cjs",
		"geelooy/api/tunnel/control/routes/test/artifactBinarySession.test.cjs",
		"geelooy/apps/tunnel/agent/testing/binaryArtifactUploader.test.cjs"
	];
	const optional = [
		"geelooy/api/tunnel/control/routes/test/artifactMultiFormatRaw.test.cjs",
		"geelooy/api/tunnel/control/routes/test/artifactRealChromeRoundtrip.test.cjs"
	];
	const missing = required.filter((file) => !existsSync(path.join(root, file)));
	if (missing.length) throw Error(`Required release suites missing: ${missing.join(", ")}`);
	const selected = [...required, ...optional.filter((file) => existsSync(path.join(root, file)))];
	const screenshot = process.env.AWTSMOOS_REAL_CHROME_PNG || "";
	const artifact = screenshot ? describeScreenshot(screenshot) : null;
	const startedAt = new Date().toISOString();
	const command = spawnSync(process.execPath, ["--test", ...selected], {
		cwd: root,
		encoding: "utf8",
		maxBuffer: 8 * 1024 * 1024,
		env: process.env
	});
	process.stdout.write(command.stdout || "");
	process.stderr.write(command.stderr || "");
	const successful = command.status === 0 && !command.error;
	const summary = {
		ok: successful,
		kind: "isolated_local_regression_only",
		startedAt,
		finishedAt: new Date().toISOString(),
		selectedSuites: selected,
		chromeScreenshot: artifact,
		controllerDeploymentVerified: false,
		chatgptHostImportVerified: false,
		exitCode: command.status,
		spawnError: command.error?.message || null
	};
	if (process.env.AWTSMOOS_RELEASE_RECEIPT) {
		writeFileSync(process.env.AWTSMOOS_RELEASE_RECEIPT, JSON.stringify(summary, null, 2) + "\n", { flag: "wx" });
	}
	console.log(`SHLIACH_RELEASE_RECEIPT=${JSON.stringify(summary)}`);
	if (!successful) process.exitCode = 1;
}

/** Preserve the original PNG dimensions and whole-file digest without re-encoding. */
function describeScreenshot(file) {
	const bytes = readFileSync(file);
	if (bytes.length < 24 || !bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
		throw Error("Chrome screenshot is not a PNG");
	}
	return {
		bytes: bytes.length,
		width: bytes.readUInt32BE(16),
		height: bytes.readUInt32BE(20),
		sha256: createHash("sha256").update(bytes).digest("hex")
	};
}

verifyShliachBinaryRelease();
