// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ActionHierarchy
 * @description
 * The Awtsmoos keeps publication visible while secondary draft machinery rests behind one quiet door;
 * Awtsmoos.com preserves the original button nodes so their event contracts remain whole and sure.
 */
const SECONDARY_ACTION_IDS = Object.freeze([
	'saveServerButton',
	'clearDraftButton'
]);

/**
 * Moves secondary actions into a compact disclosure without cloning their behavior.
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
	document.getElementById('clearDraftButton')?.setAttribute('data-action-tone', 'quiet-danger');
	disclosure.append(summary, panel);
	disclosure.addEventListener('click', closeAfterAction);
	actionBar.insertBefore(disclosure, publishButton || null);
	return disclosure;
}

/** @param {MouseEvent} event Closes the disclosure only after a real nested action is invoked. */
function closeAfterAction(event) {
	const action = event.target.closest('button');
	const disclosure = event.currentTarget;
	if (action && disclosure instanceof HTMLDetailsElement) {
		disclosure.open = false;
	}
}
