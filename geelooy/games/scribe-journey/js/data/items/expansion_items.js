
// B"H
// js/data/items/expansion_items.js

export const expansionItems = {
    'shofar_gadol': { id: 'shofar_gadol', name: 'Shofar Gadol', desc: 'A blast that stuns all enemies.', type: 'consumable', effect: { stat: 'inflict_status', status: 'stun' }, sellValue: 200, rarity: 'rare' },
    'havdalah_candle': { id: 'havdalah_candle', name: 'Havdalah Candle', desc: 'Dispels darkness and depression.', type: 'consumable', effect: { stat: 'cure_status', status: 'depression' }, sellValue: 50, rarity: 'common' },
    'etrog_jelly': { id: 'etrog_jelly', name: 'Etrog Jelly', desc: 'Heals 100 HP.', type: 'consumable', effect: { stat: 'hp', amount: 100 }, sellValue: 30, rarity: 'common' },
    'charoset_mortar': { id: 'charoset_mortar', name: 'Charoset', desc: 'Sweetens the bitter. +10 Attack.', type: 'consumable', effect: { stat: 'attack', amount: 10 }, sellValue: 20, rarity: 'common' },
    'maror_root': { id: 'maror_root', name: 'Maror Root', desc: 'Bitter herb. Increases Defense but hurts you (-10 HP).', type: 'consumable', effect: { type: 'maror_effect' }, sellValue: 10, rarity: 'common' },
    'salt_of_sodom': { id: 'salt_of_sodom', name: 'Salt of Sodom', desc: 'Blinds enemies with salt.', type: 'consumable', effect: { stat: 'inflict_status', status: 'blind' }, sellValue: 100, rarity: 'rare' },
    'miriam_water': { id: 'miriam_water', name: 'Water of Miriam', desc: 'Full Heal and cleanse.', type: 'consumable', effect: { stat: 'full_heal' }, sellValue: 0, rarity: 'holy' },
    'blue_thread': { id: 'blue_thread', name: 'Tekhelet Thread', desc: 'Thread of the sky. Crafting material.', type: 'key_item', rarity: 'rare' },
    'golden_bell': { id: 'golden_bell', name: 'Golden Bell', desc: 'From the Kohen\'s robe. Increases encounter rate.', type: 'artifact', effect: { type: 'encounter_rate', amount: 1.5 }, sellValue: 1000, rarity: 'holy' },
    'ancient_coin': { id: 'ancient_coin', name: 'Ancient Shekel', desc: 'Valuable antique.', type: 'key_item', sellValue: 500, rarity: 'rare' },
    'mystic_ink': { id: 'mystic_ink', name: 'Mystic Ink', desc: 'Used for writing holy scrolls.', type: 'key_item', rarity: 'rare' },
    'quill_truth': { id: 'quill_truth', name: 'Quill of Emet', desc: 'Never misses.', type: 'artifact', effect: { stat: 'accuracy', amount: 1.2 }, sellValue: 800, rarity: 'rare' },
    'clay_pot': { id: 'clay_pot', name: 'Clay Pot', desc: 'Empty vessel.', type: 'key_item', sellValue: 5, rarity: 'common' },
    'cedar_wood': { id: 'cedar_wood', name: 'Cedar Wood', desc: 'Strong building material.', type: 'key_item', sellValue: 20, rarity: 'common' },
    'hyssop_branch': { id: 'hyssop_branch', name: 'Eizov (Hyssop)', desc: 'Purifies. Cures poison.', type: 'consumable', effect: { stat: 'cure_status', status: 'poison' }, sellValue: 15, rarity: 'common' }
};