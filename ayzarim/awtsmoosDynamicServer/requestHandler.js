/**
 * B"H
 */
var getPathInfo = require("./pathResolver.js");
var doFileResponse = require("./fileServer.js");
var { errorMessage } = require("./utils.js");

async function doEverything(context) {
	var {
		awtsRes,
		response,
		request,
		getPostData,
		getPutData,
		getDeleteData
	} = context.dependencies;

	var iExist = await getPathInfo(context);

	// B"H
	// If getPathInfo handled the response (e.g. via redirect), we stop here.
	if (awtsRes.ended) return;

	if (!iExist) {
		if (context.fileName && context.fileName.startsWith("@")) {
			var tr = "/@/" + context.fileName.substring(1)
			var res = await context.fetchAwtsmoos(tr, {
				superSecret: true
			})

			if (res) {
				if (typeof (res) == "object") {
					res = JSON.stringify(res);
					response.setHeader("content-type", "application/json; charset=utf-8")
				}
				response.end(res);
			} else return errorMessage(context, {
				message: "Content empty",
				code: "EMPTY"
			})
			return;
		}

		try {
			return errorMessage(context, {
				message: "Dynamic route not found",
				code: "DYN_ROUTE_NOT_FOUND",
				info: {
					filePath: context.filePath
				},
				logs: context.logs
			});
		} catch (e) {}
	}

	if (context.isDirectoryWithIndex) {
		context.contentType = "text/html";
	}

	var didThisPathAlready = false;

	if (request.method.toUpperCase() == "POST") await getPostData();
	if (request.method.toUpperCase() == "PUT") await getPutData();
	if (request.method.toUpperCase() == "DELETE") await getDeleteData();

	if (context.foundAwtsmooses.length && !context.isDirectoryWithIndex) {
		try {
			didThisPathAlready = await awtsRes.doAwtsmooses({
				foundAwtsmooses: context.foundAwtsmooses,
				filePath: context.filePath,
				extraInfo: {
					fetchAwtsmoos: context.fetchAwtsmoos
				}
			});
		} catch (e) {
			return {
				BH: "yo",
				AwtsmoosError: {
					message: e.message,
					stack: e.stack
				}
			}
		}
	}

	if (didThisPathAlready === false) {
		if (context.isDirectoryWithIndex || context.isRealFile) {
			var startsWithAw = context.fileName.startsWith("_awtsmoos")
			if (!startsWithAw || request.superSecret) {
				return await doFileResponse(context);
			} else {
				return errorMessage(context, "You're not allowed to see that!")
			}
		} else {
			return errorMessage(context, {
				message: "Invalid Dynamic Route",
				code: "INVALID_DYNAMIC_ROUTE",
				more: {
					didThisPathAlready,
					foundAwtsmooses: context.foundAwtsmooses,
					idwi: context.isDirectoryWithIndex,
					logs: context.logs
				}
			})
		}
	} else if (didThisPathAlready.error) {
		return errorMessage(context, {
			message: "actual error in route computation!",
			code: "ROUTE_ERROR",
			error: didThisPathAlready.error,
			more: {
				didThisPathAlready,
				logs: context.logs,
				foundAwtsmooses: context.foundAwtsmooses
			}
		})
	}

	if (didThisPathAlready.c) {
		var res = didThisPathAlready.responseInfo;
		var con = bin || res.actualResponse.content;
		if(res.statusResponse) {
			response.setHeader('Awtsmoos-File-Status', 'true'); 
			response.setHeader('Content-Type', 'application/json; charset=utf-8');    
			response.end(con)
			return;
		}
		try {
			response.setHeader('Vary', 'Cookie');
			if (!res.actualResponse) {
				return errorMessage(context, {
					message: "No actual response",
					code: "NO_AC_RES",
					info: res,
					details: didThisPathAlready
				})
			}
			var ar = res.actualResponse;
			var bin = null;
			if (Buffer.isBuffer(ar)) {
				bin = ar;
			} else if (res.actualResponse.contentType) {
				response.setHeader(
					"content-type",
					res.actualResponse.contentType + "; charset=utf-8"
				);
			}

			
			if (con || con === "undefined" || con === "null") {
				if (Buffer.isBuffer(con)) {
					//do nothing
				} else if (typeof (con) == "object") {
					con = JSON.stringify(con)
				} else if (typeof (con) != "string") {
					con += ""
				}
				response.end(con)
			} else {
			
				return errorMessage(context, {
					message: "No Awtsmoos Response",
					code: "NO_AWTS_RESP",
					con: typeof (con)
				});
			}
		} catch (e) {
			console.log("Problem", e)
		}
		return;
	} else if (didThisPathAlready.invalidRoute) {
		return errorMessage(context, {
			message: "Invalid Route",
			code: "INVALID_ROUTE",
			more: {
				didThisPathAlready,
				logs: context.logs,
				foundAwtsmooses: context.foundAwtsmooses
			}
		})
	} else if (didThisPathAlready.isPrivate) {
		return errorMessage(context, {
			message: "That's a private route",
			code: "PRIVATE_ROUTE"
		})
	} else {
		return errorMessage(context, {
			message: "Did not find route",
			code: "NOT_FOUND"
		})
	}
}

module.exports = doEverything;