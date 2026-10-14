// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CreatorStudio
 * @description
 * Yaakov 2026-10-14 (TRACK J): the Creator Studio — post creation tools.
 *
 * - Rich editor: title, Hebrew passage (RTL), English passage (LTR), and a
 *   plain-text body, with a small formatting toolbar (bold/italic/quote)
 *   for the body field.
 * - Sources: attach source links (title + URL), listed and removable.
 * - Draft autosave: every keystroke is debounced into localStorage
 *   (`awtsmoos-studio-drafts:v1`); drafts survive reloads and can be
 *   resumed, renamed, or deleted.
 * - Preview: renders the draft the way a feed card would show it.
 * - Publish: UI ONLY. There is no publishing endpoint wired yet, so the
 *   publish button honestly says "Publish (coming online soon)" and is
 *   disabled with an explanatory note — never a fake success.
 *
 * Yaakov's rules honored: no !important (styling is in creatorStudio.css),
 * honest disabled states, user-facing strings never expose raw IDs.
 */

const DRAFTS_KEY = 'awtsmoos-studio-drafts:v1';
const AUTOSAVE_MS = 600;

function readDrafts() {
	try {
		const raw = localStorage.getItem(DRAFTS_KEY);
		const arr = raw ? JSON.parse(raw) : [];
		return Array.isArray(arr) ? arr : [];
	} catch (_) {
		return [];
	}
}

function writeDrafts(drafts) {
	try {
		localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
	} catch (_) { /* storage is best effort */ }
}

function escapeHtml(s) {
	return String(s ?? '').replace(/[&<>"']/g, c => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	}[c]));
}

function uid() {
	return 'd' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
}

function blankDraft() {
	return {
		id: uid(),
		title: '',
		hebrew: '',
		english: '',
		body: '',
		sources: [],
		updatedAt: Date.now()
	};
}

function getDraft(id) {
	return readDrafts().find(d => d.id === id) || null;
}

function saveDraft(draft) {
	const drafts = readDrafts();
	const i = drafts.findIndex(d => d.id === draft.id);
	draft.updatedAt = Date.now();
	if (i >= 0) drafts[i] = draft;
	else drafts.unshift(draft);
	writeDrafts(drafts.slice(0, 50));
}

function deleteDraft(id) {
	writeDrafts(readDrafts().filter(d => d.id !== id));
}

/* ------------------------------------------------------------------ */
/* studio panel                                                        */
/* ------------------------------------------------------------------ */

let panel = null;
let currentId = null;
let autosaveTimer = null;

function closeStudio() {
	flushAutosave();
	if (panel) {
		document.removeEventListener('keydown', panel._onKey);
		panel.remove();
		panel = null;
	}
	document.body.classList.remove('cs-open');
}

function collectDraft() {
	const d = getDraft(currentId) || blankDraft();
	d.title = panel.querySelector('[data-cs-title]').value;
	d.hebrew = panel.querySelector('[data-cs-hebrew]').value;
	d.english = panel.querySelector('[data-cs-english]').value;
	d.body = panel.querySelector('[data-cs-body]').value;
	return d;
}

function flushAutosave() {
	if (!panel || !currentId) return;
	clearTimeout(autosaveTimer);
	saveDraft(collectDraft());
	renderDraftList();
	updateSavedStamp();
}

function scheduleAutosave() {
	clearTimeout(autosaveTimer);
	autosaveTimer = setTimeout(() => {
		if (!panel || !currentId) return;
		saveDraft(collectDraft());
		updateSavedStamp();
	}, AUTOSAVE_MS);
}

function updateSavedStamp() {
	const el = panel?.querySelector('[data-cs-saved]');
	if (!el) return;
	const d = getDraft(currentId);
	el.textContent = d
		? 'Draft saved ' + new Date(d.updatedAt).toLocaleTimeString()
		: 'Not saved yet';
}

function renderDraftList() {
	const list = panel?.querySelector('[data-cs-drafts]');
	if (!list) return;
	const drafts = readDrafts();
	list.innerHTML = drafts.length ? drafts.map(d => `
		<li class="cs-draft${d.id === currentId ? ' is-active' : ''}">
			<button type="button" class="cs-draft-open" data-cs-open="${escapeHtml(d.id)}">
				<span class="cs-draft-title">${escapeHtml(d.title || 'Untitled draft')}</span>
				<time class="cs-draft-time">${escapeHtml(new Date(d.updatedAt).toLocaleString())}</time>
			</button>
			<button type="button" class="cs-draft-del" data-cs-del="${escapeHtml(d.id)}" aria-label="Delete draft ${escapeHtml(d.title || 'untitled')}">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
			</button>
		</li>`).join('')
		: '<li class="cs-draft-empty">No drafts yet. Your writing autosaves here.</li>';
	list.querySelectorAll('[data-cs-open]').forEach(b => b.addEventListener('click', () => loadDraft(b.dataset.csOpen)));
	list.querySelectorAll('[data-cs-del]').forEach(b => b.addEventListener('click', (e) => {
		e.stopPropagation();
		deleteDraft(b.dataset.csDel);
		if (b.dataset.csDel === currentId) newDraft();
		else renderDraftList();
	}));
}

function loadDraft(id) {
	flushAutosave();
	const d = getDraft(id);
	if (!d) return;
	currentId = d.id;
	panel.querySelector('[data-cs-title]').value = d.title || '';
	panel.querySelector('[data-cs-hebrew]').value = d.hebrew || '';
	panel.querySelector('[data-cs-english]').value = d.english || '';
	panel.querySelector('[data-cs-body]').value = d.body || '';
	renderSources();
	renderDraftList();
	updateSavedStamp();
	renderPreview();
}

function newDraft() {
	flushAutosave();
	const d = blankDraft();
	currentId = d.id;
	panel.querySelector('[data-cs-title]').value = '';
	panel.querySelector('[data-cs-hebrew]').value = '';
	panel.querySelector('[data-cs-english]').value = '';
	panel.querySelector('[data-cs-body]').value = '';
	renderSources();
	renderDraftList();
	updateSavedStamp();
	renderPreview();
}

function renderSources() {
	const box = panel.querySelector('[data-cs-sources]');
	const d = getDraft(currentId);
	const sources = d ? d.sources : [];
	box.innerHTML = sources.length ? sources.map((s, i) => `
		<li class="cs-source">
			<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.title || s.url)}</a>
			<button type="button" class="cs-source-del" data-cs-src-del="${i}" aria-label="Remove source ${escapeHtml(s.title || s.url)}">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
			</button>
		</li>`).join('')
		: '<li class="cs-source-empty">No sources attached yet.</li>';
	box.querySelectorAll('[data-cs-src-del]').forEach(b => b.addEventListener('click', () => {
		const dd = collectDraft();
		dd.sources.splice(Number(b.dataset.csSrcDel), 1);
		saveDraft(dd);
		renderSources();
		renderPreview();
	}));
}

function addSource() {
	const titleEl = panel.querySelector('[data-cs-src-title]');
	const urlEl = panel.querySelector('[data-cs-src-url]');
	const url = urlEl.value.trim();
	if (!url) { urlEl.focus(); return; }
	try { new URL(url); } catch (_) {
		urlEl.setAttribute('aria-invalid', 'true');
		urlEl.focus();
		return;
	}
	urlEl.removeAttribute('aria-invalid');
	const d = collectDraft();
	d.sources.push({ title: titleEl.value.trim(), url });
	saveDraft(d);
	titleEl.value = '';
	urlEl.value = '';
	renderSources();
	renderPreview();
	titleEl.focus();
}

function renderPreview() {
	const prev = panel.querySelector('[data-cs-preview]');
	if (!prev) return;
	const d = collectDraft();
	const paras = String(d.body || '').split(/\n{2,}|\n/).map(p => p.trim()).filter(Boolean);
	prev.innerHTML = `
		<article class="cs-preview-card" aria-label="Draft preview">
			${d.title ? `<h3 class="cs-preview-title" dir="auto">${escapeHtml(d.title)}</h3>` : '<h3 class="cs-preview-title cs-preview-dim">Untitled</h3>'}
			${d.hebrew ? `<p class="cs-preview-he" dir="rtl" lang="he">${escapeHtml(d.hebrew)}</p>` : ''}
			${d.english ? `<p class="cs-preview-en" dir="ltr">${escapeHtml(d.english)}</p>` : ''}
			${paras.map(p => `<p class="cs-preview-p" dir="auto">${escapeHtml(p)}</p>`).join('')}
			${d.sources.length ? `<div class="cs-preview-sources"><p class="cs-preview-sources-head">Sources</p><ul>${d.sources.map(s => `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.title || s.url)}</a></li>`).join('')}</ul></div>` : ''}
		</article>`;
}

function applyFormat(kind) {
	const ta = panel.querySelector('[data-cs-body]');
	const { selectionStart: s, selectionEnd: e, value } = ta;
	const sel = value.slice(s, e);
	if (!sel) { ta.focus(); return; }
	let wrapped = sel;
	if (kind === 'bold') wrapped = `**${sel}**`;
	else if (kind === 'italic') wrapped = `_${sel}_`;
	else if (kind === 'quote') wrapped = sel.split('\n').map(l => '> ' + l).join('\n');
	ta.setRangeText(wrapped, s, e, 'end');
	ta.focus();
	scheduleAutosave();
	renderPreview();
}

export function openCreatorStudio(draftId) {
	if (panel) closeStudio();

	panel = document.createElement('div');
	panel.className = 'cs-modal';
	panel.setAttribute('role', 'dialog');
	panel.setAttribute('aria-modal', 'true');
	panel.setAttribute('aria-label', 'Creator studio');
	panel.innerHTML = `
		<div class="cs-backdrop" data-cs-close></div>
		<div class="cs-panel" role="document">
			<header class="cs-head">
				<div class="cs-head-titles">
					<h2>Creator studio</h2>
					<p class="cs-saved" data-cs-saved aria-live="polite"></p>
				</div>
				<div class="cs-head-actions">
					<button type="button" class="cs-btn" data-cs-new>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
						<span>New draft</span>
					</button>
					<button type="button" class="cs-close" data-cs-close aria-label="Close creator studio">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
					</button>
				</div>
			</header>
			<div class="cs-body">
				<aside class="cs-drafts" aria-label="Your drafts">
					<p class="cs-side-head">Drafts</p>
					<ul class="cs-draft-list" data-cs-drafts></ul>
				</aside>
				<div class="cs-editor">
					<label class="cs-field">
						<span class="cs-label">Title</span>
						<input class="cs-input" data-cs-title type="text" maxlength="220" placeholder="Give your post a title">
					</label>
					<label class="cs-field">
						<span class="cs-label">Hebrew passage <span class="cs-label-hint">(right to left)</span></span>
						<textarea class="cs-input cs-he" data-cs-hebrew rows="4" dir="rtl" lang="he" placeholder="הדבק כאן טקסט בעברית…"></textarea>
					</label>
					<label class="cs-field">
						<span class="cs-label">English passage</span>
						<textarea class="cs-input" data-cs-english rows="4" dir="ltr" placeholder="The English rendering…"></textarea>
					</label>
					<div class="cs-field">
						<span class="cs-label" id="cs-body-label">Body</span>
						<div class="cs-toolbar" role="toolbar" aria-labelledby="cs-body-label">
							<button type="button" class="cs-tool" data-cs-fmt="bold" title="Bold selected text" aria-label="Bold"><strong>B</strong></button>
							<button type="button" class="cs-tool" data-cs-fmt="italic" title="Italicize selected text" aria-label="Italic"><em>I</em></button>
							<button type="button" class="cs-tool" data-cs-fmt="quote" title="Quote selected text" aria-label="Quote">“”</button>
						</div>
						<textarea class="cs-input" data-cs-body rows="6" dir="auto" placeholder="Write your thoughts, questions, or commentary…"></textarea>
					</div>
					<div class="cs-field">
						<span class="cs-label" id="cs-src-label">Sources</span>
						<ul class="cs-source-list" data-cs-sources aria-labelledby="cs-src-label"></ul>
						<div class="cs-src-add">
							<input class="cs-input" data-cs-src-title type="text" maxlength="160" placeholder="Source title (e.g. Likutei Sichos vol. 3)">
							<input class="cs-input" data-cs-src-url type="url" maxlength="400" placeholder="https://…">
							<button type="button" class="cs-btn" data-cs-src-add>Add source</button>
						</div>
					</div>
					<div class="cs-publish">
						<button type="button" class="cs-btn cs-btn-primary" data-cs-publish disabled
							title="Publishing is not wired up yet — drafts stay in this browser.">
							Publish (coming online soon)
						</button>
						<p class="cs-publish-note">Publishing to the river is not available yet — the posting endpoint is still being built. Your drafts are safe in this browser and will be publishable the moment it lands.</p>
					</div>
				</div>
				<div class="cs-preview-col">
					<p class="cs-side-head">Preview</p>
					<div class="cs-preview-scroll" data-cs-preview></div>
				</div>
			</div>
		</div>`;
	document.body.append(panel);
	document.body.classList.add('cs-open');

	panel.querySelectorAll('[data-cs-close]').forEach(el => el.addEventListener('click', closeStudio));
	panel._onKey = (e) => { if (e.key === 'Escape') closeStudio(); };
	document.addEventListener('keydown', panel._onKey);

	panel.querySelector('[data-cs-new]').addEventListener('click', newDraft);
	panel.querySelectorAll('[data-cs-title],[data-cs-hebrew],[data-cs-english],[data-cs-body]')
		.forEach(el => el.addEventListener('input', () => { scheduleAutosave(); renderPreview(); }));
	panel.querySelectorAll('[data-cs-fmt]').forEach(b => b.addEventListener('click', () => applyFormat(b.dataset.csFmt)));
	panel.querySelector('[data-cs-src-add]').addEventListener('click', addSource);

	if (draftId && getDraft(draftId)) {
		currentId = draftId;
		loadDraft(draftId);
	} else {
		const drafts = readDrafts();
		if (drafts.length) loadDraft(drafts[0].id);
		else newDraft();
	}
}

export function initCreatorStudio() {
	const topbar = document.querySelector('.feed-topbar');
	if (!topbar) return;
	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'feed-ic-btn cs-launcher';
	btn.setAttribute('aria-label', 'Open the creator studio');
	btn.title = 'Creator studio — write a post';
	btn.innerHTML = `
		<svg class="feed-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
		<span class="feed-ic-btn-label">Create</span>`;
	btn.addEventListener('click', () => openCreatorStudio());
	topbar.append(btn);
}
