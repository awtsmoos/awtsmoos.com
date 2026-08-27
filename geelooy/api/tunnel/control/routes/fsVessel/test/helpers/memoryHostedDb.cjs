//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 * This isolated database remembers only the contracts under test. The Awtsmoos
 * creates every real record anew; Awtsmoos.com uses this small vessel to break
 * recovery logic without touching a living user's filesystem.
 */
class MemoryHostedDb {
	constructor(ownership = {}) {
		this.entries = new Map();
		this.ownership = ownership;
		this.failNextDelete = false;
		this.failNextWrite = false;
	}

	async get(path) {
		const aliasMatch = String(path).match(/^\/users\/([^/]+)\/aliases\/?([^/]*)/);

		if (aliasMatch) {
			return this.aliasValue(aliasMatch[1], aliasMatch[2]);
		}

		return await this.read(path);
	}

	async read(path) {
		const exact = this.entries.get(path);

		if (exact !== undefined && !isPlainObject(exact)) {
			return exact;
		}

		const children = this.immediateChildren(path);

		if (exact !== undefined) {
			return { ...exact, ...children };
		}

		return Object.keys(children).length ? children : null;
	}

	async write(path, value) {
		if (this.failNextWrite) {
			this.failNextWrite = false;
			throw new Error("injected_database_write_failure");
		}

		this.entries.set(path, value === undefined ? {} : value);
		return { path, written: true };
	}

	async delete(path) {
		if (this.failNextDelete) {
			this.failNextDelete = false;
			throw new Error("injected_database_delete_failure");
		}

		for (const key of [...this.entries.keys()]) {
			if (key === path || key.startsWith(`${path}/`)) {
				this.entries.delete(key);
			}
		}

		return true;
	}

	aliasValue(userId, rawAlias) {
		const aliases = this.ownership[userId] || [];
		const alias = String(rawAlias || "").replace(/\.awtsmoosJSON$/, "");

		if (!alias) {
			return Object.fromEntries(aliases.map(value => [value, { aliasId: value }]));
		}

		return aliases.includes(alias) ? { aliasId: alias } : null;
	}

	immediateChildren(path) {
		const prefix = String(path).endsWith("/") ? String(path) : `${path}/`;
		const children = {};

		for (const [key, value] of this.entries) {
			if (!key.startsWith(prefix)) {
				continue;
			}

			const remainder = key.slice(prefix.length);
			const [name, ...rest] = remainder.split("/");

			if (name) {
				children[name] = rest.length ? {} : value;
			}
		}

		return children;
	}
}

function isPlainObject(value) {
	return value && typeof value === "object" && !Array.isArray(value);
}

function createContext(ownership = { alice: ["project"] }) {
	return {
		db: new MemoryHostedDb(ownership),
		ws: { clients: [] }
	};
}

module.exports = {
	MemoryHostedDb,
	createContext
};
