// B"H
// Boruch Hashem
// Blessed is He

/** Coordinates only the already-mounted authored world and never creates Short scenery. */
import { realMaterialImages } from '../MovieProductionTextureEvidence.js';
import { movieShortHeroWorldDefinition } from './MovieShortHeroWorldDefinitions.js';

export class MovieShortHeroWorldDirector {
	constructor(runtime, project) {
		this.runtime = runtime;
		this.enabled = Boolean(project.metadata?.shortId);
		this.currentVisual = null;
		this.ready = this.enabled
			? Promise.resolve(runtime.movieAuthoredWorldReady)
			: Promise.resolve(null);
	}

	async prepare() {
		await this.ready;
		if (!this.enabled) return;
		if (!this.runtime.terrain?.group || !this.runtime.realNature) {
			throw new Error('Production Short requires the complete authored world and real nature.');
		}
		if (this.currentVisual === 'river-garden') this.assertRealRiver();
	}

	apply(sceneState) {
		if (!this.enabled || !sceneState) return;
		this.currentVisual = String(sceneState.clip?.shortVisual || '');
		if (!movieShortHeroWorldDefinition(this.currentVisual)) {
			throw new Error(`Unknown authored Short world: ${this.currentVisual}`);
		}
	}

	assertRealRiver() {
		let ready = false;
		this.runtime.terrain.group.traverse?.(node => {
			if (!/river|stream|lake|water/i.test(node.name || '')) return;
			const materials = Array.isArray(node.material) ? node.material : [node.material];
			if (materials.filter(Boolean).some(material => realMaterialImages(material).length)) ready = true;
		});
		if (!ready) throw new Error('River Short requires bound authored water textures.');
	}

	destroy() {
		this.ready = Promise.resolve(null);
	}
}
