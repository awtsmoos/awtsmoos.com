// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file chitas-week.js
 * @description
 * Renders the Daily Chitas view: the day's full study (Chumash + Tanya + Tehillim)
 * followed by the seven-day week navigation.
 */

import { selectedLanguage, selectedStudyDate } from '../../../chitas/week-state.js?v=native-chitas-004';
import { toLocalDateKey } from '../../../chitas/date-policy.js?v=native-chitas-004';
import { createChitasDayRow } from './chitas-day-row.js?v=native-chitas-004';
import { createChitasWeekHeader } from './chitas-week-header.js?v=native-chitas-004';
import { createDailyStudySection } from './chitas-daily-study.js';

const STYLE_HREF = '/heichelos/heichel/modules/ui/render/living-path/chitas-week.css?v=native-chitas-004';
const DAILY_STYLE_HREF = '/heichelos/heichel/modules/ui/render/living-path/chitas-daily.css?v=native-chitas-001';

function ensureStyle(href) {
	if (document.querySelector(`link[href="${href}"]`)) {
		return;
	}
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = href;
	document.head.append(link);
}

export function renderChitasWeek(items, container, navigator, appState) {
	void navigator;
	ensureStyle(STYLE_HREF);
	ensureStyle(DAILY_STYLE_HREF);
	container.replaceChildren();
	const language = selectedLanguage();
	const selectedDate = selectedStudyDate();
	const selectedKey = toLocalDateKey(selectedDate);
	const shell = document.createElement('section');
	shell.className = 'chitas-week-panel';
	
	// Daily study section (Chumash + Tanya + Tehillim for today)
	const dailyStudy = appState.currentSeriesData?.dailyStudy;
	if (dailyStudy) {
		try {
			shell.append(createDailyStudySection(dailyStudy, selectedDate));
		} catch (e) {
			console.warn('B"H — Daily study section failed:', e);
		}
	}
	
	shell.append(createChitasWeekHeader(items, selectedDate, language));
	const list = document.createElement('div');
	list.className = 'chitas-week-list';
	for (const item of items) {
		list.append(createChitasDayRow(item, selectedKey, language, appState.heichelId));
	}
	shell.append(list);
	container.append(shell);
	requestAnimationFrame(() => {
		list.querySelector('.is-selected-day')?.scrollIntoView({
			behavior: 'auto',
			block: 'nearest',
			inline: 'center'
		});
	});
}
