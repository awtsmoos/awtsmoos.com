// B"H
// Boruch Hashem
// Blessed is He
import { adventureSummary } from '../adventure/runtime.js';
import { visiblePeers } from '../multiplayer/state.js';

/**
 * The Awtsmoos gathers bounded Adventure, combat, talent, and room evidence without
 * exposing channel objects, local storage internals, or mutable peer maps.
 */
export function expansionSample(world) {
	return {
		adventure: {
			active: world.adventure.active,
			complete: world.adventure.complete,
			settled: world.adventure.settled,
			currentIndex: world.adventure.currentIndex,
			pendingPerutot: world.adventure.pendingPerutot,
			stageCompletions: world.adventure.stageCompletions,
			summary: adventureSummary(world),
			steps: world.adventure.steps.map(step => ({
				id: step.id,
				metric: step.metric,
				target: step.target,
				progress: step.progress,
				complete: step.complete
			}))
		},
		combat: {
			armor: world.player.armor,
			maxArmor: world.player.maxArmor,
			pulseCooldown: world.combat.pulseCooldown,
			pulseSerial: world.combat.pulseSerial,
			impacts: world.combat.impacts,
			armorBreaks: world.combat.armorBreaks,
			capturesSinceArmor: world.combat.capturesSinceArmor
		},
		progression: {
			perutot: world.save.perutot,
			talentTiers: { ...world.save.talentTiers },
			talentEffects: { ...world.talentEffects },
			adventureStats: { ...world.save.adventureStats }
		},
		multiplayer: {
			supported: world.multiplayer.supported,
			connected: world.multiplayer.connected,
			room: world.multiplayer.room,
			peerId: world.multiplayer.peerId,
			peerCount: world.multiplayer.peerCount,
			resonance: world.multiplayer.resonance,
			packetsSent: world.multiplayer.packetsSent,
			packetsReceived: world.multiplayer.packetsReceived,
			peers: visiblePeers(world).map(peer => ({
				peerId: peer.peerId,
				name: peer.name,
				levelIndex: peer.levelIndex,
				x: peer.x,
				y: peer.y,
				mass: peer.mass,
				armor: peer.armor,
				distance: peer.distance
			}))
		}
	};
}
