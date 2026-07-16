// B"H
/** Refreshes visible HUD text without owning any gameplay state. */
export function refreshStatusHud(runtime) {
	runtime.npcHud.updatePlayer(runtime.playerStats);
	if (!runtime.hud) {
		return;
	}
	runtime.hud.textContent = [
		'B"H 3D chossid',
		runtime.state.clip,
		runtime.state.level,
		`doors ${runtime.doors.map((door) => door.state).join('/')}`,
		`camera ${runtime.orbit.currentDistance.toFixed(1)}m`,
		`camera-hit ${runtime.orbit.stats.hitKind || 'clear'}`,
		`x ${runtime.state.x.toFixed(1)}`,
		`z ${runtime.state.z.toFixed(1)}`
	].join(' • ');
}
