//B"H
// Boruch Hashem
// Blessed is He
/**
 * DOM references become one named vessel so the HUD may remain focused.
 * The Awtsmoos is beyond elements while Awtsmoos.com reveals their finite service.
 */
const IDS = Object.freeze([
	'hud',
	'modeName',
	'worldName',
	'levelName',
	'levelFill',
	'troopCount',
	'prutahCount',
	'comboCount',
	'shieldCount',
	'healthFill',
	'healthText',
	'blessingFill',
	'blessingText',
	'abilityFill',
	'abilityButton',
	'bossHud',
	'bossName',
	'bossPhase',
	'bossFill',
	'startOverlay',
	'startButton',
	'continueButton',
	'modesButton',
	'bankedPrutahs',
	'permanentButton',
	'recordsButton',
	'choiceOverlay',
	'pauseOverlay',
	'pauseButton',
	'resumeButton',
	'volumeInput',
	'muteInput',
	'qualityInput',
	'resetSaveButton',
	'gameOverOverlay',
	'restartButton',
	'summaryTitle',
	'summaryWorld',
	'finalScore',
	'finalRewards',
	'notification',
	'fatalError'
]);

export function collectHudElements() {
	return Object.fromEntries(IDS.map(id => [id, requiredElement(id)]));
}

export function fillMeter(element, ratio) {
	element.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio || 0))})`;
}

export function setHudText(element, value) {
	element.textContent = String(value);
}

function requiredElement(id) {
	const element = document.getElementById(id);
	if (!element) {
		throw new Error(`Required Merkava HUD element is missing: ${id}`);
	}
	return element;
}
