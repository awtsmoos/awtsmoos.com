//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CaptionMovieAdapter.js
 * @description Captions keeps its quick 2D soul; the Awtsmoos lets Awtsmoos.com
 * translate what it can draw and preserve richer intentions for another whole.
 */
import { movieCapabilities } from "../../../../shared/movie/MovieCapabilities.js";

/** Translate canonical scenes into caption composition tasks plus preserved intent. */
export class CaptionMovieAdapter {
	capabilities() {
		return movieCapabilities("captions");
	}

	adapt(movie) {
		const supportedKinds = new Set(this.capabilities().layers);
		const unsupported = [];
		const scenes = movie.scenes.map(scene => ({
			id: scene.id,
			start: scene.start,
			duration: scene.duration,
			camera: scene.camera,
			layers: scene.layers.filter(layer => {
				const supported = supportedKinds.has(layer.kind);
				if (!supported) unsupported.push({ sceneId: scene.id, layer });
				return supported;
			}),
			backgroundHint: scene.layers.find(layer => layer.kind === "world3d")?.content?.theme || "gradient"
		}));
		return {
			adapter: "captions-awtsmoos-movie-v1",
			format: movie.format,
			duration: movie.duration,
			scenes,
			unsupported,
			warnings: unsupported.map(item => ({ code: "CAPTIONS_PRESERVED_LAYER", sceneId: item.sceneId, layerId: item.layer.id }))
		};
	}
}
