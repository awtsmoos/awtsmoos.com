// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module Offline
 * @description
 * Yaakov 2026-10-13 (TRACK D): Offline mode for the feed.
 * - "Download for offline" on heichelos and series pages (auto-mounted by URL).
 * - Posts cached via the Cache Storage API under synthetic /offline/posts/... URLs.
 * - Offline indicator banner; a downloads manager lists saved posts with
 *   sizes and delete buttons.
 * - Registers a simple service worker for the /feed/ scope (geelooy/feed/sw.js).
 */

import { icon, escapeHtml, escapeAttr } from './icons.js';

const CACHE_NAME = 'awtsmoos-offline-v1';
const INDEX_KEY = 'awtsmoos-offline-index';
const SW_URL = '/feed/sw.js';
const SW_SCOPE = '/feed/';

/** @returns {Promise<object>} {bytes: number} quota-ish estimate when available. */
export async function storageEstimate() {
	try {
		if (navigator.storage && navigator.storage.estimate) {
			const e = await navigator.storage.estimate();
			return { bytes: Number(e.usage || 0) };
		}
	} catch (_) { /* fall through */ }
	return { bytes: 0 };
}

function offlineUrl(h, s, p) {
	return `/offline/posts/${encodeURIComponent(h)}/${encodeURIComponent(s)}/${encodeURIComponent(p)}`;
}

function readIndex() {
	try {
		const raw = localStorage.getItem(INDEX_KEY);
		const list = raw ? JSON.parse(raw) : [];
		return Array.isArray(list) ? list : [];
	} catch (_) { return []; }
}

function writeIndex(list) {
	try { localStorage.setItem(INDEX_KEY, JSON.stringify(list)); } catch (_) {}
}

export function formatBytes(n) {
	n = Number(n) || 0;
	if (n < 1024) return `${n} B`;
	if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
	return `${(n / 1048576).toFixed(2)} MB`;
}

export function isDownloaded(h, s, p) {
	const key = `${h}/${s}/${p}`;
	return readIndex().some((e) => e.key === key);
}

/**
 * Downloads one post into the offline cache.
 * @param {{h: string, s: string, p: string, title: string, fetcher: () => Promise<object>}} opts
 * fetcher must resolve to the full post JSON (title, html/content).
 */
export async function downloadPost({ h, s, p, title, fetcher }) {
	const payload = await fetcher();
	const bytes = JSON.stringify(payload).length;
	const cache = await caches.open(CACHE_NAME);
	const url = offlineUrl(h, s, p);
	await cache.put(url, new Response(JSON.stringify(payload), {
		headers: { 'Content-Type': 'application/json' }
	}));
	const list = readIndex().filter((e) => e.key !== `${h}/${s}/${p}`);
	list.unshift({ key: `${h}/${s}/${p}`, h, s, p, title: title || payload.title || 'Post', bytes, savedAt: Date.now() });
	writeIndex(list);
	return { bytes };
}

export async function deletePost(h, s, p) {
	const cache = await caches.open(CACHE_NAME);
	await cache.delete(offlineUrl(h, s, p));
	writeIndex(readIndex().filter((e) => e.key !== `${h}/${s}/${p}`));
}

export async function listDownloads() {
	return readIndex();
}

/** Fetches one cached post's payload (null when missing). */
export async function readCachedPost(h, s, p) {
	try {
		const cache = await caches.open(CACHE_NAME);
		const res = await cache.match(offlineUrl(h, s, p));
		if (!res) return null;
		return await res.json();
	} catch (_) { return null; }
}

/** Minimal sanitizer: allow plain formatting tags only. */
function sanitizeSnippet(html) {
	const div = document.createElement('div');
	div.innerHTML = String(html || '');
	const allowed = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'BLOCKQUOTE', 'UL', 'OL', 'LI', 'H2', 'H3', 'H4']);
	const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT);
	const nodes = [];
	while (walker.nextNode()) nodes.push(walker.currentNode);
	for (const el of nodes) {
		if (!allowed.has(el.tagName)) {
			const parent = el.parentNode;
			while (el.firstChild) parent.insertBefore(el.firstChild, el);
			parent.removeChild(el);
		} else {
			for (const attr of [...el.attributes]) el.removeAttribute(attr.name);
		}
	}
	return div.innerHTML;
}

function downloadsHtml(list) {
	if (!list.length) {
		return '<p class="offline-empty">Nothing saved yet. Visit a heichel or series and tap \u201cDownload for offline\u201d.</p>';
	}
	return '<ul class="offline-list">' + list.map((e) => `
		<li class="offline-item">
			<div class="offline-item-main">
				<span class="offline-item-title" dir="auto">${escapeHtml(e.title)}</span>
				<span class="offline-item-meta">${formatBytes(e.bytes)} · saved ${new Date(e.savedAt).toLocaleDateString()}</span>
			</div>
			<div class="offline-item-tools">
				<button type="button" class="offline-open feed-ic-btn" data-offline-open="${escapeAttr(e.key)}" aria-label="Read saved post">${icon('book')}<span class="feed-ic-btn-label">Read</span></button>
				<button type="button" class="offline-del feed-ic-btn" data-offline-del="${escapeAttr(e.key)}" aria-label="Delete saved post">${icon('close')}<span class="feed-ic-btn-label">Delete</span></button>
			</div>
		</li>`).join('') + '</ul>';
}

function openDownloadsManager() {
	let modal = document.querySelector('.offline-modal');
	if (modal) { modal.remove(); return; }
	modal = document.createElement('div');
	modal.className = 'offline-modal';
	modal.setAttribute('role', 'dialog');
	modal.setAttribute('aria-label', 'Downloads for offline');
	modal.innerHTML = `
		<div class="offline-modal-card">
			<header class="offline-modal-head">
				<h2>Saved for offline</h2>
				<button type="button" class="feed-ic-btn offline-modal-close" aria-label="Close">${icon('close')}</button>
			</header>
			<div class="offline-modal-body"></div>
		</div>`;
	const body = modal.querySelector('.offline-modal-body');
	const paint = async () => {
		const list = await listDownloads();
		body.innerHTML = downloadsHtml(list);
	};
	paint();
	modal.querySelector('.offline-modal-close').addEventListener('click', () => modal.remove());
	modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
	body.addEventListener('click', async (e) => {
		const openBtn = e.target.closest('[data-offline-open]');
		const delBtn = e.target.closest('[data-offline-del]');
		if (openBtn) {
			const [h, s, p] = openBtn.dataset.offlineOpen.split('/');
			const payload = await readCachedPost(h, s, p);
			if (payload) {
				const reader = document.createElement('div');
				reader.className = 'offline-reader';
				reader.innerHTML = `
					<header class="offline-reader-head">
						<h3 dir="auto">${escapeHtml(payload.title || 'Saved post')}</h3>
						<button type="button" class="feed-ic-btn offline-reader-close" aria-label="Close reader">${icon('close')}</button>
					</header>
					<div class="offline-reader-body" dir="auto">${sanitizeSnippet(payload.content || payload.html || payload.text || '')}</div>`;
				reader.querySelector('.offline-reader-close').addEventListener('click', () => reader.remove());
				body.innerHTML = '';
				body.appendChild(reader);
			}
		}
		if (delBtn) {
			const [h, s, p] = delBtn.dataset.offlineDel.split('/');
			await deletePost(h, s, p);
			paint();
		}
	});
	document.body.appendChild(modal);
}

/** Offline indicator banner, shown only while navigator is offline. */
function mountOfflineIndicator() {
	if (document.querySelector('.offline-banner')) return;
	const banner = document.createElement('div');
	banner.className = 'offline-banner';
	banner.hidden = true;
	banner.innerHTML = `${icon('save', 'offline-banner-ic')}<span>You are offline — downloaded posts are still available.</span>
		<button type="button" class="offline-banner-open">Open downloads</button>`;
	banner.querySelector('.offline-banner-open').addEventListener('click', openDownloadsManager);
	document.body.prepend(banner);
	const paint = () => { banner.hidden = navigator.onLine; };
	window.addEventListener('online', paint);
	window.addEventListener('offline', paint);
	paint();
}

/**
 * Mounts a "Download for offline" button. On heichelos pages it downloads
 * every post the page knows about; callers may pass an explicit post list.
 * @param {HTMLElement} mount Where to place the button.
 * @param {{kind: 'heichel'|'series'|'post', h: string, s?: string, p?: string, posts?: Array, fetcher?: Function}} ctx
 */
export function mountDownloadButton(mount, ctx) {
	if (!mount || mount.dataset.offlineBtn) return;
	mount.dataset.offlineBtn = '1';
	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'feed-ic-btn offline-download-btn';
	btn.innerHTML = `${icon('save')}<span class="feed-ic-btn-label">Download for offline</span>`;
	btn.setAttribute('aria-label', ctx.kind === 'post' ? 'Download this post for offline' : 'Download for offline');
	mount.appendChild(btn);

	btn.addEventListener('click', async () => {
		btn.disabled = true;
		btn.querySelector('.feed-ic-btn-label').textContent = 'Downloading\u2026';
		try {
			const posts = ctx.posts || [];
			if (ctx.kind === 'post') {
				const payload = await ctx.fetcher();
				await downloadPost({ h: ctx.h, s: ctx.s, p: ctx.p, title: payload.title, fetcher: async () => payload });
				btn.querySelector('.feed-ic-btn-label').textContent = 'Saved';
			} else {
				let saved = 0, bytes = 0;
				for (const post of posts) {
					const payload = await ctx.fetcher(post);
					const r = await downloadPost({
						h: ctx.h, s: post.seriesId || ctx.s || 'root',
						p: post.postId || post.id, title: post.title,
						fetcher: async () => payload
					});
					saved++; bytes += r.bytes;
				}
				btn.querySelector('.feed-ic-btn-label').textContent = `Saved ${saved} (${formatBytes(bytes)})`;
			}
			setTimeout(() => { btn.disabled = false; btn.querySelector('.feed-ic-btn-label').textContent = 'Download for offline'; }, 3000);
		} catch (err) {
			btn.querySelector('.feed-ic-btn-label').textContent = 'Download failed';
			setTimeout(() => { btn.disabled = false; btn.querySelector('.feed-ic-btn-label').textContent = 'Download for offline'; }, 3000);
		}
	});
}

/**
 * Detects /heichelos/:h/series/:s(/post)? pages and mounts a download button
 * into the page's toolbar area. On the feed river itself it adds a "Saved"
 * topbar button opening the downloads manager.
 */
export function initOffline() {
	// Register the service worker for the feed scope.
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE }).catch(() => {});
	}
	mountOfflineIndicator();

	const m = location.pathname.match(/^\/heichelos\/([^/]+)(?:\/series\/([^/]+))?/);
	if (m) {
		const [, h, s] = m;
		const toolbar = document.querySelector('[data-offline-toolbar], .heichel-toolbar, .series-toolbar, main');
		if (toolbar) {
			const wrap = document.createElement('div');
			wrap.className = 'offline-download-wrap';
			toolbar.prepend(wrap);
			mountDownloadButton(wrap, {
				kind: s ? 'series' : 'heichel', h, s: s || 'root',
				posts: Array.isArray(window.__heichelPosts) ? window.__heichelPosts : [],
				fetcher: async (post) => {
					const res = await fetch(
						`/api/social/heichelos/${encodeURIComponent(h)}/series/${encodeURIComponent(post.seriesId || s || 'root')}/post/${encodeURIComponent(post.postId || post.id)}`,
						{ credentials: 'same-origin' }
					);
					if (!res.ok) throw new Error(`answered ${res.status}`);
					const body = await res.json();
					return body?.success ?? body ?? {};
				}
			});
		}
	}

	// Feed topbar: a "Saved" button opening the downloads manager.
	const topbar = document.querySelector('.feed-topbar');
	if (topbar && !topbar.querySelector('.offline-saved-btn')) {
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'feed-ic-btn offline-saved-btn';
		btn.innerHTML = `${icon('save')}<span class="feed-ic-btn-label">Saved</span>`;
		btn.setAttribute('aria-label', 'Downloads for offline');
		btn.addEventListener('click', openDownloadsManager);
		topbar.appendChild(btn);
	}
}
