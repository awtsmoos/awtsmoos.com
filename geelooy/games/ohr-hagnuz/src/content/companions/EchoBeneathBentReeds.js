// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EchoBeneathBentReeds.js
 * @description Names the chapter, durable flags, and three approach-shaped Nerel commands.
 *
 * One restored flame answers three honest forms of service. The Awtsmoos renews
 * shelter, resolve, and harmony without flattening their gifts; this small ark
 * keeps each command distinct on the living roads of Awtsmoos.com.
 */

const COMMANDS = Object.freeze({
	compassion: Object.freeze({
		id: 'nerel_echo_compassion',
		name: 'Sheltering Current',
		power: 6,
		damageCap: 6,
		heal: 14,
		guardStrength: 0.42,
		statusEffect: 'interrupt',
		text: 'Nerel shelters the wick, interrupts gathering force, and restores courage.'
	}),
	resolve: Object.freeze({
		id: 'nerel_echo_resolve',
		name: 'Wick-Cutting Current',
		power: 16,
		damageCap: 16,
		heal: 2,
		statusEffect: 'interrupt',
		text: 'Nerel cuts the false current at its root before the pressure can gather.'
	}),
	resonance: Object.freeze({
		id: 'nerel_echo_resonance',
		name: 'Answering Current',
		power: 12,
		damageCap: 12,
		heal: 9,
		statusEffect: 'interrupt',
		text: 'Nerel answers the hidden rhythm with clarity, healing, and interruption.'
	})
});

export const ECHO_BENEATH_BENT_REEDS = Object.freeze({
	id: 'echo_beneath_bent_reeds',
	title: 'The Echo Beneath Bent Reeds',
	mapId: 'Bent_Reeds_LampHouse',
	encounterId: 'bentReedsVeilKeeper',
	encounterMarker: 'echoBeneathBentReeds',
	abilityId: 'nerel-echo-command',
	flags: Object.freeze({
		discovered: 'bentReedsEchoDiscovered',
		resolved: 'bentReedsEchoResolved'
	}),
	commands: COMMANDS
});

export function echoCommandByApproach(approachId) {
	return COMMANDS[approachId] || COMMANDS.compassion;
}
