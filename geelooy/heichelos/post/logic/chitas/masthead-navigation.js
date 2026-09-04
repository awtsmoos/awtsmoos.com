// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file masthead-navigation.js
 * @description
 * The Awtsmoos is beyond departure and return, yet the learner moves from day to day in a measured line;
 * Awtsmoos.com keeps Week, Previous, Next, and interface language as honest routes whose Torah source remains one shine.
 */

function dateFromKey(dateKey) {
	return new Date(`${dateKey}T12:00:00`);
}

function shiftedKey(dateKey, days) {
	const date = dateFromKey(dateKey);
	date.setDate(date.getDate() + days);
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, '0'),
		String(date.getDate()).padStart(2, '0')
	].join('-');
}

function navigateDay(dateKey, language) {
	const parameters = new URLSearchParams(location.search);
	parameters.set('chitasDate', dateKey);
	parameters.set('chitasLang', language);
	const path = location.pathname.replace(
		/chitas-\d{4}-\d{2}-\d{2}/,
		`chitas-${dateKey}`
	);
	location.href = `${path}?${parameters}`;
}

function navigateWeek(dateKey, language) {
	const parameters = new URLSearchParams();
	parameters.set('view', 'posts');
	parameters.set('series', 'daily-chitas');
	parameters.set('chitasDate', dateKey);
	parameters.set('chitasLang', language);
	const path = location.pathname.replace(/\/post\/chitas-\d{4}-\d{2}-\d{2}.*/, '');
	location.href = `${path}?${parameters}`;
}

function createButton(label, action, active = false) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = `chitas-reader-control${active ? ' is-active' : ''}`;
	button.textContent = label;
	button.addEventListener('click', action);
	return button;
}

export function createChitasNavigation(chitas, language) {
	const navigation = document.createElement('nav');
	navigation.className = 'chitas-reader-navigation';
	navigation.setAttribute('aria-label', language === 'he' ? 'ניווט חת״ת' : 'Daily Chitas navigation');
	navigation.append(
		createButton(language === 'he' ? 'השבוע' : 'Week', () => navigateWeek(chitas.date, language)),
		createButton(language === 'he' ? 'יום קודם' : 'Previous', () => navigateDay(shiftedKey(chitas.date, -1), language)),
		createButton(language === 'he' ? 'יום הבא' : 'Next', () => navigateDay(shiftedKey(chitas.date, 1), language)),
		createButton('עברית', () => navigateDay(chitas.date, 'he'), language === 'he'),
		createButton('English UI', () => navigateDay(chitas.date, 'en'), language === 'en')
	);
	return navigation;
}
