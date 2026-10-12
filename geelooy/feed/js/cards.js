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

function authorName(item) {
	return item.authorName || item.aliasName || item.aliasId || item.author || 'Awtsmoos';
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
		? `<span class="feed-card-rank" title="River rank score"><span class="feed-card-rank-bar" style="width:${Math.round(Math.min(1, score) * 100)}%"></span></span>`
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
			<button type="button" class="feed-ic-btn feed-card-more" aria-label="More options">${icon('more')}</button>
		</header>
		<a class="feed-card-body" href="${escapeAttr(postHref(item))}">
			<h3 class="feed-card-title" dir="auto">${escapeHtml(item.title || 'Untitled')}</h3>
			${item.heTitle ? `<p class="feed-card-hetitle" dir="rtl" lang="he">${escapeHtml(item.heTitle)}</p>` : ''}
			${excerptHtml(item)}
		</a>
		${mediaHtml(item)}
		<footer class="feed-card-actions" role="toolbar" aria-label="Post actions">
			${iconButton({ icon: 'like', label: 'Like', count: item.reactionCount || item.likes || 0, active: !!item.viewerLiked })}
			${iconButton({ icon: 'comment', label: 'Comment', count: item.commentCount || item.comments || 0 })}
			${iconButton({ icon: 'share', label: 'Share', count: item.shareCount || 0 })}
			<span class="feed-card-actions-spacer"></span>
			${iconButton({ icon: 'save', label: 'Save', active: !!item.viewerSaved, extraClass: 'feed-card-save' })}
		</footer>
		${scoreBadge}`;

	const actions = card.querySelector('.feed-card-actions');
	actions.addEventListener('click', (event) => {
		const btn = event.target.closest('.feed-ic-btn');
		if (!btn || btn.disabled) return;
		event.stopPropagation();
		const label = btn.getAttribute('aria-label') || '';
		if (label === 'Like') {
			const pressed = btn.classList.toggle('is-active');
			btn.setAttribute('aria-pressed', String(pressed));
			bumpCount(btn, pressed ? 1 : -1);
			opts.onReaction?.(item, pressed);
		} else if (label === 'Save') {
			const pressed = btn.classList.toggle('is-active');
			btn.setAttribute('aria-pressed', String(pressed));
			opts.onSave?.(item, pressed);
		} else {
			opts.onAction?.(label, item, btn);
		}
	});

	card.addEventListener('keydown', (event) => {
		if ((event.key === 'Enter' || event.key === ' ') && event.target === card) {
			event.preventDefault();
			window.location.href = postHref(item);
		}
	});

	return card;
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
		<h3>Still waters</h3>
		<p>${escapeHtml(message || 'Nothing here yet. Follow voices you love and the river will fill.')}</p>`;
	return el;
}
