// B"H
/**
 * @module XrefGraph
 * @description
 * B"H — Yaakov 2026-10-13, TRACK G (visual exploration): cross-reference
 * graph. A lightweight canvas graph of how river posts reference each
 * other, built from the existing related-posts scoring
 * (../relatedPosts.js — same series / same source / same heichel+topics /
 * keyword similarity). No graph libraries — one <canvas>, a small
 * force-directed layout, pan and node dragging.
 *
 * Interactions:
 *   - Drag a node to move it; drag the background to pan.
 *   - Click a node (without dragging) to open the post in a new tab.
 *   - Double-click a node to re-center the graph on it.
 *   - The neighbor list beside the canvas shows why each link exists.
 *
 * Public API: mount(el, ctx).
 */

import { escapeHtml } from '../icons.js';
import { findRelatedPosts, fetchRelatedCandidates } from '../relatedPosts.js';

const NODE_LIMIT = 16;
const ITERATIONS = 220;

function postKey(post) {
	return String(post.id || post.postId || '');
}

function postTitle(post) {
	return String(post.title || post.name || 'Untitled post');
}

function postHref(post) {
	const id = post.id || post.postId;
	return id ? `/social/post/${encodeURIComponent(id)}` : '/social/';
}

function themeColors() {
	const cs = getComputedStyle(document.documentElement);
	const get = (name, fallback) => (cs.getPropertyValue(name) || '').trim() || fallback;
	return {
		text: get('--aw-text', '#f2f4f8'),
		soft: get('--aw-text-soft', '#a7b0bf'),
		line: get('--aw-line', '#232833'),
		gold: get('--accent-gold', '#d4a94e'),
		accent: get('--aw-accent', '#5b9dff'),
		bg: get('--aw-bg', '#0b0d12')
	};
}

/** Tiny force-directed layout: repulsion between all pairs, springs on edges. */
function layout(nodes, edges, width, height) {
	const cx = width / 2, cy = height / 2;
	nodes.forEach((n, i) => {
		if (n.pinned) return;
		const a = (i / Math.max(1, nodes.length)) * Math.PI * 2;
		const r = Math.min(width, height) * 0.32;
		n.x = n.x ?? cx + Math.cos(a) * r * (i === 0 ? 0 : 1);
		n.y = n.y ?? cy + Math.sin(a) * r * (i === 0 ? 0 : 1);
		n.vx = 0; n.vy = 0;
	});
	nodes[0].x = cx; nodes[0].y = cy; nodes[0].pinned = true;
	for (let it = 0; it < ITERATIONS; it++) {
		// Repulsion.
		for (let i = 0; i < nodes.length; i++) {
			for (let j = i + 1; j < nodes.length; j++) {
				const a = nodes[i], b = nodes[j];
				let dx = b.x - a.x, dy = b.y - a.y;
				let d2 = dx * dx + dy * dy;
				if (d2 < 1) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d2 = 1; }
				const d = Math.sqrt(d2);
				const f = Math.min(9000 / d2, 6);
				const fx = (dx / d) * f, fy = (dy / d) * f;
				if (!a.pinned) { a.vx -= fx; a.vy -= fy; }
				if (!b.pinned) { b.vx += fx; b.vy += fy; }
			}
		}
		// Springs.
		for (const e of edges) {
			const a = nodes[e.from], b = nodes[e.to];
			const dx = b.x - a.x, dy = b.y - a.y;
			const d = Math.max(1, Math.hypot(dx, dy));
			const want = 150;
			const f = (d - want) * 0.02 * e.strength;
			const fx = (dx / d) * f, fy = (dy / d) * f;
			if (!a.pinned) { a.vx += fx; a.vy += fy; }
			if (!b.pinned) { b.vx -= fx; b.vy -= fy; }
		}
		// Integrate with damping.
		for (const n of nodes) {
			if (n.pinned) continue;
			n.vx *= 0.82; n.vy *= 0.82;
			n.x = Math.max(40, Math.min(width - 40, n.x + n.vx));
			n.y = Math.max(30, Math.min(height - 30, n.y + n.vy));
		}
	}
}

/**
 * Mounts the cross-reference graph.
 * @param {HTMLElement} el
 * @param {object} [ctx] { post, postId }
 */
export async function mount(el, ctx = {}) {
	el.innerHTML = '';
	const wrap = document.createElement('div');
	wrap.className = 'xgraph';
	el.append(wrap);

	wrap.innerHTML = `
		<p class="xgraph-intro">How the river's posts connect. Drag nodes to arrange, drag the
		background to pan. Click a node to open its post; double-click to re-center on it.</p>
		<div class="xcmp-toolbar">
			<div class="xcmp-postpick">
				<label for="xgraph-post">Center post</label>
				<select id="xgraph-post" aria-label="Choose the center post"></select>
			</div>
		</div>
		<div class="xgraph-layout">
			<div class="xgraph-holder"><canvas class="xgraph-canvas" aria-label="Cross-reference graph"></canvas></div>
			<aside class="xgraph-side" aria-live="polite"></aside>
		</div>`;

	const select = wrap.querySelector('#xgraph-post');
	const canvas = wrap.querySelector('.xgraph-canvas');
	const holder = wrap.querySelector('.xgraph-holder');
	const side = wrap.querySelector('.xgraph-side');

	select.innerHTML = `<option>Loading the river…</option>`;
	let candidates = [];
	try {
		candidates = await fetchRelatedCandidates({}, { discoverLimit: 150 });
	} catch (_) {
		candidates = [];
	}
	if (!candidates.length) {
		wrap.querySelector('.xgraph-layout').innerHTML =
			`<div class="explore-soon"><h3>The river is quiet</h3>
			<p>No posts could be loaded right now — try again in a moment.</p></div>`;
		return;
	}
	select.innerHTML = candidates.map(p =>
		`<option value="${escapeHtml(postKey(p))}">${escapeHtml(postTitle(p).slice(0, 90))}</option>`).join('');

	let center = null;
	if (ctx.post) center = ctx.post;
	else if (ctx.postId) center = candidates.find(p => postKey(p) === String(ctx.postId)) || null;
	if (!center || !postKey(center)) center = candidates[0];
	select.value = postKey(center);

	let nodes = [], edges = [];
	let panX = 0, panY = 0;
	let dragNode = null, panning = false, lastX = 0, lastY = 0, moved = 0;
	let raf = 0;

	function buildGraph() {
		const related = findRelatedPosts(center, candidates, { limit: NODE_LIMIT });
		nodes = [{ post: center, center: true, x: 0, y: 0 }];
		edges = [];
		related.forEach(({ post, score, reasons }, i) => {
			nodes.push({ post, score, reasons, x: 0, y: 0 });
			edges.push({ from: 0, to: i + 1, strength: Math.min(1.6, 0.5 + score / 60), score, reasons });
		});
		panX = 0; panY = 0;
		const w = holder.clientWidth || 640, h = 480;
		layout(nodes, edges, w, h);
		renderSide(related);
		draw();
	}

	function renderSide(related) {
		side.innerHTML = `
			<h3>${escapeHtml(postTitle(center).slice(0, 80))}</h3>
			<p class="xgraph-sub">${related.length} linked post${related.length === 1 ? '' : 's'}</p>
			${related.length ? `<ul class="xgraph-links">${related.map(({ post, score, reasons }) => `
				<li>
					<a href="${postHref(post)}" target="_blank" rel="noopener">${escapeHtml(postTitle(post).slice(0, 80))}</a>
					<span class="xgraph-reason">${escapeHtml((reasons || []).join(' · ') || 'related')}</span>
				</li>`).join('')}</ul>`
			: `<p class="tln-empty">No related posts scored above the relevance floor for this post.</p>`}`;
	}

	function fitCanvas() {
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		const w = holder.clientWidth || 640, h = 480;
		canvas.width = Math.round(w * dpr);
		canvas.height = Math.round(h * dpr);
		canvas.style.width = w + 'px';
		canvas.style.height = h + 'px';
		return { w, h, dpr };
	}

	function draw() {
		const { w, h, dpr } = fitCanvas();
		const c = themeColors();
		const g = canvas.getContext('2d');
		g.setTransform(dpr, 0, 0, dpr, 0, 0);
		g.clearRect(0, 0, w, h);
		g.fillStyle = c.bg;
		g.fillRect(0, 0, w, h);

		// Edges.
		for (const e of edges) {
			const a = nodes[e.from], b = nodes[e.to];
			g.strokeStyle = c.line;
			g.lineWidth = 1 + Math.min(3, e.score / 40);
			g.beginPath();
			g.moveTo(a.x + panX, a.y + panY);
			g.lineTo(b.x + panX, b.y + panY);
			g.stroke();
		}
		// Nodes.
		nodes.forEach((n, i) => {
			const x = n.x + panX, y = n.y + panY;
			const r = n.center ? 16 : 9 + Math.min(7, (n.score || 0) / 25);
			g.beginPath();
			g.arc(x, y, r, 0, Math.PI * 2);
			g.fillStyle = n.center ? c.gold : c.accent;
			g.fill();
			g.lineWidth = 2;
			g.strokeStyle = c.bg;
			g.stroke();
			// Label.
			const label = postTitle(n.post);
			const short = label.length > 26 ? label.slice(0, 25) + '…' : label;
			g.font = `${n.center ? '700' : '400'} 12px system-ui, sans-serif`;
			g.fillStyle = c.text;
			g.textAlign = 'center';
			g.fillText(short, x, y + r + 16);
			n._r = r; n._sx = x; n._sy = y;
		});
		cancelAnimationFrame(raf);
	}

	function nodeAt(x, y) {
		const rect = canvas.getBoundingClientRect();
		const px = x - rect.left, py = y - rect.top;
		for (let i = nodes.length - 1; i >= 0; i--) {
			const n = nodes[i];
			if (Math.hypot(px - n._sx, py - n._sy) <= (n._r || 10) + 6) return n;
		}
		return null;
	}

	canvas.addEventListener('pointerdown', (e) => {
		canvas.setPointerCapture(e.pointerId);
		lastX = e.clientX; lastY = e.clientY; moved = 0;
		dragNode = nodeAt(e.clientX, e.clientY);
		if (!dragNode) panning = true;
	});
	canvas.addEventListener('pointermove', (e) => {
		if (!dragNode && !panning) return;
		const dx = e.clientX - lastX, dy = e.clientY - lastY;
		lastX = e.clientX; lastY = e.clientY;
		moved += Math.abs(dx) + Math.abs(dy);
		if (dragNode) {
			if (!dragNode.center) { dragNode.x += dx; dragNode.y += dy; }
			else { panX += dx; panY += dy; }
		} else if (panning) {
			panX += dx; panY += dy;
		}
		cancelAnimationFrame(raf);
		raf = requestAnimationFrame(draw);
	});
	canvas.addEventListener('pointerup', (e) => {
		const wasClick = moved < 6;
		const n = dragNode;
		dragNode = null; panning = false;
		if (wasClick && n && !n.center) {
			window.open(postHref(n.post), '_blank', 'noopener');
		}
	});
	canvas.addEventListener('dblclick', (e) => {
		const n = nodeAt(e.clientX, e.clientY);
		if (n && !n.center) {
			center = n.post;
			select.value = postKey(center);
			buildGraph();
		}
	});
	window.addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); });

	select.addEventListener('change', () => {
		const found = candidates.find(p => postKey(p) === select.value);
		if (found) { center = found; buildGraph(); }
	});

	buildGraph();
}
