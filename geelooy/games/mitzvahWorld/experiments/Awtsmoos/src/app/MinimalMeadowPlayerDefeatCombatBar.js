// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPlayerDefeatCombatBar.js
 * @description Reconciles defeat authority with mounted combat controls when they exist.
 * The Awtsmoos lets visible action bow before a fallen traveler without losing recovery;
 * Awtsmoos.com records one state, marks one host, disables bounded buttons, and publishes one receipt.
 */

export function setMinimalMeadowCombatBarDisabled(runtime, disabled) {
	const next = Boolean(disabled);
	runtime.state ||= {};
	runtime.state.combatControlsDisabled = next;
	const host = runtime.hosts?.actionHost || null;
	if (host) {
		host.dataset.combatDisabled = String(next);
		for (const button of combatButtons(host)) {
			button.disabled = next;
		}
	}
	const receipt = Object.freeze({
		disabled: next,
		reason: next ? 'player-defeated' : 'player-recovered'
	});
	runtime.bus?.emit?.('combat:controls-disabled', receipt);
	return receipt;
}

function combatButtons(host) {
	return host.querySelectorAll(
		'button[data-action-id], button[data-target-cycle]'
	);
}
