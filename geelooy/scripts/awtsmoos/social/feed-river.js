// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module FeedRiver
 * @description
 * Premium social feed river for Awtsmoos Social.
 * Yaakov 2026-10-13: For You / Latest / Popular toggle, infinite scroll,
 * pull-to-refresh, skeleton loaders, golden action icons.
 *
 * Endpoints (platform feed routes):
 *  - /api/social/feed/personalized — For You (reading-history ranked)
 *  - /api/social/feed/latest       — Latest (chronological)
 *  - /api/social/feed/popular      — Popular (engagement ranked)
 */

const ICON_BASE = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons';
const ICONS = {
	heart: { cls: 'gicon--heart', url: ICON_BASE + '/media-generation-icon-heart-0-5629aacd-4b69-455b-b1b1-f86479475807.webp' },
	comment: { cls: 'gicon--comment', url: ICON_BASE + '/gicon-comment.webp?v=c5d6b22649' },
	share: { cls: 'gicon--share', url: ICON_BASE + '/media-generation-icon-share-0-5961f07f-21a6-4ff0-abb1-31888cabdd28.webp' },
	bookmark: { cls: 'gicon--bookmark', url: ICON_BASE + '/media-generation-icon-bookmark-0-03bd3c64-fec6-49ab-a919-902a42f29850.webp' }
};
/** One golden action icon img with the shared gicon states. */
function actionIcon(vessel) {
	return `<img class="gicon ${vessel.cls}" src="${vessel.url}" alt="" aria-hidden="true" loading="lazy" decoding="async" width="22" height="22">`;
}
const COVER_BASE = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/covers/series';

const MODES = [
	{ key: 'personalized', label: 'For You', endpoint: 'personalized' },
	{ key: 'latest', label: 'Latest', endpoint: 'latest' },
	{ key: 'popular', label: 'Popular', endpoint: 'popular' }
];
const PAGE_SIZE = 12;

const state = {
	mode: 'personalized',
	items: [],
	offset: 0,
	nextOffset: 0,
	loading: false,
	done: false,
	liked: new Set(),
	saved: new Set(),
	maamarLinks: null,
	maamarLinksLoading: false
};

// B"H — Load the social-post -> source-maamar link mappings (built from the
// 195-batch Sefer HaMaamarim import, plus the 282-pack Mittler Rebbe import).
// Cached in state; fetched once.
async function loadMaamarLinks() {
	if (state.maamarLinks || state.maamarLinksLoading) return;
	state.maamarLinksLoading = true;
	try {
		const [shmRes, mrRes] = await Promise.all([
			fetch('/data/shm-maamar-links.json', { credentials: 'same-origin' }),
			fetch('/data/mr-maamar-links.json', { credentials: 'same-origin' })
		]);
		const merged = {};
		if (shmRes.ok) Object.assign(merged, await shmRes.json());
		if (mrRes.ok) Object.assign(merged, await mrRes.json());
		state.maamarLinks = merged;
	} catch (_) { /* link simply won't render */ }
	state.maamarLinksLoading = false;
}

// B"H — "Read the full maamar →" link for social posts derived from a maamar.
function deriveBasePostId(postId) {
	const id = String(postId || '');
	// MR: mr-social-mittler-rebbe-15823-001-article → mittler-rebbe-15823-001
	let m = /^mr-social-(mittler-rebbe-\d+-\d+)-/.exec(id);
	if (m) return m[1];
	// SHM: shm-social-15643-maamar-001-en-md-c00 → shm-maamar-15643-maamar-001-en-md
	m = /^shm-social-(\d+-maamar-\d+(?:-en-md)?)-c\d+/.exec(id);
	if (m) return 'shm-maamar-' + m[1];
	return '';
}
function maamarLinkHtml(post) {
	const base = post.basePostId || post.base_post_id || deriveBasePostId(post.postId) || '';
	if (!base || !state.maamarLinks) return '';
	const entry = state.maamarLinks[base];
	if (!entry || !entry.url) return '';
	const label = entry.title ? `Read the full maamar: ${esc(entry.title)}` : 'Read the full maamar';
	return `<a class="feed-card__maamar-link" href="${esc(entry.url)}" aria-label="${esc(label)}"><span aria-hidden="true">📖</span> Read the full maamar <span aria-hidden="true">→</span></a>`;
}

function esc(s) {
	return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function postUrl(post) {
	const id = post.postId || post.id || '';
	const series = post.seriesId || post.series || '';
	const heichel = post.heichelId || post.heichel || 'ikar';
	if (series && id) return `/heichelos/${encodeURIComponent(heichel)}/series/${encodeURIComponent(series)}/post/${encodeURIComponent(id)}`;
	return '#';
}

function findPost(postId) {
	return state.items.find(p => String(p.postId || p.id || '') === String(postId)) || null;
}

function coverUrl(post) {
	if (post.coverImage) return post.coverImage;
	const sid = String(post.seriesId || post.series || '');
	// Series covers live at covers/series/series-<slug>.webp
	if (sid) return `${COVER_BASE}/series-${sid.replace(/([A-Z])/g, '-$1').toLowerCase()}.webp`;
	return '';
}

function whyText(post) {
	if (post._rankScore == null) return '';
	if (state.mode === 'personalized') {
		const sid = String(post.seriesId || post.series || '');
		if (sid) return `Because you read ${esc(sid)}`;
		return 'Picked for you';
	}
	return '';
}

/* B"H 2026-10-13 — mi-fade-up + --mi-i drive the shared staggered card entrance. */
function cardHtml(post, index = 0) {
	const id = esc(post.postId || post.id || '');
	const title = esc(post.title || post.postTitle || 'Untitled');
	const excerpt = esc(post.excerpt || post.summary || post.description || '');
	const kicker = esc(post.seriesTitle || post.seriesId || post.series || 'Awtsmoos');
	const author = esc(post.authorName || post.author || post.aliasId || 'Awtsmoos');
	const initial = (author.trim()[0] || 'A').toUpperCase();
	const likes = Number(post.reactionCount || post.likes || 0);
	const comments = Number(post.commentCount || 0);
	const cover = coverUrl(post);
	const why = whyText(post);
	const liked = state.liked.has(id);
	const isQuestion = String(post.type || post.postType || '').toLowerCase() === 'question';
	const answerCount = Number(post.answerCount || 0);
	const qBadge = isQuestion ? `<span class="feed-card__qbadge">❓ Question${answerCount ? ` · ${answerCount} answer${answerCount === 1 ? '' : 's'}` : ''}</span>` : '';

	return `
	<article class="feed-card mi-fade-up" data-post-id="${id}" style="--mi-i:${Math.max(0, index)}">
		${cover ? `<img class="feed-card__cover" src="${esc(cover)}" alt="" loading="lazy" onerror="this.remove()">` : ''}
		<div class="feed-card__body">
			<p class="feed-card__kicker">${kicker}</p>
			${qBadge}
			<h2 class="feed-card__title"><a href="${esc(postUrl(post))}">${title}</a></h2>
			${excerpt ? `<p class="feed-card__excerpt">${excerpt}</p>` : ''}
			${maamarLinkHtml(post)}
			${why ? `<span class="feed-card__why">✦ ${why}</span>` : ''}
			<div class="feed-card__meta">
				<span class="feed-card__avatar" aria-hidden="true">${esc(initial)}</span>
				<span>${author}</span>
			</div>
			<div class="feed-card__actions">
				<button class="feed-action ${liked ? 'feed-action--liked' : ''}" data-action="like" data-post="${id}" aria-pressed="${liked}" aria-label="${liked ? 'Unlike' : 'Like'} this post">
					${actionIcon(ICONS.heart)}<span>${likes || 'Like'}</span>
				</button>
				<button class="feed-action" data-action="comment" data-post="${id}" aria-label="Comment on this post">
					${actionIcon(ICONS.comment)}<span>${comments || 'Comment'}</span>
				</button>
				<button class="feed-action" data-action="share" data-post="${id}" aria-label="Share this post">
					${actionIcon(ICONS.share)}<span>Share</span>
				</button>
				<button class="feed-action" data-action="save" data-post="${id}" aria-pressed="${state.saved.has(id)}" aria-label="${state.saved.has(id) ? 'Unsave' : 'Save'} this post">
					${actionIcon(ICONS.bookmark)}<span>Save</span>
				</button>
			</div>
		</div>
	</article>`;
}

function skeletonHtml(n = 3) {
	let out = '';
	for (let i = 0; i < n; i++) {
		out += `<div class="feed-skeleton" aria-hidden="true">
			<div class="feed-skeleton__cover"></div>
			<div class="feed-skeleton__line feed-skeleton__line--title"></div>
			<div class="feed-skeleton__line"></div>
			<div class="feed-skeleton__line feed-skeleton__line--short"></div>
		</div>`;
	}
	return out;
}

function emptyHtml() {
	return `<div class="feed-empty">
		<div class="feed-empty__glyph">✦</div>
		<h2 class="feed-empty__title">Your river is waiting</h2>
		<p class="feed-empty__text">Read some Torah and your personalized feed will bloom here — posts chosen from what you love, plus beautiful discoveries.</p>
		<a class="feed-empty__cta" href="/heichelos/">Explore the Library</a>
	</div>`;
}

async function fetchPage() {
	if (state.loading || state.done) return;
	state.loading = true;
	renderSentinel(true);

	const mode = MODES.find(m => m.key === state.mode);
	try {
		const url = `/api/social/feed/${mode.endpoint}?limit=${PAGE_SIZE}&offset=${state.nextOffset}`;
		const res = await fetch(url, { credentials: 'same-origin' });
		const data = await res.json();
		const payload = data.success || data;
		const items = payload.items || [];
		state.nextOffset = payload.nextOffset;
		if (payload.nextOffset == null || items.length === 0) state.done = true;
		appendItems(items);
	} catch (err) {
		showError();
	} finally {
		state.loading = false;
		renderSentinel(false);
	}
}

function appendItems(items) {
	const river = document.getElementById('feed-river');
	if (!river) return;
	// Remove skeletons on first real content.
	river.querySelectorAll('.feed-skeleton').forEach(el => el.remove());
	if (state.offset === 0 && items.length === 0) {
		river.innerHTML = emptyHtml();
		return;
	}
	const html = items.map((post, i) => cardHtml(post, state.offset + i)).join('');
	river.insertAdjacentHTML('beforeend', html);
	state.offset += items.length;
	state.items.push(...items);
}

function showError() {
	const river = document.getElementById('feed-river');
	if (!river) return;
	river.querySelectorAll('.feed-skeleton').forEach(el => el.remove());
	if (state.offset === 0) {
		river.innerHTML = `<div class="feed-empty">
			<div class="feed-empty__glyph">⚡</div>
			<h2 class="feed-empty__title">The river paused</h2>
			<p class="feed-empty__text">Something interrupted the feed. Take a breath and try again.</p>
			<button class="feed-empty__cta" id="feed-retry">Try Again</button>
		</div>`;
		document.getElementById('feed-retry')?.addEventListener('click', resetAndLoad);
	}
}

function renderSentinel(loading) {
	const s = document.getElementById('feed-sentinel');
	if (!s) return;
	s.innerHTML = loading
		? '<span class="feed-ptr__spinner"></span> Loading more…'
		: (state.done && state.offset > 0 ? '✦ You are all caught up' : '');
}

function resetAndLoad() {
	state.items = [];
	state.offset = 0;
	state.nextOffset = 0;
	state.done = false;
	const river = document.getElementById('feed-river');
	if (river) river.innerHTML = skeletonHtml(3);
	fetchPage();
}

function setMode(key) {
	if (state.mode === key) return;
	state.mode = key;
	document.querySelectorAll('.feed-mode-btn').forEach(btn => {
		btn.setAttribute('aria-selected', btn.dataset.mode === key ? 'true' : 'false');
	});
	try { localStorage.setItem('awtsmoos-feed-mode', key); } catch (_) {}
	resetAndLoad();
}

/* B"H 2026-10-13 — like-burst: re-trigger the shared mi-burst keyframes so the
   heart pops with a golden ring on every tap. */
function burstLike(btn) {
	btn.classList.remove('mi-burst');
	void btn.offsetWidth;
	btn.classList.add('mi-burst');
	btn.addEventListener('animationend', () => btn.classList.remove('mi-burst'), { once: true });
}

function onAction(e) {
	const btn = e.target.closest('.feed-action');
	if (!btn) return;
	const action = btn.dataset.action;
	const postId = btn.dataset.post;
	if (!action || !postId) return;

	if (action === 'like') {
		const liked = state.liked.has(postId);
		if (liked) state.liked.delete(postId); else state.liked.add(postId);
		btn.classList.toggle('feed-action--liked', !liked);
		btn.setAttribute('aria-pressed', String(!liked));
		burstLike(btn);
		const label = btn.querySelector('span');
		if (label && !/\d/.test(label.textContent)) label.textContent = !liked ? 'Liked' : 'Like';
		// Fire-and-forget: record the reaction server-side.
		// B"H 2026-10-13: include heichelId — the endpoint requires it (MISSING_REACTION_TARGET otherwise).
		const post = findPost(postId) || {};
		fetch(`/api/social/reactions/post/${encodeURIComponent(postId)}`, {
			method: liked ? 'DELETE' : 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'same-origin',
			body: JSON.stringify({ emoji: '❤️', heichelId: post.heichelId || post.heichel || '' })
		}).catch(() => {});
	} else if (action === 'save') {
		const saved = state.saved.has(postId);
		if (saved) state.saved.delete(postId); else state.saved.add(postId);
		btn.setAttribute('aria-pressed', String(!saved));
		const label = btn.querySelector('span');
		if (label) label.textContent = !saved ? 'Saved' : 'Save';
	} else if (action === 'share') {
		const post = findPost(postId) || { postId };
		const url = `${location.origin}${postUrl(post)}`;
		if (navigator.share) {
			navigator.share({ title: 'Awtsmoos', url }).catch(() => {});
		} else if (navigator.clipboard) {
			navigator.clipboard.writeText(url).catch(() => {});
			const label = btn.querySelector('span');
			if (label) { label.textContent = 'Copied!'; setTimeout(() => label.textContent = 'Share', 1500); }
		}
	} else if (action === 'comment') {
		const post = findPost(postId) || { postId };
		location.href = postUrl(post) + '#comments';
	}
}

/** Pull-to-refresh on mobile: drag down at the top of the river. */
function initPullToRefresh() {
	const ptr = document.getElementById('feed-ptr');
	const river = document.getElementById('feed-river');
	if (!ptr || !river) return;
	let startY = 0, pulling = false;

	document.addEventListener('touchstart', e => {
		if (window.scrollY === 0) { startY = e.touches[0].clientY; pulling = true; }
	}, { passive: true });

	document.addEventListener('touchmove', e => {
		if (!pulling) return;
		const dy = e.touches[0].clientY - startY;
		if (dy > 70) ptr.setAttribute('data-active', 'true');
	}, { passive: true });

	document.addEventListener('touchend', () => {
		if (pulling && ptr.getAttribute('data-active') === 'true') {
			ptr.setAttribute('data-active', 'false');
			resetAndLoad();
		}
		pulling = false;
	}, { passive: true });
}

/** Infinite scroll via IntersectionObserver. */
function initInfiniteScroll() {
	const sentinel = document.getElementById('feed-sentinel');
	if (!sentinel || !('IntersectionObserver' in window)) return;
	new IntersectionObserver(entries => {
		if (entries[0].isIntersecting) fetchPage();
	}, { rootMargin: '600px' }).observe(sentinel);
}

export function initFeedRiver() {
	const mount = document.getElementById('feed-river-mount');
	if (!mount) return;

	// Restore preferred mode.
	try {
		const saved = localStorage.getItem('awtsmoos-feed-mode');
		if (saved && MODES.some(m => m.key === saved)) state.mode = saved;
	} catch (_) {}

	mount.innerHTML = `
		<div class="feed-mode-toggle" role="tablist" aria-label="Feed mode">
			${MODES.map(m => `
				<button class="feed-mode-btn" role="tab" data-mode="${m.key}"
					aria-selected="${m.key === state.mode}">${m.label}</button>`).join('')}
			<button class="feed-mode-btn feed-ask-btn" data-ask-question aria-label="Ask a question">❓ Ask</button>
		</div>
		<div class="feed-ptr" id="feed-ptr" aria-hidden="true">
			<span class="feed-ptr__spinner"></span> Refreshing…
		</div>
		<div class="feed-river" id="feed-river" aria-live="polite">
			${skeletonHtml(3)}
		</div>
		<div class="feed-sentinel" id="feed-sentinel"></div>`;

	mount.querySelectorAll('.feed-mode-btn').forEach(btn => {
		btn.addEventListener('click', () => setMode(btn.dataset.mode));
	});
	mount.addEventListener('click', onAction);

	initPullToRefresh();
	initInfiniteScroll();
	// B"H — fetch maamar links in background; re-render cards once loaded so
	// "Read the full maamar →" appears without blocking the feed.
	loadMaamarLinks().then(() => {
		if (!state.maamarLinks) return;
		const river = document.getElementById('feed-river');
		if (!river || !state.items.length) return;
		river.innerHTML = state.items.map((post, i) => cardHtml(post, i)).join('');
	});
	fetchPage();
}
