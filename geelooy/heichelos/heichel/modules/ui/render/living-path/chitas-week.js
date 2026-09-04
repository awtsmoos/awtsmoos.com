// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file chitas-week.js
 * @description
 * The Awtsmoos lets seven days remain one weekly path without generic cards becoming the veil;
 * Awtsmoos.com reveals a compact crown and seven direct Torah gates, where data stays native and the interface stays real.
 */

import { selectedLanguage, selectedStudyDate } from '../../../chitas/week-state.js?v=native-chitas-004';
import { toLocalDateKey } from '../../../chitas/date-policy.js?v=native-chitas-004';
import { createChitasDayRow } from './chitas-day-row.js?v=native-chitas-004';
import { createChitasWeekHeader } from './chitas-week-header.js?v=native-chitas-004';

const STYLE_HREF = '/heichelos/heichel/modules/ui/render/living-path/chitas-week.css?v=native-chitas-004';

function ensureStyle() {
	if (document.querySelector(`link[href="${STYLE_HREF}"]`)) {
		return;
	}
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = STYLE_HREF;
	document.head.append(link);
}

export function renderChitasWeek(items, container, navigator, appState) {
	void navigator;
	ensureStyle();
	container.replaceChildren();
	const language = selectedLanguage();
	const selectedDate = selectedStudyDate();
	const selectedKey = toLocalDateKey(selectedDate);
	const shell = document.createElement('section');
	shell.className = 'chitas-week-panel';
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
