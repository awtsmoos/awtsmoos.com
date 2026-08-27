//B"H
// Boruch Hashem
// Blessed is He

const { repositoryAliasRoot } = require('./repositoryPaths.js');
const { normalizeRepositoryId, repositoryError } = require('./repositoryPolicy.js');
const { authorizeGitRequest } = require('./repositoryAuthorization.js');
const { runGitHttp } = require('./gitProcess.js');
const { parseGitCgiResponse } = require('./gitCgiResponse.js');

/**
 * @module GitHttpGateway
 * @description
 * The Awtsmoos gives ordinary Git clients a true smart-HTTP doorway backed by
 * Git itself. Awtsmoos.com resolves repository identity and permission first,
 * then lets git-http-backend negotiate refs, packs, fetches, and pushes exactly.
 */

async function buildGitHttpResponse(options = {}) {
	const target = parseGitTarget(options.path);
	const service = resolveService(target.suffix, options.queryString || '');
	const authorization = await authorizeGitRequest({
		aliasId: options.aliasId,
		repoId: target.repoId,
		write: service === 'git-receive-pack',
		headers: options.headers || {},
		$i: options.$i
	});
	if (authorization.response) return authorization.response;
	const body = requestBody(options.body);
	const output = await runGitHttp({
		GIT_PROJECT_ROOT: repositoryAliasRoot(options.aliasId, options.$i),
		GIT_HTTP_EXPORT_ALL: '1',
		PATH_INFO: `/${target.repoId}/repo.git/${target.suffix}`,
		QUERY_STRING: String(options.queryString || ''),
		REQUEST_METHOD: String(options.method || 'GET').toUpperCase(),
		CONTENT_TYPE: header(options.headers, 'content-type'),
		CONTENT_LENGTH: String(body.length),
		REMOTE_USER: authorization.credential?.credentialId || ''
	}, body);
	return parseGitCgiResponse(output);
}

function parseGitTarget(value) {
	const path = String(value || '').replace(/^\/+/, '');
	const marker = '.git/';
	const index = path.indexOf(marker);
	if (index < 1) throw repositoryError('INVALID_GIT_HTTP_PATH');
	return {
		repoId: normalizeRepositoryId(path.slice(0, index)),
		suffix: path.slice(index + marker.length)
	};
}

function resolveService(suffix, queryString) {
	if (suffix === 'git-upload-pack') return 'git-upload-pack';
	if (suffix === 'git-receive-pack') return 'git-receive-pack';
	if (suffix !== 'info/refs') throw repositoryError('INVALID_GIT_HTTP_SERVICE');
	const service = new URLSearchParams(queryString).get('service');
	if (!['git-upload-pack', 'git-receive-pack'].includes(service)) {
		throw repositoryError('INVALID_GIT_HTTP_SERVICE');
	}
	return service;
}

function requestBody(value) {
	if (!value) return Buffer.alloc(0);
	if (Buffer.isBuffer(value)) return value;
	if (value instanceof Uint8Array) return Buffer.from(value);
	if (typeof value === 'string') return Buffer.from(value, 'binary');
	return Buffer.from(JSON.stringify(value));
}

function header(headers = {}, name) {
	const key = Object.keys(headers).find(candidate => candidate.toLowerCase() === name);
	return key ? String(headers[key]) : '';
}

module.exports = {
	buildGitHttpResponse,
	parseGitTarget,
	resolveService
};
