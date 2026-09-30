// B"H

/**
 * @file core/vacuum/semanticSpecial.js
 * @chapter Meaning Is Weighed After Every Coordinate And Codec Falls Away
 * @description
 * Hashes ordinary blobs and texts by body bytes. FS3 is different: its manifest
 * contains physical body tokens, so the digest weighs canonical inode metadata and
 * original file bytes while ignoring offsets, stored lengths, and compression.
 */

const manifestCodec = require('../../api/fs/v3/manifestCodec.js');
const blobValue = require('../../api/fs/v3/blobValue.js');
const { recordKeys, isFs3RecordKey, inodeIdFromKey } = require('../../api/fs/v3/storeState.js');

function visitBlob(token, context, visit) {
	context.writer.tag('blob');
	visit(token.id, context);
	visit(token.meta || {}, context);
	context.writer.number(token.length);
	let offset = 0;
	while (offset < token.length) {
		const length = Math.min(1024 * 1024, token.length - offset);
		context.writer.bytes(context.db.blob.read(token, offset, length));
		offset += length;
	}
}

function visitText(token, context, visit) {
	context.writer.tag('text');
	visit(token.id, context);
	visit(token.chunkChars, context);
	visit(token.chars, context);
	visit(token.bytes, context);
	for (const block of token.blocks) {
		visit(block.chars, context);
		visit(block.bytes, context);
		visitBlob(block.blob, context, visit);
	}
}

function canonicalInode(inode) {
	// Fixed key order on every path: the digest must be byte-identical
	// whether the inode came from a legacy manifest blob or a record.
	return {
		id: inode.id,
		type: inode.type,
		name: inode.name,
		parent: inode.parent,
		path: inode.path,
		size: inode.size,
		ctime: inode.ctime,
		mtime: inode.mtime,
		version: inode.version,
		deleted: !!inode.deleted
	};
}

function canonicalTx(tx) {
	const t = tx && typeof tx === 'object' ? tx : {};
	return {
		active: t.active === undefined ? null : t.active,
		lastCommitted: Number(t.lastCommitted) || 0
	};
}

function canonicalChildren(children) {
	const out = {};
	for (const dirId of Object.keys(children || {}).sort()) {
		const names = children[dirId];
		const sorted = {};
		if (names && typeof names === 'object') {
			for (const name of Object.keys(names).sort()) sorted[name] = names[name];
		}
		out[dirId] = sorted;
	}
	return out;
}

// One shared logical stream for both layouts. A legacy manifest blob and a
// migrated record store weigh every logical byte identically: version,
// transaction mark, normalized child maps, canonical inode metadata, and
// original file bytes. Physical coordinates, stored lengths, codecs, and the
// historical path table never enter the digest.
function visitVirtualFsLogical(logical, context, visit) {
	// Deleted inodes are vacuumed away on both layouts; they carry no bytes
	// and never enter the digest.
	const inodeIds = Object.keys(logical.inodes)
		.filter(id => !logical.inodes[id]?.deleted)
		.sort();
	context.writer.tag('virtual-fs-manifest-logical-v1');
	visit(logical.version, context);
	visit(logical.nextInode, context);
	visit(canonicalTx(logical.tx), context);
	visit(canonicalChildren(logical.children), context);
	context.writer.tag(`inodes:${inodeIds.length}`);
	for (const inodeId of inodeIds) {
		const inode = logical.inodes[inodeId];
		visit(inodeId, context);
		visit(canonicalInode(inode), context);
		if (inode?.type === 'file' && !inode.deleted) {
			context.writer.tag('file-bytes');
			context.writer.bytes(logical.fileBytes(inodeId, inode));
		}
	}
}

function visitVirtualFs(token, context, visit) {
	const manifest = manifestCodec.normalizeManifest(
		manifestCodec.decodeManifest(context.db, token)
	);
	visitVirtualFsLogical({
		version: manifest.version,
		nextInode: manifest.nextInode,
		tx: manifest.tx,
		children: manifest.children,
		inodes: manifest.inodes,
		fileBytes: (id, inode) => blobValue.readDataRecord(context.db, inode)
	}, context, visit);
}

// Reconstructs the logical manifest view from the per-inode record layout
// (see api/fs/v3/storeState.js) and weighs it through the same stream, so a
// vacuumed record store digests identically to its legacy source.
function visitVirtualFsRecords(db, context, visit) {
	const rawMeta = db.root[recordKeys.META_KEY];
	const meta = rawMeta && rawMeta.__resolve__ ? rawMeta.__resolve__() : rawMeta;
	const inodes = {};
	const children = {};
	for (const key of db.keys(db.root)) {
		const text = String(key);
		if (text.startsWith(recordKeys.INODE_PREFIX)) {
			const inode = db.root[key];
			inodes[inodeIdFromKey(text)] = inode && inode.__resolve__ ? inode.__resolve__() : inode;
		} else if (text.startsWith(recordKeys.CHILD_PREFIX)) {
			const value = db.root[key];
			children[text.slice(recordKeys.CHILD_PREFIX.length)] =
				value && value.__resolve__ ? value.__resolve__() : value;
		}
	}
	visitVirtualFsLogical({
		version: 3,
		nextInode: Number(meta?.nextInode) || 0,
		tx: meta?.tx,
		children,
		inodes,
		fileBytes: (id, inode) => blobValue.readDataRecord(db, inode)
	}, context, visit);
}

module.exports = {
	visitBlob,
	visitText,
	visitVirtualFs,
	visitVirtualFsRecords
};