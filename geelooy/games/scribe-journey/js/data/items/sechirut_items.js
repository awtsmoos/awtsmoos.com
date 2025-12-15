
// B"H
// js/data/items/sechirut_items.js

export const sechirutItems = {
    'worker_sickle': { id: 'worker_sickle', name: 'Worker\'s Sickle', desc: 'Tool of the harvest. +5 Attack.', type: 'artifact', effect: { stat: 'attack', amount: 5 }, sellValue: 150 },
    'basket_of_grapes': { id: 'basket_of_grapes', name: 'Basket of Grapes', desc: 'Food for the worker. Restores 40 HP.', type: 'consumable', effect: { stat: 'hp', amount: 40 }, sellValue: 20 },
    'coin_bag_wage': { id: 'coin_bag_wage', name: 'Day\'s Wage', desc: 'Payment for a day\'s work. Don\'t delay it!', type: 'key_item', isQuestItem: true },
    'contract_of_guardians': { id: 'contract_of_guardians', name: 'Guardian Contract', desc: 'Defines liabilities of Shomrim.', type: 'key_item', isQuestItem: true },
    'leather_muzzle': { id: 'leather_muzzle', name: 'Leather Muzzle', desc: 'Used to block an ox from eating. Forbidden.', type: 'key_item', isQuestItem: true }
};
