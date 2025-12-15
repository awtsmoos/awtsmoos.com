
// B"H
// js/data/items/library_items.js

const seforim = {};

// Procedurally generate 50 volumes of Likkutei Sichos
for(let i=1; i<=39; i++) {
    seforim[`likkutei_sichos_${i}`] = {
        id: `likkutei_sichos_${i}`,
        name: `Likkutei Sichos Vol ${i}`,
        desc: `Deep insights from the Rebbe. Vol ${i}.`,
        type: 'tome',
        effect: { stat: 'xp', amount: 100 }, // Consuming a book gives XP
        sellValue: 50
    };
}

// Procedurally generate Igros Kodesh
for(let i=1; i<=30; i++) {
    seforim[`igros_kodesh_${i}`] = {
        id: `igros_kodesh_${i}`,
        name: `Igros Kodesh Vol ${i}`,
        desc: `Holy Letters. Vol ${i}. Reveals a random blessing.`,
        type: 'consumable',
        effect: { stat: 'random_buff' },
        sellValue: 50
    };
}

// Specific Key Works
const keyWorks = {
    'tanya_kadisha': { id: 'tanya_kadisha', name: 'Tanya Kadisha', desc: 'The Written Law of Chassidus. +50 Max Kavanah.', type: 'artifact', effect: { stat: 'max_kavanah', amount: 50 }, sellValue: 1000 },
    'hayom_yom': { id: 'hayom_yom', name: 'Hayom Yom', desc: 'A thought for the day. Can be used once per day for a full heal.', type: 'consumable', uses: 1, effect: { stat: 'full_heal' }, sellValue: 200 },
    'siddur_tehillat_hashem': { id: 'siddur_tehillat_hashem', name: 'Siddur Tehillat Hashem', desc: 'Prayer book. Essential equipment.', type: 'artifact', effect: { stat: 'defense', amount: 5 }, sellValue: 150 },
    'tehillim_ohel': { id: 'tehillim_ohel', name: 'Tehillim (Ohel)', desc: 'Psalms recited at the Ohel. Massive Kavanah regen.', type: 'consumable', effect: { stat: 'kavanah', amount: 200 }, sellValue: 300 },
    'maamar_basi_legani': { id: 'maamar_basi_legani', name: 'Basi LeGani 5710', desc: 'The manifesto of the 7th Generation.', type: 'key_item' }
};

export const libraryItems = {
    ...seforim,
    ...keyWorks
};
