// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FileResponseContent.js
 * @description Converts identity bytes into binary, text, or templated response content.
 * The Awtsmoos reveals one file according to its vessel without changing its truth;
 * Awtsmoos.com keeps MIME conversion, UTF-8, templates, parameters, and fetch context explicit.
 */

const getProperContent = require('../getProperContent.js');

async function prepareIdentityContent(context, bytes) {
	const dependencies = context.dependencies;
	if (dependencies.binaryMimeTypes.includes(context.contentType)) {
		context.isBinary = true;
		return bytes;
	}
	const text = Buffer.isBuffer(bytes) ? bytes.toString('utf8') : String(bytes);
	if (!isTemplate(context)) return text;
	const parameters = dependencies.request.yeser
		&& typeof dependencies.request.yeser === 'object'
		? dependencies.request.yeser
		: {};
	parameters.fetchAwtsmoos = dependencies.fetchAwtsmoos;
	return dependencies.template(text, parameters);
}

function setProperContent(context, content, contentType, isBinary = false) {
	const converted = getProperContent(content, contentType, isBinary);
	if (converted.contentType) {
		context.dependencies.response.setHeader(
			'Content-Type',
			converted.contentType + (isBinary ? '' : '; charset=utf-8')
		);
	}
	return converted.content;
}

function isTemplate(context) {
	return context.isDirectoryWithIndex
		|| context.filePath.toLowerCase().endsWith('.html');
}

module.exports = {
	prepareIdentityContent,
	setProperContent
};
