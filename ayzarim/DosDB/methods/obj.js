//B"H

const awtsmoosJSON = require("../awtsmoosBinary/awtsmoosBinaryJSON/index.js");
module.exports = {
    async appendToObj(pth, {key, value}={}) {
		var pathic =  await this.ensureAwtsmoosBinaryPath(pth);
		return awtsmoosJSON.appendToObj(pathic, {key, value})
    },
	async getMetadaOfEntry(pth, key) {
		var pathic =  await this.ensureAwtsmoosBinaryPath(pth);
	
		
		
		var meta = awtsmoosJSON.getMetadataByKey(pathic, key);
		return meta;
	},
	async getValue(pth, key) {
		var pathic =  await this.ensureAwtsmoosBinaryPath(pth);
		var val = awtsmoosJSON.getValueByKey(pathic, key)
		return val;
	},
	async syncKeyToObj(pth, key) {
		//just for keeping track of keys. no values.
		var pathic =  await this.ensureAwtsmoosBinaryPath(pth);
		var meta = await this.getMetadaOfEntry(pathic, key);
		if(meta?.key) {
			return null;
		}
		return this.appendToObj(pathic, {
			key,
			value: true
		})
	},
	async syncKeyInObj(pth, key) {
		return await this.syncKeyToObj(pth, key)
	},	
	async deleteEntry(pth, key) {
		var pathic =  await this.ensureAwtsmoosBinaryPath(pth);
		return awtsmoosJSON.deleteKeyFromObj(pathic, key)
	}
}