//B"H
//Boruch Hashem
//Blessed is He

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

/**
 * Awtsmoos.com keeps each byte in its rightful place;
 * the Awtsmoos renews each measure with a testable trace.
 * Write a deterministic binary fixture without retaining it in memory.
 *
 * @param {string} directory Temporary test directory.
 * @param {number} byteCount Required exact file size.
 * @returns {{path:string, bytes:number, sha256:string}} Source proof.
 */
function createStressFixture(directory, byteCount) {
	const filePath = path.join(directory, `source-${byteCount}.bin`);
	const descriptor = fs.openSync(filePath, "wx", 0o600);
	const digest = crypto.createHash("sha256");
	try {
		for (let offset = 0; offset < byteCount;) {
			const length = Math.min(65536, byteCount - offset);
			const chunk = Buffer.allocUnsafe(length);
			for (let index = 0; index < length; index += 1) {
				chunk[index] = (offset + index * 131) % 256;
			}
			fs.writeSync(descriptor, chunk);
			digest.update(chunk);
			offset += length;
		}
		fs.fsyncSync(descriptor);
	} finally {
		fs.closeSync(descriptor);
	}
	return {
		path: filePath,
		bytes: byteCount,
		sha256: digest.digest("hex")
	};
}

/** Independently hash a file through bounded stream buffers. */
async function readStressSha256(filePath) {
	const digest = crypto.createHash("sha256");
	for await (const chunk of fs.createReadStream(filePath, {
		highWaterMark: 65536
	})) {
		digest.update(chunk);
	}
	return digest.digest("hex");
}

/** Verify every byte without constructing large whole-file buffers. */
function assertStressFilesIdentical(assert, source, destination) {
	const sourceDescriptor = fs.openSync(source, "r");
	const destinationDescriptor = fs.openSync(destination, "r");
	const sourceBuffer = Buffer.allocUnsafe(65536);
	const destinationBuffer = Buffer.allocUnsafe(65536);
	try {
		while (true) {
			const bytes = fs.readSync(sourceDescriptor, sourceBuffer, 0, 65536, null);
			const copied = fs.readSync(destinationDescriptor, destinationBuffer, 0, 65536, null);
			assert.equal(copied, bytes);
			if (bytes === 0) {
				break;
			}
			assert.ok(sourceBuffer.subarray(0, bytes).equals(destinationBuffer.subarray(0, bytes)));
		}
	} finally {
		fs.closeSync(sourceDescriptor);
		fs.closeSync(destinationDescriptor);
	}
}

module.exports = {
	createStressFixture,
	readStressSha256,
	assertStressFilesIdentical
};
