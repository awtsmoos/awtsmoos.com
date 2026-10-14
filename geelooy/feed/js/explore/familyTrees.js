// B"H
/**
 * @module FamilyTrees
 * @description
 * B"H — Yaakov 2026-10-13, TRACK G (visual exploration): sage family trees.
 * SVG trees of the Tannaim, Amoraim, and Rishonim, rendered from the local
 * data file geelooy/feed/data/sages.json (no external sources).
 *
 * The tree centers on one sage: parents and teachers above, children and
 * students below — one generation each way, kept readable. Clicking a node
 * re-centers the tree on that sage. The side panel shows the sage's details
 * (dates with explicit certainty flags) and river posts that mention them.
 *
 * The data file is honestly marked incomplete: a starting set of major
 * figures, meant to grow.
 *
 * Public API: mount(el, ctx).
 */

import { escapeHtml } from '../icons.js';

const ERAS = [
	{ id: 'tanach', name: 'Tanach' },
	{ id: 'zugot', name: 'Zugot' },
	{ id: 'tannaim', name: 'Tannaim' },
	{ id: 'amoraim', name: 'Amoraim' },
	{ id: 'geonim', name: 'Geonim' },
	{ id: 'rishonim', name: 'Rishonim' },
	{ id: 'acharonim', name: 'Acharonim' }
];

const NODE_W = 176;
const NODE_H = 66;
const ROW_GAP = 96;

function norm(s) {
	return String(s || '').toLowerCase();
}

function escapeRegExp(s) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Short keys (e.g. "rav") need word boundaries so they don't match inside other words. */
function keyMatches(hay, key) {
	const k = norm(key).trim();
	if (!k) return false;
	if (k.length <= 4) {
		try {
			return new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(k)}([^\\p{L}\\p{N}]|$)`, 'u').test(hay);
		} catch (_) {
			return hay.includes(k);
		}
	}
	return hay.includes(k);
}

function sageHaystack(post) {
	return norm([post.title, post.name, post.description, (post.hashtags || []).join(' ')].join(' '));
}

async function loadSages() {
	const res = await fetch('/feed/data/sages.json', { credentials: 'same-origin' });
	if (!res.ok) throw new Error('no sages data');
	return res.json();
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

function eraName(id) {
	return (ERAS.find(e => e.id === id) || { name: id }).name;
}

function nodeSvg(sage, x, y, isRoot) {
	const name = sage.name.length > 24 ? sage.name.slice(0, 23) + '…' : sage.name;
	return `<g class="xtree-node${isRoot ? ' is-root' : ''}" data-sage="${sage.id}"
			tabindex="0" role="button" aria-label="${escapeHtml(sage.name)} — center tree here"
			transform="translate(${x},${y})">
		<rect class="xtree-box" x="${-NODE_W / 2}" y="${-NODE_H / 2}" width="${NODE_W}" height="${NODE_H}"/>
		<text class="xtree-name" y="-8">${escapeHtml(name)}</text>
		<text class="xtree-he" y="12" lang="he">${escapeHtml(sage.nameHe || '')}</text>
		<text class="xtree-era" y="28">${escapeHtml(eraName(sage.era))}</text>
	</g>`;
}

function linkSvg(x1, y1, x2, y2, kind) {
	const midY = (y1 + y2) / 2;
	return `<path class="xtree-link ${kind === 'family' ? 'is-family' : 'is-teacher'}"
		d="M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}"/>`;
}

/**
 * Mounts the family tree view.
 * @param {HTMLElement} el
 * @param {object} [ctx] { sageId }
 */
export async function mount(el, ctx = {}) {
	el.innerHTML = '';
	const wrap = document.createElement('div');
	wrap.className = 'xtree';
	el.append(wrap);

	let data;
	try {
		data = await loadSages();
	} catch (_) {
		wrap.innerHTML = `<div class="explore-soon"><h3>Sage data not available</h3>
			<p>The family-tree data file could not be loaded. Please try again later.</p></div>`;
		return;
	}
	const sages = data.sages || [];
	const byId = new Map(sages.map(s => [s.id, s]));
	const posts = await fetchPosts();

	let currentId = (ctx.sageId && byId.has(ctx.sageId)) ? ctx.sageId : 'hillel';
	if (!byId.has(currentId) && sages.length) currentId = sages[0].id;

	wrap.innerHTML = `
		<p class="xtree-note">A starting set of major figures — honestly incomplete, and meant to grow.
		Dates are approximate scholarly convention unless marked otherwise.</p>
		<div class="xcmp-toolbar">
			<div class="xcmp-postpick">
				<label for="xtree-pick">Sage</label>
				<select id="xtree-pick" aria-label="Choose a sage">
					${ERAS.map(e => {
						const inEra = sages.filter(s => s.era === e.id);
						if (!inEra.length) return '';
						return `<optgroup label="${escapeHtml(e.name)}">${inEra.map(s =>
							`<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('')}</optgroup>`;
					}).join('')}
				</select>
			</div>
			<div class="xtree-legend" aria-label="Legend">
				<span class="xtree-legend-item"><span class="xtree-swatch is-family"></span>family</span>
				<span class="xtree-legend-item"><span class="xtree-swatch is-teacher"></span>teacher / student</span>
			</div>
		</div>
		<div class="xtree-layout">
			<div class="xtree-holder"></div>
			<aside class="xtree-side" aria-live="polite"></aside>
		</div>`;

	const pick = wrap.querySelector('#xtree-pick');
	const holder = wrap.querySelector('.xtree-holder');
	const side = wrap.querySelector('.xtree-side');
	pick.value = currentId;

	function relatives(sage) {
		const fam = (ids) => (ids || []).map(id => byId.get(id)).filter(Boolean);
		const parents = fam(sage.childOf);
		const children = fam(sage.parentOf);
		const teachers = fam(sage.studentOf).filter(t => !parents.some(p => p.id === t.id));
		const students = fam(sage.teacherOf).filter(t => !children.some(c => c.id === t.id));
		return {
			above: [
				...parents.map(s => ({ sage: s, kind: 'family' })),
				...teachers.map(s => ({ sage: s, kind: 'teacher' }))
			],
			below: [
				...children.map(s => ({ sage: s, kind: 'family' })),
				...students.map(s => ({ sage: s, kind: 'teacher' }))
			]
		};
	}

	function render() {
		const sage = byId.get(currentId);
		if (!sage) return;
		pick.value = currentId;
		const { above, below } = relatives(sage);
		const maxRow = Math.max(above.length, below.length, 1);
		const width = Math.max(560, maxRow * (NODE_W + 24) + 40);
		const cx = width / 2;
		const rootY = NODE_H + ROW_GAP;
		const topY = 30;
		const botY = rootY + ROW_GAP + NODE_H / 2 + 30;

		const spread = (list, y) => list.map((r, i) => {
			const x = list.length === 1 ? cx : (40 + NODE_W / 2) + i * ((width - 80 - NODE_W) / Math.max(1, list.length - 1));
			return { ...r, x, y };
		});
		const abovePos = spread(above, topY + NODE_H / 2);
		const belowPos = spread(below, botY);
		const height = botY + NODE_H / 2 + 24;

		const links = [
			...abovePos.map(r => linkSvg(r.x, r.y + NODE_H / 2, cx, rootY - NODE_H / 2, r.kind)),
			...belowPos.map(r => linkSvg(cx, rootY + NODE_H / 2, r.x, r.y - NODE_H / 2, r.kind))
		].join('');
		const nodes = [
			...abovePos.map(r => nodeSvg(r.sage, r.x, r.y, false)),
			...belowPos.map(r => nodeSvg(r.sage, r.x, r.y, false)),
			nodeSvg(sage, cx, rootY, true)
		].join('');

		holder.innerHTML = `<svg class="xtree-svg" viewBox="0 0 ${width} ${height}" role="img"
			aria-label="Family tree of ${escapeHtml(sage.name)}">${links}${nodes}</svg>`;

		// Side panel: details + posts.
		const hay = posts.map(p => ({ post: p, hay: sageHaystack(p) }));
		const matches = hay.filter(({ hay: h }) => (sage.keys || []).some(k => keyMatches(h, k)))
			.map(({ post }) => post);
		const cert = sage.dateCertainty === 'dated' ? 'dated' : 'approximate';
		side.innerHTML = `
			<h3>${escapeHtml(sage.name)}</h3>
			<p class="xtree-he-line" lang="he">${escapeHtml(sage.nameHe || '')}</p>
			<p class="xtree-facts">
				<span>${escapeHtml(eraName(sage.era))}</span> ·
				<span>${escapeHtml(sage.dates || 'dates unknown')}</span>
				<span class="tln-cert ${cert === 'dated' ? 'is-dated' : 'is-approx'}">${cert}</span>
			</p>
			${sage.role ? `<p class="xtree-role">${escapeHtml(sage.role)}</p>` : ''}
			${sage.note ? `<p class="xtree-note2">${escapeHtml(sage.note)}</p>` : ''}
			<h4>Posts mentioning ${escapeHtml(sage.name.split(' ').slice(-2).join(' '))}</h4>
			${matches.length ? `<ul class="tln-posts">${matches.slice(0, 12).map(p => `
				<li><a class="tln-post" href="${postHref(p)}" target="_blank" rel="noopener">
					<span class="tln-post-title">${escapeHtml(String(p.title || p.name || 'Untitled post').slice(0, 120))}</span>
				</a></li>`).join('')}</ul>`
			: `<p class="tln-empty">No river posts mention this sage yet.</p>`}`;
	}

	holder.addEventListener('click', (e) => {
		const g = e.target.closest('.xtree-node');
		if (g && g.dataset.sage !== currentId) { currentId = g.dataset.sage; render(); }
	});
	holder.addEventListener('keydown', (e) => {
		const g = e.target.closest('.xtree-node');
		if (g && (e.key === 'Enter' || e.key === ' ') && g.dataset.sage !== currentId) {
			e.preventDefault(); currentId = g.dataset.sage; render();
		}
	});
	pick.addEventListener('change', () => { currentId = pick.value; render(); });

	render();
}
