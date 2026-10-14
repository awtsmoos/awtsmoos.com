// B"H
/**
 * @module SourceSheets
 * @description
 * B"H — Yaakov 2026-10-13: source sheet builder. Add posts to a sheet from
 * any card ("Add to sheet"), reorder sources, interleave custom headings and
 * notes, print a clean numbered layout, save sheets locally, and share them
 * with a link (the sheet travels in the URL hash — no server round trip).
 *
 * Sheets are stored in localStorage under awtsmoos-feed-source-sheets.
 * A sheet is an ordered list of blocks:
 *   { kind: 'source', title, excerpt, url }
 *   { kind: 'heading', text }
 *   { kind: 'note', text }
 */

import { icon, escapeHtml, escapeAttr } from './icons.js';

const STORE_KEY = 'awtsmoos-feed-source-sheets';
const DRAFT_KEY = 'awtsmoos-feed-source-sheet-draft';

function uid() {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
	return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function readStore(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch (_) { return fallback; }
}

export function writeStore(key, value) {
	try { localStorage.setItem(key, JSON.stringify(value)); return true; }
	catch (_) { return false; }
}

function loadSheets() {
	return readStore(STORE_KEY, []);
}

function saveSheets(sheets) {
	return writeStore(STORE_KEY, sheets);
}

function postHref(item) {
	const h = item.heichelId || 'ikar';
	const s = item.seriesId || 'root';
	const p = item.postId || item.id || '';
	return `/heichelos/${encodeURIComponent(h)}/series/${encodeURIComponent(s)}/${encodeURIComponent(p)}`;
}

function sourceBlockFromItem(item) {
	return {
		kind: 'source',
		title: String(item.title || item.heTitle || 'Untitled'),
		heTitle: String(item.heTitle || ''),
		excerpt: String(item.excerpt || item.summary || item.description || '').slice(0, 600),
		url: postHref(item)
	};
}

/* ================= sheet payload encoding (share links) ================= */

function encodeSheet(sheet) {
	const json = JSON.stringify({ name: sheet.name, blocks: sheet.blocks });
	return btoa(unescape(encodeURIComponent(json)))
		.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeSheet(payload) {
	try {
		const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
		const json = decodeURIComponent(escape(atob(b64)));
		const data = JSON.parse(json);
		if (!data || !Array.isArray(data.blocks)) return null;
		return {
			name: String(data.name || 'Shared source sheet'),
			blocks: data.blocks.filter(b => b && (b.kind === 'source' || b.kind === 'heading' || b.kind === 'note'))
		};
	} catch (_) { return null; }
}

export function sharedSheetFromHash() {
	const m = location.hash.match(/^#sheet=([A-Za-z0-9\-_]+)/);
	return m ? decodeSheet(m[1]) : null;
}

/* ================= editor ================= */

function blockHtml(block, i, total) {
	if (block.kind === 'heading') {
		return `<li class="sheet-block" data-block="${i}" draggable="true">
			<h4>${escapeHtml(block.text || 'Heading')}</h4>
			<div class="sheet-source-tools">
				<button type="button" class="sheet-mini-btn" data-act="edit">Edit</button>
				${i > 0 ? '<button type="button" class="sheet-mini-btn" data-act="up">↑ Move up</button>' : ''}
				${i < total - 1 ? '<button type="button" class="sheet-mini-btn" data-act="down">↓ Move down</button>' : ''}
				<button type="button" class="sheet-mini-btn" data-act="del">Remove</button>
			</div></li>`;
	}
	if (block.kind === 'note') {
		return `<li class="sheet-block" data-block="${i}" draggable="true">
			<p>${escapeHtml(block.text || '')}</p>
			<div class="sheet-source-tools">
				<button type="button" class="sheet-mini-btn" data-act="edit">Edit</button>
				${i > 0 ? '<button type="button" class="sheet-mini-btn" data-act="up">↑ Move up</button>' : ''}
				${i < total - 1 ? '<button type="button" class="sheet-mini-btn" data-act="down">↓ Move down</button>' : ''}
				<button type="button" class="sheet-mini-btn" data-act="del">Remove</button>
			</div></li>`;
	}
	const num = blockNum(block, i);
	return `<li class="sheet-source" data-block="${i}" draggable="true">
		<div class="sheet-source-top">
			<span class="sheet-num">${num}.</span>
			<span class="sheet-source-title" dir="auto">${escapeHtml(block.title || 'Untitled')}</span>
		</div>
		${block.excerpt ? `<p class="sheet-source-excerpt" dir="auto">${escapeHtml(block.excerpt)}</p>` : ''}
		<div class="sheet-source-tools">
			<a class="sheet-mini-btn" href="${escapeAttr(block.url || '#')}" target="_blank" rel="noopener">Open post</a>
			${i > 0 ? '<button type="button" class="sheet-mini-btn" data-act="up">↑ Move up</button>' : ''}
			${i < total - 1 ? '<button type="button" class="sheet-mini-btn" data-act="down">↓ Move down</button>' : ''}
			<button type="button" class="sheet-mini-btn" data-act="del">Remove</button>
		</div></li>`;
}

/** Numbering counts sources only, in display order. */
function blockNum(block, i) {
	return i; // placeholder replaced below
}

function editorHtml(sheet) {
	let sourceNo = 0;
	const items = sheet.blocks.map((b, i) => {
		if (b.kind === 'source') {
			sourceNo += 1;
			const html = blockHtml(b, i, sheet.blocks.length);
			return html.replace(`<span class="sheet-num">${i}.</span>`, `<span class="sheet-num">${sourceNo}.</span>`);
		}
		return blockHtml(b, i, sheet.blocks.length);
	}).join('');
	return `
		<div class="learn-row" style="margin-bottom:8px">
			<button type="button" class="learn-btn" data-sheet="back">${icon('chevronUp')}<span>All sheets</span></button>
			<span class="grow"></span>
			<button type="button" class="learn-btn" data-sheet="print">${icon('sheet')}<span>Print</span></button>
			<button type="button" class="learn-btn primary" data-sheet="share">${icon('share')}<span>Share link</span></button>
		</div>
		<label class="learn-label" for="sheet-name">Sheet name</label>
		<input class="learn-input" id="sheet-name" data-sheet="name" maxlength="120" value="${escapeAttr(sheet.name || '')}" placeholder="e.g. Shabbos sources">
		<h3>Sources <span style="color:var(--aw-text-soft);font-weight:400">(${sheet.blocks.filter(b => b.kind === 'source').length})</span></h3>
		<ol class="sheet-list" data-sheet="list">${items || '<li class="learn-empty"><p>No sources yet — tap “Add to sheet” on any post card.</p></li>'}</ol>
		<div class="learn-row" style="margin-top:12px">
			<button type="button" class="learn-btn" data-sheet="add-heading">${icon('plus')}<span>Heading</span></button>
			<button type="button" class="learn-btn" data-sheet="add-note">${icon('plus')}<span>Note</span></button>
		</div>
		<div class="sheet-link" data-sheet="link" hidden></div>`;
}

function moveBlock(sheet, i, delta) {
	const j = i + delta;
	if (j < 0 || j >= sheet.blocks.length) return;
	const [b] = sheet.blocks.splice(i, 1);
	sheet.blocks.splice(j, 0, b);
}

function openEditor(el, sheet, { readonly = false } = {}) {
	el.innerHTML = editorHtml(sheet);
	const list = el.querySelector('[data-sheet="list"]');

	function rerender() {
		const scroll = el.closest('.learn-panel')?.scrollTop || 0;
		openEditor(el, sheet, { readonly });
		const panel = el.closest('.learn-panel');
		if (panel) panel.scrollTop = scroll;
	}

	list.querySelectorAll('[data-block]').forEach(li => {
		const i = Number(li.dataset.block);
		li.querySelectorAll('[data-act]').forEach(btn => {
			btn.addEventListener('click', () => {
				const act = btn.dataset.act;
				if (act === 'del') {
					sheet.blocks.splice(i, 1);
					persist();
					rerender();
				} else if (act === 'up') {
					moveBlock(sheet, i, -1);
					persist();
					rerender();
				} else if (act === 'down') {
					moveBlock(sheet, i, 1);
					persist();
					rerender();
				} else if (act === 'edit') {
					const cur = sheet.blocks[i].text || '';
					const next = prompt('Edit text:', cur);
					if (next !== null) {
						sheet.blocks[i].text = next.slice(0, 2000);
						persist();
						rerender();
					}
				}
			});
		});
		// HTML5 drag reorder.
		li.addEventListener('dragstart', (e) => {
			li.classList.add('dragging');
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', String(i));
		});
		li.addEventListener('dragend', () => li.classList.remove('dragging'));
		li.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
		li.addEventListener('drop', (e) => {
			e.preventDefault();
			const from = Number(e.dataTransfer.getData('text/plain'));
			if (Number.isFinite(from) && from !== i) {
				const [b] = sheet.blocks.splice(from, 1);
				sheet.blocks.splice(i, 0, b);
				persist();
				rerender();
			}
		});
	});

	function persist() {
		if (readonly) return;
		const sheets = loadSheets();
		const idx = sheets.findIndex(s => s.id === sheet.id);
		if (idx >= 0) { sheets[idx] = sheet; saveSheets(sheets); }
		else writeStore(DRAFT_KEY, sheet);
	}

	const nameInput = el.querySelector('[data-sheet="name"]');
	if (readonly) nameInput.disabled = true;
	else nameInput.addEventListener('input', () => {
		sheet.name = nameInput.value;
		sheet.updatedAt = Date.now();
		persist();
	});

	el.querySelector('[data-sheet="back"]').addEventListener('click', () => mount(el, {}));
	el.querySelector('[data-sheet="print"]').addEventListener('click', () => printSheet(sheet));

	if (!readonly) {
		el.querySelector('[data-sheet="add-heading"]').addEventListener('click', () => {
			const text = prompt('Heading text:');
			if (text && text.trim()) {
				sheet.blocks.push({ kind: 'heading', text: text.trim().slice(0, 200) });
				persist();
				rerender();
			}
		});
		el.querySelector('[data-sheet="add-note"]').addEventListener('click', () => {
			const text = prompt('Note text:');
			if (text && text.trim()) {
				sheet.blocks.push({ kind: 'note', text: text.trim().slice(0, 2000) });
				persist();
				rerender();
			}
		});
	}

	el.querySelector('[data-sheet="share"]').addEventListener('click', () => {
		const url = location.origin + location.pathname + '#sheet=' + encodeSheet(sheet);
		const box = el.querySelector('[data-sheet="link"]');
		box.hidden = false;
		box.innerHTML = `Share this link — anyone opening it sees this sheet:<br><span dir="ltr">${escapeHtml(url)}</span><div class="learn-row" style="margin-top:8px"><button type="button" class="learn-btn" data-copy-link>Copy link</button></div>`;
		box.querySelector('[data-copy-link]').addEventListener('click', async () => {
			try { await navigator.clipboard.writeText(url); }
			catch (_) {
				const ta = document.createElement('textarea');
				ta.value = url;
				document.body.append(ta);
				ta.select();
				try { document.execCommand('copy'); } catch (_) {}
				ta.remove();
			}
		});
	});
}

function printSheet(sheet) {
	let sourceNo = 0;
	const parts = sheet.blocks.map(b => {
		if (b.kind === 'heading') return `<h2>${escapeHtml(b.text || '')}</h2>`;
		if (b.kind === 'note') return `<p>${escapeHtml(b.text || '')}</p>`;
		sourceNo += 1;
		return `<div class="sheet-print-source"><span class="sheet-print-num">${sourceNo}.</span><strong dir="auto">${escapeHtml(b.title || 'Untitled')}</strong>${b.excerpt ? `<p dir="auto">${escapeHtml(b.excerpt)}</p>` : ''}</div>`;
	}).join('');
	let holder = document.querySelector('.feed-print-sheet');
	if (!holder) {
		holder = document.createElement('div');
		holder.className = 'feed-print-sheet';
		document.body.append(holder);
	}
	holder.innerHTML = `<h1>${escapeHtml(sheet.name || 'Source sheet')}</h1><p>Prepared with Awtsmoos</p>${parts}`;
	document.body.classList.add('feed-printing-sheet');
	const done = () => {
		document.body.classList.remove('feed-printing-sheet');
		window.removeEventListener('afterprint', done);
	};
	window.addEventListener('afterprint', done);
	window.print();
}

/* ================= hub mount ================= */

export async function mount(el, ctx) {
	const shared = sharedSheetFromHash();
	if (shared) {
		el.innerHTML = `<div class="learn-card"><h4>Shared source sheet</h4><p>Someone shared this sheet with you.</p></div>`;
		const wrap = document.createElement('div');
		el.append(wrap);
		openEditor(wrap, { id: uid(), name: shared.name, blocks: shared.blocks, updatedAt: Date.now() }, { readonly: true });
		const saveBtn = document.createElement('button');
		saveBtn.type = 'button';
		saveBtn.className = 'learn-btn primary';
		saveBtn.innerHTML = `${icon('save')}<span>Save a copy to my sheets</span>`;
		saveBtn.addEventListener('click', () => {
			const sheets = loadSheets();
			const sheet = { id: uid(), name: shared.name, blocks: shared.blocks, updatedAt: Date.now() };
			sheets.unshift(sheet);
			saveSheets(sheets);
			history.replaceState(null, '', location.pathname + location.search);
			mount(el, ctx);
		});
		el.append(saveBtn);
		return;
	}

	const sheets = loadSheets();
	const draft = readStore(DRAFT_KEY, null);
	const cards = sheets.map(s => `
		<div class="challenge-card">
			<h4 dir="auto">${escapeHtml(s.name || 'Untitled sheet')}</h4>
			<p class="challenge-meta">${s.blocks.filter(b => b.kind === 'source').length} sources · updated ${new Date(s.updatedAt || Date.now()).toLocaleDateString()}</p>
			<div class="learn-row">
				<button type="button" class="learn-btn" data-open-sheet="${escapeAttr(s.id)}">Open</button>
				<button type="button" class="learn-btn danger" data-del-sheet="${escapeAttr(s.id)}">Delete</button>
			</div>
		</div>`).join('');

	el.innerHTML = `
		<h3>Source sheets</h3>
		<p>Collect posts into printable study sheets — reorder sources, add headings and notes, then print or share a link.</p>
		<div class="learn-row" style="margin-bottom:10px">
			<button type="button" class="learn-btn primary" data-sheet="new">${icon('plus')}<span>New sheet</span></button>
			${draft && draft.blocks && draft.blocks.length ? `<button type="button" class="learn-btn" data-sheet="draft">Continue draft (${draft.blocks.length})</button>` : ''}
		</div>
		${cards || `<div class="learn-empty">${icon('sheet')}<p>No sheets yet. Tap “Add to sheet” on any post to start one.</p></div>`}`;

	el.querySelector('[data-sheet="new"]').addEventListener('click', () => {
		const sheet = { id: uid(), name: '', blocks: [], updatedAt: Date.now() };
		openEditor(el, sheet);
	});
	el.querySelector('[data-sheet="draft"]')?.addEventListener('click', () => {
		openEditor(el, draft);
	});
	el.querySelectorAll('[data-open-sheet]').forEach(btn => {
		btn.addEventListener('click', () => {
			const s = loadSheets().find(x => x.id === btn.dataset.openSheet);
			if (s) openEditor(el, s);
		});
	});
	el.querySelectorAll('[data-del-sheet]').forEach(btn => {
		btn.addEventListener('click', () => {
			if (!confirm('Delete this sheet?')) return;
			saveSheets(loadSheets().filter(x => x.id !== btn.dataset.delSheet));
			mount(el, ctx);
		});
	});
}

/* ================= per-card button ================= */

let hooksWired = false;

/** Adds "Add to sheet" to every feed card. Draft sheet collects sources. */
export function initCardHooks() {
	if (hooksWired) return;
	hooksWired = true;
	document.addEventListener('feed:card-mounted', (event) => {
		const { card, item } = event.detail || {};
		if (!card || !item) return;
		const actions = card.querySelector('.feed-card-actions');
		if (!actions || actions.querySelector('[data-add-sheet]')) return;
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'feed-ic-btn';
		btn.dataset.addSheet = '1';
		btn.setAttribute('aria-label', `Add to source sheet: ${String(item.title || 'Untitled')}`);
		btn.setAttribute('title', 'Add to source sheet');
		btn.innerHTML = `${icon('sheet')}<span class="feed-ic-btn-label">Sheet</span>`;
		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			const draft = readStore(DRAFT_KEY, null) || { id: uid(), name: '', blocks: [], updatedAt: Date.now() };
			draft.blocks.push(sourceBlockFromItem(item));
			draft.updatedAt = Date.now();
			writeStore(DRAFT_KEY, draft);
			const label = btn.querySelector('.feed-ic-btn-label');
			const prev = label.textContent;
			label.textContent = 'Added!';
			btn.setAttribute('aria-pressed', 'true');
			setTimeout(() => { label.textContent = prev; btn.removeAttribute('aria-pressed'); }, 1600);
		});
		const spacer = actions.querySelector('.feed-card-actions-spacer');
		if (spacer) spacer.before(btn);
		else actions.append(btn);
	});
}
