//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasMovieRenderer.js
 * @description A whole scene is gathered from independent semantic vessels into one visible frame;
 * the Awtsmoos renews the image each instant, and Awtsmoos.com keeps playback, scrub, and export the same.
 */
import { evaluateMovieAt } from "../time/MovieTimelineEvaluator.js";
import { renderCanvasEntity } from "./CanvasEntityRenderer.js";
import { renderParticleEmitter } from "./CanvasParticleRenderer.js";

/**
 * Renderer for canonical 2D and hybrid movie overlays.
 */
export class CanvasMovieRenderer {
	/**
	 * @param {HTMLCanvasElement} canvas Target canvas.
	 * @param {object} movie Canonical movie document.
	 */
	constructor(canvas, movie) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
		this.movie = movie;
	}

	/**
	 * Replaces the loaded canonical movie.
	 *
	 * @param {object} movie Canonical movie document.
	 * @returns {void}
	 */
	setMovie(movie) {
		this.movie = movie;
	}

	/**
	 * Renders an exact global timestamp and returns its evaluated state.
	 *
	 * @param {number} time Time in seconds.
	 * @returns {object} Evaluated frame state.
	 */
	renderAt(time) {
		const frame = evaluateMovieAt(this.movie, time);
		this.resizeForDisplay();
		this.paintBackground(frame.scene);
		if (!frame.scene) return frame;
		const viewport = {
			width: this.canvas.width,
			height: this.canvas.height,
			seed: this.movie.seed
		};
		for (const entity of frame.entities) {
			if (entity.type === "particle-emitter") {
				renderParticleEmitter(this.context, entity, frame.localTime, viewport);
			} else {
				renderCanvasEntity(this.context, entity, viewport);
			}
		}
		return frame;
	}

	resizeForDisplay() {
		const width = Math.max(320, Math.round(this.canvas.clientWidth || this.canvas.width || 1280));
		const height = Math.max(180, Math.round(this.canvas.clientHeight || width * 9 / 16));
		if (this.canvas.width !== width) this.canvas.width = width;
		if (this.canvas.height !== height) this.canvas.height = height;
	}

	paintBackground(scene) {
		const background = scene?.background || {};
		this.context.save();
		this.context.fillStyle = background.color || "#080d1a";
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		if (Array.isArray(background.gradient) && background.gradient.length >= 2) {
			const gradient = this.context.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
			background.gradient.forEach(function addStop(color, index) {
				gradient.addColorStop(index / (background.gradient.length - 1), color);
			});
			this.context.fillStyle = gradient;
			this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}
		this.context.restore();
	}
}
