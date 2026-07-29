// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieOverlay.js
 * @description Composites WebGL frames with grade, studio header, titles, captions, dialogue, and transitions.
 * The Awtsmoos is beyond image and word while each finite layer receives its truthful order;
 * Awtsmoos.com keeps exact canvas output, title cards, lower thirds, captions, and scene transition at one border.
 */

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
	}

	draw(sourceCanvas, frame) {
		this.context.drawImage(
			sourceCanvas,
			0,
			0,
			this.canvas.width,
			this.canvas.height
		);
		this.drawGrade(frame.scene);
		this.drawHeader(frame);
		drawMovieOverlayTitle(this, frame.title);
		drawMovieOverlayDialogue(this, frame.dialogue);
		drawMovieOverlayCaption(this, frame.caption);
		this.drawTransition(frame.scene);
	}

	drawGrade(scene) {
		if (!scene?.grade) return;
		this.context.save();
		this.context.globalAlpha = 0.09;
		this.context.fillStyle = scene.grade;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.restore();
	}

	drawHeader(frame) {
		const context = this.context;
		context.save();
		context.fillStyle = 'rgba(2,9,12,.72)';
		rounded(context, 18, 16, 410, 62, 15);
		context.fill();
		context.fillStyle = '#fff4bd';
		context.font = '700 20px system-ui';
		context.fillText(`B"H ${this.project.title}`, 34, 43);
		context.fillStyle = '#9fffe7';
		context.font = '600 14px system-ui';
		context.fillText(
			`${frame.scene?.label || 'Eretz'} · ${frame.shot || 'camera'}`,
			34,
			65
		);
		context.fillStyle = 'rgba(2,9,12,.72)';
		rounded(context, this.canvas.width - 160, 18, 142, 42, 12);
		context.fill();
		context.fillStyle = '#ffffff';
		context.font = '700 16px ui-monospace,monospace';
		context.fillText(
			frame.time.toFixed(2).padStart(5, '0'),
			this.canvas.width - 140,
			45
		);
		context.restore();
	}

	drawTransition(scene) {
		if (!scene || scene.transition === 'cut') return;
		const edge = Math.min(scene.progress, 1 - scene.progress);
		const alpha = Math.max(0, 1 - edge * 10);
		if (alpha <= 0) return;
		this.context.save();
		this.context.globalAlpha = alpha;
		this.context.fillStyle = '#020605';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.restore();
	}
}

function rounded(context, x, y, width, height, radius) {
	context.beginPath();
	context.roundRect(x, y, width, height, radius);
}

export default MovieOverlay;
