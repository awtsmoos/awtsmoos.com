// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasWeekRenderer
 * @description
 * The Awtsmoos lets seven daily vessels stand in one ordered week instead of dissolving into generic time buckets;
 * Awtsmoos.com keeps date, language, source truth, and social action close enough for one thumb to reach what it seeks.
 */

import { ScribeOfManifestation } from '../../../engine/scribe-of-manifestation.js';
import { addLocalDays, toLocalDateKey } from '../../../chitas/date-policy.js?v=native-chitas-002';
import { selectedLanguage, selectedStudyDate } from '../../../chitas/week-state.js?v=native-chitas-002';
import { normalizeCardData } from '../cardData.js';
import { cardBlueprint } from './cards.js?v=native-chitas-002';

const STYLE_HREF = '/heichelos/heichel/modules/ui/render/living-path/chitas-week.css?v=native-chitas-002';

function ensureStyle() {
	if (document.querySelector(`link[href="${STYLE_HREF}"]`)) return;
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = STYLE_HREF;
	document.head.append(link);
}

function navigate(date, language) {
	const params = new URLSearchParams(location.search);
	params.set('view', 'posts');
	params.set('series', 'daily-chitas');
	params.set('chitasDate', toLocalDateKey(date));
	params.set('chitasLang', language);
	location.href = `${location.pathname}?${params}`;
}

function control(label, action, active = false) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = `chitas-week-control${active ? ' is-active' : ''}`;
	button.textContent = label;
	button.addEventListener('click', action);
	return button;
}

function localizedItem(item, language) {
	if (language !== 'he') return item;
	return {
		...item,
		name: `${item.weekdayHebrew || item.name} · ${item.portionHebrew || ''}`.replace(/ · $/, ''),
		description: item.referenceText || item.description
	};
}

function weekLabel(items, language) {
	const first = items[0]?.date;
	const last = items.at(-1)?.date;
	if (!first || !last) return language === 'he' ? 'שבוע לימוד' : 'Study week';
	return language === 'he' ? `${first} — ${last}` : `Study week · ${first} — ${last}`;
}

function makeHeader(items, selectedDate, language) {
	const header = document.createElement('header');
	header.className = 'chitas-week-header';
	header.dir = language === 'he' ? 'rtl' : 'ltr';
	const eyebrow = document.createElement('p');
	eyebrow.className = 'chitas-week-eyebrow';
	eyebrow.textContent = language === 'he' ? 'חת״ת יומי · חומש' : 'DAILY CHITAS · CHUMASH';
	const title = document.createElement('h2');
	title.textContent = weekLabel(items, language);
	const note = document.createElement('p');
	note.className = 'chitas-week-language-note';
	note.textContent = language === 'he'
		? 'טקסט התורה: עברית מקורית מתוך תנ״ך איקר.'
		: 'English interface · Torah text remains canonical Hebrew until native English Tanach coverage exists.';
	const controls = document.createElement('div');
	controls.className = 'chitas-week-controls';
	controls.append(
		control(language === 'he' ? 'שבוע קודם' : 'Previous week', () => navigate(addLocalDays(selectedDate, -7), language)),
		control(language === 'he' ? 'היום' : 'Today', () => navigate(new Date(), language))
	);
	const picker = document.createElement('input');
	picker.type = 'date';
	picker.className = 'chitas-week-date';
	picker.value = toLocalDateKey(selectedDate);
	picker.setAttribute('aria-label', language === 'he' ? 'בחר תאריך לימוד' : 'Choose study date');
	picker.addEventListener('change', () => picker.value && navigate(new Date(`${picker.value}T12:00:00`), language));
	controls.append(
		picker,
		control(language === 'he' ? 'שבוע הבא' : 'Next week', () => navigate(addLocalDays(selectedDate, 7), language)),
		control('עברית', () => navigate(selectedDate, 'he'), language === 'he'),
		control('English UI', () => navigate(selectedDate, 'en'), language === 'en')
	);
	header.append(eyebrow, title, note, controls);
	return header;
}

export function renderChitasWeek(items, container, navigator, appState) {
	ensureStyle();
	container.replaceChildren();
	const language = selectedLanguage();
	const selectedDate = selectedStudyDate();
	const selectedKey = toLocalDateKey(selectedDate);
	const shell = document.createElement('section');
	shell.className = 'chitas-week-panel';
	shell.append(makeHeader(items, selectedDate, language));
	const list = document.createElement('div');
	list.className = 'chitas-week-list';
	for (const item of items) {
		const displayItem = localizedItem(item, language);
		const data = normalizeCardData(displayItem, 'post');
		const selected = item.date === selectedKey ? ' is-selected-day' : '';
		list.append(ScribeOfManifestation.manifest(cardBlueprint(displayItem, data, navigator, appState, {
			variant: `chitas-week-card${selected}`
		})));
	}
	shell.append(list);
	container.append(shell);
}
