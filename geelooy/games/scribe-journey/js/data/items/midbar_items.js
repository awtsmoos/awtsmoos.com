
// B"H
// js/data/items/midbar_items.js

export const midbarItems = {
    'manna_portion': { id: 'manna_portion', name: 'Omer of Manna', desc: 'Bread from Heaven. Tastes like whatever you wish. Full Heal.', type: 'consumable', effect: { stat: 'full_heal' }, sellValue: 0 },
    'staff_of_moshe': { id: 'staff_of_moshe', name: 'Staff of Leadership', desc: 'Used to split seas and strike rocks. +30 Attack.', type: 'artifact', effect: { stat: 'attack', amount: 30 }, sellValue: 0 },
    'copper_snake': { id: 'copper_snake', name: 'Nechushtan', desc: 'Look up and be healed. Cures Poison/Burn.', type: 'consumable', effect: { stat: 'cure_status' }, sellValue: 200 },
};
