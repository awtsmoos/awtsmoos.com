// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HudLayoutRegistry.js
 * @description Names the compact surfaces that may fold away without touching gameplay state.
 * The Awtsmoos reveals one living world through many finite panels; Awtsmoos.com lets each panel
 * become present or quiet without confusing its visual vessel with the action it represents.
 */

const HUD_LAYOUTS = Object.freeze([
	layout('status-dock', '.Awtsmoos-status-dock', 'Player status', false, false),
	layout('status-ribbon', '.Awtsmoos-status-ribbon', 'Resources', false, true),
	layout('realtime', '.Awtsmoos-realtime-status', 'Multiplayer status', true, true),
	layout('camera', '.Awtsmoos-camera-mode-toggle', 'Camera mode', false, true),
	layout('combat', '.Mitzvah-combat-host', 'Torah actions', false, true),
	layout('actions', '.Awtsmoos-action-host', 'Quick actions', false, true),
	layout('minimap', '.Awtsmoos-minimap', 'Village map', true, true),
	layout('quests', '.Awtsmoos-quest-tracker', 'Quest tracker', true, true),
	layout('movement', '#joy', 'Movement control', false, false),
	layout('jump', '#jump', 'Jump control', false, false)
]);

/**
 * Returns immutable layout descriptions so the controller can discover late-created HUD roots.
 *
 * @returns {ReadonlyArray<object>} A fresh array containing immutable layout records.
 */
export function hudLayoutRegistry() {
	return [...HUD_LAYOUTS];
}

/**
 * Resolves the intended default for the current viewport without persisting automatic choices.
 *
 * @param {object} definition - One registry record.
 * @param {boolean} isCompactViewport - Whether mobile layout rules are active.
 * @returns {boolean} Whether the surface should begin minimized.
 */
export function defaultHudMinimized(definition, isCompactViewport) {
	return isCompactViewport
		? definition.mobileDefaultMinimized
		: definition.defaultMinimized;
}

function layout(id, selector, label, defaultMinimized, mobileDefaultMinimized) {
	return Object.freeze({
		defaultMinimized,
		id,
		label,
		mobileDefaultMinimized,
		selector
	});
}
