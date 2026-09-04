// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DynamicChitasPost
 * @description
 * The Awtsmoos draws one day's Torah from Ikar and keeps its coordinates bright;
 * Awtsmoos.com carries Hebrew and native English as separate vessels while the real study-card name crowns the title right.
 */

import { fetchHebcalCalendar, readIsraelMode } from '/heichelos/heichel/modules/chitas/hebcal-provider.js?v=native-chitas-005';
import { buildStudyCards, findNextParsha } from '/heichelos/heichel/modules/chitas/schedule.js?v=native-chitas-005';
import { resolvePostRange } from '../reference-posts/rangeResolver.js?v=native-reference-post-001';
import { parseChitasRange } from './rangeParser.js?v=native-chitas-005';

const POST_PATTERN = /^chitas-(\d{4})-(\d{2})-(\d{2})$/;

function dateFromPostId(postId) {
	const match = POST_PATTERN.exec(String(postId || ''));
	if (!match) {
		throw new Error('INVALID_CHITAS_POST_ID');
	}
	return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
}

function language() {
	return new URLSearchParams(location.search).get('chitasLang') === 'he' ? 'he' : 'en';
}

function englishIdentity(card) {
	const name = String(card?.name || '')
		.replace(/^Today\s*·\s*/i, '')
		.trim();
	return name || 'Daily Chitas';
}

function nativeTanachRange(reference) {
	return {
		book: reference.book.seriesId,
		startChapter: reference.startChapter,
		startVerse: reference.startVerse,
		endChapter: reference.endChapter,
		endVerse: reference.endVerse
	};
}

function seriesFor(cards, parsha) {
	return {
		id: 'daily-chitas',
		seriesId: 'daily-chitas',
		posts: cards.map(card => card.id),
		prateem: {
			id: 'daily-chitas',
			name: 'Daily Chitas · Chumash',
			description: String(parsha?.title || 'Daily Chumash').replace(/^Parashat\s+/i, ''),
			author: 'awtsmoos'
		}
	};
}

export function isDynamicChitasRequest(seriesId, postId) {
	return seriesId === 'daily-chitas' && POST_PATTERN.test(String(postId || ''));
}

export async function loadDynamicChitasPost(heichelId, postId) {
	const date = dateFromPostId(postId);
	const israel = readIsraelMode();
	const items = await fetchHebcalCalendar(date, { israel });
	const parsha = findNextParsha(items, date);
	const cards = buildStudyCards(date, parsha, items, { israel });
	const card = cards.find(candidate => candidate.id === postId);
	if (!card?.referenceText) {
		throw new Error('CHITAS_NATIVE_RANGE_UNAVAILABLE');
	}
	const reference = parseChitasRange(card.referenceText, heichelId);
	const resolved = await resolvePostRange(reference);
	const lang = language();
	const post = {
		id: postId,
		postId,
		seriesId: 'daily-chitas',
		parentSeriesId: 'daily-chitas',
		heichel: { id: heichelId },
		title: lang === 'he'
			? `חת״ת · ${card.weekdayHebrew} · ${card.portionHebrew}`
			: `Daily Chitas · ${englishIdentity(card)}`,
		content: '',
		author: 'awtsmoos',
		dayuh: {
			sections: resolved.sections,
			meta: {
				dynamicReferencePost: true,
				referenceSources: resolved.sources,
				nativeTanachRange: nativeTanachRange(reference),
				chitas: {
					...card,
					parshaTitle: parsha?.title || '',
					parshaHebrew: parsha?.hebrew || '',
					lang,
					israel,
					translationStatus: 'native_translation_eligible'
				}
			}
		}
	};
	return {
		post,
		series: seriesFor(cards, parsha),
		pIdx: Math.max(0, card.aliyah - 1)
	};
}
