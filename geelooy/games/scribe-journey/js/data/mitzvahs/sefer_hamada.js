
// B"H
// js/data/mitzvahs/sefer_hamada.js

// 56 Selected Mitzvahs from Sefer HaMada & Ahavah
export const seferHaMada = [
    // --- YESODEI HATORAH (Foundations) ---
    { id: 'm_1_know_god', name: "1. Know there is a God", desc: "The foundation of all foundations. (Auto-Unlock)", condition: (s) => true },
    { id: 'm_2_unity', name: "2. Unity of God", desc: "Hashem Echad. Complete the Yud-Tet Unification.", condition: (s) => s.player.flags['unified_daat'] },
    { id: 'm_3_love_god', name: "3. Love God", desc: "Meditate 10 times.", condition: (s) => s.player.flags['meditated_count'] >= 10 },
    { id: 'm_4_fear_god', name: "4. Fear God", desc: "Visit Gehinnom.", condition: (s) => s.player.flags['visited_gehinnom'] },
    { id: 'm_5_worship', name: "5. Serve Him", desc: "Win 50 Battles.", condition: (s) => s.stats.battlesWon >= 50 },
    { id: 'm_6_cleave', name: "6. Cleave to Him", desc: "Visit Gan Eden.", condition: (s) => s.player.flags['entered_gan_eden'] },
    { id: 'm_7_oath', name: "7. Swear by His Name", desc: "Take an oath in the Court.", condition: (s) => s.player.flags['took_oath'] },
    { id: 'm_8_walk_ways', name: "8. Walk in His Ways", desc: "Perform 5 Acts of Kindness (Side Quests).", condition: (s) => s.stats.tzedakahCount >= 5 },
    { id: 'm_9_sanctify', name: "9. Kiddush Hashem", desc: "Win a battle with < 10% HP.", condition: (s) => s.player.flags['won_low_hp'] },
    
    // --- DE'OT (Character) ---
    { id: 'm_11_learn_teach', name: "11. Learn & Teach Torah", desc: "Read 20 Seforim.", condition: (s) => s.stats.booksRead >= 20 },
    { id: 'm_12_respect_elders', name: "12. Honor Teachers", desc: "Speak to the Elder Scribe.", condition: (s) => s.player.flags['spoke_elder'] },
    { id: 'm_13_tefillin_head', name: "13. Tefillin Shel Rosh", desc: "Acquire Tefillin.", condition: (s) => s.player.inventory.some(i => i.id === 'tefillin_pair') },
    { id: 'm_14_tefillin_hand', name: "14. Tefillin Shel Yad", desc: "Bind the arm. (Same as above)", condition: (s) => s.player.inventory.some(i => i.id === 'tefillin_pair') },
    { id: 'm_15_tzitzit', name: "15. Tzitzit", desc: "Wear the fringes.", condition: (s) => s.player.inventory.some(i => i.id === 'tallit_gadol') },
    { id: 'm_16_mezuzah', name: "16. Mezuzah", desc: "Craft a Mezuzah.", condition: (s) => s.stats.itemsCrafted >= 1 && s.player.inventory.some(i => i.id === 'mezuzah_scroll') },
    { id: 'm_17_king', name: "17. Appoint a King", desc: "Meet the King in Tiferet.", condition: (s) => s.player.flags['met_king_shlomo'] },
    { id: 'm_18_write_torah', name: "18. Write Sefer Torah", desc: "Complete the Scribe's Masterwork.", condition: (s) => s.player.flags['wrote_torah'] },
    { id: 'm_19_grace', name: "19. Birkat HaMazon", desc: "Eat 10 Food Items.", condition: (s) => s.stats.foodEaten >= 10 },
    
    // --- AVODAH ZARAH (Idolatry) ---
    { id: 'n_1_no_other_gods', name: "N1. No Other Gods", desc: "Defeat the Golden Calf.", condition: (s) => s.player.flags['defeated_golden_calf'] },
    { id: 'n_2_no_images', name: "N2. No Graven Images", desc: "Destroy 5 Statues/Golems.", condition: (s) => s.stats.golemsDefeated >= 5 },
    { id: 'n_5_bow_down', name: "N5. Do Not Bow", desc: "Refuse to bow in Babel.", condition: (s) => s.player.flags['climbed_babel'] },
    
    // --- TESHUVAH (Repentance) ---
    { id: 'm_73_confess', name: "73. Confess Sins", desc: "Visit the Mikveh and Meditate.", condition: (s) => s.player.flags['immersed_mikveh'] },
    
    // --- KRIAT SHEMA ---
    { id: 'm_10_shema', name: "10. Recite Shema", desc: "Read Shema Morning & Evening (Interaction).", condition: (s) => s.player.flags['read_shema'] },
    
    // --- TEFILLAH (Prayer) ---
    { id: 'm_5_pray', name: "5. Serve with Heart (Prayer)", desc: "Pray at the Kotel.", condition: (s) => s.player.flags['visited_kotel'] },
    { id: 'm_128_priestly_bless', name: "128. Priestly Blessing", desc: "Receive Bracha from a Kohen.", condition: (s) => s.player.flags['received_bracha'] },
    
    // --- SHABBAT ---
    { id: 'm_154_rest_shabbat', name: "154. Rest on Shabbat", desc: "Experience a Shabbat.", condition: (s) => s.stats.shabbatsObserved >= 1 },
    { id: 'm_155_kiddush', name: "155. Sanctify Shabbat", desc: "Drink Wine on Shabbat.", condition: (s) => s.player.flags['kiddush_made'] },
    
    // --- FESTIVALS ---
    { id: 'm_159_matzah', name: "159. Eat Matzah", desc: "Eat Shmurah Matzah.", condition: (s) => s.player.flags['ate_matzah'] },
    { id: 'm_161_count_omer', name: "161. Count the Omer", desc: "Count 49 Days (In-game).", condition: (s) => s.time.day >= 49 },
    { id: 'm_169_lulav', name: "169. Take Lulav", desc: "Shake the 4 Species.", condition: (s) => s.player.inventory.some(i => i.id === 'lulav_bundle') },
    { id: 'm_170_sukkah', name: "170. Dwell in Sukkah", desc: "Enter a Sukkah.", condition: (s) => s.player.flags['entered_sukkah'] },
    { id: 'm_171_shofar', name: "171. Hear Shofar", desc: "Use the Shofar Item.", condition: (s) => s.player.flags['blew_shofar'] },
    
    // --- COMMUNITY ---
    { id: 'm_206_love_neighbor', name: "206. Love Neighbor", desc: "Complete 10 Mivtzoim interactions.", condition: (s) => s.stats.soulsInspired >= 10 },
    { id: 'm_207_love_stranger', name: "207. Love the Stranger", desc: "Help the Refugee in Ir Miklat.", condition: (s) => s.player.flags['helped_refugee'] },
    { id: 'm_208_just_scales', name: "208. Just Scales", desc: "Trade fairly with Merchant.", condition: (s) => s.stats.itemsBought >= 5 },
    { id: 'm_209_honor_scholars', name: "209. Rise for Grey Head", desc: "Help the Sofer Stam.", condition: (s) => s.player.flags['helped_sofer'] },
    
    // --- SEED (Zeraim) ---
    { id: 'm_119_kilayim', name: "N119. No Mixed Seeds", desc: "Separate the Kilayim Chimera.", condition: (s) => s.player.flags['defeated_kilayim'] },
    { id: 'm_120_peah', name: "120. Leave Peah", desc: "Leave corner grain unharvested.", condition: (s) => s.player.flags['left_peah'] },
    { id: 'm_121_leket', name: "121. Leave Leket", desc: "Don't pick up dropped loot in fields.", condition: (s) => s.player.flags['left_leket'] },
    { id: 'm_125_first_fruits', name: "125. Bikkurim", desc: "Bring First Fruits to the Temple.", condition: (s) => s.player.flags['brought_bikkurim'] },
    { id: 'm_134_terumah', name: "134. Terumah", desc: "Separate the priest's share.", condition: (s) => s.player.flags['separated_terumah'] },
    { id: 'm_135_maaser', name: "135. Maaser Rishon", desc: "Tithe the Levite.", condition: (s) => s.player.flags['separated_maaser'] },
    
    // --- FOOD ---
    { id: 'n_180_non_kosher', name: "N180. No Neveilah", desc: "Do not eat animals not ritual slaughtered.", condition: (s) => true }, // Passive
    { id: 'n_181_torn', name: "N181. No Treifah", desc: "Do not eat torn animals.", condition: (s) => true },
    { id: 'n_186_cook_milk_meat', name: "N186. No Milk & Meat", desc: "Do not combine.", condition: (s) => true },
    
    // --- PURITY ---
    { id: 'm_96_niddah', name: "96. Tumah of Niddah", desc: "Learn laws of Family Purity.", condition: (s) => s.player.flags['found_page_mikvaot'] },
    { id: 'm_107_mikveh', name: "107. Immerse in Mikveh", desc: "Purify in Living Waters.", condition: (s) => s.player.flags['immersed_mikveh'] },
    
    // --- VOWS ---
    { id: 'm_94_keep_word', name: "94. Keep Your Word", desc: "Complete quests you accept.", condition: (s) => s.player.completedQuests.length >= 5 },
    { id: 'n_157_break_word', name: "N157. Do Not Break Word", desc: "Don't abandon quests.", condition: (s) => true }, // Placeholder
    
    // --- SIZZLE ---
    { id: 'm_56_destroy_amalek', name: "56. Destroy Amalek", desc: "Defeat Amalek Boss.", condition: (s) => s.player.flags['defeated_amalek_boss'] },
    { id: 'm_57_remember_amalek', name: "57. Remember Amalek", desc: "Encounter Amalek mobs.", condition: (s) => s.stats.battlesWon > 0 }
];
