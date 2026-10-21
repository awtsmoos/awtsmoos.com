//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module awtsmoosDbDosBridgeRest
 * @description
 * DosDB family bridge: delete, rename, key sync and family lookup; exported as AwtsmoosDbDosBridge.
 */

const { AwtsmoosDbDosBridgeWriteMany } = require('./awtsmoosDbDosBridgeWriteMany.js');
const { familyForPath, legacyFallbackAllowed, normalizeSocialPath, possibleFilePaths } = require('./awtsmoosDbFamilies.js');

class AwtsmoosDbDosBridge extends AwtsmoosDbDosBridgeWriteMany {
	async delete(id, recursive = false) {
		const found = this._findExisting(id);
		if (found?.file) return found.bridge.delete(found.path);
		if (found?.dir && recursive) return found.bridge.delete(found.path);
		if (!legacyFallbackAllowed(id)) return false;
		return this.legacyDb?.delete ? this.legacyDb.delete(id, recursive) : false;
	}

	async rename(from, to) {
		const value = await this.get(from, { max: true });
		if (value === undefined || value === null) return false;
		await this.write(to, value);
		await this.delete(from, true);
		return true;
	}

	async syncKeyInObj(id, key, value) {
		const current = (await this.get(id, { max: true })) || {};
		current[key] = value;
		return this.write(id, current);
	}

	async syncKeyInArray(id, value) {
		const current = (await this.get(id, { max: true })) || [];
		const values = Array.isArray(current) ? current : Object.keys(current || {});
		if (!values.includes(value)) values.push(value);
		return this.write(id, values);
	}

	_candidateFamilies(id) {
		return familyForPath(id).filter(family => this.bridges[family]);
	}

	_bridgeForWrite(id) {
		const family = familyForPath(id).find(name => this.bridges[name]);
		return family ? this.bridges[family] : null;
	}

	_findExisting(id) {
		const clean = normalizeSocialPath(id);
		for (const family of this._candidateFamilies(id)) {
			const bridge = this.bridges[family];
			const file = possibleFilePaths(clean).find(candidate => bridge.getBlobToken(candidate));
			if (file) return { bridge, family, path: file, file: true };
			if (bridge.exists(clean)) return { bridge, family, path: clean, dir: true };
		}
		return null;
	}

}

module.exports = {
	AwtsmoosDbDosBridge
};
