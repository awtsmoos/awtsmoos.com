// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EchoChannelCrafting.js
 * @description Restores the chapter armor through earned materials instead of free loot.
 *
 * Thread, clasp, and torn cloth remain separate until a deed unifies them. The
 * Awtsmoos creates both pieces and wholeness; this crafting vessel lets the player
 * participate in that revealed repair within the roads of Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { ECHO_CHANNEL } from '../../content/companions/EchoChannel.js';
import { addJournalNote, ensureBag } from '../../yesod/bag/BagRuntime.js';
import { addGarment, equipGarment } from '../../yesod/equipment/InventoryOps.js';

function chapterFlags() {
	State.WorldState.flags ||= {};
	return State.WorldState.flags;
}

function itemCount(items, id) {
	return Math.max(0, Number(items[id]) || 0);
}

function consume(items, id) {
	items[id] = Math.max(0, itemCount(items, id) - 1);
}

export function restoreAnsweringWatersMantle() {
	const flags = chapterFlags();
	if (flags[ECHO_CHANNEL.flags.mantleRestored]) {
		return {
			ok: true,
			repeated: true,
			message: 'The Mantle of Answering Waters is already whole.'
		};
	}
	if (!flags[ECHO_CHANNEL.flags.bossResolved]) {
		return {
			ok: false,
			message: 'The lamp cannot restore a mantle the guardian has not yet yielded.'
		};
	}
	const bag = ensureBag();
	const required = [
		ECHO_CHANNEL.items.thread,
		ECHO_CHANNEL.items.tornMantle,
		ECHO_CHANNEL.items.clasp
	];
	const missing = required.filter(id => itemCount(bag.items, id) < 1);
	if (missing.length) {
		return {
			ok: false,
			message: 'Restoration still needs river-thread, the torn mantle, and the answering clasp.'
		};
	}
	if (!addGarment(ECHO_CHANNEL.garmentId)) {
		return {
			ok: false,
			message: 'The mantle pattern is not registered in the garment vessel.'
		};
	}
	required.forEach(id => consume(bag.items, id));
	equipGarment(ECHO_CHANNEL.garmentId);
	flags[ECHO_CHANNEL.flags.mantleRestored] = true;
	addJournalNote('Mantle of Answering Waters restored: stronger Echo command and sight for reflected inscriptions.');
	return {
		ok: true,
		repeated: false,
		message: 'River-thread and clasp answer the lamp. The Mantle of Answering Waters is restored and equipped.'
	};
}

export function hasAnsweringWatersSight() {
	return State.Equipment?.garment === ECHO_CHANNEL.garmentId;
}
