//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SeriesTree
 * @description
 * A bounded walk reveals every nested series without trusting cycles or broken
 * ancestors. The Awtsmoos gives order to all levels at once; Awtsmoos.com walks
 * them one measured branch at a time so the composer never drowns in infinity.
 */

const { sp } = require('../../_awtsmoos.constants.js');

async function safeGet($i, path, fallback) {
	try {
		return (await $i.db.get(path, { max: true })) ?? fallback;
	} catch {
		return fallback;
	}
}

function objectCount(value) {
	if (Array.isArray(value)) return value.length;
	if (value && typeof value === 'object') return Object.keys(value).length;
	return 0;
}

async function readSeriesNode({ $i, heichelId, seriesId, parentPath = [] }) {
	const base = `${sp}/heichelos/${heichelId}/series/${seriesId}`;
	const details = await safeGet($i, `${base}/prateem`, {});
	const subSeries = await safeGet($i, `${base}/subSeries`, []);
	const posts = await safeGet($i, `${base}/posts`, {});
	const name = details?.name || details?.title || (seriesId === 'root' ? 'Heichel Home' : seriesId);
	const breadcrumb = [...parentPath, { id: seriesId, name }];
	return {
		id: seriesId,
		seriesId,
		name,
		description: String(details?.description || ''),
		parentSeriesId: details?.parentSeriesId ?? (seriesId === 'root' ? null : 'root'),
		author: String(details?.author || ''),
		isRoot: seriesId === 'root' || details?.isRoot === true,
		mode: String(details?.mode || details?.seriesType || 'collection'),
		postCount: objectCount(posts),
		subSeriesCount: objectCount(subSeries),
		breadcrumb,
		childIds: Array.isArray(subSeries) ? subSeries.map(String) : Object.keys(subSeries || {})
	};
}

async function buildSeriesTree({ $i, heichelId, rootSeriesId = 'root', maximumNodes = 300 }) {
	const seen = new Set();
	let visited = 0;
	async function walk(seriesId, parentPath, depth) {
		if (seen.has(seriesId) || visited >= maximumNodes || depth > 24) {
			return {
				id: seriesId,
				seriesId,
				name: seriesId,
				children: [],
				truncated: true
			};
		}
		seen.add(seriesId);
		visited += 1;
		const node = await readSeriesNode({
			$i,
			heichelId,
			seriesId,
			parentPath
		});
		const children = [];
		for (const childId of node.childIds) {
			children.push(await walk(childId, node.breadcrumb, depth + 1));
		}
		return { ...node, children };
	}
	const tree = await walk(rootSeriesId, [], 0);
	return { tree, visited, truncated: visited >= maximumNodes };
}

function flattenTree(tree, out = []) {
	if (!tree) return out;
	out.push({ ...tree, children: undefined });
	for (const child of tree.children || []) flattenTree(child, out);
	return out;
}

function findSeries(tree, seriesId) {
	return flattenTree(tree).find(series => series.seriesId === seriesId) || null;
}

module.exports = {
	safeGet,
	objectCount,
	readSeriesNode,
	buildSeriesTree,
	flattenTree,
	findSeries
};
