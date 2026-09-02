// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TorahLibraryPresentation
 * @description The Awtsmoos clothes exact Torah source truth in a source-neutral public vessel;
 * Awtsmoos.com shows revision, license, hash, and source access without letting a provider become the label.
 */

import {
	TORAH_LIBRARY_ROOT_ID,
	domainSeriesId,
	pageSeriesId,
	workSeriesId
} from './torahLibraryIds.js';

const virtual = { type: 'series', virtual: true, torahLibrary: true };

export function libraryCard() {
	return {
		...virtual,
		id: TORAH_LIBRARY_ROOT_ID,
		name: 'ספריית התורה',
		description: '29,345 דפי תורה עם מקור, גרסה ורישיון.'
	};
}

export function domainCard(item) {
	const domain = item.id || item.domain || '';
	return {
		...virtual,
		id: domainSeriesId(domain),
		name: item.title || item.label || domain,
		description: `${Number(item.count || 0).toLocaleString()} דפים`
	};
}

export function workCard(item, domain) {
	const work = item.id || item.work || item.title || '';
	return {
		...virtual,
		id: workSeriesId(domain, work, 0),
		name: item.title || work,
		description: `${Number(item.count || 0).toLocaleString()} דפים`
	};
}

export function pageCard(item, domain, work) {
	return {
		...virtual,
		id: pageSeriesId(item.pageId, domain, work),
		name: item.title || `דף ${item.pageId}`,
		description: compactProvenance(item)
	};
}

export function moreCard(domain, work, offset) {
	return {
		...virtual,
		id: workSeriesId(domain, work, offset),
		name: 'עוד דפים',
		description: `המשך מן הדף ${Number(offset) + 1}`
	};
}

export function pageSeriesData(page, fallbackTitle) {
	return {
		...virtual,
		id: page.pageId || page.id,
		name: page.title || fallbackTitle || 'ספריית התורה',
		exactSourceText: true,
		sourceText: sourceText(page),
		provenanceText: provenanceText(page),
		sourceUrl: String(page.sourceUrl || '')
	};
}

export function provenanceText(page = {}) {
	return [
		`Revision ID: ${page.revisionId ?? '—'}`,
		`Revision timestamp: ${page.revisionTimestamp ?? '—'}`,
		`Quality: ${page.qualityState ?? '—'}`,
		`License: ${page.license ?? '—'}`,
		`Source hash: ${page.sourceHash ?? '—'}`
	].join('\n');
}

function compactProvenance(page = {}) {
	return `Revision ${page.revisionId ?? '—'} · ${page.license ?? 'מקור מאומת'}`;
}

function sourceText(page = {}) {
	return String(page.sourceText ?? page.text ?? page.content ?? page.body ?? page.value ?? '');
}
