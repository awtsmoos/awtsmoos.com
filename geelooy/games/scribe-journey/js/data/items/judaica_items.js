
// B"H
// js/data/items/judaica_items.js

export const judaicaItems = {
    'candle_bedikah': { id: 'candle_bedikah', name: 'Bedikah Candle', desc: 'For searching in cracks and crevices.', type: 'key_item' },
    'feather_bedikah': { id: 'feather_bedikah', name: 'Bedikah Feather', desc: 'For sweeping up crumbs.', type: 'key_item' },
    'spoon_bedikah': { id: 'spoon_bedikah', name: 'Wooden Spoon', desc: 'For collecting the Chametz.', type: 'key_item' },
    'etrog_box_silver': { id: 'etrog_box_silver', name: 'Silver Etrog Box', desc: 'Beautiful housing. Increases drop rates.', type: 'artifact', effect: { stat: 'luck', amount: 5 }, sellValue: 500 },
    'lulav_holder': { id: 'lulav_holder', name: 'Lulav Holder', desc: 'Keeps the palm straight. Increases Diligence.', type: 'artifact', effect: { stat: 'diligence', amount: 5 }, sellValue: 300 },
    'sukkah_decoration': { id: 'sukkah_decoration', name: 'Paper Chain', desc: 'Simple beauty.', type: 'artifact', sellValue: 50 },
    'hanukkiah_basic': { id: 'hanukkiah_basic', name: 'Tin Menorah', desc: 'Simple but kosher.', type: 'artifact', sellValue: 20 },
    'hanukkiah_silver': { id: 'hanukkiah_silver', name: 'Silver Menorah', desc: 'Enhances fire-based attacks.', type: 'artifact', effect: { type: 'buff_element', element: 'fire', amount: 1.2 }, sellValue: 1000 },
    'gragger_wood': { id: 'gragger_wood', name: 'Wooden Gragger', desc: 'Makes noise. Confuses enemies.', type: 'consumable', effect: { stat: 'inflict_status', status: 'confuse' }, sellValue: 15 },
    'gragger_metal': { id: 'gragger_metal', name: 'Metal Gragger', desc: 'Deafening noise. Stuns enemies.', type: 'consumable', effect: { stat: 'inflict_status', status: 'stun' }, sellValue: 40 },
    'potion_zrizut': { id: 'potion_zrizut', name: 'Elixir of Zrizut', desc: 'Alacrity! Increases Speed temporarily.', type: 'consumable', effect: { type: 'temp_buff', stat: 'speed' }, sellValue: 50 },
    'potion_simcha': { id: 'potion_simcha', name: 'Wine of Simcha', desc: 'Breaks boundaries. Cures Depression.', type: 'consumable', effect: { stat: 'cure_status', status: 'depression' }, sellValue: 60 },
};
