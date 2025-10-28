// B"H
// js/data/moves.js

export const moves = {
    // --- PHYSICAL ---
    'Pummel': { name: 'Pummel', power: 40, cost: 0, type: 'Physical', desc: 'A straightforward physical blow.' },
    'Gore': { name: 'Gore', power: 50, cost: 8, type: 'Physical', desc: 'A piercing attack with horns. An act that is not its usual nature (Shinui).' },
    'Peck': { name: 'Peck', power: 30, cost: 0, type: 'Physical', desc: 'A quick, sharp strike.' },
    'Collapse': { name: 'Collapse', power: 60, cost: 10, type: 'Physical', desc: 'A heavy, unavoidable impact, like falling into a pit.' },

    // --- STATUS & TACTICAL ---
    'Harden': { name: 'Harden', power: 0, cost: 5, type: 'Status', effect: { target: 'self', stat: 'defense', amount: 1 }, desc: 'Solidify one\'s form, increasing defense.' },
    'Sway': { name: 'Sway', power: 20, cost: 0, type: 'Netzach', desc: 'A light, evasive strike.' },
    'Root_Bind': { name: 'Root Bind', power: 0, cost: 8, type: 'Netzach', effect: { target: 'opponent', stat: 'diligence', amount: -1 }, desc: 'Entangle the opponent, reducing diligence.' },
    'Mirror_Image': { name: 'Mirror Image', power: 0, cost: 10, type: 'Mystical', effect: { target: 'self', stat: 'diligence', amount: 2 }, desc: 'Create illusions, sharply raising diligence.' },
    'Fade': { name: 'Fade', power: 0, cost: 15, type: 'Status', desc: 'Become briefly harder to hit, raising diligence.', effect: { target: 'self', stat: 'diligence', amount: 2 }},
    'Intervene': { name: 'Intervene', power: 0, cost: 12, type: 'Status', effect: { target: 'opponent', stat: 'defense', amount: -2 }, desc: 'Create a barrier (Chatzitzah) that weakens the opponent\'s defense.' },
    'Adhere': { name: 'Adhere', power: 25, cost: 5, type: 'Status', desc: 'A sticky attack that lowers diligence.'},

    // --- MYSTICAL & SEFIROTIC ---
    'Shift': { name: 'Shift', power: 30, cost: 5, type: 'Mystical', desc: 'A quick, unpredictable strike.' },
    'Ethereal_Strike': { name: 'Ethereal Strike', power: 55, cost: 12, type: 'Mystical', desc: 'A blow that strikes the concept directly.' },
    'Gevurah_Rebuke': { name: 'Gevurah\'s Rebuke', power: 60, cost: 15, type: 'Gevurah', desc: 'A powerful strike of pure judgment.' },
    'Soothing_Mist': { name: 'Soothing Mist', power: 0, cost: 12, type: 'Chesed', effect: { target: 'self', stat: 'heal', amount: 40 }, desc: 'A gentle mist that restores conceptual integrity.' },
    'Flow': { name: 'Flow', power: 50, cost: 10, type: 'Chesed', desc: 'A yielding but powerful strike.' },
    'Invalidate': { name: 'Invalidate', power: 50, cost: 15, type: 'Chesed', desc: 'A strike using disconnected ("drawn") force, powerful but spiritually flawed.' },

    // --- QLIPHOTH & SPECIAL ---
    'Whisper_Negation': { name: 'Whisper of Negation', power: 45, cost: 10, type: 'Qliphoth', desc: 'An unnerving whisper that drains conviction.' },
    'Propel_Stones': { name: 'Propel Stones', power: 25, cost: 4, type: 'Physical', desc: 'Indirect damage (Toldah), less potent but harder to avoid.' },
};```

---

### 3. `js/data/items.js`

The item database, now including new Tomes and Halachic quest items.

```javascript
// B"H
// js/data/items.js

export const items = {
    // --- CONSUMABLES ---
    'manna_dew': { id: 'manna_dew', name: 'Manna Dew', desc: 'A single drop of heavenly dew. Restores 30 HP.', type: 'consumable', effect: { stat: 'hp', amount: 30 }, sellValue: 15 },
    'ink_of_potential': { id: 'ink_of_potential', name: 'Ink of Potential', desc: 'Potent ink that restores 20 Kavanah.', type: 'consumable', effect: { stat: 'kavanah', amount: 20 }, sellValue: 25 },
    'elixir_of_clarity': { id: 'elixir_of_clarity', name: 'Elixir of Clarity', desc: 'A sharp, cleansing fluid that restores 50 HP.', type: 'consumable', effect: { stat: 'hp', amount: 50 }, sellValue: 40 },

    // --- CAPTURE VESSELS (KLIPOT) ---
    'kli_of_malkuth': { id: 'kli_of_malkuth', name: 'Kli of Malkuth', desc: 'A clay vessel to capture physical concepts.', type: 'kli', captureRate: 0.5, sellValue: 50 },
    'kli_of_yesod': { id: 'kli_of_yesod', name: 'Kli of Yesod', desc: 'A shimmering, ethereal vessel for mystical concepts.', type: 'kli', captureRate: 0.6, sellValue: 150 },

    // --- TOMES (LEARN MOVES) ---
    'tome_of_pummel': { id: 'tome_of_pummel', name: 'Tome of Pummel', desc: 'A heavy scroll detailing basic physical assertion. Teaches "Pummel".', type: 'tome', moveId: 'Pummel' },
    'tome_of_harden': { id: 'tome_of_harden', name: 'Tome of Harden', desc: 'A rigid tablet describing defensive posture. Teaches "Harden".', type: 'tome', moveId: 'Harden' },
    
    // --- KEY & QUEST ITEMS ---
    'rambam_page_foundations': { id: 'rambam_page_foundations', name: 'Page of Mishneh Torah (Foundations)', desc: 'A lost page discussing the Foundation of all Foundations. It radiates a profound stability.', type: 'key_item', isQuestItem: true },
    'rambam_page_damages': { id: 'rambam_page_damages', name: 'Page of Mishneh Torah (Damages)', desc: 'Details liability for a Tam Ox, a Pit, and Fire. The ink seems to shift as you read.', type: 'key_item', isQuestItem: true },
    'rambam_page_mikvaot': { id: 'rambam_page_mikvaot', name: 'Page of Mishneh Torah (Mikvaot)', desc: 'Describes the laws of a ritual bath, detailing the required measure and what invalidates it.', type: 'key_item', isQuestItem: true },
    'cavern_key': { id: 'cavern_key', name: 'Cracked Stone Key', desc: 'Found in the scholars house. It seems to fit a lock of ancient stone.', type: 'key_item', isQuestItem: true },
    'measuring_vessel': { id: 'measuring_vessel', name: '40 Seah Vessel', desc: 'A vessel of immense size, said to hold the exact amount of water for a kosher mikveh.', type: 'key_item', isQuestItem: true },
};