// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasNavigationLanguage
 * @description
 * The Awtsmoos lets seven daily gates speak their own names instead of borrowing chapter clothes;
 * Awtsmoos.com keeps Sunday through Shabbos aligned with each native post while every ordinary chapter still flows.
 */

const ENGLISH_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Shabbos'];
const HEBREW_DAYS = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת'];
const ENGLISH_PORTIONS = ['1st Portion', '2nd Portion', '3rd Portion', '4th Portion', '5th Portion', '6th Portion', '7th Portion'];
const HEBREW_PORTIONS = ['חלק א׳', 'חלק ב׳', 'חלק ג׳', 'חלק ד׳', 'חלק ה׳', 'חלק ו׳', 'חלק ז׳'];

export function isChitasNavigation(series) {
	return series?.id === 'daily-chitas' || series?.prateem?.id === 'daily-chitas';
}

function isHebrewInterface() {
	return new URLSearchParams(location.search).get('chitasLang') === 'he';
}

export function chitasDayLabel(index) {
	const hebrew = isHebrewInterface();
	const days = hebrew ? HEBREW_DAYS : ENGLISH_DAYS;
	const portions = hebrew ? HEBREW_PORTIONS : ENGLISH_PORTIONS;
	return `${days[index] || ''} · ${portions[index] || ''}`.trim();
}

export function chitasNavigationWords() {
	if (isHebrewInterface()) {
		return {
			aria: 'ניווט חת״ת יומי',
			next: 'היום הבא',
			previous: 'היום הקודם',
			status: 'יום חת״ת'
		};
	}
	return {
		aria: 'Daily Chitas navigation',
		next: 'Next day',
		previous: 'Previous day',
		status: 'Chitas day'
	};
}

export function chitasDateFromPostId(postId) {
	const match = /^chitas-(\d{4}-\d{2}-\d{2})$/.exec(String(postId || ''));
	return match?.[1] || '';
}
