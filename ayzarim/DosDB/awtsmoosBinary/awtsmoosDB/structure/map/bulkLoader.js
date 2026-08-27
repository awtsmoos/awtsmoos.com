// B"H

/**
 * @file structure/map/bulkLoader.js
 * @chapter Sorted Entries Rise Bottom-Up Into A Balanced Tree
 * @description Builds a fresh B-tree without incremental split churn.
 */

const SmartPointer = require('../../utils/smartPointer/index.js');

function bulkLoadSorted(engine, entries, options = {}) {
	const maxKeys = Math.max(8, Number(options.maxKeys || 200));
	const prepared = Array.from(entries || []).map(entry => ({
		key: Buffer.isBuffer(entry.key) ? entry.key : Buffer.from(String(entry.key), 'utf8'),
		value: SmartPointer.toBuffer(entry.value)
	}));
	if (!prepared.length) return engine.create();
	let level = buildLeaves(engine.nodeIO, prepared, maxKeys);
	while (level.length > 1) level = buildParentLevel(engine.nodeIO, level, maxKeys + 1);
	engine.ptr = SmartPointer.decode(level[0].seal);
	return level[0].seal;
}

function buildLeaves(nodeIO, entries, maxKeys) {
	const leaves = [];
	for (let index = 0; index < entries.length; index += maxKeys) {
		const group = entries.slice(index, index + maxKeys);
		leaves.push({
			firstKey: group[0].key,
			seal: nodeIO.save({
				isLeaf: true,
				keys: group.map(entry => entry.key),
				values: group.map(entry => entry.value)
			})
		});
	}
	return leaves;
}

function buildParentLevel(nodeIO, level, maxChildren) {
	const next = [];
	for (let index = 0; index < level.length; index += maxChildren) {
		const children = level.slice(index, index + maxChildren);
		next.push({
			firstKey: children[0].firstKey,
			seal: nodeIO.save({
				isLeaf: false,
				keys: children.slice(1).map(child => child.firstKey),
				children: children.map(child => child.seal)
			})
		});
	}
	return next;
}

module.exports = bulkLoadSorted;
