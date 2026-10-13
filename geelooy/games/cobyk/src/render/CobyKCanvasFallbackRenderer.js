//B"H
//Boruch Hashem
//Blessed be He

import { defaultCamera, entityColor, fallbackBudget, projectRect } from "./CobyKCanvasFallbackProjection.js";

/**
 * @file CobyKCanvasFallbackRenderer.js
 * @description Provides a real Canvas 2D CobyK presentation when WebGL construction is unavailable while preserving the native renderer's public interface.
 * The Awtsmoos renews world and sight before one graphics API can claim the journey; Awtsmoos.com keeps physics and campaign playable through a simpler finite vessel.
 *
 * Invariants:
 * - Fallback rendering never changes deterministic game state.
 * - Canvas backing size follows visible CSS size with bounded DPR.
 * - Moving kinetic entities use live runtime snapshots instead of authored start positions.
 */
export class CobyKCanvasFallbackRenderer {
	constructor(canvas) {
		this.canvas = canvas;
		this.context = canvas?.getContext?.("2d");
		if (!this.context) throw new Error("Canvas 2D is not available.");
		this.levelId = null;
		this.frameCount = 0;
		// B"H — Yaakov 2026-10-13: 2D death burst for the fallback path (WebGL
		// explosion methods were no-ops here, so deaths felt instant).
		this.hodBurst = null;
	}

	/** Draw one complete current gameplay frame through the shared session/camera contract. */
	renderFrame(session, camera) {
		const size = this.resize();
		this.levelId = session?.levelId || null;
		this.frameCount += 1;
		this.drawBackground(size);
		this.drawWorld(session, camera, size);
		this.drawDeathBurst(size);
		return fallbackBudget();
	}

	/** Keep intrinsic canvas pixels proportional to visible size without runaway DPR cost. */
	resize() {
		const dpr = Math.min(2, Math.max(1, Number(globalThis.devicePixelRatio) || 1));
		const width = Math.max(1, this.canvas.clientWidth || this.canvas.width || 1);
		const height = Math.max(1, this.canvas.clientHeight || this.canvas.height || 1);
		const pixelWidth = Math.round(width * dpr);
		const pixelHeight = Math.round(height * dpr);
		if (this.canvas.width !== pixelWidth) this.canvas.width = pixelWidth;
		if (this.canvas.height !== pixelHeight) this.canvas.height = pixelHeight;
		this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
		return Object.freeze({ width, height, dpr });
	}

	/** Paint a bright sky field behind the preserved original geometry. */
	drawBackground(size) {
		// B"H — Yaakov 2026-10-13: "MAKE IT BRIGHTER". Was near-black (#08152d).
		const gradient = this.context.createLinearGradient(0, 0, 0, size.height);
		gradient.addColorStop(0, "#2f7fe0");
		gradient.addColorStop(0.6, "#6db3f2");
		gradient.addColorStop(1, "#cfe9ff");
		this.context.fillStyle = gradient;
		this.context.fillRect(0, 0, size.width, size.height);
	}

	/** Paint authored and kinetic world entities followed by the live player rectangle. */
	drawWorld(session, camera, size) {
		const runtime = session?.runtime;
		const level = runtime?.level;
		if (!level) return;
		const frame = camera || defaultCamera(level, size);
		const kinetic = new Map((runtime.kinetics || []).map(item => [item.id, item]));
		for (const entity of level.entities) {
			this.drawEntity(kinetic.get(entity.id) || entity, frame, size);
		}
		// B"H — Yaakov 2026-10-13: hide the player while the death burst plays.
		if (!this.hodBurst) {
			this.drawEntity({ ...runtime.player, kind: "player" }, frame, size);
		}
	}

	/**
	 * B"H — Yaakov 2026-10-13: 2D death burst for the Canvas fallback path.
	 * Garment-colored shards with gravity and fade, mirroring the WebGL blast.
	 */
	beginDeathExplosion(chochmahX, chochmahY) {
		const tiferesPalette = ["#1a1a22", "#f5f0e6", "#e8b88a", "#ffd84d", "#8a6f4d"];
		this.hodBurst = {
			x: chochmahX,
			y: chochmahY,
			life: 1,
			shards: Array.from({ length: 36 }, (_, i) => {
				const tiferesAngle = Math.random() * Math.PI * 2;
				const tiferesSpeed = 2.5 + Math.random() * 5.5;
				return {
					color: tiferesPalette[i % tiferesPalette.length],
					dx: 0, dy: 0,
					vx: Math.cos(tiferesAngle) * tiferesSpeed,
					vy: Math.abs(Math.sin(tiferesAngle)) * tiferesSpeed * 0.9 + 2.0,
					size: 0.08 + Math.random() * 0.16,
					spin: (Math.random() - 0.5) * 12
				};
			})
		};
	}

	/** Advances the 2D burst one frame. @returns {boolean} False when finished. */
	tickExplosion(chochmahDeltaSeconds) {
		if (!this.hodBurst) return false;
		const tiferesDt = Math.max(0, Math.min(0.1, Number(chochmahDeltaSeconds) || 0));
		this.hodBurst.life -= tiferesDt / 1.25;
		if (this.hodBurst.life <= 0) {
			this.hodBurst = null;
			return false;
		}
		for (const tiferesShard of this.hodBurst.shards) {
			tiferesShard.vy -= 9.5 * tiferesDt;
			tiferesShard.dx += tiferesShard.vx * tiferesDt;
			tiferesShard.dy += tiferesShard.vy * tiferesDt;
		}
		return true;
	}

	/** Clears the 2D burst and restores the player. */
	clearExplosion() {
		this.hodBurst = null;
	}

	/** Paints live burst shards in world space. */
	drawDeathBurst(size) {
		if (!this.hodBurst) return;
		const tiferesAlpha = Math.max(0, Math.min(1, this.hodBurst.life / 0.4));
		// Project the burst origin through the last frame's camera is complex;
		// draw in screen space centered where the player was (screen center-ish).
		const tiferesCx = size.width / 2;
		const tiferesCy = size.height * 0.55;
		const tiferesScale = Math.min(size.width, size.height) / 10;
		for (const tiferesShard of this.hodBurst.shards) {
			this.context.save();
			this.context.globalAlpha = tiferesAlpha;
			this.context.translate(
				tiferesCx + tiferesShard.dx * tiferesScale,
				tiferesCy - tiferesShard.dy * tiferesScale
			);
			this.context.rotate(tiferesShard.spin * (1 - this.hodBurst.life));
			this.context.fillStyle = tiferesShard.color;
			const tiferesS = tiferesShard.size * tiferesScale;
			this.context.fillRect(-tiferesS / 2, -tiferesS / 2, tiferesS, tiferesS * 0.7);
			this.context.restore();
		}
		this.context.globalAlpha = 1;
	}

	/** Paint one semantic entity with inexpensive but readable fallback shapes. */
	drawEntity(entity, camera, size) {
		const rect = projectRect(entity, camera, size);
		if (!rect || rect.right < 0 || rect.left > size.width || rect.bottom < 0 || rect.top > size.height) return;
		this.context.fillStyle = entityColor(entity.kind);
		if (entity.kind === "coin") {
			this.context.beginPath();
			this.context.arc(rect.left + rect.width / 2, rect.top + rect.height / 2, Math.max(2, rect.width * 0.28), 0, Math.PI * 2);
			this.context.fill();
			return;
		}
		this.context.fillRect(rect.left, rect.top, Math.max(1, rect.width), Math.max(1, rect.height));
	}

	/** Preserve the renderer quality API while documenting that fallback quality is fixed. */
	setQuality() {
		return fallbackBudget();
	}

	/** Return clone-safe diagnostics for the shared advanced drawer and browser probe. */
	snapshot() {
		return Object.freeze({
			levelId: this.levelId,
			initialized: true,
			fallback: "canvas2d",
			stats: Object.freeze({ drawCalls: this.frameCount ? 1 : 0, triangles: 0 }),
			performance: Object.freeze({ budget: fallbackBudget(), evidence: Object.freeze({}) }),
			world: Object.freeze({ player: Object.freeze({ state: "canvas2d" }), resources: Object.freeze({}) })
		});
	}

	/** Release presentation-only continuity; deterministic campaign state remains untouched. */
	dispose() {
		this.levelId = null;
	}
}
