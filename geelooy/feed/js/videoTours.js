// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module VideoTours
 * @description
 * Yaakov 2026-10-14 (TRACK J): guided "video tours" for each heichel.
 * These are dismissible step-by-step OVERLAY tours (not video files):
 * a welcome step, what the heichel contains, how to browse it, featured
 * series, and a closing step — with skip, back/next, progress dots, and a
 * "replay tour" option. Seen-tours are remembered in localStorage so the
 * tour is offered once per heichel, never nagging.
 *
 * Tour content is generated live from the feed: the heichels are harvested
 * from the cards currently on screen (display names only — never raw IDs
 * or machine slugs in the UI).
 *
 * Yaakov's rules honored: no !important (styling is in videoTours.css),
 * full keyboard support (Escape dismisses, arrows step), no dark patterns.
 */

const SEEN_KEY = 'awtsmoos-tours-seen:v1';

function loadSeen() {
	try {
		const raw = localStorage.getItem(SEEN_KEY);
		const arr = raw ? JSON.parse(raw) : [];
		return new Set(Array.isArray(arr) ? arr : []);
	} catch (_) {
		return new Set();
	}
}

function saveSeen(seen) {
	try {
		localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
	} catch (_) { /* storage is best effort */ }
}

function escapeHtml(s) {
	return String(s ?? '').replace(/[&<>"']/g, c => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	}[c]));
}

/** Harvest heichels from the cards on screen: id + display name + sample titles. */
function harvestHeichels() {
	const map = new Map();
	document.querySelectorAll('.feed-card[data-post-id]').forEach(card => {
		const id = card.dataset.heichelId || card.dataset.heichel || 'ikar';
		const nameEl = card.querySelector('.feed-card-heichel');
		const titleEl = card.querySelector('.feed-card-title');
		const name = (nameEl && nameEl.textContent.trim()) || 'Heichel';
		if (!map.has(id)) map.set(id, { id, name, samples: [] });
		const rec = map.get(id);
		if (titleEl && rec.samples.length < 3) {
			const t = titleEl.textContent.trim();
			if (t && !rec.samples.includes(t)) rec.samples.push(t);
		}
	});
	return [...map.values()];
}

function tourSteps(h) {
	const samples = h.samples.length
		? h.samples.map(s => `<li>${escapeHtml(s)}</li>`).join('')
		: '<li>Fresh posts arrive here every day.</li>';
	return [
		{
			kicker: 'Welcome',
			title: `Welcome to the ${h.name} heichel`,
			body: `This is your guided walkthrough of the ${h.name} heichel — one of the chambers of the Awtsmoos River. In the next minute you will see what lives here, how to browse it, and where to begin.`
		},
		{
			kicker: 'What it contains',
			title: `What lives in ${h.name}`,
			body: `The ${h.name} heichel gathers posts, translations, and commentary around one world of Torah. Every post here belongs to a series, so a single idea can be followed from its first line to its last.`,
			list: samples
		},
		{
			kicker: 'How to browse',
			title: 'How to browse the heichel',
			body: `Use the river tabs above — Home, Following, Trending, Discover — and the filters to narrow to this heichel. Tap any card to open the inline reader; long passages open in shiur mode for paced study. React, save, and collect the posts that speak to you.`
		},
		{
			kicker: 'Featured series',
			title: 'Featured series to start with',
			body: `Begin with one of these recent series from ${h.name}:`,
			list: samples
		},
		{
			kicker: 'You are ready',
			title: 'Enjoy the river',
			body: `That is the whole tour. The ${h.name} heichel is open — dive in wherever your eye lands. You can replay this tour any time from the tours menu.`
		}
	];
}

let overlay = null;
let activeHeichel = null;
let stepIndex = 0;
let seen = loadSeen();

function closeTour(markSeen) {
	if (markSeen && activeHeichel) {
		seen.add(activeHeichel.id);
		saveSeen(seen);
	}
	if (overlay) {
		document.removeEventListener('keydown', overlay._onKey);
		overlay.remove();
		overlay = null;
	}
	document.body.classList.remove('vt-open');
	updateTourButton();
}

function renderStep() {
	const steps = tourSteps(activeHeichel);
	const step = steps[stepIndex];
	const body = overlay.querySelector('.vt-body');
	body.innerHTML = `
		<p class="vt-kicker">${escapeHtml(step.kicker)}</p>
		<h2 class="vt-title">${escapeHtml(step.title)}</h2>
		<p class="vt-text">${escapeHtml(step.body)}</p>
		${step.list ? `<ul class="vt-list">${step.list}</ul>` : ''}
		<div class="vt-dots" role="tablist" aria-label="Tour progress">
			${steps.map((_, i) => `
				<button type="button" class="vt-dot${i === stepIndex ? ' is-active' : ''}"
					role="tab" aria-selected="${i === stepIndex}"
					aria-label="Go to step ${i + 1} of ${steps.length}"
					data-vt-goto="${i}"></button>`).join('')}
		</div>`;
	overlay.querySelector('[data-vt-prev]').disabled = stepIndex === 0;
	overlay.querySelector('[data-vt-next]').querySelector('span').textContent =
		stepIndex === steps.length - 1 ? 'Finish tour' : 'Next';
	overlay.querySelectorAll('[data-vt-goto]').forEach(dot => {
		dot.addEventListener('click', () => {
			stepIndex = Number(dot.dataset.vtGoto);
			renderStep();
		});
	});
	const title = overlay.querySelector('.vt-title');
	if (title) title.focus({ preventScroll: true });
}

export function startTour(heichel) {
	closeTour(false);
	activeHeichel = heichel;
	stepIndex = 0;

	overlay = document.createElement('div');
	overlay.className = 'vt-overlay';
	overlay.setAttribute('role', 'dialog');
	overlay.setAttribute('aria-modal', 'true');
	overlay.setAttribute('aria-label', `Guided tour of the ${heichel.name} heichel`);
	overlay.innerHTML = `
		<div class="vt-backdrop" data-vt-dismiss></div>
		<div class="vt-card" role="document">
			<header class="vt-head">
				<span class="vt-heichel">${escapeHtml(heichel.name)}</span>
				<button type="button" class="vt-close" data-vt-dismiss aria-label="Close tour">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
				</button>
			</header>
			<div class="vt-body" tabindex="-1"></div>
			<footer class="vt-foot">
				<button type="button" class="vt-btn vt-btn-ghost" data-vt-skip>Skip tour</button>
				<span class="vt-spacer"></span>
				<button type="button" class="vt-btn" data-vt-prev>Back</button>
				<button type="button" class="vt-btn vt-btn-primary" data-vt-next>
					<span>Next</span>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
				</button>
			</footer>
		</div>`;
	document.body.append(overlay);
	document.body.classList.add('vt-open');

	overlay._onKey = (e) => {
		if (e.key === 'Escape') closeTour(true);
		if (e.key === 'ArrowRight') { stepIndex = Math.min(stepIndex + 1, tourSteps(activeHeichel).length - 1); renderStep(); }
		if (e.key === 'ArrowLeft') { stepIndex = Math.max(stepIndex - 1, 0); renderStep(); }
	};
	document.addEventListener('keydown', overlay._onKey);

	overlay.querySelectorAll('[data-vt-dismiss]').forEach(el => el.addEventListener('click', () => closeTour(true)));
	overlay.querySelector('[data-vt-skip]').addEventListener('click', () => closeTour(true));
	overlay.querySelector('[data-vt-prev]').addEventListener('click', () => {
		stepIndex = Math.max(stepIndex - 1, 0);
		renderStep();
	});
	overlay.querySelector('[data-vt-next]').addEventListener('click', () => {
		const last = tourSteps(activeHeichel).length - 1;
		if (stepIndex >= last) { closeTour(true); return; }
		stepIndex = stepIndex + 1;
		renderStep();
	});

	renderStep();
}

/** Replay any tour on demand — the "replay tour" entry point. */
export function replayTour(heichelId) {
	const hs = harvestHeichels();
	const h = hs.find(x => x.id === heichelId) || hs[0];
	if (!h) return false;
	startTour(h);
	return true;
}

let tourBtn = null;
let tourMenu = null;

function closeMenu() {
	if (tourMenu) { tourMenu.remove(); tourMenu = null; }
	if (tourBtn) tourBtn.setAttribute('aria-expanded', 'false');
	document.removeEventListener('click', onDocClick, true);
}

function onDocClick(e) {
	if (tourMenu && !tourMenu.contains(e.target) && !tourBtn.contains(e.target)) closeMenu();
}

function updateTourButton() {
	if (!tourBtn) return;
	const hs = harvestHeichels();
	const unseen = hs.filter(h => !seen.has(h.id));
	tourBtn.classList.toggle('has-unseen', unseen.length > 0);
	tourBtn.title = unseen.length
		? `Take a guided tour (${unseen.length} new)`
		: 'Guided heichel tours';
}

function openTourMenu() {
	closeMenu();
	const hs = harvestHeichels();
	tourBtn.setAttribute('aria-expanded', 'true');
	tourMenu = document.createElement('div');
	tourMenu.className = 'vt-menu';
	tourMenu.setAttribute('role', 'menu');
	tourMenu.setAttribute('aria-label', 'Guided heichel tours');
	tourMenu.innerHTML = `
		<p class="vt-menu-head">Guided tours</p>
		${hs.length ? hs.map(h => `
			<button type="button" class="vt-menu-item" role="menuitem" data-vt-heichel="${escapeHtml(h.id)}">
				<span class="vt-menu-name">${escapeHtml(h.name)}</span>
				<span class="vt-menu-state">${seen.has(h.id) ? 'Replay' : 'New'}</span>
			</button>`).join('') : '<p class="vt-menu-empty">No heichels on screen yet — tours appear once posts load.</p>'}
	`;
	tourBtn.parentElement.append(tourMenu);
	tourMenu.querySelectorAll('[data-vt-heichel]').forEach(btn => {
		btn.addEventListener('click', () => {
			const h = hs.find(x => x.id === btn.dataset.vtHeichel);
			closeMenu();
			if (h) startTour(h);
		});
	});
	document.addEventListener('click', onDocClick, true);
}

export function initVideoTours() {
	const topbar = document.querySelector('.feed-topbar');
	if (!topbar) return;
	tourBtn = document.createElement('button');
	tourBtn.type = 'button';
	tourBtn.className = 'feed-ic-btn vt-launcher';
	tourBtn.setAttribute('aria-haspopup', 'menu');
	tourBtn.setAttribute('aria-expanded', 'false');
	tourBtn.setAttribute('aria-label', 'Guided heichel tours');
	tourBtn.innerHTML = `
		<svg class="feed-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 5.5v13l10-6.5z"/></svg>
		<span class="feed-ic-btn-label">Tours</span>`;
	tourBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		if (tourMenu) { closeMenu(); return; }
		openTourMenu();
	});
	topbar.append(tourBtn);
	updateTourButton();
	// Refresh the menu data as new cards stream in.
	const river = document.getElementById('feed-river');
	if (river) {
		const mo = new MutationObserver(() => updateTourButton());
		mo.observe(river, { childList: true });
	}
}
