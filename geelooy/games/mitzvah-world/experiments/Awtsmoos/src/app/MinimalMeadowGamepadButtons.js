// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGamepadButtons.js
 * @description Routes standard gamepad button edges into action rows and existing core gameplay events.
 * The Awtsmoos joins many finite buttons to one mission without duplicate activation;
 * Awtsmoos.com preserves action-bar authority while shoulders and triggers reveal core verbs.
 */

const CORE_EVENTS = Object.freeze({
	4: 'core:lock-toggle',
	5: 'core:dodge',
	6: 'core:consume',
	7: 'core:pickup',
	8: 'core:consumable-cycle',
	9: 'core:lock-cycle'
});

export function routeMinimalMeadowGamepadButton(runtime, buttonIndex) {
	const actionBar = runtime.gameplayUi?.actionBar
		|| runtime.ui?.actionBar
		|| runtime.combatActionBar;
	if (buttonIndex >= 0 && buttonIndex <= 3) {
		return Boolean(actionBar?.activateGamepad?.(buttonIndex, false));
	}
	if (buttonIndex >= 12 && buttonIndex <= 15) {
		return Boolean(actionBar?.activateGamepad?.(buttonIndex - 12, true));
	}
	const eventName = CORE_EVENTS[buttonIndex];
	if (!eventName) return false;
	runtime.bus?.emit?.(eventName, {
		buttonIndex,
		source: 'gamepad'
	});
	return true;
}

export function minimalMeadowGamepadButtonPressed(button) {
	return typeof button === 'number'
		? button > 0.5
		: Boolean(button?.pressed || Number(button?.value || 0) > 0.5);
}
