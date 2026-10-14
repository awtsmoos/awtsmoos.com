// B"H
/**
 * @module ChagHub
 * @description
 * B"H — Yaakov 2026-10-14 (TRACK I): the Chag Hub. Holiday central for the
 * Awtsmoos feed: the upcoming chag with a live countdown, per-holiday pages
 * (Pesach, Shavuos, Sukkos, Rosh Hashanah, Yom Kippur, Chanukah, Purim) with
 * tabs for laws, customs, and related texts.
 *
 * CONTENT RULE (standing): SCAFFOLD ONLY. Laws, customs, and texts are
 * editor slots for human editors — this module never invents halachic
 * guidance. Chag dates are read from the editor-filled `DATES` table below
 * (ISO strings, soonest upcoming wins the countdown).
 *
 * Mounts via `mount(el, ctx)`; `initCardHooks()` is a no-op.
 */

import { icon, escapeHtml } from '../icons.js';

/* B"H — EDITORS: fill in real candle-lighting / chag dates (ISO, local
   time, e.g. "2026-10-02T18:30:00"). `dates` may hold this year and next;
   the hub counts down to the soonest date in the future. Each chag also
   takes { about, laws, customs, texts } — all human-written. */
const CHAGIM = [
	{
		key: 'pesach', name: 'Pesach', hebrew: 'פסח',
		tagline: 'The festival of freedom',
		dates: [],
	},
	{
		key: 'shavuos', name: 'Shavuos', hebrew: 'שבועות',
		tagline: 'The giving of the Torah',
		dates: [],
	},
	{
		key: 'sukkos', name: 'Sukkos', hebrew: 'סוכות',
		tagline: 'The festival of booths',
		dates: [],
	},
	{
		key: 'rosh-hashanah', name: 'Rosh Hashanah', hebrew: 'ראש השנה',
		tagline: 'The new year',
		dates: [],
	},
	{
		key: 'yom-kippur', name: 'Yom Kippur', hebrew: 'יום הכיפורים',
		tagline: 'The day of atonement',
		dates: [],
	},
	{
		key: 'chanukah', name: 'Chanukah', hebrew: 'חנוכה',
		tagline: 'The festival of lights',
		dates: [],
	},
	{
		key: 'purim', name: 'Purim', hebrew: 'פורים',
		tagline: 'The festival of lots',
		dates: [],
	},
];

/* B"H — EDITORS: human-written content per chag key. Each tab supports
   plain paragraphs plus a `links` array of {title, url}. */
const CHAG_CONTENT = {};

function editorSlot(label, hint) {
	return `
		<div class="lti-slot">
			<span class="lti-slot-label">${escapeHtml(label)}</span>
			<p>${escapeHtml(hint)}</p>
		</div>`;
}

function nextChag() {
	const now = Date.now();
	let best = null;
	for (const chag of CHAGIM) {
		for (const iso of chag.dates) {
			const t = Date.parse(iso);
			if (Number.isNaN(t) || t < now) continue;
			if (!best || t < best.when) best = { chag, when: t };
		}
	}
	return best;
}

function countdownCells(when) {
	const diff = Math.max(0, when - Date.now());
	const days = Math.floor(diff / 86400000);
	const hours = Math.floor((diff % 86400000) / 3600000);
	const mins = Math.floor((diff % 3600000) / 60000);
	const secs = Math.floor((diff % 60000) / 1000);
	return [
		[days, 'days'], [hours, 'hours'], [mins, 'minutes'], [secs, 'seconds'],
	].map(([n, lab]) => `
		<div class="lti-count-cell">
			<span class="lti-count-num">${n}</span>
			<span class="lti-count-lab">${lab}</span>
		</div>`).join('');
}

function tabBody(chag, tab, c) {
	const links = Array.isArray(c.links) ? c.links : [];
	const paragraphs = Array.isArray(c[tab]) ? c[tab] : [];
	return `
		${paragraphs.length
			? paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('')
			: editorSlot(
				tab === 'laws' ? 'Laws' : tab === 'customs' ? 'Customs' : tab === 'texts' ? 'Related texts' : 'About',
				`Editor: write the ${tab} section for ${chag.name} here. Laws and customs must be reviewed for accuracy before publishing.`)}
		${links.length ? `<ul class="lti-list">${links.map(l => `
			<li><a class="lti-list-row" style="text-decoration:none" href="${escapeHtml(l.url || '#')}" target="_blank" rel="noopener">
				${icon('external')}<span class="lti-list-main"><span class="lti-list-title">${escapeHtml(l.title || 'Link')}</span></span>
			</a></li>`).join('')}</ul>` : ''}`;
}

export async function mount(el, ctx) {
	el.classList.add('lti');
	const upcoming = nextChag();
	let activeTab = 'about';

	function renderIndex() {
		el.innerHTML = `
			<div class="lti-head">
				<div>
					<h3>${icon('party', 'feed-ic')} Chag Hub</h3>
					<p>Every holiday in one place — what is coming, and how to prepare.</p>
				</div>
			</div>
			<div class="lti-card">
				<h4>Upcoming chag</h4>
				${upcoming ? `
					<p><strong style="color:var(--aw-text)">${escapeHtml(upcoming.chag.name)}</strong>
					<span class="lti-he" style="font-size:16px">${escapeHtml(upcoming.chag.hebrew)}</span>
					— ${escapeHtml(new Date(upcoming.when).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))}</p>
					<div class="lti-countdown" data-countdown>${countdownCells(upcoming.when)}</div>`
					: editorSlot('Upcoming chag',
						'Editor: add this year\'s chag dates to the DATES table in chagHub.js and the countdown appears here automatically.')}
			</div>
			<div class="lti-grid">
				${CHAGIM.map(chag => `
					<button type="button" class="lti-tile ${upcoming && upcoming.chag.key === chag.key ? 'is-now' : ''}" data-chag="${escapeHtml(chag.key)}">
						<span class="lti-tile-he">${escapeHtml(chag.hebrew)}</span>
						<span class="lti-tile-title">${escapeHtml(chag.name)}</span>
						<span class="lti-tile-sub">${escapeHtml(chag.tagline)}</span>
						${upcoming && upcoming.chag.key === chag.key ? '<span class="lti-now-badge">Next up</span>' : ''}
					</button>`).join('')}
			</div>`;
		el.querySelectorAll('[data-chag]').forEach(btn => {
			btn.addEventListener('click', () => {
				const chag = CHAGIM.find(c => c.key === btn.dataset.chag);
				if (chag) renderChag(chag);
			});
		});
		const cd = el.querySelector('[data-countdown]');
		if (cd && upcoming) {
			const tick = setInterval(() => {
				if (!document.contains(cd)) { clearInterval(tick); return; }
				cd.innerHTML = countdownCells(upcoming.when);
			}, 1000);
		}
	}

	function renderChag(chag) {
		const c = CHAG_CONTENT[chag.key] || {};
		const tabs = [
			['about', 'About'], ['laws', 'Laws'], ['customs', 'Customs'], ['texts', 'Texts'],
		];
		el.innerHTML = `
			<div class="lti-head">
				<div>
					<h3><span class="lti-he" style="font-size:22px">${escapeHtml(chag.hebrew)}</span> ${escapeHtml(chag.name)}</h3>
					<p>${escapeHtml(chag.tagline)}</p>
				</div>
				<button type="button" class="lti-back" data-chag-back>${icon('chevronUp')} All holidays</button>
			</div>
			<div class="lti-row" role="tablist" aria-label="${escapeHtml(chag.name)} sections" style="margin-bottom:12px">
				${tabs.map(([id, label]) => `
					<button type="button" class="lti-btn ${id === activeTab ? 'primary' : ''}" role="tab"
						aria-selected="${id === activeTab}" data-chag-tab="${id}">${escapeHtml(label)}</button>`).join('')}
			</div>
			<div class="lti-card" role="tabpanel">${tabBody(chag, activeTab, c)}</div>
			<div class="lti-card">
				<h4>Posts for ${escapeHtml(chag.name)}</h4>
				<div class="lti-row">
					<button type="button" class="lti-btn" data-chag-find="${escapeHtml(chag.name)}">
						${icon('search')} Find posts about ${escapeHtml(chag.name)}
					</button>
				</div>
			</div>`;
		el.querySelector('[data-chag-back]').addEventListener('click', () => { activeTab = 'about'; renderIndex(); });
		el.querySelectorAll('[data-chag-tab]').forEach(btn => {
			btn.addEventListener('click', () => { activeTab = btn.dataset.chagTab; renderChag(chag); });
		});
		el.querySelectorAll('[data-chag-find]').forEach(btn => {
			btn.addEventListener('click', () => {
				document.dispatchEvent(new CustomEvent('awtsmoos:chag-search', {
					detail: { query: btn.dataset.chagFind, source: 'chag-hub' },
					bubbles: true,
				}));
			});
		});
	}

	renderIndex();
}

export function initCardHooks() {
	/* No per-card hooks for the hub. */
}
