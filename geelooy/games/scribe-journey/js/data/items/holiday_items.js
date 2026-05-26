
// B"H
// js/data/items/holiday_items.js

export const holidayItems = {
    'jug_of_pure_oil': { id: 'jug_of_pure_oil', name: 'Pure Oil Jug', desc: 'Seal of the High Priest intact.', type: 'key_item', isQuestItem: true },
    'dreidel_clay': { id: 'dreidel_clay', name: 'Clay Dreidel', desc: 'A game of chance? Or faith? Restores 10 Kavanah.', type: 'consumable', effect: { stat: 'kavanah', amount: 10 }, sellValue: 5 },
    'dreidel_silver': { id: 'dreidel_silver', name: 'Silver Dreidel', desc: 'Restores 50 Kavanah.', type: 'consumable', effect: { stat: 'kavanah', amount: 50 }, sellValue: 100 },
    'sufganiyah': { id: 'sufganiyah', name: 'Oily Cake', desc: 'Deep fried. Heals 80 HP.', type: 'consumable', effect: { stat: 'hp', amount: 80 }, sellValue: 20 },
    'maccabee_shield': { id: 'maccabee_shield', name: 'Shield of Faith', desc: 'Artifact. +20 Defense.', type: 'artifact', effect: { stat: 'defense', amount: 20 }, sellValue: 800 },
    'maccabee_shield_fragment': { id: 'maccabee_shield_fragment', name: 'Maccabee Shield Fragment', desc: 'A hand-forged shield shard. Courage waiting to be reforged.', type: 'material', isQuestItem: true, sellValue: 25 },
    'sealed_oil': { id: 'sealed_oil', name: 'Sealed Oil', desc: 'A small sealed jar of oil, exact and untouched.', type: 'key_item', isQuestItem: true, sellValue: 30 },
    'hidden_oil': { id: 'hidden_oil', name: 'Hidden Oil', desc: 'Oil preserved in concealment for public light.', type: 'key_item', isQuestItem: true, sellValue: 35 },
    'refined_metal': { id: 'refined_metal', name: 'Refined Metal', desc: 'Redeemed metal from a weapon, ready for a better vessel.', type: 'material', sellValue: 40 }
};
