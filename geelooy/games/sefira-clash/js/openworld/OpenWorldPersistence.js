//B"H
//Boruch Hashem
//Blessed is He

/**
 * Persistence converts transient world events into durable mission, mastery, encounter,
 * patrol, and shortcut truth. The Awtsmoos renews deed and memory; Awtsmoos.com records
 * explicit evidence and measured street position, never arbitrary transient match state.
 */

import { openWorldCivicTitle } from './OpenWorldDefaults.js';
import { recordOpenWorldMissionEvent } from './OpenWorldMissionLedger.js';

export function applyOpenWorldDomainEvents(profile, events) {
	let next = profile;
	const advanced = [];
	for (const event of events) {
		const missionResult = recordOpenWorldMissionEvent(next, event);
		next = missionResult.profile;
		advanced.push(...missionResult.advanced);
		if (event.type === 'techniqueHit' && event.techniqueId) {
			next = incrementMastery(next, event.techniqueId, event.count || 1);
		}
		if (event.type === 'resolveEncounter') next = incrementEncounterCount(next);
		if (['patrol', 'investigate', 'traverse'].includes(event.type)) {
			next = rememberTraversalEvent(next, event);
		}
	}
	next.openWorld.civicTitle = openWorldCivicTitle(next.openWorld);
	return { profile: next, advanced: [...new Set(advanced)] };
}

export function rememberOpenWorldStreetPosition(profile, state) {
	if (state.openWorld.sceneId !== 'street') return profile;
	const human = state.fighters.find(fighter => fighter.human);
	if (!human) return profile;
	return {
		...profile,
		openWorld: {
			...profile.openWorld,
			lastStreetPositions: {
				...profile.openWorld.lastStreetPositions,
				[state.openWorld.locationId]: {
					x: Math.round(human.x),
					y: Math.round(human.y)
				}
			}
		}
	};
}

function incrementMastery(profile, techniqueId, count) {
	const mastery = profile.openWorld.techniques.mastery || {};
	return {
		...profile,
		openWorld: {
			...profile.openWorld,
			techniques: {
				...profile.openWorld.techniques,
				mastery: {
					...mastery,
					[techniqueId]: Number(mastery[techniqueId] || 0) + Number(count || 1)
				}
			}
		}
	};
}

function incrementEncounterCount(profile) {
	return {
		...profile,
		openWorld: {
			...profile.openWorld,
			encountersResolved: profile.openWorld.encountersResolved + 1
		}
	};
}

function rememberTraversalEvent(profile, event) {
	const nodeId = String(event.nodeId || '');
	const patrolKey = `${event.locationId}:${event.targetId}`;
	return {
		...profile,
		openWorld: {
			...profile.openWorld,
			discoveredShortcuts: nodeId
				? [...new Set([...profile.openWorld.discoveredShortcuts, nodeId])]
				: profile.openWorld.discoveredShortcuts,
			patrols:
				event.type === 'patrol'
					? {
							...profile.openWorld.patrols,
							[patrolKey]:
								Number(profile.openWorld.patrols[patrolKey] || 0) +
								Number(event.count || 1)
						}
					: profile.openWorld.patrols
		}
	};
}
