// B"H

/**
 * @file core/verifier/virtualFsVisitor.js
 * @chapter Every Hidden File Remains Reachable After The Map Is Folded
 * @description
 * Decodes legacy or compressed FS3 manifests through the canonical codec, then
 * marks every nested ABLB/ATXT body. Physical compression never disguises a live
 * filesystem body as free space, and malformed codecs remain verification errors.
 */

const constants = require('../../constants.js');
const manifestCodec = require('../../api/fs/v3/manifestCodec.js');

function manifestToken(blob) {
	return {
		__fs3ManifestBlob: true,
		version: 3,
		bytes: Number(blob.meta?.bytes || blob.length || 0),
		storedBytes: Number(blob.meta?.storedBytes || blob.length || 0),
		...(blob.meta?.codec && blob.meta.codec !== 'identity'
			? { codec: blob.meta.codec }
			: {}),
		blob
	};
}

function visitVirtualFsManifest(verifier, blob, tag) {
	let manifest;
	try {
		manifest = manifestCodec.decodeManifest(
			verifier.db,
			manifestToken(blob)
		);
	} catch (error) {
		verifier.bad.push({
			tag,
			reason: 'bad-virtual-fs-manifest',
			message: error.message
		});
		return;
	}
	walk(manifest, '$', verifier, tag, new Set());
}

function walk(value, path, verifier, tag, seen) {
	if (!value || typeof value !== 'object') return;
	if (seen.has(value)) return;
	seen.add(value);
	if (value.__awtsmoosBlob === true) {
		markBlob(value, `${tag}.fs${path}`, verifier);
		return;
	}
	if (value.__awtsmoosText === true && Array.isArray(value.blocks)) {
		for (let index = 0; index < value.blocks.length; index++) {
			markBlob(
				value.blocks[index]?.blob,
				`${tag}.fs${path}.text.${index}`,
				verifier
			);
		}
		return;
	}
	for (const [key, child] of Object.entries(value)) {
		walk(child, `${path}.${key}`, verifier, tag, seen);
	}
}

function markBlob(blob, tag, verifier) {
	if (!blob || blob.__awtsmoosBlob !== true) {
		verifier.bad.push({ tag, reason: 'bad-virtual-fs-blob-token' });
		return;
	}
	const pointer = {
		type: constants.VAL_TYPE.BUFFER,
		offset: Number(blob.offset),
		length: Number(blob.length)
	};
	if (pointer.length > 0) verifier.markOwnedBody(pointer, `${tag}.body`);
}

module.exports = visitVirtualFsManifest;