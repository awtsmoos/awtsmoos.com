// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasVirtualSeries
 * @description
 * The Awtsmoos gives a timeless doorway to a study path reborn with every date;
 * Awtsmoos.com keeps the grouping stable while the coming Sidra fills seven vessels at the gate.
 */

import { CHITAS_SERIES_ID, shouldOfferChitas } from './constants.js';
import { fetchHebcalCalendar, readIsraelMode } from './hebcal-provider.js';
import { buildStudyCards, findNextParsha } from './schedule.js';

/**
 * @description Adds one stable Chitas grouping to the Heichel Ikar root without persisting date-changing data.
 * @param {Array<Object>} groupings - Existing normalized grouping records.
 * @param {string} heichelId - Current Heichel identifier.
 * @param {string} seriesId - Current series identifier.
 * @returns {Array<Object>} Groupings with Daily Chitas present where appropriate.
 */
export function injectChitasGrouping(groupings, heichelId, seriesId) {
	if (!shouldOfferChitas(heichelId, seriesId)) return groupings;
	if (groupings.some(group => group?.id === CHITAS_SERIES_ID)) return groupings;
	return [...groupings, {
		id: CHITAS_SERIES_ID,
		name: 'Daily Chitas · Chumash',
		description: 'The weekly Sidra divided by its seven Shabbos aliyos, one portion from Sunday through Shabbos.',
		type: 'grouping',
		virtual: true
	}];
}

/**
 * @description Resolves the current Chitas week into a Living Path virtual series and seven study cards.
 * @param {Date} studyDate - Browser-local study date.
 * @returns {Promise<Object>} Virtual identity, breadcrumb, and collection payload.
 */
export async function loadChitasVirtualSeries(studyDate = new Date()) {
	const israel = readIsraelMode();
	let items = [];
	let parsha = null;
	try {
		items = await fetchHebcalCalendar(studyDate, { israel });
		parsha = findNextParsha(items);
	} catch (error) {
		console.warn('B"H — Chitas calendar metadata remained optional:', error);
	}
	const posts = buildStudyCards(studyDate, parsha, items);
	const parshaName = String(parsha?.title || 'Daily Chumash').replace(/^Parashat\s+/i, '');
	const hebrewName = parsha?.hebrew ? ` · ${parsha.hebrew}` : '';
	return {
		breadcrumb: [{ id: 'root', name: 'Root' }],
		seriesData: {
			id: CHITAS_SERIES_ID,
			name: `Daily Chitas · ${parshaName}`,
			description: `${israel ? 'Israel' : 'Diaspora'} schedule${hebrewName}. Sunday through Shabbos follows the seven aliyos of the weekly Sidra.`,
			virtual: true
		},
		content: {
			posts,
			subSeries: [],
			groupings: [],
			translationMeta: null
		}
	};
}
