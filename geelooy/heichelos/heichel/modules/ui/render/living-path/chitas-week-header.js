// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file chitas-week-header.js
 * @description
 * The Awtsmoos is beyond yesterday and tomorrow, yet every learner walks through days in time;
 * Awtsmoos.com gathers week movement, study date, interface language, and source truth into one calm crown that can rhyme.
 */

import { addLocalDays, toLocalDateKey } from '../../../chitas/date-policy.js?v=native-chitas-004';

function navigate(selectedDate, language) {
	const parameters = new URLSearchParams(location.search);
	parameters.set('view', 'posts');
	parameters.set('series', 'daily-chitas');
	parameters.set('chitasDate', toLocalDateKey(selectedDate));
	parameters.set('chitasLang', language);
	location.href = `${location.pathname}?${parameters}`;
}

function createButton(label, action, active = false) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = `chitas-week-control${active ? ' is-active' : ''}`;
	button.textContent = label;
	button.addEventListener('click', action);
	return button;
}

function createDatePicker(selectedDate, language) {
	const picker = document.createElement('input');
	picker.type = 'date';
	picker.className = 'chitas-week-date';
	picker.value = toLocalDateKey(selectedDate);
	picker.setAttribute('aria-label', language === 'he' ? 'בחר תאריך לימוד' : 'Choose study date');
	picker.addEventListener('change', () => {
		if (picker.value) {
			navigate(new Date(`${picker.value}T12:00:00`), language);
		}
	});
	return picker;
}

export function createChitasWeekHeader(items, selectedDate, language) {
	const firstDate = items[0]?.date || '';
	const lastDate = items.at(-1)?.date || '';
	const header = document.createElement('header');
	header.className = 'chitas-week-header';
	header.dir = language === 'he' ? 'rtl' : 'ltr';
	const eyebrow = document.createElement('p');
	eyebrow.className = 'chitas-week-eyebrow';
	eyebrow.textContent = language === 'he' ? 'חת״ת יומי · חומש' : 'DAILY CHITAS · CHUMASH';
	const title = document.createElement('h2');
	title.textContent = firstDate && lastDate ? `${firstDate} — ${lastDate}` : 'Daily Chitas';
	const source = document.createElement('p');
	source.className = 'chitas-week-source';
	source.textContent = language === 'he'
		? 'עברית מקורית · תנ״ך איקר'
		: 'Canonical Hebrew · Ikar · English changes the interface only';
	const controls = document.createElement('div');
	controls.className = 'chitas-week-controls';
	controls.append(
		createButton(language === 'he' ? 'שבוע קודם' : 'Previous', () => navigate(addLocalDays(selectedDate, -7), language)),
		createButton(language === 'he' ? 'היום' : 'Today', () => navigate(new Date(), language)),
		createDatePicker(selectedDate, language),
		createButton(language === 'he' ? 'שבוע הבא' : 'Next', () => navigate(addLocalDays(selectedDate, 7), language)),
		createButton('עברית', () => navigate(selectedDate, 'he'), language === 'he'),
		createButton('English UI', () => navigate(selectedDate, 'en'), language === 'en')
	);
	header.append(eyebrow, title, source, controls);
	return header;
}
