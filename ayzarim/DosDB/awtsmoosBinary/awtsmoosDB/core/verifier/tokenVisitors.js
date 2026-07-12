// B"H

/**
 * @file core/verifier/tokenVisitors.js
 * @chapter Bodies Hidden Behind Seals Are Still Alive
 * @description
 * Marks blob and text bodies owned by modern or legacy tokens, then descends
 * into FS3 manifest JSON so nested file bodies remain reachable.
 */

const constants = require('../../constants.js');
const { readBlobToken, readTextToken } = require('./tokenReaders.js');
const visitVirtualFsManifest = require('./virtualFsVisitor.js');

function bodyPointer(token) {
	return {
		type: constants.VAL_TYPE.BUFFER,
		offset: Number(token && token.offset),
		length: Number(token && token.length)
	};
}

function visitBlob(verifier, pointer, tag) {
	const raw = verifier.db._readChainSafe(pointer);
	let token;
	try {
		token = readBlobToken(raw);
	} catch (error) {
		verifier.bad.push({ tag, reason: 'bad-blob-token', message: error.message, ptr: pointer });
		return;
	}
	if (!token || token.__awtsmoosBlob !== true) {
		verifier.bad.push({ tag, reason: 'bad-blob-token', ptr: pointer });
		return;
	}
	const body = bodyPointer(token);
	if (body.length > 0 && verifier.markOwnedBody(body, `${tag}.blob.body`) && token.meta?.kind === 'fs3-manifest') {
		const bytes = verifier.db.pager.readExact(body.offset, body.length) || Buffer.alloc(0);
		visitVirtualFsManifest(verifier, bytes, `${tag}.blob`);
	}
}

function visitText(verifier, pointer, tag) {
	const raw = verifier.db._readChainSafe(pointer);
	let token;
	try {
		token = readTextToken(raw);
	} catch (error) {
		verifier.bad.push({ tag, reason: 'bad-text-token', message: error.message, ptr: pointer });
		return;
	}
	if (!token || token.__awtsmoosText !== true || !Array.isArray(token.blocks)) {
		verifier.bad.push({ tag, reason: 'bad-text-token', ptr: pointer });
		return;
	}
	for (let index = 0; index < token.blocks.length; index++) {
		const blob = token.blocks[index] && token.blocks[index].blob;
		if (!blob || blob.__awtsmoosBlob !== true) {
			verifier.bad.push({ tag: `${tag}.text.${index}`, reason: 'bad-text-blob-token' });
			continue;
		}
		const body = bodyPointer(blob);
		if (body.length > 0) verifier.markOwnedBody(body, `${tag}.text.${index}.blob.body`);
	}
}

module.exports = {
	visitBlob,
	visitText
};
