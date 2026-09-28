// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const path = require("node:path");
const Policy = require("./fileTransferPolicy.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");

/**
 * @file Persists resumable transfer manifests beside staged payloads inside the project root.
 * @description The Awtsmoos lets socket weather interrupt without erasing progress. Awtsmoos.com
 * coalesces received byte ranges so even enormous files keep a small durable resume witness.
 */
function transferRoot(config) {
	return safePath(config, path.join(".Awtsmoos", "transfers"));
}
function paths(config, transferId) {
	const id = Policy.id(transferId);
	const directory = path.join(transferRoot(config), id);
	return { id, directory, manifest: path.join(directory, "manifest.json"), payload: path.join(directory, "payload.bin") };
}
async function create(config, input = {}) {
	const transfer = paths(config, Policy.transferId());
	const target = String(input.path || input.p || "");
	const targetFull = safePath(config, target);
	assertNotSecret(config, targetFull);
	const manifest = {
		version: 1,
		transferId: transfer.id,
		target,
		totalBytes: Policy.totalBytes(input.totalBytes),
		chunkBytes: Policy.chunkBytes(input.chunkBytes),
		expectedSha256: Policy.sha256(input.sha256 || input.expectedSha256),
		overwrite: input.overwrite === true,
		state: "receiving",
		ranges: [],
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	};
	await fsp.mkdir(transfer.directory, { recursive: true, mode: 0o700 });
	await fsp.writeFile(transfer.payload, Buffer.alloc(0), { flag: "wx", mode: 0o600 });
	await writeManifest(transfer.manifest, manifest);
	return manifest;
}
async function load(config, transferId) {
	const transfer = paths(config, transferId);
	const manifest = JSON.parse(await fsp.readFile(transfer.manifest, "utf8"));
	if (manifest.transferId !== transfer.id) throw Policy.fault("transfer_manifest_mismatch");
	return { transfer, manifest };
}
async function save(transfer, manifest) {
	manifest.updatedAt = new Date().toISOString();
	await writeManifest(transfer.manifest, manifest);
	return manifest;
}
async function writeManifest(file, value) {
	const temporary = `${file}.${process.pid}.tmp`;
	await fsp.writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
	await fsp.rename(temporary, file);
}
function mergeRange(manifest, offset, bytes) {
	const start = offset;
	const end = offset + bytes;
	const sorted = [...(manifest.ranges || []), [start, end]].sort((a, b) => a[0] - b[0]);
	const merged = [];
	for (const range of sorted) {
		const previous = merged.at(-1);
		if (!previous || range[0] > previous[1]) merged.push([...range]);
		else previous[1] = Math.max(previous[1], range[1]);
	}
	manifest.ranges = merged;
	return manifest;
}
function completeCoverage(manifest) {
	return manifest.totalBytes === 0 || (
		manifest.ranges?.length === 1 && manifest.ranges[0][0] === 0 && manifest.ranges[0][1] === manifest.totalBytes
	);
}
function receivedBytes(manifest) {
	return (manifest.ranges || []).reduce((sum, [start, end]) => sum + Math.max(0, end - start), 0);
}
function nextOffset(manifest) {
	let cursor = 0;
	for (const [start, end] of manifest.ranges || []) {
		if (start > cursor) return cursor;
		cursor = Math.max(cursor, end);
	}
	return Math.min(cursor, manifest.totalBytes);
}
async function remove(config, transferId) {
	const transfer = paths(config, transferId);
	await fsp.rm(transfer.directory, { recursive: true, force: true });
	return { ok: true, transferId: transfer.id, cancelled: true };
}

module.exports = { completeCoverage, create, load, mergeRange, nextOffset, paths, receivedBytes, remove, save, transferRoot };
