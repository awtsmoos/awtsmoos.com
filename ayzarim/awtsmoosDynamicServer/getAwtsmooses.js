/**
 * B"H
 * Awtsmoos Dynamic Server Main Class
 * Refactored into multiple modules.
 */
var fetchAwtsmoos = require("./fetchAwtsmoos.js");
var doEverything = require("./requestHandler.js");
var { errorMessage } = require("./utils.js");

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
		return errorMessage(this, ...args)
	}

	async doEverything() {
		return doEverything(this)
	}
}

module.exports = Ayzarim;