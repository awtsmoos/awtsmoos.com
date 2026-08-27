//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveProjectCredentialResolver
 * @description
 * The Awtsmoos lets a project speak only an opaque binding name while hidden authority remains hidden;
 * Awtsmoos.com resolves provider credentials only inside trusted execution and never serializes their values into portable state.
 */

async function resolveProjectCredential(options = {}) {
	const resolver = options.context?.projectCredentialResolver;
	if (typeof resolver?.resolve !== 'function') {
		throw credentialError('PROJECT_CREDENTIAL_RESOLVER_UNAVAILABLE', 503);
	}
	if (!options.binding) {
		throw credentialError('PROJECT_PROVIDER_BINDING_REQUIRED', 409);
	}
	const credential = await resolver.resolve({
		aliasId: options.aliasId,
		binding: options.binding,
		kind: options.kind
	});
	if (credential === undefined || credential === null || credential === '') {
		throw credentialError('PROJECT_PROVIDER_CREDENTIAL_NOT_FOUND', 404);
	}
	return credential;
}

function credentialError(code, statusCode) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

module.exports = { resolveProjectCredential };
