// B"H
/**
 * @module MapView
 * @description
 * B"H — Yaakov 2026-10-13, TRACK G (visual exploration): map view. Places
 * mentioned in the texts plotted on a lightweight client-side SVG schematic
 * of the Land of Israel and Babylonia. No Google Maps, no tile libraries —
 * one inline SVG, theme-aware via CSS variables, explicitly labeled
 * "schematic, not to scale".
 *
 * Click a place to see river posts that mention it (matched by name and
 * common alternate spellings in the post title, description, and hashtags).
 * When nothing mentions the place, the panel says so honestly.
 *
 * Public API: mount(el, ctx).
 */

import { escapeHtml } from '../icons.js';

/**
 * Schematic coordinates in a 0..400 x 0..560 viewBox. These are stylized —
 * relative positions only, not geographic precision.
 */
const PLACES = [
	{ id: 'safed', name: 'Safed', he: 'צפת', x: 118, y: 88, region: 'Galilee', keys: ['safed', 'tzfat', 'tsefat', 'צפת'] },
	{ id: 'meron', name: 'Meron', he: 'מירון', x: 100, y: 104, region: 'Galilee', keys: ['meron', 'meiron', 'מירון', 'rashbi'] },
	{ id: 'tiberias', name: 'Tiberias', he: 'טבריה', x: 152, y: 122, region: 'Galilee', keys: ['tiberias', 'tverya', 'טבריה'] },
	{ id: 'sepphoris', name: 'Sepphoris', he: 'ציפורי', x: 112, y: 142, region: 'Galilee', keys: ['sepphoris', 'tzippori', 'zippori', 'ציפורי'] },
	{ id: 'usha', name: 'Usha', he: 'אושא', x: 92, y: 158, region: 'Galilee', keys: ['usha', 'אושא'] },
	{ id: 'caesarea', name: 'Caesarea', he: 'קיסריה', x: 78, y: 202, region: 'Coast', keys: ['caesarea', 'keisaria', 'קיסריה'] },
	{ id: 'lod', name: 'Lod', he: 'לוד', x: 104, y: 252, region: 'Judea', keys: ['lod', 'lydda', 'לוד'] },
	{ id: 'yavneh', name: 'Yavneh', he: 'יבנה', x: 88, y: 276, region: 'Judea', keys: ['yavneh', 'yavne', 'jabneh', 'יבנה'] },
	{ id: 'jerusalem', name: 'Jerusalem', he: 'ירושלים', x: 132, y: 292, region: 'Judea', keys: ['jerusalem', 'yerushalayim', 'ירושלים'] },
	{ id: 'hebron', name: 'Hebron', he: 'חברון', x: 126, y: 322, region: 'Judea', keys: ['hebron', 'chevron', 'חברון'] },
	{ id: 'nehardea', name: 'Nehardea', he: 'נהרדעא', x: 252, y: 182, region: 'Babylonia', keys: ['nehardea', 'נהרדעא'] },
	{ id: 'pumbedita', name: 'Pumbedita', he: 'פומבדיתא', x: 272, y: 222, region: 'Babylonia', keys: ['pumbedita', 'פומבדיתא'] },
	{ id: 'sura', name: 'Sura', he: 'סורא', x: 302, y: 262, region: 'Babylonia', keys: ['sura', 'סורא'] },
	{ id: 'mahuza', name: 'Mahuza', he: 'מחוזא', x: 332, y: 242, region: 'Babylonia', keys: ['mahuza', 'מחוזא', 'ctesiphon'] },
	{ id: 'alexandria', name: 'Alexandria', he: 'אלכסנדריה', x: 58, y: 428, region: 'Egypt', keys: ['alexandria', 'אלכסנדריה'] }
];

function norm(s) {
	return String(s || '').toLowerCase();
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

function postHaystack(post) {
	return norm([post.title, post.name, post.description, (post.hashtags || []).join(' ')].join(' '));
}

function postsForPlace(place, posts) {
	return posts.filter(p => {
		const hay = postHaystack(p);
		return place.keys.some(k => k && hay.includes(norm(k)));
	});
}

function postHref(post) {
	const id = post.id || post.postId;
	return id ? `/social/post/${encodeURIComponent(id)}` : '/social/';
}

function mapSvg(selectedId) {
	const dots = PLACES.map(p => {
		const sel = p.id === selectedId;
		return `<g class="xmap-place${sel ? ' is-selected' : ''}" data-place="${p.id}" tabindex="0" role="button"
				aria-label="${escapeHtml(p.name)} — show related posts" transform="translate(${p.x},${p.y})">
			<circle class="xmap-dot" r="${sel ? 8 : 6}" cx="0" cy="0"/>
			<text class="xmap-label" x="12" y="4">${escapeHtml(p.name)}</text>
		</g>`;
	}).join('');
	return `<svg class="xmap-svg" viewBox="0 0 400 560" role="img"
			aria-label="Schematic map of the Land of Israel and Babylonia (not to scale)">
		<rect class="xmap-bg" x="0" y="0" width="400" height="560"/>
		<!-- Mediterranean Sea (schematic) -->
		<path class="xmap-sea" d="M0,0 L52,0 C44,60 58,110 50,170 C44,230 56,300 44,380 C36,440 48,500 40,560 L0,560 Z"/>
		<!-- Coastline -->
		<path class="xmap-coast" d="M52,0 C44,60 58,110 50,170 C44,230 56,300 44,380 C36,440 48,500 40,560"/>
		<!-- Sea of Galilee (schematic) -->
		<ellipse class="xmap-water" cx="152" cy="122" rx="10" ry="14"/>
		<!-- Jordan river (schematic) -->
		<path class="xmap-river" d="M152,138 C150,170 148,200 146,232"/>
		<!-- Dead Sea (schematic) -->
		<ellipse class="xmap-water" cx="146" cy="268" rx="9" ry="34"/>
		<!-- Euphrates (schematic) -->
		<path class="xmap-river" d="M236,120 C260,150 250,190 268,220 C286,250 310,270 340,300 C360,322 372,360 380,420"/>
		<!-- Region labels -->
		<text class="xmap-region" x="200" y="40">Land of Israel</text>
		<text class="xmap-region" x="300" y="140">Babylonia</text>
		<text class="xmap-region" x="70" y="470">Egypt</text>
		${dots}
		<text class="xmap-note" x="200" y="545">Schematic — relative positions only, not to scale</text>
	</svg>`;
}

/**
 * Mounts the map view.
 * @param {HTMLElement} el
 * @param {object} [ctx]
 */
export async function mount(el, ctx = {}) {
	el.innerHTML = '';
	const wrap = document.createElement('div');
	wrap.className = 'xmap';
	el.append(wrap);

	wrap.innerHTML = `
		<p class="xmap-intro">Where the texts happened. Tap a place to see river posts that mention it.</p>
		<div class="xmap-layout">
			<div class="xmap-holder">${mapSvg(null)}</div>
			<div class="xmap-detail" aria-live="polite">
				<div class="explore-soon"><h3>Pick a place</h3>
				<p>Tap any marked place on the map to see the posts that mention it.</p></div>
			</div>
		</div>`;

	const holder = wrap.querySelector('.xmap-holder');
	const detail = wrap.querySelector('.xmap-detail');
	holder.innerHTML = `<p class="tln-loading">Loading the river…</p>` + mapSvg(null);
	const posts = await fetchPosts();
	holder.innerHTML = mapSvg(null);

	function showPlace(placeId) {
		const place = PLACES.find(p => p.id === placeId);
		if (!place) return;
		holder.innerHTML = mapSvg(placeId);
		const matches = postsForPlace(place, posts);
		detail.innerHTML = `
			<h3>${escapeHtml(place.name)} <span class="xmap-he" lang="he">${escapeHtml(place.he)}</span></h3>
			<p class="xmap-regionline">${escapeHtml(place.region)}</p>
			${matches.length ? `
				<p class="xmap-count">${matches.length} post${matches.length === 1 ? '' : 's'} mention${matches.length === 1 ? 's' : ''} ${escapeHtml(place.name)}.</p>
				<ul class="tln-posts">
					${matches.slice(0, 20).map(p => `
						<li><a class="tln-post" href="${postHref(p)}" target="_blank" rel="noopener">
							<span class="tln-post-title">${escapeHtml(String(p.title || p.name || 'Untitled post').slice(0, 120))}</span>
						</a></li>`).join('')}
				</ul>
				${matches.length > 20 ? `<p class="tln-more">Showing 20 of ${matches.length}.</p>` : ''}`
			: `<p class="tln-empty">No river posts mention ${escapeHtml(place.name)} yet.</p>`}`;
	}

	holder.addEventListener('click', (e) => {
		const g = e.target.closest('.xmap-place');
		if (g) showPlace(g.dataset.place);
	});
	holder.addEventListener('keydown', (e) => {
		const g = e.target.closest('.xmap-place');
		if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); showPlace(g.dataset.place); }
	});
}
