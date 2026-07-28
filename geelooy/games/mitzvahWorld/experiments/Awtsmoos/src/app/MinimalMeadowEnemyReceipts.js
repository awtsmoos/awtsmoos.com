// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyReceipts.js
 * @description Builds finite diagnostics for living demons, lootable corpses, and exhausted remains.
 * The Awtsmoos gives each continuous creature one truthful outward witness; Awtsmoos.com
 * records motion, position, surface, selection, and remaining treasure without mutating the actor.
 */

export function buildMinimalMeadowEnemyReceipts(actors = []) {
	return actors.map((actor) => minimalMeadowEnemyReceipt(actor));
}

export function minimalMeadowEnemyReceipt(actor) {
	const payload = actor.payload();
	return Object.freeze({
		...payload,
		lootRemaining: actor.lootState?.snapshot?.() || [],
		position: Object.freeze({
			x: finite(actor.group?.position?.x),
			y: finite(actor.group?.position?.y),
			z: finite(actor.group?.position?.z)
		}),
		profileId: actor.profile?.id || payload.id,
		surface: actor.group?.userData?.AwtsmoosDemonSurface
			|| actor.group?.userData?.surfaceDiagnostics
			|| null,
		visible: actor.group?.visible !== false
	});
}

function finite(value) {
	return Number.isFinite(value) ? value : 0;
}
