// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourcePresentation
 * @description
 * The Awtsmoos clothes exact downloaded Torah truth in branches already rooted in Torah's own tree;
 * Awtsmoos.com shows revision, hash, quality, and license while the source button opens only a neutral same-site doorway free.
 */

import {
	domainSeriesId,
	pageSeriesId,
	workSeriesId
} from './torahLibraryIds.js?v=torah-tree-005';

const virtual = {
	type: 'series',
	virtual: true,
	torahLibrary: true
};

export function domainCard(definition, count = 0) {
	return {
		...virtual,
		id: domainSeriesId(definition.view),
		name: definition.title,
		description: count
			? `${Number(count).toLocaleString()} דפים`
			: 'ספרי מקור מלאים'
	};
}

export function workCard(item, view) {
	const work = item.id || item.work || item.title || '';
	return {
		...virtual,
		id: workSeriesId(view, work, 0),
		name: item.title || work,
		description: `${Number(item.count || 0).toLocaleString()} דפים`
	};
}

export function pageCard(item, view, work) {
	return {
		...virtual,
		id: pageSeriesId(item.pageId, view, work),
		name: item.title || `דף ${item.pageId}`,
		description: compactProvenance(item)
	};
}

export function moreCard(view, work, offset) {
	return {
		...virtual,
		id: workSeriesId(view, work, offset),
		name: 'עוד דפים',
		description: `המשך מן הדף ${Number(offset) + 1}`
	};
}

export function pageSeriesData(page, fallbackTitle) {
	return {
		...virtual,
		id: page.pageId || page.id,
		name: page.title || fallbackTitle || 'תורה',
		exactSourceText: true,
		sourceText: sourceText(page),
		provenanceText: provenanceText(page),
		sourceHref: String(page.sourceHref || '')
	};
}

export function provenanceText(page = {}) {
	return [
		`גרסה: ${page.revisionId ?? '—'}`,
		`זמן גרסה: ${page.revisionTimestamp ?? '—'}`,
		`איכות: ${page.qualityState ?? '—'}`,
		`רישיון: ${page.license ?? '—'}`,
		`טביעת מקור: ${page.sourceHash ?? '—'}`
	].join('\n');
}

function compactProvenance(page = {}) {
	return `גרסה ${page.revisionId ?? '—'} · ${page.license ?? 'מקור מאומת'}`;
}

function sourceText(page = {}) {
	return String(
		page.sourceText
		?? page.text
		?? page.content
		?? page.body
		?? page.value
		?? ''
	);
}
