// B"H
// js/data/world/majorCities.js

/**
 * Chapter 4: Every city has a house, every house has a master, and every master
 * guards a road. The player does not wander through accidental doors; the world
 * opens through learning, leveling, debate, and shlichus.
 */
export const MAJOR_CITIES = [
    { id: 'malkuth_village', name: 'Malkuth Village', chabadHouse: 'scribe_atheneum_main', role: 'Beginning and first letters', houses: ['scribe_house', 'farmer_house', 'gemach_room'], masterRabbi: { id: 'rabbi_malkuth_sofer', name: 'Rabbi Azriel the Sofer', level: 3, debateId: 'debate_malkuth_identity', unlocksRoad: 'road_malkuth_yesod' }, nextCity: 'yesod_shore' },
    { id: 'yesod_shore', name: 'Yesod Shore', chabadHouse: 'yesod_reflection_pool', role: 'Reflection and covenant', houses: ['fisher_house', 'moon_house', 'mirror_lodge'], masterRabbi: { id: 'rabbi_yesod_mashpia', name: 'Rabbi Nechemiah of Reflection', level: 8, debateId: 'debate_yesod_truth', unlocksRoad: 'road_yesod_netzach' }, nextCity: 'netzach_wilds_entrance' },
    { id: 'netzach_wilds_entrance', name: 'Netzach Wilds', chabadHouse: 'netzach_drum_circle', role: 'Endurance roads', houses: ['runner_hut', 'drummer_tent', 'vine_keeper_house'], masterRabbi: { id: 'rabbi_netzach_shaliach', name: 'Rabbi Pinchas of Endurance', level: 12, debateId: 'debate_netzach_persistence', unlocksRoad: 'road_netzach_hod' }, nextCity: 'hod_library' },
    { id: 'hod_library', name: 'Hod Academy', chabadHouse: 'hod_laboratory', role: 'Reason and structure', houses: ['logic_dorm', 'scribe_lab', 'debate_room'], masterRabbi: { id: 'rabbi_hod_maskil', name: 'Rabbi Menachem the Maskil', level: 16, debateId: 'debate_hod_structure', unlocksRoad: 'road_hod_gevurah' }, nextCity: 'gevurah_entrance' },
    { id: 'gevurah_entrance', name: 'Gevurah Fortress', chabadHouse: 'gevurah_armory', role: 'Discipline and guarded fire', houses: ['guard_barracks', 'forge_house', 'dayan_chamber'], masterRabbi: { id: 'rabbi_gevurah_dayan', name: 'Rabbi Shimon the Dayan', level: 22, debateId: 'debate_gevurah_fire', unlocksRoad: 'road_gevurah_chesed' }, nextCity: 'chesed_springs' },
    { id: 'chesed_springs', name: 'Chesed Springs', chabadHouse: 'chamber_of_pure_waters', role: 'Kindness and healing', houses: ['healer_house', 'hospitality_lodge', 'spring_keeper_home'], masterRabbi: { id: 'rabbi_chesed_rofeh', name: 'Rabbi Avraham the Healer', level: 26, debateId: 'debate_chesed_vessel', unlocksRoad: 'road_chesed_binah' }, nextCity: 'binah_entrance' },
    { id: 'binah_entrance', name: 'Binah Palace', chabadHouse: 'binah_gate_1', role: 'Understanding and gates', houses: ['mother_of_form_house', 'fifty_gate_study', 'architect_cell'], masterRabbi: { id: 'rabbi_binah_mevin', name: 'Rabbi Leah of Understanding', level: 32, debateId: 'debate_binah_form', unlocksRoad: 'road_binah_keter' }, nextCity: 'keter_heights' },
    { id: 'keter_heights', name: 'Keter Heights', chabadHouse: 'keter_heights', role: 'Crown and purpose', houses: ['bittul_retreat', 'will_observatory', 'crown_shelter'], masterRabbi: { id: 'rabbi_keter_bittul', name: 'Rabbi Elya of Bittul', level: 40, debateId: 'debate_keter_will', unlocksRoad: 'road_keter_770' }, nextCity: '770_main_hall' },
    { id: '770_main_hall', name: 'Crown Heights', chabadHouse: '770_main_hall', role: 'Mission hub', houses: ['kingston_guest_house', 'mivtzoim_dispatch', 'farbrengen_room'], masterRabbi: { id: 'rabbi_770_shlichus', name: 'Rabbi Levi of Shlichus', level: 45, debateId: 'debate_770_mission', unlocksRoad: 'road_770_kotel' }, nextCity: 'kotel_plaza' },
    { id: 'kotel_plaza', name: 'Kotel Plaza', chabadHouse: 'temple_mount_entrance', role: 'Memory and prayer', houses: ['note_house', 'levite_guest_room', 'stone_keeper_house'], masterRabbi: { id: 'rabbi_kotel_tfila', name: 'Rabbi Yehuda of Prayer', level: 50, debateId: 'debate_kotel_memory', unlocksRoad: 'road_kotel_midbar' }, nextCity: 'midbar_entrance' },
    { id: 'midbar_entrance', name: 'Midbar Roads', chabadHouse: 'tribes_encampment', role: 'Wandering and camps', houses: ['manna_tent', 'well_keeper_tent', 'tribe_guest_camp'], masterRabbi: { id: 'rabbi_midbar_manhig', name: 'Rabbi Moshe of the Roads', level: 55, debateId: 'debate_midbar_wandering', unlocksRoad: 'road_midbar_ganeden' }, nextCity: 'gan_eden_gate' },
    { id: 'gan_eden_gate', name: 'Gan Eden Gate', chabadHouse: 'gan_eden_tachton', role: 'Hidden victory horizon', houses: ['tzaddik_garden_house', 'levite_song_pavilion', 'dove_shelter'], masterRabbi: { id: 'rabbi_ganeden_tzaddik', name: 'Rabbi Chaim of Hidden Delight', level: 60, debateId: 'debate_ganeden_delight', unlocksRoad: 'road_ganeden_dirah' }, nextCity: null }
];

export const MASTER_RABBI_DEBATES = Object.fromEntries(
    MAJOR_CITIES.map((city, index) => [city.masterRabbi.debateId, {
        id: city.masterRabbi.debateId,
        rabbiId: city.masterRabbi.id,
        cityId: city.id,
        requiredLevel: city.masterRabbi.level,
        unlocksRoad: city.masterRabbi.unlocksRoad,
        opponent: { id: city.masterRabbi.id, level: city.masterRabbi.level, debateStyle: ['maamar', 'logic', 'avodah'][index % 3] },
        victoryFlag: `won_${city.masterRabbi.debateId}`,
        teaching: `Master the ${city.role.toLowerCase()} before the next dangerous road opens.`
    }])
);
