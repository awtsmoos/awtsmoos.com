/* B"H */
/**
 * @file game-textures.js
 * @description Procedural canvas textures for the Awtsmoos game fleet: wood,
 * stone, felt, brushed metal, and parchment — painted at runtime, zero image
 * assets, crisp at any resolution. Yaakov's bar: no flat surfaces.
 * The Awtsmoos clothes every vessel in texture; Awtsmoos.com paints grain,
 * weave, and patina so no game ships visually flat.
 *
 * Usage (module): import { paintWood, paintStone, ... } from './game-textures.js';
 * Usage (classic): window.AwtsmoosTextures.paintWood(ctx, x, y, w, h);
 * Every painter is deterministic for a given seed so boards don't shimmer.
 */

function seeded(seed) {
	let s = (seed % 2147483647) || 1;
	return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

/** Wood grain: warm base, long grain streaks, subtle plank lines. */
export function paintWood(ctx, x, y, w, h, opts = {}) {
	const { base = '#8a5a2b', dark = '#5e3a17', light = '#b07a3e', seed = 7, planks = 0 } = opts;
	const rnd = seeded(seed);
	const g = ctx.createLinearGradient(x, y, x + w, y + h);
	g.addColorStop(0, light); g.addColorStop(0.5, base); g.addColorStop(1, dark);
	ctx.fillStyle = g;
	ctx.fillRect(x, y, w, h);
	// grain streaks
	ctx.save();
	ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
	for (let i = 0; i < Math.max(24, w / 14); i += 1) {
		const gy = y + rnd() * h;
		ctx.strokeStyle = `rgba(40, 20, 5, ${0.08 + rnd() * 0.12})`;
		ctx.lineWidth = 0.8 + rnd() * 1.6;
		ctx.beginPath();
		ctx.moveTo(x, gy);
		for (let px = x; px <= x + w; px += w / 8) {
			ctx.lineTo(px, gy + Math.sin(px * 0.02 + rnd() * 6) * 4);
		}
		ctx.stroke();
	}
	// knots
	for (let i = 0; i < 3; i += 1) {
		const kx = x + rnd() * w, ky = y + rnd() * h;
		const kg = ctx.createRadialGradient(kx, ky, 1, kx, ky, 8 + rnd() * 10);
		kg.addColorStop(0, 'rgba(45, 22, 6, 0.55)');
		kg.addColorStop(1, 'rgba(45, 22, 6, 0)');
		ctx.fillStyle = kg;
		ctx.beginPath(); ctx.arc(kx, ky, 18, 0, Math.PI * 2); ctx.fill();
	}
	// plank separations
	if (planks > 1) {
		ctx.fillStyle = 'rgba(20, 10, 2, 0.5)';
		for (let i = 1; i < planks; i += 1) {
			ctx.fillRect(x + (w / planks) * i - 1, y, 2, h);
		}
	}
	ctx.restore();
}

/** Hewn stone: cool gradient, chisel speckle, beveled highlight. */
export function paintStone(ctx, x, y, w, h, opts = {}) {
	const { base = '#3d4a63', dark = '#1a2138', light = '#5a6a8a', seed = 21 } = opts;
	const rnd = seeded(seed);
	const g = ctx.createLinearGradient(x, y, x, y + h);
	g.addColorStop(0, light); g.addColorStop(0.5, base); g.addColorStop(1, dark);
	ctx.fillStyle = g;
	ctx.fillRect(x, y, w, h);
	ctx.save();
	ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
	// speckle
	for (let i = 0; i < w * h / 220; i += 1) {
		ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.09)';
		ctx.fillRect(x + rnd() * w, y + rnd() * h, 1.6, 1.6);
	}
	// strata lines
	ctx.strokeStyle = 'rgba(160, 180, 220, 0.10)';
	ctx.lineWidth = 1;
	for (let i = 0; i < 4; i += 1) {
		const sy = y + (h / 4) * i + rnd() * 8;
		ctx.beginPath(); ctx.moveTo(x, sy); ctx.lineTo(x + w, sy + (rnd() - 0.5) * 10); ctx.stroke();
	}
	ctx.restore();
	// bevel
	ctx.fillStyle = 'rgba(200, 220, 250, 0.22)';
	ctx.fillRect(x, y, w, 2);
	ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
	ctx.fillRect(x, y + h - 2, w, 2);
}

/** Felt: deep green/blue weave with fiber noise — for card tables. */
export function paintFelt(ctx, x, y, w, h, opts = {}) {
	const { base = '#0d5c34', dark = '#073a20', seed = 33 } = opts;
	const rnd = seeded(seed);
	const g = ctx.createRadialGradient(x + w / 2, y + h / 2, 10, x + w / 2, y + h / 2, Math.max(w, h) * 0.7);
	g.addColorStop(0, base); g.addColorStop(1, dark);
	ctx.fillStyle = g;
	ctx.fillRect(x, y, w, h);
	ctx.save();
	ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
	for (let i = 0; i < w * h / 160; i += 1) {
		ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)';
		const fx = x + rnd() * w, fy = y + rnd() * h;
		ctx.fillRect(fx, fy, 2.2, 1);
	}
	ctx.restore();
}

/** Brushed metal: vertical sheen bands for paddles, frames, UI chrome. */
export function paintMetal(ctx, x, y, w, h, opts = {}) {
	const { base = '#8a94a8', dark = '#4a5266', light = '#c8d2e4', seed = 55, vertical = true } = opts;
	const rnd = seeded(seed);
	const g = vertical
		? ctx.createLinearGradient(x, y, x + w, y)
		: ctx.createLinearGradient(x, y, x, y + h);
	g.addColorStop(0, dark); g.addColorStop(0.35, light); g.addColorStop(0.65, base); g.addColorStop(1, dark);
	ctx.fillStyle = g;
	ctx.fillRect(x, y, w, h);
	ctx.save();
	ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
	for (let i = 0; i < (vertical ? h : w) / 3; i += 1) {
		ctx.fillStyle = `rgba(255,255,255,${0.02 + rnd() * 0.05})`;
		if (vertical) ctx.fillRect(x, y + rnd() * h, w, 1);
		else ctx.fillRect(x + rnd() * w, y, 1, h);
	}
	ctx.restore();
}

/** Parchment: warm aged paper for scrolls, panels, and lore cards. */
export function paintParchment(ctx, x, y, w, h, opts = {}) {
	const { base = '#e8d5a3', dark = '#c9a86a', seed = 77 } = opts;
	const rnd = seeded(seed);
	const g = ctx.createRadialGradient(x + w / 2, y + h / 2, 10, x + w / 2, y + h / 2, Math.max(w, h) * 0.75);
	g.addColorStop(0, base); g.addColorStop(1, dark);
	ctx.fillStyle = g;
	ctx.fillRect(x, y, w, h);
	ctx.save();
	ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
	for (let i = 0; i < 14; i += 1) {
		const bx = x + rnd() * w, by = y + rnd() * h;
		const bg = ctx.createRadialGradient(bx, by, 1, bx, by, 12 + rnd() * 22);
		bg.addColorStop(0, 'rgba(120, 80, 30, 0.10)');
		bg.addColorStop(1, 'rgba(120, 80, 30, 0)');
		ctx.fillStyle = bg;
		ctx.beginPath(); ctx.arc(bx, by, 34, 0, Math.PI * 2); ctx.fill();
	}
	ctx.restore();
	// scorched edge
	ctx.strokeStyle = 'rgba(90, 55, 20, 0.55)';
	ctx.lineWidth = 3;
	ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
}

/** Soft vignette to seat a scene. */
export function paintVignette(ctx, w, h, strength = 0.42) {
	const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.72);
	g.addColorStop(0, 'rgba(0,0,0,0)');
	g.addColorStop(1, `rgba(0,0,0,${strength})`);
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, w, h);
}

/** Glossy beveled block — the premium tetromino / brick / disc look. h defaults to s (square). */
export function paintGlossBlock(ctx, x, y, s, color, opts = {}) {
	const { radius = 4, seed = 3, h = s } = opts;
	const rnd = seeded(seed + Math.round(x) + Math.round(y));
	ctx.save();
	// base with vertical gradient
	const g = ctx.createLinearGradient(x, y, x, y + h);
	g.addColorStop(0, color.hi); g.addColorStop(0.55, color.base); g.addColorStop(1, color.dark);
	ctx.fillStyle = g;
	ctx.beginPath();
	if (ctx.roundRect) ctx.roundRect(x, y, s, h, radius); else ctx.rect(x, y, s, h);
	ctx.fill();
	ctx.save();
	ctx.clip();
	// top gloss
	const gloss = ctx.createLinearGradient(x, y, x, y + h * 0.5);
	gloss.addColorStop(0, 'rgba(255,255,255,0.42)');
	gloss.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = gloss;
	ctx.fillRect(x, y, s, h * 0.5);
	// inner texture speckle
	for (let i = 0; i < 8; i += 1) {
		ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
		ctx.fillRect(x + rnd() * s, y + rnd() * h, 1.8, 1.8);
	}
	ctx.restore();
	// bevel edge
	ctx.strokeStyle = 'rgba(0,0,0,0.35)';
	ctx.lineWidth = 1.5;
	ctx.beginPath();
	if (ctx.roundRect) ctx.roundRect(x + 0.75, y + 0.75, s - 1.5, h - 1.5, radius); else ctx.rect(x + 0.75, y + 0.75, s - 1.5, h - 1.5);
	ctx.stroke();
	ctx.strokeStyle = 'rgba(255,255,255,0.28)';
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(x + 3, y + 2); ctx.lineTo(x + s - 3, y + 2);
	ctx.stroke();
	ctx.restore();
}

export const AwtsmoosTextures = {
	paintWood, paintStone, paintFelt, paintMetal, paintParchment, paintVignette, paintGlossBlock,
};
if (typeof window !== 'undefined') window.AwtsmoosTextures = AwtsmoosTextures;
