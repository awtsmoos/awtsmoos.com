
// B"H
// js/data/bestiary/the_66.js

// --- TIER 1: THE OTIYOT (22) ---
const otiyot = {
    'aleph_head': { name: "Aleph (The Head)", emoji: '🅰️', type: 'Keter', baseStats: { hp: 200, attack: 10, defense: 200, diligence: 50 }, moves: ['Paradox', 'Harden'], xpYield: 150, moneyYield: { perutah: 1 } },
    'bet_house': { name: "Bet (The House)", emoji: '🏠', type: 'Binah', baseStats: { hp: 300, attack: 30, defense: 50, diligence: 20 }, moves: ['Dualism', 'Harden'], xpYield: 120, moneyYield: { perutah: 2 } },
    'gimel_giver': { name: "Gimel (The Giver)", emoji: '🏃', type: 'Chesed', baseStats: { hp: 150, attack: 40, defense: 20, diligence: 60 }, moves: ['Run_Gimel', 'Flow'], xpYield: 130, moneyYield: { perutah: 3 } },
    'dalet_door': { name: "Dalet (The Door)", emoji: '🚪', type: 'Malkuth', baseStats: { hp: 250, attack: 10, defense: 80, diligence: 10 }, moves: ['Nullify', 'Harden'], xpYield: 110, moneyYield: { perutah: 4 } },
    'hei_breath': { name: "Hei (The Breath)", emoji: '💨', type: 'Binah', baseStats: { hp: 100, attack: 50, defense: 10, diligence: 40 }, moves: ['Expression', 'Soothing_Mist'], xpYield: 140, moneyYield: { perutah: 5 } },
    'vav_hook': { name: "Vav (The Hook)", emoji: '⚓', type: 'Tiferet', baseStats: { hp: 180, attack: 30, defense: 30, diligence: 30 }, moves: ['Unite', 'Adhere'], xpYield: 125, moneyYield: { perutah: 6 } },
    'zayin_sword': { name: "Zayin (Sword)", emoji: '🗡️', type: 'Gevurah', baseStats: { hp: 120, attack: 70, defense: 10, diligence: 50 }, moves: ['Cut_Zayin', 'Gevurah_Rebuke'], xpYield: 160, moneyYield: { perutah: 7 } },
    'chet_fence': { name: "Chet (The Fence)", emoji: '🚧', type: 'Binah', baseStats: { hp: 220, attack: 20, defense: 90, diligence: 20 }, moves: ['Transcend', 'Harden'], xpYield: 150, moneyYield: { perutah: 8 } },
    'tet_good': { name: "Tet (Hidden Good)", emoji: '🤰', type: 'Yesod', baseStats: { hp: 300, attack: 10, defense: 60, diligence: 10 }, moves: ['Conceal', 'Soothing_Mist'], xpYield: 180, moneyYield: { perutah: 9 } },
    'yud_point': { name: "Yud (The Point)", emoji: '⏺️', type: 'Chokhmah', baseStats: { hp: 50, attack: 100, defense: 5, diligence: 100 }, moves: ['Flash_Yud', 'Fade'], xpYield: 200, moneyYield: { perutah: 10 } },
    'kaf_spoon': { name: "Kaf (The Palm)", emoji: '🤲', type: 'Malkuth', baseStats: { hp: 160, attack: 25, defense: 40, diligence: 30 }, moves: ['Bend_Kaf', 'Iron_Grip'], xpYield: 110, moneyYield: { perutah: 20 } },
    'lamed_tower': { name: "Lamed (Tower)", emoji: '🗼', type: 'Binah', baseStats: { hp: 140, attack: 30, defense: 30, diligence: 60 }, moves: ['Teach_Lamed', 'Analyze'], xpYield: 130, moneyYield: { perutah: 30 } },
    'mem_water': { name: "Mem (Water)", emoji: '🌊', type: 'Chesed', baseStats: { hp: 200, attack: 30, defense: 30, diligence: 30 }, moves: ['Open_Close', 'Flow'], xpYield: 140, moneyYield: { perutah: 40 } },
    'nun_fish': { name: "Nun (The Fish)", emoji: '🐟', type: 'Gevurah', baseStats: { hp: 100, attack: 60, defense: 10, diligence: 70 }, moves: ['Fall_Nun', 'Sway'], xpYield: 150, moneyYield: { perutah: 50 } },
    'samech_support': { name: "Samech (Support)", emoji: '🔄', type: 'Tiferet', baseStats: { hp: 250, attack: 10, defense: 70, diligence: 20 }, moves: ['Uplift_Samech', 'Endure'], xpYield: 160, moneyYield: { perutah: 60 } },
    'ayin_eye': { name: "Ayin (The Eye)", emoji: '👁️', type: 'Chokhmah', baseStats: { hp: 80, attack: 20, defense: 20, diligence: 90 }, moves: ['Perceive', 'Analyze'], xpYield: 170, moneyYield: { perutah: 70 } },
    'pei_mouth': { name: "Pei (The Mouth)", emoji: '👄', type: 'Gevurah', baseStats: { hp: 120, attack: 50, defense: 20, diligence: 40 }, moves: ['Speech_Pei', 'Echo_Blast'], xpYield: 155, moneyYield: { perutah: 80 } },
    'tzadik_hook': { name: "Tzadik (Righteous)", emoji: '🎣', type: 'Yesod', baseStats: { hp: 180, attack: 40, defense: 40, diligence: 40 }, moves: ['Hunt_Tzadik', 'Iron_Grip'], xpYield: 190, moneyYield: { perutah: 90 } },
    'kuf_monkey': { name: "Kuf (Monkey)", emoji: '🐒', type: 'Qliphoth', baseStats: { hp: 150, attack: 40, defense: 30, diligence: 50 }, moves: ['Copycat_Kuf', 'Mockery'], xpYield: 130, moneyYield: { perutah: 100 } },
    'reish_poor': { name: "Reish (Poor Man)", emoji: '🚶', type: 'Malkuth', baseStats: { hp: 100, attack: 20, defense: 20, diligence: 20 }, moves: ['Need_Reish', 'Collapse'], xpYield: 100, moneyYield: { perutah: 200 } },
    'shin_fire': { name: "Shin (Fire)", emoji: '🔥', type: 'Gevurah', baseStats: { hp: 140, attack: 80, defense: 20, diligence: 60 }, moves: ['Consume_Shin', 'Propel_Stones'], xpYield: 180, moneyYield: { perutah: 300 } },
    'tav_seal': { name: "Tav (The Seal)", emoji: '❌', type: 'Malkuth', baseStats: { hp: 300, attack: 50, defense: 50, diligence: 10 }, moves: ['Truth_Tav', 'Pummel'], xpYield: 250, moneyYield: { perutah: 400 } },
};

// --- TIER 2: THE 10 PLAGUES (10) ---
const makkot = {
    'plague_blood': { name: "Dam (Blood)", emoji: '🩸', type: 'Gevurah', baseStats: { hp: 200, attack: 40, defense: 30, diligence: 20 }, moves: ['Blood_Water', 'Adhere'], xpYield: 200, moneyYield: { perutah: 50 } },
    'plague_frog': { name: "Tzfardea (Frog)", emoji: '🐸', type: 'Netzach', baseStats: { hp: 150, attack: 30, defense: 40, diligence: 50 }, moves: ['Frog_Croak', 'Sway'], xpYield: 210, moneyYield: { perutah: 50 } },
    'plague_lice': { name: "Kinim (Lice)", emoji: '🐜', type: 'Hod', baseStats: { hp: 50, attack: 20, defense: 80, diligence: 80 }, moves: ['Lice_Swarm', 'Fade'], xpYield: 220, moneyYield: { perutah: 50 } },
    'plague_beasts': { name: "Arov (Wild Beasts)", emoji: '🦁', type: 'Gevurah', baseStats: { hp: 300, attack: 60, defense: 20, diligence: 40 }, moves: ['Beast_Roar', 'Gore'], xpYield: 250, moneyYield: { perutah: 100 } },
    'plague_pestilence': { name: "Dever (Pestilence)", emoji: '🦠', type: 'Qliphoth', baseStats: { hp: 200, attack: 50, defense: 20, diligence: 20 }, moves: ['Pestilence_Rot', 'Collapse'], xpYield: 240, moneyYield: { perutah: 80 } },
    'plague_boils': { name: "Shchin (Boils)", emoji: '🤕', type: 'Gevurah', baseStats: { hp: 180, attack: 40, defense: 30, diligence: 10 }, moves: ['Boil_Eruption', 'Adhere'], xpYield: 230, moneyYield: { perutah: 60 } },
    'plague_hail': { name: "Barad (Hail)", emoji: '🧊', type: 'Tiferet', baseStats: { hp: 250, attack: 50, defense: 50, diligence: 30 }, moves: ['Hail_Fire_Ice', 'Propel_Stones'], xpYield: 280, moneyYield: { perutah: 120 } },
    'plague_locusts': { name: "Arbeh (Locusts)", emoji: '🦗', type: 'Netzach', baseStats: { hp: 100, attack: 40, defense: 10, diligence: 100 }, moves: ['Locust_Devour', 'Zealous_Rush'], xpYield: 260, moneyYield: { perutah: 90 } },
    'plague_darkness': { name: "Choshech (Darkness)", emoji: '🌑', type: 'Gevurah', baseStats: { hp: 200, attack: 20, defense: 60, diligence: 10 }, moves: ['Darkness_Thick', 'Whisper_Negation'], xpYield: 270, moneyYield: { perutah: 100 } },
    'plague_firstborn': { name: "Makat Bechorot", emoji: '💀', type: 'Keter', baseStats: { hp: 10, attack: 200, defense: 0, diligence: 100 }, moves: ['Firstborn_Strike'], xpYield: 1000, moneyYield: { perutah: 500 } },
};

// --- TIER 3: THE 12 TRIBES (SPIRITS) (12) ---
const shevatim = {
    'spirit_reuven': { name: "Spirit of Reuven", emoji: '💧', type: 'Chesed', baseStats: { hp: 250, attack: 40, defense: 40, diligence: 30 }, moves: ['Flow', 'Run_Gimel'], xpYield: 300, moneyYield: { perutah: 200 } },
    'spirit_shimon': { name: "Spirit of Shimon", emoji: '⚔️', type: 'Gevurah', baseStats: { hp: 200, attack: 70, defense: 30, diligence: 40 }, moves: ['Gevurah_Rebuke', 'Zealous_Rush'], xpYield: 300, moneyYield: { perutah: 200 } },
    'spirit_levi': { name: "Spirit of Levi", emoji: '🛡️', type: 'Gevurah', baseStats: { hp: 220, attack: 50, defense: 50, diligence: 50 }, moves: ['Harden', 'Speech_Pei'], xpYield: 300, moneyYield: { perutah: 200 } },
    'spirit_judah': { name: "Spirit of Judah", emoji: '🦁', type: 'Malkuth', baseStats: { hp: 400, attack: 60, defense: 60, diligence: 20 }, moves: ['Roar_of_Torah', 'Pummel'], xpYield: 400, moneyYield: { perutah: 500 } },
    'spirit_issachar': { name: "Spirit of Yissachar", emoji: '📚', type: 'Binah', baseStats: { hp: 150, attack: 20, defense: 80, diligence: 80 }, moves: ['Teach_Lamed', 'Analyze'], xpYield: 350, moneyYield: { perutah: 100 } },
    'spirit_zevulun': { name: "Spirit of Zevulun", emoji: '⛵', type: 'Chesed', baseStats: { hp: 200, attack: 40, defense: 40, diligence: 60 }, moves: ['Flow', 'Tzedakah_Toss'], xpYield: 350, moneyYield: { perutah: 1000 } },
    'spirit_dan': { name: "Spirit of Dan", emoji: '⚖️', type: 'Gevurah', baseStats: { hp: 200, attack: 50, defense: 50, diligence: 40 }, moves: ['Judge', 'Iron_Grip'], xpYield: 300, moneyYield: { perutah: 200 } },
    'spirit_naftali': { name: "Spirit of Naftali", emoji: '🦌', type: 'Netzach', baseStats: { hp: 180, attack: 40, defense: 20, diligence: 100 }, moves: ['Run_Gimel', 'Sway'], xpYield: 300, moneyYield: { perutah: 200 } },
    'spirit_gad': { name: "Spirit of Gad", emoji: '⛺', type: 'Hod', baseStats: { hp: 300, attack: 50, defense: 50, diligence: 20 }, moves: ['Harden', 'Cut_Zayin'], xpYield: 300, moneyYield: { perutah: 200 } },
    'spirit_asher': { name: "Spirit of Asher", emoji: '🍞', type: 'Netzach', baseStats: { hp: 250, attack: 30, defense: 60, diligence: 40 }, moves: ['Soothing_Mist', 'Open_Close'], xpYield: 300, moneyYield: { perutah: 200 } },
    'spirit_joseph': { name: "Spirit of Joseph", emoji: '👑', type: 'Yesod', baseStats: { hp: 350, attack: 50, defense: 50, diligence: 50 }, moves: ['Dream_Solve', 'Conceal'], xpYield: 450, moneyYield: { perutah: 500 } },
    'spirit_benjamin': { name: "Spirit of Benjamin", emoji: '🐺', type: 'Malkuth', baseStats: { hp: 200, attack: 60, defense: 40, diligence: 60 }, moves: ['Gore', 'Hunt_Tzadik'], xpYield: 300, moneyYield: { perutah: 200 } },
};

// --- TIER 4: THE 7 SHEPHERDS (USHPIZIN) (7) ---
const shepherds = {
    'avraham_friend': { name: "Avraham Avinu", emoji: '⛺', type: 'Chesed', baseStats: { hp: 500, attack: 20, defense: 80, diligence: 80 }, moves: ['Hospitality', 'Flow'], xpYield: 1000, moneyYield: { perutah: 0 } },
    'yitzchak_fear': { name: "Yitzchak Avinu", emoji: '🔥', type: 'Gevurah', baseStats: { hp: 400, attack: 80, defense: 80, diligence: 40 }, moves: ['Binding', 'Gevurah_Rebuke'], xpYield: 1000, moneyYield: { perutah: 0 } },
    'yaakov_truth': { name: "Yaakov Avinu", emoji: '☀️', type: 'Tiferet', baseStats: { hp: 450, attack: 60, defense: 60, diligence: 60 }, moves: ['Unite', 'Truth_Tav'], xpYield: 1000, moneyYield: { perutah: 0 } },
    'moshe_torah': { name: "Moshe Rabbeinu", emoji: '⛰️', type: 'Netzach', baseStats: { hp: 300, attack: 100, defense: 100, diligence: 100 }, moves: ['Speech_Pei', 'Transcend'], xpYield: 2000, moneyYield: { perutah: 0 } },
    'aharon_peace': { name: "Aharon HaKohen", emoji: '🌸', type: 'Hod', baseStats: { hp: 400, attack: 10, defense: 100, diligence: 100 }, moves: ['Soothing_Mist', 'Run_Gimel'], xpYield: 1000, moneyYield: { perutah: 0 } },
    'yosef_tzadik': { name: "Yosef HaTzadik", emoji: '👔', type: 'Yesod', baseStats: { hp: 400, attack: 60, defense: 60, diligence: 80 }, moves: ['Dream_Solve', 'Conceal'], xpYield: 1000, moneyYield: { perutah: 1000 } },
    'david_king': { name: "David HaMelech", emoji: '🎻', type: 'Malkuth', baseStats: { hp: 500, attack: 70, defense: 70, diligence: 70 }, moves: ['Sweet_Singer', 'Maccabee_Smash'], xpYield: 1500, moneyYield: { perutah: 0 } },
};

// --- TIER 5: THE 6 ORDERS OF MISHNAH (6) ---
const mishnah = {
    'seder_zeraim': { name: "Zeraim (Seeds)", emoji: '🌾', type: 'Netzach', baseStats: { hp: 200, attack: 20, defense: 40, diligence: 40 }, moves: ['Locust_Devour', 'Open_Close'], xpYield: 200, moneyYield: { perutah: 50 } },
    'seder_moed': { name: "Moed (Times)", emoji: '🕰️', type: 'Tiferet', baseStats: { hp: 200, attack: 30, defense: 30, diligence: 60 }, moves: ['Sabbath_Rest', 'Flash_Yud'], xpYield: 200, moneyYield: { perutah: 50 } },
    'seder_nashim': { name: "Nashim (Women)", emoji: '💍', type: 'Chesed', baseStats: { hp: 200, attack: 10, defense: 50, diligence: 50 }, moves: ['Unite', 'Hospitality'], xpYield: 200, moneyYield: { perutah: 50 } },
    'seder_nezikin': { name: "Nezikin (Damages)", emoji: '⚖️', type: 'Gevurah', baseStats: { hp: 250, attack: 50, defense: 50, diligence: 30 }, moves: ['Cut_Zayin', 'Nullify'], xpYield: 250, moneyYield: { perutah: 100 } },
    'seder_kodashim': { name: "Kodashim (Holies)", emoji: '🏛️', type: 'Chokhmah', baseStats: { hp: 300, attack: 40, defense: 40, diligence: 70 }, moves: ['Consume_Shin', 'Transcend'], xpYield: 300, moneyYield: { perutah: 0 } },
    'seder_taharot': { name: "Taharot (Purities)", emoji: '💧', type: 'Binah', baseStats: { hp: 300, attack: 20, defense: 80, diligence: 50 }, moves: ['Soothing_Mist', 'Conceal'], xpYield: 300, moneyYield: { perutah: 0 } },
};

// --- TIER 6: THE HOLIDAYS (9) ---
const holidays = {
    'chag_shabbat': { name: "Shabbat Kodesh", emoji: '🕯️', type: 'Keter', baseStats: { hp: 1000, attack: 0, defense: 100, diligence: 0 }, moves: ['Sabbath_Rest'], xpYield: 500, moneyYield: { perutah: 0 } },
    'chag_rosh_hashanah': { name: "Rosh HaShanah", emoji: '🎺', type: 'Gevurah', baseStats: { hp: 400, attack: 50, defense: 50, diligence: 50 }, moves: ['Speech_Pei', 'Flash_Yud'], xpYield: 400, moneyYield: { perutah: 0 } },
    'chag_yom_kippur': { name: "Yom Kippur", emoji: '☁️', type: 'Binah', baseStats: { hp: 500, attack: 0, defense: 100, diligence: 100 }, moves: ['Transcend', 'Unite'], xpYield: 600, moneyYield: { perutah: 0 } },
    'chag_sukkot': { name: "Sukkot", emoji: '🍋', type: 'Chesed', baseStats: { hp: 300, attack: 30, defense: 30, diligence: 60 }, moves: ['Hospitality', 'Run_Gimel'], xpYield: 300, moneyYield: { perutah: 0 } },
    'chag_chanukah': { name: "Chanukah", emoji: '🕎', type: 'Hod', baseStats: { hp: 300, attack: 60, defense: 30, diligence: 70 }, moves: ['Maccabee_Smash', 'Flash_Yud'], xpYield: 350, moneyYield: { perutah: 80 } },
    'chag_purim': { name: "Purim", emoji: '🎭', type: 'Netzach', baseStats: { hp: 300, attack: 50, defense: 50, diligence: 50 }, moves: ['Paradox', 'Copycat_Kuf'], xpYield: 350, moneyYield: { perutah: 100 } },
    'chag_pesach': { name: "Pesach", emoji: '🍞', type: 'Chesed', baseStats: { hp: 350, attack: 40, defense: 40, diligence: 80 }, moves: ['Run_Gimel', 'Open_Close'], xpYield: 400, moneyYield: { perutah: 0 } },
    'chag_shavuot': { name: "Shavuot", emoji: '⛰️', type: 'Tiferet', baseStats: { hp: 400, attack: 50, defense: 50, diligence: 90 }, moves: ['Teach_Lamed', 'Flash_Yud'], xpYield: 450, moneyYield: { perutah: 0 } },
    'chag_lag_baomer': { name: "Lag BaOmer", emoji: '🔥', type: 'Hod', baseStats: { hp: 350, attack: 80, defense: 20, diligence: 60 }, moves: ['Consume_Shin', 'Flash_Yud'], xpYield: 330, moneyYield: { perutah: 0 } },
};

export const the66 = {
    ...otiyot,
    ...makkot,
    ...shevatim,
    ...shepherds,
    ...mishnah,
    ...holidays
};
