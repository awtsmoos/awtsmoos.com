
/**
 * B"H
 * @file ShlichusLedger.js
 * 
 * The Torah contains 613 Mitzvot. Every soul has its specific portion
 * of sparks it must elevate. This ledger is a pure data representation
 * of the Shlichus (Missions/Quests) available in the world.
 * 
 * It is completely devoid of logic, representing only the pure text
 * and requirements of the divine decrees.
 */

export const ShlichusLedger = {
    'Q_GATHER_EMERALD_WOOD': {
        id: 'Q_GATHER_EMERALD_WOOD',
        title: 'Gather Wood for Real Doors',
        description: 'Collect 6 wood/etz/lumber pieces so Emerald Void houses can receive strong doors, stairs, and warm rooms.',
        requirements: {
            item: 'Wood',
            quantity: 6
        },
        rewards: {
            item: 'book_chumash_bereishis',
            quantity: 1
        }
    },
    'Q_GATHER_EMERALD_WOOD': {
        id: 'Q_GATHER_EMERALD_WOOD',
        title: 'Gather Wood for Real Doors',
        description: 'Collect 6 wood/etz/lumber pieces so Emerald Void houses can receive strong doors, stairs, and warm rooms.',
        requirements: {
            item: 'Wood',
            quantity: 6
        },
        rewards: {
            item: 'book_chumash_bereishis',
            quantity: 1
        }
    },
    'Q_ELEVATE_APPLES': {
        id: 'Q_ELEVATE_APPLES',
        title: 'Elevate the Fallen Sparks (Apples)',
        description: 'Deep in the orchard, holy sparks are trapped within the physical shells (Klipot) of apples. Gather 3 of them and make a Bracha (Blessing) to elevate them back to the Awtsmoos.',
        requirements: {
            item: 'ITEM_APPLE',
            quantity: 3
        },
        rewards: {
            item: 'ITEM_HOLY_COIN',
            quantity: 50
        }
    },
    'Q_TZEDAKAH_RUN': {
        id: 'Q_TZEDAKAH_RUN',
        title: 'The Speedy Coin of Tzedakah',
        description: 'Tzedakah saves from death. Take this coin and deliver it to the pushka (charity box) on the other side of the village before the sun sets.',
        requirements: {
            item: 'ITEM_PUSHKA_RECEIPT',
            quantity: 1
        },
        rewards: {
            item: 'ITEM_TZITZIT_UPGRADE',
            quantity: 1
        }
    }
};
