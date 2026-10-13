// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Reader "Connections" section.
 *
 * Appends one Connections section at the end of the post reading column:
 * incoming references (posts citing this one) as a clean linked list, and
 * outgoing citations (what this post cites) as chips. Each outgoing chip
 * expands inline into a reverse lookup — every indexed post citing that
 * reference. When the index has no data for the post, a proper empty state
 * is shown. The section never hangs (bounded fetch timeout) and never
 * renders blank. All styling uses the reader's tokenized sefer/dream
 * palette — no !important, explicit colors for light and dark themes.
 */

const SECTION_ID = 'awtsmoos-connections';
const STYLE_ID = 'awtsmoos-connections-styles';
const FETCH_TIMEOUT_MS = 30000;
const KIND_LABELS = {
	verse: 'Verse',
	chumash: 'Chumash',
	midrash: 'Midrash',
	mishnah: 'Mishnah',
	shas: 'Shas',
	rambam: 'Rambam',
	sefer: 'Sefer',
	sefer_page: 'Sefer',
	tehillim: 'Tehillim',
	zohar: 'Zohar'
};

/** @description Escapes HTML special chars. @param {*} value Input. @returns {string} Safe string. */
function esc(value) {
	return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	}[ch]));
}

/** @description Resolves the current post id defensively. @returns {string|null} Post id or null. */
function currentPostId() {
	try {
		const w = window.post || {};
		if (w.postId) return String(w.postId);
		if (w.id) return String(w.id);
		const dom = document.querySelector('[data-post-id]');
		if (dom) return dom.getAttribute('data-post-id');
		const m = window.location.pathname.match(/\/post\/([^/?#]+)/);
		if (m) return decodeURIComponent(m[1]);
	} catch (_) { /* fall through */ }
	return null;
}

/** @description Fetches JSON with a hard timeout; never hangs. @param {string} url URL. @returns {Promise<*>} Parsed JSON. */
async function fetchJson(url) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
	try {
		const res = await fetch(url, { signal: ctrl.signal, credentials: 'same-origin' });
		if (!res.ok) throw new Error('HTTP ' + res.status);
		return await res.json();
	} finally {
		clearTimeout(timer);
	}
}

/** @description Injects the section stylesheet once. @returns {void} */
function ensureStyles() {
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
		:root .post-reader-localized-context .awtsmoos-connections {
			margin: 2.5rem auto 1rem;
			max-width: 44rem;
			padding: 1.25rem 1.5rem 1.5rem;
			background: var(--sefer-card);
			border: 1px solid var(--sefer-rule);
			border-radius: 0.9rem;
			box-shadow: var(--sefer-shadow);
			color: var(--sefer-ink);
		}
		:root .post-reader-localized-context .awtsmoos-connections__head {
			display: flex;
			align-items: baseline;
			justify-content: space-between;
			gap: 1rem;
			border-bottom: 1px solid var(--sefer-rule);
			padding-bottom: 0.6rem;
			margin-bottom: 1rem;
		}
		:root .post-reader-localized-context .awtsmoos-connections__title {
			font-size: 1.15rem;
			font-weight: 700;
			color: var(--sefer-title-ink);
			margin: 0;
			letter-spacing: 0.01em;
		}
		:root .post-reader-localized-context .awtsmoos-connections__sub {
			font-size: 0.85rem;
			color: var(--sefer-ink-soft);
			margin: 0;
		}
		:root .post-reader-localized-context .awtsmoos-connections__group-title {
			font-size: 0.8rem;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.08em;
			color: var(--sefer-accent);
			margin: 1.1rem 0 0.55rem;
		}
		:root .post-reader-localized-context .awtsmoos-connections__list {
			list-style: none;
			list-style-type: none;
			margin: 0;
			padding: 0;
			display: grid;
			gap: 0.55rem;
		}
		:root .post-reader-localized-context .awtsmoos-connections__list > li,
		:root .post-reader-localized-context .awtsmoos-connections__chips > li {
			list-style: none;
			list-style-type: none;
			margin: 0;
			padding: 0;
		}
		:root .post-reader-localized-context .awtsmoos-connections__item {
			padding: 0.6rem 0.75rem;
			border: 1px solid var(--sefer-rule);
			border-radius: 0.6rem;
			background: var(--sefer-paper);
		}
		:root .post-reader-localized-context .awtsmoos-connections__link {
			color: var(--sefer-focus);
			font-weight: 600;
			text-decoration: none;
			font-size: 0.95rem;
		}
		:root .post-reader-localized-context .awtsmoos-connections__link:hover,
		:root .post-reader-localized-context .awtsmoos-connections__link:focus-visible {
			text-decoration: underline;
		}
		:root .post-reader-localized-context .awtsmoos-connections__plain {
			color: var(--sefer-ink);
			font-weight: 600;
			font-size: 0.95rem;
		}
		:root .post-reader-localized-context .awtsmoos-connections__key {
			display: block;
			font-size: 0.75rem;
			color: var(--sefer-ink-soft);
			margin-top: 0.2rem;
			overflow-wrap: anywhere;
		}
		:root .post-reader-localized-context .awtsmoos-connections__raw {
			display: block;
			margin-top: 0.35rem;
			padding: 0.45rem 0.6rem;
			font-size: 0.88rem;
			line-height: 1.55;
			color: var(--sefer-ink);
			background: var(--sefer-card);
			border-inline-start: 3px solid var(--sefer-accent);
			border-radius: 0.35rem;
		}
		:root .post-reader-localized-context .awtsmoos-connections__chips {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5rem;
			margin: 0;
			padding: 0;
			list-style: none;
			list-style-type: none;
		}
		:root .post-reader-localized-context .awtsmoos-connections__chip {
			display: inline-flex;
			align-items: center;
			gap: 0.45rem;
			max-width: 100%;
			padding: 0.4rem 0.7rem;
			font-size: 0.85rem;
			color: var(--sefer-ink);
			background: var(--sefer-paper);
			border: 1px solid var(--sefer-accent);
			border-radius: 999px;
			cursor: pointer;
		}
		:root .post-reader-localized-context .awtsmoos-connections__chip:hover,
		:root .post-reader-localized-context .awtsmoos-connections__chip:focus-visible {
			background: var(--sefer-paper-deep);
		}
		:root .post-reader-localized-context .awtsmoos-connections__chip[aria-expanded="true"] {
			background: var(--sefer-accent);
			color: var(--sefer-on-accent);
			border-color: var(--sefer-accent);
		}
		:root .post-reader-localized-context .awtsmoos-connections__kind {
			font-size: 0.68rem;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.06em;
			padding: 0.12rem 0.45rem;
			border-radius: 999px;
			background: var(--sefer-accent);
			color: var(--sefer-on-accent);
			flex: none;
		}
		:root .post-reader-localized-context .awtsmoos-connections__chip[aria-expanded="true"] .awtsmoos-connections__kind {
			background: var(--sefer-on-accent);
			color: var(--sefer-accent);
		}
		:root .post-reader-localized-context .awtsmoos-connections__chip-text {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			max-width: 22rem;
		}
		:root .post-reader-localized-context .awtsmoos-connections__chip-open {
			flex-basis: 100%;
		}
		:root .post-reader-localized-context .awtsmoos-connections__refview {
			margin-top: 0.25rem;
			padding: 0.6rem 0.75rem;
			border: 1px dashed var(--sefer-accent);
			border-radius: 0.6rem;
			background: var(--sefer-card);
		}
		:root .post-reader-localized-context .awtsmoos-connections__refview-title {
			font-size: 0.78rem;
			font-weight: 700;
			color: var(--sefer-accent);
			margin: 0 0 0.45rem;
			overflow-wrap: anywhere;
		}
		:root .post-reader-localized-context .awtsmoos-connections__empty,
		:root .post-reader-localized-context .awtsmoos-connections__loading {
			color: var(--sefer-ink-soft);
			font-size: 0.92rem;
			margin: 0.5rem 0 0;
		}
		:root .post-reader-localized-context .awtsmoos-connections__count {
			font-size: 0.78rem;
			color: var(--sefer-ink-soft);
			font-weight: 400;
		}
	`;
	document.head.appendChild(style);
}

/** @description Renders one incoming citation row. @param {Object} item Entry. @returns {string} HTML. */
function renderIncomingItem(item) {
	const title = item.href
		? `<a class="awtsmoos-connections__link" href="${esc(item.href)}">${esc(item.postTitle)}</a>`
		: `<span class="awtsmoos-connections__plain">${esc(item.postTitle)}</span>`;
	const raw = item.raw && item.raw !== item.key
		? `<span class="awtsmoos-connections__raw" dir="auto">${esc(item.raw)}</span>`
		: '';
	return `<li class="awtsmoos-connections__item">${title}` +
		`<span class="awtsmoos-connections__key" dir="auto">${esc(item.key)}</span>${raw}</li>`;
}

/** @description Renders one outgoing chip. @param {Object} item Entry. @param {number} idx Index. @returns {string} HTML. */
function renderOutgoingChip(item, idx) {
	const kind = KIND_LABELS[item.kind] || esc(item.kind || 'Ref');
	return `<li><button type="button" class="awtsmoos-connections__chip" data-ref="${esc(item.key)}" data-idx="${idx}" aria-expanded="false" title="Show all posts citing this reference">` +
		`<span class="awtsmoos-connections__kind">${esc(kind)}</span>` +
		`<span class="awtsmoos-connections__chip-text" dir="auto">${esc(item.raw)}</span>` +
		`</button></li>`;
}

/** @description Renders the section body from the payload. @param {HTMLElement} body Body element. @param {Object} data API payload. @returns {void} */
function renderBody(body, data) {
	const incoming = Array.isArray(data.incoming) ? data.incoming : [];
	const outgoing = Array.isArray(data.outgoing) ? data.outgoing : [];
	if (!incoming.length && !outgoing.length) {
		body.innerHTML = `<p class="awtsmoos-connections__empty">No connections indexed yet.</p>`;
		return;
	}
	let html = '';
	if (incoming.length) {
		html += `<h3 class="awtsmoos-connections__group-title">Cited by <span class="awtsmoos-connections__count">${incoming.length}</span></h3>`;
		html += `<ul class="awtsmoos-connections__list">${incoming.map(renderIncomingItem).join('')}</ul>`;
	}
	if (outgoing.length) {
		html += `<h3 class="awtsmoos-connections__group-title">Cites <span class="awtsmoos-connections__count">${outgoing.length}</span></h3>`;
		html += `<ul class="awtsmoos-connections__chips">${outgoing.map(renderOutgoingChip).join('')}</ul>`;
	}
	body.innerHTML = html;
	body.querySelectorAll('.awtsmoos-connections__chip').forEach((chip) => {
		chip.addEventListener('click', () => toggleRefView(chip));
	});
}

/** @description Renders the empty state. @param {HTMLElement} body Body element. @returns {void} */
function renderEmpty(body) {
	body.innerHTML = `<p class="awtsmoos-connections__empty">No connections indexed yet.</p>`;
}

/**
 * @description Toggles the inline reverse-lookup panel for one outgoing chip.
 * @param {HTMLButtonElement} chip Chip button. @returns {Promise<void>} Void.
 */
async function toggleRefView(chip) {
	const expanded = chip.getAttribute('aria-expanded') === 'true';
	const list = chip.closest('.awtsmoos-connections__chips');
	const existing = chip.parentElement.querySelector('.awtsmoos-connections__refview');
	if (existing) existing.remove();
	chip.parentElement.classList.remove('awtsmoos-connections__chip-open');
	if (expanded) {
		chip.setAttribute('aria-expanded', 'false');
		return;
	}
	list.querySelectorAll('.awtsmoos-connections__chip[aria-expanded="true"]').forEach((other) => {
		other.setAttribute('aria-expanded', 'false');
		other.parentElement.classList.remove('awtsmoos-connections__chip-open');
		const panel = other.parentElement.querySelector('.awtsmoos-connections__refview');
		if (panel) panel.remove();
	});
	chip.setAttribute('aria-expanded', 'true');
	chip.parentElement.classList.add('awtsmoos-connections__chip-open');
	const ref = chip.getAttribute('data-ref');
	const panel = document.createElement('div');
	panel.className = 'awtsmoos-connections__refview';
	panel.innerHTML = `<p class="awtsmoos-connections__refview-title" dir="auto">${esc(ref)}</p>` +
		`<p class="awtsmoos-connections__loading">Loading citing posts…</p>`;
	chip.parentElement.appendChild(panel);
	try {
		const data = await fetchJson('/api/social/packed/connections?ref=' + encodeURIComponent(ref));
		const citations = Array.isArray(data.citations) ? data.citations : [];
		if (!citations.length) {
			panel.innerHTML = `<p class="awtsmoos-connections__refview-title" dir="auto">${esc(ref)}</p>` +
				`<p class="awtsmoos-connections__empty">No indexed posts cite this reference.</p>`;
			return;
		}
		panel.innerHTML = `<p class="awtsmoos-connections__refview-title" dir="auto">${esc(ref)} — cited by ${citations.length}</p>` +
			`<ul class="awtsmoos-connections__list">${citations.map(renderIncomingItem).join('')}</ul>`;
	} catch (_) {
		panel.innerHTML = `<p class="awtsmoos-connections__refview-title" dir="auto">${esc(ref)}</p>` +
			`<p class="awtsmoos-connections__empty">Could not load citing posts.</p>`;
	}
}

/** @description Builds the section skeleton. @returns {{section: HTMLElement, body: HTMLElement}} Elements. */
function buildSection() {
	const section = document.createElement('section');
	section.id = SECTION_ID;
	section.className = 'awtsmoos-connections';
	section.setAttribute('aria-label', 'Connections');
	section.innerHTML =
		`<div class="awtsmoos-connections__head">` +
		`<h2 class="awtsmoos-connections__title">Connections</h2>` +
		`<p class="awtsmoos-connections__sub">Where this teaching is cited — and what it cites.</p>` +
		`</div><div class="awtsmoos-connections__body">` +
		`<p class="awtsmoos-connections__loading">Loading connections…</p></div>`;
	return { section, body: section.querySelector('.awtsmoos-connections__body') };
}

/**
 * @description Mounts the Connections section once. Safe to call repeatedly;
 * fails softly (empty state) and never hangs.
 * @returns {Promise<void>} Resolves after render.
 */
export async function startConnectionsSection() {
	try {
		if (document.getElementById(SECTION_ID)) return;
		const postId = currentPostId();
		const mount = document.getElementById('realPost');
		if (!mount || !postId) return;
		ensureStyles();
		const { section, body } = buildSection();
		mount.appendChild(section);
		try {
			const data = await fetchJson('/api/social/packed/connections?post=' + encodeURIComponent(postId));
			renderBody(body, data || {});
		} catch (_) {
			renderEmpty(body);
		}
	} catch (_) {
		// Never let the connections section break the reader.
	}
}
