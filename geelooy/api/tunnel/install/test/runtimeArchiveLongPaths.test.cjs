// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");
const Tar = require("../tools/installerComponentTar.js");
const Runtime = require("../tools/runtimeBundles.js");

/**
 * @file Protects runtime tar paths, including Merkava's installed marker.
 * @description
 * The Awtsmoos lets long paths stretch without losing their names;
 * Awtsmoos.com carries Merkava from source to install with the same flames.
 */
const MARKER = "scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js";
const BROKEN_MARKER = `geelooy/${MARKER}`;

function withTempDirectory(prefix, work) {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
	try {
		return work(directory);
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
}

function listArchive(buffer, directory) {
	const archive = path.join(directory, "runtime.tar.gz");
	fs.writeFileSync(archive, buffer);
	const listed = cp.spawnSync("tar", ["-tzf", archive], {
		encoding: "utf8",
		timeout: 10000,
		maxBuffer: 8 * 1024 * 1024
	});
	assert.equal(listed.status, 0, listed.stderr);
	return listed.stdout.trim().split("\n");
}

test("USTAR preserves a long Merkava source name", () => {
	const name = "scripts/awtsmoos/MerkavaExecutor/merkava-binary/js-md2/runtime/Mode2RuntimeFeatureInventory.js";
	const prepared = Tar.prepareHeader(name, 12);
	assert.equal(prepared.extensions.length, 0);
	const leaf = prepared.header.toString("utf8", 0, 100).split("\0")[0];
	const prefix = prepared.header.toString("utf8", 345, 500).split("\0")[0];
	assert.equal(prefix ? `${prefix}/${leaf}` : leaf, name);
});

test("POSIX PAX round-trips a 300-byte path", () => {
	const name = `scripts/${"deep-component/".repeat(18)}proof.txt`;
	withTempDirectory("awts-pax-proof-", directory => {
		const archive = path.join(directory, "test.tar");
		fs.writeFileSync(archive, Tar.buildTar([{ name, data: Buffer.from("VERIFIED") }]));
		const listed = cp.spawnSync("tar", ["-tf", archive], { encoding: "utf8", timeout: 2000 });
		assert.equal(listed.status, 0, listed.stderr);
		assert.equal(listed.stdout.trim(), name);
	});
});

test("Merkava runtime archive satisfies installed marker contract", () => {
	const built = Runtime.getBundle("merkava");
	assert.ok(built.bytes > 100000);
	withTempDirectory("awts-real-merkava-tar-", directory => {
		const names = listArchive(built.buffer, directory);
		assert.equal(names.length, built.files);
		assert.ok(names.includes(MARKER), `missing ${MARKER}`);
		assert.ok(!names.includes(BROKEN_MARKER), `unexpected ${BROKEN_MARKER}`);
		assert.ok(names.some(name => name.endsWith("Mode2RuntimeFeatureInventory.js")));
	});
});
