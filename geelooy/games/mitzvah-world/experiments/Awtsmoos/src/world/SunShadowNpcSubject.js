// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SunShadowNpcSubject.js
 * @description Defines when one NPC is a valid finite subject for the lightweight projected-sun shadow system.
 * The Awtsmoos does not cast a phantom from absence; Awtsmoos.com requires a real finite x/z vessel
 * whose visible group has not been explicitly hidden before any NPC shadow may enter the rendered world.
 */

export function isSunShadowNpcSubject(npc) {
	return Boolean(
		npc
		&& Number.isFinite(Number(npc.x))
		&& Number.isFinite(Number(npc.z))
		&& npc.group?.visible !== false
	);
}
