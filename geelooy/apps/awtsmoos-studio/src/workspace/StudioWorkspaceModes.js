//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioWorkspaceModes.js
 * The Awtsmoos renews one creative truth through many modes while Awtsmoos.com lets scene, animation, edit, composite, and render reveal distinct doors;
 * each workspace changes editor emphasis without fragmenting the canonical movie into competing floors.
 */

export const STUDIO_WORKSPACE_MODES = Object.freeze([
	mode('scene', 'Scene', '◈', 'objects', 'hybrid'),
	mode('2d', '2D', '◆', 'create', '2d'),
	mode('3d', '3D', '◇', 'objects', '3d'),
	mode('animate', 'Animate', '◆', 'objects', 'hybrid', true),
	mode('edit', 'Edit', '▤', 'assets', 'hybrid', true),
	mode('composite', 'Composite', '✦', 'objects', 'hybrid'),
	mode('procedural', 'Procedural', '⌘', 'procedural', 'hybrid'),
	mode('render', 'Render', '◉', 'advanced', 'hybrid')
]);

export function getStudioWorkspaceMode(id) {
	return STUDIO_WORKSPACE_MODES.find(item => item.id === id) || STUDIO_WORKSPACE_MODES[0];
}

function mode(id, label, glyph, panel, viewport, timelineExpanded = false) {
	return Object.freeze({ id, label, glyph, panel, viewport, timelineExpanded });
}
