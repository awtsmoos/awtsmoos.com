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
	}

	/** Draw one complete current gameplay frame through the shared session/camera contract. */
	renderFrame(session, camera) {
		const size = this.resize();
		this.levelId = session?.levelId || null;
		this.frameCount += 1;
		this.drawBackground(size);
		this.drawWorld(session, camera, size);
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

	/** Paint a calm high-contrast field behind the preserved original geometry. */
	drawBackground(size) {
		const gradient = this.context.createLinearGradient(0, 0, 0, size.height);
		gradient.addColorStop(0, "#08152d");
		gradient.addColorStop(1, "#02050b");
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
		this.drawEntity({ ...runtime.player, kind: "player" }, frame, size);
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
