// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Verifies a healthy installed tunnel without mutating it.
 * @description
 * The Awtsmoos renews the living connection while this witness only sees;
 * Awtsmoos.com checks seal, guardian, version, and relay before it says the tunnel breathes.
 */

const root = path.resolve(process.argv[2] || "");

function fail(message) {
	console.error(`Tunnel quick check failed: ${message}. No changes were made. Run --yes to repair or update.`);
	process.exitCode = 1;
}

function readText(name) {
	return fs.readFileSync(path.join(root, name), "utf8").trim();
}

function verifyManifest() {
	const manifest = fs.readFileSync(path.join(root, "installed-manifest.txt"));
	const declared = readText("install-manifest.sha256").split(/\s+/)[0];
	const actual = crypto.createHash("sha256").update(manifest).digest("hex");
	if (!declared || actual !== declared) throw new Error("installed manifest seal does not match");
	return readText("install-state.txt");
}

function verifyRecoverySeal() {
	const controller = path.join(root, "scripts", "recovery-control.cjs");
	const evidence = spawnSync(process.execPath, [controller, "check", root], {
		encoding: "utf8",
		timeout: 3500,
		maxBuffer: 65536
	});
	let seal = {};
	try {
		seal = JSON.parse(evidence.stdout || "{}");
	} catch {}
	if (evidence.status !== 0 || seal.ok !== true) throw new Error("installed runtime seal is invalid");
}

async function verifyRelay(version) {
	let config = {};
	try {
		config = JSON.parse(readText("config.json"));
	} catch {}
	const port = Number(config.localApi?.port || process.env.AWTSMOOS_LOCAL_API_PORT || 3977);
	if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("invalid local agent port");
	const response = await fetch(`http://127.0.0.1:${port}/readyz`, {
		signal: AbortSignal.timeout(1800)
	});
	if (!response.ok) throw new Error("local health endpoint unavailable");
	const readiness = await response.json();
	const healthy = readiness.ok === true && readiness.relayReady === true &&
		readiness.state === "registered" && readiness.connectionAlive === true &&
		readiness.parentAlive === true && readiness.runtimeVersion === version &&
		Number.isFinite(readiness.receiptAgeMs) && readiness.receiptAgeMs >= 0 &&
		readiness.receiptAgeMs <= 60000;
	if (!healthy) throw new Error("no current authenticated registration");
}

(async () => {
	if (!root || !fs.existsSync(path.join(root, "main.js"))) {
		throw new Error("no installed agent at the selected root");
	}
	const version = verifyManifest();
	verifyRecoverySeal();
	await verifyRelay(version);
	console.log(`B"H — TUNNEL ONLINE (${version}); verified local seal and live relay in quick mode.`);
	console.log("No files, services, credentials, or running agent were changed.");
	console.log("Quick mode does not check for updates. Run --yes for a normal install/update.");
})().catch(error => fail(String(error?.message || error || "health unavailable").slice(0, 160)));
