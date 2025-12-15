
// B"H
// js/data/items/food_items.js

export const foodItems = {
    'challah_loaf': { id: 'challah_loaf', name: 'Braided Challah', desc: 'Fresh from the oven. Restores 50 HP.', type: 'consumable', effect: { stat: 'hp', amount: 50 }, sellValue: 15 },
    'rugelach_pastry': { id: 'rugelach_pastry', name: 'Chocolate Rugelach', desc: 'A sweet twist. Restores 20 HP.', type: 'consumable', effect: { stat: 'hp', amount: 20 }, sellValue: 5 },
    'cholent_pot': { id: 'cholent_pot', name: 'Pot of Cholent', desc: 'Heavy stew. Restores 200 HP but lowers Speed.', type: 'consumable', effect: { type: 'cholent_effect', amount: 200 }, sellValue: 50 },
    'kugel_potato': { id: 'kugel_potato', name: 'Potato Kugel', desc: 'Solid comfort. +5 Defense.', type: 'consumable', effect: { stat: 'defense', amount: 5 }, sellValue: 20 },
    'matzah_ball': { id: 'matzah_ball', name: 'Kneidel', desc: 'Floater or sinker? Restores 30 HP.', type: 'consumable', effect: { stat: 'hp', amount: 30 }, sellValue: 10 },
    'gefilte_fish': { id: 'gefilte_fish', name: 'Gefilte Fish', desc: 'An acquired taste. Restores 40 HP.', type: 'consumable', effect: { stat: 'hp', amount: 40 }, sellValue: 15 },
    'horseradish_jar': { id: 'horseradish_jar', name: 'Chrain (Horseradish)', desc: 'Clears the sinuses! Cures Sleep, -10 HP.', type: 'consumable', effect: { type: 'chrain_effect' }, sellValue: 10 },
    'charoset_paste': { id: 'charoset_paste', name: 'Charoset', desc: 'Sweet mortar. +5 Attack.', type: 'consumable', effect: { stat: 'attack', amount: 5 }, sellValue: 20 },
    'maror_herb': { id: 'maror_herb', name: 'Maror', desc: 'Bitter herb. +10 Defense, -5 HP.', type: 'consumable', effect: { type: 'maror_effect' }, sellValue: 10 },
    'zeroa_bone': { id: 'zeroa_bone', name: 'Zeroa Bone', desc: 'Reminder of the outstretched arm.', type: 'key_item', isQuestItem: true },
    'egg_mourning': { id: 'egg_mourning', name: 'Beitzah', desc: 'Circle of life.', type: 'key_item', isQuestItem: true },
    'cheesecake_slice': { id: 'cheesecake_slice', name: 'Cheesecake', desc: 'Rich and creamy. Restores 50 HP and 20 Kavanah.', type: 'consumable', effect: { type: 'hybrid_heal', hp: 50, kavanah: 20 }, sellValue: 30 },
    'blintz_cheese': { id: 'blintz_cheese', name: 'Cheese Blintz', desc: 'Restores 40 HP.', type: 'consumable', effect: { stat: 'hp', amount: 40 }, sellValue: 20 },
    'latke_potato': { id: 'latke_potato', name: 'Latke', desc: 'Fried in oil. Restores 30 HP.', type: 'consumable', effect: { stat: 'hp', amount: 30 }, sellValue: 10 },
    'hamentasch_poppy': { id: 'hamentasch_poppy', name: 'Poppy Hamentasch', desc: 'Restores 30 Kavanah.', type: 'consumable', effect: { stat: 'kavanah', amount: 30 }, sellValue: 10 },
    'hamentasch_prune': { id: 'hamentasch_prune', name: 'Prune Hamentasch', desc: 'Restores 30 Kavanah.', type: 'consumable', effect: { stat: 'kavanah', amount: 30 }, sellValue: 10 },
    'hamentasch_choco': { id: 'hamentasch_choco', name: 'Choco Hamentasch', desc: 'Restores 40 Kavanah.', type: 'consumable', effect: { stat: 'kavanah', amount: 40 }, sellValue: 15 },
    'soda_siphon': { id: 'soda_siphon', name: 'Seltzer Siphon', desc: 'Cures Burn.', type: 'consumable', effect: { stat: 'cure_status', status: 'burn' }, sellValue: 25 },
};
