// B"H

function nightVisitors(state, encounters) {
	const minutes = state.time?.totalMinutes ?? 720;
	if (minutes >= 360 && minutes < 1080) return encounters;
	return [
		...encounters,
		{ id: 'thief_in_night', levelRange: [20, 30], chance: 0.1 },
		{ id: 'darkness_creeper', levelRange: [25, 35], chance: 0.08 }
	];
}

/**
 * Lets hidden creatures answer only after a completed footstep. The roll is
 * bounded and malformed encounter records are ignored rather than crashing.
 */
export function checkEncounter(state, trigger) {
	const player = state.player;
	const map = state.maps?.[state.currentMapId];
	const tile = map?.baseLayer?.[player.y]?.[player.x];
	const configured = map?.encounters?.[tile];
	if (!Array.isArray(configured) || Math.random() >= 0.25) return false;

	const roll = Math.random();
	let accumulatedChance = 0;
	for (const encounter of nightVisitors(state, configured)) {
		if (!encounter?.id || !Array.isArray(encounter.levelRange)) continue;
		accumulatedChance += Number(encounter.chance) || 0;
		if (roll >= accumulatedChance) continue;
		const [minimum, maximum] = encounter.levelRange;
		const level = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
		trigger.startBattle([{ id: encounter.id, level }]);
		return true;
	}
	return false;
}
