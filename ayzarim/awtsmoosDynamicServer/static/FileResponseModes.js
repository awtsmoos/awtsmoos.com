// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FileResponseModes.js
 * @description Recognizes explicit CompactJS GET requests without disturbing ordinary static delivery.
 * The Awtsmoos permits one source to reveal a folded module only through a named door;
 * Awtsmoos.com keeps method, flags, MIME, index, binary, and merged parameter truth explicit.
 */

const { isCompactFlag } = require('../compactJs/flags.js');

function shouldCompileCompactJs(context) {
	const request = context.dependencies.request;
	const params = getRequestParams(context);
	if (!request || request.method !== 'GET') return false;
	if (!params || !isCompactFlag(params.compact)) return false;
	if (context.isBinary || context.isDirectoryWithIndex) return false;
	if (!isJavaScriptContentType(context.contentType)) return false;
	return String(context.filePath || '').toLowerCase().endsWith('.js');
}

function getRequestParams(context) {
	const request = context.dependencies.request;
	const kinds = context.dependencies.paramKinds;
	const legacy = request?.yeser && typeof request.yeser === 'object'
		? request.yeser
		: null;
	const parsed = kinds?.GET && typeof kinds.GET === 'object'
		? kinds.GET
		: null;
	return legacy && parsed
		? Object.assign({}, legacy, parsed)
		: parsed || legacy;
}

function isJavaScriptContentType(contentType) {
	return contentType === 'application/javascript'
		|| contentType === 'text/javascript';
}

module.exports = {
	getRequestParams,
	isJavaScriptContentType,
	shouldCompileCompactJs
};
