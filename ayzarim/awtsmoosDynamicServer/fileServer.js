/**
 * B"H
 *
 * Static file responses are the riverbed. Most requests flow exactly as they
 * always did. Only when a GET request for a JavaScript file asks for compact
 * light does the Awtsmoos gather the local import sparks into one flame.
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
 * Guards the new path so old server behavior remains sealed and untouched:
 * GET only, explicit compact flag only, JavaScript MIME only, real files only.
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
 * GET params may live in old `request.yeser` vessels or the newer parsed
 * `paramKinds.GET` chamber. The compact flag listens to both without moving
 * any other server feature.
 *
 * @param {object} context Server request context.
 * @returns {object|null} Parsed GET params or null.
 */
function getRequestParams(context) {
	var request = context.dependencies.request;
	var kinds = context.dependencies.paramKinds;
	if (request && typeof request.yeser == "object" && request.yeser) return request.yeser;
	if (kinds && typeof kinds.GET == "object" && kinds.GET) return kinds.GET;
	return null;
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
