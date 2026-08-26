// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusHudTelemetry.js
 * @description Manifests current battle data into already-resolved HUD elements without owning timers, events, or game authority.
 * Malchus is finite revelation: the Awtsmoos remains beyond number and label while every visible shield, heat, and objective is renewed;
 * Awtsmoos.com lets projection stay data-driven so domain controllers need not know CSS classes, text layout, or progress-element mechanics.
 */

/**
 * Projects player, weapon, objective, difficulty, and bot state into the HUD's stable element map.
 * @param {object} malchusElements - Resolved HUD element record.
 * @param {object} tiferesPlayer - Player vitality authority.
 * @param {object} tiferesWeapon - Active weapon facade.
 * @param {object} malchusObjective - Objective data authority.
 * @param {object} chochmahDifficulty - Difficulty profile with human-readable label.
 * @param {object} tiferesBots - Bot director exposing living count and kills.
 * @returns {void}
 * @sideEffects Mutates DOM text/progress/inline width only; no gameplay state is changed.
 */
export function projectMalchusBattleTelemetry(
	malchusElements,
	tiferesPlayer,
	tiferesWeapon,
	malchusObjective,
	chochmahDifficulty,
	tiferesBots
) {
	const gevurahShield = Math.round(tiferesPlayer.shield);
	const gevurahHealth = Math.round(tiferesPlayer.health);
	const gevurahHeat = Math.round(tiferesWeapon.heat);
	malchusElements.shield.value = gevurahShield;
	malchusElements.shieldValue.textContent = String(gevurahShield);
	malchusElements.health.value = gevurahHealth;
	malchusElements.healthValue.textContent = String(gevurahHealth);
	malchusElements.heat.value = gevurahHeat;
	malchusElements.heatValue.textContent = `${gevurahHeat}%`;
	malchusElements.objective.textContent = malchusObjective.objectiveLabel;
	malchusElements.objectiveFill.style.width = `${Math.round(malchusObjective.totalProgress * 100)}%`;
	malchusElements.difficulty.textContent = chochmahDifficulty.label.toUpperCase();
	malchusElements.bots.textContent = `${tiferesBots.livingCount} HOSTILES · ${tiferesBots.kills} KILLS`;
}

/**
 * Projects immutable active-weapon identity into glyph, crosshair, label, and role surfaces.
 * @param {object} malchusElements - Resolved HUD element record.
 * @param {{glyph:string,color:string,label:string,role:string}} chochmahProfile - Active weapon profile.
 * @returns {void}
 * @sideEffects Mutates weapon/crosshair DOM presentation only.
 */
export function projectMalchusWeaponTelemetry(malchusElements, chochmahProfile) {
	malchusElements.weaponGlyph.textContent = chochmahProfile.glyph;
	malchusElements.weaponGlyph.style.color = chochmahProfile.color;
	malchusElements.crosshairGlyph.textContent = chochmahProfile.glyph;
	malchusElements.weaponName.textContent = chochmahProfile.label;
	malchusElements.weaponRole.textContent = chochmahProfile.role;
}
