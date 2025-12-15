
// B"H
// js/data/items/consumables.js

export const consumables = {
    'manna_dew': { id: 'manna_dew', name: 'Manna Dew', desc: 'Restores 30 HP.', type: 'consumable', effect: { stat: 'hp', amount: 30 }, sellValue: 15 },
    'manna_loaf': { id: 'manna_loaf', name: 'Manna Loaf', desc: 'Restores 100 HP.', type: 'consumable', effect: { stat: 'hp', amount: 100 }, sellValue: 50 },
    'ink_of_potential': { id: 'ink_of_potential', name: 'Ink of Potential', desc: 'Restores 20 Kavanah.', type: 'consumable', effect: { stat: 'kavanah', amount: 20 }, sellValue: 25 },
    'ink_of_creation': { id: 'ink_of_creation', name: 'Ink of Creation', desc: 'Restores 100 Kavanah.', type: 'consumable', effect: { stat: 'kavanah', amount: 100 }, sellValue: 100 },
    'elixir_of_clarity': { id: 'elixir_of_clarity', name: 'Elixir of Clarity', desc: 'Restores 50 HP.', type: 'consumable', effect: { stat: 'hp', amount: 50 }, sellValue: 40 },
    'dust_of_tiferet': { id: 'dust_of_tiferet', name: 'Dust of Tiferet', desc: 'Cures status ailments.', type: 'consumable', effect: { stat: 'cure_status' }, sellValue: 100 },
    'root_of_persistence': { id: 'root_of_persistence', name: 'Root of Persistence', desc: 'Restores 50 HP.', type: 'consumable', effect: { stat: 'hp', amount: 50 }, sellValue: 80 },
    'sparks_of_holiness': { id: 'sparks_of_holiness', name: 'Sparks', desc: 'Revives a fainted Musag.', type: 'consumable', effect: { stat: 'revive', amount: 0.5 }, sellValue: 200 },
};
