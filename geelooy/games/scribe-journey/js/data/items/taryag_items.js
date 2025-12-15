
// B"H
// js/data/items/taryag_items.js

export const taryagItems = {
    // Temple Service
    'ketoret_spices': { id: 'ketoret_spices', name: '11 Spices of Ketoret', desc: 'Stops plagues and pleases the Divine.', type: 'consumable', effect: { stat: 'full_heal_team' }, sellValue: 1000 },
    'shemen_afarsimon': { id: 'shemen_afarsimon', name: 'Balsam Oil', desc: 'Oil of anointing.', type: 'key_item' },
    'pan_of_showbread': { id: 'pan_of_showbread', name: 'Lechem HaPanim', desc: 'Bread of Faces. Stays fresh all week.', type: 'consumable', effect: { stat: 'max_hp', amount: 50 }, sellValue: 500 },
    'half_shekel': { id: 'half_shekel', name: 'Machatzit HaShekel', desc: 'Atonement for the soul.', type: 'key_item', isQuestItem: true },
    
    // Agriculture
    'basket_bikkurim': { id: 'basket_bikkurim', name: 'Basket of First Fruits', desc: 'Bring this to the Kohen.', type: 'key_item', isQuestItem: true },
    'corner_grain': { id: 'corner_grain', name: 'Peah Grain', desc: 'Left for the poor. Do not harvest!', type: 'key_item' },
    'wool_and_linen': { id: 'wool_and_linen', name: 'Shatnez Cloth', desc: 'Forbidden mixture. Applies debuff if worn.', type: 'artifact', effect: { type: 'debuff_self' }, sellValue: 0 },
    
    // Garments
    'tallit_gadol': { id: 'tallit_gadol', name: 'Tallit Gadol', desc: 'Encompasses the wearer in light. +20 Defense.', type: 'artifact', effect: { stat: 'defense', amount: 20 }, sellValue: 200 },
    'tefillin_shel_rosh': { id: 'tefillin_shel_rosh', name: 'Tefillin Shel Rosh', desc: 'Subjugates the mind. +20 Diligence.', type: 'artifact', effect: { stat: 'diligence', amount: 20 }, sellValue: 0 },
    
    // Purification
    'ashes_red_heifer': { id: 'ashes_red_heifer', name: 'Ashes of Red Heifer', desc: 'Purifies the highest impurity.', type: 'consumable', effect: { stat: 'cure_status', status: 'tamei_met' }, sellValue: 10000 },
    
    // Civil Law
    'property_deed': { id: 'property_deed', name: 'Shtar Kinyan', desc: 'Proof of ownership.', type: 'key_item' },
    'get_bill': { id: 'get_bill', name: 'Sefer Kritut', desc: 'Bill of divorce. Breaks connections.', type: 'key_item' },
    
    // Mitzvah Objects
    'lulav_bundle': { id: 'lulav_bundle', name: 'Four Species', desc: 'Shake in 6 directions.', type: 'mivtzoim_tool', power: 60, cost: 5 },
    'shofar_ram_horn': { id: 'shofar_ram_horn', name: 'Simple Shofar', desc: 'Awakes the slumbering.', type: 'mivtzoim_tool', power: 40, cost: 2 },
    'etrog_box': { id: 'etrog_box', name: 'Silver Etrog Box', desc: 'Beautifies the Mitzvah.', type: 'artifact', effect: { stat: 'kavanah', amount: 10 }, sellValue: 150 }
};
