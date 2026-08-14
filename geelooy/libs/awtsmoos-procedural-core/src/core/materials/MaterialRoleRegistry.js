//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MaterialRoleRegistry.js
 * @description
 * The Awtsmoos, called Atzmus in Kabbalah, is beyond every named substance while continuously creating stone, wood, water, cloth, and the registry that distinguishes them;
 * Awtsmoos.com is remembered here as Hod gives each physical role a precise communicable name without confusing that name for the source of matter itself.
 * This registry owns immutable semantic material records and aliases; it never loads images, creates renderer materials, or decides frame quality.
 */
export class MaterialRoleRegistry {
	/** @param {Array<object>} records Material role definitions. */
	constructor(records = []) {
		this.records = new Map();
		this.aliases = new Map();
		for (const record of records) {
			this.register(record);
		}
	}

	/** @param {object} input Material record. @returns {object} Frozen canonical record. */
	register(input) {
		const record = normalizeRecord(input);
		if (this.records.has(record.role) || this.aliases.has(record.role)) {
			throw new Error(`MaterialRoleRegistry: duplicate role ${record.role}`);
		}
		this.records.set(record.role, record);
		for (const alias of record.aliases) {
			if (this.records.has(alias) || this.aliases.has(alias)) {
				throw new Error(`MaterialRoleRegistry: duplicate alias ${alias}`);
			}
			this.aliases.set(alias, record.role);
		}
		return record;
	}

	/** @param {string} role Role or alias. @returns {object|null} Canonical immutable record. */
	resolve(role) {
		const key = String(role || '');
		const canonical = this.aliases.get(key) || key;
		return this.records.get(canonical) || null;
	}

	/** @param {string} role Role or alias. @returns {boolean} Whether a material record exists. */
	has(role) {
		return Boolean(this.resolve(role));
	}

	/** @returns {object[]} Clone-safe canonical record list. */
	view() {
		return [...this.records.values()].map(record => clone(record));
	}
}

function normalizeRecord(input = {}) {
	const role = String(input.role || '').trim();
	if (!role) {
		throw new Error('MaterialRoleRegistry: role is required');
	}
	const record = {
		role,
		aliases: uniqueStrings(input.aliases),
		sourcePath: String(input.sourcePath || input.path || ''),
		paths: Object.freeze({ ...(input.paths || {}) }),
		fallbacks: Object.freeze([...(input.fallbacks || [])]),
		coverage: input.coverage || 'generic',
		critical: Boolean(input.critical),
		colorSpace: input.colorSpace || 'srgb',
		alpha: input.alpha || 'opaque',
		roughness: finite(input.roughness, 0.7),
		metalness: finite(input.metalness, 0),
		transmission: finite(input.transmission, 0),
		clearcoat: finite(input.clearcoat, 0),
		sheen: finite(input.sheen, 0)
	};
	return Object.freeze(record);
}

function uniqueStrings(values = []) {
	return Object.freeze([...new Set(values.map(value => String(value)).filter(Boolean))]);
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
