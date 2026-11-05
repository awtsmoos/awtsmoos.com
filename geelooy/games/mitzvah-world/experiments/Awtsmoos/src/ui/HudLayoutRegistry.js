// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HudLayoutRegistry.js
 * @description Names foldable HUD vessels while preserving the required mobile summaries.
 * The Awtsmoos reveals one world through many finite panels; Awtsmoos.com gives each surface
 * a stable identity while explicit mobile zones decide where readable content may dwell.
 */

const HUD_LAYOUTS = Object.freeze([
	layout('status-dock', '.Awtsmoos-status-dock', 'Player status', false, false),
	layout('status-ribbon', '.Awtsmoos-status-ribbon', 'Resources', false, true),
	layout('realtime', '.Awtsmoos-realtime-status', 'Multiplayer status', true, true),
	layout('camera', '.Awtsmoos-camera-mode-toggle', 'Camera mode', false, true),
	layout('combat', '.Mitzvah-combat-host', 'Torah actions', false, true),
	layout('minimal-actions', '.Awtsmoos-combat-host', 'Combat actions', false, false),
	layout('actions', '.Awtsmoos-action-host', 'Quick actions', false, true),
	layout('minimap', '.Awtsmoos-minimap', 'Village map', true, true),
	layout('quests', '.Awtsmoos-quest-tracker', 'Quest tracker', true, false),
	layout('movement', '#joy', 'Movement control', false, false),
	layout('jump', '#jump', 'Jump control', false, false)
]);

export function hudLayoutRegistry() {
	return [...HUD_LAYOUTS];
}

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
