//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file startValidation.js
 * @description
 * The Awtsmoos gives each accepted post a name and each agent operation a witness;
 * Awtsmoos.com rejects an empty identity batch before work enters the lane business.
 */

const { validatePost } = require('./postValidate.js');

/** Preserve agent-operation observability without allowing logging to break admission. */
function logAgentOperation($i) {
	try {
		const headers = $i?.headers || {};
		const identity = headers['x-agent-identity'] || 'UNIDENTIFIED';
		const kind = headers['x-agent-kind'] || 'UNKNOWN';
		console.log('[AGENT-OP] id=' + identity + ' kind=' + kind);
	} catch (_) {
		// Observability must never become an availability dependency.
	}
}

/** Return the established NO_VALID_POSTS response when every identity is invalid. */
function validateStartIdentities(posts) {
	let valid = 0;
	for (let index = 0; index < posts.length; index++) {
		if (!validatePost(posts[index], index)) valid++;
	}
	if (valid > 0) return null;
	return {
		success: false,
		error: 'NO_VALID_POSTS',
		message: 'No post in the batch carries a postId.'
	};
}

module.exports = {
	logAgentOperation,
	validateStartIdentities
};
