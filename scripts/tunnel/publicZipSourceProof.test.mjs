// B"H — The Awtsmoos tests a truthful ZIP even when its garment changes.
import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { provePublicZip } from "./publicZipSourceProof.mjs";

/**
 * @file Compression variance and fail-closed ZIP integrity contracts.
 * @description Awtsmoos.com rejects tampering and changes to committed bytes,
 * while accepting valid compressor differences in fully signed ZIP artifacts.
 */
const require = createRequire(import.meta.url);
const { buildZip } = require("../../geelooy/api/tunnel/install/tools/zipWriter.js");
const Descriptor = require("../../geelooy/api/tunnel/install/tools/bundleDescriptor.js");
const hash = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const entries = [
	{ path: "lib/command.js", data: Buffer.from("B\"H COMMAND ".repeat(150)) },
	{ path: "lib/response.js", data: Buffer.from("Awtsmoos response ".repeat(170)) },
	{ path: "tools/state.txt", data: Buffer.from("state".repeat(40)) }
];
const sealed = buildZip(entries, { method: "deflate" });
const source = buildZip(entries, { method: "store" });
function descriptor(buffer) {
	const value = Descriptor.build({ version: "1.0-test", files: entries.length,
		manifestSha256: "b".repeat(64), releaseSourceSha: "a".repeat(40),
		sha256: hash(buffer), bytes: buffer.length });
	return JSON.parse(JSON.stringify(value));
}

test("compression variance preserves published SHA and all source contents", () => {
	assert.notEqual(hash(sealed), hash(source));
	const proof = provePublicZip(sealed, source, descriptor(sealed), descriptor(source));
	assert.equal(proof.entriesVerified, entries.length);
	assert.equal(proof.publicSha256, hash(sealed));
	assert.deepEqual(proof.normalizedDescriptor, descriptor(source));
});

test("tampered public ZIP is rejected even with intact descriptor", () => {
	const damaged = Buffer.from(sealed);
	damaged[120] ^= 1;
	assert.throws(() => provePublicZip(damaged, source, descriptor(sealed), descriptor(source)),
		/published_zip_descriptor_sha_mismatch/);
});

test("a forged descriptor cannot claim an altered bundle", () => {
	const forged = descriptor(sealed);
	forged.bundles[0].bytes += 1;
	assert.throws(() => provePublicZip(sealed, source, forged, descriptor(source)),
		/published_zip_descriptor_size_mismatch/);
});

test("a published ZIP containing changed source bytes is rejected", () => {
	const changed = entries.map(item => ({ ...item, data: Buffer.from(item.data) }));
	changed[0].data[0] ^= 1;
	const alteredZip = buildZip(changed, { method: "deflate" });
	assert.throws(() => provePublicZip(alteredZip, source,
		descriptor(alteredZip), descriptor(source)), /zip_source_content_mismatch/);
});

test("duplicated paths are rejected even when descriptor SHA is correct", () => {
	const duplicate = buildZip([entries[0], entries[0]], { method: "store" });
	assert.throws(() => provePublicZip(duplicate, duplicate,
		descriptor(duplicate), descriptor(duplicate)), /duplicate_zip_entry/);
});

test("truncated archives are rejected before source proof", () => {
	const truncated = sealed.subarray(0, sealed.length - 14);
	assert.throws(() => provePublicZip(truncated, source,
		descriptor(truncated), descriptor(source)), /zip_end_signature_invalid/);
});
