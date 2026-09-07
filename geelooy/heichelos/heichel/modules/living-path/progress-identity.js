// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathProgressIdentity
 * @description
 * The Awtsmoos remembers a route without confusing its stable key, rendered title, and parent chamber into one tangled strand;
 * Awtsmoos.com stores bilingual fields as fields and gently untangles older display strings, so yesterday's cache becomes clear today.
 */

import { torahTitlePair } from '../torahTitlePresentation.js?v=torah-bilingual-003';

export function progressEntryForCard(data, href, appState) {
	const parentSeriesId = String(appState.currentSeries || 'root');
	const parentRaw = appState.currentSeriesData?.prateem
		|| appState.currentSeriesData
		|| {};
	const parent = torahTitlePair({
		...parentRaw,
		id: parentSeriesId,
		name: parentRaw.name || parentRaw.title || ''
	});
	return {
		href,
		title: data.title,
		titleHe: data.titleHe,
		titleEn: data.titleEn,
		type: data.type,
		seriesId: ['series', 'grouping'].includes(data.type)
			? data.id
			: parentSeriesId,
		postId: data.type === 'post' ? data.id : '',
		parentSeriesId,
		parentLabel: parent.display,
		openedAt: Date.now()
	};
}

export function progressTitlePair(entry = {}) {
	if (entry.titleHe || entry.titleEn) {
		return torahTitlePair({
			titleHe: entry.titleHe,
			titleEn: entry.titleEn,
			name: entry.title || ''
		});
	}
	if (['series', 'grouping'].includes(entry.type)) {
		return torahTitlePair({
			id: entry.seriesId || entry.id,
			...legacyStoredFields(entry.title)
		});
	}
	return torahTitlePair(legacyStoredFields(entry.title));
}

export function progressParentPair(entry = {}) {
	const stored = legacyStoredFields(entry.parentLabel);
	return torahTitlePair({
		id: entry.parentSeriesId || '',
		...stored
	});
}

function legacyStoredFields(value = '') {
	const clean = String(value)
		.replace(/[\u2066\u2067\u2069]/g, '')
		.trim();
	const parts = clean
		.split(/\s+·\s+/)
		.map(part => part.trim())
		.filter(Boolean);
	if (parts.length >= 2) {
		return {
			titleHe: parts[0],
			titleEn: parts.slice(1).join(' · '),
			name: clean
		};
	}
	return {
		name: clean
	};
}
