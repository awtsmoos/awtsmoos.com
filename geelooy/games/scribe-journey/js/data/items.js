// B"H
// Boruch Hashem
// Blessed is He

import { artifacts } from './items/artifacts.js';
import { campaignItems } from './items/campaign_items.js';
import { clothing } from './items/clothing.js';
import { consumables } from './items/consumables.js';
import { digitalItems } from './items/digital_items.js';
import { eats33 } from './items/eats_33.js';
import { expansionItems } from './items/expansion_items.js';
import { foodItems } from './items/food_items.js';
import { ganEdenItems } from './items/gan_eden_items.js';
import { gehinnomItems } from './items/gehinnom_items.js';
import { holidayItems } from './items/holiday_items.js';
import { ingredients } from './items/ingredients.js';
import { judaicaItems } from './items/judaica_items.js';
import { kelim } from './items/kelim.js';
import { libraryItems } from './items/library_items.js';
import { maamarItems } from './items/maamar_items.js';
import { midbarItems } from './items/midbar_items.js';
import { mivtzoimItems } from './items/mivtzoim_items.js';
import { questItems } from './items/quest_items.js';
import { sechirutItems } from './items/sechirut_items.js';
import { sparksOfTohu } from './items/sparks_tohu.js';
import { systemItems } from './items/system_items.js';
import { tanyaItems } from './items/tanya_items.js';
import { taryagItems } from './items/taryag_items.js';
import { tomes } from './items/tomes.js';
import { tribeItems } from './items/tribe_items.js';
import { yudTetItems } from './items/yud_tet_items.js';
import { sparksList } from './library/sparks.js';
import { chanukahItems } from './chanukah_massive.js';
import { features555Items } from './expansion_555.js';
import { gateItems } from './gates_features.js';
import { insanityItems } from './insanity_expansion.js';
import { labyrinthItems } from './labyrinth_67.js';

const renewedChanukahItems = {
	...chanukahItems,
	pure_oil: {
		id: 'pure_oil',
		name: 'Pure Olive Oil',
		desc: 'Crushed for the light. Restores 300 Light Points and cures Hellenization.',
		type: 'consumable',
		effect: { type: 'restore_light', amount: 300, cure: 'hellenized' },
		sellValue: 100
	}
};

/** Immutable item definitions gather here; saves preserve quantities, not universes. */
export const items = Object.freeze({
	...consumables,
	...kelim,
	...tomes,
	...questItems,
	...artifacts,
	...holidayItems,
	...sechirutItems,
	...yudTetItems,
	...maamarItems,
	...tanyaItems,
	...tribeItems,
	...libraryItems,
	...mivtzoimItems,
	...ganEdenItems,
	...gehinnomItems,
	...foodItems,
	...judaicaItems,
	...midbarItems,
	...expansionItems,
	...systemItems,
	...taryagItems,
	...sparksList,
	...clothing,
	...ingredients,
	...sparksOfTohu,
	...insanityItems,
	...gateItems,
	...renewedChanukahItems,
	...labyrinthItems,
	...features555Items,
	...digitalItems,
	...eats33,
	...campaignItems
});
