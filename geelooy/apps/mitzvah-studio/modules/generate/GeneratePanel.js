// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GeneratePanel.js
 * @description Mounts the self-contained Generate section: prompt input, quick categories,
 * style and seed controls, dimetric canvas previews, and per-build Add to Scene actions.
 * Binah shapes the request, Chochmah draws what was imagined, and Malchus places each
 * build assembled through StudioDocumentState.addGroup so history, selection, and
 * handoff all follow.
 * The Awtsmoos renews the world the author describes; Awtsmoos.com only lends the pencil.
 */

import {
	GENERATE_CATEGORIES,
	generateCategoryLabel,
	interpretGeneratePrompt
} from './PromptInterpreter.js';
import { generateFromSpec } from './GeometryGenerators.js';
import {
	escapeStudioAttribute,
	escapeStudioHtml
} from '../view/StudioMarkupEscaping.js';
import {
	studioShelfMetricsLabel,
	studioShelfSizeLabel
} from '../view/StudioShelfFormatting.js';

const COS30 = Math.cos(Math.PI / 6);
const SIN30 = 0.5;
const PREVIEW_WIDTH = 440;
const PREVIEW_HEIGHT = 300;

const CATEGORY_SAMPLES = Object.freeze({
	buildings: 'a house',
	nature: 'an oak tree',
	furniture: 'a menorah',
	terrain: 'a pond'
});

/**
 * Announces a message through the host announcer when one is provided.
 * Accepts a bare function or an object with announce/say/notify; never throws.
 * @param {object} context Panel context.
 * @param {string} message Message to announce.
 */
function announce(context, message) {
	const announcer = context?.announcer;
	try {
		if (typeof announcer === 'function') {
			announcer(message);
			return;
		}
		if (announcer && typeof announcer.announce === 'function') {
			announcer.announce(message);
			return;
		}
		if (announcer && typeof announcer.say === 'function') {
			announcer.say(message);
			return;
		}
		if (announcer && typeof announcer.notify === 'function') {
			announcer.notify(message);
		}
	} catch {
		// Announcing is a courtesy; the visible status line always carries the message.
	}
}

/**
 * @param {string} hex Color like "#a97e4f".
 * @param {number} factor Brightness multiplier.
 * @returns {string} Shaded rgb() color.
 */
function shadeColor(hex, factor) {
	const parsed = parseInt(String(hex || '#888888').slice(1), 16);
	const channel = shift => Math.min(255, Math.max(0, Math.round(((parsed >> shift) & 255) * factor)));
	return `rgb(${channel(16)},${channel(8)},${channel(0)})`;
}

/**
 * @param {{x:number,y:number,z:number}} p World point.
 * @returns {{x:number,y:number}} Dimetric screen point, y up.
 */
function projectPoint(p) {
	return {
		x: (p.x - p.z) * COS30,
		y: (p.x + p.z) * SIN30 - p.y
	};
}

/**
 * Rotates a point by Euler angles (intrinsic X, then Y, then Z), radians.
 * @param {{x:number,y:number,z:number}} p Point.
 * @param {{x:number,y:number,z:number}} r Rotation.
 * @returns {{x:number,y:number,z:number}} Rotated point.
 */
function rotatePoint(p, r) {
	let { x, y, z } = p;
	if (r.x) {
		const c = Math.cos(r.x);
		const s = Math.sin(r.x);
		const y2 = y * c - z * s;
		const z2 = y * s + z * c;
		y = y2;
		z = z2;
	}
	if (r.y) {
		const c = Math.cos(r.y);
		const s = Math.sin(r.y);
		const x2 = x * c + z * s;
		const z2 = -x * s + z * c;
		x = x2;
		z = z2;
	}
	if (r.z) {
		const c = Math.cos(r.z);
		const s = Math.sin(r.z);
		const x2 = x * c - y * s;
		const y2 = x * s + y * c;
		x = x2;
		y = y2;
	}
	return { x, y, z };
}

/**
 * @param {object} pc Composite piece.
 * @returns {Array<{x:number,y:number,z:number}>} World-space corners of its bounding volume.
 */
function pieceCorners(pc) {
	if (pc.shape === 'box') {
		const hx = pc.size.x / 2;
		const hy = pc.size.y / 2;
		const hz = pc.size.z / 2;
		const signs = [
			[1, 1, 1], [-1, 1, 1], [-1, 1, -1], [1, 1, -1],
			[1, -1, 1], [-1, -1, 1], [-1, -1, -1], [1, -1, -1]
		];
		return signs.map(([sx, sy, sz]) => {
			const rotated = rotatePoint({ x: sx * hx, y: sy * hy, z: sz * hz }, pc.rotation);
			return {
				x: rotated.x + pc.offset.x,
				y: rotated.y + pc.offset.y,
				z: rotated.z + pc.offset.z
			};
		});
	}
	const rx = pc.size.x / 2;
	const ry = pc.size.y / 2;
	const rz = pc.size.z / 2;
	const corners = [];
	for (const sx of [-1, 1]) {
		for (const sy of [-1, 1]) {
			for (const sz of [-1, 1]) {
				corners.push({
					x: pc.offset.x + sx * rx,
					y: pc.offset.y + sy * ry,
					z: pc.offset.z + sz * rz
				});
			}
		}
	}
	return corners;
}

/**
 * Draws one composite piece on the preview canvas.
 * @param {CanvasRenderingContext2D} ctx Canvas context in fitted screen space.
 * @param {object} pc Composite piece.
 * @param {{x:number,y:number}} toScreen Projects world points to canvas pixels.
 */
function drawPiece(ctx, pc, toScreen) {
	if (pc.shape === 'cylinder') {
		drawCylinder(ctx, pc, toScreen);
		return;
	}
	if (pc.shape === 'sphere') {
		drawSphere(ctx, pc, toScreen);
		return;
	}
	drawBox(ctx, pc, toScreen);
}

function drawPolygon(ctx, points, fill) {
	ctx.beginPath();
	ctx.moveTo(points[0].x, points[0].y);
	for (let i = 1; i < points.length; i += 1) {
		ctx.lineTo(points[i].x, points[i].y);
	}
	ctx.closePath();
	ctx.fillStyle = fill;
	ctx.fill();
}

/**
 * @param {object} pc Box piece.
 */
function drawBox(ctx, pc, toScreen) {
	const corners = pieceCorners(pc).map(toScreen);
	const top = [corners[0], corners[1], corners[2], corners[3]];
	const zFront = [corners[0], corners[1], corners[5], corners[4]];
	const xFront = [corners[0], corners[3], corners[7], corners[4]];
	drawPolygon(ctx, xFront, shadeColor(pc.color, 0.74));
	drawPolygon(ctx, zFront, shadeColor(pc.color, 0.88));
	drawPolygon(ctx, top, shadeColor(pc.color, 1.06));
}

/**
 * @param {object} pc Cylinder piece with a vertical axis.
 */
function drawCylinder(ctx, pc, toScreen) {
	const r = pc.size.x / 2;
	const half = pc.size.y / 2;
	const top = { x: pc.offset.x, y: pc.offset.y + half, z: pc.offset.z };
	const bottom = { x: pc.offset.x, y: pc.offset.y - half, z: pc.offset.z };
	const center = toScreen({ x: pc.offset.x, y: pc.offset.y, z: pc.offset.z });
	const edge = toScreen({ x: pc.offset.x + r, y: pc.offset.y, z: pc.offset.z });
	const rx = Math.max(1.5, Math.hypot(edge.x - center.x, edge.y - center.y));
	const ry = rx * 0.42;
	const pt = toScreen(top);
	const pb = toScreen(bottom);
	const axis = { x: pt.x - pb.x, y: pt.y - pb.y };
	const len = Math.hypot(axis.x, axis.y) || 1;
	const nx = (-axis.y / len) * rx;
	const ny = (axis.x / len) * rx;
	drawPolygon(ctx, [
		{ x: pt.x + nx, y: pt.y + ny },
		{ x: pt.x - nx, y: pt.y - ny },
		{ x: pb.x - nx, y: pb.y - ny },
		{ x: pb.x + nx, y: pb.y + ny }
	], shadeColor(pc.color, 0.86));
	ctx.beginPath();
	ctx.ellipse(pb.x, pb.y, rx, ry, 0, 0, Math.PI);
	ctx.strokeStyle = shadeColor(pc.color, 0.7);
	ctx.lineWidth = 1;
	ctx.stroke();
	ctx.beginPath();
	ctx.ellipse(pt.x, pt.y, rx, ry, 0, 0, Math.PI * 2);
	ctx.fillStyle = shadeColor(pc.color, 1.05);
	ctx.fill();
}

/**
 * @param {object} pc Sphere piece.
 */
function drawSphere(ctx, pc, toScreen) {
	const r = Math.max(pc.size.x, pc.size.z) / 2;
	const center = toScreen({ x: pc.offset.x, y: pc.offset.y, z: pc.offset.z });
	const edge = toScreen({ x: pc.offset.x + r, y: pc.offset.y, z: pc.offset.z });
	const rx = Math.max(1.5, Math.hypot(edge.x - center.x, edge.y - center.y));
	const ry = rx * 0.82;
	ctx.beginPath();
	ctx.ellipse(center.x, center.y, rx, ry, 0, 0, Math.PI * 2);
	ctx.fillStyle = shadeColor(pc.color, 0.95);
	ctx.fill();
	ctx.beginPath();
	ctx.ellipse(center.x - rx * 0.18, center.y - ry * 0.22, rx * 0.62, ry * 0.6, 0, 0, Math.PI * 2);
	ctx.fillStyle = shadeColor(pc.color, 1.1);
	ctx.fill();
}

/**
 * Renders the assembled composite preview for one build.
 * @param {HTMLCanvasElement} canvas Preview canvas.
 * @param {object} build Generated build with pieces.
 */
function renderBuildPreview(canvas, build) {
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		return;
	}
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	const projected = [];
	for (const pc of build.pieces) {
		for (const corner of pieceCorners(pc)) {
			projected.push(projectPoint(corner));
		}
	}
	if (!projected.length) {
		return;
	}
	let minX = Infinity;
	let maxX = -Infinity;
	let minY = Infinity;
	let maxY = -Infinity;
	for (const p of projected) {
		minX = Math.min(minX, p.x);
		maxX = Math.max(maxX, p.x);
		minY = Math.min(minY, p.y);
		maxY = Math.max(maxY, p.y);
	}
	const pad = 26;
	const scale = Math.min(
		(canvas.width - pad * 2) / Math.max(0.001, maxX - minX),
		(canvas.height - pad * 2) / Math.max(0.001, maxY - minY)
	);
	const toScreen = p => {
		const projectedPoint = projectPoint(p);
		return {
			x: canvas.width / 2 + (projectedPoint.x - (minX + maxX) / 2) * scale,
			y: canvas.height / 2 - (projectedPoint.y - (minY + maxY) / 2) * scale
		};
	};
	const ordered = [...build.pieces].sort((a, b) => (a.offset.x + a.offset.z) - (b.offset.x + b.offset.z));
	for (const pc of ordered) {
		drawPiece(ctx, pc, toScreen);
	}
}

/**
 * @param {object[]} pieces Composite pieces.
 * @returns {{x:number,y:number,z:number}} Overall bounding size.
 */
function buildBoundingSize(pieces) {
	let minX = Infinity;
	let maxX = -Infinity;
	let minZ = Infinity;
	let maxZ = -Infinity;
	let maxY = 0;
	for (const pc of pieces) {
		for (const corner of pieceCorners(pc)) {
			minX = Math.min(minX, corner.x);
			maxX = Math.max(maxX, corner.x);
			minZ = Math.min(minZ, corner.z);
			maxZ = Math.max(maxZ, corner.z);
			maxY = Math.max(maxY, corner.y);
		}
	}
	if (!Number.isFinite(minX)) {
		return { x: 0, y: 0, z: 0 };
	}
	return { x: maxX - minX, y: maxY, z: maxZ - minZ };
}

/**
 * Mounts the Generate section into a container element.
 * @param {HTMLElement} container Host element that receives the section.
 * @param {object} context Host context {state, catalog, announcer}.
 * @returns {{unmount:Function}} Handle whose unmount clears the section.
 */
export function mountGeneratePanel(container, context) {
	if (!container || typeof container.querySelector !== 'function') {
		throw new Error('Generate panel needs a container element.');
	}
	const state = context?.state || null;
	let lastBuilds = [];

	container.innerHTML = `
		<section class="studio-generate-panel" aria-label="Generate">
			<header class="panel-heading"><div><strong>Generate</strong><span>prompt-built geometry</span></div></header>
			<div class="studio-generate-controls">
				<label class="studio-generate-prompt-label">Describe what to build
					<input data-gen-prompt type="text"
						placeholder="Describe what to build, e.g. &ldquo;a shul with tall windows&rdquo;"
						aria-label="Describe what to build" autocomplete="off">
				</label>
				<div class="studio-generate-row">
					<button data-gen-go type="button">Generate</button>
					<label>Style
						<select data-gen-style aria-label="Style">
							<option value="auto">Auto</option>
							<option value="meadow">Meadow</option>
							<option value="old-city">Old city</option>
							<option value="modern">Modern</option>
						</select>
					</label>
					<label>Seed
						<input data-gen-seed type="number" min="0" step="1" placeholder="random" aria-label="Seed">
					</label>
				</div>
				<div class="studio-generate-categories" role="group" aria-label="Quick categories">
					${GENERATE_CATEGORIES.map(category => `
						<button data-gen-category="${escapeStudioAttribute(category)}" type="button">${escapeStudioHtml(generateCategoryLabel(category))}</button>
					`).join('')}
				</div>
			</div>
			<div data-gen-status class="studio-generate-status" aria-live="polite"></div>
			<div data-gen-results class="studio-generate-results"></div>
		</section>
	`;

	const promptInput = container.querySelector('[data-gen-prompt]');
	const goButton = container.querySelector('[data-gen-go]');
	const styleSelect = container.querySelector('[data-gen-style]');
	const seedInput = container.querySelector('[data-gen-seed]');
	const statusEl = container.querySelector('[data-gen-status]');
	const resultsEl = container.querySelector('[data-gen-results]');

	function setStatus(message) {
		statusEl.textContent = message;
	}

	function showEmpty() {
		setStatus('Describe what to build, e.g. \u201Ca shul with tall windows\u201D, then press Generate.');
		resultsEl.innerHTML = '';
	}

	/**
	 * @param {object} spec Interpreted spec.
	 * @returns {object} Spec with panel style/seed overrides applied.
	 */
	function applyOverrides(spec) {
		const next = { ...spec };
		if (styleSelect.value !== 'auto') {
			next.style = styleSelect.value;
		}
		const seedText = seedInput.value.trim();
		if (seedText !== '') {
			const parsed = parseInt(seedText, 10);
			if (Number.isFinite(parsed)) {
				next.seed = Math.abs(parsed);
			}
		}
		return next;
	}

	function runGeneration() {
		const text = promptInput.value;
		let spec = interpretGeneratePrompt(text);
		spec = applyOverrides(spec);
		const builds = generateFromSpec(spec);
		lastBuilds = builds;
		renderResults(spec, builds);
		const totalParts = builds.reduce((sum, build) => sum + build.objects.length, 0);
		const summary = builds.length === 1
			? `Generated ${builds[0].label}: ${totalParts} parts.`
			: `Generated ${builds.length} builds, ${totalParts} parts total.`;
		setStatus(spec.assumed ? `${spec.note} ${summary}` : summary);
		announce(context, summary);
	}

	function handleGenerate(quiet) {
		if (quiet) {
			try {
				runGeneration();
			} catch (error) {
				showError(error);
			}
			return;
		}
		goButton.disabled = true;
		setStatus('Growing your world\u2026');
		resultsEl.innerHTML = '';
		window.setTimeout(() => {
			try {
				runGeneration();
			} catch (error) {
				showError(error);
			} finally {
				goButton.disabled = false;
			}
		}, 40);
	}

	function showError(error) {
		const detail = error?.message ? `: ${error.message}` : '.';
		setStatus(`Generation failed${detail} Try a simpler description.`);
		resultsEl.innerHTML = '';
		lastBuilds = [];
		announce(context, 'Generation failed. Try a simpler description.');
	}

	function renderResults(spec, builds) {
		resultsEl.innerHTML = '';
		if (spec.assumed && spec.note) {
			const note = document.createElement('p');
			note.className = 'studio-generate-note';
			note.textContent = spec.note;
			resultsEl.append(note);
		}
		if (builds.length > 1) {
			const addAll = document.createElement('button');
			addAll.type = 'button';
			addAll.className = 'studio-generate-add-all';
			addAll.textContent = 'Add All to Scene';
			addAll.addEventListener('click', () => addBuilds(builds, 'everything'));
			resultsEl.append(addAll);
		}
		for (const build of builds) {
			resultsEl.append(buildCard(build));
		}
	}

	function buildCard(build) {
		const card = document.createElement('article');
		card.className = 'studio-generate-card';
		const pieceNames = build.pieces.map(pc => pc.name).join(', ');
		card.innerHTML = `
			<canvas data-gen-preview width="${PREVIEW_WIDTH}" height="${PREVIEW_HEIGHT}"
				role="img" aria-label="Preview of ${escapeStudioAttribute(build.label)}"></canvas>
			<div class="studio-generate-card-body">
				<strong>${escapeStudioHtml(build.label)}</strong>
				<small>${escapeStudioHtml(studioShelfSizeLabel(buildBoundingSize(build.pieces)))}</small>
				<small>${escapeStudioHtml(studioShelfMetricsLabel(build.metrics))} &middot; ${build.objects.length} ${build.objects.length === 1 ? 'part' : 'parts'}</small>
				<small class="studio-generate-parts">Parts: ${escapeStudioHtml(pieceNames)}</small>
				<button data-gen-add type="button">Add to Scene</button>
			</div>
		`;
		const canvas = card.querySelector('[data-gen-preview]');
		renderBuildPreview(canvas, build);
		card.querySelector('[data-gen-add]').addEventListener('click', () => {
			addBuilds([build], build.label);
		});
		return card;
	}

	/**
	 * Places every build through StudioDocumentState.addGroup so each build
	 * arrives assembled, exactly as its preview shows. Falls back to
	 * one-by-one state.add when the group path is unavailable.
	 */
	function addBuilds(builds, whatLabel) {
		if (!state || typeof state.add !== 'function') {
			const message = 'The scene is not available, so nothing was added.';
			setStatus(message);
			announce(context, message);
			return;
		}
		const useGroup = typeof state.addGroup === 'function';
		let added = 0;
		let total = 0;
		for (const build of builds || []) {
			const parts = build.objects || [];
			total += parts.length;
			try {
				if (useGroup) {
					added += state.addGroup(parts).length;
				} else {
					for (const object of parts) {
						state.add(object);
					added += 1;
				}
			}
			} catch {
				// Keep placing the remaining builds; report the shortfall below.
			}
		}
		const message = added === total
			? `Added ${whatLabel} to the scene: ${added} ${added === 1 ? 'part' : 'parts'}.`
			: `Added ${added} of ${total} parts to the scene.`;
		setStatus(message);
		announce(context, message);
	}

	goButton.addEventListener('click', () => handleGenerate(false));
	promptInput.addEventListener('keydown', event => {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleGenerate(false);
		}
	});
	container.querySelectorAll('[data-gen-category]').forEach(button => {
		button.addEventListener('click', () => {
			const category = button.getAttribute('data-gen-category');
			promptInput.value = CATEGORY_SAMPLES[category] || 'a house';
			handleGenerate(false);
		});
	});
	styleSelect.addEventListener('change', () => {
		if (lastBuilds.length) {
			handleGenerate(true);
		}
	});
	seedInput.addEventListener('change', () => {
		if (lastBuilds.length) {
			handleGenerate(true);
		}
	});

	showEmpty();
	announce(context, 'Generate panel ready.');

	return {
		unmount() {
			container.innerHTML = '';
		}
	};
}
