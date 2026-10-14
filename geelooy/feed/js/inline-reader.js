// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module InlineReader
 * @description
 * Yaakov 2026-10-13: read posts inline in the river. Clicking a card's
 * body expands the full post right where it sits — lazy-loaded, no
 * navigation away. Every expanded post carries real-name breadcrumbs
 * (Heichel › Series › Post); raw IDs and machine slugs are never shown
 * to the reader. Collapse is always one tap away — healthy reading,
 * no traps.
 */

import { icon, escapeHtml, escapeAttr } from './icons.js';
import { t } from './i18n.js';
import { THEMES, resolvePostTheme, setReaderTheme, isThemeId } from './themes.js';
import { mountRelatedPosts } from './relatedPosts.js';
import { mountAskAI } from './askAI.js';

/** Resolved display names, cached per heichel/series so expands stay instant. */
const nameCache = new Map();

function ids(item) {
	return {
		h: String(item.heichelId || 'ikar'),
		s: String(item.seriesId || 'root'),
		p: String(item.postId || item.id || '')
	};
}

function postUrl(item) {
	const { h, s, p } = ids(item);
	return `/heichelos/${encodeURIComponent(h)}/series/${encodeURIComponent(s)}/${encodeURIComponent(p)}`;
}

function heichelUrl(h) {
	return `/heichelos/${encodeURIComponent(h)}`;
}

function seriesUrl(h, s) {
	return `/heichelos/${encodeURIComponent(h)}/series/${encodeURIComponent(s)}`;
}

async function getJson(url) {
	const res = await fetch(url, { credentials: 'same-origin' });
	if (!res.ok) throw new Error(`answered ${res.status}`);
	const body = await res.json().catch(() => null);
	return body?.success ?? body ?? {};
}

function pickName(record, ...keys) {
	for (const key of keys) {
		const v = record?.[key];
		if (typeof v === 'string' && v.trim()) return v.trim();
	}
	return '';
}

async function resolveHeichelName(h) {
	const key = `h:${h}`;
	if (nameCache.has(key)) return nameCache.get(key);
	let name = '';
	try {
		const info = await getJson(`/api/social/heichelos/${encodeURIComponent(h)}`);
		name = pickName(info, 'name', 'heichelName', 'title');
	} catch (_) { /* fall through to generic label */ }
	const out = name || 'Heichel';
	nameCache.set(key, out);
	return out;
}

async function resolveSeriesName(h, s) {
	const key = `s:${h}:${s}`;
	if (nameCache.has(key)) return nameCache.get(key);
	let name = '';
	if (s && s !== 'root') {
		try {
			const rec = await getJson(`/api/social/heichelos/${encodeURIComponent(h)}/series/${encodeURIComponent(s)}`);
			name = pickName(rec, 'name', 'title', 'seriesName')
				|| pickName(rec?.prateem, 'name', 'title', 'seriesName');
		} catch (_) { /* fall through to generic label */ }
	}
	const out = name || 'Series';
	nameCache.set(key, out);
	return out;
}

/**
 * Light sanitizer for post HTML rendered inline. The full-page reader
 * trusts author HTML; the river renders third-party content inside a
 * shared page, so scripts, embeds, event handlers and javascript: URLs
 * are stripped while formatting survives.
 */
export function sanitizePostHtml(html) {
	let out = String(html ?? '');
	out = out.replace(/<script[\s\S]*?<\/script\s*>/gi, '');
	out = out.replace(/<style[\s\S]*?<\/style\s*>/gi, '');
	out = out.replace(/<(iframe|object|embed|link|meta|base|form|input|button|select|textarea)[\s>][\s\S]*?(?:<\/\1\s*>|\/>|>)/gi, '');
	out = out.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
	out = out.replace(/\s+(href|src|xlink:href)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, ' $1=$2#$2');
	return out;
}

/** Renders the breadcrumb trail: Heichel › Series › Post, all real names, all links. */
function crumbsHtml({ heichelName, seriesName, title, item }) {
	const { h, s } = ids(item);
	const url = postUrl(item);
	return `
	<nav class="feed-crumbs" aria-label="${escapeAttr(t('reader.crumbs'))}">
		<ol>
			<li><a class="feed-crumb" href="${escapeAttr(heichelUrl(h))}">${icon('home', 'feed-crumb-ic')}<span>${escapeHtml(heichelName)}</span></a></li>
			<li aria-hidden="true" class="feed-crumb-sep">›</li>
			<li><a class="feed-crumb" href="${escapeAttr(seriesUrl(h, s))}">${icon('book', 'feed-crumb-ic')}<span>${escapeHtml(seriesName)}</span></a></li>
			<li aria-hidden="true" class="feed-crumb-sep">›</li>
			<li><a class="feed-crumb feed-crumb-current" href="${escapeAttr(url)}" aria-current="page"><span>${escapeHtml(title || 'Post')}</span></a></li>
		</ol>
	</nav>`;
}

function loadingHtml() {
	return `
	<div class="feed-reader-loading" role="status" aria-label="${escapeAttr(t('reader.loadingAria'))}">
		<span class="feed-skel feed-skel-line" style="width:64%"></span>
		<span class="feed-skel feed-skel-line" style="width:92%"></span>
		<span class="feed-skel feed-skel-line" style="width:84%"></span>
		<span class="feed-skel feed-skel-line" style="width:70%"></span>
	</div>`;
}

function failHtml(item) {
	return `
	<div class="feed-reader-fail" role="alert">
		<p>${t('reader.fail')}</p>
		<a class="feed-ic-btn" href="${escapeAttr(postUrl(item))}" target="_blank" rel="noopener">${icon('external')}<span class="feed-ic-btn-label">${t('card.newTab')}</span></a>
	</div>`;
}

function fullBodyHtml(post, item) {
	const html = post.content || post.body || post.html || '';
	if (html && String(html).trim()) return sanitizePostHtml(html);
	const text = post.text || post.excerpt || item.excerpt || item.summary || '';
	if (text && String(text).trim()) {
		return `<p>${escapeHtml(String(text).trim())}</p>`;
	}
	return '';
}

function readerThemePickerHtml(item) {
	const current = resolvePostTheme(item);
	const opts = [`<button type="button" class="feed-menu-item" data-reader-theme-val="auto" role="menuitemradio" aria-checked="${!isReaderOverride(item)}">
		<span class="feed-menu-check">${!isReaderOverride(item) ? icon('check') : ''}</span><span>${t('menu.readingThemeAuto')}</span></button>`];
	for (const t of THEMES) {
		const [c1, c2] = t.swatch;
		const active = isReaderOverride(item) && current === t.id;
		opts.push(`<button type="button" class="feed-menu-item${active ? ' is-active' : ''}" data-reader-theme-val="${t.id}" role="menuitemradio" aria-checked="${active}">
			<span class="feed-menu-check">${active ? icon('check') : ''}</span>
			<span class="feed-theme-swatch" style="background:linear-gradient(135deg, ${c1} 50%, ${c2} 50%)" aria-hidden="true"></span>
			<span>${escapeHtml(t.name)}</span></button>`);
	}
	return opts.join('');
}

function isReaderOverride(item) {
	const h = String(item.heichelId || 'ikar').toLowerCase();
	const p = String(item.postId || item.id || '');
	if (!p) return false;
	try {
		const v = localStorage.getItem(`awtsmoos-reader-theme:${h}:${p}`);
		return isThemeId(v);
	} catch (_) { return false; }
}

let openReaderMenu = null;
function closeReaderMenu() {
	if (openReaderMenu) { openReaderMenu.remove(); openReaderMenu = null; }
	document.removeEventListener('click', onReaderMenuDocClick, true);
	document.removeEventListener('keydown', onReaderMenuDocKey);
}
function onReaderMenuDocClick(event) {
	if (openReaderMenu && !openReaderMenu.contains(event.target) && !event.target.closest('[data-reader-theme-btn]')) {
		closeReaderMenu();
	}
}
function onReaderMenuDocKey(event) {
	if (event.key === 'Escape') closeReaderMenu();
}

function wireReaderThemePicker(toolsEl, item, reader) {
	const btn = toolsEl.querySelector('[data-reader-theme-btn]');
	if (!btn) return;
	btn.addEventListener('click', (event) => {
		event.stopPropagation();
		if (openReaderMenu) { closeReaderMenu(); return; }
		const menu = document.createElement('div');
		menu.className = 'feed-menu feed-reader-theme-menu';
		menu.setAttribute('role', 'menu');
		menu.setAttribute('aria-label', t('reader.themeAria'));
		menu.innerHTML = `<p class="feed-menu-head">${t('menu.readingTheme')}</p>${readerThemePickerHtml(item)}`;
		toolsEl.append(menu);
		openReaderMenu = menu;
		menu.querySelectorAll('[data-reader-theme-val]').forEach(opt => {
			opt.addEventListener('click', (ev) => {
				ev.stopPropagation();
				const val = opt.dataset.readerThemeVal;
				setReaderTheme(item, val === 'auto' ? null : val);
				reader.setAttribute('data-feed-theme', resolvePostTheme(item));
				closeReaderMenu();
			});
		});
		document.addEventListener('click', onReaderMenuDocClick, true);
		document.addEventListener('keydown', onReaderMenuDocKey);
	});
}

/** Collapsible related-posts section inside the expanded reader. Retractable by design. */
function relatedSectionHtml() {
	return `
	<section class="feed-reader-related" data-collapsible>
		<button type="button" class="feed-reader-related-toggle" aria-expanded="false">
			${icon('spark', 'feed-reader-related-ic')}<span>${t('related.title')}</span>${icon('chevronDown', 'feed-reader-related-chev')}
		</button>
		<div class="feed-reader-related-body" hidden></div>
	</section>`;
}

function wireRelatedSection(body, item, card) {
	const section = body.querySelector('.feed-reader-related');
	if (!section) return;
	const toggle = section.querySelector('.feed-reader-related-toggle');
	const slot = section.querySelector('.feed-reader-related-body');
	let mounted = false;
	toggle.addEventListener('click', async (event) => {
		event.stopPropagation();
		const open = toggle.getAttribute('aria-expanded') === 'true';
		toggle.setAttribute('aria-expanded', String(!open));
		slot.hidden = open;
		if (!open && !mounted) {
			mounted = true;
			try {
				const candidates = Array.isArray(card._feedCandidates) ? card._feedCandidates : null;
				await mountRelatedPosts({ container: slot, post: item, candidates, title: t('related.title') });
			} catch (_) {
				slot.innerHTML = `<p class="feed-reader-note">${t('reader.relatedFail')}</p>`;
			}
		}
	});
}

async function loadExpanded(card, item, reader) {
	const body = reader.querySelector('.feed-reader-inner');
	body.innerHTML = loadingHtml();
	// B"H — Yaakov 2026-10-13: the reader wears the post's theme (author's
	// choice, else heichel default, else your global theme).
	reader.setAttribute('data-feed-theme', resolvePostTheme(item));
	const { h, s, p } = ids(item);
	try {
		const [post, heichelName, seriesName] = await Promise.all([
			getJson(`/api/social/heichelos/${encodeURIComponent(h)}/series/${encodeURIComponent(s)}/post/${encodeURIComponent(p)}`),
			resolveHeichelName(h),
			item.seriesName ? Promise.resolve(item.seriesName) : resolveSeriesName(h, s)
		]);
		const title = post.title || item.title || 'Post';
		const content = fullBodyHtml(post, item);
		body.innerHTML = `
			${crumbsHtml({ heichelName, seriesName, title, item })}
			<div class="feed-reader-head">
				<div class="feed-reader-titles">
					<h2 class="feed-reader-title" dir="auto">${escapeHtml(title)}</h2>
					${post.heTitle || item.heTitle ? `<p class="feed-reader-hetitle" dir="rtl" lang="he">${escapeHtml(post.heTitle || item.heTitle)}</p>` : ''}
				</div>
				<div class="feed-reader-tools" role="toolbar" aria-label="Reader tools">
					<button type="button" class="feed-ic-btn" data-reader-theme-btn aria-label="${escapeAttr(t('reader.themeAria'))}" aria-haspopup="menu">${icon('image')}<span class="feed-ic-btn-label">${t('reader.themeBtn')}</span></button>
					<a class="feed-ic-btn feed-card-open" href="${escapeAttr(postUrl(item))}" target="_blank" rel="noopener" aria-label="${escapeAttr(t('card.newTab'))}">${icon('external')}<span class="feed-ic-btn-label">${t('card.newTab')}</span></a>
					<button type="button" class="feed-ic-btn feed-reader-collapse" aria-label="${escapeAttr(t('reader.collapse'))}">${icon('chevronUp')}<span class="feed-ic-btn-label">${t('reader.collapse')}</span></button>
				</div>
			</div>
			<div class="feed-reader-body" dir="auto">${content || `<p class="feed-reader-note">${t('reader.noText')}</p>`}</div>
			<div class="feed-reader-askai" data-ask-ai-slot></div>
			${relatedSectionHtml()}`;
		body.querySelector('.feed-reader-collapse')?.addEventListener('click', (event) => {
			event.stopPropagation();
			setExpanded(card, item, reader, false);
		});
		wireReaderThemePicker(body.querySelector('.feed-reader-tools'), item, reader);
		wireRelatedSection(body, item, card);
		// B"H — Yaakov 2026-10-13 (TRACK D): Ask-Anything AI on every post.
		mountAskAI(body.querySelector('[data-ask-ai-slot]'), { title, html: content });
	} catch (_) {
		body.innerHTML = failHtml(item);
	}
}

function setExpanded(card, item, reader, expand) {
	const body = card.querySelector('.feed-card-body');
	if (expand) {
		if (card.classList.contains('is-expanded')) return;
		card.classList.add('is-expanded');
		reader.hidden = false;
		body?.setAttribute('aria-expanded', 'true');
		if (!reader.dataset.loaded) {
			reader.dataset.loaded = '1';
			loadExpanded(card, item, reader);
		}
		reader.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
	} else {
		card.classList.remove('is-expanded');
		reader.hidden = true;
		body?.setAttribute('aria-expanded', 'false');
	}
}

/**
 * Wires click-to-expand inline reading onto one rendered card.
 * The card body is a real button; the reader region lazy-loads once.
 */
export function enableInlineReading(card, item) {
	const body = card.querySelector('.feed-card-body');
	const reader = card.querySelector('.feed-reader');
	if (!body || !reader) return;
	const toggle = () => setExpanded(card, item, reader, !card.classList.contains('is-expanded'));
	body.addEventListener('click', (event) => {
		if (event.target.closest('a, button')) return;
		toggle();
	});
	body.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggle();
		}
	});
	card._feedToggleExpand = toggle;
}
