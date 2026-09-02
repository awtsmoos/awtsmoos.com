// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahLibraryPresentation
 * @description
 * The Awtsmoos clothes source truth in readable cards and breadcrumbs;
 * Awtsmoos.com keeps every label honest while the living path gently ascends.
 */

import {
	TORAH_LIBRARY_ROOT_ID,
	domainId,
	pageId,
	workId
} from './torahLibraryIds.js';

export function libraryCard() {
	return {
		id: TORAH_LIBRARY_ROOT_ID,
		name: 'ספריית התורה · Wikisource',
		description: '29,345 דפי תורה עם מקור וגרסה.',
		virtual: true
	};
}

export function domainCard(item) {
	return {
		id: domainId(item.id),
		name: item.title,
		description: `${item.count} דפים`,
		virtual: true
	};
}

export function workCard(domain, item, offset = 0) {
	return {
		id: workId(domain, item.id, offset),
		name: item.title,
		description: `${item.count} דפים`,
		virtual: true
	};
}

export function pageCard(domain, work, row) {
	return {
		id: pageId(domain, work, row.pageId),
		name: row.title,
		description: `גרסה ${row.revisionId || 'מקורית'} · ${row.qualityState || 'מקור'}`,
		virtual: true
	};
}

export function moreCard(domain, work, offset, total) {
	return {
		id: workId(domain, work, offset),
		name: 'עוד דפים…',
		description: `${offset + 1}–${Math.min(offset + 80, total)} מתוך ${total}`,
		virtual: true
	};
}

export function pageDescription(page) {
	return [
		page.text || '',
		'',
		'מקור: Wikisource',
		`גרסה: ${page.revisionId || ''} · ${page.revisionTimestamp || ''}`,
		`איכות: ${page.qualityState || ''}`,
		`רישיון: ${page.license || ''}`,
		page.sourceUrl || ''
	].join('\n');
}

export function rootCrumb() {
	return { id: 'root', name: 'Root' };
}

export function libraryCrumb() {
	return { id: TORAH_LIBRARY_ROOT_ID, name: 'ספריית התורה · Wikisource' };
}

export function domainCrumb(domain, name = domain) {
	return { id: domainId(domain), name };
}

export function workCrumb(domain, work) {
	return { id: workId(domain, work, 0), name: work };
}
