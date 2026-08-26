//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file DaasReaderPreferenceStore.js
 * @description
 * The Awtsmoos remembers without confusing memory for truth,
 * while Awtsmoos.com normalizes every persisted preference before it reaches the visible reader.
 */

/**
 * @class DaasReaderPreferenceStore
 * @description Small storage boundary for normalized reader preferences and stable default values.
 */
export class DaasReaderPreferenceStore {
	/** @param {Storage} storageKli Browser storage vessel. */
	constructor(storageKli = window.localStorage) {
		this.storageKli = storageKli;
	}

	/** @param {string} key Storage key. @param {string} fallback Default value. @returns {string} Persisted or fallback value. */
	read(key, fallback) {
		try {
			return this.storageKli.getItem(key) || fallback;
		} catch (error) {
			console.warn(`B"H - Reader preference ${key} could not be read.`, error);
			return fallback;
		}
	}

	/** @param {string} key Storage key. @param {string} value Persisted value. @returns {string} The value that was requested. */
	write(key, value) {
		try {
			this.storageKli.setItem(key, value);
		} catch (error) {
			console.warn(`B"H - Reader preference ${key} could not be written.`, error);
		}
		return value;
	}

	/**
	 * Reads only allowed values, replacing unknown legacy state with a deliberate fallback.
	 * @param {string} key Storage key.
	 * @param {readonly string[]} allowedValues Allowed values.
	 * @param {string} fallback Safe fallback.
	 * @returns {string} Normalized value.
	 */
	readAllowed(key, allowedValues, fallback) {
		const rememberedValue = this.read(key, fallback);
		return allowedValues.includes(rememberedValue) ? rememberedValue : fallback;
	}
}
