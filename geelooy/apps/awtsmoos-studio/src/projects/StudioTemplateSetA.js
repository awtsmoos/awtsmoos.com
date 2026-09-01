//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTemplateSetA.js
 * Chesed opens simple motion, character story, and data revelation into distinct starting doors;
 * Awtsmoos.com lets each project begin with useful structure while the Awtsmoos renews infinitely more.
 */
export const StudioTemplateSetA = [
	{
		id: 'clean-start', title: 'Clean Start', category: 'Starter', mode: '2D', description: 'A minimal editable scene for an AI-first movie from scratch.', accent: '#72e6ff', features: { mobileFirst: true },
		scenes: [{ title: 'Your First Scene', subtitle: 'Prompt, edit, animate, or replace every layer.', camera: 'wide', shape: 'rounded-rect', accent: '#72e6ff', path: true }]
	},
	{
		id: 'motion-type', title: '2D Motion Type', category: 'Motion Graphics', mode: '2D', description: 'Kinetic typography, paths, geometric motion, particles, and bold transitions.', accent: '#ff7ab8', features: { motionGraphics: true },
		scenes: [
			{ title: 'Make Words Move', subtitle: 'Typography enters with shape rhythm.', camera: 'wide', shape: 'circle', path: true, particles: 'burst', accent: '#ff7ab8' },
			{ title: 'Shape the Beat', subtitle: 'Paths and particles carry timing.', camera: 'overhead', shape: 'hexagon', path: true, particles: 'trail', accent: '#ffd166' },
			{ title: 'Land the Message', subtitle: 'A clear final card resolves the motion.', camera: 'closeup', shape: 'rounded-rect', particles: 'confetti', accent: '#72e6ff' }
		]
	},
	{
		id: 'character-cinema', title: 'Character Cinema', category: 'Narrative', mode: '3D', description: 'Recurring cast, 3D worlds, model motion, particles, lighting, and cinematic cameras.', accent: '#b68cff', features: { narrative: true, characters: true, mixed2d3d: true },
		cast: [{ id: 'guide', name: 'Noa', role: 'guide', traits: ['warm', 'curious'] }, { id: 'builder', name: 'Ari', role: 'builder', traits: ['inventive', 'clear'] }],
		scenes: [
			{ title: 'Enter the World', subtitle: 'Meet the guide in a living environment.', camera: 'wide', move: 'dolly-in', world: 'dawn-city', light: true, model: 'extruded-arch', character: 'guide', character3d: true, particles: 'starfield', particles3d: true, accent: '#b68cff' },
			{ title: 'Build Together', subtitle: 'A second character joins the action.', camera: 'two-shot', move: 'orbit', world: 'creative-studio', light: true, model: 'worktable', character: 'builder', character3d: true, shape: 'diamond', accent: '#72e6ff' },
			{ title: 'Reveal the Result', subtitle: 'Camera and particles close the scene.', camera: 'closeup', move: 'push-in', world: 'gallery', light: true, model: 'hero-object', character: 'guide', character3d: true, particles: 'sparkles', particles3d: true, accent: '#ffce67' }
		]
	},
	{
		id: 'data-story', title: 'Animated Data Story', category: 'Infographic', mode: 'Hybrid', description: 'Charts, diagrams, labels, paths, and dimensional context for explaining data.', accent: '#7cff9b', features: { infographic: true, dataStory: true },
		scenes: [
			{ title: 'Set the Question', subtitle: 'A visual premise before the numbers arrive.', camera: 'wide', shape: 'pill', path: true, diagram: ['Question', 'Signal', 'Answer'], accent: '#7cff9b' },
			{ title: 'Show the Change', subtitle: 'A semantic chart animates the trend.', camera: 'high-angle', chart: 'bar', values: [18, 47, 73, 94], path: true, particles: 'data-points', accent: '#72e6ff' },
			{ title: 'Explain Why', subtitle: 'Connect causes and outcomes clearly.', camera: 'overhead', diagram: ['Input', 'Process', 'Outcome'], chart: 'line', values: [26, 52, 68, 92], shape: 'triangle', accent: '#ffce67' }
		]
	}
];
