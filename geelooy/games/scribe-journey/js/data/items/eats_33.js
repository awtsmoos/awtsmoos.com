
// B"H
// js/data/items/eats_33.js

export const eats33 = {
    'bagel_lox': { id: 'bagel_lox', name: 'Bagel & Lox', desc: 'The classic. Restores 60 HP.', type: 'consumable', effect: { stat: 'hp', amount: 60 }, sellValue: 25 },
    'schug_spicy': { id: 'schug_spicy', name: 'Red Schug', desc: 'Very spicy! +10 Attack, inflicts Burn on self.', type: 'consumable', effect: { type: 'stat_boost_self_harm', stat: 'attack', amount: 10 }, sellValue: 10 },
    'herring_cream': { id: 'herring_cream', name: 'Herring in Cream', desc: 'Slippery. +5 Defense.', type: 'consumable', effect: { stat: 'defense', amount: 5 }, sellValue: 15 },
    'ptcha': { id: 'ptcha', name: 'Ptcha (Jellied Feet)', desc: 'Wobbly. Cures Paralysis.', type: 'consumable', effect: { stat: 'cure_status', status: 'paralysis' }, sellValue: 20 },
    'yapchik': { id: 'yapchik', name: 'Yapchik', desc: 'Potato and Meat. Heals 150 HP but slows you down.', type: 'consumable', effect: { stat: 'hp', amount: 150 }, sellValue: 60 },
    'kishke': { id: 'kishke', name: 'Stuffed Kishke', desc: 'Heavy. +20 Max HP temporarily.', type: 'consumable', effect: { type: 'buff_max_hp', amount: 20 }, sellValue: 30 },
    'liver_chopped': { id: 'liver_chopped', name: 'Chopped Liver', desc: 'Iron rich. +5 Attack.', type: 'consumable', effect: { stat: 'attack', amount: 5 }, sellValue: 25 },
    'matzah_brei': { id: 'matzah_brei', name: 'Matzah Brei', desc: 'Fried goodness. Heals 50 HP.', type: 'consumable', effect: { stat: 'hp', amount: 50 }, sellValue: 15 },
    'shakshuka': { id: 'shakshuka', name: 'Shakshuka', desc: 'Spicy eggs. Revives fainted Musag with 10% HP.', type: 'consumable', effect: { stat: 'revive', amount: 0.1 }, sellValue: 40 },
    'falafel_pita': { id: 'falafel_pita', name: 'Falafel in Pita', desc: 'Full meal. Heals 80 HP.', type: 'consumable', effect: { stat: 'hp', amount: 80 }, sellValue: 20 },
    'shawarma_laffa': { id: 'shawarma_laffa', name: 'Shawarma Laffa', desc: 'Massive meal. Heals 120 HP.', type: 'consumable', effect: { stat: 'hp', amount: 120 }, sellValue: 35 },
    'sabich': { id: 'sabich', name: 'Sabich', desc: 'Eggplant and egg. +10 Defense.', type: 'consumable', effect: { stat: 'defense', amount: 10 }, sellValue: 25 },
    'bourekas_cheese': { id: 'bourekas_cheese', name: 'Cheese Bourekas', desc: 'Flaky. Heals 30 HP.', type: 'consumable', effect: { stat: 'hp', amount: 30 }, sellValue: 10 },
    'bourekas_potato': { id: 'bourekas_potato', name: 'Potato Bourekas', desc: 'Comfort. Heals 30 HP.', type: 'consumable', effect: { stat: 'hp', amount: 30 }, sellValue: 10 },
    'kichel': { id: 'kichel', name: 'Sugar Kichel', desc: 'Dry and sweet. +5 Speed.', type: 'consumable', effect: { stat: 'speed', amount: 5 }, sellValue: 5 },
    'black_white_cookie': { id: 'black_white_cookie', name: 'B&W Cookie', desc: 'Unity of opposites. Balances stats.', type: 'consumable', effect: { type: 'balance_stats' }, sellValue: 10 },
    'babka_chocolate': { id: 'babka_chocolate', name: 'Chocolate Babka', desc: 'Superior cake. Heals 100 HP.', type: 'consumable', effect: { stat: 'hp', amount: 100 }, sellValue: 40 },
    'babka_cinnamon': { id: 'babka_cinnamon', name: 'Cinnamon Babka', desc: 'Lesser babka? Still good. Heals 80 HP.', type: 'consumable', effect: { stat: 'hp', amount: 80 }, sellValue: 30 },
    'mandelbrot': { id: 'mandelbrot', name: 'Mandelbrot', desc: 'Almond bread. Hard. +5 Defense.', type: 'consumable', effect: { stat: 'defense', amount: 5 }, sellValue: 15 },
    'compote': { id: 'compote', name: 'Fruit Compote', desc: 'Sweet stew. Cures all status.', type: 'consumable', effect: { stat: 'cure_status' }, sellValue: 25 },
    'egg_cream': { id: 'egg_cream', name: 'Egg Cream', desc: 'Contains no egg or cream. Confusion? Cures Confusion.', type: 'consumable', effect: { stat: 'cure_status', status: 'confuse' }, sellValue: 10 },
    'celery_soda': { id: 'celery_soda', name: 'Celery Soda', desc: 'Dr. Browns. Heals 20 HP.', type: 'consumable', effect: { stat: 'hp', amount: 20 }, sellValue: 5 },
    'kreplach': { id: 'kreplach', name: 'Kreplach', desc: 'Hidden meat. Revealing secrets. +10 Kavanah.', type: 'consumable', effect: { stat: 'kavanah', amount: 10 }, sellValue: 20 },
    'kneidel_sweet': { id: 'kneidel_sweet', name: 'Sweet Kneidel', desc: 'Dessert dumpling. Heals 40 HP.', type: 'consumable', effect: { stat: 'hp', amount: 40 }, sellValue: 15 },
    'gribenes': { id: 'gribenes', name: 'Gribenes', desc: 'Chicken skin cracklings. +10 Attack, -5 HP.', type: 'consumable', effect: { type: 'stat_boost_self_harm', stat: 'attack', amount: 10 }, sellValue: 10 },
    'schmaltz': { id: 'schmaltz', name: 'Jar of Schmaltz', desc: 'Pure fat. Lubricates joints. +5 Speed.', type: 'consumable', effect: { stat: 'speed', amount: 5 }, sellValue: 15 },
    'pickled_tongue': { id: 'pickled_tongue', name: 'Pickled Tongue', desc: 'Cures Silence status.', type: 'consumable', effect: { stat: 'cure_status', status: 'silence' }, sellValue: 30 },
    'yerushalmi_kugel': { id: 'yerushalmi_kugel', name: 'Yerushalmi Kugel', desc: 'Peppery sweet. +5 Attack, +5 Defense.', type: 'consumable', effect: { type: 'buff_all_stats', amount: 5 }, sellValue: 35 },
    'esrog_jam': { id: 'esrog_jam', name: 'Esrog Jam', desc: 'Segula for easy birth (of ideas). +50 Kavanah.', type: 'consumable', effect: { stat: 'kavanah', amount: 50 }, sellValue: 100 },
    'carob_pod': { id: 'carob_pod', name: 'Carob Pod', desc: 'Food of Rashbi. Sustains for long time.', type: 'consumable', effect: { type: 'regen', amount: 2 }, sellValue: 5 },
    'pomegranate_seeds': { id: 'pomegranate_seeds', name: 'Pomegranate Seeds', desc: 'Full of Mitzvos. +100 XP.', type: 'consumable', effect: { stat: 'xp', amount: 100 }, sellValue: 50 },
    'date_honey': { id: 'date_honey', name: 'Silan', desc: 'Sweet honey. Heals 50 HP.', type: 'consumable', effect: { stat: 'hp', amount: 50 }, sellValue: 25 },
    'olive_oil_dip': { id: 'olive_oil_dip', name: 'Zatar & Oil', desc: 'Wisdom food. +10 Diligence.', type: 'consumable', effect: { stat: 'diligence', amount: 10 }, sellValue: 20 }
};
