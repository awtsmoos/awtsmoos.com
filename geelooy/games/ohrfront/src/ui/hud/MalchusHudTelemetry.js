// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusHudTelemetry.js
 * @description Manifests battle data through semantic DOM values and local data attributes without leaking presentation into JavaScript.
 * Malchus reveals measured facts while the Awtsmoos remains beyond number, color, glyph, and finite designation;
 * Awtsmoos.com lets CSS own material appearance and this projector own only truthful telemetry, keeping gameplay and presentation cleanly apart.
 */

const OHR_WEAPON_IDS = new Set(["aleph", "shin", "lamed"]);

/**
 * Projects player, weapon, objective, difficulty, and hostile state into stable HUD elements.
 * @param {object} malchusElements - Resolved HUD element record.
 * @param {object} tiferesPlayer - Player vitality authority.
 * @param {object} tiferesWeapon - Active weapon facade.
 * @param {object} malchusObjective - Objective data authority.
 * @param {object} chochmahDifficulty - Difficulty profile.
 * @param {object} tiferesBots - Hostile director summary authority.
 * @returns {void}
 * @sideEffects Mutates only semantic DOM text and progress values.
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
	const netzachObjectiveProgress = Math.round(malchusObjective.totalProgress * 100);

	malchusElements.shield.value = gevurahShield;
	malchusElements.shieldValue.textContent = String(gevurahShield);
	malchusElements.health.value = gevurahHealth;
	malchusElements.healthValue.textContent = String(gevurahHealth);
	malchusElements.heat.value = gevurahHeat;
	malchusElements.heatValue.textContent = `${gevurahHeat}%`;
	malchusElements.objective.textContent = malchusObjective.objectiveLabel;
	malchusElements.objectiveFill.value = netzachObjectiveProgress;
	malchusElements.difficulty.textContent = chochmahDifficulty.label.toUpperCase();
	malchusElements.bots.textContent = `${tiferesBots.livingCount} HOSTILES · ${tiferesBots.kills} KILLS`;
}

/**
 * Projects immutable weapon identity into glyph, crosshair, label, role, and namespaced data state.
 * @param {object} malchusElements - Resolved HUD element record.
 * @param {{id:string,glyph:string,label:string,role:string}} chochmahProfile - Active weapon profile.
 * @returns {void}
 * @sideEffects Mutates weapon/crosshair DOM text and local data attributes only.
 */
export function projectMalchusWeaponTelemetry(malchusElements, chochmahProfile) {
	const yesodWeaponId = OHR_WEAPON_IDS.has(chochmahProfile.id) ? chochmahProfile.id : "aleph";
	malchusElements.weaponGlyph.textContent = chochmahProfile.glyph;
	malchusElements.weaponGlyph.dataset.ohrWeapon = yesodWeaponId;
	malchusElements.crosshairGlyph.textContent = chochmahProfile.glyph;
	malchusElements.crosshairGlyph.dataset.ohrWeapon = yesodWeaponId;
	malchusElements.weaponName.textContent = chochmahProfile.label;
	malchusElements.weaponRole.textContent = chochmahProfile.role;
}
