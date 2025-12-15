
// B"H
// js/data/items/tanya_items.js

export const tanyaItems = {
    'sefer_beinoni': { id: 'sefer_beinoni', name: 'Sefer of Intermediates', desc: 'Grants damage bonus vs Kelipah.', type: 'artifact', effect: { type: 'buff_vs_kelipah', amount: 1.5 }, sellValue: 1000 },
    'elixir_of_simcha': { id: 'elixir_of_simcha', name: 'Elixir of Joy', desc: 'Cures Depression status.', type: 'consumable', effect: { stat: 'cure_status', status: 'depression' }, sellValue: 50 },
    'bitul_token': { id: 'bitul_token', name: 'Token of Nullification', desc: 'Reduces enemy defense.', type: 'consumable', effect: { stat: 'debuff_defense', amount: 10 }, sellValue: 200 }
};
