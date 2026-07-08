/**
 * B"H
 * @file scholarDebaters.js — TORAH SCHOLARS FOR DEBATE
 * 
 * These are not enemies — they are holy teachers.
 * Debate them to earn wisdom, items, and PaRDeS unlocks.
 * Victory = mutual elevation. Defeat = come back stronger.
 * 
 * Each Scholar has:
 *   - A specialization (book/subject)
 *   - A debate loadout (4 passages at their PaRDeS level)
 *   - A reward table (what you earn from debating them)
 *   - Dialogue trees (before, during, after debate)
 */

import { AVOS_CH1, AVOS_CH2 } from '../torah/books/pirkeiAvos/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { AVOS_CH3, AVOS_CH4, AVOS_CH5, AVOS_CH6 } from '../torah/books/pirkeiAvos/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { TANYA_PASSAGES }     from '../torah/books/tanyaPassages.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { GEMARA_PASSAGES }    from '../torah/books/gemaraPassages.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { ZOHAR_PASSAGES }     from '../torah/books/zoharPassages.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { REBBE_12_PESUKIM }   from '../torah/books/rebbesPesakim.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/** @function makeScholar — Factory for a scholar NPC entry */
const makeScholar = (id, name, title, specialty, madreiga, passages, rewards, position, dialogues) => ({
    id, name, title, specialty, madreiga,
    type: 'scholar', canDebate: true, isRealistic: false,
    debateLoadout: passages,
    maxHp: 80 + madreiga * 15,
    elementalType: 'holy',
    rewards,
    position,
    dialogues,
    clothes: [
        { meshName: 'jacket',    color: '#111111' },
        { meshName: 'top-hat',   color: '#0a0a0a' },
        { meshName: 'yamulka',   color: '#222222' },
        { meshName: 'pants',     color: '#1a1a1a' },
        { meshName: 'shoes',     color: '#111111' }
    ]
});

export const SCHOLAR_DEBATERS = [

    // ─── TIER 1: BEGINNERS (Madreiga 1–4) ───────────────────────────────────
    makeScholar(
        "scholar_yosef_student", "Yosef the Student", "Young Scholar",
        "Pirkei Avos — Basic Pshat", 1,
        [AVOS_CH1[0], AVOS_CH1[1], AVOS_CH1[2], AVOS_CH1[3]], // First 4 pesukim pshat
        {
            perutahs: 80, xp: 60,
            items: ['challah_small', 'scroll_chumash'],
            unlockPassage: 'avos_1_1'
        },
        { x: 20, y: 0, z: 10 },
        {
            greeting:  "B\"H! I've been studying the first chapter of Avos. Will you debate with me?",
            challenge: "Let us sharpen each other's understanding like iron sharpens iron!",
            victory:   "You bested me! B\"H — I learned so much from your answers!",
            defeat:    "Well done... Come, let us study together. Here — take this reward.",
            idle:      ["Did you know the three pillars support all reality?", "Every word of Torah is a world..."]
        }
    ),

    makeScholar(
        "scholar_dovid_young", "Dovid the Young", "Torah Pupil",
        "Pirkei Avos — Chapters 1–2", 2,
        [AVOS_CH1[4], AVOS_CH1[5], AVOS_CH2[0], AVOS_CH2[1]],
        {
            perutahs: 120, xp: 90,
            items: ['rugelach', 'potion_light_small'],
            unlockPassage: 'avos_1_14'
        },
        { x: -35, y: 0, z: 25 },
        {
            greeting:  "Ah, a fellow traveler on the path! Shall we debate some Hillel?",
            challenge: "Hillel said 'If not now, when?' — so let us begin now!",
            victory:   "Your depth of Pshat is remarkable. B\"H!",
            defeat:    "You showed me new angles in Hillel. Take this gift.",
            idle:      ["Hillel was the most humble of all, yet the greatest.", "If not now... when?"]
        }
    ),

    makeScholar(
        "scholar_miriam_teacher", "Miriam the Teacher", "Avos Teacher",
        "All of Pirkei Avos Pshat", 3,
        [AVOS_CH1[6], AVOS_CH2[2], AVOS_CH3[0], AVOS_CH4[0]],
        {
            perutahs: 180, xp: 140,
            items: ['honey_cake', 'gartel_black'],
            unlockPassage: 'avos_3_1'
        },
        { x: 60, y: 0, z: -20 },
        {
            greeting:  "I teach Avos to the children here. Want to test your knowledge?",
            challenge: "We'll cover all six chapters — one from each!",
            victory:   "Wonderful! You have a genuine understanding of Avos.",
            defeat:    "The students would learn from you! Here, take a reward.",
            idle:      ["Know where you came from...", "The world needs all three pillars."]
        }
    ),

    // ─── TIER 2: INTERMEDIATE (Madreiga 5–9) ────────────────────────────────
    makeScholar(
        "scholar_reb_moshe_mishnah", "Reb Moshe", "Mishnah Expert",
        "Mishnah & Avos — Remez Level", 5,
        [AVOS_CH1[1], AVOS_CH3[2], AVOS_CH5[0], AVOS_CH2[5]],
        {
            perutahs: 300, xp: 250,
            items: ['scroll_mishnah', 'kugel', 'yamulka_velvet'],
            unlockPassage: 'avos_5_1'
        },
        { x: -80, y: 0, z: 40 },
        {
            greeting:  "B\"H! I see you've been studying. Do you know the Remez (hint) within the Mishnah?",
            challenge: "Words have layers! Let us dig below the surface together.",
            victory:   "Your Remez understanding is excellent! The deeper meanings are revealing themselves to you.",
            defeat:    "Remarkable mastery of the hints within the text. A true student of the hidden Torah.",
            idle:      ["The Mishnah's dry legal language hides infinite depth.", "Every ruling hints to a cosmic principle."]
        }
    ),

    makeScholar(
        "scholar_reb_chaim_talmud", "Reb Chaim", "Talmud Scholar",
        "Gemara — Drush Level", 6,
        [GEMARA_PASSAGES[0], GEMARA_PASSAGES[2], GEMARA_PASSAGES[4], AVOS_CH4[1]],
        {
            perutahs: 420, xp: 350,
            items: ['scroll_gemara', 'hat_beaver', 'potion_light_medium'],
            unlockPassage: 'gemara_shabbos_31a'
        },
        { x: 100, y: 0, z: 60 },
        {
            greeting:  "Ah! A debater! The Gemara is not just law — it is a map of the soul! Shall we?",
            challenge: "The fire of Gemara debate will purify us both. L'chaim!",
            victory:   "You navigated the sugya with grace. B\"H!",
            defeat:    "Your Drush is like a torch lighting hidden chambers. Take this as my thanks.",
            idle:      ["Two hold the garment — but Torah belongs to all!", "'If not you, who?' is not just Hillel — it is Gemara too."]
        }
    ),

    makeScholar(
        "scholar_reb_shlomo_avos", "Reb Shlomo", "Avos Deeper Levels",
        "Pirkei Avos — Remez & Drush", 7,
        [AVOS_CH6[0], AVOS_CH5[5], AVOS_CH4[3], AVOS_CH3[3]],
        {
            perutahs: 500, xp: 420,
            items: ['gartel_silk', 'elixir_wisdom', 'shirt_techelet'],
            unlockPassage: 'avos_6_2'
        },
        { x: -120, y: 0, z: -50 },
        {
            greeting:  "The deeper chapters of Avos await! Chapter 6 — Kinyan Torah — is where it really begins!",
            challenge: "Show me you understand freedom through Torah, not despite it!",
            victory:   "Ben Bag Bag would be proud of you! Turn it and turn it — you certainly have!",
            defeat:    "I see why the Torah chose you to debate its depths. A holy soul!",
            idle:      ["Turn it and turn it — everything is in it!", "Freedom comes only through Torah."]
        }
    ),

    makeScholar(
        "scholar_reb_binyamin_tanya", "Reb Binyamin", "Tanya Scholar",
        "Tanya — All Levels", 8,
        [TANYA_PASSAGES[0], TANYA_PASSAGES[1], TANYA_PASSAGES[2], TANYA_PASSAGES[4]],
        {
            perutahs: 650, xp: 550,
            items: ['scroll_tanya', 'jacket_rebbe', 'hat_beaver'],
            unlockPassage: 'tanya_ch2'
        },
        { x: 150, y: 0, z: -70 },
        {
            greeting:  "The Alter Rebbe's Tanya — the Written Torah of Chassidus. Do you know the Beinoni?",
            challenge: "Two souls, one body, eternal battlefield. Let us see which soul wins in your Torah!",
            victory:   "The divine soul clearly rules your heart. B\"H!",
            defeat:    "Your Tanya knowledge is deep as the Alter Rebbe's ocean. I'm honored.",
            idle:      ["The Beinoni's battle never ends — and that is the point.", "Chelek Eloka mimaal mamash — literally!"]
        }
    ),

    // ─── TIER 3: ADVANCED (Madreiga 10–15) ──────────────────────────────────
    makeScholar(
        "scholar_gaon_avraham", "Gaon Avraham", "Head of the Academy",
        "Gemara & Tanya — Advanced", 10,
        [GEMARA_PASSAGES[1], GEMARA_PASSAGES[3], TANYA_PASSAGES[3], AVOS_CH5[2]],
        {
            perutahs: 900, xp: 800,
            items: ['scroll_gemara', 'jacket_shabbos', 'elixir_strength', 'hat_shtreimel'],
            unlockPassage: 'gemara_sanhedrin_37a'
        },
        { x: 200, y: 0, z: 0 },
        {
            greeting:  "B\"H — a serious student approaches! Are you ready for the depths of the Talmud?",
            challenge: "We go to the root of the law AND the Chassidic soul. Ready?",
            victory:   "A Gadol in the making! This is true debate — where both sides rise!",
            defeat:    "You have shown me dimensions of the text I had not considered. Take these gifts.",
            idle:      ["Each person is an entire world — so debate seriously!", "Great is teshuvah — sins become merits!"]
        }
    ),

    makeScholar(
        "scholar_rebbe_yitzchak", "Rebbe Yitzchak", "Senior Mashpia",
        "Rebbe's 12 Pesukim — Pshat & Remez", 12,
        [REBBE_12_PESUKIM[0], REBBE_12_PESUKIM[3], REBBE_12_PESUKIM[6], REBBE_12_PESUKIM[10]],
        {
            perutahs: 1200, xp: 1100,
            items: ['scroll_tanya', 'jacket_rebbe', 'gartel_gold', 'shirt_shabbos_gold'],
            unlockPassage: 'rebbe_pesuk_4'
        },
        { x: -200, y: 0, z: 100 },
        {
            greeting:  "The Rebbe's 12 Pesukim — each one a world! Do you know them by heart?",
            challenge: "These are not just verses. They are the Rebbe's eternal curriculum. Debate wisely!",
            victory:   "The Rebbe's words live through you! Mamash!",
            defeat:    "You embody the Rebbe's teaching. This is the highest praise I can give.",
            idle:      ["Torah Tzivah Lanu Moshe — our eternal inheritance!", "Shema Yisroel — unity beyond all comprehension."]
        }
    ),

    // ─── TIER 4: MASTERS (Madreiga 15–25) ───────────────────────────────────
    makeScholar(
        "scholar_mekubal_shimon", "Reb Shimon HaMekubal", "Kabbalist",
        "Zohar — Sod Secrets", 15,
        [ZOHAR_PASSAGES[0], ZOHAR_PASSAGES[2], TANYA_PASSAGES[1], REBBE_12_PESUKIM[1]],
        {
            perutahs: 2000, xp: 1800,
            items: ['scroll_zohar', 'jacket_moshiach', 'elixir_wisdom', 'potion_revive'],
            unlockPassage: 'zohar_bereishis_1'
        },
        { x: 280, y: 0, z: 150 },
        {
            greeting:  "The Zohar waits for those who are ready. Are you pure enough to enter?",
            challenge: "We shall debate the secrets of creation itself — Bereishit Bara Elohim!",
            victory:   "The Zohar opened its gates for you. A true Mekubal!",
            defeat:    "You have touched the infinite light of the Or HaGanuz. Guard it well.",
            idle:      ["Ein Sof — without end, without limit, without definition.", "Bereishit contains everything — EVERYTHING."]
        }
    ),

    makeScholar(
        "scholar_reb_yisroel_baal", "Reb Yisroel", "Baal Shem Tov Tradition",
        "All Books — Sod Level", 20,
        [ZOHAR_PASSAGES[1], REBBE_12_PESUKIM[11], TANYA_PASSAGES[1], AVOS_CH6[5]],
        {
            perutahs: 5000, xp: 4000,
            items: ['scroll_zohar', 'hat_shtreimel', 'jacket_moshiach', 'gartel_gold', 'potion_revive'],
            unlockPassage: 'avos_6_11'
        },
        { x: 350, y: 0, z: -100 },
        {
            greeting:  "The world is full of His glory! Even in this debate — the Awtsmoos is present!",
            challenge: "Every moment of learning is a revelation of the Infinite. Shall we reveal together?",
            victory:   "You have truly become a vessel for the Awtsmoos! Moshiach is revealed through you!",
            defeat:    "Praise to the Awtsmoos — who reveals Himself through such debates!",
            idle:      ["G-d is everywhere — even in your questions!", "His glory fills all the worlds AND beyond."]
        }
    )
];

/** Index by scholar ID */
export const SCHOLAR_BY_ID = Object.fromEntries(
    SCHOLAR_DEBATERS.map(s => [s.id, s])
);
