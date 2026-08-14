// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AwtsmoosDbValueCodec
 * @description
 * The Awtsmoos clothes JavaScript values in AwtsmoosDB bytes and reveals them
 * again without burdening the family-routing bridge with serialization details.
 */
const path = require('path');
const awtsmoosBinary = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');

function serializeValue(value, virtualPath) {
	if (Buffer.isBuffer(value)) return value;
	if (typeof value === 'string') return Buffer.from(value, 'utf8');
	if (path.posix.extname(virtualPath) === '.json') {
		return Buffer.from(JSON.stringify(value ?? null, null, 2), 'utf8');
	}
	return Array.isArray(value)
		? awtsmoosBinary.serializeArray(value)
		: awtsmoosBinary.serializeJSON(value ?? {});
}

async function readBridgeFile(bridge, file, options = {}) {
	const extension = path.posix.extname(file);
	const fileBuffer = bridge.createFileBuffer(file);
	if (extension === '.json') return JSON.parse(fileBuffer.toString('utf8'));
	if (extension !== '.awtsmoosJSON' && extension) {
		return fileBuffer.subarray(0, fileBuffer.length);
	}
	if (!(await awtsmoosBinary.isAwtsmoosObject(fileBuffer))) {
		return fileBuffer.subarray(0, fileBuffer.length);
	}
	if (options.propertyMap || options.arrayFilter) {
		return awtsmoosBinary.mapObject(
			fileBuffer,
			options.propertyMap || {},
			null,
			options.arrayFilter
		);
	}
	return awtsmoosBinary.deserializeBinary(fileBuffer);
}

async function objectKeys(bridge, file) {
	const fileBuffer = bridge.createFileBuffer(file);
	if (!(await awtsmoosBinary.isAwtsmoosObject(fileBuffer))) return [];
	return awtsmoosBinary.getKeys(fileBuffer) || [];
}

module.exports = { objectKeys, readBridgeFile, serializeValue };
