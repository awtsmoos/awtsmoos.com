//B"H

const awtsmoosJSON = require("../awtsmoosBinary/awtsmoosBinaryJSON/index.js");
module.exports = {
    async appendToObj(pth, {key, value}={}) {
		var pathic =  await this.ensureAwtsmoosBinaryPath(pth);
		return awtsmoosJSON.appendToObj(pathic, {key, value})
    },

	async updateEntry(pth, {key, value}) {
		var pathic =  await this.ensureAwtsmoosBinaryPath(pth);
		return awtsmoosJSON.appendToObj(pathic, {key, value}, {
			reservePlace: true
		});
	},

	async appendToArrayAtKey(pth, {key, shtar}) {
		var pathic =  await this.ensureAwtsmoosBinaryPath(pth);
		// We need an operation like "appendToArrayAtKey" or simulate it:
		// a. Get current array for the verseSection
		let ar = await this.getObjectKey(pathic, key);

		// b. Initialize if it doesn't exist or isn't an array
		if (!Array.isArray(ar)) {
			ar = [];
		}

		// c. Append the new shtar
		ar.push(shtar);

		// d. Write the updated array back to the key
		var writeResult = await this.setObjectKey(pathic, key, ar);
		return writeResult
		
		
	},
	async setObjectKey(pth, key, value) {
		return this.appendToObj(pth, {
			key, 
			value
		})
	},
	async hasObjectKey(pth, key) {
		var pathic =  await this.ensureAwtsmoosBinaryPath(pth);
	
		var meta = awtsmoosJSON.getMetadataByKey(pathic, key)
		if(meta.notFound) {
			return false;
		}
		return true;
	},

	async getMetadataList(pth) {
		var pathic =  await this.ensureAwtsmoosBinaryPath(pth);
		var meta = awtsmoosJSON.getMetadata(pathic);
		return meta;
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
	async getObjectKey(pth, key) {
		return this.getValue(pth, key)
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
		});

	},
	async syncKeyInObj(pth, key) {
		return await this.syncKeyToObj(pth, key)
	},	
	async deleteEntry(pth, key) {
		var pathic =  await this.ensureAwtsmoosBinaryPath(pth);
		return awtsmoosJSON.deleteKeyFromObj(pathic, key)
	},
	async deleteObjectKey(pth, key) {
		return this.deleteEntry(pth, key)
	},
	async getObjectKeys(pth) {
		var pathic =  await this.ensureAwtsmoosBinaryPath(pth);
		return awtsmoosJSON.getKeysFromBinary(pathic)
	}
}