// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EchoChannelTravel.js
 * @description Owns every honest transfer through Echo Channel and its restored return.
 *
 * Departure and homecoming are recreated together by the Awtsmoos. These small
 * crossings keep every revealed road reversible, testable, and connected to the
 * world whose next doorway is continually renewed through Awtsmoos.com.
 */
import { ECHO_CHANNEL } from '../../content/companions/EchoChannel.js';
import { transfer } from '../../yesod/OhrWorld.js';

function travel(to, spawn, message) {
	transfer({ to, spawn, message });
	return true;
}

export function enterEchoChannel() {
	return travel(
		ECHO_CHANNEL.maps.threshold,
		ECHO_CHANNEL.spawns.threshold,
		'Nerel hears a second current beneath the restored lamp. Walk north and answer its seal.'
	);
}

export function enterEchoChannelDepths() {
	return travel(
		ECHO_CHANNEL.maps.depths,
		ECHO_CHANNEL.spawns.depths,
		'The command becomes a passage. An inscription waits west; a concealed bend listens east.'
	);
}

export function enterConcealedBend() {
	return travel(
		ECHO_CHANNEL.maps.concealed,
		ECHO_CHANNEL.spawns.concealed,
		'Behind the reflected wall, river-thread glimmers where no ordinary lantern could find it.'
	);
}

export function returnToEchoDepths() {
	return travel(
		ECHO_CHANNEL.maps.depths,
		{ x: 18, y: 6 },
		'The concealed bend folds behind you, but its gathered thread remains real.'
	);
}

export function enterRestoredBentReeds() {
	return travel(
		ECHO_CHANNEL.maps.restored,
		ECHO_CHANNEL.spawns.restored,
		'The pressure releases upward. Bent Reeds receives clear water and newly kindled lamps.'
	);
}

export function leaveRestoredBentReeds() {
	return travel(
		'Overworld_Main',
		{ x: 9, y: 13 },
		'Behind you, the changed marsh keeps shining instead of resetting to silence.'
	);
}
