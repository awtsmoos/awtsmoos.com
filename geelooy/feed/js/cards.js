// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module FeedCards
 * @description
 * Yaakov 2026-10-11: the river's cards are rich vessels — author presence,
 * bilingual title, excerpt, media, live counts, rank shimmer, and a full
 * action bar. Depth comes from pure CSS (layered shadow stacks, gradient
 * top-light, perspective tilt on hover) — no WebGL anywhere.
 */

import { icon, iconButton, formatCount, timeAgo, escapeHtml, escapeAttr } from './icons.js';
import { t } from './i18n.js';
import { kidsBadgeHtml } from './kidsMode.js';
import { enableInlineReading } from './inline-reader.js';
import { THEMES, setPostTheme, resolvePostTheme, isThemeId } from './themes.js';
import { renderCollectionPicker } from './collections.js';

function authorName(item) {
	return item.authorName || item.aliasName || item.aliasId || item.author || 'Awtsmoos';
}

function currentAlias() {
	return window.curAlias || window.currentAlias ||
		document.body?.dataset?.aliasId ||
		localStorage.getItem('awtsmoos-alias') || 'anonymous';
}

function authorInitials(name) {
	const words = String(name).trim().split(/\s+/).slice(0, 2);
	return words.map(w => (w[0] || '').toUpperCase()).join('') || 'א';
}

function postHref(item) {
	const h = item.heichelId || 'ikar';
	const s = item.seriesId || 'root';
	const p = item.postId || item.id || '';
	return `/heichelos/${encodeURIComponent(h)}/series/${encodeURIComponent(s)}/${encodeURIComponent(p)}`;
}

function aliasHref(item) {
	const a = item.aliasId || item.author || '';
	return a ? `/@${encodeURIComponent(a)}` : '#';
}

function mediaHtml(item) {
	const media = item.media || item.attachments || [];
	const list = Array.isArray(media) ? media : (media ? [media] : []);
	const thumb = list.find(m => m && (m.thumbnail || m.url)) || null;
	if (!thumb && !item.image) return '';
	const url = thumb ? (thumb.thumbnail || thumb.url) : item.image;
	const kind = thumb && thumb.kind === 'video' ? 'video' : 'image';
	return `<a class="feed-card-media" href="${escapeAttr(postHref(item))}" tabindex="-1" aria-hidden="true">
		<img src="${escapeAttr(url)}" alt="" loading="lazy" decoding="async">
		<span class="feed-card-media-kind">${icon(kind)}</span>
		<span class="feed-card-media-sheen" aria-hidden="true"></span>
	</a>`;
}

function excerptHtml(item) {
	const text = item.excerpt || item.summary || item.description || '';
	if (!text) return '';
	const clean = String(text).replace(/<[^>]*>/g, '').trim().slice(0, 320);
	if (!clean) return '';
	return `<p class="feed-card-excerpt" dir="auto">${escapeHtml(clean)}</p>`;
}

/**
 * Renders one ranked feed item as a rich card element.
 * @param {object} item Normalized feed item (postId, title, aliasId, ...).
 * @param {object} [opts]
 * @returns {HTMLElement}
 */
export function renderFeedCard(item = {}, opts = {}) {
	const rank = typeof item._rankScore === 'number' ? item._rankScore : null;
	const trend = typeof item._trendScore === 'number' ? item._trendScore : null;
	const score = rank !== null ? rank : trend;
	const card = document.createElement('article');
	card.className = 'feed-card feed-3d';
	card.dataset.postId = String(item.postId || item.id || '');
	card.dataset.aliasId = String(item.aliasId || item.author || '');
	card.tabIndex = 0;
	card.setAttribute('role', 'article');
	card.setAttribute('aria-label', String(item.title || 'Post'));

	const scoreBadge = score !== null && score > 0.02
		? `<span class="feed-card-rank" title="${escapeAttr(t('card.rankTitle'))}"><span class="feed-card-rank-bar" style="width:${Math.round(Math.min(1, score) * 100)}%"></span></span>`
		: '';

	card.innerHTML = `
		<div class="feed-card-light" aria-hidden="true"></div>
		<header class="feed-card-head">
			<a class="feed-card-avatar" href="${escapeAttr(aliasHref(item))}" tabindex="-1" aria-hidden="true">
				<span class="feed-card-avatar-initials">${escapeHtml(authorInitials(authorName(item)))}</span>
				<span class="feed-card-avatar-ring" aria-hidden="true"></span>
			</a>
			<div class="feed-card-meta">
				<a class="feed-card-author" href="${escapeAttr(aliasHref(item))}">${escapeHtml(authorName(item))}</a>
				<div class="feed-card-sub">
					<time datetime="${escapeAttr(new Date(Number(item.updatedAt) || Date.now()).toISOString())}">${timeAgo(item.updatedAt || item.createdAt)}</time>
					<span class="feed-card-dot" aria-hidden="true">·</span>
					<span class="feed-card-heichel">${escapeHtml(item.heichelName || item.heichelId || '')}</span>
				</div>
			</div>
			<button type="button" class="feed-ic-btn feed-card-more" aria-label="${escapeAttr(t('card.moreOptions'))}">${icon('more')}</button>
		</header>
		<div class="feed-card-body feed-card-body-expand" role="button" tabindex="0" aria-expanded="false" aria-label="${escapeAttr(t('card.readFull', { title: item.title || 'Untitled' }))}" data-expand>
			<h3 class="feed-card-title" dir="auto">${escapeHtml(item.title || 'Untitled')}</h3>
			${item.heTitle ? `<p class="feed-card-hetitle" dir="rtl" lang="he">${escapeHtml(item.heTitle)}</p>` : ''}
			${excerptHtml(item)}
			${kidsBadgeHtml(item)}
			<span class="feed-card-readmore">${icon('chevronDown', 'feed-card-readmore-ic')}<span>${t('card.readMore')}</span></span>
		</div>
		<div class="feed-reader" hidden><div class="feed-reader-inner"></div></div>
		${mediaHtml(item)}
		<footer class="feed-card-actions" role="toolbar" aria-label="Post actions">
			${reactionGroupHtml(item)}
			${iconButton({ icon: 'comment', label: t('card.comment'), act: 'comment', count: item.commentCount || item.comments || 0 })}
			${iconButton({ icon: 'share', label: t('card.share'), act: 'share', count: item.shareCount || 0 })}
			<span class="feed-card-actions-spacer"></span>
			${iconButton({ icon: 'save', label: t('card.save'), act: 'save', active: !!item.viewerSaved, extraClass: 'feed-card-save' })}
			<a class="feed-ic-btn feed-card-open" href="${escapeAttr(postHref(item))}" target="_blank" rel="noopener" aria-label="${escapeAttr(t('card.newTab'))}">${icon('external')}<span class="feed-ic-btn-label">${t('card.newTab')}</span></a>
		</footer>
		${scoreBadge}`;

	const commentsThread = createCommentThread(item, opts);
	card.append(commentsThread.section);

	const actions = card.querySelector('.feed-card-actions');
	const reactionControl = createReactionControl(item, opts);
	const reactWrap = actions.querySelector('.feed-react-wrap');
	if (reactWrap) {
		ensureReactCloser();
		reactWrap.addEventListener('click', (event) => reactionControl.onClick(event, reactWrap));
		reactionControl.hydrate(reactWrap);
	}
	actions.addEventListener('click', (event) => {
		if (event.target.closest('.feed-react-wrap')) return; // reactions handle their own clicks
		const btn = event.target.closest('.feed-ic-btn');
		if (!btn || btn.disabled) return;
		event.stopPropagation();
		/* B"H — TRACK E: compare the stable data-act key, never the translated label. */
		const act = btn.dataset.act || btn.getAttribute('aria-label') || '';
		if (act === 'save') {
			const pressed = btn.classList.toggle('is-active');
			btn.setAttribute('aria-pressed', String(pressed));
			opts.onSave?.(item, pressed);
		} else if (act === 'comment') {
			commentsThread.toggle(btn);
		} else {
			opts.onAction?.(act, item, btn);
		}
	});

	card.addEventListener('keydown', (event) => {
		if ((event.key === 'Enter' || event.key === ' ') && event.target === card) {
			event.preventDefault();
			card._feedToggleExpand?.();
		}
	});

	enableInlineReading(card, item);
	attachMoreMenu(card, item);

	/* B"H — Yaakov 2026-10-13: learning-track extension point. Modules such
	   as shiurMode and sourceSheets listen for this event and attach their
	   per-card buttons without touching this file again. */
	try {
		card.dispatchEvent(new CustomEvent('feed:card-mounted', {
			detail: { card, item },
			bubbles: true
		}));
	} catch (_) {}

	return card;
}

/* ============ more-options menu + author post theme (Yaakov 2026-10-13) ============ */
/* B"H — the ⋯ button opens a real menu. The author can pick this post's
   reading theme; everyone gets Copy link / Open / Share. The menu is
   retractable: outside click or Escape closes it. */

let openCardMenu = null;

function closeCardMenu() {
	if (openCardMenu) { openCardMenu.remove(); openCardMenu = null; }
	document.removeEventListener('click', onCardMenuDocClick, true);
	document.removeEventListener('keydown', onCardMenuDocKey);
}

function onCardMenuDocClick(event) {
	if (openCardMenu && !openCardMenu.contains(event.target) && !event.target.closest('.feed-card-more')) {
		closeCardMenu();
	}
}

function onCardMenuDocKey(event) {
	if (event.key === 'Escape') closeCardMenu();
}

function themeMenuItems(item) {
	const current = resolvePostTheme(item);
	return THEMES.map(t => {
		const [c1, c2] = t.swatch;
		const active = current === t.id;
		return `<button type="button" class="feed-menu-item${active ? ' is-active' : ''}" data-post-theme="${t.id}" role="menuitemradio" aria-checked="${active}">
			<span class="feed-menu-check">${active ? icon('check') : ''}</span>
			<span class="feed-theme-swatch" style="background:linear-gradient(135deg, ${c1} 50%, ${c2} 50%)" aria-hidden="true"></span>
			<span>${escapeHtml(t.name)}</span>
		</button>`;
	}).join('');
}

function attachMoreMenu(card, item) {
	const btn = card.querySelector('.feed-card-more');
	if (!btn) return;
	btn.addEventListener('click', (event) => {
		event.stopPropagation();
		if (openCardMenu?.dataset?.forPost === card.dataset.postId) {
			closeCardMenu();
			return;
		}
		closeCardMenu();
		const isAuthor = currentAlias() && currentAlias() !== 'anonymous' &&
			String(item.aliasId || item.author || '') === String(currentAlias());
		const menu = document.createElement('div');
		menu.className = 'feed-menu feed-card-menu';
		menu.dataset.forPost = card.dataset.postId || '';
		menu.setAttribute('role', 'menu');
		menu.innerHTML = `
			${isAuthor ? `<p class="feed-menu-head">${t('menu.postTheme')}</p>
			<div class="feed-menu-themes" role="group" aria-label="${escapeAttr(t('menu.postTheme'))}">${themeMenuItems(item)}</div>
			<hr class="feed-menu-sep">` : ''}
			<button type="button" class="feed-menu-item" data-menu-act="copy" role="menuitem">${icon('link', 'feed-menu-ic')}<span>${t('menu.copyLink')}</span></button>
			<button type="button" class="feed-menu-item" data-menu-act="save-collection" role="menuitem">${icon('folder', 'feed-menu-ic')}<span>Save to collection</span></button>
			<button type="button" class="feed-menu-item" data-menu-act="print" role="menuitem">${icon('printer', 'feed-menu-ic')}<span>Print</span></button>
			<a class="feed-menu-item" data-menu-act="open" role="menuitem" href="${escapeAttr(postHref(item))}" target="_blank" rel="noopener">${icon('external', 'feed-menu-ic')}<span>${t('menu.openNewTab')}</span></a>
			<button type="button" class="feed-menu-item" data-menu-act="share" role="menuitem">${icon('share', 'feed-menu-ic')}<span>${t('menu.share')}</span></button>`;
		card.append(menu);
		openCardMenu = menu;

		menu.querySelectorAll('[data-post-theme]').forEach(opt => {
			opt.addEventListener('click', (ev) => {
				ev.stopPropagation();
				const themeId = opt.dataset.postTheme;
				if (isThemeId(themeId) && setPostTheme(item, themeId)) {
					item.theme = themeId;
					const reader = card.querySelector('.feed-reader');
					if (reader && !reader.hidden) {
						reader.setAttribute('data-feed-theme', themeId);
					}
				}
				closeCardMenu();
			});
		});
		menu.querySelector('[data-menu-act="copy"]')?.addEventListener('click', (ev) => {
			ev.stopPropagation();
			const url = location.origin + postHref(item);
			try {
				navigator.clipboard?.writeText(url);
			} catch (_) {
				const ta = document.createElement('textarea');
				ta.value = url;
				document.body.append(ta);
				ta.select();
				try { document.execCommand('copy'); } catch (_) {}
				ta.remove();
			}
			closeCardMenu();
		});
		menu.querySelector('[data-menu-act="share"]')?.addEventListener('click', (ev) => {
			ev.stopPropagation();
			const url = location.origin + postHref(item);
			if (navigator.share) {
				navigator.share({ title: item.title || 'Awtsmoos post', url }).catch(() => {});
			} else {
				try { navigator.clipboard?.writeText(url); } catch (_) {}
			}
			closeCardMenu();
		});
		menu.querySelector('[data-menu-act="open"]')?.addEventListener('click', () => closeCardMenu());
		/* B"H — Yaakov 2026-10-14: Save to collection. The picker swaps the
		   menu's contents; "Back" returns to the base menu by rebuilding it. */
		menu.querySelector('[data-menu-act="save-collection"]')?.addEventListener('click', (ev) => {
			ev.stopPropagation();
			renderCollectionPicker(menu, item, () => {
				closeCardMenu();
				btn.click();
			});
		});
		/* B"H — Yaakov 2026-10-14: single-post printing (TRACK A). */
		menu.querySelector('[data-menu-act="print"]')?.addEventListener('click', (ev) => {
			ev.stopPropagation();
			printCard(card, item);
		});

		document.addEventListener('click', onCardMenuDocClick, true);
		document.addEventListener('keydown', onCardMenuDocKey);
	});
}

/* B"H — Yaakov 2026-10-14: single-post printing. The focused card prints
   alone; afterprint always cleans up so the river is never left hidden. */
function printCard(card, item) {
	closeCardMenu();
	card.classList.add('feed-print-focus');
	card.dataset.printUrl = location.origin + postHref(item);
	document.body.classList.add('feed-print-one');
	let done = false;
	const cleanup = () => {
		if (done) return;
		done = true;
		card.classList.remove('feed-print-focus');
		delete card.dataset.printUrl;
		document.body.classList.remove('feed-print-one');
		window.removeEventListener('afterprint', cleanup);
	};
	window.addEventListener('afterprint', cleanup);
	window.print();
	/* afterprint is unreliable when the dialog is cancelled in some
	   browsers — the fallback restores the river regardless. */
	setTimeout(cleanup, 3000);
}

/* ============ yarmulke emoji reactions (Yaakov 2026-10-13) ============ */
/* B"H — the full yarmulke emoji set as reactions. The picker shows ANIMATED
   VIDEO LOOPS (MP4) as live previews; counts render as image chips. Clicking
   the counts opens the who-reacted list. Reaction ids are the emoji file
   base names; the server stores them as the reaction kind string. */

const EMOJI_BASE = '/feed/assets/emojis';

const YARMULKE_EMOJIS = [
	{ id: 'laughing', name: 'laughter' },
	{ id: 'love', name: 'love' },
	{ id: 'thumbsup', name: 'thumbs up' },
	{ id: 'praying', name: 'prayer' },
	{ id: 'crying', name: 'tears' },
	{ id: 'surprised', name: 'wow' },
	{ id: 'angry', name: 'anger' },
	{ id: 'sad', name: 'sadness' },
	{ id: 'dancing', name: 'dancing' },
	{ id: 'fire', name: 'fire' },
	{ id: 'star-eyes', name: 'amazed' },
	{ id: 'holding-back-tears', name: 'moved' },
	{ id: 'hug', name: 'hug' },
	{ id: 'thinking', name: 'thinking' },
	{ id: 'guy-thumbsup', name: 'approval' },
	{ id: 'guy-cheering', name: 'celebration' },
	{ id: 'guy-facepalm', name: 'facepalm' },
	{ id: 'guy-shrug', name: 'shrug' },
	{ id: 'clapping', name: 'applause' },
	{ id: 'tada', name: 'party' },
	{ id: 'crown', name: 'royal' },
	{ id: 'bulb', name: 'idea' },
	{ id: 'eyes', name: 'watching' },
	{ id: 'muscle', name: 'strength' },
	{ id: 'handshake', name: 'agreement' },
	{ id: 'ok-hand', name: 'okay' },
	{ id: 'wave', name: 'hello' },
	{ id: 'popcorn', name: 'popcorn' },
	{ id: 'sleeping', name: 'sleepy' },
	{ id: 'smirk', name: 'smirk' },
	{ id: 'zany-face', name: 'silly' },
	{ id: 'nerd-face', name: 'nerdy' },
	{ id: 'pleading-face', name: 'pleading' },
	{ id: 'partying-face', name: 'partying' },
	{ id: 'mind-blown', name: 'mind blown' },
	{ id: 'question-mark', name: 'question' },
	{ id: 'monocle', name: 'scrutiny' },
	{ id: 'pinched-fingers', name: 'what do you mean' },
	{ id: 'raised-eyebrow', name: 'skeptical' }
];

const EMOJI_BY_ID = Object.fromEntries(YARMULKE_EMOJIS.map(e => [e.id, e]));
const REACTION_NAMES = Object.fromEntries(YARMULKE_EMOJIS.map(e => [e.id, e.name]));
/* Legacy unicode reactions map onto their yarmulke equivalents. */
const LEGACY_REACTION_MAP = { '👍': 'thumbsup', '❤️': 'love', '😂': 'laughing', '😮': 'surprised', '🙏': 'praying', '✨': 'star-eyes' };

function emojiImg(id, cls = '') {
	const e = EMOJI_BY_ID[id];
	if (!e) return '';
	return `<img class="feed-emoji-img ${cls}" src="${EMOJI_BASE}/${id}.png" alt="${escapeAttr(e.name)}" loading="lazy" decoding="async" draggable="false">`;
}

function emojiVideo(id, cls = '') {
	const e = EMOJI_BY_ID[id];
	if (!e) return '';
	return `<video class="feed-emoji-video ${cls}" muted loop playsinline preload="none" poster="${EMOJI_BASE}/${id}.png" data-video-src="${EMOJI_BASE}/${id}.mp4" aria-hidden="true" tabindex="-1"></video>`;
}

function normalizeReactionId(raw) {
	const s = String(raw || '');
	return EMOJI_BY_ID[s] ? s : (LEGACY_REACTION_MAP[s] || '');
}

function initialReactionSummary(item) {
	const counts = {};
	const reactors = [];
	const norm = (raw) => normalizeReactionId(raw);
	if (item.reactionSummary && typeof item.reactionSummary === 'object') {
		for (const [k, v] of Object.entries(item.reactionSummary.counts || {})) {
			const id = norm(k);
			if (id) counts[id] = (counts[id] || 0) + Number(v || 0);
		}
		if (Array.isArray(item.reactionSummary.reactors)) {
			for (const r of item.reactionSummary.reactors) {
				const id = norm(r.emoji || r.kind);
				if (id) reactors.push({ aliasId: String(r.aliasId || ''), aliasName: String(r.aliasName || r.aliasId || 'Someone'), emoji: id });
			}
		}
		return { counts, viewerEmoji: norm(item.reactionSummary.viewerEmoji), reactors };
	}
	if (item.reactionCounts && typeof item.reactionCounts === 'object') {
		for (const [k, v] of Object.entries(item.reactionCounts)) {
			const id = norm(k);
			if (id) counts[id] = (counts[id] || 0) + Number(v || 0);
		}
	}
	if (Array.isArray(item.reactors)) {
		for (const r of item.reactors) {
			const id = norm(r.emoji || r.kind);
			if (id) reactors.push({ aliasId: String(r.aliasId || ''), aliasName: String(r.aliasName || r.aliasId || 'Someone'), emoji: id });
		}
	}
	const legacy = Number(item.reactionCount ?? item.likes ?? 0);
	if (legacy > 0 && !Object.keys(counts).length) counts['thumbsup'] = legacy;
	return { counts, viewerEmoji: norm(item.viewerReaction || item.viewerEmoji || (item.viewerLiked ? 'thumbsup' : '')), reactors };
}

function topReactions(summary, limit = 3) {
	return Object.entries(summary.counts || {})
		.filter(([, n]) => Number(n) > 0)
		.sort((a, b) => Number(b[1]) - Number(a[1]))
		.slice(0, limit);
}

function reactionChipHtml(emoji, n) {
	const id = normalizeReactionId(emoji);
	if (!id) return '';
	return `<button type="button" class="feed-react-chip" data-react-chip="${escapeAttr(id)}" aria-label="${escapeAttr(t('card.reactCountAria', { count: formatCount(n), name: REACTION_NAMES[id] || 'reactions' }))}">${emojiImg(id)}<span class="feed-react-chip-count">${formatCount(n)}</span></button>`;
}

function reactionGroupHtml(item) {
	const summary = initialReactionSummary(item);
	const viewer = summary.viewerEmoji;
	const face = viewer ? emojiImg(viewer, 'feed-react-face') : icon('like');
	return `<div class="feed-react-wrap" data-react-wrap data-picker-open="0">
		<button type="button" class="feed-ic-btn feed-react-btn${viewer ? ' is-active' : ''}" data-react-toggle aria-haspopup="menu" aria-expanded="false" aria-pressed="${viewer ? 'true' : 'false'}" aria-label="${escapeAttr(viewer ? t('card.reactAriaChange', { name: REACTION_NAMES[viewer] || viewer }) : t('card.reactAria'))}">${face}<span class="feed-ic-btn-label">${viewer ? t('card.reacted') : t('card.react')}</span></button>
		<div class="feed-react-picker" data-react-picker hidden role="menu" aria-label="Choose a reaction">
			${YARMULKE_EMOJIS.map(e => `<button type="button" class="feed-react-option" role="menuitemradio" aria-checked="${e.id === viewer}" data-react-emoji="${escapeAttr(e.id)}" aria-label="React ${escapeAttr(e.name)}" title="${escapeAttr(e.name)}">${emojiVideo(e.id)}${emojiImg(e.id)}</button>`).join('')}
		</div>
		<span class="feed-react-top" data-react-top>${topReactions(summary).map(([e, n]) => reactionChipHtml(e, n)).join('')}</span>
		<div class="feed-react-who" data-react-who hidden role="dialog" aria-label="${escapeAttr(t('comments.reactions'))}"></div>
	</div>`;
}

/** One document-level closer for every open picker (bound once). */
let reactCloserBound = false;
function ensureReactCloser() {
	if (reactCloserBound) return;
	reactCloserBound = true;
	document.addEventListener('click', (event) => {
		document.querySelectorAll('.feed-react-wrap[data-picker-open="1"]').forEach(wrap => {
			if (!wrap.contains(event.target)) closeReactPicker(wrap);
		});
		document.querySelectorAll('.feed-react-who:not([hidden])').forEach(box => {
			if (!box.closest('.feed-react-wrap')?.contains(event.target)) {
				box.hidden = true;
				box.innerHTML = '';
			}
		});
	});
	document.addEventListener('keydown', (event) => {
		if (event.key !== 'Escape') return;
		document.querySelectorAll('.feed-react-wrap[data-picker-open="1"]').forEach(closeReactPicker);
		document.querySelectorAll('.feed-react-who:not([hidden])').forEach(box => {
			box.hidden = true;
			box.innerHTML = '';
		});
	});
}

function closeReactPicker(wrap) {
	if (!wrap) return;
	wrap.dataset.pickerOpen = '0';
	const picker = wrap.querySelector('[data-react-picker]');
	if (picker) {
		picker.hidden = true;
		picker.querySelectorAll('video').forEach(v => { try { v.pause(); } catch (_) {} });
	}
	wrap.querySelector('[data-react-toggle]')?.setAttribute('aria-expanded', 'false');
}

/**
 * Owns one card's reaction state: optimistic toggle, server persistence,
 * and count chips. Cards pass { viewerAlias, onReaction } through opts.
 */
function createReactionControl(item, opts = {}) {
	const postId = String(item.postId || item.id || '');
	const heichelId = String(item.heichelId || 'ikar');
	const aliasId = String(opts.viewerAlias || item.viewerAliasId || currentAlias());
	const state = {
		summary: initialReactionSummary(item),
		hydrated: !!item.reactionSummary,
		pending: false
	};

	function render(wrap) {
		const viewer = state.summary.viewerEmoji;
		const toggle = wrap.querySelector('[data-react-toggle]');
		if (toggle) {
			toggle.classList.toggle('is-active', !!viewer);
			toggle.setAttribute('aria-pressed', String(!!viewer));
			toggle.setAttribute('aria-label', viewer
				? t('card.reactAriaChange', { name: REACTION_NAMES[viewer] || viewer })
				: t('card.reactAria'));
			toggle.querySelector('.feed-react-face, .feed-emoji-img, .feed-ic')?.remove();
			const face = document.createElement('span');
			face.setAttribute('aria-hidden', 'true');
			if (viewer) {
				face.className = 'feed-react-face';
				face.innerHTML = emojiImg(viewer);
			} else {
				face.innerHTML = icon('like');
			}
			toggle.prepend(face);
			const label = toggle.querySelector('.feed-ic-btn-label');
			if (label) label.textContent = viewer ? t('card.reacted') : t('card.react');
		}
		wrap.querySelectorAll('[data-react-picker] [data-react-emoji]').forEach(option => {
			option.setAttribute('aria-checked', String(option.dataset.reactEmoji === viewer));
		});
		const top = wrap.querySelector('[data-react-top]');
		if (top) top.innerHTML = topReactions(state.summary).map(([e, n]) => reactionChipHtml(e, n)).join('');
	}

	function noteFailure(wrap, message) {
		const toggle = wrap.querySelector('[data-react-toggle]');
		if (!toggle) return;
		const prev = toggle.getAttribute('aria-label');
		toggle.setAttribute('aria-label', message);
		toggle.classList.add('feed-react-error');
		setTimeout(() => {
			toggle.classList.remove('feed-react-error');
			if (toggle.getAttribute('aria-label') === message) {
				toggle.setAttribute('aria-label', prev || 'React to this post');
			}
		}, 2600);
	}

	async function persist(emoji) {
		const url = `/api/social/reactions/post/${encodeURIComponent(postId)}`;
		if (emoji) {
			const res = await fetch(url, {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({ aliasId, heichelId, emoji })
			});
			if (!res.ok) throw new Error(`reactions answered ${res.status}`);
			const body = await res.json().catch(() => null);
			return body?.success ?? body ?? null;
		}
		const qs = new URLSearchParams({ aliasId, heichelId });
		const res = await fetch(`${url}?${qs}`, { method: 'DELETE', credentials: 'same-origin' });
		if (!res.ok) throw new Error(`reactions answered ${res.status}`);
		const body = await res.json().catch(() => null);
		return body?.success ?? body ?? null;
	}

	/** Lazily loads live counts + the viewer's stored reaction. */
	async function hydrate(wrap) {
		if (state.hydrated || !postId) return;
		state.hydrated = true;
		try {
			const qs = new URLSearchParams({ heichelId });
			if (aliasId && aliasId !== 'anonymous') qs.set('aliasId', aliasId);
			const res = await fetch(`/api/social/reactions/post/${encodeURIComponent(postId)}?${qs}`, { credentials: 'same-origin' });
			if (!res.ok) return;
			const body = await res.json().catch(() => null);
			const data = body?.success ?? body ?? {};
			if (data && typeof data.counts === 'object') {
				const counts = {};
				for (const [k, v] of Object.entries(data.counts)) {
					const id = normalizeReactionId(k);
					if (id) counts[id] = (counts[id] || 0) + Number(v || 0);
				}
				const reactors = [];
				const rawReactors = data.reactors || data.reactions || [];
				if (Array.isArray(rawReactors)) {
					for (const r of rawReactors) {
						const id = normalizeReactionId(r.emoji || r.kind);
						if (id) reactors.push({ aliasId: String(r.aliasId || ''), aliasName: String(r.aliasName || r.aliasId || 'Someone'), emoji: id });
					}
				}
				state.summary = { counts, viewerEmoji: normalizeReactionId(data.viewerEmoji), reactors: reactors.length ? reactors : state.summary.reactors };
				render(wrap);
			}
		} catch (_) { /* counts stay as first rendered */ }
	}

	/** Who-reacted popup: click a count chip to see who reacted with what. */
	function openWhoReacted(wrap) {
		const box = wrap.querySelector('[data-react-who]');
		if (!box) return;
		if (!box.hidden) { box.hidden = true; box.innerHTML = ''; return; }
		const reactors = state.summary.reactors || [];
		const counts = state.summary.counts || {};
		const total = Object.values(counts).reduce((s, n) => s + Number(n || 0), 0);
		let html = `<div class="feed-react-who-head"><strong>${t('comments.reactions')}</strong><span>${formatCount(total)}</span><button type="button" class="feed-react-who-close" aria-label="${escapeAttr(t('comments.close'))}">✕</button></div>`;
		if (reactors.length) {
			const byEmoji = {};
			for (const r of reactors) (byEmoji[r.emoji] = byEmoji[r.emoji] || []).push(r);
			html += '<ul class="feed-react-who-list">';
			for (const [emoji, list] of Object.entries(byEmoji).sort((a, b) => b[1].length - a[1].length)) {
				for (const r of list.slice(0, 50)) {
					html += `<li class="feed-react-who-row">${emojiImg(emoji, 'feed-react-who-emoji')}<span class="feed-react-who-name">${escapeHtml(r.aliasName)}</span></li>`;
				}
			}
			html += '</ul>';
			if (reactors.length < total) {
				html += `<p class="feed-react-who-more">${t('comments.more', { n: formatCount(total - reactors.length) })}</p>`;
			}
		} else if (total > 0) {
			html += '<ul class="feed-react-who-list">';
			for (const [emoji, n] of topReactions(state.summary, 35)) {
				html += `<li class="feed-react-who-row">${emojiImg(emoji, 'feed-react-who-emoji')}<span class="feed-react-who-name">${formatCount(n)} ${escapeHtml(REACTION_NAMES[emoji] || '')}</span></li>`;
			}
			html += '</ul>';
		} else {
			html += `<p class="feed-react-who-empty">${t('comments.noReactions')}</p>`;
		}
		box.innerHTML = html;
		box.hidden = false;
		box.querySelector('.feed-react-who-close')?.addEventListener('click', (e) => {
			e.stopPropagation();
			box.hidden = true;
			box.innerHTML = '';
		});
	}

	async function choose(wrap, emoji) {
		closeReactPicker(wrap);
		if (state.pending || !postId) return;
		if (aliasId === 'anonymous') {
			noteFailure(wrap, t('comments.signInReact'));
			return;
		}
		const previous = { counts: { ...state.summary.counts }, viewerEmoji: state.summary.viewerEmoji };
		const removing = state.summary.viewerEmoji === emoji;
		const nextEmoji = removing ? '' : emoji;
		state.summary.viewerEmoji = nextEmoji;
		const counts = { ...state.summary.counts };
		if (previous.viewerEmoji) counts[previous.viewerEmoji] = Math.max(0, Number(counts[previous.viewerEmoji] || 0) - 1);
		if (nextEmoji) counts[nextEmoji] = Number(counts[nextEmoji] || 0) + 1;
		state.summary.counts = counts;
		state.pending = true;
		render(wrap);
		try {
			const server = await persist(nextEmoji);
			if (server && typeof server.counts === 'object') {
				state.summary = { counts: server.counts || {}, viewerEmoji: String(server.viewerEmoji || '') };
				render(wrap);
			}
			opts.onReaction?.(item, nextEmoji || null, !!nextEmoji);
		} catch (_) {
			state.summary = previous;
			render(wrap);
			noteFailure(wrap, t('comments.reactFail'));
		} finally {
			state.pending = false;
		}
	}

	function onClick(event, wrap) {
		event.stopPropagation();
		const chip = event.target.closest('[data-react-chip]');
		if (chip) {
			openWhoReacted(wrap);
			return;
		}
		const toggle = event.target.closest('[data-react-toggle]');
		const option = event.target.closest('[data-react-emoji]');
		if (toggle) {
			const open = wrap.dataset.pickerOpen === '1';
			if (open) {
				closeReactPicker(wrap);
			} else {
				document.querySelectorAll('.feed-react-wrap[data-picker-open="1"]').forEach(closeReactPicker);
				wrap.dataset.pickerOpen = '1';
				const picker = wrap.querySelector('[data-react-picker]');
				if (picker) {
					picker.hidden = false;
					/* B"H — Yaakov: live animated previews. Videos load only when the picker opens. */
					picker.querySelectorAll('video[data-video-src]').forEach(v => {
						if (!v.src) {
							v.src = v.dataset.videoSrc;
							v.play().catch(() => {});
						}
					});
				}
				toggle.setAttribute('aria-expanded', 'true');
				wrap.querySelector('.feed-react-option[aria-checked="true"]')?.focus({ preventScroll: true });
			}
			return;
		}
		if (option?.dataset?.reactEmoji) choose(wrap, normalizeReactionId(option.dataset.reactEmoji) || option.dataset.reactEmoji);
	}

	return { onClick, hydrate };
}

/* ============ comment threads (Yaakov 2026-10-13) ============ */
/* B"H — comments live in the social store but the river never asked for
   them, so every card showed 0. Threads load lazily when the reader taps
   Comment, nest at least two levels deep, and carry their own reply forms. */

function commentName(c) {
	return c.authorName || authorName(c);
}

function commentText(c) {
	return String(c.content ?? c.text ?? c.body ?? '').replace(/<[^>]*>/g, '').trim();
}

function commentKey(c) {
	return String(c.id ?? c.commentId ?? '');
}

function commentStamp(c) {
	return Number(c.createdAt ?? c.timestamp ?? c.updatedAt) || 0;
}

function commentReplies(c) {
	const r = c.replies ?? c.children ?? [];
	return Array.isArray(r) ? r : [];
}

function countCommentTree(list) {
	let n = 0;
	for (const c of (Array.isArray(list) ? list : [])) n += 1 + countCommentTree(commentReplies(c));
	return n;
}

/**
 * Builds the lazy comment-thread section for one feed card.
 * @param {object} item The feed item (heichelId, postId).
 * @param {object} opts Card opts: { fetchComments, submitComment }.
 * @returns {{section: HTMLElement, toggle: Function}}
 */
function createCommentThread(item, opts = {}) {
	const heichelId = String(item.heichelId || 'ikar');
	const postId = String(item.postId || item.id || '');
	const state = { open: false, loading: false, loaded: false, btn: null };

	const section = document.createElement('section');
	section.className = 'feed-comments';
	section.hidden = true;
	section.setAttribute('aria-label', t('comments.panelTitle'));

	function setCount(n) {
		const el = state.btn?.querySelector('.feed-ic-btn-count');
		if (el) el.textContent = formatCount(n);
	}

	async function load() {
		state.loading = true;
		section.innerHTML = `<p class="feed-comments-loading">${t('comments.loading')}</p>`;
		try {
			if (typeof opts.fetchComments !== 'function') throw new Error('no comment fetcher');
			const { comments } = await opts.fetchComments(heichelId, postId);
			const list = Array.isArray(comments) ? comments : [];
			renderThread(list);
			setCount(countCommentTree(list));
			state.loaded = true;
		} catch (_) {
			section.innerHTML = `<p class="feed-comments-error">${t('comments.error')}</p>` +
				`<button type="button" class="feed-comments-retry">${t('comments.retry')}</button>`;
			section.querySelector('.feed-comments-retry')?.addEventListener('click', load);
		} finally {
			state.loading = false;
		}
	}

	function renderThread(comments) {
		section.innerHTML = '';
		const list = document.createElement('div');
		list.className = 'feed-comment-list';
		if (comments.length) {
			for (const c of comments) list.append(renderComment(c));
		} else {
			list.innerHTML = `<p class="feed-comments-empty">${t('comments.empty')}</p>`;
		}
		section.append(list);
		section.append(renderCommentForm({ parentCommentId: '', placeholder: t('comments.placeholder'), onPosted: refresh }));
	}

	async function refresh() {
		state.loaded = false;
		await load();
	}

	function renderComment(c) {
		const el = document.createElement('article');
		el.className = 'feed-comment';
		const key = commentKey(c);
		if (key) el.dataset.commentId = key;
		const replies = commentReplies(c);
		const stamp = commentStamp(c);
		el.innerHTML =
			'<div class="feed-comment-head">' +
				`<span class="feed-comment-avatar" aria-hidden="true">${escapeHtml(authorInitials(commentName(c)))}</span>` +
				`<span class="feed-comment-author">${escapeHtml(commentName(c))}</span>` +
				(stamp ? `<time class="feed-comment-time" datetime="${escapeAttr(new Date(stamp).toISOString())}">${timeAgo(stamp)}</time>` : '') +
			'</div>' +
			`<p class="feed-comment-text" dir="auto">${escapeHtml(commentText(c))}</p>` +
			'<div class="feed-comment-tools">' +
				`<button type="button" class="feed-comment-replybtn" aria-expanded="false">${t('comments.reply')}</button>` +
			'</div>' +
			'<div class="feed-comment-reply-slot"></div>' +
			(replies.length ? '<div class="feed-comment-replies"></div>' : '');
		const repliesBox = el.querySelector('.feed-comment-replies');
		if (repliesBox) for (const r of replies) repliesBox.append(renderComment(r));
		const replyBtn = el.querySelector('.feed-comment-replybtn');
		const slot = el.querySelector('.feed-comment-reply-slot');
		replyBtn.addEventListener('click', () => {
			const existing = slot.querySelector('form');
			if (existing) {
				existing.remove();
				replyBtn.setAttribute('aria-expanded', 'false');
				return;
			}
			slot.append(renderCommentForm({
				parentCommentId: key,
				placeholder: t('comments.replyTo', { name: commentName(c) }),
				cancellable: true,
				onPosted: refresh
			}));
			replyBtn.setAttribute('aria-expanded', 'true');
			slot.querySelector('input')?.focus();
		});
		return el;
	}

	function renderCommentForm({ parentCommentId, placeholder, cancellable = false, onPosted }) {
		const form = document.createElement('form');
		form.className = 'feed-comment-form';
		form.innerHTML =
			'<div class="feed-comment-row">' +
				`<input type="text" class="feed-comment-input" maxlength="2000" autocomplete="off" placeholder="${escapeAttr(placeholder)}" aria-label="${escapeAttr(placeholder)}">` +
				`<button type="submit" class="feed-comment-send">${t('comments.send')}</button>` +
				(cancellable ? `<button type="button" class="feed-comment-cancel">${t('comments.cancel')}</button>` : '') +
			'</div>' +
			'<p class="feed-comment-error" hidden></p>';
		const input = form.querySelector('.feed-comment-input');
		const send = form.querySelector('.feed-comment-send');
		const error = form.querySelector('.feed-comment-error');
		form.querySelector('.feed-comment-cancel')?.addEventListener('click', () => {
			form.remove();
			const head = form.closest('.feed-comment');
			head?.querySelector(':scope > .feed-comment-tools > .feed-comment-replybtn')?.setAttribute('aria-expanded', 'false');
		});
		form.addEventListener('submit', async (event) => {
			event.preventDefault();
			const text = input.value.trim();
			if (!text) { input.focus(); return; }
			if (typeof opts.submitComment !== 'function') {
				error.textContent = t('comments.noSend');
				error.hidden = false;
				return;
			}
			send.disabled = true;
			input.disabled = true;
			error.hidden = true;
			try {
				await opts.submitComment(heichelId, postId, parentCommentId, text, currentAlias());
				opts.onComment?.(item, parentCommentId, text);
				await onPosted?.();
			} catch (_) {
				error.textContent = t('comments.sendError');
				error.hidden = false;
				send.disabled = false;
				input.disabled = false;
				input.focus();
			}
		});
		return form;
	}

	function toggle(btn) {
		if (btn) state.btn = btn;
		state.open = !state.open;
		section.hidden = !state.open;
		state.btn?.setAttribute('aria-expanded', String(state.open));
		state.btn?.classList.toggle('is-active', state.open);
		if (state.open && !state.loaded && !state.loading) load();
	}

	return { section, toggle };
}

function bumpCount(btn, delta) {
	const el = btn.querySelector('.feed-ic-btn-count');
	if (!el) return;
	const raw = el.textContent;
	const n = parseSuffixed(raw);
	el.textContent = formatCount(Math.max(0, n + delta));
}

function parseSuffixed(raw) {
	const m = String(raw).trim().match(/^([\d.]+)([kM])?$/);
	if (!m) return 0;
	const n = parseFloat(m[1]);
	return Math.round(n * (m[2] === 'M' ? 1000000 : m[2] === 'k' ? 1000 : 1));
}

/** Skeleton shimmer card shown while the next page loads. */
export function renderSkeleton() {
	const el = document.createElement('div');
	el.className = 'feed-card feed-skeleton feed-3d';
	el.setAttribute('aria-hidden', 'true');
	el.innerHTML = `
		<div class="feed-card-light" aria-hidden="true"></div>
		<div class="feed-skel-row">
			<span class="feed-skel feed-skel-avatar"></span>
			<span class="feed-skel feed-skel-line" style="width:38%"></span>
		</div>
		<span class="feed-skel feed-skel-line" style="width:82%"></span>
		<span class="feed-skel feed-skel-line" style="width:64%"></span>
		<span class="feed-skel feed-skel-media"></span>`;
	return el;
}

/** Empty-river state. */
export function renderEmpty(message) {
	const el = document.createElement('div');
	el.className = 'feed-empty feed-3d';
	el.innerHTML = `<div class="feed-card-light" aria-hidden="true"></div>
		${icon('spark', 'feed-empty-icon')}
		<h3>${t('status.emptyTitle')}</h3>
		<p>${escapeHtml(message || t('status.emptyBody'))}</p>`;
	return el;
}
