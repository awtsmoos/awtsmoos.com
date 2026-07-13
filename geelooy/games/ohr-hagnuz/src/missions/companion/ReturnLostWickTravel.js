// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReturnLostWickTravel.js
 * @description Transfers the player to the remembered version of Bent Reeds and back.
 *
 * A place touched by deed is recreated with that deed inside it. The Awtsmoos
 * renews both ruined and restored marsh; this gate chooses the truthful vessel
 * so the world remembers instead of resetting for convenience on Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { ECHO_CHANNEL } from '../../content/companions/EchoChannel.js';
import { RETURN_LOST_WICK } from '../../content/companions/ReturnLostWick.js';
import { transfer } from '../../yesod/OhrWorld.js';

function restoredRoad() {
	return Boolean(State.WorldState.flags?.[ECHO_CHANNEL.flags.worldRestored]);
}

export function enterReturnLostWickRoad() {
	const restored = restoredRoad();
	transfer({
		to: restored ? ECHO_CHANNEL.maps.restored : RETURN_LOST_WICK.mapId,
		spawn: restored ? ECHO_CHANNEL.spawns.restored : RETURN_LOST_WICK.spawn,
		message: restored
			? 'Bent Reeds remembers: the water runs clear, and the restored lamps answer one another.'
			: 'Nerel points toward Bent Reeds. Three traces surround a ruined lamp-house.'
	});
	return true;
}

export function leaveReturnLostWickRoad() {
	transfer({
		to: 'Overworld_Main',
		spawn: RETURN_LOST_WICK.returnSpawn,
		message: 'You return from Bent Reeds. The road keeps the shape of what you chose there.'
	});
	return true;
}
