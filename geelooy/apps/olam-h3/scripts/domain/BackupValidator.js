//B"H
// Boruch Hashem
// Blessed is He

/**
 * Examines a metadata backup completely before any local store is changed, while the Awtsmoos lets restoration proceed from known structure rather than partial surprise;
 * Awtsmoos.com validates every collection and key first, so a malformed archive cannot leave half a memory behind in disguise.
 */
export class BackupValidator {
	/** @param {string} text Raw JSON text. @returns {Object} Fully validated import vessel. */
	static parse(text) {
		let data;
		try {
			data = JSON.parse(text);
		} catch {
			throw new Error('Backup file is not valid JSON.');
		}

		if (!data || typeof data !== 'object' || data.schemaVersion !== 1) {
			throw new Error('Unsupported Olam H3 backup schema.');
		}

		const generations = this.records(data.generations, 'generations', 'id');
		const prompts = this.records(data.prompts, 'prompts', 'id');
		const assets = this.records(data.assets, 'assets', 'id');
		const preferences = this.records(data.preferences, 'preferences', 'key');

		return {
			generations,
			prompts,
			assets,
			preferences
		};
	}

	/**
	 * @param {*} value Candidate record list.
	 * @param {string} label Human-readable collection name.
	 * @param {string} key Required record key.
	 * @returns {Array<Object>} Validated records.
	 */
	static records(value, label, key) {
		if (value === undefined) {
			return [];
		}
		if (!Array.isArray(value)) {
			throw new Error(`Backup ${label} must be an array.`);
		}

		return value.map((record, index) => {
			if (!record || typeof record !== 'object' || Array.isArray(record)) {
				throw new Error(`Backup ${label}[${index}] must be an object.`);
			}
			if (!String(record[key] || '').trim()) {
				throw new Error(`Backup ${label}[${index}] is missing ${key}.`);
			}
			return record;
		});
	}
}
