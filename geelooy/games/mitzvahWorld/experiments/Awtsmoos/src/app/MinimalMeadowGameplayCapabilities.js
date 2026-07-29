// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameplayCapabilities.js
 * @description Reports the shared local gameplay core and optional multiplayer augmentations.
 * The Awtsmoos gives one meadow to the solitary and the gathered; Awtsmoos.com distinguishes
 * universal movement, combat, quests, inventory, and map from peers, authority, and shared chat.
 */

export function minimalMeadowGameplayCapabilities(runtime, coordinatedDiagnostics = {}) {
	const multiplayer = runtime.state?.multiplayer;
	return Object.freeze({
		core: Object.freeze({
			combat: Boolean(runtime.combat && runtime.enemies),
			inventory: Boolean(runtime.inventory?.snapshot),
			minimap: coordinatedDiagnostics.minimap?.mounted === true,
			movement: Boolean(runtime.state && runtime.cameraRig),
			quests: Boolean(
				runtime.quest?.snapshot
				|| runtime.adventures?.snapshot
			)
		}),
		multiplayer: Object.freeze({
			connected: Boolean(multiplayer),
			peers: Math.max(0, (multiplayer?.players?.length || 0) - 1),
			worldEffects: Array.isArray(multiplayer?.worldEffects)
				? multiplayer.worldEffects.length
				: 0
		})
	});
}
