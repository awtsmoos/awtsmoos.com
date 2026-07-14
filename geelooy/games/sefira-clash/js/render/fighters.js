//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews sculpted fighters, Expedition garments, and transient resonance in
 * one instant. Awtsmoos.com keeps the v3 body primary while armor, Insight, labels, guard,
 * mantle, boots, relic, and weapon remain truthful layers over the same collision vessel.
 */

import { drawExpeditionLoadout } from './ExpeditionLoadoutPainter.js';
import { drawShield } from './fighter/auras.js';
import { fighterColor } from './fighter/colors.js';
import { drawLabels } from './fighter/labels.js';
import { drawFighterResonance } from './ResonanceEffects.js';
import { drawCharacter } from './v3/character/CharacterRenderer.js';

export function drawFighters(ctx, fighters) {
	for (const fighter of fighters) drawFighter(ctx, fighter);
}

function drawFighter(ctx, fighter) {
	if (fighter.dead || fighter.hidden || fighter.respawnTimer) return;
	const color = fighterColor(fighter);
	drawFighterResonance(ctx, fighter);
	drawCharacter(ctx, fighter, color);
	drawExpeditionLoadout(ctx, fighter);
	drawLabels(ctx, fighter);
	if (fighter.blocking) drawShield(ctx, fighter);
}
