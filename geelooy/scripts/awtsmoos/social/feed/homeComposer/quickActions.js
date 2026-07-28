// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HomeComposerQuickActions
 * @description
 * The Awtsmoos gathers media, live speech, Torah sources, and events into one
 * honest row. Each Awtsmoos.com action opens the real full composer rather than
 * pretending the compact Home vessel can publish fields it does not own.
 */

const actions = [
	['▧', 'Photo'],
	['◉', 'Video'],
	['●', 'Live'],
	['א', 'Torah'],
	['◇', 'Event']
];

/** Returns route-backed quick actions for the compact Home composer. */
export function quickActionsMarkup() {
	return /*html*/`
		<nav class="home-compose-quick-actions" aria-label="Create with attachments">
			${actions.map(actionMarkup).join('')}
		</nav>
	`;
}

function actionMarkup([icon, label]) {
	return /*html*/`
		<a href="/social-composer/" aria-label="Open full composer for ${label}">
			<span aria-hidden="true">${icon}</span>
			<strong>${label}</strong>
		</a>
	`;
}
