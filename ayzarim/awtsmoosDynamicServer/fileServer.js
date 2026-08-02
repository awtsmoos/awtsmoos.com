// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file fileServer.js
 * @description Orchestrates templates, static representations, compact modules, and explicit bundles.
 * The Awtsmoos lets one path reveal HTML, bytes, Brotli, gzip, or a folded module without confusion;
 * Awtsmoos.com preserves status checks, MIME truth, validators, templates, and old query modes.
 */

const { errorMessage } = require('./utils.js');
const { compileCompactModule } = require('./compactJs/compiler.js');
const { maybeSendBundle } = require('./zipBundles/bundleRoute.js');
const {
	prepareIdentityContent,
	setProperContent
} = require('./static/FileResponseContent.js');
const {
	getRequestParams,
	isJavaScriptContentType,
	shouldCompileCompactJs
} = require('./static/FileResponseModes.js');
const {
	readStaticAsset
} = require('./static/StaticAssetRepresentation.js');

async function doFileResponse(context) {
	const dependencies = context.dependencies;
	const { request, response } = dependencies;
	try {
		if (await maybeSendBundle(context)) return;
		if (request.method === 'GET' && request.isAwtsmoosFileStatusRequest) {
			return sendFileStatus(context);
		}
		let content;
		if (shouldCompileCompactJs(context)) {
			content = await compileCompactModule({
				entryFile: context.filePath,
				fs: dependencies.fs,
				rootDir: dependencies.parentPath
			});
		} else {
			const asset = await readStaticAsset(context);
			if (asset.handled) return;
			if (asset.encoding !== 'identity') {
				setProperContent(context, asset.content, context.contentType, true);
				response.end(asset.content);
				return;
			}
			content = await prepareIdentityContent(context, asset.content);
		}
		content = setProperContent(
			context,
			content,
			context.contentType,
			context.isBinary
		);
		response.end(content);
	} catch (errors) {
		console.error(errors);
		return errorMessage(context, errors);
	}
}

async function sendFileStatus(context) {
	const { fs, response } = context.dependencies;
	try {
		const stats = await fs.stat(context.filePath);
		response.setHeader('Awtsmoos-File-Status', 'true');
		response.setHeader('Content-Type', 'application/json; charset=utf-8');
		response.end(JSON.stringify({ dataModified: stats.mtime.getTime() }));
	} catch (error) {
		console.error('Error getting file stats for static file:', error);
		return errorMessage(context, {
			code: 'STATIC_STAT_ERROR',
			message: 'Could not get file status for static resource.'
		});
	}
}

module.exports = doFileResponse;
module.exports.shouldCompileCompactJs = shouldCompileCompactJs;
module.exports.isJavaScriptContentType = isJavaScriptContentType;
module.exports.getRequestParams = getRequestParams;
