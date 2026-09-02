// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasMasthead
 * @description
 * The Awtsmoos lets date, week, and language crown the Torah only after the Scribe has revealed its stream;
 * Awtsmoos.com keeps canonical Hebrew explicit while touchable controls remain honest, stable, and seen.
 */

const STYLE_HREF = '/heichelos/post/logic/chitas/masthead.css?v=native-chitas-003';

function dateFromKey(key) {
	return new Date(`${key}T12:00:00`);
}

function shiftedKey(key, days) {
	const date = dateFromKey(key);
	date.setDate(date.getDate() + days);
	return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function todayKey() {
	const date = new Date();
	return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function navigate(dateKey, lang) {
	const params = new URLSearchParams(location.search);
	params.set('chitasDate', dateKey);
	params.set('chitasLang', lang);
	const path = location.pathname.replace(/chitas-\d{4}-\d{2}-\d{2}/, `chitas-${dateKey}`);
	location.href = `${path}?${params}`;
}

function button(label, action, active = false) {
	const element = document.createElement('button');
	element.type = 'button';
	element.className = `chitas-reader-control${active ? ' is-active' : ''}`;
	element.textContent = label;
	element.addEventListener('click', action);
	return element;
}

function ensureStyle() {
	if (document.querySelector(`link[href="${STYLE_HREF}"]`)) return;
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = STYLE_HREF;
	document.head.append(link);
}

function datePicker(chitas, lang) {
	const picker = document.createElement('input');
	picker.type = 'date';
	picker.className = 'chitas-reader-date';
	picker.value = chitas.date;
	picker.setAttribute('aria-label', lang === 'he' ? 'בחר תאריך' : 'Choose study date');
	picker.addEventListener('change', () => picker.value && navigate(picker.value, lang));
	return picker;
}

export function renderChitasMasthead(viewport, post) {
	const chitas = post?.dayuh?.meta?.chitas;
	if (!chitas) return;
	ensureStyle();
	viewport.querySelector('.chitas-reader-masthead')?.remove();
	const lang = chitas.lang === 'he' ? 'he' : 'en';
	const shell = document.createElement('section');
	shell.className = 'chitas-reader-masthead';
	shell.dir = lang === 'he' ? 'rtl' : 'ltr';
	const eyebrow = document.createElement('p');
	eyebrow.className = 'chitas-reader-eyebrow';
	eyebrow.textContent = lang === 'he' ? 'חת״ת יומי · חומש' : 'DAILY CHITAS · CHUMASH';
	const heading = document.createElement('h2');
	heading.textContent = lang === 'he' ? `${chitas.weekdayHebrew} · ${chitas.portionHebrew}` : `${chitas.weekday} · ${chitas.portion}`;
	const meta = document.createElement('p');
	meta.className = 'chitas-reader-meta';
	meta.textContent = `${chitas.date} · ${chitas.referenceText}${chitas.parshaHebrew ? ` · ${chitas.parshaHebrew}` : ''}`;
	const sourceNote = document.createElement('p');
	sourceNote.className = 'chitas-reader-source-note';
	sourceNote.textContent = lang === 'he'
		? 'טקסט התורה הוא המקור העברי מתנ״ך איקר.'
		: 'English interface · Torah text is canonical Hebrew. Native English Tanach translation is not materialized yet.';
	const controls = document.createElement('div');
	controls.className = 'chitas-reader-controls';
	controls.append(
		button(lang === 'he' ? 'שבוע קודם' : 'Previous week', () => navigate(shiftedKey(chitas.date, -7), lang)),
		button(lang === 'he' ? 'היום' : 'Today', () => navigate(todayKey(), lang)),
		datePicker(chitas, lang),
		button(lang === 'he' ? 'שבוע הבא' : 'Next week', () => navigate(shiftedKey(chitas.date, 7), lang)),
		button('עברית', () => navigate(chitas.date, 'he'), lang === 'he'),
		button('English UI', () => navigate(chitas.date, 'en'), lang === 'en')
	);
	shell.append(eyebrow, heading, meta, sourceNote, controls);
	viewport.prepend(shell);
}
