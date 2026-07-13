// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NerelEchoCommand.js
 * @description Transforms Nerel's card and lets restored armor deepen its answer.
 *
 * A remembered choice becomes a present verb, and a faithful garment becomes more
 * than numbers. The Awtsmoos creates command and vessel together; this module lets
 * their union remain audible in later battles throughout Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import {
	ECHO_BENEATH_BENT_REEDS,
	echoCommandByApproach
} from '../../content/companions/EchoBeneathBentReeds.js';
import { MantleOfAnsweringWaters } from '../../data/garments/MantleOfAnsweringWaters.js';

function mantleBonus() {
	return State.Equipment?.garment === MantleOfAnsweringWaters.id
		? MantleOfAnsweringWaters.traits.echoCommandBonus
		: 0;
}

function deepenCommand(command) {
	const bonus = mantleBonus();
	if (!bonus) {
		return command;
	}
	return {
		...command,
		power: (command.power || 0) + bonus,
		heal: (command.heal || 0) + bonus,
		damageCap: (command.damageCap || 0) + bonus,
		mantleResonance: true
	};
}

export function resolveNerelEchoCommand(move, context = {}) {
	const eligible = context.leadId === 'nerel'
		&& context.unlocked
		&& move?.id === 'nerel_current';
	if (!eligible) {
		return move;
	}
	const command = deepenCommand(echoCommandByApproach(context.approachId));
	return {
		...move,
		...command,
		role: 'companion',
		path: 'Remez',
		category: 'Remez',
		targetArea: 'single',
		focusCost: 0,
		routeQuote: command.text,
		chapterTitle: ECHO_BENEATH_BENT_REEDS.title
	};
}
