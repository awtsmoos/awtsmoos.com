// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VerseComments.js
 * @description
 * Verse-level and section-level commenting for the reader.
 * Every phrase pair gets a subtle comment button; every section gets one too.
 * Tapping opens a bottom-sheet composer (mobile) or inline panel (desktop).
 * Comments are anchored to postId + phraseId/sectionId.
 */

const COMMENT_ICON_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

let postId = null;
let commentCounts = {}; // anchorKey -> count
let composerEl = null;

/**
 * Initializes verse commenting for a post.
 * @param {string} id - The post ID.
 */
export function initVerseComments(id) {
	postId = id;
	injectCommentButtons();
	loadCommentCounts();
	recordView();
}

/**
 * Records a view (deduped server-side).
 */
async function recordView() {
	try {
		const sessionId = getSessionId();
		const res = await fetch('/api/social/views/record', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ postId, sessionId })
		});
		const data = await res.json();
		if (data?.totalViews !== undefined) {
			updateViewDisplay(data.totalViews, data.formatted);
		}
	} catch { /* silent — views never break reading */ }
}

function getSessionId() {
	let sid = sessionStorage.getItem('awtsmoos-sid');
	if (!sid) {
		sid = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
		sessionStorage.setItem('awtsmoos-sid', sid);
	}
	return sid;
}

function updateViewDisplay(total, formatted) {
	document.querySelectorAll('[data-view-count]').forEach(el => {
		el.textContent = `${formatted || total} views`;
		el.dataset.viewCount = String(total);
	});
}

/**
 * Adds comment buttons to every phrase pair and section.
 */
function injectCommentButtons() {
	// Phrase-level buttons
	document.querySelectorAll('.meluket-phrase-pair:not([data-vc-done])').forEach(pair => {
		pair.dataset.vcDone = '1';
		const phraseId = pair.dataset.phraseId || `idx-${Array.from(pair.parentNode.children).indexOf(pair)}`;
		const btn = createCommentButton('phrase', phraseId, pair);
		pair.appendChild(btn);
	});

	// Section-level buttons
	document.querySelectorAll('.meluket-sefer-section:not([data-vc-done])').forEach(section => {
		section.dataset.vcDone = '1';
		const sectionId = section.dataset.sectionId || section.id || 'root';
		const marker = section.querySelector('.meluket-section-marker');
		if (marker) {
			const btn = createCommentButton('section', sectionId, section);
			btn.classList.add('vc-section-btn');
			marker.appendChild(btn);
		}
	});
}

function createCommentButton(kind, anchorId, contextEl) {
	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = `vc-comment-btn vc-comment-btn--${kind}`;
	btn.innerHTML = COMMENT_ICON_SVG;
	btn.setAttribute('aria-label', `Comment on this ${kind === 'phrase' ? 'verse' : 'section'}`);
	btn.dataset.anchorKind = kind;
	btn.dataset.anchorId = anchorId;
	// Touch-friendly: no text selection, no highlight
	btn.style.userSelect = 'none';
	btn.style.webkitUserSelect = 'none';
	btn.style.webkitTapHighlightColor = 'transparent';
	btn.addEventListener('click', (e) => {
		e.stopPropagation();
		openComposer(kind, anchorId, contextEl);
	});
	return btn;
}

function anchorKey(kind, anchorId) {
	return `${kind}:${anchorId}`;
}

/**
 * Loads comment counts for all anchors on this post.
 */
async function loadCommentCounts() {
	try {
		const anchors = [];
		document.querySelectorAll('.vc-comment-btn').forEach(btn => {
			anchors.push(anchorKey(btn.dataset.anchorKind, btn.dataset.anchorId));
		});
		if (!anchors.length) return;
		const res = await fetch('/api/social/comments/verse-counts', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ postId, anchors: anchors.slice(0, 500) })
		});
		const data = await res.json();
		if (data?.counts) {
			commentCounts = data.counts;
			updateBadges();
		}
	} catch { /* silent */ }
}

function updateBadges() {
	document.querySelectorAll('.vc-comment-btn').forEach(btn => {
		const key = anchorKey(btn.dataset.anchorKind, btn.dataset.anchorId);
		const count = commentCounts[key] || 0;
		let badge = btn.querySelector('.vc-count-badge');
		if (count > 0) {
			if (!badge) {
				badge = document.createElement('span');
				badge.className = 'vc-count-badge';
				btn.appendChild(badge);
			}
			badge.textContent = count > 99 ? '99+' : String(count);
			btn.classList.add('vc-has-comments');
		} else if (badge) {
			badge.remove();
			btn.classList.remove('vc-has-comments');
		}
	});
}

/**
 * Opens the comment composer for a verse/section.
 */
function openComposer(kind, anchorId, contextEl) {
	closeComposer();

	composerEl = document.createElement('div');
	composerEl.className = 'vc-composer-overlay';
	composerEl.innerHTML = `
		<div class="vc-composer-sheet" role="dialog" aria-modal="true" aria-label="Add a comment">
			<div class="vc-composer-handle"></div>
			<div class="vc-composer-header">
				<span class="vc-composer-title">Comment on this ${kind === 'phrase' ? 'verse' : 'section'}</span>
				<button type="button" class="vc-composer-close" aria-label="Close">✕</button>
			</div>
			<div class="vc-composer-context"></div>
			<div class="vc-composer-comments"><div class="vc-loading">Loading comments…</div></div>
			<textarea class="vc-composer-input" rows="3" placeholder="Share your thought…" aria-label="Your comment"></textarea>
			<div class="vc-composer-actions">
				<button type="button" class="vc-composer-cancel">Cancel</button>
				<button type="button" class="vc-composer-submit">Post comment</button>
			</div>
		</div>
	`;

	// Show quoted context
	const ctxEl = composerEl.querySelector('.vc-composer-context');
	const heText = contextEl.querySelector('.meluket-phrase--he')?.textContent?.trim().slice(0, 120);
	const enText = contextEl.querySelector('.meluket-phrase--en')?.textContent?.trim().slice(0, 120);
	if (heText || enText) {
		ctxEl.innerHTML = `<blockquote>${escapeHtml(heText || enText)}</blockquote>`;
	} else {
		ctxEl.remove();
	}

	// Wire up
	composerEl.querySelector('.vc-composer-close').addEventListener('click', closeComposer);
	composerEl.querySelector('.vc-composer-cancel').addEventListener('click', closeComposer);
	composerEl.addEventListener('click', (e) => {
		if (e.target === composerEl) closeComposer();
	});
	composerEl.querySelector('.vc-composer-submit').addEventListener('click', () =>
		submitComment(kind, anchorId)
	);

	document.body.appendChild(composerEl);
	requestAnimationFrame(() => composerEl.classList.add('vc-open'));

	loadAnchorComments(kind, anchorId);

	// Focus input on desktop
	if (window.innerWidth > 768) {
		setTimeout(() => composerEl.querySelector('.vc-composer-input')?.focus(), 300);
	}
}

function closeComposer() {
	if (composerEl) {
		composerEl.classList.remove('vc-open');
		setTimeout(() => composerEl?.remove(), 300);
		composerEl = null;
	}
}

async function loadAnchorComments(kind, anchorId) {
	const listEl = composerEl?.querySelector('.vc-composer-comments');
	if (!listEl) return;
	try {
		const params = new URLSearchParams({
			postId,
			verseSection: kind === 'phrase' ? anchorId : '',
			subsectionId: kind === 'section' ? anchorId : ''
		});
		const res = await fetch(`/api/social/comments/by-anchor?${params}`);
		const data = await res.json();
		const comments = Array.isArray(data?.comments) ? data.comments : [];
		if (!comments.length) {
			listEl.innerHTML = '<div class="vc-empty">No comments yet. Be the first.</div>';
			return;
		}
		listEl.innerHTML = comments.map(c => `
			<div class="vc-comment">
				<div class="vc-comment-author">${escapeHtml(c.alias || c.author || 'Anonymous')}</div>
				<div class="vc-comment-body">${escapeHtml(c.content || c.text || '')}</div>
			</div>
		`).join('');
	} catch {
		listEl.innerHTML = '<div class="vc-empty">Could not load comments.</div>';
	}
}

async function submitComment(kind, anchorId) {
	const input = composerEl?.querySelector('.vc-composer-input');
	const text = input?.value?.trim();
	if (!text) return;

	const submitBtn = composerEl.querySelector('.vc-composer-submit');
	submitBtn.disabled = true;
	submitBtn.textContent = 'Posting…';

	try {
		const body = {
			postId,
			content: text,
			verseSection: kind === 'phrase' ? anchorId : 'root',
			...(kind === 'section' ? { subsectionId: anchorId } : {})
		};
		const res = await fetch('/api/social/comments', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		const data = await res.json();
		if (data?.success || data?.comment) {
			input.value = '';
			// Refresh counts and list
			const key = anchorKey(kind, anchorId);
			commentCounts[key] = (commentCounts[key] || 0) + 1;
			updateBadges();
			await loadAnchorComments(kind, anchorId);
		} else {
			throw new Error(data?.error || 'Failed to post');
		}
	} catch (err) {
		alert('Could not post comment. Please try again.');
	} finally {
		submitBtn.disabled = false;
		submitBtn.textContent = 'Post comment';
	}
}

function escapeHtml(s) {
	return String(s || '').replace(/[&<>"']/g, c => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	}[c]));
}

// Re-inject when new content renders (client-side navigation)
if (typeof MutationObserver !== 'undefined') {
	let debounce = null;
	new MutationObserver(() => {
		if (!postId) return;
		clearTimeout(debounce);
		debounce = setTimeout(() => injectCommentButtons(), 500);
	}).observe(document.body, { childList: true, subtree: true });
}
