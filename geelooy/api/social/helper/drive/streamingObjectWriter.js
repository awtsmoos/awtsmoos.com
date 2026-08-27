//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos carries bytes with backpressure through one incremental flame;
 * Awtsmoos.com hashes, syncs, links, and deduplicates without buffering their frame.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Transform } = require('stream');
const { pipeline } = require('stream/promises');
const { drivePaths, objectPath } = require('./storagePaths.js');

async function streamRequestObject(aliasId, request, expectedBytes, $i = {}) {
	const paths = drivePaths(aliasId, $i);
	const incoming = path.join(paths.root, 'incoming');
	await fs.promises.mkdir(incoming, { recursive: true });
	const temporary = path.join(incoming, `${process.pid}-${crypto.randomUUID()}.tmp`);
	const meter = createMeter(expectedBytes);
	try {
		await pipeline(
			request,
			meter.transform,
			fs.createWriteStream(temporary, { flags: 'wx', mode: 0o600 })
		);
		if (meter.bytes() !== expectedBytes) throw streamError('CONTENT_LENGTH_MISMATCH');
		await syncFile(temporary);
		return await finalizeObject(paths, temporary, meter.digest(), expectedBytes);
	} catch (error) {
		await fs.promises.unlink(temporary).catch(() => {});
		throw error;
	}
}

function createMeter(expectedBytes) {
	let received = 0;
	const hash = crypto.createHash('sha256');
	return {
		transform: new Transform({
			transform(chunk, encoding, callback) {
				received += chunk.length;
				if (received > expectedBytes) return callback(streamError('CONTENT_LENGTH_EXCEEDED'));
				hash.update(chunk);
				callback(null, chunk);
			}
		}),
		bytes: () => received,
		digest: () => hash.digest('hex')
	};
}

async function finalizeObject(paths, temporary, hash, bytes) {
	const destination = objectPath(paths, hash);
	await fs.promises.mkdir(path.dirname(destination), { recursive: true });
	try {
		await fs.promises.link(temporary, destination);
		await fs.promises.unlink(temporary);
		return { hash, bytes, path: destination, created: true };
	} catch (error) {
		await fs.promises.unlink(temporary).catch(() => {});
		if (error.code !== 'EEXIST') throw error;
		return { hash, bytes, path: destination, created: false };
	}
}

async function syncFile(filePath) {
	const handle = await fs.promises.open(filePath, 'r');
	try {
		await handle.sync();
	} finally {
		await handle.close();
	}
}

function streamError(code) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = 400;
	return error;
}

module.exports = {
	streamRequestObject,
	streamError
};
