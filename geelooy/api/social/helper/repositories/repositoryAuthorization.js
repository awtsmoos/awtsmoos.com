//B"H
// Boruch Hashem
// Blessed is He

const { readRepository } = require('./repositoryStore.js');
const { verifyRepositoryCredential } = require('./repositoryCredentialService.js');
const { basicToken, unauthorizedResponse } = require('./gitBasicAuth.js');

/**
 * @module RepositoryAuthorization
 * @description
 * The Awtsmoos lets a public repository reveal history anonymously while every
 * private read and every ref-changing push remains credential-bound. Awtsmoos.com
 * asks the repository mapping first and never grants authority from URL shape.
 */

async function authorizeGitRequest(options = {}) {
	const repository = await readRepository(options.aliasId, options.repoId, options.$i);
	if (!repository) return { response: notFound() };
	const permission = options.write ? 'write' : 'read';
	if (!options.write && repository.visibility === 'public') {
		return { repository, credential: null };
	}
	const basic = basicToken(options.headers);
	if (!basic?.token) return { response: unauthorizedResponse() };
	const credential = await verifyRepositoryCredential({
		aliasId: options.aliasId,
		repoId: options.repoId,
		token: basic.token,
		permission,
		$i: options.$i
	});
	if (!credential) return { response: unauthorizedResponse('Invalid repository credential') };
	return { repository, credential };
}

function notFound() {
	return {
		statusCode: 404,
		headers: {
			'Cache-Control': 'no-store',
			'Content-Type': 'text/plain; charset=utf-8'
		},
		response: 'Repository not found'
	};
}

module.exports = {
	authorizeGitRequest
};
