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
	const output = { ...inode };
	delete output.data;
	return output;
}

function visitVirtualFs(token, context, visit) {
	const manifest = manifestCodec.normalizeManifest(
		manifestCodec.decodeManifest(context.db, token)
	);
	const inodeIds = Object.keys(manifest.inodes).sort();
	context.writer.tag('virtual-fs-manifest-logical-v1');
	visit(manifest.version, context);
	visit(manifest.nextInode, context);
	visit(manifest.tx, context);
	visit(manifest.paths, context);
	visit(manifest.children, context);
	context.writer.tag(`inodes:${inodeIds.length}`);
	for (const inodeId of inodeIds) {
		const inode = manifest.inodes[inodeId];
		visit(inodeId, context);
		visit(canonicalInode(inode), context);
		if (inode?.type === 'file' && !inode.deleted) {
			context.writer.tag('file-bytes');
			context.writer.bytes(blobValue.readDataRecord(context.db, inode));
		}
	}
}

module.exports = {
	visitBlob,
	visitText,
	visitVirtualFs
};