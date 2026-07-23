// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file installLegacySeriesFiles.js
 * @description
 * The Awtsmoos forms twenty-four healthy legacy series objects through DosDB's
 * own serializer, then places them atomically where the outer social reader is
 * explicitly designed to prefer them over the broken routed one-byte shadows.
 * No packed family file is edited, and every vessel is staged, reread, hashed,
 * backed up, installed, and verified before Awtsmoos.com may awaken again.
 */

const childProcess = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const DosDB = require("../../ayzarim/DosDB/index.js");
const {
	bundleRoot,
	evidenceRoot,
	liveDatabaseRoot
} = require("./constants.js");

function readJson(name) {
	return JSON.parse(fs.readFileSync(path.join(bundleRoot, name), "utf8"));
}

function sha256(filePath) {
	return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
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
		["-f", "[n]ode index.js|[n]pm.*start|[r]epairSeries.js|[i]nstallLegacySeriesFiles.js"],
		{ encoding: "utf8" }
	);
	const currentPid = String(process.pid);
	const foreign = writers.stdout
		.split(/\s+/)
		.filter(Boolean)
		.filter(pid => pid !== currentPid);
	if (writers.status === 0 && foreign.length) {
		throw new Error(`Live writer detected: ${foreign.join(",")}`);
	}
	if (writers.status !== 0 && writers.status !== 1) {
		throw new Error(`Unable to inspect writers: ${writers.stderr}`);
	}
}

function targetPath(seriesId) {
	return path.join(
		liveDatabaseRoot,
		"social/heichelos/ikar/series",
		seriesId,
		"posts.awtsmoosJSON"
	);
}

function compatibilityRecord(record, seriesId) {
	return {
		...record,
		seriesId,
		parentSeriesId: seriesId,
		options: {
			...record.options,
			compatibilityMirror: true
		}
	};
}

async function stagePayload({ stagingRoot, payload }) {
	fs.rmSync(stagingRoot, {
		recursive: true,
		force: true
	});
	const db = new DosDB(stagingRoot);
	await db.init();
	await db.write("/payload", payload);
	const reread = await db.get("/payload", {
		max: true
	});
	if (!reread || Buffer.isBuffer(reread)) {
		throw new Error(`Staged payload did not reread as an object: ${stagingRoot}`);
	}
	const expectedIds = Object.keys(payload).sort();
	const actualIds = Object.keys(reread).sort();
	if (JSON.stringify(expectedIds) !== JSON.stringify(actualIds)) {
		throw new Error(`Staged payload IDs differ: ${stagingRoot}`);
	}
	for (const postId of expectedIds) {
		if (reread[postId]?.title !== payload[postId]?.title) {
			throw new Error(`Staged title differs: ${postId}`);
		}
	}
	const filePath = path.join(stagingRoot, "payload.awtsmoosJSON");
	if (!fs.existsSync(filePath)) {
		throw new Error(`Staged file missing: ${filePath}`);
	}
	return filePath;
}

function installFile({ stagedPath, destination, backupRoot }) {
	fs.mkdirSync(path.dirname(destination), {
		recursive: true
	});
	if (fs.existsSync(destination)) {
		const relative = path.relative(liveDatabaseRoot, destination);
		const backupPath = path.join(backupRoot, relative);
		fs.mkdirSync(path.dirname(backupPath), {
			recursive: true
		});
		fs.copyFileSync(destination, backupPath);
	}
	const temporary = `${destination}.meluket-installing`;
	fs.copyFileSync(stagedPath, temporary);
	if (sha256(temporary) !== sha256(stagedPath)) {
		fs.rmSync(temporary, { force: true });
		throw new Error(`Atomic staging hash mismatch: ${destination}`);
	}
	fs.renameSync(temporary, destination);
	if (sha256(destination) !== sha256(stagedPath)) {
		throw new Error(`Installed hash mismatch: ${destination}`);
	}
}

async function verifyInstalled({ seriesRows, recordById }) {
	const db = new DosDB(liveDatabaseRoot);
	await db.init();
	const results = [];
	for (const row of seriesRows) {
		const objectPath = `/social/heichelos/ikar/series/${row.seriesId}/posts`;
		const value = await db.get(objectPath, {
			max: true
		});
		if (!value || Buffer.isBuffer(value)) {
			throw new Error(`Installed series is not an object: ${row.seriesId}`);
		}
		const ids = Object.keys(value).sort();
		const expectedIds = row.postIds.slice().sort();
		if (JSON.stringify(ids) !== JSON.stringify(expectedIds)) {
			throw new Error(`Installed series IDs differ: ${row.seriesId}`);
		}
		for (const postId of expectedIds) {
			const expected = recordById.get(postId);
			if (!expected || value[postId]?.title !== expected.title) {
				throw new Error(`Installed series title differs: ${row.seriesId}/${postId}`);
			}
			const content = value[postId]?.content || value[postId]?.rootContent || "";
			if (!String(content).trim()) {
				throw new Error(`Installed series body is empty: ${row.seriesId}/${postId}`);
			}
		}
		results.push({
			seriesId: row.seriesId,
			postCount: ids.length
		});
	}
	return results;
}

async function main() {
	assertQuiescent();
	const records = readJson("records.json");
	const mappings = readJson("mappings.json");
	const recordById = new Map(records.map(record => [record.id, record]));
	const stagingBase = path.join(evidenceRoot, "legacy-series-file-staging");
	const backupRoot = path.join(evidenceRoot, "legacy-series-files-before-install");
	fs.rmSync(stagingBase, { recursive: true, force: true });
	fs.rmSync(backupRoot, { recursive: true, force: true });
	fs.mkdirSync(stagingBase, { recursive: true });
	fs.mkdirSync(backupRoot, { recursive: true });
	const seriesRows = [];
	for (const month of [...new Set(mappings.map(row => row.month))]) {
		const rows = mappings.filter(row => row.month === month);
		const postIds = rows.map(row => row.newPostId);
		for (const descriptor of [
			{
				seriesId: rows[0].friendlySeriesId,
				compatibility: false
			},
			{
				seriesId: rows[0].historicalSeriesId,
				compatibility: true
			}
		]) {
			const payload = {};
			for (const postId of postIds) {
				const record = recordById.get(postId);
				if (!record) throw new Error(`Bundle record missing: ${postId}`);
				payload[postId] = descriptor.compatibility
					? compatibilityRecord(record, descriptor.seriesId)
					: record;
			}
			const stagingRoot = path.join(
				stagingBase,
				String(seriesRows.length).padStart(2, "0")
			);
			const stagedPath = await stagePayload({
				stagingRoot,
				payload
			});
			const destination = targetPath(descriptor.seriesId);
			installFile({
				stagedPath,
				destination,
				backupRoot
			});
			seriesRows.push({
				month,
				seriesId: descriptor.seriesId,
				compatibility: descriptor.compatibility,
				postIds,
				filePath: destination,
				fileSize: fs.statSync(destination).size,
				sha256: sha256(destination)
			});
		}
	}
	if (seriesRows.length !== 24) {
		throw new Error(`Expected 24 installed series, found ${seriesRows.length}`);
	}
	const verified = await verifyInstalled({
		seriesRows,
		recordById
	});
	const report = {
		version: 1,
		seriesCount: seriesRows.length,
		postIdentityCount: records.length,
		seriesEntryCount: seriesRows.reduce((sum, row) => sum + row.postIds.length, 0),
		backupRoot,
		series: seriesRows,
		verified,
		completedAt: new Date().toISOString()
	};
	fs.writeFileSync(
		path.join(bundleRoot, "legacy-series-install-report.json"),
		JSON.stringify(report, null, 2)
	);
	console.log(JSON.stringify(report, null, 2));
}

main().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
