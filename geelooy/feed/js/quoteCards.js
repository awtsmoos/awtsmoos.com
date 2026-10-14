// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module QuoteCards
 * @description
 * Yaakov 2026-10-14 (TRACK J): shareable quote cards. Any passage selected in
 * the feed gets a floating "Make quote card" action. The generator paints a
 * 1080x1350 (4:5) canvas: a parchment background from
 * /feed/assets/parchment/, corner ornaments from /feed/assets/ornaments/,
 * elegant Hebrew/English typography, and "via Awtsmoos" attribution plus the
 * post link at the bottom. Download PNG via canvas, or share through the
 * Web Share API when available.
 *
 * Yaakov's rules honored: no !important (styling is in quoteCards.css),
 * user-facing strings never expose raw IDs or machine slugs.
 */

const PARCHMENTS = [
	{ id: 'clean-1', file: '/feed/assets/parchment/parchment-clean-1.webp', dark: false },
	{ id: 'aged-1', file: '/feed/assets/parchment/parchment-aged-1.webp', dark: false },
	{ id: 'golden-1', file: '/feed/assets/parchment/parchment-golden-1.webp', dark: false },
	{ id: 'night-1', file: '/feed/assets/parchment/parchment-night-1.webp', dark: true },
	{ id: 'clean-3', file: '/feed/assets/parchment/parchment-clean-3.webp', dark: false },
	{ id: 'aged-3', file: '/feed/assets/parchment/parchment-aged-3.webp', dark: false }
];

const ORNAMENTS = [
	'/feed/assets/ornaments/ornament-corner-filigree-1.webp',
	'/feed/assets/ornaments/ornament-corner-floral-1.webp',
	'/feed/assets/ornaments/ornament-corner-geometric-1.webp',
	'/feed/assets/ornaments/ornament-corner-minimal-1.webp'
];

const CARD_W = 1080;
const CARD_H = 1350;
const MARGIN = 110;

const HE_FONT = '"Frank Ruhl Libre","David Libre","Noto Serif Hebrew","Times New Roman",serif';
const EN_FONT = '"Cormorant Garamond","EB Garamond",Georgia,"Times New Roman",serif';

function escapeHtml(s) {
	return String(s ?? '').replace(/[&<>"']/g, c => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	}[c]));
}

function isHebrew(text) {
	return /[\u0590-\u05FF]/.test(text);
}

function loadImage(src) {
	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => resolve(img);
		img.onerror = () => resolve(null);
		img.src = src;
	});
}

function drawCover(ctx, img) {
	if (!img) return;
	const scale = Math.max(CARD_W / img.width, CARD_H / img.height);
	const w = img.width * scale, h = img.height * scale;
	ctx.drawImage(img, (CARD_W - w) / 2, (CARD_H - h) / 2, w, h);
}

function drawOrnamentCorners(ctx, img, dark) {
	if (!img) return;
	const size = 190;
	const pad = 34;
	ctx.save();
	if (dark) ctx.globalAlpha = 0.92;
	// top-left
	ctx.drawImage(img, pad, pad, size, size);
	// top-right (mirror)
	ctx.save(); ctx.translate(CARD_W - pad, pad); ctx.scale(-1, 1);
	ctx.drawImage(img, 0, 0, size, size); ctx.restore();
	// bottom-left (mirror)
	ctx.save(); ctx.translate(pad, CARD_H - pad); ctx.scale(1, -1);
	ctx.drawImage(img, 0, 0, size, size); ctx.restore();
	// bottom-right (mirror both)
	ctx.save(); ctx.translate(CARD_W - pad, CARD_H - pad); ctx.scale(-1, -1);
	ctx.drawImage(img, 0, 0, size, size); ctx.restore();
	ctx.restore();
}

function wrapText(ctx, text, maxWidth) {
	const words = String(text).split(/\s+/).filter(Boolean);
	const lines = [];
	let line = '';
	for (const word of words) {
		const test = line ? line + ' ' + word : word;
		if (ctx.measureText(test).width > maxWidth && line) {
			lines.push(line);
			line = word;
		} else {
			line = test;
		}
	}
	if (line) lines.push(line);
	return lines;
}

/**
 * Paints the full quote card.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ hebrew, english, source, link }} opts
 * @param {{ file, dark }} parchment
 * @param {HTMLImageElement|null} ornamentImg
 */
export async function paintQuoteCard(ctx, opts, parchment, ornamentImg) {
	const { hebrew, english, source, link } = opts;
	const dark = !!parchment.dark;

	ctx.save();
	ctx.clearRect(0, 0, CARD_W, CARD_H);
	const bg = await loadImage(parchment.file);
	if (bg) {
		drawCover(ctx, bg);
	} else {
		ctx.fillStyle = dark ? '#14100a' : '#f2e7c9';
		ctx.fillRect(0, 0, CARD_W, CARD_H);
	}
	// Soft readability veil behind the text column.
	const veil = ctx.createLinearGradient(0, 0, 0, CARD_H);
	if (dark) {
		veil.addColorStop(0, 'rgba(10,8,5,0.25)');
		veil.addColorStop(0.5, 'rgba(10,8,5,0.45)');
		veil.addColorStop(1, 'rgba(10,8,5,0.25)');
	} else {
		veil.addColorStop(0, 'rgba(255,251,238,0.18)');
		veil.addColorStop(0.5, 'rgba(255,251,238,0.38)');
		veil.addColorStop(1, 'rgba(255,251,238,0.18)');
	}
	ctx.fillStyle = veil;
	ctx.fillRect(0, 0, CARD_W, CARD_H);

	drawOrnamentCorners(ctx, ornamentImg, dark);

	const ink = dark ? '#f3e8cd' : '#2b1d0e';
	const inkSoft = dark ? 'rgba(243,232,205,0.78)' : 'rgba(43,29,14,0.72)';
	const rule = dark ? '#d4a94e' : '#8a6d2f';
	const maxW = CARD_W - MARGIN * 2;

	// Gold rules top and bottom of the text column.
	ctx.strokeStyle = rule;
	ctx.lineWidth = 3;
	ctx.beginPath(); ctx.moveTo(MARGIN, 250); ctx.lineTo(CARD_W - MARGIN, 250); ctx.stroke();
	ctx.beginPath(); ctx.moveTo(MARGIN, CARD_H - 300); ctx.lineTo(CARD_W - MARGIN, CARD_H - 300); ctx.stroke();

	let y = 330;
	ctx.textAlign = 'center';

	// Hebrew passage (RTL).
	const heText = String(hebrew || '').trim();
	if (heText) {
		ctx.fillStyle = ink;
		ctx.direction = 'rtl';
		let size = 64;
		ctx.font = `${size}px ${HE_FONT}`;
		let lines = wrapText(ctx, heText, maxW);
		while ((lines.length > 10 || size * lines.length > 560) && size > 30) {
			size -= 4;
			ctx.font = `${size}px ${HE_FONT}`;
			lines = wrapText(ctx, heText, maxW);
		}
		const lh = size * 1.5;
		for (const ln of lines) {
			ctx.fillText(ln, CARD_W / 2, y);
			y += lh;
		}
		ctx.direction = 'ltr';
		y += 36;
	}

	// English translation.
	const enText = String(english || '').trim();
	if (enText) {
		ctx.fillStyle = inkSoft;
		ctx.font = `italic 40px ${EN_FONT}`;
		const lines = wrapText(ctx, enText, maxW);
		const lh = 60;
		for (const ln of lines.slice(0, 8)) {
			ctx.fillText(ln, CARD_W / 2, y);
			y += lh;
		}
		y += 30;
	}

	// Source line.
	if (source) {
		ctx.fillStyle = ink;
		ctx.font = `600 44px ${EN_FONT}`;
		ctx.fillText(source, CARD_W / 2, y);
		y += 60;
	}

	// Attribution footer.
	ctx.fillStyle = inkSoft;
	ctx.font = `500 34px ${EN_FONT}`;
	ctx.fillText('via Awtsmoos', CARD_W / 2, CARD_H - 210);
	if (link) {
		ctx.font = `400 28px ${EN_FONT}`;
		ctx.fillStyle = dark ? 'rgba(212,169,78,0.9)' : 'rgba(122,90,26,0.9)';
		ctx.fillText(link.replace(/^https?:\/\//, ''), CARD_W / 2, CARD_H - 160);
	}
	ctx.restore();
}

/* ------------------------------------------------------------------ */
/* selection + floating action                                         */
/* ------------------------------------------------------------------ */

function selectionContext() {
	const sel = window.getSelection();
	if (!sel || sel.isCollapsed) return null;
	const text = sel.toString().trim();
	if (text.length < 12) return null;
	const range = sel.getRangeAt(0);
	const container = range.commonAncestorContainer.nodeType === 1
		? range.commonAncestorContainer
		: range.commonAncestorContainer.parentElement;
	if (!container) return null;
	if (container.closest('.qc-modal, .qc-float, .qc-no-quote')) return null;
	const card = container.closest('.feed-card[data-post-id]');
	const rect = range.getBoundingClientRect();
	return { text, rect, card };
}

function postInfoFromCard(card) {
	if (!card) return { title: '', link: location.origin + '/feed/' };
	const titleEl = card.querySelector('.feed-card-title');
	const openEl = card.querySelector('.feed-card-open');
	const authorEl = card.querySelector('.feed-card-author');
	const heichelEl = card.querySelector('.feed-card-heichel');
	return {
		title: titleEl ? titleEl.textContent.trim() : 'Awtsmoos post',
		author: authorEl ? authorEl.textContent.trim() : '',
		heichel: heichelEl ? heichelEl.textContent.trim() : '',
		link: openEl ? openEl.href : (location.origin + '/feed/')
	};
}

function splitHeEn(text) {
	const lines = String(text).split(/\n+/).map(l => l.trim()).filter(Boolean);
	const he = lines.filter(l => isHebrew(l)).join('\n');
	const en = lines.filter(l => !isHebrew(l)).join('\n');
	if (he && en) return { hebrew: he, english: en };
	if (isHebrew(text)) return { hebrew: text, english: '' };
	return { hebrew: '', english: text };
}

/* ------------------------------------------------------------------ */
/* modal                                                               */
/* ------------------------------------------------------------------ */

let modalEl = null;
let floatBtn = null;
let lastCanvas = null;

function ensureFloatButton() {
	if (floatBtn) return floatBtn;
	floatBtn = document.createElement('button');
	floatBtn.type = 'button';
	floatBtn.className = 'qc-float';
	floatBtn.hidden = true;
	floatBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 17c-1.5-1.5-2-3.5-2-5.5C4 7 7 4 11.5 4c.8 0 1.5.1 2.2.3C12.6 5.6 12 7.2 12 9c0 3 2.2 5.2 5 5.7"/><path d="M14 20c-1-1-1.5-2.3-1.5-3.7C12.5 13.6 14.5 12 17.5 12c.5 0 1 .1 1.5.2C18.3 13 18 13.9 18 15c0 1.9 1.4 3.3 3.2 3.6"/></svg><span>Make quote card</span>';
	floatBtn.addEventListener('click', onFloatClick);
	document.body.append(floatBtn);
	return floatBtn;
}

function onFloatClick() {
	const ctx = selectionContext();
	if (!ctx) return;
	openQuoteModal(ctx);
}

function openQuoteModal(ctx) {
	closeQuoteModal();
	const { hebrew, english } = splitHeEn(ctx.text);
	const info = postInfoFromCard(ctx.card);
	const source = [info.title, info.author].filter(Boolean).join(' — ');
	const defaultParchment = (document.documentElement.dataset.theme === 'light')
		? PARCHMENTS[0] : PARCHMENTS[3];

	modalEl = document.createElement('div');
	modalEl.className = 'qc-modal';
	modalEl.setAttribute('role', 'dialog');
	modalEl.setAttribute('aria-modal', 'true');
	modalEl.setAttribute('aria-label', 'Quote card studio');
	modalEl.innerHTML = `
		<div class="qc-backdrop" data-qc-close></div>
		<div class="qc-panel" role="document">
			<header class="qc-head">
				<h2>Quote card studio</h2>
				<button type="button" class="qc-close" data-qc-close aria-label="Close quote card studio">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
				</button>
			</header>
			<div class="qc-body">
				<div class="qc-preview-wrap">
					<canvas class="qc-canvas" width="${CARD_W}" height="${CARD_H}"></canvas>
					<p class="qc-hint">Live preview — 4:5, ready for sharing.</p>
				</div>
				<div class="qc-controls">
					<label class="qc-field">
						<span class="qc-label">Hebrew text</span>
						<textarea class="qc-input" data-qc-he rows="4" dir="rtl" lang="he">${escapeHtml(hebrew)}</textarea>
					</label>
					<label class="qc-field">
						<span class="qc-label">English text</span>
						<textarea class="qc-input" data-qc-en rows="4" dir="ltr">${escapeHtml(english)}</textarea>
					</label>
					<label class="qc-field">
						<span class="qc-label">Source line</span>
						<input class="qc-input" data-qc-source type="text" value="${escapeHtml(source)}">
					</label>
					<div class="qc-field">
						<span class="qc-label" id="qc-parch-label">Parchment</span>
						<div class="qc-swatches" role="radiogroup" aria-labelledby="qc-parch-label">
							${PARCHMENTS.map((p, i) => `
								<button type="button" class="qc-swatch${p.id === defaultParchment.id ? ' is-active' : ''}"
									data-qc-parch="${p.id}" role="radio" aria-checked="${p.id === defaultParchment.id}"
									title="${escapeHtml(p.id.replace(/-/g, ' '))}"
									style="background-image:url('${p.file}')">
									<span class="qc-swatch-name">${escapeHtml(p.id.replace(/-/g, ' '))}</span>
								</button>`).join('')}
						</div>
					</div>
					<div class="qc-field">
						<span class="qc-label" id="qc-orn-label">Corner ornament</span>
						<div class="qc-swatches" role="radiogroup" aria-labelledby="qc-orn-label">
							${ORNAMENTS.map((o, i) => `
								<button type="button" class="qc-swatch qc-swatch-orn${i === 0 ? ' is-active' : ''}"
									data-qc-orn="${i}" role="radio" aria-checked="${i === 0}"
									title="Ornament ${i + 1}">
									<span class="qc-swatch-name">Style ${i + 1}</span>
								</button>`).join('')}
							<button type="button" class="qc-swatch qc-swatch-orn" data-qc-orn="none" role="radio" aria-checked="false" title="No ornament">
								<span class="qc-swatch-name">None</span>
							</button>
						</div>
					</div>
					<div class="qc-actions">
						<button type="button" class="qc-btn qc-btn-primary" data-qc-download>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 4v11"/><path d="m7.5 11.5 4.5 4.5 4.5-4.5"/><path d="M4.5 19.5h15"/></svg>
							<span>Download PNG</span>
						</button>
						<button type="button" class="qc-btn" data-qc-share>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 3v10"/><path d="M8 6.5 12 3l4 3.5"/><path d="M5 12v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-7"/></svg>
							<span>Share</span>
						</button>
					</div>
					<p class="qc-note">Every card carries “via Awtsmoos” and a link back to the post.</p>
				</div>
			</div>
		</div>`;
	document.body.append(modalEl);
	document.body.classList.add('qc-open');

	const canvas = modalEl.querySelector('.qc-canvas');
	lastCanvas = canvas;
	const state = {
		parchment: defaultParchment,
		ornament: 0,
		ornamentImg: null
	};
	let paintToken = 0;
	async function repaint() {
		const my = ++paintToken;
		const he = modalEl.querySelector('[data-qc-he]').value;
		const en = modalEl.querySelector('[data-qc-en]').value;
		const src = modalEl.querySelector('[data-qc-source]').value;
		let orn = null;
		if (state.ornament !== 'none' && state.ornament != null) {
			orn = await loadImage(ORNAMENTS[state.ornament]);
		}
		if (my !== paintToken) return;
		const ctx2d = canvas.getContext('2d');
		await paintQuoteCard(ctx2d, { hebrew: he, english: en, source: src, link: info.link }, state.parchment, orn);
	}

	let debounce = null;
	function scheduleRepaint() {
		clearTimeout(debounce);
		debounce = setTimeout(repaint, 250);
	}
	modalEl.querySelectorAll('[data-qc-he],[data-qc-en],[data-qc-source]')
		.forEach(el => el.addEventListener('input', scheduleRepaint));

	modalEl.querySelectorAll('[data-qc-parch]').forEach(btn => {
		btn.addEventListener('click', () => {
			modalEl.querySelectorAll('[data-qc-parch]').forEach(b => {
				b.classList.remove('is-active');
				b.setAttribute('aria-checked', 'false');
			});
			btn.classList.add('is-active');
			btn.setAttribute('aria-checked', 'true');
			state.parchment = PARCHMENTS.find(p => p.id === btn.dataset.qcParch) || PARCHMENTS[0];
			repaint();
		});
	});
	modalEl.querySelectorAll('[data-qc-orn]').forEach(btn => {
		btn.addEventListener('click', () => {
			modalEl.querySelectorAll('[data-qc-orn]').forEach(b => {
				b.classList.remove('is-active');
				b.setAttribute('aria-checked', 'false');
			});
			btn.classList.add('is-active');
			btn.setAttribute('aria-checked', 'true');
			state.ornament = btn.dataset.qcOrn === 'none' ? 'none' : Number(btn.dataset.qcOrn);
			repaint();
		});
	});

	modalEl.querySelector('[data-qc-download]').addEventListener('click', async () => {
		await repaint();
		canvas.toBlob((blob) => {
			if (!blob) return;
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = 'awtsmoos-quote-card.png';
			document.body.append(a);
			a.click();
			a.remove();
			setTimeout(() => URL.revokeObjectURL(a.href), 4000);
		}, 'image/png');
	});

	const shareBtn = modalEl.querySelector('[data-qc-share]');
	if (!('share' in navigator)) {
		shareBtn.disabled = true;
		shareBtn.title = 'Sharing is not supported in this browser — download the PNG instead.';
	}
	shareBtn.addEventListener('click', async () => {
		await repaint();
		try {
			const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
			const file = new File([blob], 'awtsmoos-quote-card.png', { type: 'image/png' });
			const data = { title: 'Awtsmoos quote card', text: (modalEl.querySelector('[data-qc-en]').value || modalEl.querySelector('[data-qc-he]').value || '').slice(0, 200), url: info.link };
			if (navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file];
			await navigator.share(data);
		} catch (err) {
			if (err && err.name !== 'AbortError') {
				shareBtn.title = 'Share failed — download the PNG instead.';
			}
		}
	});

	modalEl.querySelectorAll('[data-qc-close]').forEach(el => {
		el.addEventListener('click', closeQuoteModal);
	});
	modalEl._onKey = (e) => { if (e.key === 'Escape') closeQuoteModal(); };
	document.addEventListener('keydown', modalEl._onKey);

	repaint();
	window.getSelection()?.removeAllRanges();
}

function closeQuoteModal() {
	if (modalEl) {
		document.removeEventListener('keydown', modalEl._onKey);
		modalEl.remove();
		modalEl = null;
	}
	document.body.classList.remove('qc-open');
}

/**
 * Wires the floating "Make quote card" action to text selection in the feed.
 */
export function initQuoteCards() {
	const btn = ensureFloatButton();
	let raf = 0;
	document.addEventListener('selectionchange', () => {
		cancelAnimationFrame(raf);
		raf = requestAnimationFrame(() => {
			if (modalEl) { btn.hidden = true; return; }
			const ctx = selectionContext();
			if (!ctx) { btn.hidden = true; return; }
			const r = ctx.rect;
			const x = Math.min(Math.max(r.left + r.width / 2, 90), window.innerWidth - 90);
			const y = Math.max(r.top - 56 + window.scrollY, window.scrollY + 8);
			btn.style.left = x + 'px';
			btn.style.top = y + 'px';
			btn.hidden = false;
		});
	});
	document.addEventListener('scroll', () => { btn.hidden = true; }, { passive: true });
}
