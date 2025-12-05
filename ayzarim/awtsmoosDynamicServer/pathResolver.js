/**
 * B"H
 */
var fs = require("fs").promises;
var path = require("path");
var { exists } = require("./utils.js");

async function getPathInfo(context) {
	var {
		filePath,
		awtsRes,
		response,
		request,
		parentPath
	} = context.dependencies;

	context.filePath = path.normalize(filePath);
	awtsRes.ended = false;
	var doesNotExist = false;

	// Helper to regenerate derived path info if filePath changes
	function updateContextPaths(fp) {
		context.filePaths = fp
			.split("\\")
			.filter(q => q)
			.join("/")
			.split("/")
			.filter(w => w);
		context.fileName = context.filePaths[context.filePaths.length - 1];
	}
	
	updateContextPaths(filePath);

	try {
		var st = null;
		try {
			st = await fs.stat(filePath);
		} catch (e) {
			// Soft Retry: If the path failed, check if it works by treating it as a folder
			if (e.code === 'ENOENT' && !filePath.endsWith(path.sep)) {
				try {
					var newPath = filePath + path.sep;
					st = await fs.stat(newPath);
					// If this worked, update filePath to include the slash internally
					if (st && st.isDirectory()) {
						filePath = newPath;
						context.filePath = path.normalize(filePath);
						updateContextPaths(filePath);
					}
				} catch (ex) {}
			}
			if (!st) throw e;
		}

		if (st && st.isDirectory()) {
			var indexFilePath = path.join(context.filePath, "index.html");
			var san = path.normalize(indexFilePath);

			if (await exists(san)) {
				context.filePath = san;
				context.isDirectoryWithIndex = true;
				context.fileName = "index.html";
			} else {
				context.isDirectoryWithoutIndex = true;
				context.dependencies.awtsRes.ended = false;
			}

			// B"H: REDIRECT LOGIC
			if (request.method === 'GET') {
				var reqUrl = request.url || "";
				var pathPart = reqUrl.split("?")[0].split("#")[0];
				
				// If it's a directory (or we resolved an index inside one)
				// and the URL doesn't end with '/', redirect.
				if (!pathPart.endsWith("/")) {
					// Construct ABSOLUTE URL for safety
					var host = request.headers.host || "localhost";
					var protocol = (request.socket.encrypted || request.headers['x-forwarded-proto'] === 'https') ? 'https' : 'http';
					
					var newPath = pathPart + "/";
					if(reqUrl.length > pathPart.length) {
						newPath += reqUrl.substring(pathPart.length);
					}
					
					var absoluteRedirectUrl = protocol + "://" + host + newPath;

					try {
						if (!response.headersSent) {
							// Check if this is a Service Worker status check
							var isStatusCheck = request.headers['awtsmoos-file-status'] === 'true' || 
							                    request.headers['awtsmoos-file-status'] === '1';

							if (isStatusCheck) {
								// Return JSON instructing the SW to redirect
								response.writeHead(200, {
									"Content-Type": "application/json"
								});
								response.end(JSON.stringify({
									redirect: absoluteRedirectUrl
								}));
							} else {
								// Standard Browser Redirect
								response.writeHead(301, {
									"Location": absoluteRedirectUrl
								});
								response.end();
							}
							
							awtsRes.ended = true;
							return true;
						}
					} catch(e) {
						console.error("B\"H Error Redirecting", e);
					}
				}
			}
		} else if (st) {
			context.isRealFile = true;
			context.dependencies.awtsRes.ended = false;
		}
	} catch (err) {
		doesNotExist = true;
		if (err.code != "ENOENT")
			console.log("Issue?", err);
	}

	context.dependencies.awtsRes.ended = false;
	var isReal = (!doesNotExist);

	var isDynamic = !isReal || context.isDirectoryWithoutIndex;
	if (isDynamic) {
		context.foundAwtsmooses = await awtsRes.getAwtsmoosInfo(
			context.filePath,
			parentPath
		);
	}

	context.logs.lol = {
		filePath: context.filePath,
		fa: context.foundAwtsmooses,
		isDynamic
	}

	return (!!context.foundAwtsmooses.length || isReal);
}

module.exports = getPathInfo;