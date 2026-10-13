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
		// B"H — Yaakov 2026-10-13: blob shadow tracking (mirrors the WebGL
		// NetzachPlayerShadow) — the fallback had no player shadow at all.
		this.hodShadowGroundY = null;
		this.hodShadowLastY = null;
	}

	/** Draw one complete current gameplay frame through the shared session/camera contract. */
	renderFrame(session, camera) {
		const size = this.resize();
		this.levelId = session?.levelId || null;
		this.frameCount += 1;
		this.drawBackground(size);
		this.drawBelowTerrainEarth(session, camera, size);
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

	/**
	 * B"H — Yaakov 2026-10-13: the camera dips below the level floor (so the
	 * player stays centered), which left a dead empty band under the terrain.
	 * Fill from the terrain floor to the canvas bottom with packed earth so
	 * the world reads as solid ground, not unfinished sky.
	 */
	drawBelowTerrainEarth(session, camera, size) {
		const tiferesBounds = session?.runtime?.level?.bounds;
		if (!tiferesBounds || !Number.isFinite(tiferesBounds.minY)) return;
		const tiferesFrame = camera || defaultCamera(session.runtime.level, size);
		// Project the terrain floor (bounds.minY) to screen space.
		const tiferesFloor = projectRect(
			{ x: 0, y: tiferesBounds.minY, width: 1, height: 1 },
			tiferesFrame, size
		);
		if (!tiferesFloor) return;
		const tiferesTopY = Math.round(tiferesFloor.bottom);
		if (tiferesTopY >= size.height - 1) return;
		const tiferesEarth = this.context.createLinearGradient(0, tiferesTopY, 0, size.height);
		tiferesEarth.addColorStop(0, "#7d6248");
		tiferesEarth.addColorStop(0.35, "#5d4832");
		tiferesEarth.addColorStop(1, "#38291a");
		this.context.fillStyle = tiferesEarth;
		this.context.fillRect(0, Math.max(0, tiferesTopY), size.width, size.height - Math.max(0, tiferesTopY));
		// A darker seam where terrain meets earth.
		this.context.fillStyle = "rgba(20,12,6,0.35)";
		this.context.fillRect(0, Math.max(0, tiferesTopY), size.width, 3);
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
			const tiferesPlayer = { ...runtime.player, kind: "player" };
			this.drawPlayerShadow(tiferesPlayer, frame, size);
			this.drawEntity(tiferesPlayer, frame, size);
		}
	}

	/**
	 * B"H — Yaakov 2026-10-13: soft blob shadow under the player for the
	 * Canvas 2D fallback (the WebGL path has NetzachPlayerShadow; the
	 * fallback showed none). Tracks the ground level while settled, then
	 * shrinks/fades as the player rises above it.
	 */
	drawPlayerShadow(player, camera, size) {
		if (!player) return;
		const tiferesHalfH = (Number(player.height) || 0.95) / 2;
		const tiferesY = Number(player.y) || 0;
		// Track ground: stable Y means feet rest on terrain.
		if (this.hodShadowLastY !== null && Math.abs(tiferesY - this.hodShadowLastY) < 0.02) {
			this.hodShadowGroundY = tiferesY - tiferesHalfH;
		} else if (this.hodShadowGroundY === null) {
			this.hodShadowGroundY = tiferesY - tiferesHalfH;
		}
		this.hodShadowLastY = tiferesY;
		const tiferesHeightAbove = Math.max(0, tiferesY - tiferesHalfH - this.hodShadowGroundY);
		// Project the ground point under the player to screen space.
		const tiferesGroundRect = projectRect(
			{ x: Number(player.x) || 0, y: this.hodShadowGroundY, width: 0.01, height: 0.01 },
			camera, size
		);
		const tiferesPlayerRect = projectRect(player, camera, size);
		if (!tiferesGroundRect || !tiferesPlayerRect) return;
		const tiferesCx = tiferesPlayerRect.left + tiferesPlayerRect.width / 2;
		const tiferesCy = tiferesGroundRect.bottom + 2;
		const tiferesShrink = Math.max(0.35, 1 - tiferesHeightAbove * 0.28);
		const tiferesRx = Math.max(3, (tiferesPlayerRect.width / 2) * 0.95 * tiferesShrink);
		const tiferesRy = Math.max(2, tiferesRx * 0.28);
		const tiferesAlpha = Math.max(0.10, 0.38 - tiferesHeightAbove * 0.12);
		this.context.save();
		this.context.translate(tiferesCx, tiferesCy);
		this.context.scale(1, tiferesRy / tiferesRx);
		const tiferesGrad = this.context.createRadialGradient(0, 0, 0, 0, 0, tiferesRx);
		tiferesGrad.addColorStop(0, `rgba(10,12,24,${tiferesAlpha.toFixed(3)})`);
		tiferesGrad.addColorStop(0.6, `rgba(10,12,24,${(tiferesAlpha * 0.55).toFixed(3)})`);
		tiferesGrad.addColorStop(1, "rgba(10,12,24,0)");
		this.context.fillStyle = tiferesGrad;
		this.context.beginPath();
		this.context.arc(0, 0, tiferesRx, 0, Math.PI * 2);
		this.context.fill();
		this.context.restore();
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
		if (entity.kind === "coin") {
			this.drawFallbackCoin(rect);
			return;
		}
		if (entity.kind === "brick") {
			this.drawFallbackBrick(entity, rect);
			return;
		}
		this.context.fillStyle = entityColor(entity.kind);
		this.context.fillRect(rect.left, rect.top, Math.max(1, rect.width), Math.max(1, rect.height));
	}

	/**
	 * B"H — Yaakov 2026-10-13: fallback bricks get real depth — a top-light
	 * vertical gradient plus a lit top edge, instead of flat fills. Boundary
	 * columns (level walls, e.g. the tall left wall at spawn) render muted so
	 * they recede instead of glaring.
	 */
	drawFallbackBrick(entity, rect) {
		const tiferesW = Math.max(1, rect.width);
		const tiferesH = Math.max(1, rect.height);
		// Boundary wall detection: first/last world column.
		const tiferesBoundary = Number(entity.x) <= 1.01;
		const tiferesBase = tiferesBoundary ? "#9a8471" : "#b8a88f";
		const tiferesLit = tiferesBoundary ? "#ac9782" : "#d6c4a8";
		const tiferesDark = tiferesBoundary ? "#6e5c4b" : "#8a7458";
		const tiferesGrad = this.context.createLinearGradient(0, rect.top, 0, rect.top + tiferesH);
		tiferesGrad.addColorStop(0, tiferesLit);
		tiferesGrad.addColorStop(0.25, tiferesBase);
		tiferesGrad.addColorStop(1, tiferesDark);
		this.context.fillStyle = tiferesGrad;
		this.context.fillRect(rect.left, rect.top, tiferesW, tiferesH);
		// Lit top edge (light from above) + dark bottom seam for depth.
		this.context.fillStyle = tiferesBoundary ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.22)";
		this.context.fillRect(rect.left, rect.top, tiferesW, Math.max(1, tiferesH * 0.08));
		this.context.fillStyle = "rgba(0,0,0,0.18)";
		this.context.fillRect(rect.left, rect.top + tiferesH - Math.max(1, tiferesH * 0.08), tiferesW, Math.max(1, tiferesH * 0.08));
	}

	/**
	 * B"H — Yaakov 2026-10-13: fallback coins get a gold radial shine instead
	 * of a flat disc.
	 */
	drawFallbackCoin(rect) {
		const tiferesCx = rect.left + rect.width / 2;
		const tiferesCy = rect.top + rect.height / 2;
		const tiferesR = Math.max(2, rect.width * 0.28);
		const tiferesShine = this.context.createRadialGradient(
			tiferesCx - tiferesR * 0.3, tiferesCy - tiferesR * 0.3, tiferesR * 0.1,
			tiferesCx, tiferesCy, tiferesR
		);
		tiferesShine.addColorStop(0, "#fff6d8");
		tiferesShine.addColorStop(0.55, "#ffd84d");
		tiferesShine.addColorStop(1, "#c89b2a");
		this.context.fillStyle = tiferesShine;
		this.context.beginPath();
		this.context.arc(tiferesCx, tiferesCy, tiferesR, 0, Math.PI * 2);
		this.context.fill();
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
