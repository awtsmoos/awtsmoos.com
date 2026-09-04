//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file primaryIntentBarView.js
 * @description Renders four beginner creative intents plus a truthful Timeline utility where real playback will later live.
 * The Awtsmoos lets the maker begin with desire rather than architecture, four simple doors around one living frame;
 * Awtsmoos.com keeps deeper workspaces below the surface, while each visible intent still reaches the same editable flame.
 */

/**
 * Renders the persistent mobile-first creative intent bar without pretending Timeline is already playback.
 * @returns {string} Accessible intent navigation markup.
 */
export function primaryIntentBarView() {
	return `
		<nav id="primaryIntentBar" class="primary-intent-bar" aria-label="Creative actions">
			${intentButton('intentCreateButton', 'create', '＋', 'Create')}
			${intentButton('intentEditButton', 'edit', '✎', 'Edit')}
			<button id="intentTimelineButton" class="intent-button intent-transport" type="button" aria-label="Open Timeline">
				<span class="intent-icon" aria-hidden="true">≋</span>
				<span class="intent-label">Timeline</span>
			</button>
			${intentButton('intentAnimateButton', 'animate', '◇', 'Animate')}
			${intentButton('intentMoreButton', 'more', '⋯', 'More')}
		</nav>
	`;
}

function intentButton(id, intent, icon, label) {
	return `
		<button id="${id}" class="intent-button" type="button" data-studio-intent="${intent}" aria-controls="intentSheet" aria-expanded="false">
			<span class="intent-icon" aria-hidden="true">${icon}</span>
			<span class="intent-label">${label}</span>
		</button>
	`;
}
