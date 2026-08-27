// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookSeriesTree
 * @description Recursive series discovery is bounded, cycle-safe, and faithful to the public hierarchy.
 */
const MONTHS = new Map([
	['תשרי', 'Tishrei'], ['חשון', 'Cheshvan'], ['כסלו', 'Kislev'], ['טבת', 'Teves'],
	['שבט', 'Shevat'], ['אדר', 'Adar'], ['ניסן', 'Nissan'], ['אייר', 'Iyar'],
	['סיון', 'Sivan'], ['תמוז', 'Tammuz'], ['מנחם אב', 'Menachem Av'], ['אלול', 'Elul']
]);

function fallbackName(seriesId) {
	let match = String(seriesId).match(/^likkuteiSichosVolume(\d+)$/i);
	if (match) return `Likkutei Sichos — Volume ${match[1]}`;
	match = String(seriesId).match(/^seferHaSichos(\d+)$/i);
	if (match) return `Sefer HaSichos ${match[1]}`;
	match = String(seriesId).match(/^sichosKodesh(\d+)$/i);
	if (match) return `Sichos Kodesh ${match[1]}`;
	const month = String(seriesId).replace(/_meluket$/i, '');
	if (MONTHS.has(month)) return `Meluket — ${MONTHS.get(month)}`;
	return String(seriesId).replace(/[_-]+/g, ' ').trim() || 'Untitled Series';
}

function seriesName(meta, seriesId) {
	const info = meta?.prateem || meta || {};
	const name = info.englishName || info.name || info.title || '';
	return name ? String(name).split(/\s+\/\s+/)[0].trim() : fallbackName(seriesId);
}

async function readNode({ source, heichelId, seriesId, depth = 0, path = [] }) {
	const [meta, childIds, postIds] = await Promise.all([
		source.series(heichelId, seriesId).catch(() => null),
		source.children(heichelId, seriesId),
		source.postIds(heichelId, seriesId)
	]);
	const name = seriesName(meta, seriesId);
	return { id: seriesId, name, depth, path: [...path, { id: seriesId, name }], postIds, childIds, children: [] };
}

async function walkSeries({ source, heichelId, seriesId, options, visited = new Set(), depth = 0, path = [] }) {
	if (depth > options.maxDepth) throw new Error(`Book tree exceeded maxDepth at ${seriesId}`);
	if (visited.has(seriesId)) throw new Error(`Book tree cycle detected at ${seriesId}`);
	visited.add(seriesId);
	const node = await readNode({ source, heichelId, seriesId, depth, path });
	for (const childId of node.childIds) {
		node.children.push(await walkSeries({ source, heichelId, seriesId: childId, options, visited, depth: depth + 1, path: node.path }));
	}
	delete node.childIds;
	visited.delete(seriesId);
	return node;
}

function flatten(node, output = []) {
	output.push(node);
	for (const child of node.children) flatten(child, output);
	return output;
}

function leafNodes(node) {
	return flatten(node, []).filter(item => item.children.length === 0);
}

function targetNodes(root, mode, maxBooks) {
	const targets = mode === 'combined' ? [root] : leafNodes(root);
	if (targets.length > maxBooks) throw new Error(`Book plan has ${targets.length} books; maxBooks is ${maxBooks}.`);
	return targets;
}

module.exports = {
	fallbackName,
	flatten,
	leafNodes,
	readNode,
	seriesName,
	targetNodes,
	walkSeries
};
