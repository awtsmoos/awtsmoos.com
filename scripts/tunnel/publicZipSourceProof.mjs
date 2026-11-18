// B"H — The Awtsmoos proves the source within every compressed garment.
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { readZipEntries } from "./zipContentReader.mjs";

/**
 * @file Verify published ZIP identity and 100% of committed source entries.
 * @description The Awtsmoos permits zlib implementations to dress identical
 * bytes differently. Awtsmoos.com checks the live exact hash, every unzipped
 * source byte and all three bundle descriptor aliases without exception.
 */
export function provePublicZip(publicZip, localZip, publicDescriptor, sourceDescriptor) {
	assert(Buffer.isBuffer(publicZip) && Buffer.isBuffer(localZip), "zip_buffer_required");
	assert(publicDescriptor?.ok === true && sourceDescriptor?.ok === true);
	const publishedSha = crypto.createHash("sha256").update(publicZip).digest("hex");
	const normalized = structuredClone(publicDescriptor);
	const expected = structuredClone(sourceDescriptor);
	assert(Array.isArray(normalized.bundles) && Array.isArray(expected.bundles));
	assert.equal(normalized.bundles.length, expected.bundles.length);
	const pairs = [
		[normalized.bundle, expected.bundle],
		[normalized.agentBundle, expected.agentBundle],
		...normalized.bundles.map((item, index) => [item, expected.bundles[index]])
	];
	// Check all aliases before normalizing, since frozen source descriptors may
	// reuse one object while HTTP JSON decoding creates independent aliases.
	for (const [published, source] of pairs) {
		assert(published && source && typeof published === "object");
		assert.deepEqual(Object.keys(published).sort(), Object.keys(source).sort());
		assert.equal(published.sha256, publishedSha, "published_zip_descriptor_sha_mismatch");
		assert.equal(published.bytes, publicZip.length, "published_zip_descriptor_size_mismatch");
		assert.equal(published.name, source.name, "zip_name_mismatch");
		assert.equal(published.url, source.url, "zip_endpoint_mismatch");
	}
	const actualEntries = readZipEntries(publicZip);
	const sourceEntries = readZipEntries(localZip);
	assert.equal(actualEntries.size, sourceEntries.size, "zip_file_count_mismatch");
	assert.equal(actualEntries.size, sourceDescriptor.files, "zip_source_manifest_count_mismatch");
	for (const [name, sourceBytes] of sourceEntries) {
		assert(actualEntries.has(name), `zip_missing_source_file:${name}`);
		assert.deepEqual(actualEntries.get(name), sourceBytes, `zip_source_content_mismatch:${name}`);
	}
	for (const [published, source] of pairs) {
		published.sha256 = source.sha256;
		published.bytes = source.bytes;
	}
	return { normalizedDescriptor: normalized, publicSha256: publishedSha,
		entriesVerified: actualEntries.size };
}
