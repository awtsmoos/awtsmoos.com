// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AnchoredComments
 * @description
 * Yaakov 2026-10-13: Medium-style anchored comments for Awtsmoos posts.
 *
 * 1. A reader highlights text inside a post (feed card body or full post page).
 * 2. A floating "Comment" button appears near the selection.
 * 3. The reader writes a comment; the selection becomes a WhatsApp-style
 *    quoted preview above the comment.
 * 4. Clicking the quote scrolls the post to the anchored section and flashes
 *    it yellow, then fades.
 *
 * Persistence: the comment POSTs to the canonical comments API
 * (`/api/social/heichelos/:heichel/posts/:post/comment-tree`) with the anchor
 * fields included in the body, AND is kept in localStorage per post. The
 * server-side comment record currently whitelists only `content`/`dayuh`,
 * so localStorage is the authoritative anchored-comment store until the
 * server schema grows anchor fields.
 *
 * Yaakov's rules honored: no `!important` (all styling is in the sibling
 * `anchoredComments.css`), no dark patterns (explicit dismiss/close, no
 * trickery), user-facing strings never expose raw IDs.
 */

const MIN_SELECTION_CHARS = 10;
const LS_PREFIX = 'awtsmoos-anchored-comments:';
const LS_MAX_PER_POST = 200;

/* ------------------------------------------------------------------ */
/* small helpers                                                       */
/* ------------------------------------------------------------------ */

function escapeHtml(s) {
	return String(s ?? '').replace(/[&<>"']/g, c => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	}[c]));
}

function currentAlias() {
	return window.curAlias || window.currentAlias ||
		document.body?.dataset?.aliasId ||
		localStorage.getItem('awtsmoos-alias') || 'anonymous';
}

/** Feed card root, or null. Cards carry data-post-id (cards.js renderFeedCard). */
function cardRootFor(node) {
	return node?.closest?.('.feed-card[data-post-id]') || null;
}

/** Full-post pages: window.post (heichelos reader) is authoritative. */
function windowPost() {
	const p = window.post;
	if (p && (p.id || p.postId)) return p;
	return null;
}

/**
 * Resolve the post context for a selection.
 * @returns {{ postId, heichelId, seriesId, source }} or null
 */
function postContextFor(containerEl) {
	if (!containerEl) return null;
	const card = containerEl.closest?.('.feed-card[data-post-id]');
	if (card?.dataset?.postId) {
		return {
			postId: card.dataset.postId,
			heichelId: card.dataset.heichelId || card.dataset.heichel || 'ikar',
			seriesId: card.dataset.seriesId || 'root',
			source: 'feed-card'
		};
	}
	const ac = containerEl.closest?.('[data-ac-post-id]');
	if (ac?.dataset?.acPostId) {
		return {
			postId: ac.dataset.acPostId,
			heichelId: ac.dataset.acHeichelId || 'ikar',
			seriesId: ac.dataset.acSeriesId || 'root',
			source: 'page'
		};
	}
	const wp = windowPost();
	if (wp) {
		return {
			postId: String(wp.id || wp.postId),
			heichelId: wp.heichel?.id || wp.heichelId || 'ikar',
			seriesId: wp.parentSeriesId || wp.seriesId || 'root',
			source: 'page'
		};
	}
	const paramId = new URLSearchParams(location.search).get('postId') ||
		location.pathname.match(/\/([A-Za-z0-9_-]{6,})$/);
	if (paramId) {
		return {
			postId: typeof paramId === 'string' ? paramId : paramId[1],
			heichelId: 'ikar',
			seriesId: 'root',
			source: 'page'
		};
	}
	return null;
}

/** Selectable content: feed card body, or any explicit anchored-content host. */
const SELECTABLE_SELECTOR = '.feed-card-body, [data-ac-content], #realPost, .post-body, [itemprop="articleBody"], .awtsmoos-reader-body';

function selectableContainerFor(node) {
	return node?.closest?.(SELECTABLE_SELECTOR) || null;
}

/* ------------------------------------------------------------------ */
/* selection -> character offsets                                      */
/* ------------------------------------------------------------------ */

/**
 * Character offsets of a Range, relative to the container's full text.
 * @returns {{ start, end }} or null
 */
function offsetsOfRange(container, range) {
	const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
	let offset = 0;
	let start = -1, end = -1;
	let node;
	while ((node = walker.nextNode())) {
		const len = node.nodeValue.length;
		if (node === range.startContainer) start = offset + range.startOffset;
		if (node === range.endContainer) { end = offset + range.endOffset; break; }
		offset += len;
	}
	if (start < 0 || end < 0 || end <= start) return null;
	return { start, end };
}

/* ------------------------------------------------------------------ */
/* floating comment button                                             */
/* ------------------------------------------------------------------ */

let floatBtn = null;

function ensureFloatButton() {
	if (floatBtn) return floatBtn;
	floatBtn = document.createElement('button');
	floatBtn.type = 'button';
	floatBtn.className = 'ac-float-btn';
	floatBtn.setAttribute('aria-label', 'Comment on the selected text');
	floatBtn.hidden = true;
	floatBtn.append(document.createTextNode('💬 Comment'));
	document.body.append(floatBtn);
	return floatBtn;
}

function hideFloatButton() {
	if (floatBtn) floatBtn.hidden = true;
}

/**
 * Position the floating button just above the selection rect (or below it
 * when there is no room), clamped to the viewport.
 */
function placeFloatButton(rect, anchorPayload) {
	const btn = ensureFloatButton();
	btn.hidden = false;
	btn._acPayload = anchorPayload;
	const pad = 10;
	const w = btn.offsetWidth || 150;
	const h = btn.offsetHeight || 40;
	let x = Math.min(Math.max(pad, rect.left + rect.width / 2 - w / 2), window.innerWidth - w - pad);
	let y = rect.top - h - 8;
	if (y < pad) y = rect.bottom + 8;
	btn.style.left = `${Math.round(x)}px`;
	btn.style.top = `${Math.round(Math.max(pad, y)) + window.scrollY}px`;
}

/* ------------------------------------------------------------------ */
/* composer dialog                                                     */
/* ------------------------------------------------------------------ */

let composer = null;

function closeComposer() {
	if (composer) {
		composer.remove();
		composer = null;
	}
	document.removeEventListener('keydown', onComposerKey, true);
}

/** Open the anchored-comment composer. payload: { container, postCtx, anchorText, anchorStart, anchorEnd } */
function openComposer(payload) {
	closeComposer();
	hideFloatButton();
	const sel = window.getSelection();
	if (sel) sel.removeAllRanges();

	composer = document.createElement('div');
	composer.className = 'ac-composer-backdrop';
	composer.setAttribute('role', 'dialog');
	composer.setAttribute('aria-modal', 'true');
	composer.setAttribute('aria-label', 'Comment on the selected text');

	const box = document.createElement('div');
	box.className = 'ac-composer';

	const quote = document.createElement('blockquote');
	quote.className = 'ac-quote';
	const quoteBar = document.createElement('span');
	quoteBar.className = 'ac-quote-bar';
	quoteBar.setAttribute('aria-hidden', 'true');
	const quoteText = document.createElement('span');
	quoteText.className = 'ac-quote-text';
	quoteText.dir = 'auto';
	quoteText.textContent = payload.anchorText;
	quote.append(quoteBar, quoteText);

	const label = document.createElement('label');
	label.className = 'ac-composer-label';
	label.textContent = 'Your comment';
	const input = document.createElement('textarea');
	input.className = 'ac-composer-input';
	input.rows = 4;
	input.placeholder = 'Share your thoughts on this passage…';
	input.setAttribute('aria-label', 'Comment text');
	label.append(input);

	const err = document.createElement('p');
	err.className = 'ac-composer-error';
	err.hidden = true;
	err.setAttribute('role', 'alert');

	const actions = document.createElement('div');
	actions.className = 'ac-composer-actions';
	const cancelBtn = document.createElement('button');
	cancelBtn.type = 'button';
	cancelBtn.className = 'ac-btn ac-btn-ghost';
	cancelBtn.textContent = 'Cancel';
	cancelBtn.addEventListener('click', closeComposer);
	const submitBtn = document.createElement('button');
	submitBtn.type = 'button';
	submitBtn.className = 'ac-btn ac-btn-primary';
	submitBtn.textContent = 'Post comment';
	actions.append(cancelBtn, submitBtn);

	box.append(quote, label, err, actions);
	composer.append(box);
	document.body.append(composer);

	const onBackdrop = (event) => { if (event.target === composer) closeComposer(); };
	composer.addEventListener('mousedown', onBackdrop);

	submitBtn.addEventListener('click', async () => {
		const text = input.value.trim();
		if (!text) {
			err.textContent = 'Write something before posting.';
			err.hidden = false;
			input.focus();
			return;
		}
		err.hidden = true;
		submitBtn.disabled = true;
		submitBtn.textContent = 'Posting…';
		try {
			await saveAnchoredComment({ ...payload, content: text });
			closeComposer();
			refreshAnchoredSections(payload.postCtx.postId);
		} catch (e) {
			submitBtn.disabled = false;
			submitBtn.textContent = 'Post comment';
			err.textContent = 'Could not post the comment. It was kept on this device.';
			err.hidden = false;
		}
	});

	document.addEventListener('keydown', onComposerKey, true);
	input.focus();
}

function onComposerKey(event) {
	if (event.key === 'Escape') closeComposer();
}

/* ------------------------------------------------------------------ */
/* persistence: server POST + localStorage                             */
/* ------------------------------------------------------------------ */

function lsKey(postId) { return LS_PREFIX + String(postId); }

function readAnchored(postId) {
	try {
		const raw = localStorage.getItem(lsKey(postId));
		const arr = raw ? JSON.parse(raw) : [];
		return Array.isArray(arr) ? arr : [];
	} catch (_) { return []; }
}

function writeAnchored(postId, list) {
	try {
		localStorage.setItem(lsKey(postId), JSON.stringify(list.slice(0, LS_MAX_PER_POST)));
	} catch (_) { /* private mode */ }
}

function pushLocalAnchored(comment) {
	const list = readAnchored(comment.postId);
	list.unshift(comment);
	writeAnchored(comment.postId, list);
}

/**
 * Best-effort POST to the canonical comment API, then authoritative local save.
 * The anchor fields ride in the body so a future server schema can adopt them.
 */
async function saveAnchoredComment(payload) {
	const comment = {
		id: 'ac_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8),
		postId: String(payload.postId),
		heichelId: payload.heichelId,
		seriesId: payload.seriesId,
		aliasId: currentAlias(),
		content: payload.content,
		anchorText: payload.anchorText,
		anchorStart: payload.anchorStart,
		anchorEnd: payload.anchorEnd,
		createdAt: Date.now(),
		local: true
	};

	const url = `/api/social/heichelos/${encodeURIComponent(payload.heichelId || 'ikar')}/posts/${encodeURIComponent(payload.postId)}/comment-tree`;
	try {
		const body = new URLSearchParams({
			aliasId: comment.aliasId,
			seriesId: comment.seriesId,
			content: comment.content,
			verseSection: 'root',
			anchorText: comment.anchorText,
			anchorStart: String(comment.anchorStart),
			anchorEnd: String(comment.anchorEnd)
		});
		const res = await fetch(url, { method: 'POST', credentials: 'same-origin', body });
		if (res.ok) {
			const json = await res.json().catch(() => null);
			if (json?.success?.commentId) comment.serverId = String(json.success.commentId);
			comment.serverSynced = true;
		}
	} catch (_) { /* offline or endpoint unavailable — local copy still lands */ }

	pushLocalAnchored(comment);
	return comment;
}

/* ------------------------------------------------------------------ */
/* rendering anchored comments                                         */
/* ------------------------------------------------------------------ */

function timeAgo(ts) {
	const s = Math.max(1, Math.round((Date.now() - Number(ts)) / 1000));
	if (s < 60) return 'just now';
	const m = Math.round(s / 60);
	if (m < 60) return `${m}m ago`;
	const h = Math.round(m / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.round(h / 24)}d ago`;
}

function aliasLabel(aliasId) {
	const a = String(aliasId || 'anonymous');
	if (a === 'anonymous') return 'Anonymous';
	return a.length > 24 ? a.slice(0, 21) + '…' : a;
}

/** Render the anchored-comment list inside `host` for postCtx. */
function renderList(host, postCtx) {
	host.innerHTML = '';
	const items = readAnchored(postCtx.postId);
	if (!items.length) return;
	const title = document.createElement('h4');
	title.className = 'ac-list-title';
	title.textContent = items.length === 1 ? '1 anchored comment' : `${items.length} anchored comments`;
	host.append(title);
	for (const c of items) {
		host.append(renderComment(c, postCtx));
	}
}

function renderComment(c, postCtx) {
	const el = document.createElement('div');
	el.className = 'ac-comment';
	el.dataset.commentId = c.id;

	const head = document.createElement('div');
	head.className = 'ac-comment-head';
	const author = document.createElement('span');
	author.className = 'ac-comment-author';
	author.textContent = aliasLabel(c.aliasId);
	const when = document.createElement('span');
	when.className = 'ac-comment-time';
	when.textContent = timeAgo(c.createdAt);
	if (c.local && !c.serverSynced) {
		const badge = document.createElement('span');
		badge.className = 'ac-local-badge';
		badge.textContent = 'this device';
		when.append(document.createTextNode(' · '), badge);
	}
	head.append(author, when);

	const quote = document.createElement('button');
	quote.type = 'button';
	quote.className = 'ac-quote ac-quote-link';
	quote.setAttribute('aria-label', 'Jump to the quoted passage');
	const bar = document.createElement('span');
	bar.className = 'ac-quote-bar';
	bar.setAttribute('aria-hidden', 'true');
	const qtext = document.createElement('span');
	qtext.className = 'ac-quote-text';
	qtext.dir = 'auto';
	qtext.textContent = c.anchorText;
	quote.append(bar, qtext);
	quote.addEventListener('click', () => jumpToAnchor(postCtx, c));

	const body = document.createElement('p');
	body.className = 'ac-comment-body';
	body.dir = 'auto';
	body.textContent = c.content;

	el.append(head, quote, body);
	return el;
}

/* ------------------------------------------------------------------ */
/* jump to anchor: scroll + yellow flash                               */
/* ------------------------------------------------------------------ */

/** All selectable containers that belong to a postId (feed card or page). */
function containersForPost(postId) {
	const out = [];
	for (const card of document.querySelectorAll('.feed-card[data-post-id]')) {
		if (card.dataset.postId === String(postId)) {
			const c = card.querySelector(SELECTABLE_SELECTOR);
			if (c) out.push(c);
		}
	}
	const wp = windowPost();
	if (wp && String(wp.id || wp.postId) === String(postId)) {
		for (const c of document.querySelectorAll(SELECTABLE_SELECTOR)) {
			if (!c.closest('.feed-card')) out.push(c);
		}
	}
	return out;
}

/**
 * Build a Range from stored offsets inside `container`.
 * Falls back to a plain text search for anchorText when offsets miss
 * (e.g. the text re-rendered with different markup).
 */
function rangeForAnchor(container, comment) {
	const tryOffsets = () => {
		const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
		let offset = 0, startNode = null, startOff = 0, endNode = null, endOff = 0, node;
		while ((node = walker.nextNode())) {
			const len = node.nodeValue.length;
			if (!startNode && offset + len > comment.anchorStart) {
				startNode = node; startOff = Math.max(0, comment.anchorStart - offset);
			}
			if (offset + len >= comment.anchorEnd) {
				endNode = node; endOff = Math.max(0, Math.min(len, comment.anchorEnd - offset));
				break;
			}
			offset += len;
		}
		if (!startNode || !endNode) return null;
		const range = document.createRange();
		range.setStart(startNode, Math.min(startOff, startNode.nodeValue.length));
		range.setEnd(endNode, Math.min(endOff, endNode.nodeValue.length));
		return range.toString().trim() ? range : null;
	};
	const byOffsets = tryOffsets();
	if (byOffsets) return byOffsets;

	// Fallback: find the anchor text in the container's text.
	const needle = String(comment.anchorText || '').trim().slice(0, 120);
	if (!needle) return null;
	const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
	let offset = 0, startNode = null, startOff = 0, node;
	while ((node = walker.nextNode())) {
		const idx = node.nodeValue.indexOf(needle);
		if (idx >= 0) { startNode = node; startOff = idx; break; }
		offset += node.nodeValue.length;
	}
	if (!startNode) return null;
	const range = document.createRange();
	range.setStart(startNode, startOff);
	range.setEnd(startNode, startOff + needle.length);
	return range;
}

function flashRange(range) {
	// Wrap each intersected text node in a flash span; unwrap after the fade.
	const spans = [];
	const walker = document.createTreeWalker(
		range.commonAncestorContainer,
		NodeFilter.SHOW_TEXT,
		{
			acceptNode(node) {
				const r = document.createRange();
				r.selectNodeContents(node);
				return (r.compareBoundaryPoints(Range.END_TO_START, range) < 0 &&
					r.compareBoundaryPoints(Range.START_TO_END, range) > 0)
					? NodeFilter.FILTER_ACCEPT
					: NodeFilter.FILTER_REJECT;
			}
		}
	);
	const nodes = [];
	let n;
	while ((n = walker.nextNode())) nodes.push(n);
	for (const node of nodes) {
		const span = document.createElement('span');
		span.className = 'ac-flash';
		node.parentNode.insertBefore(span, node);
		span.append(node);
		spans.push(span);
	}
	range.getBoundingClientRect(); // settle layout
	const first = spans[0];
	if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
	setTimeout(() => {
		for (const span of spans) {
			const parent = span.parentNode;
			if (!parent) continue;
			while (span.firstChild) parent.insertBefore(span.firstChild, span);
			parent.removeChild(span);
		}
	}, 2800);
}

function jumpToAnchor(postCtx, comment) {
	const containers = containersForPost(postCtx.postId);
	if (!containers.length) {
		// The post isn't expanded here; take the reader to the full page.
		const h = encodeURIComponent(postCtx.heichelId || 'ikar');
		const s = encodeURIComponent(postCtx.seriesId || 'root');
		const p = encodeURIComponent(postCtx.postId);
		location.href = `/heichelos/${h}/series/${s}/${p}#ac-${encodeURIComponent(comment.id)}`;
		return;
	}
	for (const container of containers) {
		const range = rangeForAnchor(container, comment);
		if (range) {
			container.scrollIntoView({ behavior: 'smooth', block: 'start' });
			flashRange(range);
			return;
		}
	}
	// Anchor text not found in the current markup: expand nothing, just land
	// the reader on the container so nothing feels broken.
	containers[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Re-render every anchored-comment section for a postId. */
function refreshAnchoredSections(postId) {
	for (const host of document.querySelectorAll(`[data-ac-list-for="${CSS.escape(String(postId))}"]`)) {
		const postCtx = {
			postId,
			heichelId: host.dataset.acHeichelId || 'ikar',
			seriesId: host.dataset.acSeriesId || 'root'
		};
		renderList(host, postCtx);
	}
}

/* ------------------------------------------------------------------ */
/* mounting sections under posts                                       */
/* ------------------------------------------------------------------ */

function mountForCard(card) {
	if (card.querySelector(':scope > .ac-list')) return;
	const postCtx = postContextFor(card.querySelector(SELECTABLE_SELECTOR) || card);
	if (!postCtx?.postId) return;
	const host = document.createElement('section');
	host.className = 'ac-list';
	host.dataset.acListFor = postCtx.postId;
	host.dataset.acHeichelId = postCtx.heichelId;
	host.dataset.acSeriesId = postCtx.seriesId;
	host.setAttribute('aria-label', 'Anchored comments');
	const actions = card.querySelector('.feed-card-actions');
	if (actions) card.insertBefore(host, actions);
	else card.append(host);
	renderList(host, postCtx);
}

function mountForPage() {
	const postCtx = postContextFor(document.querySelector(SELECTABLE_SELECTOR));
	if (!postCtx?.postId) return;
	if (document.querySelector(`[data-ac-list-for="${CSS.escape(postCtx.postId)}"]`)) return;
	let anchor = null;
	for (const c of document.querySelectorAll(SELECTABLE_SELECTOR)) {
		if (!c.closest('.feed-card')) { anchor = c; break; }
	}
	if (!anchor) return;
	const host = document.createElement('section');
	host.className = 'ac-list ac-list-page';
	host.dataset.acListFor = postCtx.postId;
	host.dataset.acHeichelId = postCtx.heichelId;
	host.dataset.acSeriesId = postCtx.seriesId;
	host.setAttribute('aria-label', 'Anchored comments');
	anchor.after(host);
	renderList(host, postCtx);
}

function scanAndMount() {
	for (const card of document.querySelectorAll('.feed-card[data-post-id]')) mountForCard(card);
	mountForPage();
}

/* ------------------------------------------------------------------ */
/* selection plumbing                                                  */
/* ------------------------------------------------------------------ */

let pendingCheck = 0;

function handlePotentialSelection() {
	clearTimeout(pendingCheck);
	pendingCheck = setTimeout(() => {
		const sel = window.getSelection();
		if (!sel || sel.isCollapsed || sel.rangeCount === 0) { hideFloatButton(); return; }
		const range = sel.getRangeAt(0);
		const container = selectableContainerFor(range.startContainer) || selectableContainerFor(range.endContainer);
		if (!container || !container.contains(range.endContainer)) { hideFloatButton(); return; }
		const text = range.toString().trim();
		if (text.length < MIN_SELECTION_CHARS) { hideFloatButton(); return; }
		const postCtx = postContextFor(container);
		if (!postCtx?.postId) { hideFloatButton(); return; }
		const offsets = offsetsOfRange(container, range);
		if (!offsets) { hideFloatButton(); return; }
		const rects = range.getClientRects();
		const rect = rects[rects.length - 1] || range.getBoundingClientRect();
		if (!rect || (rect.width === 0 && rect.height === 0)) { hideFloatButton(); return; }
		placeFloatButton(rect, {
			container,
			postCtx,
			anchorText: text.slice(0, 500),
			anchorStart: offsets.start,
			anchorEnd: offsets.end
		});
	}, 120);
}

/* ------------------------------------------------------------------ */
/* init                                                                */
/* ------------------------------------------------------------------ */

export function initAnchoredComments() {
	if (window.__acInitialized) return;
	window.__acInitialized = true;

	// Floating "Comment" button click -> composer.
	const btn = ensureFloatButton();
	btn.addEventListener('click', () => {
		if (btn._acPayload) openComposer(btn._acPayload);
	});

	// Selection listeners: mouse, touch, and keyboard-driven selection.
	document.addEventListener('mouseup', (event) => {
		if (event.target.closest?.('.ac-composer, .ac-float-btn')) return;
		handlePotentialSelection();
	});
	document.addEventListener('touchend', (event) => {
		if (event.target.closest?.('.ac-composer, .ac-float-btn')) return;
		handlePotentialSelection();
	});
	document.addEventListener('selectionchange', () => {
		if (composer || document.activeElement?.closest?.('.ac-composer')) return;
		handlePotentialSelection();
	});
	// Escape / clicks elsewhere collapse the float button naturally via selection change.

	// Mount anchored-comment sections under feed cards (infinite river) and pages.
	scanAndMount();
	const mo = new MutationObserver(() => scanAndMount());
	mo.observe(document.body, { childList: true, subtree: true });

	// Deep-link support: #ac-<commentId> flashes the anchor on load.
	const hash = location.hash.match(/^#ac-(.+)$/);
	if (hash) {
		const commentId = decodeURIComponent(hash[1]);
		setTimeout(() => {
			for (const postId of new Set(
				[...document.querySelectorAll('[data-ac-list-for]')].map(el => el.dataset.acListFor)
			)) {
				const found = readAnchored(postId).find(c => c.id === commentId);
				if (found) {
					jumpToAnchor({ postId, heichelId: found.heichelId, seriesId: found.seriesId }, found);
					break;
				}
			}
		}, 800);
	}
}
