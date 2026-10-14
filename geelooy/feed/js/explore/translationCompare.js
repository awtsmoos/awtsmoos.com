// B"H
/**
 * @module TranslationCompare
 * @description
 * B"H — Yaakov 2026-10-13, TRACK G (visual exploration): translation
 * comparison view. Side-by-side columns of a post's languages (Hebrew,
 * English, and any others the post carries), with per-language toggles and
 * hover-aligned highlighting: hovering a unit highlights the same unit in
 * every visible column.
 *
 * Works on any post with translations. The post is picked from the river
 * (or passed in ctx as { post } / { postId }). Language columns are
 * extracted defensively from the many shapes translation posts take:
 *   - post.translation.phraseTranslations: [{ hebrew, english }, …]
 *   - post.translation.readable: { sectionKey: { hebrew, english } | string, … }
 *   - post.translation.existingCommentEnglish + hebrew text fields
 *   - post.titleHe/title, post.bodyHe/body, post.descriptionHe/description
 * When a column has only running text it is split into sentence units so
 * the columns still align row by row. Missing data is shown honestly as an
 * empty state — never invented.
 *
 * Public API: mount(el, ctx).
 */

import { escapeHtml } from '../icons.js';

const HEBREW_RE = /[\u0590-\u05FF]/;

function isRtl(text) {
	return HEBREW_RE.test(String(text || '').slice(0, 400));
}

/** Splits running prose into sentence units for row alignment. */
function splitUnits(text) {
	const clean = String(text || '').replace(/\s+/g, ' ').trim();
	if (!clean) return [];
	// Split on sentence ends, including the Hebrew sof-pasuk.
	const parts = clean.split(/(?<=[.!?׃:;])\s+/).map(s => s.trim()).filter(Boolean);
	if (parts.length <= 1) {
		// Very long single unit: split into rough halves so columns stay readable.
		if (clean.length > 420) {
			const mid = Math.floor(clean.length / 2);
			const cut = clean.lastIndexOf(' ', mid);
			const at = cut > 0 ? cut : mid;
			return [clean.slice(0, at).trim(), clean.slice(at).trim()].filter(Boolean);
		}
		return parts.length ? parts : [clean];
	}
	return parts;
}

function textOf(value) {
	if (value == null) return '';
	if (typeof value === 'string') return value;
	if (Array.isArray(value)) return value.map(textOf).join(' ');
	if (typeof value === 'object') {
		for (const key of ['hebrew', 'english', 'text', 'content', 'body', 'value']) {
			if (typeof value[key] === 'string' && value[key].trim()) return value[key];
		}
		return '';
	}
	return String(value);
}

/**
 * Extracts language columns from a post record.
 * @param {object} post
 * @returns {{ code: string, label: string, dir: string, units: string[] }[]}
 */
export function extractTranslations(post = {}) {
	const cols = [];
	const push = (code, label, units) => {
		const list = (Array.isArray(units) ? units : []).map(u => String(u || '').trim()).filter(Boolean);
		if (!list.length) return;
		if (cols.some(c => c.code === code)) {
			const existing = cols.find(c => c.code === code);
			existing.units.push(...list);
			return;
		}
		cols.push({ code, label, dir: isRtl(list.join(' ').slice(0, 600)) ? 'rtl' : 'ltr', units: list });
	};

	const t = post.translation || {};
	const get = (obj, ...keys) => {
		for (const k of keys) {
			if (obj && typeof obj[k] === 'string' && obj[k].trim()) return obj[k];
		}
		return '';
	};

	// 1. phraseTranslations: already-aligned pairs — the gold standard.
	const phrases = t.phraseTranslations || post.phraseTranslations;
	if (Array.isArray(phrases) && phrases.length) {
		const he = [], en = [];
		for (const p of phrases) {
			const h = get(p, 'hebrew', 'he', 'source');
			const e = get(p, 'english', 'en', 'translation', 'target');
			if (h) he.push(h);
			if (e) en.push(e);
		}
		push('he', 'Hebrew', he);
		push('en', 'English', en);
	}

	// 2. readable: dict keyed by section -> { hebrew, english } or plain strings.
	const readable = t.readable || post.readable;
	if (readable && typeof readable === 'object' && !Array.isArray(readable)) {
		const he = [], en = [];
		for (const key of Object.keys(readable)) {
			const sec = readable[key];
			if (typeof sec === 'string') {
				(isRtl(sec) ? he : en).push(sec);
			} else if (sec && typeof sec === 'object') {
				const h = get(sec, 'hebrew', 'he', 'source', 'original');
				const e = get(sec, 'english', 'en', 'translation', 'target');
				if (h) he.push(h);
				if (e) en.push(e);
			}
		}
		push('he', 'Hebrew', he);
		push('en', 'English', en);
	}

	// 3. Plain hebrew/english body fields on the translation or post.
	push('he', 'Hebrew', splitUnits(
		get(t, 'hebrew', 'he', 'source', 'originalText') ||
		get(post, 'hebrewText', 'hebrew', 'bodyHe', 'descriptionHe', 'titleHe')
	));
	push('en', 'English', splitUnits(
		get(t, 'english', 'en', 'translation', 'translatedText') ||
		get(t, 'existingCommentEnglish') ||
		get(post, 'englishText', 'body', 'description')
	));

	// 4. Titles as their own first unit when nothing else aligned them.
	const titleHe = get(post, 'titleHe', 'hebrewTitle');
	const title = get(post, 'title', 'name');
	if (titleHe && !cols.some(c => c.code === 'he')) push('he', 'Hebrew', [titleHe]);
	if (title && !cols.some(c => c.code === 'en')) push('en', 'English', [title]);

	// 5. Any other explicit language keys we recognize.
	const LANG_LABELS = { fr: 'French', es: 'Spanish', de: 'German', ru: 'Russian', yi: 'Yiddish', ar: 'Arabic', pt: 'Portuguese', it: 'Italian' };
	for (const code of Object.keys(LANG_LABELS)) {
		const val = get(t, code) || get(post, 'translation_' + code, code + 'Text');
		if (val) push(code, LANG_LABELS[code], splitUnits(val));
	}
	return cols;
}

async function fetchRecentPosts(limit = 60) {
	try {
		const res = await fetch(`/api/social/feed/discover?limit=${limit}&offset=0`, { credentials: 'same-origin' });
		if (!res.ok) return [];
		const body = await res.json().catch(() => null);
		const data = body?.success ?? body ?? {};
		const items = Array.isArray(data.items) ? data.items : (Array.isArray(data.posts) ? data.posts : []);
		return items.filter(p => p && (p.id || p.postId));
	} catch (_) {
		return [];
	}
}

function postLabel(post) {
	const title = post.title || post.name || 'Untitled post';
	return String(title).slice(0, 90);
}

function postKey(post) {
	return String(post.id || post.postId || '');
}

/**
 * Mounts the translation comparison view.
 * @param {HTMLElement} el
 * @param {object} [ctx] { post, postId, openExplore }
 */
export async function mount(el, ctx = {}) {
	el.innerHTML = '';
	const wrap = document.createElement('div');
	wrap.className = 'xcmp';
	el.append(wrap);

	const posts = await fetchRecentPosts();
	let current = ctx.post || null;
	if (!current && ctx.postId) {
		current = posts.find(p => postKey(p) === String(ctx.postId)) || null;
	}
	if (!current && posts.length) {
		// Prefer a post that actually carries translations.
		current = posts.find(p => extractTranslations(p).length >= 2) || posts[0];
	}

	const toolbar = document.createElement('div');
	toolbar.className = 'xcmp-toolbar';
	toolbar.innerHTML = `
		<div class="xcmp-postpick">
			<label for="xcmp-post">Post</label>
			<select id="xcmp-post" aria-label="Choose a post to compare">
				${posts.map(p => `<option value="${escapeHtml(postKey(p))}">${escapeHtml(postLabel(p))}</option>`).join('')}
			</select>
		</div>
		<div class="xcmp-langs" role="group" aria-label="Language columns"></div>`;
	wrap.append(toolbar);

	const colsEl = document.createElement('div');
	colsEl.className = 'xcmp-cols';
	wrap.append(colsEl);
	const noteEl = document.createElement('p');
	noteEl.className = 'xcmp-note';
	wrap.append(noteEl);

	const select = toolbar.querySelector('#xcmp-post');
	const langsEl = toolbar.querySelector('.xcmp-langs');

	function render() {
		if (!current) {
			colsEl.innerHTML = `<div class="xcmp-empty"><strong>No post selected.</strong><br>
				The river returned no posts right now — try again in a moment.</div>`;
			langsEl.innerHTML = '';
			noteEl.textContent = '';
			return;
		}
		const cols = extractTranslations(current);
		if (!cols.length) {
			colsEl.innerHTML = `<div class="xcmp-empty"><strong>No translations on this post yet.</strong><br>
				“${escapeHtml(postLabel(current))}” carries no Hebrew/English text the
				comparison view can read. Pick another post from the river.</div>`;
			langsEl.innerHTML = '';
			noteEl.textContent = '';
			return;
		}
		const visible = new Set(cols.map(c => c.code));
		langsEl.innerHTML = cols.map(c =>
			`<label class="xcmp-lang" data-lang="${c.code}">
				<input type="checkbox" checked aria-label="Show ${escapeHtml(c.label)} column">
				${escapeHtml(c.label)}
			</label>`).join('');
		langsEl.querySelectorAll('.xcmp-lang input').forEach(input => {
			input.addEventListener('change', () => {
				const code = input.closest('.xcmp-lang').dataset.lang;
				const label = input.closest('.xcmp-lang');
				if (input.checked) { visible.add(code); label.classList.remove('is-off'); }
				else { visible.delete(code); label.classList.add('is-off'); }
				draw();
			});
		});

		function draw() {
			const shown = cols.filter(c => visible.has(c.code));
			const rows = Math.max(0, ...shown.map(c => c.units.length));
			colsEl.style.gridTemplateColumns = '';
			colsEl.innerHTML = shown.length ? shown.map(c => `
				<div class="xcmp-col" data-dir="${c.dir}" data-lang="${c.code}">
					<div class="xcmp-col-head">
						<span class="xcmp-langtag">${escapeHtml(c.code)}</span>
						<span>${escapeHtml(c.label)}</span>
					</div>
					${c.units.map((u, i) =>
						`<div class="xcmp-unit" data-unit="${i}" tabindex="0">${escapeHtml(u)}</div>`).join('')}
				</div>`).join('')
				: `<div class="xcmp-empty"><strong>All columns hidden.</strong><br>
					Toggle a language back on to compare.</div>`;
			noteEl.textContent = rows
				? `Hover or tab to a unit to highlight the same unit across languages. ${rows} aligned unit${rows === 1 ? '' : 's'} · ${shown.length} language${shown.length === 1 ? '' : 's'}. Alignment is positional: unit N in each column sits in row N.`
				: '';
		}

		colsEl.onmouseover = (e) => {
			const unit = e.target.closest('.xcmp-unit');
			colsEl.querySelectorAll('.xcmp-unit.is-hot').forEach(n => n.classList.remove('is-hot'));
			if (!unit) return;
			const n = unit.dataset.unit;
			colsEl.querySelectorAll(`.xcmp-unit[data-unit="${n}"]`).forEach(node => node.classList.add('is-hot'));
		};
		colsEl.onmouseout = () => {
			colsEl.querySelectorAll('.xcmp-unit.is-hot').forEach(n => n.classList.remove('is-hot'));
		};
		colsEl.onfocusin = (e) => {
			const unit = e.target.closest('.xcmp-unit');
			if (!unit) return;
			const n = unit.dataset.unit;
			colsEl.querySelectorAll(`.xcmp-unit[data-unit="${n}"]`).forEach(node => node.classList.add('is-hot'));
		};
		colsEl.onfocusout = () => {
			colsEl.querySelectorAll('.xcmp-unit.is-hot').forEach(n => n.classList.remove('is-hot'));
		};
		draw();
	}

	if (current) select.value = postKey(current);
	select.addEventListener('change', () => {
		current = posts.find(p => postKey(p) === select.value) || null;
		render();
	});
	render();
}
