// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module FeedI18n
 * @description
 * Yaakov 2026-10-13 (TRACK E): the feed's UI chrome speaks six languages —
 * English, Hebrew, Yiddish, French, Spanish, Portuguese. Torah CONTENT is
 * never machine-translated: only buttons, tabs, menus and labels pass
 * through this module. Locale files live in js/locales/<code>.json. A
 * string the translator was unsure about is listed in that file's
 * "_fallback" array: it renders in English and the element is marked with
 * data-i18n-fallback so editors can spot and fix it.
 *
 * Usage: `await initI18n()` once at boot, then `t('tabs.home')` anywhere.
 * Language changes dispatch a `awtsmoos-feed-lang` CustomEvent on document
 * with `{ lang }` in detail so live UI (tabs, filter panel, river) can
 * repaint. Hebrew and Yiddish switch the feed stage to RTL.
 */

export const LANGS = [
	{ code: 'en', name: 'English', native: 'English', dir: 'ltr' },
	{ code: 'he', name: 'Hebrew', native: 'עברית', dir: 'rtl' },
	{ code: 'yi', name: 'Yiddish', native: 'ייִדיש', dir: 'rtl' },
	{ code: 'fr', name: 'French', native: 'Français', dir: 'ltr' },
	{ code: 'es', name: 'Spanish', native: 'Español', dir: 'ltr' },
	{ code: 'pt', name: 'Portuguese', native: 'Português', dir: 'ltr' }
];

export const LANG_CODES = LANGS.map(l => l.code);
export const LANG_EVENT = 'awtsmoos-feed-lang';

const STORE_KEY = 'awtsmoos-feed-lang';
const LOCALE_BASE = '/feed/js/locales';

const state = {
	lang: 'en',
	/** English reference — ultimate fallback for every key. */
	en: {},
	/** Currently selected locale's strings. */
	strings: {},
	/** Keys in the current locale that were uncertain: render English, mark it. */
	fallback: new Set(),
	ready: false
};

function lsGet(key) {
	try { return localStorage.getItem(key); } catch (_) { return null; }
}

function lsSet(key, value) {
	try {
		if (value === null || value === undefined) localStorage.removeItem(key);
		else localStorage.setItem(key, String(value));
	} catch (_) { /* private mode */ }
}

export function langInfo(code) {
	return LANGS.find(l => l.code === String(code)) || LANGS[0];
}

export function isLangCode(code) {
	return LANG_CODES.includes(String(code));
}

async function loadLocale(code) {
	try {
		const res = await fetch(`${LOCALE_BASE}/${code}.json?v=1`, { credentials: 'same-origin' });
		if (!res.ok) return null;
		return await res.json();
	} catch (_) {
		return null;
	}
}

function applyDirection(code) {
	const info = langInfo(code);
	document.documentElement.setAttribute('lang', info.code);
	const stage = document.getElementById('feed-stage');
	if (stage) stage.setAttribute('dir', info.dir);
}

/**
 * Boots i18n: English reference first (the ultimate fallback), then the
 * saved or browser-preferred language. Must resolve before chrome renders.
 */
export async function initI18n() {
	let saved = lsGet(STORE_KEY);
	if (!isLangCode(saved)) {
		saved = null;
		try {
			const nav = (navigator.language || '').toLowerCase();
			const hit = LANGS.find(l => l.code !== 'en' && nav.startsWith(l.code));
			if (hit) saved = hit.code;
		} catch (_) { /* navigator unavailable */ }
	}
	const enDoc = await loadLocale('en');
	if (enDoc && typeof enDoc.strings === 'object') state.en = enDoc.strings;
	const code = isLangCode(saved) ? saved : 'en';
	if (code !== 'en') {
		const doc = await loadLocale(code);
		if (doc && typeof doc.strings === 'object') {
			state.strings = doc.strings;
			state.fallback = new Set(Array.isArray(doc._fallback) ? doc._fallback : []);
		}
	}
	state.lang = code;
	state.ready = true;
	applyDirection(code);
	return code;
}

/**
 * Translates a key. Uncertain (fallback-marked) or missing keys render in
 * English; only as a last resort (English file itself unreachable) does the
 * raw key leak through.
 * @param {string} key dotted key, e.g. 'tabs.home'
 * @param {object} [params] {name} style template values
 */
export function t(key, params) {
	let s;
	if (state.lang !== 'en' && !state.fallback.has(key) && state.strings[key] !== undefined) {
		s = state.strings[key];
	} else if (state.en[key] !== undefined) {
		s = state.en[key];
	} else if (state.strings[key] !== undefined) {
		s = state.strings[key];
	} else {
		s = key;
	}
	s = String(s);
	if (params && typeof params === 'object') {
		for (const [k, v] of Object.entries(params)) {
			s = s.split('{' + k + '}').join(String(v));
		}
	}
	return s;
}

/** True when `key` will render in English under the current language. */
export function isFallback(key) {
	if (state.lang === 'en') return false;
	return state.fallback.has(key) || state.strings[key] === undefined;
}

export function currentLang() {
	return state.lang;
}

export function i18nReady() {
	return state.ready;
}

/**
 * Switches language, persists the choice, flips RTL, and notifies live UI.
 * @param {string} code one of LANG_CODES
 */
export async function setLang(code) {
	if (!isLangCode(code) || code === state.lang) return state.lang;
	if (code === 'en') {
		state.strings = {};
		state.fallback = new Set();
	} else {
		const doc = await loadLocale(code);
		if (!doc || typeof doc.strings !== 'object') return state.lang;
		state.strings = doc.strings;
		state.fallback = new Set(Array.isArray(doc._fallback) ? doc._fallback : []);
	}
	state.lang = code;
	lsSet(STORE_KEY, code);
	applyDirection(code);
	paintStatic();
	document.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: { lang: code } }));
	return code;
}

/** Re-renders the language for already-mounted chrome (rerender dynamic parts after calling this). */
export function onLangChange(fn) {
	document.addEventListener(LANG_EVENT, (event) => {
		try { fn(event.detail?.lang || state.lang); } catch (_) { /* listener must never break the feed */ }
	});
}

/**
 * Paints every static element carrying data-i18n attributes. Called at boot
 * (after initI18n) and on every language change. Uncertain strings keep
 * their English and gain data-i18n-fallback for editors.
 */
export function paintStatic(root) {
	const scope = root || document;
	const mark = (el, key) => {
		if (isFallback(key)) el.setAttribute('data-i18n-fallback', key);
		else el.removeAttribute('data-i18n-fallback');
	};
	scope.querySelectorAll('[data-i18n]').forEach(el => {
		const key = el.getAttribute('data-i18n');
		el.textContent = t(key);
		mark(el, key);
	});
	scope.querySelectorAll('[data-i18n-aria]').forEach(el => {
		const key = el.getAttribute('data-i18n-aria');
		el.setAttribute('aria-label', t(key));
		mark(el, key);
	});
	scope.querySelectorAll('[data-i18n-title]').forEach(el => {
		const key = el.getAttribute('data-i18n-title');
		el.setAttribute('title', t(key));
		mark(el, key);
	});
	scope.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
		const key = el.getAttribute('data-i18n-placeholder');
		el.setAttribute('placeholder', t(key));
		mark(el, key);
	});
}
