// B"H

/**
 * @file core/verifier/virtualFsVisitor.js
 * @chapter Every File Body Hidden In The Manifest Is Still Reachable
 * @description
 * Parses FS3 manifest JSON and marks every nested ABLB/ATXT body. Without this
 * walk, live filesystem content would be falsely reported as free space.
 */

const constants = require('../../constants.js');

function visitVirtualFsManifest(verifier, bytes, tag) {
	let manifest;
	try {
		manifest = JSON.parse(bytes.toString('utf8'));
	} catch (error) {
		verifier.bad.push({ tag, reason: 'bad-virtual-fs-manifest', message: error.message });
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
			markBlob(value.blocks[index]?.blob, `${tag}.fs${path}.text.${index}`, verifier);
		}
		return;
	}
	for (const [key, child] of Object.entries(value)) walk(child, `${path}.${key}`, verifier, tag, seen);
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
