// B"H
/**
 * @module Manuscripts
 * @description
 * B"H — Yaakov 2026-10-13, TRACK G (visual exploration): manuscript viewer.
 * Displays scanned pages of original handwritten manuscripts for a text:
 * zoom and pan via simple CSS transforms, page navigation, and a graceful
 * "manuscript coming soon" state when a text has no scanned pages yet.
 *
 * VERIFIED DRIVE ASSETS ONLY — the viewer never hotlinks external manuscript images.
 * Scanned pages belong under https://awtsmoos.com/api/social/drive/public/awtsfixmvplwhac/repo-image-mirror/geelooy/feed/assets/manuscripts/<text-id>/ and
 * are registered in MANUSCRIPT_REGISTRY below (page files in reading order).
 * The registry is intentionally empty at ship time: every text shows the
 * honest coming-soon state until its pages are scanned and registered.
 *
 * Public API: mount(el, ctx).
 */

import { icon, escapeHtml, escapeAttr } from '../icons.js';

/* ------------------------------------------------------------------ */
/* Registry: textId -> { title, pages: [relative paths] }               */
/* Paths are relative to https://awtsmoos.com/api/social/drive/public/awtsfixmvplwhac/repo-image-mirror/geelooy/feed/assets/manuscripts/.              */
/* ------------------------------------------------------------------ */
/** @type {Record<string, { title: string, pages: string[] }>} */
const MANUSCRIPT_REGISTRY = {
	// Example (leave commented until real scans land):
	// 'tanya-ch01': {
	// 	title: 'Tanya, Chapter 1',
	// 	pages: ['tanya-ch01/page-001.jpg', 'tanya-ch01/page-002.jpg']
	// }
};

const TEXT_CHOICES = [
	{ id: '', label: 'Choose a text…' },
	{ id: 'tanya', label: 'Tanya' },
	{ id: 'likkutei-torah', label: 'Likkutei Torah' },
	{ id: 'torah-ohr', label: 'Torah Ohr' },
	{ id: 'hemshech-5666', label: 'Hemshech 5666 (Samach Vov)' },
	{ id: 'derech-mitzvosecha', label: 'Derech Mitzvosecha' },
	{ id: 'kuntres-umaayan', label: 'Kuntres Umaayan' }
];

function entryFor(textId) {
	return (textId && MANUSCRIPT_REGISTRY[textId]) || null;
}

function comingSoon(el, textLabel) {
	el.innerHTML = `<div class="explore-soon">
		<h3>Manuscript coming soon</h3>
		<p>${textLabel
			? `No handwritten pages have been scanned for <strong>${escapeHtml(textLabel)}</strong> yet.`
			: 'Pick a text above to look for its handwritten manuscript.'}
			Scans are served from verified Awtsmoos Drive custody — this viewer never pulls
			manuscript images from external sites.</p>
	</div>`;
}

/**
 * Mounts the manuscript viewer.
 * @param {HTMLElement} el
 * @param {object} [ctx] { textId }
 */
export function mount(el, ctx = {}) {
	el.innerHTML = '';
	const wrap = document.createElement('div');
	wrap.className = 'msv';
	el.append(wrap);

	const toolbar = document.createElement('div');
	toolbar.className = 'xcmp-toolbar';
	toolbar.innerHTML = `
		<div class="xcmp-postpick">
			<label for="msv-text">Text</label>
			<select id="msv-text" aria-label="Choose a text">
				${TEXT_CHOICES.map(t =>
					`<option value="${escapeAttr(t.id)}"${t.id === ctx.textId ? ' selected' : ''}>${escapeHtml(t.label)}</option>`).join('')}
			</select>
		</div>
		<div class="msv-controls" role="group" aria-label="Viewer controls" hidden>
			<button type="button" class="feed-ic-btn" data-msv="prev" aria-label="Previous page">${icon('chevronUp', 'feed-ic')}</button>
			<span class="msv-pageno" aria-live="polite"></span>
			<button type="button" class="feed-ic-btn" data-msv="next" aria-label="Next page">${icon('chevronDown', 'feed-ic')}</button>
			<button type="button" class="feed-ic-btn msv-txtbtn" data-msv="zoom-out" aria-label="Zoom out">−</button>
			<button type="button" class="feed-ic-btn" data-msv="zoom-in" aria-label="Zoom in">${icon('plus', 'feed-ic')}</button>
			<button type="button" class="feed-ic-btn" data-msv="reset" aria-label="Reset view">${icon('target', 'feed-ic')}</button>
		</div>`;
	wrap.append(toolbar);

	const stage = document.createElement('div');
	stage.className = 'msv-stage';
	wrap.append(stage);

	const select = toolbar.querySelector('#msv-text');
	const controls = toolbar.querySelector('.msv-controls');
	const pageNo = toolbar.querySelector('.msv-pageno');

	let entry = null;
	let page = 0;
	let zoom = 1;
	let panX = 0;
	let panY = 0;

	function applyTransform() {
		const img = stage.querySelector('img');
		if (img) img.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
	}

	function drawPage() {
		if (!entry || !entry.pages.length) return;
		page = Math.max(0, Math.min(entry.pages.length - 1, page));
		zoom = 1; panX = 0; panY = 0;
		const src = `https://awtsmoos.com/api/social/drive/public/awtsfixmvplwhac/repo-image-mirror/geelooy/feed/assets/manuscripts/${entry.pages[page]}`;
		stage.innerHTML = `<img src="${escapeAttr(src)}" alt="Manuscript page ${page + 1} of ${entry.pages.length}: ${escapeAttr(entry.title)}" draggable="false">`;
		const img = stage.querySelector('img');
		img.addEventListener('error', () => {
			stage.innerHTML = `<div class="explore-soon"><h3>Page image missing</h3>
				<p>The registry lists this page, but the scan file is not on the
				server yet. The scan is being prepared.</p></div>`;
		});
		pageNo.textContent = `Page ${page + 1} of ${entry.pages.length}`;
	}

	function render() {
		const textId = select.value;
		const label = TEXT_CHOICES.find(t => t.id === textId)?.label || '';
		entry = entryFor(textId);
		if (!entry || !entry.pages.length) {
			controls.hidden = true;
			comingSoon(stage, label);
			return;
		}
		controls.hidden = false;
		page = 0;
		stage.innerHTML = `<div class="msv-title">${escapeHtml(entry.title)}</div>`;
		drawPage();
	}

	// Controls.
	toolbar.addEventListener('click', (e) => {
		const btn = e.target.closest('[data-msv]');
		if (!btn || !entry) return;
		const act = btn.dataset.msv;
		if (act === 'prev') page -= 1;
		else if (act === 'next') page += 1;
		else if (act === 'zoom-in') zoom = Math.min(4, zoom * 1.25);
		else if (act === 'zoom-out') zoom = Math.max(0.5, zoom / 1.25);
		else if (act === 'reset') { zoom = 1; panX = 0; panY = 0; }
		if (act === 'prev' || act === 'next') drawPage();
		else applyTransform();
	});

	// Keyboard page navigation.
	stage.tabIndex = 0;
	stage.addEventListener('keydown', (e) => {
		if (!entry) return;
		if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { page -= 1; drawPage(); e.preventDefault(); }
		else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { page += 1; drawPage(); e.preventDefault(); }
		else if (e.key === '+' || e.key === '=') { zoom = Math.min(4, zoom * 1.25); applyTransform(); }
		else if (e.key === '-') { zoom = Math.max(0.5, zoom / 1.25); applyTransform(); }
		else if (e.key === '0') { zoom = 1; panX = 0; panY = 0; applyTransform(); }
	});

	// Drag to pan when zoomed.
	let dragging = false, lastX = 0, lastY = 0;
	stage.addEventListener('pointerdown', (e) => {
		if (!entry || zoom <= 1) return;
		dragging = true; lastX = e.clientX; lastY = e.clientY;
		stage.setPointerCapture(e.pointerId);
	});
	stage.addEventListener('pointermove', (e) => {
		if (!dragging) return;
		panX += e.clientX - lastX;
		panY += e.clientY - lastY;
		lastX = e.clientX; lastY = e.clientY;
		applyTransform();
	});
	stage.addEventListener('pointerup', () => { dragging = false; });
	stage.addEventListener('pointercancel', () => { dragging = false; });

	// Wheel to zoom (ctrl/cmd + wheel so plain scrolling still scrolls).
	stage.addEventListener('wheel', (e) => {
		if (!entry || !(e.ctrlKey || e.metaKey)) return;
		e.preventDefault();
		zoom = Math.max(0.5, Math.min(4, zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
		applyTransform();
	}, { passive: false });

	select.addEventListener('change', render);
	render();
}
