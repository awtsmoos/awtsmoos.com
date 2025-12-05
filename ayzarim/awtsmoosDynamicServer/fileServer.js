/**
 * B"H
 */
var getProperContent = require("./getProperContent.js");
var { errorMessage } = require("./utils.js");

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

		if (binaryMimeTypes.includes(context.contentType)) {
			content = await fs.readFile(context.filePath);
			context.isBinary = true;
		} else {
			var textContent = await fs.readFile(context.filePath, 'utf-8');
			var last = context.filePath.split("\\").join("/").split("/").pop()
			var ext = last.split(".")[1];
			if (!(ext == "html" || context.isDirectoryWithIndex)) {
				content = textContent;
			} else {
				var ei = request.yeser;
				if (!(typeof (ei) == "object" && ei)) ei = {}
				ei.fetchAwtsmoos = fetchAwtsmoos;
				var temp = await template(textContent, ei);
				content = temp
			}
		}

		content = setProperContent(context, content, context.contentType, context.isBinary);

		response.end(content);
		return;
	} catch (errors) {
		console.error(errors);
		return errorMessage(context, errors)
	}
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