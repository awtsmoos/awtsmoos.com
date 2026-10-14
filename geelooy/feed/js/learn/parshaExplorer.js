// B"H
/**
 * @module ParshaExplorer
 * @description
 * B"H — Yaakov 2026-10-14 (TRACK I): the Parsha Explorer. An interactive
 * view of the weekly Torah portion: the 54 parshiyos, an aliyos breakdown
 * per parsha, editor slots for key themes and related maamarim, and a
 * "this week's parsha" highlight.
 *
 * CONTENT RULE (standing): SCAFFOLD ONLY. Parsha names, sefarim, and the
 * seven-aliyah structure are public structural facts. Verse ranges, theme
 * write-ups, and commentary are editor slots — never auto-generated.
 *
 * The weekly highlight is set by `setThisWeekParsha(name, weekOf)` (the
 * coordinator's weekly scheduler calls it) and persisted in localStorage.
 * Mounts via `mount(el, ctx)`; `initCardHooks()` is a no-op.
 */

import { icon, escapeHtml } from '../icons.js';

const STORE_KEY = 'awtsmoos-parsha-explorer-v1';
const WEEK_KEY = 'awtsmoos-parsha-this-week-v1';

/* B"H — EDITORS: per-parsha content lives here, keyed by parsha name:
   { themes: [..], maamarim: [{title, url}], aliyahRanges: {1:'..',...7:'..'} }.
   Anything missing renders an editor slot. */
const PARSHA_CONTENT = {};

const SEFARIM = ['Bereshis', 'Shemos', 'Vayikra', 'Bamidbar', 'Devarim'];
const SEFER_HE = { Bereshis: 'בראשית', Shemos: 'שמות', Vayikra: 'ויקרא', Bamidbar: 'במדבר', Devarim: 'דברים' };

const PARSHOS = [
	['Bereshis', 'Bereshis', 'בראשית'], ['Bereshis', 'Noach', 'נח'], ['Bereshis', 'Lech Lecha', 'לך לך'],
	['Bereshis', 'Vayeira', 'וירא'], ['Bereshis', 'Chayei Sarah', 'חיי שרה'], ['Bereshis', 'Toldos', 'תולדות'],
	['Bereshis', 'Vayeitzei', 'ויצא'], ['Bereshis', 'Vayishlach', 'וישלח'], ['Bereshis', 'Vayeishev', 'וישב'],
	['Bereshis', 'Mikeitz', 'מקץ'], ['Bereshis', 'Vayigash', 'ויגש'], ['Bereshis', 'Vayechi', 'ויחי'],
	['Shemos', 'Shemos', 'שמות'], ['Shemos', 'Va\'eira', 'וארא'], ['Shemos', 'Bo', 'בא'],
	['Shemos', 'Beshalach', 'בשלח'], ['Shemos', 'Yisro', 'יתרו'], ['Shemos', 'Mishpatim', 'משפטים'],
	['Shemos', 'Terumah', 'תרומה'], ['Shemos', 'Tetzaveh', 'תצוה'], ['Shemos', 'Ki Sisa', 'כי תשא'],
	['Shemos', 'Vayakhel', 'ויקהל'], ['Shemos', 'Pekudei', 'פקודי'],
	['Vayikra', 'Vayikra', 'ויקרא'], ['Vayikra', 'Tzav', 'צו'], ['Vayikra', 'Shemini', 'שמיני'],
	['Vayikra', 'Tazria', 'תזריע'], ['Vayikra', 'Metzora', 'מצורע'], ['Vayikra', 'Acharei Mos', 'אחרי מות'],
	['Vayikra', 'Kedoshim', 'קדושים'], ['Vayikra', 'Emor', 'אמור'], ['Vayikra', 'Behar', 'בהר'],
	['Vayikra', 'Bechukosai', 'בחקתי'],
	['Bamidbar', 'Bamidbar', 'במדבר'], ['Bamidbar', 'Naso', 'נשא'], ['Bamidbar', 'Behaaloscha', 'בהעלתך'],
	['Bamidbar', 'Shelach', 'שלח'], ['Bamidbar', 'Korach', 'קרח'], ['Bamidbar', 'Chukas', 'חקת'],
	['Bamidbar', 'Balak', 'בלק'], ['Bamidbar', 'Pinchas', 'פנחס'], ['Bamidbar', 'Matos', 'מטות'],
	['Bamidbar', 'Masei', 'מסעי'],
	['Devarim', 'Devarim', 'דברים'], ['Devarim', 'Va\'eschanan', 'ואתחנן'], ['Devarim', 'Eikev', 'עקב'],
	['Devarim', 'Re\'eh', 'ראה'], ['Devarim', 'Shoftim', 'שפטים'], ['Devarim', 'Ki Seitzei', 'כי תצא'],
	['Devarim', 'Ki Savo', 'כי תבוא'], ['Devarim', 'Nitzavim', 'נצבים'], ['Devarim', 'Vayeilech', 'וילך'],
	['Devarim', 'Haazinu', 'האזינו'], ['Devarim', 'Vezos Haberachah', 'וזאת הברכה'],
].map(([sefer, name, hebrew]) => ({ sefer, name, hebrew }));

const ALIYAH_NAMES = ['Kohen', 'Levi', 'Shelishi', 'Revi\'i', 'Chamishi', 'Shishi', 'Shevi\'i'];

/**
 * Called by the coordinator's weekly scheduler to mark this week's parsha.
 * @param {string} name Parsha name as in PARSHOS.
 * @param {string} weekOf ISO date the week starts (for display only).
 */
export function setThisWeekParsha(name, weekOf) {
	try {
		localStorage.setItem(WEEK_KEY, JSON.stringify({ name, weekOf: weekOf || '' }));
		return true;
	} catch (_) { return false; }
}

export function getThisWeekParsha() {
	try {
		const raw = localStorage.getItem(WEEK_KEY);
		if (!raw) return null;
		const p = JSON.parse(raw);
		return p && p.name ? p : null;
	} catch (_) { return null; }
}

function editorSlot(label, hint) {
	return `
		<div class="lti-slot">
			<span class="lti-slot-label">${escapeHtml(label)}</span>
			<p>${escapeHtml(hint)}</p>
		</div>`;
}

function parshaDetail(p, ctx, onBack) {
	const c = PARSHA_CONTENT[p.name] || {};
	const ranges = c.aliyahRanges || {};
	return `
		<div class="lti-head">
			<div>
				<h3>${escapeHtml(p.name)}</h3>
				<p><span class="lti-he" style="font-size:16px">${escapeHtml(p.hebrew)}</span> · Sefer ${escapeHtml(p.sefer)}</p>
			</div>
			<button type="button" class="lti-back" data-parsha-back>${icon('chevronUp')} Back</button>
		</div>
		<div class="lti-card">
			<h4>Aliyos — click one to explore</h4>
			<ul class="lti-list">
				${ALIYAH_NAMES.map((a, i) => `
					<li><button type="button" class="lti-list-row" data-aliyah="${i + 1}">
						<span class="lti-list-num">${i + 1}</span>
						<span class="lti-list-main">
							<span class="lti-list-title">${escapeHtml(a)}</span>
							<span class="lti-list-sub">${escapeHtml(ranges[i + 1] || 'Verse range — editor to fill in')}</span>
						</span>
						${icon('chevronDown')}
					</button>
					<div class="lti-aliyah-body" data-aliyah-body="${i + 1}" hidden style="padding:0 12px 12px"></div>
					</li>`).join('')}
			</ul>
		</div>
		<div class="lti-card">
			<h4>Key themes</h4>
			${(c.themes && c.themes.length)
				? `<ul class="lti-list">${c.themes.map(t => `<li><div style="padding:10px 12px"><span class="lti-list-title">${escapeHtml(t)}</span></div></li>`).join('')}</ul>`
				: editorSlot('Key themes', 'Editor: write the parsha\'s key themes here — short, plain-language, no spoilers for the reader.')}
		</div>
		<div class="lti-card">
			<h4>Related maamarim</h4>
			${(c.maamarim && c.maamarim.length)
				? `<ul class="lti-list">${c.maamarim.map(m => `<li><a class="lti-list-row" style="text-decoration:none" href="${escapeHtml(m.url || '#')}" target="_blank" rel="noopener">${icon('book')}<span class="lti-list-main"><span class="lti-list-title">${escapeHtml(m.title || 'Maamar')}</span></span></a></li>`).join('')}</ul>`
				: editorSlot('Related maamarim', 'Editor: link the maamarim that expound this parsha.')}
			<div class="lti-row" style="margin-top:10px">
				<button type="button" class="lti-btn" data-parsha-find="${escapeHtml(p.name)}">
					${icon('search')} Find posts on ${escapeHtml(p.name)}
				</button>
			</div>
		</div>`;
}

export async function mount(el, ctx) {
	el.classList.add('lti');
	const thisWeek = getThisWeekParsha();

	function renderIndex() {
		el.innerHTML = `
			<div class="lti-head">
				<div>
					<h3>${icon('book', 'feed-ic')} Parsha Explorer</h3>
					<p>The 54 parshiyos of the Torah — aliyos, themes, and related maamarim.</p>
				</div>
			</div>
			${thisWeek
				? `<div class="lti-gentle"><p><strong>This week's parsha:</strong> ${escapeHtml(thisWeek.name)}${thisWeek.weekOf ? ` — week of ${escapeHtml(thisWeek.weekOf)}` : ''}</p></div>`
				: `<div class="lti-slot"><span class="lti-slot-label">This week's parsha</span><p>The weekly highlight is set by the site scheduler (setThisWeekParsha). Until then, browse all 54 below.</p></div>`}
			${SEFARIM.map(s => `
				<div class="lti-card">
					<h4>Sefer ${escapeHtml(s)} <span class="lti-he" style="font-size:16px">${escapeHtml(SEFER_HE[s])}</span></h4>
					<div class="lti-grid">
						${PARSHOS.filter(p => p.sefer === s).map(p => `
							<button type="button" class="lti-tile ${thisWeek && thisWeek.name === p.name ? 'is-now' : ''}" data-parsha="${escapeHtml(p.name)}">
								<span class="lti-tile-he">${escapeHtml(p.hebrew)}</span>
								<span class="lti-tile-title">${escapeHtml(p.name)}</span>
								${thisWeek && thisWeek.name === p.name ? '<span class="lti-now-badge">This week</span>' : ''}
							</button>`).join('')}
					</div>
				</div>`).join('')}`;
		el.querySelectorAll('[data-parsha]').forEach(btn => {
			btn.addEventListener('click', () => {
				const p = PARSHOS.find(x => x.name === btn.dataset.parsha);
				if (p) renderDetail(p);
			});
		});
	}

	function renderDetail(p) {
		el.innerHTML = parshaDetail(p, ctx);
		el.querySelector('[data-parsha-back]').addEventListener('click', renderIndex);
		el.querySelectorAll('[data-aliyah]').forEach(btn => {
			btn.addEventListener('click', () => {
				const n = btn.dataset.aliyah;
				const body = el.querySelector(`[data-aliyah-body="${n}"]`);
				const open = !body.hidden;
				el.querySelectorAll('[data-aliyah-body]').forEach(b => { b.hidden = true; });
				if (open) return;
				const c = PARSHA_CONTENT[p.name] || {};
				const verses = (c.aliyahVerses && c.aliyahVerses[n]) || null;
				body.innerHTML = `
					<p class="lti-stat">Aliyah ${escapeHtml(n)} — ${escapeHtml(ALIYAH_NAMES[Number(n) - 1])}</p>
					${verses ? `<div class="lti-he">${escapeHtml(verses)}</div>` : editorSlot('Verses + commentaries',
						`Editor: add the verses of ${p.name} aliyah ${n} here, with the commentaries a learner should read alongside.`)}`;
				body.hidden = false;
			});
		});
		el.querySelectorAll('[data-parsha-find]').forEach(btn => {
			btn.addEventListener('click', () => {
				document.dispatchEvent(new CustomEvent('awtsmoos:parsha-search', {
					detail: { query: btn.dataset.parshaFind, source: 'parsha-explorer' },
					bubbles: true,
				}));
			});
		});
	}

	renderIndex();
}

export function initCardHooks() {
	/* No per-card hooks for the explorer. */
}
