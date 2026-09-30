// B"H

/**
 * @file core/vacuum/virtualFsManifest.js
 * @chapter Every Living File Crosses, And No Dead Chamber Follows
 * @description
 * Migrates one legacy FS3 manifest blob token into per-inode native records
 * in the destination database (see api/fs/v3/storeState.js for the record
 * layout). New-format sources need no special handling: their records cross
 * as ordinary root values through the generic copier.
 *
 * The source handle is read-only and its physical coordinates never cross over.
 * Records are written in bounded chunks so migration RAM stays flat.
 */

const codec = require('../../api/fs/v3/manifestCodec.js');
const blobValue = require('../../api/fs/v3/blobValue.js');
const { recordKeys } = require('../../api/fs/v3/storeState.js');

const SKIP_ROOT_WRITE = Symbol('awtsmoos.fs3.manifest.migrated.to.records');
const CHUNK = 5000;

function cloneVirtualFsManifest(token, context) {
	const manifest = codec.normalizeManifest(
		codec.decodeManifest(context.source, token)
	);
	const destination = context.destination;
	let logicalBytes = 0;
	let storedBytes = 0;
	let files = 0;

	const ids = Object.keys(manifest.inodes);
	for (let i = 0; i < ids.length; i += CHUNK) {
		destination.batch(() => {
			for (const id of ids.slice(i, i + CHUNK)) {
				const inode = manifest.inodes[id];
				if (!inode || inode.deleted) continue;
				const next = { ...inode };
				if (next.type === 'file') {
					const bytes = blobValue.readDataRecord(context.source, inode);
					const record = blobValue.makeDataRecord(
						destination,
						bytes,
						{ path: inode.path, kind: 'fs3-file' }
					);
					const tokenValue = record.data?.__resolve__
						? record.data.__resolve__()
						: record.data;
					next.dataKind = record.kind;
					next.data = record.data;
					next.size = record.size;
					logicalBytes += record.size;
					storedBytes += Number(tokenValue?.length || record.size);
					files++;
				}
				destination.root[recordKeys.inodeKey(id)] = next;
			}
		});
	}

	const dirIds = Object.keys(manifest.children || {});
	for (let i = 0; i < dirIds.length; i += CHUNK) {
		destination.batch(() => {
			for (const dirId of dirIds.slice(i, i + CHUNK)) {
				destination.root[recordKeys.childKey(dirId)] = { ...manifest.children[dirId] };
			}
		});
	}

	destination.batch(() => {
		destination.root[recordKeys.META_KEY] = {
			__fs3Meta: true,
			version: 3,
			nextInode: manifest.nextInode,
			tx: {
				active: null,
				lastCommitted: Number(manifest.tx?.lastCommitted) || 0
			}
		};
	});

	context.stats.virtualFsManifests++;
	context.stats.virtualFsFiles = (context.stats.virtualFsFiles || 0) + files;
	context.stats.virtualFsLogicalBytes = (
		context.stats.virtualFsLogicalBytes || 0
	) + logicalBytes;
	context.stats.virtualFsStoredBytes = (
		context.stats.virtualFsStoredBytes || 0
	) + storedBytes;
	return SKIP_ROOT_WRITE;
}

cloneVirtualFsManifest.SKIP_ROOT_WRITE = SKIP_ROOT_WRITE;
module.exports = cloneVirtualFsManifest;
