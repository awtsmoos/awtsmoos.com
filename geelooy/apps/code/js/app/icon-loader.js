// B"H
// FILE: js/app/icon-loader.js

const ICONS_URL = 'https://awtsmoos.com/sites/awtsmoos-release-assets/apps/code/icons.svg';

/** Loads the externally verified SVG symbol vessel into the Code app. */
export async function loadIcons() {
	try {
		const response = await fetch(ICONS_URL);
		if (!response.ok) throw new Error(`Status ${response.status}`);
		const div = document.createElement('div');
		div.innerHTML = await response.text();
		const svg = div.querySelector('svg');
		if (!svg) throw new Error('No SVG found in icons file.');
		svg.classList.add('hidden');
		document.body.insertBefore(svg, document.body.firstChild);
	} catch (error) {
		console.error('Failed to load icons:', error);
	}
}
