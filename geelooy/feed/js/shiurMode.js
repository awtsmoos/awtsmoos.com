// B"H
/**
 * @module ShiurMode
 * @description
 * B"H — Yaakov 2026-10-13: shiur (presentation) mode. Any feed post becomes
 * a full-screen, slide-like presentation for teaching a class: large
 * typography, one section per slide, keyboard navigation (arrows / Space to
 * advance, Home / End to jump, Esc to exit). A "Present" button is added to
 * every feed card through the feed:card-mounted event.
 *
 * Slide content is derived from the post's title + excerpt (chunked into
 * readable sections) with an opening title slide and a closing discussion
 * slide. Callers may pass richer sections via openShiur(item, { sections }).
 */

import { icon, escapeHtml, escapeAttr } from './icons.js';

let stage = null;
let slides = [];
let index = 0;
let priorFocus = null;

function itemTitle(item) {
	return String(item.title || item.heTitle || 'Untitled');
}

function itemExcerpt(item) {
	return String(item.excerpt || item.summary || item.description || '');
}

/** Split a body of text into slide-sized sections at sentence boundaries. */
function chunkExcerpt(text, maxChars = 420) {
	const clean = String(text).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
	if (!clean) return [];
	const sentences = clean.match(/[^.!?׃]+[.!?׃]+["'”’)]?|\S.*$/g) || [clean];
	const chunks = [];
	let cur = '';
	for (const s of sentences) {
		const t = s.trim();
		if (!t) continue;
		if ((cur + ' ' + t).trim().length > maxChars && cur) {
			chunks.push(cur.trim());
			cur = t;
		} else {
			cur = (cur + ' ' + t).trim();
		}
	}
	if (cur.trim()) chunks.push(cur.trim());
	return chunks;
}

function isHebrew(text) {
	const he = (String(text).match(/[\u0590-\u05FF]/g) || []).length;
	return he > String(text).length * 0.25;
}

function buildSlides(item, opts = {}) {
	const title = itemTitle(item);
	const heTitle = item.heTitle ? String(item.heTitle) : '';
	const chunks = Array.isArray(opts.sections) && opts.sections.length
		? opts.sections
		: chunkExcerpt(itemExcerpt(item));
	const out = [
		{
			kicker: 'Shiur',
			heading: title,
			sub: heTitle,
			kind: 'title'
		}
	];
	chunks.forEach((c, i) => {
		out.push({
			kicker: `Section ${i + 1} of ${chunks.length}`,
			text: c,
			kind: 'text'
		});
	});
	out.push({
		kicker: 'Discuss',
		heading: 'What did we learn?',
		text: 'Share one idea from this shiur in your own words.',
		kind: 'closing'
	});
	return out;
}

function renderSlide() {
	if (!stage) return;
	const slide = slides[index];
	const top = stage.querySelector('.shiur-top');
	top.querySelector('.shiur-count').textContent = `${index + 1} / ${slides.length}`;
	const inner = stage.querySelector('.shiur-slide-inner');
	const rtl = (slide.heading && isHebrew(slide.heading)) || (slide.text && isHebrew(slide.text));
	inner.innerHTML = `
		${slide.kicker ? `<p class="shiur-kicker">${escapeHtml(slide.kicker)}</p>` : ''}
		${slide.heading ? `<h2 class="shiur-heading"${rtl ? ' dir="rtl"' : ''}>${escapeHtml(slide.heading)}</h2>` : ''}
		${slide.sub ? `<p class="shiur-text"${isHebrew(slide.sub) ? ' dir="rtl"' : ''}>${escapeHtml(slide.sub)}</p>` : ''}
		${slide.text && slide.kind !== 'title' ? `<p class="shiur-text"${rtl ? ' dir="rtl"' : ''}>${escapeHtml(slide.text)}</p>` : ''}`;
	const dots = stage.querySelector('.shiur-dots');
	dots.innerHTML = slides.map((_, i) =>
		`<button type="button" class="shiur-dot" data-shiur-dot="${i}" aria-current="${i === index}" aria-label="Go to slide ${i + 1}"></button>`
	).join('');
	dots.querySelectorAll('[data-shiur-dot]').forEach(d => {
		d.addEventListener('click', () => goTo(Number(d.dataset.shiurDot)));
	});
}

function goTo(i) {
	if (!stage) return;
	index = Math.max(0, Math.min(slides.length - 1, i));
	renderSlide();
}

function onKey(event) {
	if (!stage) return;
	const k = event.key;
	if (k === 'Escape') {
		event.preventDefault();
		closeShiur();
		return;
	}
	if (k === 'ArrowRight' || k === ' ' || k === 'PageDown') {
		event.preventDefault();
		goTo(index + 1);
		return;
	}
	if (k === 'ArrowLeft' || k === 'PageUp') {
		event.preventDefault();
		goTo(index - 1);
		return;
	}
	if (k === 'Home') { event.preventDefault(); goTo(0); return; }
	if (k === 'End') { event.preventDefault(); goTo(slides.length - 1); return; }
	if ((k === 'f' || k === 'F') && !event.metaKey && !event.ctrlKey) {
		event.preventDefault();
		toggleFullscreen();
	}
}

function toggleFullscreen() {
	try {
		if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
		else if (stage) stage.requestFullscreen?.().catch(() => {});
	} catch (_) {}
}

export function closeShiur() {
	if (!stage) return;
	document.removeEventListener('keydown', onKey, true);
	stage.remove();
	stage = null;
	slides = [];
	index = 0;
	if (priorFocus && document.contains(priorFocus)) {
		try { priorFocus.focus({ preventScroll: true }); } catch (_) {}
	}
	priorFocus = null;
}

/**
 * Opens full-screen presentation mode for a post.
 * @param {object} item Feed item (title, heTitle, excerpt, ...).
 * @param {object} [opts] { sections?: string[] } — richer slide content.
 */
export function openShiur(item, opts = {}) {
	closeShiur();
	priorFocus = document.activeElement;
	slides = buildSlides(item || {}, opts);
	index = 0;
	stage = document.createElement('div');
	stage.className = 'shiur-stage';
	stage.setAttribute('role', 'dialog');
	stage.setAttribute('aria-modal', 'true');
	stage.setAttribute('aria-label', `Shiur presentation: ${itemTitle(item)}`);
	stage.innerHTML = `
		<div class="shiur-top">
			${icon('present')}
			<span class="shiur-title">${escapeHtml(itemTitle(item))}</span>
			<span class="shiur-count"></span>
			<span class="grow"></span>
			<button type="button" class="shiur-iconbtn" data-shiur-full aria-label="Toggle full screen">${icon('eye')}<span>Full screen</span></button>
			<button type="button" class="shiur-iconbtn" data-shiur-prev aria-label="Previous slide">${icon('chevronUp')}<span>Back</span></button>
			<button type="button" class="shiur-iconbtn" data-shiur-next aria-label="Next slide"><span>Next</span>${icon('chevronDown')}</button>
			<button type="button" class="shiur-iconbtn" data-shiur-close aria-label="Exit presentation (Esc)">${icon('close')}<span>Exit</span></button>
		</div>
		<div class="shiur-slide"><div class="shiur-slide-inner"></div></div>
		<div class="shiur-nav"><div class="shiur-dots" role="tablist" aria-label="Slides"></div></div>
		<p class="shiur-hint">Arrows or Space to move · F for full screen · Esc to exit</p>`;
	document.body.append(stage);
	stage.querySelector('[data-shiur-close]').addEventListener('click', closeShiur);
	stage.querySelector('[data-shiur-prev]').addEventListener('click', () => goTo(index - 1));
	stage.querySelector('[data-shiur-next]').addEventListener('click', () => goTo(index + 1));
	stage.querySelector('[data-shiur-full]').addEventListener('click', toggleFullscreen);
	document.addEventListener('keydown', onKey, true);
	renderSlide();
	stage.querySelector('[data-shiur-next]')?.focus({ preventScroll: true });
}

let hooksWired = false;

/** Adds the "Present" button to every feed card. Called by the learning hub. */
export function initCardHooks() {
	if (hooksWired) return;
	hooksWired = true;
	document.addEventListener('feed:card-mounted', (event) => {
		const { card, item } = event.detail || {};
		if (!card || !item) return;
		const actions = card.querySelector('.feed-card-actions');
		if (!actions || actions.querySelector('[data-shiur-present]')) return;
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'feed-ic-btn';
		btn.dataset.shiurPresent = '1';
		btn.setAttribute('aria-label', `Present as a shiur: ${itemTitle(item)}`);
		btn.setAttribute('title', 'Present as a shiur');
		btn.innerHTML = `${icon('present')}<span class="feed-ic-btn-label">Present</span>`;
		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			openShiur(item);
		});
		const spacer = actions.querySelector('.feed-card-actions-spacer');
		if (spacer) spacer.before(btn);
		else actions.append(btn);
	});
}

/** Hub tab: explains shiur mode and opens the top visible post as a demo. */
export async function mount(el, ctx) {
	el.innerHTML = `
		<div class="learn-empty">${icon('present')}
			<h3>Shiur mode</h3>
			<p>Turn any post into a full-screen classroom presentation — large type, one section per slide, arrow keys to move.</p>
			<p>Look for the <strong>Present</strong> button on any post card.</p>
		</div>
		<div class="learn-row">
			<button type="button" class="learn-btn primary" data-shiur-demo>${icon('present')}<span>Try it on the first post</span></button>
		</div>`;
	el.querySelector('[data-shiur-demo]').addEventListener('click', () => {
		const card = document.querySelector('.feed-card');
		const title = card?.querySelector('.feed-card-title')?.textContent?.trim() || 'Awtsmoos';
		const excerpt = card?.querySelector('.feed-card-excerpt')?.textContent?.trim() || '';
		const heTitle = card?.querySelector('.feed-card-hetitle')?.textContent?.trim() || '';
		openShiur({ title, excerpt, heTitle });
	});
}
