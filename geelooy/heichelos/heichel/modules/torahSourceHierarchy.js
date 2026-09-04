// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourceHierarchy
 * @description
 * The Awtsmoos is One while Oral Torah opens into many faithful branches of light;
 * Awtsmoos.com nests downloaded source works beneath Torah's real tree, never beside it as a rival sight.
 */

import {
	isPersistedWork,
	persistedWorkKeys,
	workIdentityKey
} from './torahSourceWorkIdentity.js?v=torah-tree-005';

export const ORAL_TORAH_ID = 'theOralTorah';
export const CHASSIDUS_ID = 'chassidus';

const MUSSAR_KEYS = new Set([
	'חובות הלבבות',
	'מסילת ישרים',
	'אורחות צדיקים',
	'שערי תשובה',
	'נפש החיים',
	'ראשית חכמה',
	'דרך ה׳'
].map(workIdentityKey));

const DEFINITIONS = Object.freeze({
	halacha: definition('halacha', 'halacha', 'הלכה', ORAL_TORAH_ID),
	midrash: definition('midrash', 'midrash', 'מדרש', ORAL_TORAH_ID),
	kabbalah: definition('kabbalah', 'kabbalah', 'קבלה', ORAL_TORAH_ID),
	mussar: definition('mussar', 'chassidus_mussar', 'מוסר', ORAL_TORAH_ID),
	chassidus: definition(
		'chassidus',
		'chassidus_mussar',
		'ספרי חסידות נוספים',
		CHASSIDUS_ID
	)
});

function definition(view, sourceDomain, title, hostSeriesId) {
	return Object.freeze({
		view,
		sourceDomain,
		title,
		hostSeriesId
	});
}

export function sourceDefinition(view, work = '') {
	if (view === 'chassidus_mussar') {
		return DEFINITIONS[
			MUSSAR_KEYS.has(workIdentityKey(work))
				? 'mussar'
				: 'chassidus'
		];
	}
	return DEFINITIONS[view] || null;
}

export function sourceBranchDefinitions(seriesId) {
	if (seriesId === ORAL_TORAH_ID) {
		return [
			'halacha',
			'midrash',
			'kabbalah',
			'mussar'
		].map(view => DEFINITIONS[view]);
	}
	if (seriesId === CHASSIDUS_ID) {
		return [DEFINITIONS.chassidus];
	}
	return [];
}

export function sourceWorkIncluded(view, item = {}, livePersisted = []) {
	const key = workIdentityKey(
		item.title
		|| item.work
		|| item.id
		|| ''
	);
	if (view === 'mussar') {
		return MUSSAR_KEYS.has(key);
	}
	if (view === 'chassidus') {
		if (MUSSAR_KEYS.has(key)) return false;
		return !isPersistedWork(
			item,
			persistedWorkKeys(livePersisted)
		);
	}
	return true;
}

export function sourceHostBreadcrumb(view, work = '') {
	const resolved = sourceDefinition(view, work);
	const root = [{ id: 'root', name: 'Root' }];
	const oral = {
		id: ORAL_TORAH_ID,
		name: 'The Oral Torah'
	};
	if (resolved?.hostSeriesId === CHASSIDUS_ID) {
		return [
			...root,
			oral,
			{ id: CHASSIDUS_ID, name: 'Chassidus' }
		];
	}
	return [...root, oral];
}
