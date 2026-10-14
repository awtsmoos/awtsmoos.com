// B"H
/**
 * @module DafCompanion
 * @description
 * B"H — Yaakov 2026-10-14 (TRACK I): the Daf Companion. A plain-language
 * companion for each daf of Talmud Bavli: which masechta and daf, an editor
 * slot for a plain-English summary, key concepts, a difficult-words glossary,
 * and links to the daf's posts on the feed.
 *
 * CONTENT RULE (standing): this module is SCAFFOLD ONLY. It never invents
 * Torah explanations, translations, or halachic guidance. All explanatory
 * text is an editor slot marked for human editors. `MASECHTOS` holds only
 * public structural metadata (names, daf counts where certain; null means
 * "editor to confirm").
 *
 * Mounts via `mount(el, ctx)` like every other learning-track module.
 * `initCardHooks()` is a no-op kept for the hub contract.
 */

import { icon, escapeHtml } from '../icons.js';

const STORE_KEY = 'awtsmoos-daf-companion-v1';

/* B"H — EDITORS: public structural metadata only. Set `dafim` to null when
   unsure; the UI renders "—" and asks editors to confirm. */
const MASECHTOS = [
	{ name: 'Berachos', hebrew: 'ברכות', dafim: 64 },
	{ name: 'Shabbos', hebrew: 'שבת', dafim: 157 },
	{ name: 'Eruvin', hebrew: 'עירובין', dafim: 105 },
	{ name: 'Pesachim', hebrew: 'פסחים', dafim: 121 },
	{ name: 'Yoma', hebrew: 'יומא', dafim: 88 },
	{ name: 'Sukkah', hebrew: 'סוכה', dafim: 56 },
	{ name: 'Beitzah', hebrew: 'ביצה', dafim: 40 },
	{ name: 'Rosh Hashanah', hebrew: 'ראש השנה', dafim: 35 },
	{ name: 'Taanis', hebrew: 'תענית', dafim: 31 },
	{ name: 'Megillah', hebrew: 'מגילה', dafim: 31 },
	{ name: 'Moed Katan', hebrew: 'מועד קטן', dafim: 29 },
	{ name: 'Chagigah', hebrew: 'חגיגה', dafim: 27 },
	{ name: 'Yevamos', hebrew: 'יבמות', dafim: 122 },
	{ name: 'Kesubos', hebrew: 'כתובות', dafim: 112 },
	{ name: 'Nedarim', hebrew: 'נדרים', dafim: 91 },
	{ name: 'Nazir', hebrew: 'נזיר', dafim: 66 },
	{ name: 'Sotah', hebrew: 'סוטה', dafim: 49 },
	{ name: 'Gittin', hebrew: 'גיטין', dafim: 90 },
	{ name: 'Kiddushin', hebrew: 'קידושין', dafim: 82 },
	{ name: 'Bava Kamma', hebrew: 'בבא קמא', dafim: 119 },
	{ name: 'Bava Metzia', hebrew: 'בבא מציעא', dafim: 119 },
	{ name: 'Bava Basra', hebrew: 'בבא בתרא', dafim: 176 },
	{ name: 'Sanhedrin', hebrew: 'סנהדרין', dafim: 113 },
	{ name: 'Makkos', hebrew: 'מכות', dafim: 24 },
	{ name: 'Shevuos', hebrew: 'שבועות', dafim: 49 },
	{ name: 'Avodah Zarah', hebrew: 'עבודה זרה', dafim: 76 },
	{ name: 'Horayos', hebrew: 'הוריות', dafim: 14 },
	{ name: 'Zevachim', hebrew: 'זבחים', dafim: 120 },
	{ name: 'Menachos', hebrew: 'מנחות', dafim: 110 },
	{ name: 'Chullin', hebrew: 'חולין', dafim: 142 },
	{ name: 'Bechoros', hebrew: 'בכורות', dafim: 61 },
	{ name: 'Arachin', hebrew: 'ערכין', dafim: 34 },
	{ name: 'Temurah', hebrew: 'תמורה', dafim: 34 },
	{ name: 'Kerisos', hebrew: 'כריתות', dafim: 28 },
	{ name: 'Meilah', hebrew: 'מעילה', dafim: 22 },
	{ name: 'Tamid', hebrew: 'תמיד', dafim: null },
	{ name: 'Middos', hebrew: 'מדות', dafim: null },
	{ name: 'Kinnim', hebrew: 'קנים', dafim: null },
];

/* B"H — EDITORS: per-daf companion content goes here, keyed
   `${masechta}:${daf}`. Each entry is written by a human editor:
   { summary, concepts: [..], glossary: [{word, meaning}], postLinks: [url] }.
   Anything not filled renders an "editors are preparing this" slot. */
const DAF_CONTENT = {};

function editorSlot(label, hint) {
	return `
		<div class="lti-slot">
			<span class="lti-slot-label">${escapeHtml(label)}</span>
			<p>${escapeHtml(hint)}</p>
		</div>`;
}

function glossaryList(glossary) {
	if (!glossary || !glossary.length) {
		return editorSlot('Difficult words glossary',
			'Editor: list the daf\'s difficult words here — each word with a plain-English meaning a beginner can follow.');
	}
	return `<ul class="lti-list">${glossary.map(g => `
		<li><div style="padding:10px 12px">
			<span class="lti-he" style="font-size:18px">${escapeHtml(g.word || '')}</span>
			<span class="lti-list-sub">${escapeHtml(g.meaning || '')}</span>
		</div></li>`).join('')}</ul>`;
}

function dafView(masechta, daf, ctx) {
	const key = `${masechta.name}:${daf}`;
	const c = DAF_CONTENT[key] || {};
	const postLinks = Array.isArray(c.postLinks) ? c.postLinks : [];
	return `
		<div class="lti-head">
			<div>
				<h3>${escapeHtml(masechta.name)} ${escapeHtml(String(daf))}</h3>
				<p><span class="lti-he" style="font-size:16px">${escapeHtml(masechta.hebrew)} · דף ${escapeHtml(String(daf))}</span></p>
			</div>
			<button type="button" class="lti-back" data-daf-back>${icon('chevronUp')} Back</button>
		</div>
		<div class="lti-card">
			<h4>Plain-English summary</h4>
			${c.summary ? `<p>${escapeHtml(c.summary)}</p>` : editorSlot('Summary',
				'Editor: write a plain-English summary of this daf — what happens on the page, in language a first-time learner can follow.')}
		</div>
		<div class="lti-card">
			<h4>Key concepts</h4>
			${(c.concepts && c.concepts.length)
				? `<ul class="lti-list">${c.concepts.map(k => `<li><div style="padding:10px 12px"><span class="lti-list-title">${escapeHtml(k)}</span></div></li>`).join('')}</ul>`
				: editorSlot('Key concepts', 'Editor: list the 3–5 key concepts of this daf, each in one plain sentence.')}
		</div>
		<div class="lti-card">
			<h4>Difficult words</h4>
			${glossaryList(c.glossary)}
		</div>
		<div class="lti-card">
			<h4>Posts on this daf</h4>
			${postLinks.length
				? `<ul class="lti-list">${postLinks.map(u => `<li><a class="lti-list-row" style="text-decoration:none" href="${escapeHtml(u)}" target="_blank" rel="noopener">${icon('external')}<span class="lti-list-main"><span class="lti-list-title">Open post</span></span></a></li>`).join('')}</ul>`
				: `<p>No posts linked yet.</p>`}
			<div class="lti-row" style="margin-top:10px">
				<button type="button" class="lti-btn" data-daf-find-posts="${escapeHtml(masechta.name)} ${escapeHtml(String(daf))}">
					${icon('search')} Find posts for this daf
				</button>
			</div>
			${editorSlot('Post links', 'Editor: pin the best feed posts for this daf here so learners land on them directly.')}
		</div>`;
}

export async function mount(el, ctx) {
	el.classList.add('lti');
	const store = ctx.readStore(STORE_KEY, {});
	const selMasechta = store.masechta || '';
	const selDaf = store.daf || '';

	function renderPicker() {
		el.innerHTML = `
			<div class="lti-head">
				<div>
					<h3>${icon('book', 'feed-ic')} Daf Companion</h3>
					<p>A plain-language friend for every daf. Pick a masechta, then a daf.</p>
				</div>
			</div>
			<div class="lti-card">
				<h4>Masechta</h4>
				<div class="lti-grid">
					${MASECHTOS.map(m => `
						<button type="button" class="lti-tile ${m.name === selMasechta ? 'is-now' : ''}" data-masechta="${escapeHtml(m.name)}">
							<span class="lti-tile-he">${escapeHtml(m.hebrew)}</span>
							<span class="lti-tile-title">${escapeHtml(m.name)}</span>
							<span class="lti-tile-sub">${m.dafim ? m.dafim + ' dapim' : 'daf count — editor to confirm'}</span>
						</button>`).join('')}
				</div>
			</div>
			<div class="lti-card" id="lti-daf-picker" ${selMasechta ? '' : 'hidden'}>
				<h4>Daf</h4>
				<div class="lti-row" id="lti-daf-list"></div>
			</div>`;
		el.querySelectorAll('[data-masechta]').forEach(btn => {
			btn.addEventListener('click', () => {
				const m = MASECHTOS.find(x => x.name === btn.dataset.masechta);
				ctx.writeStore(STORE_KEY, { masechta: m.name, daf: selDaf });
				renderDafPicker(m);
			});
		});
		if (selMasechta) {
			const m = MASECHTOS.find(x => x.name === selMasechta);
			if (m) renderDafPicker(m);
		}
	}

	function renderDafPicker(m) {
		const card = el.querySelector('#lti-daf-picker');
		const list = el.querySelector('#lti-daf-list');
		card.hidden = false;
		const max = m.dafim || 0;
		if (!max) {
			list.innerHTML = editorSlot('Daf list', `Editor: confirm the daf count for ${m.name}; the picker builds itself from it.`);
			return;
		}
		/* Daf numbering starts at daf 2 (daf 1 is the title page). */
		let html = '';
		for (let d = 2; d <= max + 1; d++) {
			html += `<button type="button" class="lti-btn" data-daf="${d}" style="min-width:52px;justify-content:center">${d}</button>`;
		}
		list.innerHTML = html;
		list.querySelectorAll('[data-daf]').forEach(btn => {
			btn.addEventListener('click', () => {
				ctx.writeStore(STORE_KEY, { masechta: m.name, daf: btn.dataset.daf });
				renderDaf(m, btn.dataset.daf);
			});
		});
	}

	function renderDaf(m, daf) {
		el.innerHTML = dafView(m, daf, ctx);
		el.querySelector('[data-daf-back]').addEventListener('click', renderPicker);
		el.querySelectorAll('[data-daf-find-posts]').forEach(btn => {
			btn.addEventListener('click', () => {
				/* The feed wires this event to its post search; without a
				   listener the companion simply notes the request. */
				document.dispatchEvent(new CustomEvent('awtsmoos:daf-search', {
					detail: { query: btn.dataset.dafFindPosts, source: 'daf-companion' },
					bubbles: true,
				}));
			});
		});
	}

	renderPicker();
}

export function initCardHooks() {
	/* No per-card hooks for the companion. */
}
