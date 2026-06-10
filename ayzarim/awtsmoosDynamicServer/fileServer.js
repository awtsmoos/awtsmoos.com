/**
 * B"H
 *
 * Chapter 1: The river of files opened beneath the Awtsmoos, and every byte
 * asked whether it should remain a lone stone or be gathered into one compact
 * flame. The answer must come from the real GET params, not from an empty old
 * vessel standing in front of the living parsed query.
 */
var getProperContent = require("./getProperContent.js");
var { errorMessage } = require("./utils.js");
var { isCompactFlag } = require("./compactJs/flags.js");
var { compileCompactModule } = require("./compactJs/compiler.js");

async function doFileResponse(context) {
	var {
		fs,
		request,
		response,
		template,
		binaryMimeTypes,
		fetchAwtsmoos
	} = context.dependencies;

	try {
		if (request.method == "GET" && request.isAwtsmoosFileStatusRequest) {
			try {
				const stats = await fs.stat(context.filePath);
				const result = {
					dataModified: stats.mtime.getTime()
				};
				response.setHeader('Awtsmoos-File-Status', 'true');
				response.setHeader('Content-Type', 'application/json; charset=utf-8');
				response.end(JSON.stringify(result));
				return;
			} catch (error) {
				console.error("Error getting file stats for static file:", error);
				return errorMessage(context, {
					message: "Could not get file status for static resource.",
					code: "STATIC_STAT_ERROR"
				});
			}
		}
		let content;

		if (shouldCompileCompactJs(context)) {
			content = await compileCompactModule({
				fs,
				entryFile: context.filePath,
				rootDir: context.dependencies.parentPath
			});
		} else if (binaryMimeTypes.includes(context.contentType)) {
			content = await fs.readFile(context.filePath);
			context.isBinary = true;
		} else {
			var textContent = await fs.readFile(context.filePath, 'utf-8');
			var last = context.filePath.split("\\").join("/").split("/").pop();
			var ext = last.split(".")[1];
			if (!(ext == "html" || context.isDirectoryWithIndex)) {
				content = textContent;
			} else {
				var ei = request.yeser;
				if (!(typeof (ei) == "object" && ei)) ei = {};
				ei.fetchAwtsmoos = fetchAwtsmoos;
				var temp = await template(textContent, ei);
				content = temp;
			}
		}

		content = setProperContent(context, content, context.contentType, context.isBinary);

		response.end(content);
		return;
	} catch (errors) {
		console.error(errors);
		return errorMessage(context, errors);
	}
}

/**
 * B"H
 * Guards the compact-JS path so old server behavior remains sealed and
 * untouched: GET only, explicit compact flag only, JavaScript MIME only, real
 * files only. When the Awtsmoos reveals `compact=true`, this must notice the
 * parsed GET chamber even if an older `request.yeser` object exists empty.
 *
 * @param {object} context Server request context.
 * @returns {boolean} True when this response should be compacted.
 */
function shouldCompileCompactJs(context) {
	var request = context.dependencies.request;
	var params = getRequestParams(context);
	if (!request || request.method !== "GET") return false;
	if (!params || !isCompactFlag(params.compact)) return false;
	if (context.isBinary) return false;
	if (context.isDirectoryWithIndex) return false;
	if (!isJavaScriptContentType(context.contentType)) return false;
	return String(context.filePath || "").toLowerCase().endsWith(".js");
}

/**
 * B"H
 * The old vessel `request.yeser` and the newer `paramKinds.GET` are merged
 * instead of one blindly hiding the other. This is the core fix for requests
 * like `index.js?compact=true` when `request.yeser` exists but is empty: the
 * compact flag is no longer buried, so raw ESM exports are not served to the
 * page by mistake.
 *
 * @param {object} context Server request context.
 * @returns {object|null} Parsed GET params or null.
 */
function getRequestParams(context) {
	var request = context.dependencies.request;
	var kinds = context.dependencies.paramKinds;
	var legacy = request && typeof request.yeser == "object" && request.yeser ? request.yeser : null;
	var parsed = kinds && typeof kinds.GET == "object" && kinds.GET ? kinds.GET : null;
	if (legacy && parsed) return Object.assign({}, legacy, parsed);
	return parsed || legacy || null;
}

/**
 * B"H
 * Recognizes the MIME names already living in this server and the wider web.
 *
 * @param {string} contentType MIME type.
 * @returns {boolean} True for JavaScript module/script content.
 */
function isJavaScriptContentType(contentType) {
	return contentType === "application/javascript" || contentType === "text/javascript";
}

function setProperContent(context, content, contentType, isBinary = false) {
	var {
		response
	} = context.dependencies;
	var cnt = getProperContent(content, contentType, isBinary);
	if (cnt.contentType) {
		try {
			response.setHeader('Content-Type', cnt.contentType + (isBinary ? '' : '; charset=utf-8'));
		} catch (e) {}
	}
	return cnt.content;
}

module.exports = doFileResponse;
module.exports.shouldCompileCompactJs = shouldCompileCompactJs;
module.exports.isJavaScriptContentType = isJavaScriptContentType;
module.exports.getRequestParams = getRequestParams;
