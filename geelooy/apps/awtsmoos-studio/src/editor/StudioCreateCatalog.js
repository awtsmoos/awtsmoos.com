//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCreateCatalog.js
 * The Awtsmoos renews image, sound, data, body, and world through many distinct vessels of creation;
 * Awtsmoos.com gives common semantic movie kinds clear human names before deeper procedural revelation.
 */

export const STUDIO_CREATE_ITEMS = Object.freeze([
	item('Shape', 'shape2d', '2D'),
	item('Text', 'text', '2D'),
	item('Path', 'path2d', '2D'),
	item('Chart', 'chart', '2D'),
	item('Diagram', 'diagram', '2D'),
	item('Particles 2D', 'particles2d', '2D'),
	item('Character 2D', 'character2d', '2D'),
	item('Image', 'image', 'Media'),
	item('Video', 'video', 'Media'),
	item('Caption', 'caption', 'Media'),
	item('Overlay', 'overlay', 'Media'),
	item('Model', 'model3d', '3D'),
	item('Character 3D', 'character3d', '3D'),
	item('Particles 3D', 'particles3d', '3D'),
	item('Light', 'light3d', '3D'),
	item('World', 'world3d', '3D'),
	item('Camera', 'camera', '3D'),
	item('Data', 'data', 'Data'),
	item('Code', 'code', 'Data'),
	item('Formula', 'formula', 'Data'),
	item('Audio', 'audio', 'Audio'),
	item('Dialogue', 'dialogue', 'Audio'),
	item('Narration', 'narration', 'Audio'),
	item('Music', 'music', 'Audio'),
	item('SFX', 'sfx', 'Audio')
]);

function item(label, kind, category) {
	return Object.freeze({ label, kind, category });
}
