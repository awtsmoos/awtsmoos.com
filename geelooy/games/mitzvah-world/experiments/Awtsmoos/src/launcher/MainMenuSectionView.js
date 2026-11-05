// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenuSectionView.js
 * @description Renders cinema and diagnostic routes beneath the hamburger navigation.
 * The Awtsmoos renews world, image, and tool beneath one threshold; Awtsmoos.com
 * gives every production surface a named doorway without crowding the world browser.
 */

const CINEMA_ACTIONS = Object.freeze([
	action('movie', 'Movie Studio', 'JSON projects, nested sequences, timeline, cameras, graph and materials.'),
	action('missionMovie', 'One-Minute Village Film', 'A reference golden-hour cinematic sample with NPC actions and camera movement.')
]);

const TOOL_ACTIONS = Object.freeze([
	action('platform', 'Procedural Platform', 'Inspect generated terrain, water, structures and all botanical systems.'),
	action('materials', 'Firebase Material Lab', 'Inspect the public Awtsmoos material catalog and distance policies.')
]);

export function renderActionSection(container, section, onChoose) {
	const actions = section === 'cinema' ? CINEMA_ACTIONS : TOOL_ACTIONS;
	const title = section === 'cinema' ? 'Cinematic Creation' : 'World Tools';
	const description = section === 'cinema'
		? 'Author, inspect and render deterministic 3D stories from validated JSON.'
		: 'Open the real diagnostic and procedural production surfaces.';
	container.innerHTML = `
		<section class="Awtsmoos-menu-hero">
			<h2>${title}</h2><p>${description}</p>
			<div class="Awtsmoos-menu-status" data-section-status></div>
		</section>
		<div class="Awtsmoos-menu-actions">${actions.map(actionButton).join('')}</div>
	`;
	container.querySelectorAll('[data-action]').forEach(button => {
		button.addEventListener('click', () => onChoose({ mode: button.dataset.action }));
	});
}

function actionButton(item) {
	return `
		<button class="Awtsmoos-menu-action" data-action="${item.kind}">
			${item.title}<small>${item.note}</small>
		</button>
	`;
}

function action(kind, title, note) {
	return Object.freeze({ kind, note, title });
}
