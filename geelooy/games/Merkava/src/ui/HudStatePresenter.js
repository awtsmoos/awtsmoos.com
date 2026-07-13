//B"H
// Boruch Hashem
// Blessed is He
/**
 * Live state becomes readable labels and meters without owning interface events.
 * The Awtsmoos is beyond presentation while Awtsmoos.com reveals measured truth.
 */
import { currentLevel, currentWorld } from '../config/campaignConfig.js';
import { GAME } from '../config/gameConfig.js';
import { ABILITIES } from '../game/AbilitySystem.js';
import { runModeDefinition } from '../modes/RunModeCatalog.js';
import { fillMeter, setHudText } from './HudElements.js';

export class HudStatePresenter {
	constructor(elements) {
		this.elements = elements;
	}

	update(state, save) {
		setHudText(this.elements.modeName, modeLabel(state));
		setHudText(this.elements.worldName, currentWorld(state).name);
		setHudText(this.elements.levelName, currentLevel(state).name);
		setHudText(this.elements.troopCount, state.troops);
		setHudText(this.elements.prutahCount, state.prutahs);
		setHudText(this.elements.comboCount, state.combo ? `×${state.combo}` : '—');
		setHudText(this.elements.shieldCount, state.shield);
		setHudText(this.elements.healthText, Math.ceil(state.health));
		setHudText(this.elements.blessingText, Math.floor(state.blessingFragments));
		setHudText(this.elements.bankedPrutahs, save.permanentPrutahs);
		setHudText(this.elements.abilityButton, abilityName(state.abilityId));
		this.elements.continueButton.hidden = !save.activeRun;
		setHudText(this.elements.continueButton, continueLabel(save.activeRun));
		fillMeter(this.elements.levelFill, state.levelProgress / GAME.levelDistance);
		fillMeter(this.elements.healthFill, state.health / state.maxHealth);
		fillMeter(
			this.elements.blessingFill,
			state.blessing / GAME.blessingThreshold
		);
		fillMeter(
			this.elements.abilityFill,
			state.abilityCharge / GAME.abilityThreshold
		);
		this.updateBoss(state);
	}

	updateBoss(state) {
		const boss = state.boss;
		this.elements.bossHud.classList.toggle('hidden', !boss);
		if (!boss) {
			return;
		}
		setHudText(this.elements.bossName, boss.name);
		setHudText(this.elements.bossPhase, `PHASE ${boss.phase}`);
		fillMeter(this.elements.bossFill, boss.health / boss.maxHealth);
	}
}

function abilityName(abilityId) {
	const ability = ABILITIES.find(candidate => candidate.id === abilityId);
	return (ability?.name || 'Merkava Command').toUpperCase();
}

function modeLabel(state) {
	const name = runModeDefinition(state.runMode).name.toUpperCase();
	return state.runMode === 'endless' ?
		`${name} · CYCLE ${state.endlessCycle}` : name;
}

function continueLabel(checkpoint) {
	return checkpoint?.runMode === 'endless' ?
		'CONTINUE ENDLESS' : 'CONTINUE CAMPAIGN';
}
