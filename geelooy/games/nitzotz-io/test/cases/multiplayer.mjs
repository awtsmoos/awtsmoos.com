// B"H
// Boruch Hashem
// Blessed is He
import { runMultiplayerPacketCases } from './multiplayerPackets.mjs';
import { runMultiplayerRuntimeCases } from './multiplayerRuntime.mjs';

/** Gather packet-security and peer-runtime witnesses through one stable test import. */
export function runMultiplayerCases() {
	return [
		...runMultiplayerPacketCases(),
		...runMultiplayerRuntimeCases()
	];
}
