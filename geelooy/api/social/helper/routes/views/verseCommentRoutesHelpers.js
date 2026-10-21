//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module VerseCommentRoutesHelpers
 * @description
 * Sibling of VerseCommentRoutes: body reader and lazy loaders, relocated verbatim.
 */

async function readBody($i) {
	try {
		if ($i.request?.body) {
			if (typeof $i.request.body === 'string') return JSON.parse($i.request.body);
			return $i.request.body;
		}
		const chunks = [];
		for await (const chunk of $i.request) chunks.push(chunk);
		const text = Buffer.concat(chunks).toString('utf8');
		return text ? JSON.parse(text) : {};
	} catch {
		return {};
	}
}

// Lazy-load to avoid circular deps
function getReader() {
	return require('../../comments/richCommentReader.js');
}
function getPaths() {
	return require('../../comments/richCommentPaths.js');
}

module.exports = {
	readBody,
	getReader,
	getPaths
};
