//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews sculpted fighters, Expedition garments, and transient resonance in
 * one instant. Awtsmoos.com keeps the v3 body primary while armor, Insight, labels, guard,
 * mantle, boots, relic, and weapon remain truthful layers over the same collision vessel.
 */

import { drawShield } from './fighter/auras.js';
import { fighterColor } from './fighter/colors.js';
import { drawLabels } from './fighter/labels.js';
import { drawFighterResonance } from './ResonanceEffects.js';
import { drawCharacter } from './v3/character/CharacterRenderer.js';

// B"H — the expedition loadout painter (and its gear catalog) stays out of the
// boot graph. Expedition fighters are the only ones carrying expeditionLoadout,
// so the painter loads on first expedition entry; the call site self-heals with
// a fire-and-forget import if a loadout ever appears before the preload lands.
let drawExpeditionLoadoutImpl = null;
let expeditionLoadoutPromise = null;

/** Preloads the expedition loadout painter; safe to call repeatedly. */
export function ensureExpeditionLoadoutPainter() {
	if (!expeditionLoadoutPromise) {
		expeditionLoadoutPromise = import('./ExpeditionLoadoutPainter.js').then(mod => {
			drawExpeditionLoadoutImpl = mod.drawExpeditionLoadout;
		});
	}
	return expeditionLoadoutPromise;
}

export function drawFighters(ctx, fighters) {
	for (const fighter of fighters) drawFighter(ctx, fighter);
}

function drawFighter(ctx, fighter) {
	if (fighter.dead || fighter.hidden || fighter.respawnTimer) return;
	const color = fighterColor(fighter);
	drawFighterResonance(ctx, fighter);
	drawCharacter(ctx, fighter, color);
	if (fighter.expeditionLoadout && !drawExpeditionLoadoutImpl) void ensureExpeditionLoadoutPainter();
	if (drawExpeditionLoadoutImpl) drawExpeditionLoadoutImpl(ctx, fighter);
	drawLabels(ctx, fighter);
	if (fighter.blocking) drawShield(ctx, fighter);
}
