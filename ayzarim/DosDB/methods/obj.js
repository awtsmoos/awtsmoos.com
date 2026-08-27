//B"H

const awtsmoosJSON = require("../awtsmoosBinary/awtsmoosBinaryJSON/index.js");
module.exports = {
    async appendToObj(pth, {key, value}={}) {
		var pathic =  await this.ensureAwtsmoosBinaryPath(pth);
		var app = awtsmoosJSON.appendToObj(pathic, {key, value})
		if(app.total && app.freeSpace) {
			var percentage =app.freeSpace / app.total;
			await updateTrashInfo(pathic, percentage);
		}
		return app;
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
		if(!meta || meta?.notFound) {
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
	async getValue(pth, key, map) {
		var ty = typeof(map);
		var pathic =  await this.ensureAwtsmoosBinaryPath(pth);
		var val = null;
		
			
		if(map && ty == "object") {
			var props = {}
			props[key] = map;
			
			var mpt =  awtsmoosJSON.mapObject(
				pathic,
				props,
				null,
				null
			);
			
			
			val = mpt[key];
		} else {
			
			val = awtsmoosJSON.getValueByKey(pathic, key);
			
			if(!val) {
				d = await this.get(pathic, {propertyMap: map})
			
			
			}
		}
		
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
		
			return {
				exists: meta,
				path:pathic,
				key
			}
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
		var del = awtsmoosJSON.deleteKeyFromObj(pathic, key)
		if(del.total && del.freeSpace) {
			var percentage =del.freeSpace / del.total;
			await updateTrashInfo(pathic, percentage);
		}
		return del;
	},
	async deleteObjectKey(pth, key) {
		return this.deleteEntry(pth, key)
	},
	async getObjectKeys(pth) {
		var pathic =  await this.ensureAwtsmoosBinaryPath(pth);
		return awtsmoosJSON.getKeysFromBinary(pathic)
	},
	async updateTrashInfo(pth, percentTrash) {
		var trashes = await this.ensureAwtsmoosBinaryPath(".trashes");
		var trashedPath = await this.ensureAwtsmoosBinaryPath(pth);
		this.appendToObj(trashes, {
			key: trashedPath,
			value: percentTrash
		})
	}
}