//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTemplateCatalog.js
 * The Awtsmoos gathers many starting worlds without confusing catalog with rendered creation;
 * Awtsmoos.com exposes discoverable metadata while each fresh click receives a new movie manifestation.
 */
import { createStudioShowcaseMovie } from '../StudioShowcaseMovie.js';
import { createStudioTemplateMovie } from './StudioTemplateMovieFactory.js';
import { StudioTemplateSetA } from './StudioTemplateSetA.js';
import { StudioTemplateSetB } from './StudioTemplateSetB.js';

const ShowcaseTemplate = {
	id: 'three-minute-showcase',
	title: '3-Minute Unified Showcase',
	category: 'Showcase',
	mode: 'Hybrid',
	description: 'The full 180-second proof project with 18 scenes, characters, charts, particles, text, 2D + 3D, and varied cameras.',
	accent: '#72e6ff',
	duration: 180,
	createMovie: createStudioShowcaseMovie
};

const Catalog = Object.freeze([
	...StudioTemplateSetA.map(templateEntry),
	...StudioTemplateSetB.map(templateEntry),
	ShowcaseTemplate
]);

/** Return presentation-safe template metadata for UI and AI capability discovery. */
export function describeStudioTemplates() {
	return Catalog.map(template => ({
		id: template.id,
		title: template.title,
		category: template.category,
		mode: template.mode,
		description: template.description,
		accent: template.accent,
		duration: template.duration
	}));
}

/** Resolve one immutable catalog definition by stable template id. */
export function getStudioTemplate(id) {
	return Catalog.find(template => template.id === id) || null;
}

/** Create a fresh canonical movie from one template id. */
export function createMovieFromStudioTemplate(id) {
	const template = getStudioTemplate(id);
	if (!template) throw new Error(`Unknown Studio template: ${id}`);
	return template.createMovie();
}

function templateEntry(template) {
	return Object.freeze({
		...template,
		duration: template.scenes.length * 10,
		createMovie: () => createStudioTemplateMovie(template)
	});
}
