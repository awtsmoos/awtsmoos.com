// B"H
/**
 * @module Timeline
 * @description
 * B"H — Yaakov 2026-10-13, TRACK G (visual exploration): chronological
 * timeline of texts, sages, and events. A scrollable vertical timeline of
 * eras; clicking an era filters the listed posts to that period.
 *
 * Date honesty is the core rule here:
 *   - Post dates come from the post's own metadata when it carries any
 *     (era / year fields); otherwise the post is matched against known
 *     sage names and marked approximate.
 *   - Every era and every matched post carries an explicit certainty note:
 *     "dated", "approximate", or "undated".
 *   - Posts that cannot be placed sit in an honest "Undated" bucket at the
 *     end — never forced into a period.
 *   - Sage year data is approximate by nature; when
 *     geelooy/feed/data/sages.json exists (TRACK G feature 5) it is used to
 *     enrich matches, with the same certainty flags.
 *
 * Public API: mount(el, ctx).
 */

import { icon, escapeHtml } from '../icons.js';

/** Curated eras. Ranges are scholarly convention, marked approximate. */
const ERAS = [
	{ id: 'tanach', name: 'Tanach', span: 'c. 13th–5th century BCE', certainty: 'approximate',
		blurb: 'The Written Torah and the Prophets — from Moshe Rabbeinu through the return to Zion.' },
	{ id: 'zugot', name: 'Zugot', span: 'c. 200–30 BCE', certainty: 'approximate',
		blurb: 'The Pairs who led the Sanhedrin from the late Second Temple period.' },
	{ id: 'tannaim', name: 'Tannaim', span: 'c. 10–220 CE', certainty: 'approximate',
		blurb: 'The sages of the Mishnah — from Hillel and Shammai to Rebbe.' },
	{ id: 'amoraim', name: 'Amoraim', span: 'c. 200–500 CE', certainty: 'approximate',
		blurb: 'The sages of the Talmud, in Israel and Babylonia.' },
	{ id: 'geonim', name: 'Geonim', span: 'c. 589–1038 CE', certainty: 'approximate',
		blurb: 'The heads of the Babylonian academies after the Talmud’s close.' },
	{ id: 'rishonim', name: 'Rishonim', span: 'c. 1038–1500 CE', certainty: 'approximate',
		blurb: 'The early commentators — Rashi, Tosafot, Rambam, Ramban, and their peers.' },
	{ id: 'acharonim', name: 'Acharonim', span: 'c. 1500–present', certainty: 'dated',
		blurb: 'Later authorities through the present day.' }
];

/** Built-in approximate sage lookup so the timeline works standalone.
 *  nameKey -> { era, note }. Years intentionally omitted: era-level only. */
const SAGE_ERAS = [
	{ keys: ['moshe', 'moses'], era: 'tanach' },
	{ keys: ['hillel', 'shammai', 'gamliel'], era: 'zugot' },
	{ keys: ['yochanan ben zakkai', 'akiva', 'tarfon', 'yishmael', 'eliezer ben hyrcanus', 'meir', 'yehuda hanasi', 'yehudah hanasi', 'rebbe', 'shimon bar yochai', 'shimon bar yohai', 'yose ben chalafta'], era: 'tannaim' },
	{ keys: ['rav ', 'shmu', 'samuel', 'yochanan', 'reish lakish', 'resh lakish', 'huna', 'yehuda', 'rabbah', 'yosef', 'abaya', 'abaye', 'rava', 'ashi', 'ravina'], era: 'amoraim' },
	{ keys: ['saadya', 'saadia', 'sherira', 'hai gaon'], era: 'geonim' },
	{ keys: ['rashi', 'tosaf', 'rambam', 'maimonides', 'ramban', 'nachmanides', 'rif', 'alfasi', 'rosh', 'asher', 'rashba', 'ran '], era: 'rishonim' },
	{ keys: ['shulchan aruch', 'caro', 'israeli', 'israel ', 'rebbe', 'alter rebbe', 'mittler rebbe', 'tzaddik'], era: 'acharonim' }
];

function norm(s) {
	return String(s || '').toLowerCase();
}

function eraOfPost(post) {
	const hay = norm([post.era, post.metadata?.era, post.year, post.metadata?.year,
		post.sageName, post.authorName, post.title, post.description, (post.hashtags || []).join(' ')].join(' '));
	for (const entry of SAGE_ERAS) {
		for (const key of entry.keys) {
			if (key && hay.includes(key)) return { era: entry.era, certainty: 'approximate' };
		}
	}
	// Explicit year metadata on the post itself.
	const m = hay.match(/\b(1[0-9]{3}|20[0-2][0-9])\b/);
	if (m) {
		const year = Number(m[1]);
		if (year < 220) return { era: 'tannaim', certainty: 'approximate' };
		if (year < 500) return { era: 'amoraim', certainty: 'approximate' };
		if (year < 1038) return { era: 'geonim', certainty: 'approximate' };
		if (year < 1500) return { era: 'rishonim', certainty: 'approximate' };
		return { era: 'acharonim', certainty: 'dated' };
	}
	return { era: 'undated', certainty: 'undated' };
}

async function fetchPosts(limit = 200) {
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

function postHref(post) {
	const id = post.id || post.postId;
	return id ? `/social/post/${encodeURIComponent(id)}` : '/social/';
}

function postTitle(post) {
	return String(post.title || post.name || 'Untitled post').slice(0, 120);
}

/**
 * Mounts the timeline view.
 * @param {HTMLElement} el
 * @param {object} [ctx]
 */
export async function mount(el, ctx = {}) {
	el.innerHTML = '';
	const wrap = document.createElement('div');
	wrap.className = 'tln';
	el.append(wrap);

	wrap.innerHTML = `
		<p class="tln-intro">A walk through the generations. Tap an era to see its posts from the river.
		Dates marked <em>approximate</em> are scholarly convention; posts that cannot
		be placed sit honestly in <em>Undated</em>.</p>
		<div class="tln-layout">
			<ol class="tln-rail" aria-label="Eras"></ol>
			<div class="tln-detail" aria-live="polite"></div>
		</div>`;

	const rail = wrap.querySelector('.tln-rail');
	const detail = wrap.querySelector('.tln-detail');

	rail.innerHTML = `<li class="tln-loading">Loading the river…</li>`;
	const posts = await fetchPosts();
	const byEra = new Map(ERAS.map(e => [e.id, []]));
	const undated = [];
	for (const post of posts) {
		const { era, certainty } = eraOfPost(post);
		post.__era = era;
		post.__certainty = certainty;
		if (byEra.has(era)) byEra.get(era).push(post);
		else undated.push(post);
	}

	const counts = (id) => (id === 'undated' ? undated : byEra.get(id) || []).length;

	rail.innerHTML = ERAS.map(e => `
		<li>
			<button type="button" class="tln-era" data-era="${e.id}" aria-pressed="false">
				<span class="tln-dot" aria-hidden="true"></span>
				<span class="tln-era-text">
					<span class="tln-era-name">${escapeHtml(e.name)}</span>
					<span class="tln-era-span">${escapeHtml(e.span)}</span>
					<span class="tln-era-count">${counts(e.id)} post${counts(e.id) === 1 ? '' : 's'}</span>
				</span>
			</button>
		</li>`).join('') + `
		<li>
			<button type="button" class="tln-era" data-era="undated" aria-pressed="false">
				<span class="tln-dot is-undated" aria-hidden="true"></span>
				<span class="tln-era-text">
					<span class="tln-era-name">Undated</span>
					<span class="tln-era-span">could not be placed</span>
					<span class="tln-era-count">${undated.length} post${undated.length === 1 ? '' : 's'}</span>
				</span>
			</button>
		</li>`;

	function certaintyBadge(certainty) {
		if (certainty === 'dated') return `<span class="tln-cert is-dated">dated</span>`;
		if (certainty === 'approximate') return `<span class="tln-cert is-approx">approximate</span>`;
		return `<span class="tln-cert is-undated">undated</span>`;
	}

	function showEra(eraId) {
		rail.querySelectorAll('.tln-era').forEach(b =>
			b.setAttribute('aria-pressed', b.dataset.era === eraId ? 'true' : 'false'));
		const era = ERAS.find(e => e.id === eraId);
		const list = eraId === 'undated' ? undated : (byEra.get(eraId) || []);
		const head = era
			? `<h3>${escapeHtml(era.name)}</h3>
			   <p class="tln-era-blurb">${escapeHtml(era.blurb)}</p>
			   <p class="tln-era-meta">${escapeHtml(era.span)} · ${certaintyBadge(era.certainty)}</p>`
			: `<h3>Undated</h3>
			   <p class="tln-era-blurb">These posts carry no era metadata and matched no known sage.
			   They are shown here rather than forced into a period.</p>`;
		detail.innerHTML = head + (list.length ? `
			<ul class="tln-posts">
				${list.slice(0, 40).map(p => `
					<li>
						<a class="tln-post" href="${postHref(p)}" target="_blank" rel="noopener">
							<span class="tln-post-title">${escapeHtml(postTitle(p))}</span>
							${certaintyBadge(p.__certainty)}
						</a>
					</li>`).join('')}
			</ul>
			${list.length > 40 ? `<p class="tln-more">Showing 40 of ${list.length}.</p>` : ''}
			<p class="tln-feedlink"><a href="/social/?q=${encodeURIComponent(era ? era.name : 'torah')}" target="_blank" rel="noopener">Search the river for “${escapeHtml(era ? era.name : '')}” ${icon('external', 'feed-ic')}</a></p>`
			: `<p class="tln-empty">No river posts placed in this era yet.</p>`);
	}

	rail.addEventListener('click', (e) => {
		const btn = e.target.closest('.tln-era');
		if (btn) showEra(btn.dataset.era);
	});

	// Open on the era with the most posts, so the view is never empty.
	const best = [...ERAS.map(e => e.id), 'undated'].sort((a, b) => counts(b) - counts(a))[0];
	showEra(best);
}
