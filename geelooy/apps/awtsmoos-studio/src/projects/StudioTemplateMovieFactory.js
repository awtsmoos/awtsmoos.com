//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTemplateMovieFactory.js
 * The Awtsmoos turns a compact starter intention into a complete canonical movie vessel;
 * Awtsmoos.com keeps templates data-first so AI, human editing, preview, and export share one level.
 */
import { createMovieDocument } from '../../../shared/movie/MovieProtocol.js';
import { normalizeMovie } from '../../../shared/movie/MovieNormalizer.js';
import { createTemplateLayers } from './StudioTemplateLayers.js';

/** Build a deterministic canonical starter movie from template configuration. */
export function createStudioTemplateMovie(template) {
	const scenes = template.scenes.map((brief, index) => createTemplateScene(index, brief));
	return normalizeMovie(createMovieDocument({
		id: `awtsmoos-template-${template.id}`,
		metadata: {
			title: template.title,
			description: template.description,
			templateId: template.id,
			category: template.category
		},
		format: template.format || { width: 1280, height: 720, fps: 24, orientation: 'landscape', safeArea: 0.08 },
		duration: scenes.length * 10,
		cast: template.cast || [],
		features: { template: true, ...(template.features || {}) },
		scenes,
		handoff: { preferredAuthor: 'awtsmoos-studio', preferredEditor: 'nesher', preferredMotionGraphics: 'captions' }
	}));
}

function createTemplateScene(index, brief) {
	return {
		id: `template-scene-${index + 1}`,
		name: brief.title,
		start: index * 10,
		duration: 10,
		camera: {
			kind: brief.camera || 'wide',
			move: brief.move || 'dolly-in',
			position: { x: 0, y: brief.cameraY || 0, z: brief.cameraZ || 8 }
		},
		transition: {
			kind: brief.transition || (index ? 'crossfade' : 'cut'),
			duration: index ? 0.45 : 0
		},
		layers: createTemplateLayers(index, brief)
	};
}
