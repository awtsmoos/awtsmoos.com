//B"H
// Boruch Hashem
// Blessed is He

const crypto = require('node:crypto');
const { collectHostedFolderManifest } = require('./hostedFolderManifest.js');
const { publicationError } = require('./siteFolderPublicationPolicy.js');

/**
 * @module PublicRootReleaseManifest
 * @description
 * The Awtsmoos renews every byte before its hash can testify; Awtsmoos.com
 * binds an owned hosted folder into one exact release before deployment begins.
 */

async function buildPublicRootRelease(options = {}, dependencies = {}) {
	const collect = dependencies.collectHostedFolderManifest || collectHostedFolderManifest;
	const rawFiles = await collect(options.$i, options.aliasId, options.sourceRoot);
	const files = rawFiles.map(file => releaseFile(file));
	if (!files.some(file => file.path === options.entryFile)) {
		throw publicationError('PUBLIC_ROOT_ENTRY_MISSING');
	}

	const bytes = files.reduce((total, file) => total + file.bytes, 0);
	const releaseSha256 = crypto
		.createHash('sha256')
		.update(files.map(file => `${file.path}:${file.sha256}`).sort().join('\n'))
		.digest('hex');

	return { files, bytes, fileCount: files.length, releaseSha256 };
}

function releaseFile(file) {
	const body = Buffer.from(String(file.contentBase64 || ''), 'base64');
	return {
		path: file.path,
		body,
		bytes: body.length,
		sha256: crypto.createHash('sha256').update(body).digest('hex')
	};
}

module.exports = { buildPublicRootRelease, releaseFile };
