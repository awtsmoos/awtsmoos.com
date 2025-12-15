
// B"H
// js/data/items/holiday_items.js

export const holidayItems = {
    'jug_of_pure_oil': { id: 'jug_of_pure_oil', name: 'Pure Oil Jug', desc: 'Seal of the High Priest intact.', type: 'key_item', isQuestItem: true },
    'dreidel_clay': { id: 'dreidel_clay', name: 'Clay Dreidel', desc: 'A game of chance? Or faith? Restores 10 Kavanah.', type: 'consumable', effect: { stat: 'kavanah', amount: 10 }, sellValue: 5 },
    'dreidel_silver': { id: 'dreidel_silver', name: 'Silver Dreidel', desc: 'Restores 50 Kavanah.', type: 'consumable', effect: { stat: 'kavanah', amount: 50 }, sellValue: 100 },
    'sufganiyah': { id: 'sufganiyah', name: 'Oily Cake', desc: 'Deep fried. Heals 80 HP.', type: 'consumable', effect: { stat: 'hp', amount: 80 }, sellValue: 20 },
    'maccabee_shield': { id: 'maccabee_shield', name: 'Shield of Faith', desc: 'Artifact. +20 Defense.', type: 'artifact', effect: { stat: 'defense', amount: 20 }, sellValue: 800 }
};
