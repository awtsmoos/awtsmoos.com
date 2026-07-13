// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EchoChannelRuntime.js
 * @description Conducts chapter actions across four static maps without hidden mutation.
 *
 * The Awtsmoos joins many vessels without confusing their boundaries. This
 * conductor keeps threshold, depths, concealed bend, and restored marsh modular
 * while one player journey flows through them on Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { ECHO_CHANNEL } from '../../content/companions/EchoChannel.js';
import { handleEchoChannelConcealedBend, handleEchoChannelDepths } from './EchoChannelDepths.js';
import { handleRestoredBentReeds } from './EchoChannelRestored.js';
import { handleEchoChannelThreshold } from './EchoChannelThreshold.js';

const MAP_HANDLERS = Object.freeze({
	[ECHO_CHANNEL.maps.threshold]: handleEchoChannelThreshold,
	[ECHO_CHANNEL.maps.depths]: handleEchoChannelDepths,
	[ECHO_CHANNEL.maps.concealed]: handleEchoChannelConcealedBend,
	[ECHO_CHANNEL.maps.restored]: handleRestoredBentReeds
});

export function handleEchoChannelAction(front = {}) {
	const handler = MAP_HANDLERS[State.MapId];
	return handler ? handler(front) : false;
}
