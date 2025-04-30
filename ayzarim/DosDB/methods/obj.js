//B"H

const awtsmoosJSON = require("../awtsmoosBinary/awtsmoosBinaryJSON/index.js");
module.exports = {
    async appendToObj(pth, {key, value}={}) {
		var pathic =  await this.ensureAwtsmoosBinaryPath(pth);
		return awtsmoosJSON.appendToObj(pathic, {key, value})
    }
}