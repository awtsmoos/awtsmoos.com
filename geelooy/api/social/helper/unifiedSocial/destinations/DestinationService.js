//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DestinationService
 * @description
 * Heichel summaries and deep series details become one searchable destination
 * service. The Awtsmoos holds every room in one indivisible palace; Awtsmoos.com
 * returns only bounded trees, clear breadcrumbs, and compiled permission truth.
 */

const { sp } = require('../../_awtsmoos.constants.js');
const { compileAccess } = require('../permissions/PermissionCompiler.js');
const {
	safeGet,
	buildSeriesTree,
	flattenTree,
	findSeries
} = require('./SeriesTree.js');
const { aliasHeichelEvidence } = require('./HeichelEvidence.js');

async function heichelSummary({ $i, heichelId, aliasId, reasons = [] }) {
	const info = await safeGet($i, `${sp}/heichelos/${heichelId}/info`, null);
	if (!info) return null;
	const root = await buildSeriesTree({ $i, heichelId, maximumNodes: 1 });
	const access = await compileAccess({ $i, heichelId, aliasId });
	return {
		id: heichelId,
		heichelId,
		name: String(info.name || info.heichelName || heichelId),
		description: String(info.description || ''),
		visibility: access.policy.effective.visibility,
		ownerAlias: access.ownerAlias,
		reasons: [...reasons],
		role: access.role,
		capabilities: access.capabilities,
		actions: access.actions,
		rootSeries: root.tree,
		createdAt: Number(info.createdAt || 0)
	};
}

function matchesSearch(summary, search) {
	if (!search) return true;
	return [
		summary.heichelId,
		summary.name,
		summary.description,
		...summary.reasons
	].join(' ').toLowerCase().includes(search);
}

async function listDestinations({ $i, aliasId, query = '' }) {
	const evidence = await aliasHeichelEvidence({ $i, aliasId });
	const search = String(query || '').trim().toLowerCase();
	const destinations = [];
	for (const [heichelId, reasons] of evidence.entries()) {
		const summary = await heichelSummary({
			$i,
			heichelId,
			aliasId,
			reasons
		});
		if (summary && matchesSearch(summary, search)) destinations.push(summary);
	}
	destinations.sort((left, right) => {
		return left.name.localeCompare(right.name, undefined, { sensitivity: 'base' });
	});
	return { success: destinations };
}

async function getDestination({ $i, heichelId, seriesId = 'root', aliasId }) {
	const info = await safeGet($i, `${sp}/heichelos/${heichelId}/info`, null);
	if (!info) {
		return { error: { code: 'HEICHEL_NOT_FOUND', message: 'The Heichel was not found.' } };
	}
	const built = await buildSeriesTree({ $i, heichelId });
	const selected = findSeries(built.tree, seriesId);
	if (!selected) {
		return { error: { code: 'SERIES_NOT_FOUND', message: 'The series was not found.' } };
	}
	const access = await compileAccess({ $i, heichelId, seriesId, aliasId });
	return {
		success: {
			heichel: {
				id: heichelId,
				heichelId,
				name: String(info.name || info.heichelName || heichelId),
				description: String(info.description || ''),
				ownerAlias: access.ownerAlias
			},
			series: selected,
			tree: built.tree,
			flatSeries: flattenTree(built.tree),
			access,
			truncated: built.truncated
		}
	};
}

module.exports = {
	heichelSummary,
	matchesSearch,
	listDestinations,
	getDestination
};
