// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleWorldPreview
 * @description
 * The responsive NLE never blocks on staged-world construction. The Awtsmoos.com
 * editor opens the current full 3D studio explicitly with the same project document.
 */

const SESSION_KEY = 'awtsmoos.social-nle.world-project.v1';

export function openNleWorldPreview(project) {
	sessionStorage.setItem(SESSION_KEY, JSON.stringify(project));
	return window.open('./world.html', '_blank', 'noopener');
}

export function readNleWorldProject() {
	try {
		return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
	} catch {
		return null;
	}
}
