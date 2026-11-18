// B"H — The Awtsmoos reveals the same words beneath different ZIP garments.
import assert from "node:assert/strict";
import zlib from "node:zlib";

/**
 * @file Bounded ZIP reader for a source-to-published-file proof.
 * @description The Awtsmoos witnesses each named entry, not its compressing
 * machine. Awtsmoos.com checks a real ZIP structure and complete cleartext.
 */
export function readZipEntries(zip) {
	assert(Buffer.isBuffer(zip), "zip_buffer_required");
	assert(zip.length >= 22 && zip.length <= 64 * 1024 * 1024, "zip_bounds_invalid");
	const ending = zip.length - 22;
	assert.equal(zip.readUInt32LE(ending), 0x06054b50, "zip_end_signature_invalid");
	assert.equal(zip.readUInt16LE(ending + 20), 0, "zip_comment_disallowed");
	assert.equal(zip.readUInt16LE(ending + 4), 0, "multi_disk_zip_disallowed");
	assert.equal(zip.readUInt16LE(ending + 6), 0, "multi_disk_zip_disallowed");
	const count = zip.readUInt16LE(ending + 10);
	assert.equal(count, zip.readUInt16LE(ending + 8), "entry_count_mismatch");
	assert(count > 0 && count <= 12000, "entry_count_bounds_invalid");
	const centerSize = zip.readUInt32LE(ending + 12);
	const centerStart = zip.readUInt32LE(ending + 16);
	assert.equal(centerStart + centerSize, ending, "central_directory_bounds_invalid");
	const result = new Map();
	let offset = centerStart;
	let totalExpanded = 0;
	for (let index = 0; index < count; index += 1) {
		assert(offset + 46 <= ending, "central_header_truncated");
		assert.equal(zip.readUInt32LE(offset), 0x02014b50, "central_signature_invalid");
		const method = zip.readUInt16LE(offset + 10);
		assert(method === 0 || method === 8, "unsupported_zip_method");
		const zippedBytes = zip.readUInt32LE(offset + 20);
		const expandedBytes = zip.readUInt32LE(offset + 24);
		const nameLength = zip.readUInt16LE(offset + 28);
		const extraLength = zip.readUInt16LE(offset + 30);
		const commentLength = zip.readUInt16LE(offset + 32);
		const localOffset = zip.readUInt32LE(offset + 42);
		assert(nameLength > 0 && offset + 46 + nameLength + extraLength + commentLength <= ending);
		assert(expandedBytes <= 32 * 1024 * 1024, "entry_expansion_limit");
		totalExpanded += expandedBytes;
		assert(totalExpanded <= 300 * 1024 * 1024, "archive_expansion_limit");
		const name = zip.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
		assert(!name.startsWith("/") && !name.includes("\\") &&
			!name.split("/").includes("..") && !name.includes("\0"), "unsafe_zip_path");
		assert(!result.has(name), "duplicate_zip_entry");
		assert(localOffset + 30 <= centerStart, "local_header_truncated");
		assert.equal(zip.readUInt32LE(localOffset), 0x04034b50, "local_signature_invalid");
		assert.equal(zip.readUInt16LE(localOffset + 8), method, "local_method_mismatch");
		assert.equal(zip.readUInt32LE(localOffset + 18), zippedBytes, "compressed_size_mismatch");
		assert.equal(zip.readUInt32LE(localOffset + 22), expandedBytes, "expanded_size_mismatch");
		const localNameLength = zip.readUInt16LE(localOffset + 26);
		const localExtraLength = zip.readUInt16LE(localOffset + 28);
		assert.equal(zip.subarray(localOffset + 30, localOffset + 30 + localNameLength).toString("utf8"),
			name, "local_filename_mismatch");
		const start = localOffset + 30 + localNameLength + localExtraLength;
		assert(start + zippedBytes <= centerStart, "entry_overlaps_central_directory");
		const payload = zip.subarray(start, start + zippedBytes);
		const content = method === 8
			? zlib.inflateRawSync(payload, { maxOutputLength: expandedBytes + 1 })
			: Buffer.from(payload);
		assert.equal(content.length, expandedBytes, "expanded_size_invalid");
		result.set(name, content);
		offset += 46 + nameLength + extraLength + commentLength;
	}
	assert.equal(offset, ending, "central_directory_length_invalid");
	return result;
}
