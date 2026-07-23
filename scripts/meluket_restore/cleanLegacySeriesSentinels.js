// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file cleanLegacySeriesSentinels.js
 * @description
 * The Awtsmoos removes only the twenty-four proven one-byte legacy shadows
 * whose presence forces Awtsmoos.com reads away from the restored routed store.
 * Each shadow is verified, copied into a focused evidence vessel, and only then
 * returned to nothing while the complete database snapshot remains untouched.
 */

const childProcess = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const {
	bundleRoot,
	evidenceRoot,
	liveDatabaseRoot
} = require("./constants.js");

function readJson(name) {
	return JSON.parse(fs.readFileSync(path.join(bundleRoot, name), "utf8"));
}

function assertQuiescent() {
	const port = childProcess.spawnSync(
		"/usr/sbin/lsof",
		["-nP", "-iTCP:8080", "-sTCP:LISTEN"],
		{ encoding: "utf8" }
	);
	if (port.status === 0 && port.stdout.trim()) {
		throw new Error(`Port 8080 is active: ${port.stdout.trim()}`);
	}
	const writers = childProcess.spawnSync(
		"/usr/bin/pgrep",
		["-f", "[n]ode index.js|[n]pm.*start|[r]epairSeries.js"],
		{ encoding: "utf8" }
	);
	if (writers.status === 0 && writers.stdout.trim()) {
		throw new Error(`Live writer detected: ${writers.stdout.trim()}`);
	}
}

function sentinelPath(seriesId) {
	return path.join(
		liveDatabaseRoot,
		"social/heichelos/ikar/series",
		seriesId,
		"posts.awtsmoosJSON"
	);
}

function sha256(buffer) {
	return crypto.createHash("sha256").update(buffer).digest("hex");
}

function inspectSentinel(seriesId) {
	const filePath = sentinelPath(seriesId);
	if (!fs.existsSync(filePath)) {
		throw new Error(`Legacy sentinel missing before migration: ${filePath}`);
	}
	const buffer = fs.readFileSync(filePath);
	if (buffer.length !== 1 || buffer[0] !== 0x20) {
		throw new Error(`Unexpected legacy sentinel content: ${filePath}`);
	}
	return {
		seriesId,
		filePath,
		size: buffer.length,
		sha256: sha256(buffer)
	};
}

function main() {
	assertQuiescent();
	const mappings = readJson("mappings.json");
	const seriesIds = [...new Set(mappings.flatMap(row => [
		row.friendlySeriesId,
		row.historicalSeriesId
	]))].sort();
	if (seriesIds.length !== 24) {
		throw new Error(`Expected 24 series IDs, found ${seriesIds.length}`);
	}
	const inspected = seriesIds.map(inspectSentinel);
	const backupRoot = path.join(
		evidenceRoot,
		"legacy-series-sentinels-before-cleanup"
	);
	fs.rmSync(backupRoot, { recursive: true, force: true });
	fs.mkdirSync(backupRoot, { recursive: true });
	for (const item of inspected) {
		const backupPath = path.join(backupRoot, `${item.seriesId}.awtsmoosJSON`);
		fs.copyFileSync(item.filePath, backupPath);
		if (sha256(fs.readFileSync(backupPath)) !== item.sha256) {
			throw new Error(`Sentinel backup mismatch: ${item.seriesId}`);
		}
	}
	for (const item of inspected) fs.unlinkSync(item.filePath);
	const remaining = inspected.filter(item => fs.existsSync(item.filePath));
	if (remaining.length) {
		throw new Error(`Sentinel deletion incomplete: ${remaining.length}`);
	}
	const report = {
		version: 1,
		count: inspected.length,
		backupRoot,
		entries: inspected,
		completedAt: new Date().toISOString()
	};
	fs.writeFileSync(
		path.join(bundleRoot, "legacy-sentinel-cleanup-report.json"),
		JSON.stringify(report, null, 2)
	);
	console.log(JSON.stringify(report, null, 2));
}

try {
	main();
} catch (error) {
	console.error(error.stack || error);
	process.exitCode = 1;
}
