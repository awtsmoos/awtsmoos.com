// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NleCompositor
 * @description
 * Generated media, a real cinematic WebGL village, canonical 3D evidence, and
 * overlays meet on the one canvas later previewed, played, recorded, and attached.
 */

import { assetById } from './NleAssetClipFactory.js';
import { drawNleOverlay } from './NleOverlayRenderer.js';
import { drawNleVisual } from './NleVisualRenderer.js';
import { NleWebGlWorldRenderer } from './NleWebGlWorldRenderer.js';

export class NleCompositor {
	constructor(canvas, repository) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d', { alpha: false });
		this.repository = repository;
		this.worldRenderer = new NleWebGlWorldRenderer();
	}

	resize(project) {
		const width = Math.max(160, Math.min(1920, Number(project.resolution?.width || 1280)));
		const height = Math.max(90, Math.min(1080, Number(project.resolution?.height || 720)));
		if (this.canvas.width !== width) this.canvas.width = width;
		if (this.canvas.height !== height) this.canvas.height = height;
	}

	draw(project, time) {
		this.resize(project);
		this.context.fillStyle = '#03070c';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		let worldActive = false;
		for (const clip of activeClips(project, 'nle-visual', time)) {
			const asset = assetById(project, clip.assetId);
			if (asset?.kind === 'cinematic-world') {
				this.worldRenderer.draw(this.context, project, asset, time - clip.start, clip.duration);
				worldActive = true;
				continue;
			}
			drawNleVisual(this.context, asset, time - clip.start, this.canvas, this.repository);
		}
		if (!worldActive) this.drawWorldEvidence(project, time);
		for (const clip of activeClips(project, 'nle-overlay', time)) {
			const asset = assetById(project, clip.assetId);
			drawNleOverlay(this.context, asset, time - clip.start, clip.duration, this.canvas);
		}
	}

	drawWorldEvidence(project, time) {
		const active = project.tracks
			.filter(track => !track.type.startsWith('nle-'))
			.flatMap(track => (track.clips || [])
				.filter(clip => time >= clip.start && time < clip.start + clip.duration)
				.map(clip => `${track.type}: ${clip.label || clip.id}`));
		if (!active.length) return;
		this.context.save();
		this.context.fillStyle = 'rgba(4, 9, 18, .48)';
		this.context.fillRect(18, 18, Math.min(this.canvas.width * .58, 520), 34 + active.length * 20);
		this.context.fillStyle = '#b8cad9';
		this.context.font = '600 15px Inter, system-ui, sans-serif';
		active.slice(0, 6).forEach((label, index) => this.context.fillText(label, 34, 44 + index * 20));
		this.context.restore();
	}
}

function activeClips(project, type, time) {
	return project.tracks
		.filter(track => track.type === type)
		.flatMap(track => track.clips || [])
		.filter(clip => time >= clip.start && time < clip.start + clip.duration)
		.sort((left, right) => left.start - right.start);
}
