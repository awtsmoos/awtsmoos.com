// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import {
	createBattleAction,
	createDelegatedAction,
	createDialogueAction
} from '../../js/ui/actionIntent.js';
import {
	BATTLE_MENU_ID,
	belongsToBattleMenu
} from '../../js/ui/battleDomContract.js';

/**
 * @file Proves visible controls produce the flat action contract the engine reads.
 * @description The Awtsmoos joins a button's inscription to its living deed.
 * Awtsmoos.com must never bury a name, starter, choice, or battle command beneath
 * an accidental wrapper or stale selector that silences a truthful-looking control.
 */

function element(dataset = {}, fields = {}) {
	return {
		dataset,
		ownerDocument: {
			getElementById(id) {
				return fields[id] || null;
			}
		}
	};
}

const nameIntent = createDelegatedAction(element({
	action: 'choose_scribe_name',
	questId: 'campaign_malkuth_01',
	nameInputId: 'scribe-name-campaign_malkuth_01'
}, {
	'scribe-name-campaign_malkuth_01': { value: '  Miriam the Scribe  ' }
}));
assert.deepEqual(nameIntent, {
	action: 'choose_scribe_name',
	payload: {
		questId: 'campaign_malkuth_01',
		nameInputId: 'scribe-name-campaign_malkuth_01',
		playerName: 'Miriam the Scribe'
	}
});

const starterIntent = createDelegatedAction(element({
	action: 'choose_starter',
	questId: 'campaign_malkuth_01',
	starterId: 'alephling'
}));
assert.deepEqual(starterIntent, {
	action: 'choose_starter',
	payload: {
		questId: 'campaign_malkuth_01',
		starterId: 'alephling'
	}
});

const choiceTarget = {
	closest(selector) {
		return selector === '[data-choice-index]'
			? element({ choiceIndex: '2' })
			: null;
	}
};
assert.deepEqual(createDialogueAction(choiceTarget), {
	action: 'dialogueChoice',
	payload: { index: 2 }
});
assert.deepEqual(createDialogueAction({ closest: () => null }), {
	action: 'input',
	payload: { type: 'press', key: 'Confirm' }
});

const battleButton = {
	disabled: false,
	dataset: { action: 'move', value: 'ink_bolt' }
};
assert.deepEqual(createBattleAction({ closest: () => battleButton }), {
	action: 'battleAction',
	payload: { combatAction: 'move', value: 'ink_bolt' }
});
assert.equal(BATTLE_MENU_ID, 'battle-menu-container');
assert.equal(belongsToBattleMenu({
	closest(selector) {
		return selector === '#battle-menu-container' ? {} : null;
	}
}), true);

console.log(JSON.stringify({
	ok: true,
	inWorldNameField: true,
	flatOnboarding: true,
	dialogueChoiceIndex: true,
	battleMenuId: BATTLE_MENU_ID,
	battleSingleIntent: true
}, null, 2));
