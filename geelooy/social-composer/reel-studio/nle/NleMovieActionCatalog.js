// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleMovieActionCatalog
 * @description
 * One immutable catalog names every callable movie action and every visible control;
 * API and UI therefore emerge from the same finite letters without drifting apart.
 */

const text = (name, label, value = '') => ({ label, name, type: 'text', value });
const number = (name, label, value, min = -1000, max = 1000) => ({ label, max, min, name, type: 'number', value });
const choice = (name, label, value, options) => ({ label, name, options, type: 'select', value });
const area = (name, label, value = '') => ({ label, name, type: 'textarea', value });
const action = (id, apiName, category, label, description, fields = []) => Object.freeze({ apiName, category, description, fields, id, label });

export const NLE_MOVIE_ACTIONS = Object.freeze([
	action('agent.ask', 'askAgent', 'AI agent', 'Ask connected agent', 'Send a complete provider-neutral movie request or receive the request package when no provider is connected.', [area('prompt', 'Direction', 'Make this village journey more cinematic while preserving continuity.'), choice('quality', 'Quality', 'cinematic', ['preview', 'cinematic', 'maximum'])]),
	action('village.load', 'loadCinematicVillage', 'World', 'Load cinematic village', 'Replace the current project with the complete houses, trees, paths, character, graphs, and camera journey.', [text('title', 'Movie title', 'The Village Awakens — Cinematic World'), number('duration', 'Duration', 24, 8, 120)]),
	action('world.addHouse', 'addHouse', 'World', 'Add house', 'Add one editable plaster, roof, wood, and window structure to the living village.', [number('x', 'X', 0), number('z', 'Z', 0), number('width', 'Width', 10, 4, 30), number('height', 'Height', 7, 3, 24)]),
	action('world.addTreeGrove', 'addTreeGrove', 'World', 'Add tree grove', 'Add a deterministic grove with bounded count, scale, placement, and material references.', [number('count', 'Trees', 24, 1, 160), number('centerX', 'Center X', 0), number('centerZ', 'Center Z', 0), number('radius', 'Radius', 22, 4, 100)]),
	action('character.animateWalk', 'animateCharacter', 'Character', 'Animate character walk', 'Append one canonical walking clip and extend the preview character path.', [number('start', 'Start', 0, 0, 900), number('duration', 'Duration', 5, .1, 120), number('fromX', 'From X', -10), number('fromZ', 'From Z', 8), number('toX', 'To X', 12), number('toZ', 'To Z', -8)]),
	action('camera.addShot', 'addCameraShot', 'Camera', 'Add camera shot', 'Append a canonical rig clip that compiles into concrete deterministic camera endpoints.', [choice('rig', 'Rig', 'dollyIn', ['aerialPullback', 'craneReveal', 'dollyIn', 'handheldDrift', 'orbitLeft', 'orbitRight', 'sideTrack']), number('start', 'Start', 0, 0, 900), number('duration', 'Duration', 4, .1, 120), number('anchorX', 'Anchor X', 0), number('anchorZ', 'Anchor Z', 0)]),
	action('nodes.addMaterial', 'addMaterialGraph', 'Nodes', 'Add material graph', 'Create a canonical editable material graph and immediately validate it.', [text('label', 'Label', 'Cinematic material'), text('color', 'Color', '#7b6a58'), number('roughness', 'Roughness', .65, 0, 1)]),
	action('nodes.addShader', 'addShaderGraph', 'Nodes', 'Add shader graph', 'Create an editable sky, fog, exposure, vignette, and wind graph.', [text('label', 'Label', 'Cinematic atmosphere')]),
	action('nodes.addParticles', 'addParticleGraph', 'Nodes', 'Add particle graph', 'Create a deterministic GPU particle graph for fireflies or mist.', [text('label', 'Label', 'Golden particles'), choice('mode', 'Mode', 'fireflies', ['fireflies', 'mist']), number('count', 'Count', 260, 1, 1200)]),
	action('project.validate', 'validate', 'Package', 'Validate movie', 'Compile the complete project and return render-readiness evidence.'),
	action('project.exportPackage', 'exportPackage', 'Package', 'Export movie package', 'Return project, graphs, assets, render plan, request, and validation as one ready package.'),
	action('project.applyPackage', 'applyPackage', 'Package', 'Apply movie package', 'Validate and apply one complete awtsmoos.movie-package.v1 document as an undoable change.', [area('source', 'Complete package JSON', '')]),
	action('playback.play', 'play', 'Playback', 'Play', 'Play from the current timeline position.'),
	action('playback.pause', 'pause', 'Playback', 'Pause at the current timeline position.'),
	action('playback.seek', 'seek', 'Playback', 'Seek', 'Move the timeline and preview to an exact time.', [number('time', 'Time', 0, 0, 900)]),
	action('movie.render', 'render', 'Output', 'Render movie', 'Render and download the movie through the existing verified recorder.'),
	action('world.open3D', 'openWorld', 'Output', 'Open 3D World', 'Open the complete canonical project in the full MitzvahWorld studio.')
]);

export function movieActionById(id) {
	return NLE_MOVIE_ACTIONS.find(action => action.id === id) || null;
}
