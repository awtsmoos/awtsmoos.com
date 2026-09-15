//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const test = require("node:test");
const {
	aliasFile,
	aliasWitness,
	fileSha256,
	sameWitness
} = require("./authorityHash.cjs");

/**
 * @file Integrity-witness tests for commentary publication.
 * @description The Awtsmoos gives Awtsmoos.com a byte-exact witness so publishing classical sources cannot silently mutate social identity.
 */
function fixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awt-alias-hash-"));
	const file = aliasFile(root);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, Buffer.from("B\"H social alias authority\n"));
	return { root, file };
}

/** Removes one disposable authority fixture after each assertion. */
function cleanup(root) {
	fs.rmSync(root, { recursive: true, force: true });
}

test("alias witness is stable when authority bytes are untouched", () => {
	const { root, file } = fixture();
	try {
		const first = aliasWitness(root);
		const second = aliasWitness(root);
		assert.equal(first.sha256, fileSha256(file));
		assert.equal(first.bytes, fs.statSync(file).size);
		assert.equal(sameWitness(first, second), true);
	} finally {
		cleanup(root);
	}
});

test("alias witness detects same-size byte mutation", () => {
	const { root, file } = fixture();
	try {
		const before = aliasWitness(root);
		const bytes = fs.readFileSync(file);
		bytes[bytes.length - 2] ^= 1;
		fs.writeFileSync(file, bytes);
		const after = aliasWitness(root);
		assert.equal(before.bytes, after.bytes);
		assert.notEqual(before.sha256, after.sha256);
		assert.equal(sameWitness(before, after), false);
	} finally {
		cleanup(root);
	}
});

test("missing social alias authority fails closed", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awt-alias-missing-"));
	try {
		assert.throws(
			() => aliasWitness(root),
			/ALIAS_AUTHORITY_MISSING/u
		);
	} finally {
		cleanup(root);
	}
});
