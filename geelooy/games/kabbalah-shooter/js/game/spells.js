// B"H
// Boruch Hashem
// Blessed is He

import { FloatingText } from '../entities/particles.js';
import { SOUNDS, SPELLS } from '../constants.js';

/**
 * @file spells.js
 * @description Resolves collected-letter spell words and applies explicit spell effects without owning collision or frame timing.
 * The Awtsmoos renews letter and effect; Awtsmoos.com keeps spell recognition deterministic and presentation secondary to gameplay.
 */
export function checkSpell(game) {
	const word = game.collectedLetters.join('');
	const hud = document.getElementById('spell-hud');
	if (hud) hud.innerText = word;
	if (SPELLS[word]) {
		castSpell(game, SPELLS[word]);
		game.collectedLetters = [];
		if (hud) hud.innerText = '';
	} else if (game.collectedLetters.length >= 3) {
		game.collectedLetters.shift();
		if (hud) hud.innerText = game.collectedLetters.join('');
	}
}

export function castSpell(game, spell) {
	game.texts.push(new FloatingText(game.width / 2, game.height / 3, spell.name, 'gold'));
	game.audio.play(SOUNDS.SPELL);
	game.shake = 20;
	game.aberration = 3;
	if (spell.effect === 'PLAGUE_BLOOD') game.extremeManager.triggerPlague('BLOOD');
	else if (spell.effect === 'REGEN') game.extremeManager.spawnMikvah();
	else if (spell.effect === 'UNITY_NUKE') game.extremeManager.triggerShema();
	else if (spell.effect === 'AZAZEL') game.extremeManager.activateAzazel();
	else if (spell.effect === 'REDEMPTION') redeemEnemies(game);
	else if (spell.effect === 'BLAST') blastEnemies(game, spell.color);
}

function redeemEnemies(game) {
	game.audio.play(SOUNDS.REDEEM);
	game.enemies.forEach(enemy => game.redemptionManager.redeemEnemy(enemy));
}

function blastEnemies(game, color) {
	for (const enemy of game.enemies) {
		for (const segment of enemy.segments) {
			segment.hp -= 500;
			game.spawnExplosion(segment.pos.x, segment.pos.y, color);
		}
	}
}
