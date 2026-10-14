// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module FeedKidsMode
 * @description
 * Yaakov 2026-10-13 (TRACK E): Kids mode — a simplified, colorful,
 * sharp-cornered reading view for the river.
 *
 * - Toggle in the topbar ("Kids mode"), persisted in localStorage.
 * - Larger text and playful colors (see css/kidsMode.css).
 * - Simple explanations are EDITOR-WRITTEN only: a post opts in by
 *   carrying `simpleSummary` (or `kidsSummary` / `simpleExplanation`).
 *   Torah text is NEVER auto-simplified or AI-rewritten here.
 * - Per-post opt-in badge: "Kids version available" on cards whose post
 *   carries a simple summary.
 * - Fun elements: yarmulke-emoji section markers, progress stars (one per
 *   kid post read), and the parental note "Ask a grown-up about hard words".
 */

import { t } from './i18n.js';
import { icon, escapeHtml, escapeAttr } from './icons.js';

export const KIDS_EVENT = 'awtsmoos-feed-kids';
const STORE_KEY = 'awtsmoos-feed-kids';
const STAR_COUNT_KEY = 'awtsmoos-kids-stars';
const STAR_READ_KEY = 'awtsmoos-kids-stars-read';

const EMOJI_BASE = '/feed/assets/emojis';
/* Section markers cycle through the yarmulke emoji set. */
const MARKERS = ['star-eyes', 'tada', 'crown', 'partying-face', 'bulb', 'clapping'];

function lsGet(key) {
	try { return localStorage.getItem(key); } catch (_) { return null; }
}

function lsSet(key, value) {
	try {
		if (value === null || value === undefined) localStorage.removeItem(key);
		else localStorage.setItem(key, String(value));
	} catch (_) { /* private mode */ }
}

export function isKidsMode() {
	return lsGet(STORE_KEY) === '1';
}

/** Applies the saved kids mode to the stage. Call once at boot. */
export function initKidsMode() {
	if (isKidsMode()) document.getElementById('feed-stage')?.classList.add('kids-mode');
}

export function setKidsMode(on) {
	lsSet(STORE_KEY, on ? '1' : '0');
	document.getElementById('feed-stage')?.classList.toggle('kids-mode', !!on);
	document.dispatchEvent(new CustomEvent(KIDS_EVENT, { detail: { kids: !!on } }));
}

export function onKidsChange(fn) {
	document.addEventListener(KIDS_EVENT, (event) => {
		try { fn(!!event.detail?.kids); } catch (_) { /* listener must never break the feed */ }
	});
}

/* ============ editor-written simple summaries (never AI-simplified) ============ */

/**
 * The post's simple explanation, written by a content editor. Checked in
 * priority order so older imports (`kidsSummary`) keep working.
 */
export function simpleSummaryOf(item = {}) {
	for (const key of ['simpleSummary', 'kidsSummary', 'simpleExplanation']) {
		const v = item[key];
		if (typeof v === 'string' && v.trim()) return v.trim();
	}
	return '';
}

export function hasSimpleSummary(item = {}) {
	return simpleSummaryOf(item) !== '';
}

/** Per-post opt-in badge: "Kids version available". Shown on the card always. */
export function kidsBadgeHtml(item = {}) {
	if (!hasSimpleSummary(item)) return '';
	return `<span class="kids-badge"><img class="kids-badge-emoji" src="${EMOJI_BASE}/star-eyes.png" alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false"><span>${escapeHtml(t('card.kidsBadge'))}</span></span>`;
}

/* ============ progress stars ============ */

function readIds() {
	try {
		const raw = JSON.parse(lsGet(STAR_READ_KEY) || '[]');
		return new Set(Array.isArray(raw) ? raw : []);
	} catch (_) { return new Set(); }
}

export function kidStarCount() {
	return Number(lsGet(STAR_COUNT_KEY)) || 0;
}

/**
 * Awards one progress star the first time a kid post is read.
 * @returns {{total: number, isNew: boolean}}
 */
export function awardKidStar(item = {}) {
	const id = String(item.postId || item.id || '');
	const seen = readIds();
	if (id) {
		if (seen.has(id)) return { total: kidStarCount(), isNew: false };
		seen.add(id);
		lsSet(STAR_READ_KEY, JSON.stringify([...seen].slice(-200)));
	}
	const total = kidStarCount() + 1;
	lsSet(STAR_COUNT_KEY, String(total));
	return { total, isNew: true };
}

export function kidStarsHtml(total) {
	const n = Math.max(0, Number(total) || 0);
	const shown = Math.min(n, 12);
	let stars = '';
	for (let i = 0; i < shown; i++) stars += icon('star', 'kid-star', true);
	return `<span class="kid-stars" role="img" aria-label="${escapeAttr(t('kids.stars', { n }))}">${stars}<span class="kid-stars-count">${n}</span></span>`;
}

/* ============ simple explanation section (expanded reader, kids mode) ============ */

/**
 * Renders the simple explanation FIRST in the expanded reader: yarmulke
 * emoji section markers, the editor's simple words, the parental note,
 * and the reader's progress stars.
 * @param {object} item the feed item
 * @param {{total: number, isNew: boolean}} award result of awardKidStar
 */
export function simpleExplanationHtml(item = {}, award = null) {
	const text = simpleSummaryOf(item);
	if (!text) return '';
	const paras = String(text).split(/\n+/).map(p => p.trim()).filter(Boolean);
	const body = paras.map((p, i) => {
		const marker = MARKERS[i % MARKERS.length];
		return `<p class="kid-simple-para"><img class="kid-marker" src="${EMOJI_BASE}/${marker}.png" alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false"><span>${escapeHtml(p)}</span></p>`;
	}).join('');
	const total = award ? award.total : kidStarCount();
	const earned = award && award.isNew
		? `<p class="kid-star-earned"><img class="kid-marker" src="${EMOJI_BASE}/tada.png" alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false"><span>${escapeHtml(t('kids.starEarned'))}</span></p>`
		: '';
	return `<section class="kid-simple" aria-label="${escapeAttr(t('kids.simpleTitle'))}">
		<h3 class="kid-simple-title"><img class="kid-marker" src="${EMOJI_BASE}/star-eyes.png" alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false"><span>${escapeHtml(t('kids.simpleTitle'))}</span></h3>
		<div class="kid-simple-body">${body}</div>
		${earned}
		<p class="kid-parental">${escapeHtml(t('kids.parental'))}</p>
		<div class="kid-stars-row">${kidStarsHtml(total)}</div>
	</section>`;
}
