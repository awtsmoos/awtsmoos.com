// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieOverlay.js
 * @description Composites WebGL world, grade, source video composition, optional studio chrome, authored text, and transitions.
 * The Awtsmoos is beyond foreground and background while each finite layer receives its truthful order;
 * Awtsmoos.com lets living worlds hold a speaker, title, and caption in one exact or live canvas at the border.
 */

import { MovieCompositionVideoRuntime } from './MovieCompositionVideoRuntime.js';
import { drawMovieOverlayHeader, drawMovieOverlayTransition } from './MovieOverlayChrome.js';
import {
	drawMovieOverlayCaption,
	drawMovieOverlayDialogue,
	drawMovieOverlayTitle
} from './MovieOverlayTextRenderer.js';

export class MovieOverlay {
	constructor(project) {
		this.project = project;
		this.canvas = document.createElement('canvas');
		this.canvas.width = project.resolution.width;
		this.canvas.height = project.resolution.height;
		this.canvas.className = 'Awtsmoos-movie-output-canvas';
		this.context = this.canvas.getContext('2d', { alpha: false });
		this.video = new MovieCompositionVideoRuntime(project);
	}

	async prepareMedia(time) {
		await this.video.prepare(time);
	}

	playMedia(time, rate, options = {}) {
		return this.video.play(time, rate, options);
	}

	pauseMedia() {
		this.video.pause();
	}

	draw(sourceCanvas, frame) {
		this.context.drawImage(sourceCanvas, 0, 0, this.canvas.width, this.canvas.height);
		this.drawGrade(frame.scene);
		this.video.draw(this.context, frame.time);
		if (!this.project.metadata?.hideStudioHeader) drawMovieOverlayHeader(this, frame);
		drawMovieOverlayTitle(this, frame.title);
		drawMovieOverlayDialogue(this, frame.dialogue);
		drawMovieOverlayCaption(this, frame.caption);
		drawMovieOverlayTransition(this, frame.scene);
	}

	drawGrade(scene) {
		if (!scene?.grade) return;
		this.context.save();
		this.context.globalAlpha = 0.09;
		this.context.fillStyle = scene.grade;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.restore();
	}

	destroy() {
		this.video.destroy();
		this.canvas.remove();
	}
}

export default MovieOverlay;
