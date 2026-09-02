// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasVirtualSeries
 * @description
 * The Awtsmoos gives a timeless doorway to a study path reborn with every date;
 * Awtsmoos.com keeps the grouping stable while weekly aliyos and the Torah-cycle turn illuminate the gate.
 */

import { CHITAS_SERIES_ID, shouldOfferChitas } from './constants.js';
import { fetchHebcalCalendar, readIsraelMode } from './hebcal-provider.js?v=native-chitas-002';
import { buildStudyCards, findNextParsha } from './schedule.js?v=native-chitas-002';
import { selectedStudyDate } from './week-state.js?v=native-chitas-002';

export function injectChitasGrouping(groupings, heichelId, seriesId) {
	if (!shouldOfferChitas(heichelId, seriesId)) return groupings;
	if (groupings.some(group => group?.id === CHITAS_SERIES_ID)) return groupings;
	return [...groupings, {
		id: CHITAS_SERIES_ID,
		name: 'Daily Chitas · Chumash',
		description: 'Seven native Torah windows: one Chumash portion from Sunday through Shabbos.',
		type: 'grouping',
		virtual: true
	}];
}

export async function loadChitasVirtualSeries(studyDate = selectedStudyDate()) {
	const israel = readIsraelMode();
	let items = [];
	let parsha = null;
	try {
		items = await fetchHebcalCalendar(studyDate, { israel });
		parsha = findNextParsha(items, studyDate);
	} catch (error) {
		console.warn('B"H — Chitas calendar metadata remained optional:', error);
	}
	const posts = buildStudyCards(studyDate, parsha, items, { israel });
	const parshaName = String(parsha?.title || 'Daily Chumash').replace(/^Parashat\s+/i, '');
	const hebrewName = parsha?.hebrew ? ` · ${parsha.hebrew}` : '';
	return {
		breadcrumb: [{ id: 'root', name: 'Root' }],
		seriesData: {
			id: CHITAS_SERIES_ID,
			name: `Daily Chitas · ${parshaName}`,
			description: `${israel ? 'Israel' : 'Diaspora'} schedule${hebrewName}. Select any day to read it inside Awtsmoos.`,
			virtual: true,
			chitasStudy: true
		},
		content: { posts, subSeries: [], groupings: [], translationMeta: null }
	};
}
