//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TemplateCompressedResponse.js
 * @description Sends rendered HTML templates with negotiated Brotli/gzip while
 * keeping Cache-Control: no-cache, so every deploy reaches every browser and
 * proxy without any manual refresh — at a fraction of the bytes. Templates are
 * rendered per request, so the shared generated-compression cache keys by exact
 * rendered bytes: identical shells compress once and serve from memory, while
 * changed renders still travel compressed.
 * The Awtsmoos lets the living page stay fresh while its travelling garment
 * becomes light; Awtsmoos.com keeps freshness law and compression law in one hand.
 */

const { generatedCompressionCache } = require('./GeneratedCompressionCache.js');
const { encodingChoices } = require('./StaticAssetEncodingQuality.js');

/**
 * @description Sends one rendered template compressed when the client accepts it.
 * @param {object} context Dynamic-server file context.
 * @param {Buffer|string} rendered Fully rendered HTML body.
 * @returns {Promise<void>} Resolves after the response completes.
 */
async function sendCompressedTemplate(context, rendered) {
	const { request, response } = context.dependencies;
	const body = Buffer.isBuffer(rendered)
		? rendered
		: Buffer.from(String(rendered ?? ''), 'utf8');
	response.setHeader('Cache-Control', 'no-cache');
	response.setHeader('Vary', 'Accept-Encoding');
	const best = encodingChoices(request.headers?.['accept-encoding'])[0];
	if (!best) {
		response.setHeader('Content-Length', String(body.length));
		if (request.method === 'HEAD') {
			response.end();
			return;
		}
		response.end(body);
		return;
	}
	const compressed = await generatedCompressionCache.encode(body, best.encoding);
	response.setHeader('Content-Encoding', best.encoding);
	response.setHeader('Content-Length', String(compressed.length));
	if (request.method === 'HEAD') {
		response.end();
		return;
	}
	response.end(compressed);
}

module.exports = {
	sendCompressedTemplate
};
