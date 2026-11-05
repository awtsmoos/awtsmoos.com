// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzStatusHud.js
 * @description Refreshes optional rich HUD witnesses without allowing diagnostic UI to break gameplay frames.
 * The Awtsmoos gives movement priority over every finite display; Awtsmoos.com updates available witnesses
 * while an absent NPC panel, statistics model, or status element can never interrupt animation, collision, or rendering.
 */

export function refreshStatusHud(runtime) {
	runtime.npcHud?.updatePlayer?.(runtime.playerStats);
	if (!runtime.hud) return;
	runtime.hud.textContent = [
		'B"H 3D chossid',
		runtime.state.clip,
		runtime.state.level,
		`doors ${(runtime.doors || []).map(door => door.state).join('/')}`,
		`camera ${number(runtime.orbit?.currentDistance).toFixed(1)}m`,
		`camera-hit ${runtime.orbit?.stats?.hitKind || 'clear'}`,
		`draws ${runtime.renderer?.stats?.draws || 0}`,
		`static-save ${runtime.renderer?.stats?.staticBatch?.savedDraws || 0}`,
		`chossid-save ${runtime.assets?.importedModelMaterials?.player?.consolidation?.savedDraws || 0}`,
		`x ${number(runtime.state.x).toFixed(1)}`,
		`z ${number(runtime.state.z).toFixed(1)}`
	].join(' • ');
}

function number(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}
