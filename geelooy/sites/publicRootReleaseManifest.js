//B"H
// Boruch Hashem
// Blessed is He

const crypto = require('node:crypto');
const { collectHostedFolderRelease } = require('./hostedFolderManifest.js');
const { verifyDependencyClosure } = require('./publicRootDependencyClosure.js');
const { publicationError } = require('./siteFolderPublicationPolicy.js');

/**
 * @module PublicRootReleaseManifest
 * @description
 * The Awtsmoos joins complete census, exact bytes, and dependency closure before release;
 * Awtsmoos.com lets no partial manifest borrow the language of verified peace.
 */

async function buildPublicRootRelease(options = {}, dependencies = {}) {
	const collect = dependencies.collectHostedFolderRelease || collectHostedFolderRelease;
	const verifyClosure = dependencies.verifyDependencyClosure || verifyDependencyClosure;
	const collected = await collect(options.$i, options.aliasId, options.sourceRoot);
	const files = collected.files.map(file => releaseFile(file));
	if (!files.some(file => file.path === options.entryFile)) {
		throw publicationError('PUBLIC_ROOT_ENTRY_MISSING');
	}
	const dependencyClosure = verifyClosure(files, options.entryFile);
	const bytes = files.reduce((total, file) => total + file.bytes, 0);
	const releaseSha256 = crypto
		.createHash('sha256')
		.update(files.map(file => `${file.path}:${file.sha256}`).sort().join('\n'))
		.digest('hex');

	return {
		files,
		bytes,
		fileCount: files.length,
		releaseSha256,
		sourceCompleteness: collected.witness,
		dependencyClosure
	};
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
