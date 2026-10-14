// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BrandedHeichelos
 * @description
 * Yaakov 2026-10-14 (TRACK J): branded heichelos for shuls and schools.
 *
 * - A heichel can be branded: logo upload (local preview, stored as a
 *   data URL in this browser), custom accent color chosen from an approved
 *   palette, and a welcome message.
 * - When a branded heichel's posts appear in the river, a branded masthead
 *   renders above the card: logo, heichel name in the brand color, the
 *   welcome message, and — always — "Powered by Awtsmoos" attribution.
 * - Branding lives in localStorage (`awtsmoos-heichel-branding:v1`) until
 *   the heichel settings backend lands; the management UI is a modal with
 *   a live masthead preview.
 *
 * Yaakov's rules honored: no !important (styling is in brandedHeichelos.css),
 * approved palette only (no arbitrary colors), user-facing strings show
 * display names — never raw IDs or machine slugs.
 */

const BRAND_KEY = 'awtsmoos-heichel-branding:v1';

/** Approved palette — shuls pick from these, never arbitrary hex. */
export const BRAND_PALETTE = [
	{ id: 'gold', name: 'River Gold', value: '#d4a94e' },
	{ id: 'blue', name: 'Deep Blue', value: '#2b5ea7' },
	{ id: 'crimson', name: 'Crimson', value: '#a31621' },
	{ id: 'emerald', name: 'Emerald', value: '#2e7d5b' },
	{ id: 'plum', name: 'Plum', value: '#6d3b6e' },
	{ id: 'bronze', name: 'Bronze', value: '#8a6d2f' },
	{ id: 'ink', name: 'Ink', value: '#3a3f4a' }
];

const MAX_LOGO_BYTES = 400 * 1024; // 400KB data-URL cap

function readBrands() {
	try {
		const raw = localStorage.getItem(BRAND_KEY);
		const obj = raw ? JSON.parse(raw) : {};
		return obj && typeof obj === 'object' ? obj : {};
	} catch (_) {
		return {};
	}
}

function writeBrands(brands) {
	try {
		localStorage.setItem(BRAND_KEY, JSON.stringify(brands));
	} catch (_) { /* storage is best effort */ }
}

function escapeHtml(s) {
	return String(s ?? '').replace(/[&<>"']/g, c => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	}[c]));
}

export function getBrand(heichelId) {
	return readBrands()[String(heichelId)] || null;
}

export function setBrand(heichelId, brand) {
	const brands = readBrands();
	brands[String(heichelId)] = brand;
	writeBrands(brands);
	decorateRiver();
}

export function clearBrand(heichelId) {
	const brands = readBrands();
	delete brands[String(heichelId)];
	writeBrands(brands);
	document.querySelectorAll(`.bh-masthead[data-bh-heichel="${CSS.escape(String(heichelId))}"]`)
		.forEach(el => el.remove());
	document.querySelectorAll('.feed-card[data-bh-branded]').forEach(c => {
		delete c.dataset.bhBranded;
	});
	decorateRiver();
}

/** Harvest heichels from on-screen cards: internal id + display name. */
export function harvestHeichels() {
	const map = new Map();
	document.querySelectorAll('.feed-card[data-post-id]').forEach(card => {
		const id = card.dataset.heichelId || card.dataset.heichel || 'ikar';
		const nameEl = card.querySelector('.feed-card-heichel');
		const name = (nameEl && nameEl.textContent.trim()) || 'Heichel';
		if (!map.has(id)) map.set(id, { id, name });
	});
	return [...map.values()];
}

/* ------------------------------------------------------------------ */
/* masthead rendering                                                  */
/* ------------------------------------------------------------------ */

function mastheadHtml(brand, name) {
	const color = brand.color || '#d4a94e';
	const logo = brand.logo
		? `<img class="bh-logo" src="${escapeHtml(brand.logo)}" alt="${escapeHtml(name)} logo">`
		: `<span class="bh-logo bh-logo-fallback" style="background:${escapeHtml(color)}" aria-hidden="true">${escapeHtml(name.slice(0, 1))}</span>`;
	return `
		<div class="bh-masthead" data-bh-heichel="${escapeHtml(brand._id)}" style="--bh-brand:${escapeHtml(color)}">
			${logo}
			<div class="bh-text">
				<p class="bh-name">${escapeHtml(name)}</p>
				${brand.welcome ? `<p class="bh-welcome" dir="auto">${escapeHtml(brand.welcome)}</p>` : ''}
			</div>
			<span class="bh-powered">Powered by Awtsmoos</span>
		</div>`;
}

function decorateCard(card) {
	if (card.dataset.bhBranded) return;
	const heichelId = card.dataset.heichelId || card.dataset.heichel || 'ikar';
	const brand = getBrand(heichelId);
	if (!brand) return;
	const nameEl = card.querySelector('.feed-card-heichel');
	const name = (nameEl && nameEl.textContent.trim()) || 'Heichel';
	card.dataset.bhBranded = '1';
	card.insertAdjacentHTML('beforebegin', mastheadHtml({ ...brand, _id: heichelId }, name));
}

export function decorateRiver() {
	document.querySelectorAll('.feed-card[data-post-id]').forEach(decorateCard);
}

/* ------------------------------------------------------------------ */
/* management modal                                                    */
/* ------------------------------------------------------------------ */

let modal = null;
let draftLogo = null;
let draftColor = BRAND_PALETTE[0].value;

function closeModal() {
	if (modal) {
		document.removeEventListener('keydown', modal._onKey);
		modal.remove();
		modal = null;
	}
	document.body.classList.remove('bh-open');
	draftLogo = null;
}

function renderPreview() {
	const prev = modal.querySelector('[data-bh-preview]');
	const sel = modal.querySelector('[data-bh-heichel]');
	const name = sel.options[sel.selectedIndex]?.textContent || 'Heichel';
	const welcome = modal.querySelector('[data-bh-welcome]').value.trim();
	prev.innerHTML = mastheadHtml(
		{ _id: 'preview', logo: draftLogo, color: draftColor, welcome },
		name
	);
}

function readLogoFile(file) {
	return new Promise((resolve) => {
		if (!file || !file.type.startsWith('image/')) { resolve(null); return; }
		const reader = new FileReader();
		reader.onload = () => {
			const url = String(reader.result || '');
			if (url.length > MAX_LOGO_BYTES * 1.37) { resolve({ tooBig: true }); return; }
			resolve({ url });
		};
		reader.onerror = () => resolve(null);
		reader.readAsDataURL(file);
	});
}

export function openBrandManager(preselectId) {
	closeModal();
	const heichels = harvestHeichels();
	if (!heichels.length) return;

	const brands = readBrands();
	const first = heichels.find(h => h.id === preselectId) || heichels[0];
	const existing = brands[first.id] || {};
	draftLogo = existing.logo || null;
	draftColor = existing.color || BRAND_PALETTE[0].value;

	modal = document.createElement('div');
	modal.className = 'bh-modal';
	modal.setAttribute('role', 'dialog');
	modal.setAttribute('aria-modal', 'true');
	modal.setAttribute('aria-label', 'Brand a heichel');
	modal.innerHTML = `
		<div class="bh-backdrop" data-bh-close></div>
		<div class="bh-panel" role="document">
			<header class="bh-head">
				<h2>Brand a heichel</h2>
				<button type="button" class="bh-close" data-bh-close aria-label="Close branding">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
				</button>
			</header>
			<div class="bh-body">
				<label class="bh-field">
					<span class="bh-label">Heichel</span>
					<select class="bh-input" data-bh-heichel>
						${heichels.map(h => `<option value="${escapeHtml(h.id)}"${h.id === first.id ? ' selected' : ''}>${escapeHtml(h.name)}</option>`).join('')}
					</select>
				</label>
				<div class="bh-field">
					<span class="bh-label" id="bh-logo-label">Logo</span>
					<div class="bh-logo-row" role="group" aria-labelledby="bh-logo-label">
						<label class="bh-upload">
							<input type="file" data-bh-logo accept="image/*" hidden>
							<span class="bh-upload-btn">Upload logo</span>
						</label>
						<button type="button" class="bh-btn bh-btn-ghost" data-bh-logo-clear>Remove</button>
					</div>
					<p class="bh-note">Preview only — the logo stays in this browser until heichel settings go live.</p>
				</div>
				<div class="bh-field">
					<span class="bh-label" id="bh-palette-label">Brand color</span>
					<div class="bh-palette" role="radiogroup" aria-labelledby="bh-palette-label">
						${BRAND_PALETTE.map(p => `
							<button type="button" class="bh-swatch${p.value === draftColor ? ' is-active' : ''}"
								data-bh-color="${p.value}" role="radio" aria-checked="${p.value === draftColor}"
								title="${escapeHtml(p.name)}" aria-label="${escapeHtml(p.name)}"
								style="background:${p.value}"></button>`).join('')}
					</div>
				</div>
				<label class="bh-field">
					<span class="bh-label">Welcome message</span>
					<textarea class="bh-input" data-bh-welcome rows="2" maxlength="220" dir="auto"
						placeholder="Welcome to our shul's corner of the river…">${escapeHtml(existing.welcome || '')}</textarea>
				</label>
				<div class="bh-field">
					<span class="bh-label">Live preview</span>
					<div class="bh-preview" data-bh-preview></div>
				</div>
				<div class="bh-actions">
					<button type="button" class="bh-btn bh-btn-primary" data-bh-save>Save branding</button>
					<button type="button" class="bh-btn bh-btn-ghost" data-bh-clear>Remove branding</button>
				</div>
				<p class="bh-note">“Powered by Awtsmoos” always appears on branded heichelos.</p>
			</div>
		</div>`;
	document.body.append(modal);
	document.body.classList.add('bh-open');

	modal.querySelectorAll('[data-bh-close]').forEach(el => el.addEventListener('click', closeModal));
	modal._onKey = (e) => { if (e.key === 'Escape') closeModal(); };
	document.addEventListener('keydown', modal._onKey);

	const sel = modal.querySelector('[data-bh-heichel]');
	sel.addEventListener('change', () => {
		const b = readBrands()[sel.value] || {};
		draftLogo = b.logo || null;
		draftColor = b.color || BRAND_PALETTE[0].value;
		modal.querySelector('[data-bh-welcome]').value = b.welcome || '';
		modal.querySelectorAll('[data-bh-color]').forEach(sw => {
			const on = sw.dataset.bhColor === draftColor;
			sw.classList.toggle('is-active', on);
			sw.setAttribute('aria-checked', String(on));
		});
		renderPreview();
	});

	modal.querySelector('[data-bh-logo]').addEventListener('change', async (e) => {
		const res = await readLogoFile(e.target.files[0]);
		if (res && res.tooBig) {
			e.target.value = '';
			modal.querySelector('.bh-note').textContent = 'That logo is too large — please use an image under 400KB.';
			return;
		}
		if (res && res.url) draftLogo = res.url;
		renderPreview();
	});
	modal.querySelector('[data-bh-logo-clear]').addEventListener('click', () => {
		draftLogo = null;
		modal.querySelector('[data-bh-logo]').value = '';
		renderPreview();
	});

	modal.querySelectorAll('[data-bh-color]').forEach(sw => {
		sw.addEventListener('click', () => {
			modal.querySelectorAll('[data-bh-color]').forEach(x => {
				x.classList.remove('is-active');
				x.setAttribute('aria-checked', 'false');
			});
			sw.classList.add('is-active');
			sw.setAttribute('aria-checked', 'true');
			draftColor = sw.dataset.bhColor;
			renderPreview();
		});
	});
	modal.querySelector('[data-bh-welcome]').addEventListener('input', renderPreview);

	modal.querySelector('[data-bh-save]').addEventListener('click', () => {
		setBrand(sel.value, {
			logo: draftLogo,
			color: draftColor,
			welcome: modal.querySelector('[data-bh-welcome]').value.trim()
		});
		closeModal();
	});
	modal.querySelector('[data-bh-clear]').addEventListener('click', () => {
		clearBrand(sel.value);
		closeModal();
	});

	renderPreview();
}

/* ------------------------------------------------------------------ */
/* init                                                                */
/* ------------------------------------------------------------------ */

export function initBrandedHeichelos() {
	decorateRiver();
	const river = document.getElementById('feed-river');
	if (river) {
		const mo = new MutationObserver(() => decorateRiver());
		mo.observe(river, { childList: true });
	}
	const topbar = document.querySelector('.feed-topbar');
	if (!topbar) return;
	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'feed-ic-btn bh-launcher';
	btn.setAttribute('aria-label', 'Brand a heichel');
	btn.title = 'Brand a heichel — logo, colors, welcome message';
	btn.innerHTML = `
		<svg class="feed-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h16"/><path d="M6 20V9l6-5 6 5v11"/><path d="M10 20v-5h4v5"/></svg>
		<span class="feed-ic-btn-label">Brand</span>`;
	btn.addEventListener('click', () => openBrandManager());
	topbar.append(btn);
}
