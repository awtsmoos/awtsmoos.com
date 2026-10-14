// B"H
/**
 * @module FeedHomeWidget
 * @description
 * B"H — Yaakov 2026-10-13 (TRACK F engagement): the home screen widget for
 * the Awtsmoos River. (1) A polite "Add to home screen" prompt for the daily
 * Torah quote widget — the browser's beforeinstallprompt is captured and the
 * prompt is shown at most once per 7 days, never nagging; iOS gets manual
 * instructions since Safari has no install prompt event. (2) A daily Torah
 * quote card pinned at the top of the river, rotating once per day from a
 * curated pool drawn from Torah sources (the same passages that flow through
 * posts). PWA manifest + meta tags only — no native apps are built here.
 *
 * Storage: awtsmoos-feed-widget-v1 — prompt cadence + daily quote offset.
 */

import { icon, escapeHtml } from './icons.js';

const STORE_KEY = 'awtsmoos-feed-widget-v1';
const PROMPT_COOLDOWN_MS = 7 * 24 * 3600 * 1000;

/**
 * Daily quote pool. Each entry: { he, en, source }. These are the same
 * passages that flow through River posts; the card rotates by day-of-year so
 * the whole community shares one quote per day.
 */
export const DAILY_QUOTES = [
	{ he: 'וְאָהַבְתָּ לְרֵעֲךָ כָּמוֹךָ', en: 'Love your fellow as yourself.', source: 'Vayikra 19:18' },
	{ he: 'אֵין עוֹד מִלְּבַדּוֹ', en: 'There is none besides Him.', source: 'Devarim 4:35' },
	{ he: 'נֵר לְרַגְלִי דְבָרֶךָ', en: 'Your word is a lamp to my feet and a light to my path.', source: 'Tehillim 119:105' },
	{ he: 'עֵץ חַיִּים הִיא לַמַּחֲזִיקִים בָּהּ', en: 'She is a tree of life to those who hold her fast.', source: 'Mishlei 3:18' },
	{ he: 'כִּי קָרוֹב אֵלֶיךָ הַדָּבָר מְאֹד בְּפִיךָ וּבִלְבָבְךָ לַעֲשֹׂתוֹ', en: 'The matter is very close to you — in your mouth and in your heart, to do it.', source: 'Devarim 30:14' },
	{ he: 'עַל שְׁלשָׁה דְבָרִים הָעוֹלָם עוֹמֵד', en: 'The world stands on three things: Torah, avodah, and acts of kindness.', source: 'Pirkei Avos 1:2' },
	{ he: 'אֵיזֶהוּ חָכָם הַלּוֹמֵד מִכָּל אָדָם', en: 'Who is wise? One who learns from every person.', source: 'Pirkei Avos 4:1' },
	{ he: 'יָגַעְתָּ וּמָצָאתָ תַּאֲמִין', en: 'If you toiled and you found — believe it.', source: 'Megillah 6b' },
	{ he: 'כָּל יִשְׂרָאֵל יֵשׁ לָהֶם חֵלֶק לְעוֹלָם הַבָּא', en: 'All of Israel have a share in the World to Come.', source: 'Sanhedrin 90a' },
	{ he: 'בְּמָקוֹם שֶׁבַּעֲלֵי תְּשׁוּבָה עוֹמְדִים', en: 'Where those who return stand, even the wholly righteous cannot stand.', source: 'Berachos 34b' },
	{ he: 'אֵין חָבוּשׁ מַתִּיר עַצְמוֹ מִבֵּית הָאֲסוּרִים', en: 'A prisoner cannot free himself from prison — we rise together.', source: 'Berachos 5b' },
	{ he: 'דַּע מַה שֶּׁתָּשִׁיב', en: 'Know what to answer — the questions are the beginning of wisdom.', source: 'Pirkei Avos 2:14' }
];

function readStore() {
	try {
		const raw = localStorage.getItem(STORE_KEY);
		const parsed = raw ? JSON.parse(raw) : null;
		return parsed && typeof parsed === 'object' ? parsed : {};
	} catch (_) { return {}; }
}

function writeStore(s) {
	try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (_) { }
}

function dayOfYear(date = new Date()) {
	const start = new Date(date.getFullYear(), 0, 0);
	return Math.floor((date - start) / 86400000);
}

function dayKey(date = new Date()) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Today's quote index — shared across the community, offset by user skips. */
export function quoteForToday(extraOffset = 0) {
	const store = readStore();
	const dayOffset = store.quoteDayOffset && store.quoteDayOffset.day === dayKey()
		? store.quoteDayOffset.offset : 0;
	const idx = (dayOfYear() + dayOffset + extraOffset) % DAILY_QUOTES.length;
	return { quote: DAILY_QUOTES[idx], index: idx };
}

function isInstalled() {
	try {
		if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
		if (window.navigator && window.navigator.standalone) return true;
	} catch (_) { }
	return false;
}

function isIos() {
	try {
		return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
			(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
	} catch (_) { return false; }
}

export function initWidget() {
	const stage = document.getElementById('feed-stage');
	if (!stage) return;

	mountDailyQuote(stage);
	mountInstallPrompt(stage);
}

/** The daily Torah quote card, pinned above the river. */
function mountDailyQuote(stage) {
	if (document.querySelector('.feed-widget-quote')) return;
	const river = stage.querySelector('#feed-river');
	if (!river) return;

	const card = document.createElement('section');
	card.className = 'feed-widget-quote';
	card.setAttribute('aria-label', 'Daily Torah quote');

	function paint() {
		const { quote } = quoteForToday();
		card.innerHTML = `
			<div class="feed-widget-quote-tag">${icon('spark')}<span>Daily Torah quote</span></div>
			<p class="feed-widget-quote-he" dir="rtl" lang="he">${escapeHtml(quote.he)}</p>
			<p class="feed-widget-quote-en">${escapeHtml(quote.en)}</p>
			<div class="feed-widget-quote-foot">
				<cite class="feed-widget-quote-src">${escapeHtml(quote.source)}</cite>
				<button type="button" class="feed-widget-quote-next" data-widget="next">Another quote</button>
			</div>`;
		card.querySelector('[data-widget="next"]').addEventListener('click', () => {
			const store = readStore();
			const today = dayKey();
			const cur = store.quoteDayOffset && store.quoteDayOffset.day === today ? store.quoteDayOffset.offset : 0;
			store.quoteDayOffset = { day: today, offset: (cur + 1) % DAILY_QUOTES.length };
			writeStore(store);
			paint();
		});
	}

	paint();
	river.insertBefore(card, river.firstChild);
}

/** Polite "Add to home screen" prompt — at most once per 7 days. */
function mountInstallPrompt(stage) {
	if (isInstalled()) return;
	const store = readStore();
	if (store.promptShownAt && Date.now() - store.promptShownAt < PROMPT_COOLDOWN_MS) return;
	if (document.querySelector('.feed-widget-prompt')) return;

	let deferredPrompt = null;
	window.addEventListener('beforeinstallprompt', (e) => {
		e.preventDefault();
		deferredPrompt = e;
		maybeShow();
	});
	// If the event never fires (already fired pre-init, or unsupported),
	// offer the manual path after a beat — still once per 7 days.
	setTimeout(maybeShow, 12000);

	let shown = false;
	function maybeShow() {
		if (shown || isInstalled()) return;
		const s = readStore();
		if (s.promptShownAt && Date.now() - s.promptShownAt < PROMPT_COOLDOWN_MS) return;
		shown = true;

		const canNative = !!deferredPrompt;
		const card = document.createElement('div');
		card.className = 'feed-widget-prompt';
		card.setAttribute('role', 'dialog');
		card.setAttribute('aria-label', 'Add Awtsmoos River to your home screen');
		card.innerHTML = `
			<span class="feed-widget-prompt-ic">${icon('spark')}</span>
			<span class="feed-widget-prompt-text">
				<strong>Carry the River with you.</strong>
				${canNative
					? 'Add Awtsmoos River to your home screen for the daily Torah quote.'
					: (isIos()
						? 'On iPhone: tap Share, then "Add to Home Screen" — the daily Torah quote travels with you.'
						: 'Use your browser menu → "Add to Home screen" — the daily Torah quote travels with you.')}
			</span>
			${canNative ? '<button type="button" class="feed-widget-prompt-ok">Add to home screen</button>' : ''}
			<button type="button" class="feed-widget-prompt-no">Not now</button>`;
		if (canNative) {
			card.querySelector('.feed-widget-prompt-ok').addEventListener('click', async () => {
				try { await deferredPrompt.prompt(); } catch (_) { }
				deferredPrompt = null;
				dismiss();
			});
		}
		function dismiss() {
			const st = readStore();
			st.promptShownAt = Date.now();
			writeStore(st);
			card.remove();
		}
		card.querySelector('.feed-widget-prompt-no').addEventListener('click', dismiss);
		const main = stage.querySelector('.feed-main') || stage;
		main.insertBefore(card, main.firstChild);
	}
}
