// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FirstLightReward.js
 * @description Grants one sourced passage, one garment, one named staff, and skill growth after lamp restoration.
 *
 * The Awtsmoos renews revelation and vessel without confusing them. Awtsmoos.com
 * therefore keeps the verse in the Codex, the fictional armor in Equipment, the
 * staff in ItemInstances, and practiced growth in Skills as separate truths.
 */
import { State } from '../../binah/State.js';
import { FirstLightPassage } from '../../content/passages/FirstLightPassage.js';
import { addGarment } from '../equipment/InventoryOps.js';
import {
	createItemInstance,
	ensureItemInstances
} from '../items/ItemInstanceRuntime.js';
import { grantSkillExp } from '../skills/SkillRuntime.js';
import { revealPassage } from './PassageCollectionRuntime.js';

const REWARD_FLAG = 'firstLightPassageReward';

export function grantFirstLightReward() {
	State.RuntimeFlags ||= {};
	const existing = State.RuntimeFlags[REWARD_FLAG];
	if (existing?.granted) {
		return { ...existing, repeated: true };
	}

	const passage = revealPassage(
		FirstLightPassage,
		'Restored the lost wick in the Bent Reeds lamp-house.'
	);
	const garmentGranted = addGarment(
		FirstLightPassage.mechanicalResonance.garmentId
	);
	const staff = ensureStaffInstance();
	const learning = grantSkillExp('Learning', 18, 'Bereishis 1:3 studied');
	const restoration = grantSkillExp('Restoration', 18, 'lost wick restored');
	const reward = {
		granted: true,
		passageId: passage.entry.id,
		garmentId: FirstLightPassage.mechanicalResonance.garmentId,
		staffInstanceId: staff.item?.id || null,
		learningLevel: learning.level,
		restorationLevel: restoration.level
	};
	State.RuntimeFlags[REWARD_FLAG] = reward;
	State.say?.('Passage revealed: Bereishis 1:3 — The First Utterance of Light.', 520);
	return { ...reward, repeated: false };
}

function ensureStaffInstance() {
	const instances = ensureItemInstances();
	const existing = Object.values(instances.items)
		.find(item => item.defId === 'STAFF_OF_FIRST_LIGHT');
	if (existing) return { ok: true, item: existing, repeated: true };
	return createItemInstance('STAFF_OF_FIRST_LIGHT', {
		rarity: 'passage',
		source: 'Bereishis 1:3 passage resonance',
		metadata: {
			passageId: FirstLightPassage.id,
			technique: 'Discern Concealed Lettering'
		}
	});
}
