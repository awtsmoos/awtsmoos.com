
// B"H
// js/data/items.js
import { consumables } from './items/consumables.js';
import { kelim } from './items/kelim.js';
import { tomes } from './items/tomes.js';
import { questItems } from './items/quest_items.js';
import { artifacts } from './items/artifacts.js';
import { holidayItems } from './items/holiday_items.js';
import { sechirutItems } from './items/sechirut_items.js';
import { yudTetItems } from './items/yud_tet_items.js';
import { maamarItems } from './items/maamar_items.js';
import { tanyaItems } from './items/tanya_items.js';
import { tribeItems } from './items/tribe_items.js';
import { libraryItems } from './items/library_items.js';
import { mivtzoimItems } from './items/mivtzoim_items.js';
import { ganEdenItems } from './items/gan_eden_items.js';
import { gehinnomItems } from './items/gehinnom_items.js';
import { foodItems } from './items/food_items.js';
import { judaicaItems } from './items/judaica_items.js';
import { midbarItems } from './items/midbar_items.js';
import { expansionItems } from './items/expansion_items.js';
import { taryagItems } from './items/taryag_items.js';
import { sparksList } from './library/sparks.js';
import { clothing } from './items/clothing.js';
import { ingredients } from './items/ingredients.js';
import { insanityItems } from './insanity_expansion.js';
import { gateItems } from './gates_features.js';
import { chanukahItems } from './chanukah_massive.js';
import { labyrinthItems } from './labyrinth_67.js';
import { features555Items } from './expansion_555.js';
import { digitalItems } from './items/digital_items.js';
import { eats33 } from './items/eats_33.js';

// Farming & Utility
const systemItems = {
    'wheat_seeds': { id: 'wheat_seeds', name: 'Wheat Seeds', desc: 'Plant in soil to grow.', type: 'key_item', sellValue: 5 },
    'wheat_bundle': { id: 'wheat_bundle', name: 'Wheat Bundle', desc: 'Raw grain.', type: 'key_item', sellValue: 10 },
    'flour_sack': { id: 'flour_sack', name: 'Sack of Flour', desc: 'Ground wheat.', type: 'key_item', sellValue: 15 },
    'water_flask': { id: 'water_flask', name: 'Mayim Shelanu', desc: 'Water rested overnight.', type: 'key_item', sellValue: 5 },
    'matzah_shmurah': { id: 'matzah_shmurah', name: 'Shmurah Matzah', desc: 'Bread of Faith. Healing + Faith boost.', type: 'consumable', effect: { type: 'hybrid_heal', hp: 100, kavanah: 50 }, sellValue: 100 },
    'kosher_phone': { id: 'kosher_phone', name: 'Kosher Phone', desc: 'Call the Gemach from anywhere.', type: 'consumable', effect: { type: 'call_gemach' }, sellValue: 500 }
};

// UPDATE: Pure Oil now restores Light Level
chanukahItems['pure_oil'] = { 
    id: 'pure_oil', 
    name: 'Pure Olive Oil', 
    desc: 'Crushed for the light. Restores 300 Light Points and cures Hellenization.', 
    type: 'consumable', 
    effect: { type: 'restore_light', amount: 300, cure: 'hellenized' }, 
    sellValue: 100 
};

// --- FEATURE 1-1234: THE SPARKS OF TOHU ---
const sparksOfTohu = {};
for(let i=1; i<=1234; i++) {
    sparksOfTohu[`spark_tohu_${i}`] = {
        id: `spark_tohu_${i}`,
        name: `Spark #${i}`,
        desc: `A fragmented spark of the shattered vessels. Collecting all 1234 is the ultimate Tikkun.`,
        type: 'key_item',
        sellValue: 1
    };
}

export const items = {
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
    ...chanukahItems,
    ...labyrinthItems,
    ...features555Items,
    ...digitalItems,
    ...eats33
};
