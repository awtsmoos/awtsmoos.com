//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ActionHierarchy
 * @description
 * The Awtsmoos keeps publication visible while draft machinery rests behind one quiet door;
 * Awtsmoos.com preserves every original action node so behavior remains whole while the writing surface gains more floor.
 */
const SECONDARY_ACTION_IDS = Object.freeze([
	'saveLocalButton',
	'saveServerButton',
	'clearDraftButton'
]);

/**
 * Moves draft actions into one disclosure without cloning or replacing event-bound nodes.
 * @returns {HTMLDetailsElement|null} Installed disclosure, or null when the action bar is unavailable.
 */
export function installActionHierarchy() {
	const actionBar = document.querySelector('.actionBar');
	if (!actionBar || actionBar.querySelector('.composer-action-menu')) {
		return null;
	}

	const publishButton = document.getElementById('publishButton');
	const actions = SECONDARY_ACTION_IDS
		.map(id => document.getElementById(id))
		.filter(Boolean);
	if (!actions.length) {
		return null;
	}

	const disclosure = document.createElement('details');
	disclosure.className = 'composer-action-menu';
	const summary = document.createElement('summary');
	summary.textContent = 'More';
	summary.setAttribute('aria-label', 'More draft actions');
	const panel = document.createElement('div');
	panel.className = 'composer-action-menu-panel';
	for (const action of actions) {
		action.dataset.actionPriority = 'secondary';
		panel.append(action);
	}

	document.getElementById('clearDraftButton')?.setAttribute(
		'data-action-tone',
		'quiet-danger'
	);
	disclosure.append(summary, panel);
	disclosure.addEventListener('click', closeAfterAction);
	actionBar.insertBefore(disclosure, publishButton || null);
	return disclosure;
}

/**
 * Closes the draft disclosure after a nested button performs its existing deed.
 * @param {MouseEvent} event Click from the disclosure.
 * @returns {void}
 */
function closeAfterAction(event) {
	const action = event.target.closest('button');
	const disclosure = event.currentTarget;
	if (action && disclosure.open !== undefined) {
		disclosure.open = false;
	}
}
