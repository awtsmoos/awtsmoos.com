// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahHostSummary
 * @description
 * The Awtsmoos lets a persisted Torah host confess the virtual children it can truly open instead of displaying an empty count;
 * Awtsmoos.com leaves storage untouched while presentation reveals the branches navigation will actually mount.
 */

import { sourceBranchDefinitions } from './torahSourceHierarchy.js?v=torah-tree-006';

/**
 * Adds truthful virtual child counts to Ikar host-series presentation records.
 * @param {Array<object>} series Persisted and injected series records.
 * @param {string} heichelId Active Heichel identity.
 * @returns {Array<object>} Records whose host counts include real virtual branches.
 */
export function annotateTorahHostSummaries(series = [], heichelId = '') {
	if (heichelId !== 'ikar') {
		return series;
	}
	return series.map(record => annotateHostRecord(record));
}

function annotateHostRecord(record = {}) {
	const raw = record?.prateem || record || {};
	const id = String(
		raw.id
		|| raw.seriesId
		|| raw.inputId
		|| record.id
		|| ''
	);
	const virtualCount = sourceBranchDefinitions(id).length;
	if (!virtualCount) {
		return record;
	}
	const persistedCount = numericCount(
		raw.subSeriesCount
		?? raw.subSeries
		?? raw.subSeriesIds
	);
	const subSeriesCount = Math.max(persistedCount, virtualCount);
	if (record?.prateem) {
		return {
			...record,
			subSeriesCount,
			virtualSubSeriesCount: virtualCount,
			prateem: {
				...raw,
				subSeriesCount,
				virtualSubSeriesCount: virtualCount
			}
		};
	}
	return {
		...record,
		subSeriesCount,
		virtualSubSeriesCount: virtualCount
	};
}

function numericCount(value) {
	if (Array.isArray(value)) {
		return value.length;
	}
	if (value && typeof value === 'object') {
		return Object.keys(value).length;
	}
	return Number(value || 0) || 0;
}
