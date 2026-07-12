// B"H

/**
 * @file api/vector/metadata.js
 * @chapter The Derived Graph Remembers Its Source, Not Its Old Coordinates
 * @description
 * Owns vector-index configuration and storage-vessel creation. Configuration is
 * enumerable so vacuum may rebuild every graph against destination pointers.
 */

class VectorMetadata {
	constructor(db) {
		this.db = db;
	}

	plain(value) {
		if (value?.__resolve__) {
			try { return value.__resolve__(); } catch (_error) {}
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
		if (direct?.regPath && direct?.mapPath) return direct;
		const safe = String(path || '').replace(/\./g, '_');
		const regPath = `__reg_${safe}`;
		const mapPath = `__map_${safe}`;
		return root[regPath] && root[mapPath]
			? { dim: 384, metric: 'cosine', regPath, mapPath, entryNodeID: 0, synthesized: true }
			: null;
	}

	create(path, options = {}) {
		const existing = this.read(path);
		if (existing) return existing;
		const root = this.root(true);
		const safe = String(path).replace(/\./g, '_');
		const metadata = {
			dim: Number(options.dimensions || options.dim || 1536),
			metric: options.metric || 'cosine',
			regPath: `__reg_${safe}`,
			mapPath: `__map_${safe}`,
			entryNodeID: -1
		};
		root[metadata.regPath] = new this.db.List();
		root[metadata.mapPath] = new this.db.Map();
		root.set(path, metadata);
		this.db.waitForIdle();
		return metadata;
	}

	configurations() {
		const root = this.root(false);
		if (!root) return [];
		const output = [];
		for (const key of this.db.keys(root)) {
			const metadata = this.plain(root[key]);
			if (!metadata?.regPath || !metadata?.mapPath) continue;
			output.push({ path: String(key), dimensions: Number(metadata.dim || 1536), metric: metadata.metric || 'cosine' });
		}
		return output.sort((left, right) => left.path.localeCompare(right.path));
	}
}

module.exports = VectorMetadata;
