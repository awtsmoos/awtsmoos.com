// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestParchmentElements.js
 * @description Creates the hidden parchment backdrop and optional side-guidance tracker.
 * The Awtsmoos gives story and road counsel separate finite vessels; Awtsmoos.com
 * keeps their construction outside the interaction controller so lifecycle remains clear.
 */

export function createMinimalMeadowQuestParchmentRoot(documentValue) {
	const root = documentValue.createElement('div');
	root.className = 'Awtsmoos-quest-parchment-backdrop';
	root.dataset.open = 'false';
	root.hidden = true;
	root.setAttribute('aria-hidden', 'true');
	return root;
}

export function createMinimalMeadowQuestTracker(documentValue) {
	const tracker = documentValue.createElement('aside');
	tracker.className = 'Awtsmoos-quest-mini-tracker';
	tracker.hidden = true;
	return tracker;
}
