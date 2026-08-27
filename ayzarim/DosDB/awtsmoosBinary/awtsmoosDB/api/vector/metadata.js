// B"H

/**
 * @file api/vector/metadata.js
 * @chapter Derived Graph Metadata Shares Its Caller's Durability Boundary
 * @description Owns persisted vector configuration and vessels. Creation flushes
 * immediately only when no outer database batch already owns the generation.
 */

class VectorMetadata {
	constructor(database) {
		this.db = database;
	}

	plain(value) {
		if (value?.__resolve__) {
			try { return value.__resolve__(); }
			catch (_error) {}
		}
		return value;
	}

	root(create = false) {
		let root = this.db.root.__sys_vector__;
		if (!root && create) {
			this.db.root.__sys_vector__ = new this.db.Map();
			root = this.db.root.__sys_vector__;
		}
		return root || null;
	}

	read(path) {
		const root = this.root(false);
		if (!root) return null;
		const direct = this.plain(root[path]);
		if (direct?.regPath && direct?.mapPath) return normalize(direct);
		const safe = safePath(path);
		const regPath = `__reg_${safe}`;
		const mapPath = `__map_${safe}`;
		return root[regPath] && root[mapPath]
			? normalize({
				dim: 384,
				metric: 'cosine',
				regPath,
				mapPath,
				entryNodeID: 0,
				maxLevel: 0,
				synthesized: true
			})
			: null;
	}

	create(path, options = {}) {
		const existing = this.read(path);
		if (existing) return existing;
		const root = this.root(true);
		const safe = safePath(path);
		const metadata = normalize({
			dim: Number(options.dimensions || options.dim || 1536),
			metric: options.metric || 'cosine',
			regPath: `__reg_${safe}`,
			mapPath: `__map_${safe}`,
			entryNodeID: -1,
			maxLevel: 0
		});
		root[metadata.regPath] = new this.db.List();
		root[metadata.mapPath] = new this.db.Map();
		root.set(path, metadata);
		if (!this.db.pager.isBatching) this.db.waitForIdle();
		return metadata;
	}

	write(path, metadata) {
		const root = this.root(false);
		if (!root) {
			throw new Error(`B"H vector metadata root is missing: ${path}`);
		}
		root.set(String(path), normalize(metadata));
	}

	configurations() {
		const root = this.root(false);
		if (!root) return [];
		const output = [];
		for (const key of this.db.keys(root)) {
			const metadata = this.plain(root[key]);
			if (!metadata?.regPath || !metadata?.mapPath) continue;
			output.push({
				path: String(key),
				dimensions: Number(metadata.dim || 1536),
				metric: metadata.metric || 'cosine'
			});
		}
		return output.sort((left, right) => left.path.localeCompare(right.path));
	}
}

function safePath(path) {
	return String(path || '').replace(/\./g, '_');
}

function normalize(metadata) {
	return {
		...metadata,
		dim: Number(metadata.dim || 1536),
		metric: metadata.metric || 'cosine',
		entryNodeID: Number.isInteger(metadata.entryNodeID)
			? metadata.entryNodeID
			: -1,
		maxLevel: Number.isInteger(metadata.maxLevel) && metadata.maxLevel >= 0
			? metadata.maxLevel
			: 0
	};
}

module.exports = VectorMetadata;
