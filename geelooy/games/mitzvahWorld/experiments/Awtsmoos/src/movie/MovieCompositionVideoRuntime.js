// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCompositionVideoRuntime.js
 * @description Evaluates one designated overlay composition and synchronizes its video media leaves for exact or live time.
 * The Awtsmoos renews nested time before source time and project time appear as separate streams;
 * Awtsmoos.com lets one composition become exact seeks or muted recorder motion without inventing parallel dreams.
 */

import { evaluateMovieComposition } from './MovieCompositionEvaluator.js';
import { drawMovieCompositionVideoLayer } from './MovieCompositionVideoPaint.js';
import { MovieVideoMediaElement } from './MovieVideoMediaElement.js';

export class MovieCompositionVideoRuntime {
	constructor(project, environment = globalThis) {
		this.project = project;
		this.environment = environment;
		this.compositionId = String(project.metadata?.overlayCompositionId || '');
		this.compositions = project.compositions || [];
		this.media = new Map((project.media || []).map(item => [item.id, item]));
		this.players = new Map();
	}

	async prepare(time) {
		const plan = this.plan(time);
		if (!plan) return;
		await Promise.all(plan.layers.map(layer => this.prepareLayer(layer)));
	}

	draw(context, time) {
		const plan = this.plan(time);
		if (!plan) return;
		for (const layer of plan.layers) {
			const player = this.playerFor(layer);
			if (!player) continue;
			player.request(layer.sourceTime);
			drawMovieCompositionVideoLayer(context, player.element, layer);
		}
	}

	async play(time, rate = 1, options = {}) {
		const plan = this.plan(time);
		if (!plan) return;
		await Promise.all(
			plan.layers.map(layer => this.playerFor(layer)?.play(layer.sourceTime, rate, options)).filter(Boolean)
		);
	}

	pause() {
		for (const player of this.players.values()) player.pause();
	}

	destroy() {
		for (const player of this.players.values()) player.destroy();
		this.players.clear();
	}

	plan(time) {
		if (!this.compositionId) return null;
		const root = this.compositions.find(item => item.id === this.compositionId);
		if (!root) throw new Error(`Movie overlay composition ${this.compositionId} was not found.`);
		const maximum = Math.max(0, Number(root.duration) - 0.000001);
		const bounded = Math.max(0, Math.min(maximum, Number(time) || 0));
		return evaluateMovieComposition(this.compositions, this.compositionId, bounded);
	}

	async prepareLayer(layer) {
		const player = this.playerFor(layer);
		if (player) await player.prepare(layer.sourceTime);
	}

	playerFor(layer) {
		if (layer.kind !== 'media') return null;
		const asset = this.media.get(layer.sourceId);
		if (!asset || asset.kind !== 'video') return null;
		if (!this.players.has(asset.id)) {
			this.players.set(asset.id, new MovieVideoMediaElement(asset, this.environment));
		}
		return this.players.get(asset.id);
	}
}
