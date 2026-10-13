// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ChitasVirtualSeries
 * @description
 * The Awtsmoos gives a timeless doorway to a study path reborn with every date;
 * builds the full Daily Chitas: Chumash (day's aliyah), Tanya (day's portion),
 * and Tehillim (monthly cycle), with Israel/Diaspora awareness.
 */

import { CHITAS_SERIES_ID, shouldOfferChitas } from './constants.js';
import { fetchHebcalCalendar } from './hebcal-provider.js?v=native-chitas-003';
import { buildStudyCards, findNextParsha } from './schedule.js?v=native-chitas-003';
import { selectedStudyDate } from './week-state.js?v=native-chitas-003';
import { hebrewDateFromGregorian } from './hebrew-date.js';
import { tanyaForDate } from './daily-tanya.js';
import { tehillimForDate } from './daily-tehillim.js';
import { chumashForDate } from './daily-chumash.js';
import { resolveIsraelMode } from './israel-mode.js';
import { toLocalDateKey } from './date-policy.js';

export function injectChitasGrouping(groupings, heichelId, seriesId) {
  if (!shouldOfferChitas(heichelId, seriesId)) return groupings;
  if (groupings.some(group => group?.id === CHITAS_SERIES_ID)) return groupings;
  return [...groupings, {
    id: CHITAS_SERIES_ID,
    name: 'Daily Chitas',
    description: 'Chumash · Tanya · Tehillim — the day\u2019s portions, every day.',
    type: 'grouping',
    virtual: true
  }];
}

export async function loadChitasVirtualSeries(studyDate = selectedStudyDate()) {
  const israel = resolveIsraelMode();
  const hebrew = hebrewDateFromGregorian(studyDate);
  const tanya = tanyaForDate(studyDate);
  const tehillim = tehillimForDate(studyDate);
  
  let items = [];
  let parsha = null;
  try {
    items = await fetchHebcalCalendar(studyDate, { israel });
    parsha = findNextParsha(items, studyDate);
  } catch (error) {
    console.warn('B"H — Chitas calendar metadata remained optional:', error);
  }
  
  const parshaTitle = parsha?.title || '';
  const chumash = parshaTitle ? chumashForDate(studyDate, parshaTitle) : null;
  const posts = buildStudyCards(studyDate, parsha, items, { israel });
  
  const parshaName = String(parshaTitle).replace(/^Parashat\s+/i, '') || 'Daily Chumash';
  const hebrewName = parsha?.hebrew ? ` · ${parsha.hebrew}` : '';
  
  return {
    breadcrumb: [{ id: 'root', name: 'Root' }],
    seriesData: {
      id: CHITAS_SERIES_ID,
      name: `Daily Chitas · ${parshaName}`,
      description: `${israel ? 'Israel' : 'Diaspora'} schedule${hebrewName}. Chumash, Tanya, and Tehillim for today.`,
      virtual: true,
      chitasStudy: true,
      dailyStudy: {
        dateKey: toLocalDateKey(studyDate),
        hebrewDate: `${hebrew.day} ${hebrew.monthHe} ${hebrew.year}`,
        hebrewDateEn: `${hebrew.day} ${hebrew.monthEn} ${hebrew.year}`,
        israel,
        chumash,
        tanya,
        tehillim,
        parsha: parsha ? {
          title: parsha.title,
          hebrew: parsha.hebrew || '',
          date: parsha.date || '',
        } : null,
      },
    },
    content: { posts, subSeries: [], groupings: [], translationMeta: null }
  };
}
