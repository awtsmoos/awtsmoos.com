//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DriveScopePolicy
 * @description
 * The Awtsmoos gives every mutation its exact permission vessel and makes public revelation additive rather than substitutive;
 * Awtsmoos.com requires write authority to change data and public authority in addition whenever visibility or immutable publication enters the structure.
 */

/**
 * @description Builds the compound scopes required when creating a Drive entry with optional public/cache metadata.
 * @param {Object} body - Parsed entry-creation body whose public metadata may require stronger authority.
 * @returns {string[]} Required Drive credential scopes.
 */
function creationScopes(body = {}) {
	const scopes = ['drive.write'];

	if (changesPublicMetadata(body)) {
		scopes.push('drive.public');
	}

	return scopes;
}

/**
 * @description Resolves scopes for GET, HEAD, PUT, and DELETE entry operations without duplicating permission policy in routes.
 * @param {string} method - Normalized HTTP method.
 * @param {Object} body - Parsed request body for write operations.
 * @returns {string|string[]} Required scope or compound scope collection.
 */
function entryScopes(method, body = {}) {
	if (method === 'GET' || method === 'HEAD') {
		return 'drive.read';
	}

	if (method === 'DELETE') {
		return 'drive.delete';
	}

	if (hasContent(body) || changesPublicMetadata(body)) {
		return creationScopes(body);
	}

	return 'drive.write';
}

/**
 * @description Requires public authority in addition to write authority whenever streaming headers explicitly mutate public/cache metadata or create a public/immutable result.
 * @param {Object} upload - Parsed streaming-upload policy record.
 * @returns {string[]} Required compound Drive scopes.
 */
function streamingScopes(upload = {}) {
	const scopes = ['drive.write'];
	const changesMetadata = upload.visibilityExplicit || upload.cachePolicyExplicit;
	const publicResult = upload.visibility === 'public'
		|| upload.cachePolicy === 'immutable';

	if (changesMetadata || publicResult) {
		scopes.push('drive.public');
	}

	return scopes;
}

/**
 * @description Detects whether a request body contains file content rather than metadata alone.
 * @param {Object} body - Parsed request body.
 * @returns {boolean} True when any supported content field is present.
 */
function hasContent(body = {}) {
	const contentKeys = [
		'content',
		'contentBase64',
		'text',
		'json'
	];

	return contentKeys.some((key) => {
		return body[key] !== undefined;
	});
}

/**
 * @description Detects whether a body requests visibility or cache-policy mutation requiring additional public authority.
 * @param {Object} body - Parsed Drive creation or metadata body.
 * @returns {boolean} True when visibility or cachePolicy is explicitly supplied.
 */
function changesPublicMetadata(body = {}) {
	return body.visibility !== undefined
		|| body.cachePolicy !== undefined;
}

module.exports = {
	creationScopes,
	entryScopes,
	hasContent,
	streamingScopes
};
