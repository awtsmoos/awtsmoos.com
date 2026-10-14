// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module FeedCollections
 * @description
 * Yaakov 2026-10-14: named collections (folders) of saved posts for the
 * Awtsmoos River. Readers create, rename, and delete collections, add and
 * remove posts from the post action menu, and browse everything on a
 * collections view. Raw post ids and machine slugs are never shown to
 * readers — only human titles.
 *
 * Storage: localStorage `awtsmoos-collections-v1`, per alias. Each post is
 * stored as a small snapshot (id, title, Hebrew title, link) so the view
 * works even when the river is offline.
 */

export const COLLECTIONS_STORAGE_KEY = 'awtsmoos-collections-v1';
export const MAX_COLLECTION_NAME = 60;
export const MAX_COLLECTIONS = 50;
export const MAX_POSTS_PER_COLLECTION = 500;

function currentAlias() {
	return window.curAlias || window.currentAlias ||
		document.body?.dataset?.aliasId ||
		localStorage.getItem('awtsmoos-alias') || 'anonymous';
}

function readAll() {
	try {
		const raw = localStorage.getItem(COLLECTIONS_STORAGE_KEY);
		const parsed = raw ? JSON.parse(raw) : null;
		return parsed && typeof parsed === 'object' ? parsed : {};
	} catch (_) { /* private mode */ return {}; }
}

function writeAll(all) {
	try {
		localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(all));
	} catch (_) { /* quota or private mode — the feed still works */ }
}

function stateFor(alias) {
	const all = readAll();
	const key = String(alias || currentAlias());
	const s = all[key] && typeof all[key] === 'object' ? all[key] : {};
	return { all, key, collections: Array.isArray(s.collections) ? s.collections : [] };
}

function saveState({ all, key, collections }) {
	all[key] = { collections };
	writeAll(all);
	try {
		window.dispatchEvent(new CustomEvent('awtsmoos-collections', {
			detail: { alias: key, count: collections.length }
		}));
	} catch (_) { /* event buses must never throw */ }
}

function makeId(prefix) {
	return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function cleanName(name) {
	return String(name || '').replace(/\s+/g, ' ').trim().slice(0, MAX_COLLECTION_NAME);
}

/** Link builder mirroring cards.js postHref (kept local to avoid a cycle). */
export function collectionPostHref(post) {
	const h = post.heichelId || 'ikar';
	const s = post.seriesId || 'root';
	const p = post.postId || post.id || '';
	return `/heichelos/${encodeURIComponent(h)}/series/${encodeURIComponent(s)}/${encodeURIComponent(p)}`;
}

/** Small display snapshot of a post — ids never reach the reader's eye. */
export function postSnapshot(item = {}) {
	return {
		postId: String(item.postId || item.id || ''),
		title: String(item.title || 'Untitled'),
		heTitle: String(item.heTitle || ''),
		heichelId: String(item.heichelId || ''),
		seriesId: String(item.seriesId || ''),
		savedAt: Date.now()
	};
}

function postLinkOf(snapshot) {
	return collectionPostHref(snapshot);
}

/* ============ CRUD ============ */

/** @returns {Array} collections for the alias, oldest first. */
export function listCollections(alias) {
	return stateFor(alias).collections.map(c => ({ ...c, posts: [...(c.posts || [])] }));
}

export function getCollection(id, alias) {
	return listCollections(alias).find(c => c.id === String(id)) || null;
}

/** Creates a collection; returns it. */
export function createCollection(name, alias) {
	const st = stateFor(alias);
	if (st.collections.length >= MAX_COLLECTIONS) return null;
	const clean = cleanName(name) || 'Untitled collection';
	const col = {
		id: makeId('col-'),
		name: clean,
		createdAt: Date.now(),
		posts: []
	};
	st.collections.push(col);
	saveState(st);
	return col;
}

export function renameCollection(id, name, alias) {
	const st = stateFor(alias);
	const col = st.collections.find(c => c.id === String(id));
	if (!col) return false;
	const clean = cleanName(name);
	if (!clean) return false;
	col.name = clean;
	saveState(st);
	return true;
}

export function deleteCollection(id, alias) {
	const st = stateFor(alias);
	const before = st.collections.length;
	st.collections = st.collections.filter(c => c.id !== String(id));
	if (st.collections.length === before) return false;
	saveState(st);
	return true;
}

export function collectionHasPost(id, postId, alias) {
	const col = getCollection(id, alias);
	if (!col) return false;
	return (col.posts || []).some(p => String(p.postId) === String(postId));
}

export function addPostToCollection(id, item, alias) {
	const st = stateFor(alias);
	const col = st.collections.find(c => c.id === String(id));
	if (!col) return false;
	const snap = postSnapshot(item);
	if (!snap.postId) return false;
	if (col.posts.some(p => String(p.postId) === snap.postId)) return true; // idempotent
	if (col.posts.length >= MAX_POSTS_PER_COLLECTION) return false;
	col.posts.push(snap);
	saveState(st);
	return true;
}

export function removePostFromCollection(id, postId, alias) {
	const st = stateFor(alias);
	const col = st.collections.find(c => c.id === String(id));
	if (!col) return false;
	const before = col.posts.length;
	col.posts = col.posts.filter(p => String(p.postId) !== String(postId));
	if (col.posts.length === before) return false;
	saveState(st);
	return true;
}

export function togglePostInCollection(id, item, alias) {
	const postId = String(item.postId || item.id || '');
	if (collectionHasPost(id, postId, alias)) {
		removePostFromCollection(id, postId, alias);
		return false;
	}
	addPostToCollection(id, item, alias);
	return true;
}

/** @returns {Array<string>} collection ids containing the post. */
export function collectionsContainingPost(item, alias) {
	const postId = String(item.postId || item.id || '');
	if (!postId) return [];
	return listCollections(alias)
		.filter(c => (c.posts || []).some(p => String(p.postId) === postId))
		.map(c => c.id);
}

/* ============ "Save to collection" picker inside the post action menu ============ */
/* B"H — the picker renders INTO the open ⋯ menu from cards.js: one row per
   collection (checked when it holds this post), plus an inline "New
   collection" form. No window.prompt — the menu stays in place. */

const FOLDER_SVG = '<svg class="feed-ic feed-menu-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 6.5a1 1 0 0 1 1-1h5l2 2.5h7a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1z"/></svg>';
const CHECK_SVG = '<svg class="feed-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';

function escapeHtml(s) {
	return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(s) {
	return escapeHtml(s).replace(/'/g, '&#39;');
}

/**
 * Replaces the open card menu's contents with the collection picker.
 * @param {HTMLElement} menu The open .feed-menu element.
 * @param {object} item The feed item.
 * @param {Function} back Called to restore the original menu contents.
 */
export function renderCollectionPicker(menu, item, back) {
	const cols = listCollections();
	const postId = String(item.postId || item.id || '');
	menu.innerHTML =
		'<p class="feed-menu-head">Save to collection</p>' +
		'<div class="feed-collection-picker" role="group" aria-label="Collections">' +
		(cols.length
			? cols.map(c => {
				const has = collectionHasPost(c.id, postId);
				const n = (c.posts || []).length;
				return `<button type="button" class="feed-menu-item feed-collection-row${has ? ' is-active' : ''}" data-col-toggle="${escapeAttr(c.id)}" role="menuitemcheckbox" aria-checked="${has}">` +
					`<span class="feed-menu-check">${has ? CHECK_SVG : ''}</span>${FOLDER_SVG}` +
					`<span class="feed-collection-row-name">${escapeHtml(c.name)}</span>` +
					`<span class="feed-collection-row-count">${n}</span></button>`;
			}).join('')
			: '<p class="feed-collection-empty">No collections yet — make one below.</p>') +
		'</div>' +
		'<form class="feed-collection-new">' +
			`<input type="text" class="feed-collection-new-input" maxlength="${MAX_COLLECTION_NAME}" placeholder="New collection name…" aria-label="New collection name">` +
			'<button type="submit" class="feed-collection-new-btn">Create</button>' +
		'</form>' +
		'<hr class="feed-menu-sep">' +
		'<button type="button" class="feed-menu-item" data-col-back role="menuitem"><span>← Back</span></button>';

	menu.querySelectorAll('[data-col-toggle]').forEach(btn => {
		btn.addEventListener('click', (ev) => {
			ev.stopPropagation();
			const added = togglePostInCollection(btn.dataset.colToggle, item);
			btn.classList.toggle('is-active', added);
			btn.setAttribute('aria-checked', String(added));
			const check = btn.querySelector('.feed-menu-check');
			if (check) check.innerHTML = added ? CHECK_SVG : '';
			const count = btn.querySelector('.feed-collection-row-count');
			if (count) {
				const col = getCollection(btn.dataset.colToggle);
				if (col) count.textContent = String((col.posts || []).length);
			}
		});
	});

	menu.querySelector('.feed-collection-new')?.addEventListener('submit', (ev) => {
		ev.preventDefault();
		ev.stopPropagation();
		const input = menu.querySelector('.feed-collection-new-input');
		const name = cleanName(input?.value || '');
		if (!name) { input?.focus(); return; }
		const col = createCollection(name);
		if (col) {
			addPostToCollection(col.id, item);
			renderCollectionPicker(menu, item, back); // repaint with the new row checked
		}
	});

	menu.querySelector('[data-col-back]')?.addEventListener('click', (ev) => {
		ev.stopPropagation();
		back?.();
	});
}

/* ============ collections view ============ */
/* B"H — openCollectionsView swaps the river for the collections panel and
   back again. It never touches sibling workers' DOM beyond the feed-main
   subtree it is given. */

let collectionsViewEl = null;

function closeCollectionsView() {
	if (!collectionsViewEl) return;
	const { panel, main } = collectionsViewEl;
	panel.remove();
	main.classList.remove('feed-main--collections');
	for (const el of main.querySelectorAll('[data-collections-hidden]')) {
		el.removeAttribute('hidden');
		el.removeAttribute('data-collections-hidden');
	}
	collectionsViewEl = null;
}

export function isCollectionsViewOpen() {
	return !!collectionsViewEl;
}

/**
 * Opens the collections view inside .feed-main.
 * @param {HTMLElement} main The .feed-main element.
 */
export function openCollectionsView(main) {
	if (!main || collectionsViewEl) return;
	const panel = document.createElement('section');
	panel.className = 'feed-collections';
	panel.setAttribute('aria-label', 'My collections');
	main.classList.add('feed-main--collections');
	for (const sel of ['.feed-tabs', '.feed-river', '.feed-status', '.feed-sentinel-wrap']) {
		const el = main.querySelector(sel);
		if (el && !el.hidden) {
			el.setAttribute('hidden', '');
			el.setAttribute('data-collections-hidden', '1');
		}
	}
	main.append(panel);
	collectionsViewEl = { panel, main };
	renderCollectionsPanel(panel);
	// Leaving via a tab closes the view so the river never goes stale.
	main.querySelector('.feed-tabs')?.addEventListener('click', closeCollectionsView, { once: true });
	panel.querySelector('.feed-collections-back')?.addEventListener('click', closeCollectionsView);
}

function renderCollectionsPanel(panel) {
	const cols = listCollections();
	const totalPosts = cols.reduce((s, c) => s + (c.posts || []).length, 0);
	panel.innerHTML =
		'<header class="feed-collections-head">' +
			'<button type="button" class="feed-collections-back">← Back to river</button>' +
			'<h2 class="feed-collections-title">My collections</h2>' +
			`<p class="feed-collections-sub">${cols.length} ${cols.length === 1 ? 'collection' : 'collections'} · ${totalPosts} saved ${totalPosts === 1 ? 'post' : 'posts'}</p>` +
			'<form class="feed-collection-new feed-collection-new--page">' +
				`<input type="text" class="feed-collection-new-input" maxlength="${MAX_COLLECTION_NAME}" placeholder="New collection name…" aria-label="New collection name">` +
				'<button type="submit" class="feed-collection-new-btn">Create</button>' +
			'</form>' +
		'</header>' +
		(cols.length
			? '<div class="feed-collections-grid">' + cols.map(collectionCardHtml).join('') + '</div>'
			: '<p class="feed-collections-empty">No collections yet. Open any post’s ⋯ menu and choose “Save to collection”.</p>');

	panel.querySelector('.feed-collection-new--page')?.addEventListener('submit', (ev) => {
		ev.preventDefault();
		const input = panel.querySelector('.feed-collection-new--page .feed-collection-new-input');
		const name = cleanName(input?.value || '');
		if (!name) { input?.focus(); return; }
		if (createCollection(name)) renderCollectionsPanel(panel);
	});

	panel.querySelectorAll('[data-col-open]').forEach(btn => {
		btn.addEventListener('click', () => {
			const card = btn.closest('.feed-collection-card');
			card?.classList.toggle('is-open');
			btn.setAttribute('aria-expanded', String(card?.classList.contains('is-open') || false));
		});
	});
	panel.querySelectorAll('[data-col-rename]').forEach(btn => {
		btn.addEventListener('click', () => {
			const id = btn.dataset.colRename;
			const col = getCollection(id);
			if (!col) return;
			const card = btn.closest('.feed-collection-card');
			const nameEl = card?.querySelector('.feed-collection-card-name');
			const form = card?.querySelector('.feed-collection-rename-form');
			if (!form || !nameEl) return;
			const input = form.querySelector('input');
			if (input) input.value = col.name;
			const editing = form.hasAttribute('hidden');
			form.toggleAttribute('hidden', !editing);
			nameEl.toggleAttribute('hidden', editing);
			btn.setAttribute('aria-expanded', String(editing));
			if (editing) input?.focus();
		});
	});
	panel.querySelectorAll('.feed-collection-rename-form').forEach(form => {
		form.addEventListener('submit', (ev) => {
			ev.preventDefault();
			const id = form.dataset.colRenameForm;
			const input = form.querySelector('input');
			if (renameCollection(id, input?.value || '')) renderCollectionsPanel(panel);
			else input?.focus();
		});
		form.querySelector('[data-rename-cancel]')?.addEventListener('click', () => {
			const card = form.closest('.feed-collection-card');
			form.setAttribute('hidden', '');
			card?.querySelector('.feed-collection-card-name')?.removeAttribute('hidden');
		});
	});
	panel.querySelectorAll('[data-col-delete]').forEach(btn => {
		btn.addEventListener('click', () => {
			const id = btn.dataset.colDelete;
			const col = getCollection(id);
			if (!col) return;
			if (btn.dataset.armed === '1') {
				deleteCollection(id);
				renderCollectionsPanel(panel);
			} else {
				btn.dataset.armed = '1';
				btn.textContent = `Delete “${col.name}”? Tap again`;
				setTimeout(() => {
					if (document.body.contains(btn)) {
						delete btn.dataset.armed;
						btn.textContent = 'Delete';
					}
				}, 4000);
			}
		});
	});
	panel.querySelectorAll('[data-col-remove-post]').forEach(btn => {
		btn.addEventListener('click', () => {
			if (removePostFromCollection(btn.dataset.colRemovePost, btn.dataset.postId)) {
				renderCollectionsPanel(panel);
			}
		});
	});
}

function collectionCardHtml(col) {
	const posts = col.posts || [];
	const stamp = col.createdAt ? new Date(col.createdAt).toLocaleDateString() : '';
	return `<article class="feed-collection-card" data-collection="${escapeAttr(col.id)}">` +
		'<header class="feed-collection-card-head">' +
			`<span class="feed-collection-card-ic" aria-hidden="true">${FOLDER_SVG}</span>` +
			`<h3 class="feed-collection-card-name">${escapeHtml(col.name)}</h3>` +
			`<form class="feed-collection-rename-form" data-col-rename-form="${escapeAttr(col.id)}" hidden>` +
				`<input type="text" maxlength="${MAX_COLLECTION_NAME}" aria-label="Rename collection">` +
				'<button type="submit">Save</button>' +
				'<button type="button" data-rename-cancel>Cancel</button>' +
			'</form>' +
			`<span class="feed-collection-card-count">${posts.length}</span>` +
		'</header>' +
		`<p class="feed-collection-card-meta">Started ${escapeHtml(stamp)}</p>` +
		'<div class="feed-collection-card-tools">' +
			`<button type="button" data-col-open aria-expanded="false">View posts</button>` +
			`<button type="button" data-col-rename="${escapeAttr(col.id)}" aria-expanded="false">Rename</button>` +
			`<button type="button" data-col-delete="${escapeAttr(col.id)}">Delete</button>` +
		'</div>' +
		(posts.length
			? '<ul class="feed-collection-posts">' + posts.map(p =>
				`<li class="feed-collection-post">` +
					`<a class="feed-collection-post-link" href="${escapeAttr(postLinkOf(p))}">` +
						`<span class="feed-collection-post-title" dir="auto">${escapeHtml(p.title)}</span>` +
						(p.heTitle ? `<span class="feed-collection-post-hetitle" dir="rtl" lang="he">${escapeHtml(p.heTitle)}</span>` : '') +
					'</a>' +
					`<button type="button" class="feed-collection-post-remove" data-col-remove-post="${escapeAttr(col.id)}" data-post-id="${escapeAttr(p.postId)}" aria-label="Remove ${escapeAttr(p.title)} from ${escapeAttr(col.name)}">✕</button>` +
				'</li>').join('') + '</ul>'
			: '<p class="feed-collection-posts-empty">Nothing saved here yet.</p>') +
	'</article>';
}

/* ============ topbar entry point ============ */

const TOPBAR_FOLDER_SVG = '<svg class="feed-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3.5 6.5a1 1 0 0 1 1-1h5l2 2.5h7a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1z"/></svg>';

/**
 * Adds the Collections button to the feed topbar and wires the view.
 */
export function initCollections() {
	const topbar = document.querySelector('.feed-topbar');
	const main = document.querySelector('.feed-main');
	if (!topbar || !main || topbar.querySelector('.feed-collections-btn')) return;
	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'feed-ic-btn feed-collections-btn';
	btn.setAttribute('aria-label', 'My collections');
	btn.title = 'My collections';
	btn.innerHTML = `${TOPBAR_FOLDER_SVG}<span class="feed-ic-btn-label">Collections</span>`;
	btn.addEventListener('click', () => {
		if (isCollectionsViewOpen()) closeCollectionsView();
		else openCollectionsView(main);
	});
	const filterToggle = topbar.querySelector('.feed-filter-toggle');
	if (filterToggle?.nextSibling) topbar.insertBefore(btn, filterToggle.nextSibling);
	else topbar.append(btn);
}
