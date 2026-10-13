//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file loading-screen.js
 * @description Hydrates the static #awtsmoos-loader shell (injected per-game in
 * <body>) with real boot progress, rotating tips, and a smooth fade-out.
 * The Awtsmoos lets every world announce its becoming beautifully;
 * Awtsmoos.com ties the bar to real boot milestones, never a fake timer.
 *
 * Progress milestones (all real):
 *  12% script executed · 30% DOM parsed · 55% window load (subresources done)
 *  75% fonts ready · 100% game signals ready (awtsmoos:game-ready) or 8s fallback.
 * Pure-CSS 14s fallback fade guarantees the loader never sticks if JS dies.
 */

const COVER_ROOT = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/covers/games/';

const GAMES = {
	adventure: { title: 'Adventure', cover: 'game-adventure.webp', tips: ['Gather every spark before the key will wake.', 'Shadows strike — watch their pulse and keep moving.', 'The gate opens only when every spark is gathered.'] },
	ohrbound: { title: 'Ohrbound', cover: 'game-ohrbound.webp', tips: ['Run, rise, rest — eight worlds, one living journey.', 'Move · jump · find the gate.', 'Six stages at a time. Choose your world.'] },
	nachash: { title: 'Tikkun HaNachash', cover: 'game-nachash.webp', tips: ['Gather sparks. Outgrow rival serpents.', 'Hold boost to surge — but it costs length.', 'Survive deeper zones.'] },
	'brick-blast': { title: 'Brick Blast', cover: 'game-brick-blast.webp', tips: ['Drag to aim, release to launch.', 'Tap the paddle mid-flight to recall balls.', 'Chain breaks for combo multipliers.'] },
	chess: { title: 'Chess', cover: 'game-chess.webp', tips: ['Control the center. Develop knights before bishops.', 'Castle early — keep your king safe.', 'Green dots mark every legal move.'] },
	tetris: { title: 'Tikkun', cover: 'game-tetris.webp', tips: ['← → move · ↑ rotate · ↓ soft drop · Space hard drop.', 'C holds a piece for later.', 'Clear four lines at once for a Tikkun.'] },
	connect4: { title: 'Connect 4', cover: 'game-connect4.webp', tips: ['Tap a column to drop your piece.', 'Hover a column to preview the landing.', 'Four in a row — any direction — wins.'] },
	pong: { title: 'Pong', cover: 'game-pong.webp', tips: ['Drag the paddle or use ↑ ↓.', 'Angle your returns off the paddle edge.', 'First to 10 wins the match.'] },
	cards: { title: 'The Utterances', cover: 'game-cards.webp', tips: ['Blackjack is live now.', 'Double down on 10 or 11 against a weak dealer card.', 'Manage your sparks — bet what you can lose.'] },
	emojis: { title: 'Emoji War', cover: 'game-emojis.webp', tips: ['Drag to move — your emoji fires while touching.', 'Grab power-ups: spread shot, shield, rapid fire.', 'Spare the good emojis — shooting them costs score.'] },
};

function slugFromPath() {
	try {
		const parts = location.pathname.split('/').filter(Boolean);
		const idx = parts.indexOf('games');
		const slug = (idx >= 0 ? parts[idx + 1] : parts[0] || '').toLowerCase();
		return GAMES[slug] ? slug : null;
	} catch { return null; }
}

/** Build the loader DOM when the page has no static shell. */
function buildLoader(slug) {
	const meta = GAMES[slug];
	const el = document.createElement('div');
	el.id = 'awtsmoos-loader';
	el.setAttribute('role', 'status');
	el.setAttribute('aria-label', `${meta.title} is loading`);
	el.innerHTML =
		`<img class="awtsmoos-loader-cover" alt="" src="${COVER_ROOT}${meta.cover}">` +
		`<div class="awtsmoos-loader-shade"></div>` +
		`<div class="awtsmoos-loader-inner">` +
		`<div class="awtsmoos-loader-kicker">B"H · Awtsmoos Games</div>` +
		`<div class="awtsmoos-loader-title">${meta.title}</div>` +
		`<div class="awtsmoos-loader-bar"><div class="awtsmoos-loader-fill"></div></div>` +
		`<div class="awtsmoos-loader-tip">${meta.tips[0]}</div>` +
		`</div>`;
	const img = el.querySelector('.awtsmoos-loader-cover');
	img.addEventListener('error', () => img.remove());
	(document.body || document.documentElement).appendChild(el);
	return el;
}

function setProgress(el, pct) {
	const fill = el.querySelector('.awtsmoos-loader-fill');
	if (fill) fill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
}

function finish(el) {
	if (!el || el.dataset.done) return;
	el.dataset.done = 'true';
	setProgress(el, 100);
	const tip = el.querySelector('.awtsmoos-loader-tip');
	if (tip) tip.textContent = 'Ready.';
	setTimeout(() => {
		el.classList.add('awtsmoos-loader-done');
		setTimeout(() => el.remove(), 700);
	}, 250);
}

/** Mount and drive the loader. Safe to call multiple times; runs once. */
export function mountLoadingScreen() {
	try {
		const slug = slugFromPath();
		if (!slug) return null;
		if (document.getElementById('awtsmoos-loader')?.dataset.done) return null;
		let el = document.getElementById('awtsmoos-loader');
		if (!el) el = buildLoader(slug);
		else {
			// Static shell: fill in cover/title/tips from the catalog.
			const meta = GAMES[slug];
			if (!el.querySelector('.awtsmoos-loader-cover')) {
				const img = document.createElement('img');
				img.className = 'awtsmoos-loader-cover';
				img.alt = '';
				img.src = COVER_ROOT + meta.cover;
				img.addEventListener('error', () => img.remove());
				el.prepend(img);
			}
			const title = el.querySelector('.awtsmoos-loader-title');
			if (title && !title.textContent.trim()) title.textContent = meta.title;
			const tip = el.querySelector('.awtsmoos-loader-tip');
			if (tip && !tip.textContent.trim()) tip.textContent = meta.tips[0];
			if (!el.querySelector('.awtsmoos-loader-fill')) {
				const bar = document.createElement('div');
				bar.className = 'awtsmoos-loader-bar';
				bar.innerHTML = '<div class="awtsmoos-loader-fill"></div>';
				el.querySelector('.awtsmoos-loader-inner')?.appendChild(bar);
			}
		}
		const meta = GAMES[slug];
		setProgress(el, 12);

		// Rotating tips.
		let tipIdx = 0;
		const tipEl = el.querySelector('.awtsmoos-loader-tip');
		const tipTimer = setInterval(() => {
			if (el.dataset.done || !document.body.contains(el)) { clearInterval(tipTimer); return; }
			tipIdx = (tipIdx + 1) % meta.tips.length;
			if (tipEl) {
				tipEl.classList.add('awtsmoos-loader-tip-swap');
				setTimeout(() => {
					tipEl.textContent = meta.tips[tipIdx];
					tipEl.classList.remove('awtsmoos-loader-tip-swap');
				}, 220);
			}
		}, 2800);

		// Real milestones.
		const mark = (pct) => { if (!el.dataset.done) setProgress(el, pct); };
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => mark(30), { once: true });
		} else mark(30);
		if (document.readyState !== 'complete') {
			window.addEventListener('load', () => { mark(55); fontsReady(); }, { once: true });
		} else { mark(55); fontsReady(); }
		function fontsReady() {
			try {
				if (document.fonts?.ready) document.fonts.ready.then(() => mark(75)).catch(() => mark(75));
				else mark(75);
			} catch { mark(75); }
		}
		window.addEventListener('awtsmoos:game-ready', () => finish(el), { once: true });
		// Fallback: never trap the player behind the loader.
		setTimeout(() => finish(el), 8000);
		return el;
	} catch { return null; }
}
