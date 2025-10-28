// B"H
// js/data/items.js

export const items = {
    // ######################################################
    // #                  CONSUMABLE ITEMS                  #
    // ######################################################

    'manna_dew': { 
        id: 'manna_dew', name: 'Manna Dew', 
        desc: 'A single drop of heavenly dew that coalesced in the fields of Malkuth. Restores 30 HP.', 
        type: 'consumable', effect: { stat: 'hp', amount: 30 }, sellValue: 15 
    },
    'ink_of_potential': { 
        id: 'ink_of_potential', name: 'Ink of Potential', 
        desc: 'A vial of ink humming with unexpressed thoughts. Restores 20 Kavanah.', 
        type: 'consumable', effect: { stat: 'kavanah', amount: 20 }, sellValue: 25 
    },
    'elixir_of_clarity': { 
        id: 'elixir_of_clarity', name: 'Elixir of Clarity', 
        desc: 'A sharp, cleansing fluid distilled from the streams of Chesed. Restores 50 HP.', 
        type: 'consumable', effect: { stat: 'hp', amount: 50 }, sellValue: 40 
    },
    'dust_of_tiferet': {
        id: 'dust_of_tiferet', name: 'Dust of Tiferet',
        desc: 'Glimmering dust that radiates perfect balance. Cures status ailments like confusion or silence.',
        type: 'consumable', effect: { stat: 'cure_status' }, sellValue: 100
    },
    'bread_of_lechem_panim': {
        id: 'bread_of_lechem_panim', name: 'Crumb of Lechem Panim',
        desc: 'A crumb from the "Showbread," imbued with divine sustenance. Fully restores one Musag\'s HP and Kavanah.',
        type: 'consumable', effect: { stat: 'full_restore' }, sellValue: 300
    },

    // ######################################################
    // #            CAPTURE VESSELS (KELIM / KLIPOT)        #
    // ######################################################

    'kli_of_malkuth': { 
        id: 'kli_of_malkuth', name: 'Kli of Malkuth', 
        desc: 'A sturdy clay vessel, perfect for containing concepts rooted in the physical world.', 
        type: 'kli', captureRate: 0.5, sellValue: 50 
    },
    'kli_of_yesod': { 
        id: 'kli_of_yesod', name: 'Kli of Yesod', 
        desc: 'A shimmering, ethereal vessel woven from moonlight and dreams, for capturing mystical concepts.', 
        type: 'kli', captureRate: 0.6, sellValue: 150 
    },
    'kli_of_gevurah': {
        id: 'kli_of_gevurah', name: 'Kli of Gevurah',
        desc: 'A vessel of obsidian and cooled lava, defined by strict boundaries. Excels at capturing concepts of judgment and severity.',
        type: 'kli', captureRate: 0.7, sellValue: 250
    },
    'kli_ein_sof': {
        id: 'kli_ein_sof', name: 'Kli Ein Sof',
        desc: 'A vessel that is not a vessel, a container of pure potential. It is said to be able to contain any concept without fail. One-time use.',
        type: 'kli', captureRate: 1.0, sellValue: 0 // Cannot be bought or sold, only found.
    },
    
    // ######################################################
    // #                TOMES (LEARN MOVES)                 #
    // ######################################################

    'tome_of_pummel': { id: 'tome_of_pummel', name: 'Tome of Pummel', desc: 'A heavy scroll detailing basic physical assertion. Teaches "Pummel".', type: 'tome', moveId: 'Pummel' },
    'tome_of_harden': { id: 'tome_of_harden', name: 'Tome of Harden', desc: 'A rigid tablet describing defensive posture and the nature of Gevurah. Teaches "Harden".', type: 'tome', moveId: 'Harden' },
    'tome_of_flow': { id: 'tome_of_flow', name: 'Tome of Flow', desc: 'A water-stained manuscript explaining the power of yielding. Teaches "Flow".', type: 'tome', moveId: 'Flow' },
    'tome_of_gematria': { id: 'tome_of_gematria', name: 'Tome of Gematria', desc: 'A complex codex filled with numerical charts and divine calculations. Teaches the powerful move "Gematria".', type: 'tome', moveId: 'Gematria' },

    // ######################################################
    // #              KEY & QUEST ITEMS (HALACHA)           #
    // ######################################################

    'rambam_page_foundations': { id: 'rambam_page_foundations', name: 'Page of Mishneh Torah (Foundations)', desc: 'A lost page discussing the "Foundation of all Foundations and the Pillar of all Wisdom." It radiates a profound stability.', type: 'key_item', isQuestItem: true },
    'rambam_page_damages': { id: 'rambam_page_damages', name: 'Page of Mishneh Torah (Damages)', desc: 'Details liability for a Tam Ox, an Uncovered Pit, and Fire. The ink seems to shift, illustrating each case.', type: 'key_item', isQuestItem: true },
    'rambam_page_mikvaot': { id: 'rambam_page_mikvaot', name: 'Page of Mishneh Torah (Mikvaot)', desc: 'Describes the laws of a ritual bath, detailing the required measure of 40 Se\'ah and what invalidates it, such as "drawn water."', type: 'key_item', isQuestItem: true },
    
    'cavern_key': { id: 'cavern_key', name: 'Cracked Stone Key', desc: 'A key given by the Echo of Rambam. It seems to fit a lock of ancient, letter-carved stone.', type: 'key_item', isQuestItem: true },
    'measuring_vessel': { id: 'measuring_vessel', name: '40 Se\'ah Vessel', desc: 'A large, ethereal vessel created by your understanding. It is needed to measure the waters for a kosher mikveh.', type: 'key_item', isQuestItem: true },
    'unlit_torch': { id: 'unlit_torch', name: 'Unlit Torch', desc: 'A torch needing a flame to light the deeper parts of the caverns.', type: 'key_item', isQuestItem: true },
    'pure_spring_water': { id: 'pure_spring_water', name: 'Pure Spring Water', desc: 'Living water collected from the heart of the Chamber of Pure Waters.', type: 'key_item', isQuestItem: true },

    // ######################################################
    // #           FRAGMENTS OF THE GREAT SEFER             #
    // ######################################################

    'sefer_fragment_aleph': { 
        id: 'sefer_fragment_aleph', name: 'Sefer Fragment (Aleph)', 
        desc: 'The first shattered piece of the Great Sefer. It hums with the silent, singular potential of all Creation.', 
        type: 'key_item', isQuestItem: true 
    },
    'sefer_fragment_bet': { 
        id: 'sefer_fragment_bet', name: 'Sefer Fragment (Bet)', 
        desc: 'The second piece of the Great Sefer, containing the blueprint of duality: light and dark, giving and receiving, spirit and vessel.', 
        type: 'key_item', isQuestItem: true 
    },
};