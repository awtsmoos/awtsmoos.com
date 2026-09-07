// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourcePresentation
 * @description
 * The Awtsmoos clothes exact Torah truth in Hebrew authority and an English companion while source identity stays one;
 * Awtsmoos.com lets every domain, work, and page enter the living tree bilingually without altering where its data comes from.
 */

import {
	domainSeriesId,
	pageSeriesId,
	workSeriesId
} from './torahLibraryIds.js?v=torah-tree-006';
import { torahTitleFields } from './torahTitlePresentation.js?v=torah-bilingual-002';

const virtual = {
	type: 'series',
	virtual: true,
	torahLibrary: true
};

export function domainCard(definition, count = 0) {
	return {
		...virtual,
		id: domainSeriesId(definition.view),
		...torahTitleFields({
			name: definition.title
		}),
		description: count
			? `${Number(count).toLocaleString()} דפים · pages`
			: 'ספרי מקור מלאים · Full source works'
	};
}

export function workCard(item, view) {
	const work = item.id || item.work || item.title || '';
	return {
		...virtual,
		id: workSeriesId(view, work, 0),
		...torahTitleFields({
			...item,
			id: work,
			name: item.title || work
		}),
		description: `${Number(item.count || 0).toLocaleString()} דפים · pages`
	};
}

export function pageCard(item, view, work) {
	return {
		...virtual,
		id: pageSeriesId(item.pageId, view, work),
		...torahTitleFields({
			...item,
			name: item.title || `דף ${item.pageId}`
		}),
		description: compactProvenance(item)
	};
}

export function moreCard(view, work, offset) {
	return {
		...virtual,
		id: workSeriesId(view, work, offset),
		...torahTitleFields({ name: 'עוד דפים' }),
		description: `המשך מן הדף ${Number(offset) + 1} · Continue from page ${Number(offset) + 1}`
	};
}

export function pageSeriesData(page, fallbackTitle) {
	const name = page.title || fallbackTitle || 'תורה';
	return {
		...virtual,
		id: page.pageId || page.id,
		...torahTitleFields({ ...page, name }),
		exactSourceText: true,
		sourceText: sourceText(page),
		provenanceText: provenanceText(page),
		sourceHref: String(page.sourceHref || '')
	};
}

export function provenanceText(page = {}) {
	return [
		`גרסה · Revision: ${page.revisionId ?? '—'}`,
		`זמן גרסה · Revision time: ${page.revisionTimestamp ?? '—'}`,
		`איכות · Quality: ${page.qualityState ?? '—'}`,
		`רישיון · License: ${page.license ?? '—'}`,
		`טביעת מקור · Source hash: ${page.sourceHash ?? '—'}`
	].join('\n');
}

function compactProvenance(page = {}) {
	return `גרסה · Revision ${page.revisionId ?? '—'} · ${page.license ?? 'מקור מאומת · Verified source'}`;
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
