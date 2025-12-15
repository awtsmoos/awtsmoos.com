
// B"H
// js/data/items/artifacts.js

export const artifacts = {
    'shofar_ram': { id: 'shofar_ram', name: 'Ram\'s Shofar', desc: 'Awakens sleeping concepts. +10 Attack.', type: 'artifact', effect: { stat: 'attack', amount: 10 }, sellValue: 500 },
    'harp_david': { id: 'harp_david', name: 'Harp of David', desc: 'Soothes savage beasts. +10 Defense.', type: 'artifact', effect: { stat: 'defense', amount: 10 }, sellValue: 500 },
    'staff_aaron': { id: 'staff_aaron', name: 'Staff of Aaron', desc: 'Blossoms with almonds. Revives team.', type: 'artifact', effect: { type: 'revive_all' }, sellValue: 1000 },
    'urim_thummim': { id: 'urim_thummim', name: 'Urim & Thummim', desc: 'Reveals hidden truths.', type: 'key_item', isQuestItem: true },
    'manna_jar': { id: 'manna_jar', name: 'Jar of Manna', desc: 'Infinite food? (Restores 50HP, 3 uses)', type: 'consumable', effect: { stat: 'hp', amount: 50 }, uses: 3, sellValue: 800 },
    'pomegranate_crown': { id: 'pomegranate_crown', name: 'Rimon Crown', desc: 'A crown of seeds.', type: 'artifact', sellValue: 300 },
};
