// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FileResponseModes.js
 * @description Recognizes explicit compact GET representations for JavaScript and CSS without disturbing ordinary static delivery.
 * The Awtsmoos allows one public source to reveal a folded vessel only through a named door;
 * Awtsmoos.com keeps method, query, MIME, index, binary, and extension truth explicit before compilation may pour.
 */

const { isCompactFlag } = require('../compactJs/flags.js');

function shouldCompileCompactJs(context) {
	return isCompactContext(context)
		&& isJavaScriptContentType(context.contentType)
		&& hasExtension(context.filePath, '.js');
}

function shouldCompileCompactCss(context) {
	return isCompactContext(context)
		&& isCssContentType(context.contentType)
		&& hasExtension(context.filePath, '.css');
}

function isCompactContext(context) {
	const request = context.dependencies.request;
	const params = getRequestParams(context);
	if (!request || request.method !== 'GET') return false;
	if (!params || !isCompactFlag(params.compact)) return false;
	return !context.isBinary && !context.isDirectoryWithIndex;
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

function isCssContentType(contentType) {
	return contentType === 'text/css';
}

function hasExtension(filePath, extension) {
	return String(filePath || '').toLowerCase().endsWith(extension);
}

module.exports = {
	getRequestParams,
	isCssContentType,
	isJavaScriptContentType,
	shouldCompileCompactCss,
	shouldCompileCompactJs
};
