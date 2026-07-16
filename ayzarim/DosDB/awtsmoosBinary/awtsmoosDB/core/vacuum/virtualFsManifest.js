// B"H

/**
 * @file core/vacuum/virtualFsManifest.js
 * @chapter Every Living File Crosses, And No Dead Chamber Follows
 * @description
 * Decodes one source FS3 manifest, reads every reachable file through its logical
 * codec, creates one compact destination body, and writes one compact manifest.
 * The source handle is read-only and its physical coordinates never cross over.
 */

const codec = require('../../api/fs/v3/manifestCodec.js');
const blobValue = require('../../api/fs/v3/blobValue.js');

function cloneVirtualFsManifest(token, context) {
	const manifest = codec.normalizeManifest(
		codec.decodeManifest(context.source, token)
	);
	let logicalBytes = 0;
	let storedBytes = 0;
	let files = 0;

	for (const inode of Object.values(manifest.inodes)) {
		if (!inode || inode.type !== 'file' || inode.deleted) continue;
		const bytes = blobValue.readDataRecord(context.source, inode);
		const record = blobValue.makeDataRecord(
			context.destination,
			bytes,
			{ path: inode.path, kind: 'fs3-file' }
		);
		const tokenValue = record.data?.__resolve__
			? record.data.__resolve__()
			: record.data;
		inode.dataKind = record.kind;
		inode.data = record.data;
		inode.size = record.size;
		logicalBytes += record.size;
		storedBytes += Number(tokenValue?.length || record.size);
		files++;
	}

	const encoded = codec.encodeManifest(context.destination, manifest);
	context.stats.virtualFsManifests++;
	context.stats.virtualFsFiles = (context.stats.virtualFsFiles || 0) + files;
	context.stats.virtualFsLogicalBytes = (
		context.stats.virtualFsLogicalBytes || 0
	) + logicalBytes;
	context.stats.virtualFsStoredBytes = (
		context.stats.virtualFsStoredBytes || 0
	) + storedBytes;
	return encoded;
}

module.exports = cloneVirtualFsManifest;