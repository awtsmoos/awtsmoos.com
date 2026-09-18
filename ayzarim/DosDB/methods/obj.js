//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file obj.js
 * @chapter The Object Reader Knows A Hallway From A Letter
 * @description
 * Legacy DosDB object operations remain faithful to BinaryJSON files while
 * directory collections reveal logical child keys directly. Thus the Awtsmoos
 * lets old and new storage vessels meet without opening a directory as a file.
 */

const awtsmoosJSON = require("../awtsmoosBinary/awtsmoosBinaryJSON/index.js");
const { directoryObjectKeys } = require("./objectKeySource.js");

module.exports = {
	async appendToObj(objPath, newObj = {}, { isInTrash = false } = {}) {
		const filePath = await this.ensureAwtsmoosBinaryPath(objPath);
		if (typeof newObj !== "object" || !newObj) return null;
		if (this.appendToArray) return null;
		if (isInTrash) await this.updateTrashInfo(filePath);
		return awtsmoosJSON.appendToObj(filePath, newObj);
	},

	async updateEntry(entryPath, newData, opts = {}) {
		const newObj = opts?.metadata ? { [opts.property]: newData } : newData;
		return this.appendToObj(entryPath, newObj, { isInTrash: opts.isInTrash });
	},

	async appendToArrayAtKey(objPath, key, newElement, { isInTrash = false } = {}) {
		const filePath = await this.ensureAwtsmoosBinaryPath(objPath);
		if (!Array.isArray(newElement)) return null;
		if (isInTrash) await this.updateTrashInfo(filePath);
		return awtsmoosJSON.appendToArray(filePath, key, newElement);
	},

	async setObjectKey(objPath, key, value, { isInTrash = false } = {}) {
		return this.appendToObj(objPath, { key, value }, { isInTrash });
	},

	async hasObjectKey(objPath, key) {
		return (await this.getValue(objPath, key)) !== null;
	},

	async getMetadataList(entryPath, { properties, propertyMap } = {}) {
		const list = Array.isArray(properties) ? properties : [];
		return Promise.all(list.map(property => this.getMetadata(entryPath, { property, propertyMap })));
	},

	async getMetadaOfEntry(entryPath, properties) {
		return this.get(entryPath, { propertyMap: properties });
	},

	async getValue(id, key, propertyMap) {
		const pathic = await this.ensureAwtsmoosBinaryPath(id);
		const value = await awtsmoosJSON.getValueByKey(pathic, key, propertyMap);
		if (!value) await this.get(id, { propertyMap: { [key]: propertyMap } });
		return value;
	},

	async getObjectKey(id, key, propertyMap) {
		return this.getValue(id, key, propertyMap);
	},

	async syncKeyToObj(objPath, newObj = {}, opts = {}) {
		if (opts?.metadata) return this.syncKeyInObj(objPath, opts.metadata.key, newObj);
		return this.appendToObj(objPath, newObj);
	},

	async syncKeyInObj(objPath, key, newValue) {
		return this.appendToObj(objPath, { key, value: newValue });
	},

	async deleteEntry(id, opts = {}) {
		if (!opts?.metadata) return false;
		return this.deleteObjectKey(id, opts.property, opts);
	},

	async deleteObjectKey(id, key, opts = {}) {
		const filePath = await this.ensureAwtsmoosBinaryPath(id);
		const nullifyDeleted = opts?.nullifyDeleted;
		if (typeof nullifyDeleted === "object" && nullifyDeleted?._awtsmoosOptions && !this.appendToArray) {
			return awtsmoosJSON.deleteKeyFromObj(filePath, key);
		}
		return null;
	},

	async getObjectKeys(pth) {
		const targetPath = await this.ensureAwtsmoosBinaryPath(pth);
		const directoryKeys = await directoryObjectKeys(targetPath);
		if (directoryKeys !== null) return directoryKeys;
		return awtsmoosJSON.getKeysFromBinary(targetPath);
	},

	async updateTrashInfo(filePath, action = "update") {
		const trashInfo = await this.get(filePath, { propertyMap: { trashInfo: true } });
		const existing = trashInfo?.trashInfo || {};
		return this.appendToObj(filePath, {
			trashInfo: {
				...existing,
				updatedAt: new Date().toISOString(),
				updates: (existing.updates || 0) + 1,
				action
			}
		});
	}
};
