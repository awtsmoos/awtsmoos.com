// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file chitas-day-row.js
 * @description
 * The Awtsmoos lets one day become a direct Torah gate rather than a generic social card of weight;
 * Awtsmoos.com keeps weekday, portion, reference, and action together, so the learner reaches the pasuk straight.
 */

function safe(value, fallback) {
	const text = String(value ?? '').trim();
	if (!text || text === 'undefined' || text === 'null') {
		return fallback;
	}
	return text;
}

function createHref(item, language, heichelId) {
	const date = safe(item.date, '');
	const postId = encodeURIComponent(safe(item.id, `chitas-${date}`));
	const parameters = new URLSearchParams();
	parameters.set('chitasDate', date);
	parameters.set('chitasLang', language);
	return `/heichelos/${encodeURIComponent(heichelId)}/series/daily-chitas/post/${postId}?${parameters}`;
}

function createCopy(item, language) {
	if (language === 'he') {
		const weekday = safe(item.weekdayHebrew, 'יום לימוד');
		const portion = safe(item.portionHebrew, 'חלק');
		return { title: `${weekday} · ${portion}`, action: 'פתח תורה' };
	}
	return {
		title: safe(item.name, 'Daily Chitas'),
		action: 'Open Torah'
	};
}

export function createChitasDayRow(item, selectedKey, language, heichelId) {
	const dateKey = safe(item.date, '');
	const copy = createCopy(item, language);
	const anchor = document.createElement('a');
	anchor.className = `chitas-day-row${dateKey === selectedKey ? ' is-selected-day' : ''}`;
	anchor.href = createHref(item, language, heichelId);
	anchor.dir = language === 'he' ? 'rtl' : 'ltr';
	if (dateKey === selectedKey) {
		anchor.setAttribute('aria-current', 'date');
	}
	const date = document.createElement('span');
	date.className = 'chitas-day-date';
	date.textContent = safe(dateKey, 'Study day');
	const body = document.createElement('span');
	body.className = 'chitas-day-body';
	const title = document.createElement('strong');
	title.textContent = copy.title;
	const reference = document.createElement('span');
	reference.className = 'chitas-day-reference';
	reference.textContent = safe(item.referenceText, safe(item.description, 'Native Torah range'));
	body.append(title, reference);
	const action = document.createElement('span');
	action.className = 'chitas-day-action';
	action.textContent = `${copy.action} →`;
	anchor.append(date, body, action);
	return anchor;
}
