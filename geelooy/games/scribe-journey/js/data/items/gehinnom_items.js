
// B"H
// js/data/items/gehinnom_items.js

export const gehinnomItems = {
    'tear_of_teshuva': { id: 'tear_of_teshuva', name: 'Tear of Teshuva', desc: 'Cools the heat of Gehinnom. Heals burn.', type: 'consumable', effect: { stat: 'cure_status', status: 'burn' }, sellValue: 500 },
    'coal_of_lips': { id: 'coal_of_lips', name: 'Coal of Isaiah', desc: 'Purifies speech. +20 Attack.', type: 'artifact', effect: { stat: 'attack', amount: 20 }, sellValue: 1000 },
    'garment_of_asbestos': { id: 'garment_of_asbestos', name: 'Fireproof Tunic', desc: 'Protects against the River Dinur.', type: 'key_item', isQuestItem: true },
    'soap_of_borit': { id: 'soap_of_borit', name: 'Borit Soap', desc: 'Cleanses the stain of sin.', type: 'consumable', effect: { stat: 'cure_status' }, sellValue: 100 }
};
