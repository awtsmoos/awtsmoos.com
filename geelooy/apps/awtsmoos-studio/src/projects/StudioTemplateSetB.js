//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTemplateSetB.js
 * Gevurah and Tiferes give tutorial, procedural world, and promo motion their own measured way;
 * Awtsmoos.com keeps each starter focused while the Awtsmoos creates fresh possibility every day.
 */
export const StudioTemplateSetB = [
	{
		id: 'tutorial-explainer', title: 'Tutorial Explainer', category: 'Education', mode: 'Hybrid', description: 'Step-by-step teaching with callouts, diagrams, focus paths, character guidance, and clear text.', accent: '#6ee7ff', features: { tutorial: true, explainer: true },
		cast: [{ id: 'teacher', name: 'Miriam', role: 'teacher', traits: ['clear', 'encouraging'] }],
		scenes: [
			{ title: '1 · Orient', subtitle: 'Tell the viewer what they are about to learn.', camera: 'medium', character: 'teacher', shape: 'rounded-rect', diagram: ['Goal', 'Tools', 'Result'], accent: '#6ee7ff' },
			{ title: '2 · Demonstrate', subtitle: 'Show the action while highlighting the important region.', camera: 'pov', move: 'pan-right', character: 'teacher', path: true, shape: 'circle', particles: 'cursor-trail', accent: '#ffce67' },
			{ title: '3 · Confirm', subtitle: 'Summarize the result and next action.', camera: 'closeup', character: 'teacher', chart: 'radial', values: [25, 55, 80, 100], shape: 'pill', accent: '#7cff9b' }
		]
	},
	{
		id: 'procedural-world', title: 'Procedural World', category: '3D + FX', mode: '3D', description: 'Generated world, model motion, particles, lighting, depth, and camera movement ready for Core assets.', accent: '#80d7b7', features: { procedural: true, world3d: true },
		scenes: [
			{ title: 'Generate the Terrain', subtitle: 'A procedural environment establishes scale.', camera: 'crane', move: 'crane-down', world: 'procedural-canyon', light: true, model: 'crystal-spire', particles: 'mist', particles3d: true, accent: '#80d7b7' },
			{ title: 'Travel the World', subtitle: 'Camera motion reveals generated forms.', camera: 'orbit', move: 'orbit', world: 'procedural-garden', light: true, model: 'branching-tree', particles: 'fireflies', particles3d: true, accent: '#b68cff' },
			{ title: 'Material Finale', subtitle: 'Lighting and particles reveal the hero asset.', camera: 'low-angle', move: 'push-in', world: 'night-temple', light: true, model: 'procedural-tower', particles: 'sparks', particles3d: true, accent: '#ffce67' }
		]
	},
	{
		id: 'hybrid-promo', title: 'Hybrid Promo', category: 'Promo', mode: 'Hybrid', description: 'Fast 2D overlays over 3D product space with typography, particles, charts, and camera moves.', accent: '#ff6b8a', features: { promo: true, mixed2d3d: true },
		scenes: [
			{ title: 'Hook', subtitle: 'Open with a dimensional hero shot.', camera: 'closeup', move: 'push-in', world: 'product-stage', light: true, model: 'hero-product', shape: 'circle', particles: 'burst', particles3d: true, accent: '#ff6b8a' },
			{ title: 'Proof', subtitle: 'Show the metric, path, and key advantage.', camera: 'medium', move: 'truck-left', world: 'metric-room', light: true, model: 'feature-object', chart: 'bar', values: [34, 69, 91, 100], path: true, accent: '#72e6ff' },
			{ title: 'Call to Action', subtitle: 'Finish with one unmistakable next step.', camera: 'wide', world: 'brand-stage', light: true, model: 'logo-monolith', shape: 'rounded-rect', particles: 'confetti', accent: '#ffd166' }
		]
	}
];
