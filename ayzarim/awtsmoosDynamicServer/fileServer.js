/**
 * B"H
 *
 * Chapter 402: The river of files learned two kinds of gathering. Compact JS
 * folds imports into one module flame; bundle ZIP folds installer files into a
 * few compressed scrolls. Both remain explicit GET modes, both obey real parsed
 * query params, and old static serving remains untouched.
 */
var getProperContent = require("./getProperContent.js");
var { errorMessage } = require("./utils.js");
var { isCompactFlag } = require("./compactJs/flags.js");
var { compileCompactModule } = require("./compactJs/compiler.js");
var { maybeSendBundle } = require("./zipBundles/bundleRoute.js");

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
		if (await maybeSendBundle(context)) return;
		if (request.method == "GET" && request.isAwtsmoosFileStatusRequest) {
			try {
				const stats = await fs.stat(context.filePath);
				const result = { dataModified: stats.mtime.getTime() };
				response.setHeader('Awtsmoos-File-Status', 'true');
				response.setHeader('Content-Type', 'application/json; charset=utf-8');
				response.end(JSON.stringify(result));
				return;
			} catch (error) {
				console.error("Error getting file stats for static file:", error);
				return errorMessage(context, { message: "Could not get file status for static resource.", code: "STATIC_STAT_ERROR" });
			}
		}
		let content;

		if (shouldCompileCompactJs(context)) {
			content = await compileCompactModule({ fs, entryFile: context.filePath, rootDir: context.dependencies.parentPath });
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
 * files only.
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
 * instead of one blindly hiding the other.
 */
function getRequestParams(context) {
	var request = context.dependencies.request;
	var kinds = context.dependencies.paramKinds;
	var legacy = request && typeof request.yeser == "object" && request.yeser ? request.yeser : null;
	var parsed = kinds && typeof kinds.GET == "object" && kinds.GET ? kinds.GET : null;
	if (legacy && parsed) return Object.assign({}, legacy, parsed);
	return parsed || legacy || null;
}

function isJavaScriptContentType(contentType) {
	return contentType === "application/javascript" || contentType === "text/javascript";
}

function setProperContent(context, content, contentType, isBinary = false) {
	var { response } = context.dependencies;
	var cnt = getProperContent(content, contentType, isBinary);
	if (cnt.contentType) {
		try { response.setHeader('Content-Type', cnt.contentType + (isBinary ? '' : '; charset=utf-8')); } catch (e) {}
	}
	return cnt.content;
}

module.exports = doFileResponse;
module.exports.shouldCompileCompactJs = shouldCompileCompactJs;
module.exports.isJavaScriptContentType = isJavaScriptContentType;
module.exports.getRequestParams = getRequestParams;
