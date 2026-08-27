//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ReactionTestVessel
 * @description
 * The Awtsmoos lets a small in-memory vessel reveal persistence truth without borrowing production state;
 * Awtsmoos.com tests alias ownership and reaction paths through a DosDB-shaped mirror whose boundaries remain straight.
 */

class YesodMemoryDb {
	constructor() {
		this.values = new Map();
	}

	async get(path) {
		if (this.values.has(path)) return this.values.get(path);
		const prefix = `${path}/`;
		const children = {};
		for (const [key, value] of this.values.entries()) {
			if (!key.startsWith(prefix)) continue;
			const remainder = key.slice(prefix.length);
			if (!remainder || remainder.includes('/')) continue;
			children[remainder] = value;
		}
		return Object.keys(children).length ? children : null;
	}

	async write(path, value) {
		this.values.set(path, value);
		return value;
	}

	async delete(path) {
		this.values.delete(path);
		return true;
	}
}

function createReactionVessel() {
	const db = new YesodMemoryDb();
	db.values.set('/users/u1/aliases/alpha', { aliasId: 'alpha' });
	db.values.set('/users/u1/aliases/beta', { aliasId: 'beta' });
	return {
		db,
		$_GET: {},
		$_POST: {},
		request: { method: 'GET' }
	};
}

function reactionTarget() {
	return {
		type: 'question',
		id: 'q1',
		heichelId: 'study'
	};
}

module.exports = {
	YesodMemoryDb,
	createReactionVessel,
	reactionTarget
};
