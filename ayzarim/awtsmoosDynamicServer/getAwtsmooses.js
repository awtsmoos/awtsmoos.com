/**
 * B"H
 * Some helper functions 
 * to mock requests 
 * and get template files
 */
let isBinary = false;
var isRealFile = false;
var foundAwtsmooses = []
var url = require("url");
var fs = require("fs").promises;
var path = require("path")
var getProperContent = require("./getProperContent.js")
var fetchAwtsmoos = require("./fetchAwtsmoos.js");

class Ayzarim {
	constructor(dependencies) {
		this.dependencies = dependencies;
		this.fetchAwtsmoos = fetchAwtsmoos;
		this.dependencies.fetchAwtsmoos = this.fetchAwtsmoos.bind(this)
		this.server = dependencies.self;
		this.foundAwtsmooses = []
		this.logs = {}

		this.filePath = dependencies.filePath;
		this.parentPath = dependencies.parentPath;

		this.isDirectoryWithIndex = false
		this.isRealFile = false
		this.contentType = dependencies.contentType
	}

	errorMessage(...args) {
		return errorMessage.bind(this)(...args)
	}

	async doEverything() {
		return (doEverything.bind(this))()
	}
}

async function getPathInfo() {
	var {
		filePath,
		awtsRes,
		response,
		originalPath,
		location, // We need this to preserve query params during redirect
		request
	} = this.dependencies;

	this.filePath = path.normalize(filePath);
	awtsRes.ended = false;
	var doesNotExist = false;

	this.filePaths = filePath
		.split("\\")
		.filter(q => q)
		.join("/")
		.split("/")
		.filter(w => w);

	this.fileName = this.filePaths[this.filePaths.length - 1];

	try {
		var st = null;
		try {
			st = await fs.stat(filePath);
		} catch (e) {
			// Soft Retry: If the path failed, check if it works by treating it as a folder
			// This allows internal resolution of "/jem" -> "/jem/" without forcing a redirect for POSTs
			if (e.code === 'ENOENT' && !filePath.endsWith(path.sep)) {
				try {
					st = await fs.stat(filePath + path.sep);
					// If this worked, update filePath to include the slash internally
					if (st && st.isDirectory()) filePath = filePath + path.sep;
				} catch (ex) {}
			}
			if (!st) throw e;
		}

		if (st && st.isDirectory()) {
			// B"H: INTELLIGENT REDIRECT LOGIC
			// 1. If it's a GET request (Browser navigation), we MUST redirect to add the trailing slash.
			//    This ensures that relative links (style.css, fetch('api')) resolve to this folder, not the parent.
			// 2. If it's a POST/PUT/DELETE, we DO NOT redirect.
			//    Redirecting a POST often causes the body to be lost (301/302) or requires a 307.
			//    Since we resolved the path internally above, we can just serve the response directly.

			if (!originalPath.endsWith('/') && request.method === 'GET') {
				var redirectUrl = originalPath + '/';

				// Preserve Query Parameters and Hash
				if (location && location.search) redirectUrl += location.search;
				if (location && location.hash) redirectUrl += location.hash;

				response.writeHead(301, {
					Location: redirectUrl
				});
				response.end();
				awtsRes.ended = true;
				return false;
			}

			var indexFilePath = path.join(this.filePath, "index.html");
			var san = path.normalize(indexFilePath);

			if (await exists(san)) {
				this.filePath = san;
				this.isDirectoryWithIndex = true;
				this.fileName = "index.html";
			} else {
				this.isDirectoryWithoutIndex = true;
				this.dependencies.awtsRes.ended = false;
			}
		} else if (st) {
			this.isRealFile = true;
			this.dependencies.awtsRes.ended = false;
		}
	} catch (err) {
		doesNotExist = true;
		if (err.code != "ENOENT")
			console.log("Issue?", err);
	}

	this.dependencies.awtsRes.ended = false;
	var isReal = (!doesNotExist);

	var isDynamic = !isReal || this.isDirectoryWithoutIndex;
	if (isDynamic) {
		this.foundAwtsmooses = await awtsRes.getAwtsmoosInfo(
			this.filePath,
			this.parentPath
		);
	}

	this.logs.lol = {
		filePath: this.filePath,
		fa: this.foundAwtsmooses,
		isDynamic
	}

	return (!!this.foundAwtsmooses.length || isReal);
}

async function doEverything() {
	var {
		fs,
		awtsRes,
		response,
		originalPath,
		request,
		getPostData,
		getPutData,
		getDeleteData
	} = this.dependencies;

	var iExist = await (getPathInfo.bind(this))();

	if (!iExist) {
		if (this.fileName && this.fileName.startsWith("@")) {
			var tr = "/@/" + this.fileName.substring(1)
			var res = await this.fetchAwtsmoos(tr, {
				superSecret: true
			})

			if (res) {
				if (typeof (res) == "object") {
					res = JSON.stringify(res);
					response.setHeader("content-type", "application/json; charset=utf-8")
				}
				response.end(res);
			} else return errorMessage.bind(this)({
				message: "Content empty",
				code: "EMPTY"
			})
			return;
		}

		try {
			return errorMessage.bind(this)({
				message: "Dynamic route not found",
				code: "DYN_ROUTE_NOT_FOUND",
				info: {
					filePath: this.filePath
				},
				logs: this.logs
			});
		} catch (e) {}
	}

	if (this.isDirectoryWithIndex) {
		this.contentType = "text/html";
	}

	var didThisPathAlready = false;

	if (request.method.toUpperCase() == "POST") await getPostData();
	if (request.method.toUpperCase() == "PUT") await getPutData();
	if (request.method.toUpperCase() == "DELETE") await getDeleteData();

	if (this.foundAwtsmooses.length && !this.isDirectoryWithIndex) {
		try {
			didThisPathAlready = await awtsRes.doAwtsmooses({
				foundAwtsmooses: this.foundAwtsmooses,
				filePath: this.filePath,
				extraInfo: {
					fetchAwtsmoos: this.fetchAwtsmoos
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
		if (this.isDirectoryWithIndex || this.isRealFile) {
			var startsWithAw = this.fileName.startsWith("_awtsmoos")
			if (!startsWithAw || request.superSecret) {
				return await doFileResponse.bind(this)();
			} else {
				return errorMessage.bind(this)("You're not allowed to see that!")
			}
		} else {
			return errorMessage.bind(this)({
				message: "Invalid Dynamic Route",
				code: "INVALID_DYNAMIC_ROUTE",
				more: {
					didThisPathAlready,
					foundAwtsmooses: this.foundAwtsmooses,
					idwi: this.isDirectoryWithIndex,
					logs: this.logs
				}
			})
		}
	} else if (didThisPathAlready.error) {
		return errorMessage.bind(this)({
			message: "actual error in route computation!",
			code: "ROUTE_ERROR",
			error: didThisPathAlready.error,
			more: {
				didThisPathAlready,
				logs: this.logs,
				foundAwtsmooses: this.foundAwtsmooses
			}
		})
	}

	if (didThisPathAlready.c) {
		var res = didThisPathAlready.responseInfo;

		try {
			response.setHeader('Vary', 'Cookie');
			if (!res.actualResponse) {
				return errorMessage.bind(this)({
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

			var con = bin || res.actualResponse.content;
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
				console.log("GOING to DO", con, res)
				return errorMessage.bind(this)({
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
		return errorMessage.bind(this)({
			message: "Invalid Route",
			code: "INVALID_ROUTE",
			more: {
				didThisPathAlready,
				logs: this.logs,
				foundAwtsmooses: this.foundAwtsmooses
			}
		})
	} else if (didThisPathAlready.isPrivate) {
		return errorMessage.bind(this)({
			message: "That's a private route",
			code: "PRIVATE_ROUTE"
		})
	} else {
		return errorMessage.bind(this)({
			message: "Did not find route",
			code: "NOT_FOUND"
		})
	}
}

async function doFileResponse() {
	var {
		fs,
		request,
		response,
		template,
		binaryMimeTypes,
		fetchAwtsmoos
	} = this.dependencies;

	try {
		if (request.method == "GET" && request.isAwtsmoosFileStatusRequest) {
			try {
				const stats = await fs.stat(this.filePath);
				const result = {
					dataModified: stats.mtime.getTime()
				};
				response.setHeader('Content-Type', 'application/json; charset=utf-8');
				response.end(JSON.stringify(result));
				return;
			} catch (error) {
				console.error("Error getting file stats for static file:", error);
				return errorMessage.bind(this)({
					message: "Could not get file status for static resource.",
					code: "STATIC_STAT_ERROR"
				});
			}
		}
		let content;

		if (binaryMimeTypes.includes(this.contentType)) {
			content = await fs.readFile(this.filePath);
			this.isBinary = true;
		} else {
			var textContent = await fs.readFile(this.filePath, 'utf-8');
			var last = this.filePath.split("\\").join("/").split("/").pop()
			var ext = last.split(".")[1];
			if (!(ext == "html" || this.isDirectoryWithIndex)) {
				content = textContent;
			} else {
				var ei = request.yeser;
				if (!(typeof (ei) == "object" && ei)) ei = {}
				ei.fetchAwtsmoos = fetchAwtsmoos;
				var temp = await template(textContent, ei);
				content = temp
			}
		}

		content = setProperContent.bind(this)(
			content,
			this.contentType,
			this.isBinary
		);

		response.end(content);
		return;
	} catch (errors) {
		console.error(errors);
		return errorMessage.bind(this)(errors)
	}
}

function setProperContent(content, contentType, isBinary = false) {
	var {
		response
	} = this.dependencies;
	var cnt = getProperContent(content, contentType, isBinary);
	if (cnt.contentType) {
		try {
			response.setHeader('Content-Type', cnt.contentType + (isBinary ? '' : '; charset=utf-8'));
		} catch (e) {}
	}
	return cnt.content;
}

function errorMessage(custom) {
	var {
		response
	} = this.dependencies;
	try {
		try {
			response.setHeader("content-type", "application/json; charset=utf-8");
		} catch (e) {}
		try {
			response.end(JSON.stringify({
				BH: "B\"H",
				error: custom || "Not found"
			}));
		} catch (e) {}
	} catch (e) {
		console.log(e)
	}
	return true;
}

async function exists(filePath) {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
};
module.exports = Ayzarim;