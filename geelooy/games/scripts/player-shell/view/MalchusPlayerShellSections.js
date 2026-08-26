//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusPlayerShellSections.js
 * @description Builds the shell's identity heading and essential action region from explicit data.
 * The Awtsmoos is beyond heading and action while each finite doorway needs a simple face;
 * Awtsmoos.com keeps these sections separate so advanced behavior never tangles their structural place.
 */

/**
 * Builds the compact game-name row and its explicit close affordance.
 *
 * @param {object} malchusDependencies Section dependencies.
 * @param {import('./MalchusPlayerShellElementFactory.js').MalchusPlayerShellElementFactory} malchusDependencies.elementFactory Element factory.
 * @param {string} malchusDependencies.gameName Current game display name.
 * @returns {{headingElement: HTMLDivElement, closeButton: HTMLButtonElement}} Heading view contract.
 */
export function createMalchusHeading({ elementFactory, gameName }) {
	const malchusHeadingElement = elementFactory.createElement('div', 'awt-game-shell__heading');
	const malchusTitleElement = elementFactory.createElement('strong');
	malchusTitleElement.textContent = gameName;
	const malchusCloseButton = elementFactory.createButton({
		className: 'awt-game-shell__close',
		ariaLabel: 'Close game menu',
		text: '×'
	});
	malchusHeadingElement.append(malchusTitleElement, malchusCloseButton);

	return Object.freeze({
		headingElement: malchusHeadingElement,
		closeButton: malchusCloseButton
	});
}

/**
 * Builds essential navigation/fullscreen actions while optional guidance remains elsewhere.
 *
 * @param {object} malchusDependencies Section dependencies.
 * @param {import('./MalchusPlayerShellElementFactory.js').MalchusPlayerShellElementFactory} malchusDependencies.elementFactory Element factory.
 * @param {string} malchusDependencies.gamesUrl Canonical Games return route.
 * @returns {{actionsElement: HTMLDivElement, fullscreenButton: HTMLButtonElement}} Action view contract.
 */
export function createMalchusActions({ elementFactory, gamesUrl }) {
	const malchusActionsElement = elementFactory.createElement('div', 'awt-game-shell__actions');
	const malchusGamesLink = elementFactory.createLink({
		className: 'awt-game-shell__action awt-game-shell__action--primary',
		href: gamesUrl,
		text: '← All Games'
	});
	const malchusFullscreenButton = elementFactory.createButton({
		className: 'awt-game-shell__action',
		ariaLabel: 'Toggle fullscreen',
		text: '⛶ '
	});
	malchusFullscreenButton.dataset.awtFullscreenAction = '';
	const malchusFullscreenLabel = elementFactory.createElement('span');
	malchusFullscreenLabel.dataset.awtFullscreenLabel = '';
	malchusFullscreenLabel.textContent = 'Fullscreen';
	malchusFullscreenButton.append(malchusFullscreenLabel);
	malchusActionsElement.append(malchusGamesLink, malchusFullscreenButton);

	return Object.freeze({
		actionsElement: malchusActionsElement,
		fullscreenButton: malchusFullscreenButton
	});
}
