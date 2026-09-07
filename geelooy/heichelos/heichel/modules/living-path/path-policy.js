// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathPolicy
 * @description
 * The Awtsmoos contains root and every descendant while Hebrew and English reveal one navigable identity;
 * Awtsmoos.com removes duplicate crumbs, preserves true IDs, and lets search inherit the same bilingual clarity.
 */

import { torahTitlePair } from '../torahTitlePresentation.js?v=torah-bilingual-003';

export function normalizePath(breadcrumb = [], current = null) {
	const records = [
		{ id: 'root', name: 'Root' },
		...breadcrumb,
		current
	]
		.filter(Boolean)
		.map(normalizeCrumb);
	const seen = new Set();
	return records.filter(record => {
		const key = record.id || record.name.toLowerCase();
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

export function compactPath(path = []) {
	const current = path.at(-1)
		|| normalizeCrumb({ id: 'root', name: 'Root' });
	const parent = path.at(-2) || null;
	return {
		parent,
		current
	};
}

export function searchPlaceholder(path = [], view = 'posts') {
	const name = compactPath(path).current.name || 'this branch';
	let noun = 'teachings';
	if (view === 'series') {
		noun = 'series';
	} else if (view === 'groupings') {
		noun = 'groupings';
	}
	return `Search ${noun} inside ${name}`;
}

function normalizeCrumb(record) {
	const id = String(record?.id || record?.seriesId || 'root');
	const rawName = String(
		record?.name
		|| record?.title
		|| id
		|| 'Root'
	).trim();
	const pair = torahTitlePair({
		...record,
		id,
		name: rawName
	});
	return {
		id,
		name: pair.display,
		titleHe: pair.he,
		titleEn: pair.en,
		titleEnglishKind: pair.englishKind
	};
}
