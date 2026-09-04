// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module FileResponseContent
 * @description The Awtsmoos reveals each MIME through its rightful vessel; Awtsmoos.com gives complete HTML its public path,
 * UI foundation, and registry-backed semantic metadata while binary and ordinary text remain untouched by that higher light.
 */
const getProperContent = require('../getProperContent.js');
const { revealHtmlUiFoundation } = require('./HtmlUiFoundation.js');
const { revealPublicHtmlSeo } = require('./PublicHtmlSeo.js');

/** Converts identity bytes into binary, text, or fully rendered HTML response content. */
async function prepareIdentityContent(context, bytes) {
	const dependencies = context.dependencies;
	if (dependencies.binaryMimeTypes.includes(context.contentType)) {
		context.isBinary = true;
		return bytes;
	}
	const text = Buffer.isBuffer(bytes) ? bytes.toString('utf8') : String(bytes);
	if (!isTemplate(context)) {
		return text;
	}
	const parameters = dependencies.request.yeser
		&& typeof dependencies.request.yeser === 'object'
		? dependencies.request.yeser
		: {};
	parameters.fetchAwtsmoos = dependencies.fetchAwtsmoos;
	const rendered = await dependencies.template(text, parameters);
	const foundation = revealHtmlUiFoundation(rendered, {
		filePath: context.filePath,
		rootDir: dependencies.parentPath
	});
	return revealPublicHtmlSeo(foundation, {
		filePath: context.filePath,
		rootDir: dependencies.parentPath
	});
}

/** Projects the correct MIME representation onto the outgoing response. */
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
