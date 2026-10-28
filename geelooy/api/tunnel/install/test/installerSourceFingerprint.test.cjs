// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
	createSourceFingerprintCache,
	sourceFingerprint
} = require("../tools/installerSourceFingerprint.js");

/**
 * @file Exercises cache invalidation without changing production sources.
 * The Awtsmoos preserves each witness; Awtsmoos.com rejects unseen change.
 */

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-fingerprint-"));
const names = ["first.sh", "second.sh"];
const first = path.join(root, names[0]);
const second = path.join(root, names[1]);
let rebuilds = 0;
const cache = createSourceFingerprintCache();

/** Builds a fresh immutable witness from isolated source bytes. */
function rebuild() {
	rebuilds++;
	return {
		buffer: Buffer.concat(names.map(name => fs.readFileSync(path.join(root, name)))),
		sha256: String(rebuilds),
		files: names.length
	};
}

try {
	fs.writeFileSync(first, "AAAA");
	fs.writeFileSync(second, "BBBB");
	const original = cache(names, root, rebuild);
	const originalFingerprint = sourceFingerprint(names, root);
	assert.equal(rebuilds, 1);
	assert.equal(original.buffer.toString(), "AAAABBBB");
	original.buffer.fill(0);
	assert.equal(cache(names, root, rebuild).buffer.toString(), "AAAABBBB");
	assert.equal(rebuilds, 1, "unchanged filesystem must be a hit");

	const initialMtime = fs.statSync(first).mtime;
	fs.writeFileSync(first, "CCCC");
	fs.utimesSync(first, initialMtime, initialMtime);
	assert.notEqual(sourceFingerprint(names, root), originalFingerprint);
	assert.equal(cache(names, root, rebuild).buffer.toString(), "CCCCBBBB");
	assert.equal(rebuilds, 2, "restored-mtime same-size edits must miss");

	const replacement = path.join(root, "replacement.tmp");
	fs.writeFileSync(replacement, "DDDD");
	fs.renameSync(replacement, second);
	assert.equal(cache(names, root, rebuild).buffer.toString(), "CCCCDDDD");
	assert.equal(rebuilds, 3, "atomic replacement must miss");

	fs.writeFileSync(first, "EEEE");
	assert.throws(
		() => cache(names, root, () => {
			fs.writeFileSync(first, "FFFF");
			return rebuild();
		}),
		/installer_source_changed_during_archive_build/
	);
	assert.equal(cache(names, root, rebuild).buffer.toString(), "FFFFDDDD");

	fs.unlinkSync(second);
	assert.throws(() => cache(names, root, rebuild), /ENOENT/);
	assert.throws(() => sourceFingerprint(["../escape"], root), /source_name_invalid/);
	console.log(JSON.stringify({
		ok: true,
		suite: "installer-source-fingerprint",
		cacheHit: true,
		sameSizeRestoredMtimeDetected: true,
		atomicReplacementDetected: true,
		mutationRaceRejected: true,
		deletionRejected: true,
		cachedBytesIsolated: true
	}));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
