
// B"H
// js/data/items/clothing.js

/**
 * Garments represent the external "Levushim" (Garments) of the Soul: Thought, Speech, and Action.
 * In the game, they provide stat boosts when equipped (future feature) or just sit in inventory for now.
 */
export const clothing = {
    'hat_yirah': { id: 'hat_yirah', name: 'Hat of Awe', desc: 'Increases Defense by 15.', type: 'garment', slot: 'head', effect: { stat: 'defense', amount: 15 }, sellValue: 200 },
    'belt_truth': { id: 'belt_truth', name: 'Gartel of Truth', desc: 'Separates upper and lower. Increases Diligence.', type: 'garment', slot: 'waist', effect: { stat: 'diligence', amount: 10 }, sellValue: 150 },
    'shoes_alacrity': { id: 'shoes_alacrity', name: 'Shoes of Alacrity', desc: 'Run to do a Mitzvah. +20 Speed.', type: 'garment', slot: 'feet', effect: { stat: 'speed', amount: 20 }, sellValue: 300 },
    'shirt_chesed': { id: 'shirt_chesed', name: 'Shirt of Kindness', desc: 'Radiates benevolence. +10 HP Regen.', type: 'garment', slot: 'body', effect: { type: 'regen', amount: 5 }, sellValue: 250 },
    'pants_gevurah': { id: 'pants_gevurah', name: 'Trousers of Might', desc: 'Stand firm. Prevents knockback.', type: 'garment', slot: 'legs', effect: { type: 'knockback_resist' }, sellValue: 250 }
};
