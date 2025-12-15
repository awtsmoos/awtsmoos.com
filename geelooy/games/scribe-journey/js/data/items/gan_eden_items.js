
// B"H
// js/data/items/gan_eden_items.js

export const ganEdenItems = {
    'garment_of_light': { id: 'garment_of_light', name: 'Ketonet Or', desc: 'A garment made of Mitzvot. Required to enter Gan Eden.', type: 'key_item', isQuestItem: true },
    'fruit_apple_paradise': { id: 'fruit_apple_paradise', name: 'Gan Eden Apple', desc: 'Smells like a field blessed by Hashem. Heals 200 HP.', type: 'consumable', effect: { stat: 'hp', amount: 200 }, sellValue: 500 },
    'fruit_fig_paradise': { id: 'fruit_fig_paradise', name: 'Gan Eden Fig', desc: 'Restores 100 Kavanah.', type: 'consumable', effect: { stat: 'kavanah', amount: 100 }, sellValue: 500 },
    'fruit_grape_paradise': { id: 'fruit_grape_paradise', name: 'Preserved Wine', desc: 'Yayin HaMeshumar. Max Elixir.', type: 'consumable', effect: { stat: 'hp', amount: 999 }, sellValue: 1000 },
    'fruit_etrog_paradise': { id: 'fruit_etrog_paradise', name: 'Primordial Etrog', desc: 'Taste of the tree and fruit are one. +5 All Stats.', type: 'consumable', effect: { type: 'buff_all_stats', amount: 5 }, sellValue: 2000 },
    'spice_havdalah': { id: 'spice_havdalah', name: 'Besamim', desc: 'Restores the soul. Revives fainted Musag.', type: 'consumable', effect: { stat: 'revive', amount: 1.0 }, sellValue: 100 },
    'dew_resurrection': { id: 'dew_resurrection', name: 'Dew of Techiyah', desc: 'Tal Shel Techiyah. Ultimate restoration.', type: 'consumable', effect: { stat: 'full_heal_team' }, sellValue: 5000 },
    'stone_shoham': { id: 'stone_shoham', name: 'Shoham Stone', desc: 'A gem from the river Pishon.', type: 'artifact', sellValue: 800 },
    'stone_bedolach': { id: 'stone_bedolach', name: 'Bedolach Crystal', desc: 'Clear as the heavens.', type: 'artifact', sellValue: 800 },
    'leaf_healing': { id: 'leaf_healing', name: 'Leaf of Healing', desc: 'Heals all status effects.', type: 'consumable', effect: { stat: 'cure_status' }, sellValue: 150 },
};
