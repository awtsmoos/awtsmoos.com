/**
 * B"H
 * @file debate_missions.js — 25 DEBATE-FOCUSED SHLICHUS MISSIONS
 * Debates with scholars, not battles with enemies.
 */
import { AVOS_BY_ID } from '../torah/books/pirkeiAvos/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export const DEBATE_MISSIONS = [

    // ─── BEGINNER DEBATES (Madreiga 0–3) ─────────────────────────────────────
    {
        id: "dm_001", title: "The Three Pillars",
        type: "debate", targetScholar: "scholar_yosef_student",
        description: "Young Yosef challenges you on Avos 1:2 — debate the three pillars of the world.",
        requiredMadreiga: 0,
        objectives: [{ type: "win_debate", scholarId: "scholar_yosef_student", wins: 1 }],
        rewards: {
            perutahs: 120, xp: 80,
            items: [{ id: 'challah_small', amount: 2 }, { id: 'yamulka_black', amount: 1 }],
            unlockMission: "dm_002",
            unlockPassage: "avos_1_2"
        },
        npcGreeting: "Can you defend the three pillars against my questions? Begin!",
        completionText: "B\"H! The world truly stands on Torah, Avodah, and Gemilut Chasadim!"
    },

    {
        id: "dm_002", title: "Hillel's Challenge — If Not Now",
        type: "debate", targetScholar: "scholar_dovid_young",
        description: "Dovid wants to debate Hillel's urgent call to action. Respond!",
        requiredMadreiga: 0, requiredMissions: ["dm_001"],
        objectives: [{ type: "win_debate", scholarId: "scholar_dovid_young", wins: 1 }],
        rewards: {
            perutahs: 150, xp: 110,
            items: [{ id: 'rugelach', amount: 3 }, { id: 'scroll_chumash', amount: 1 }],
            unlockMission: "dm_003",
            unlockPassage: "avos_1_14"
        },
        npcGreeting: "Hillel says 'If not now, when?' — but WHAT is the 'now' he speaks of?",
        completionText: "Now I understand — every moment IS Moshiach's moment!"
    },

    {
        id: "dm_003", title: "Pleasant Face, Pleasant World",
        type: "debate", targetScholar: "scholar_miriam_teacher",
        description: "Miriam challenges: how does judging favorably actually change reality?",
        requiredMadreiga: 1, requiredMissions: ["dm_002"],
        objectives: [{ type: "win_debate", scholarId: "scholar_miriam_teacher", wins: 1 }],
        rewards: {
            perutahs: 200, xp: 150,
            items: [{ id: 'honey_cake', amount: 1 }, { id: 'gartel_black', amount: 1 }],
            unlockMission: "dm_004", unlockPassage: "avos_1_6"
        },
        npcGreeting: "Yehoshua says 'judge favorably' — but CAN we truly change another's judgment by changing ours?",
        completionText: "Remarkable — judging favorably literally reveals the hidden spark in every person!"
    },

    {
        id: "dm_004", title: "Know Your Origin",
        type: "debate", targetScholar: "scholar_miriam_teacher",
        description: "Debate the deep meaning of Akavya's three questions about origin and destiny.",
        requiredMadreiga: 2, requiredMissions: ["dm_003"],
        objectives: [{ type: "win_debate", scholarId: "scholar_miriam_teacher", wins: 1 },
                     { type: "use_passage", passageId: "avos_3_1", times: 1 }],
        rewards: {
            perutahs: 280, xp: 200,
            items: [{ id: 'potion_light_small', amount: 2 }, { id: 'hat_basic_black', amount: 1 }],
            unlockMission: "dm_005", unlockPassage: "avos_3_1"
        },
        npcGreeting: "Akavya says 'know where you came from' — but what IS the source? Can we truly know it?",
        completionText: "From the Ein Sof... through the worlds... to THIS moment. We came from the Awtsmoos!"
    },

    {
        id: "dm_005", title: "The Great Assembly's Fence",
        type: "debate", targetScholar: "scholar_yosef_student",
        description: "Debate why the Torah needs 'fences' (protective laws beyond the law).",
        requiredMadreiga: 3, requiredMissions: ["dm_004"],
        objectives: [{ type: "win_debate", scholarId: "scholar_yosef_student", wins: 1 }],
        rewards: {
            perutahs: 320, xp: 240,
            items: [{ id: 'shirt_white', amount: 1 }, { id: 'apple_honey', amount: 3 }],
            unlockMission: "dm_010", unlockPassage: "avos_1_1"
        },
        npcGreeting: "The fence around Torah — is it a sign of weakness (needing protection) or strength?",
        completionText: "The fence IS the Torah's strength — each layer reveals deeper holiness within!"
    },

    // ─── INTERMEDIATE DEBATES (Madreiga 4–8) ─────────────────────────────────
    {
        id: "dm_010", title: "The Stream and the Cistern",
        type: "debate", targetScholar: "scholar_reb_moshe_mishnah",
        description: "Reb Moshe debates: which is greater — the scholar who retains or the one who innovates?",
        requiredMadreiga: 4, requiredMissions: ["dm_005"],
        objectives: [{ type: "win_debate", scholarId: "scholar_reb_moshe_mishnah", wins: 1 }],
        rewards: {
            perutahs: 450, xp: 380,
            items: [{ id: 'scroll_mishnah', amount: 1 }, { id: 'kugel', amount: 2 }],
            unlockMission: "dm_011", unlockPassage: "avos_2_8"
        },
        npcGreeting: "Elazar ben Arach was the greatest — yet his Torah faded from him in exile. What does that teach us?",
        completionText: "The spring must stay connected to its Source — the community keeps the Torah alive!"
    },

    {
        id: "dm_011", title: "Mitzvah Chains Mitzvah",
        type: "debate", targetScholar: "scholar_reb_moshe_mishnah",
        description: "Can good deeds truly create a chain reaction in the higher worlds? Debate Ben Azzai!",
        requiredMadreiga: 5, requiredMissions: ["dm_010"],
        objectives: [{ type: "win_debate", scholarId: "scholar_reb_moshe_mishnah", wins: 1 },
                     { type: "use_passage", passageId: "avos_4_2", times: 2 }],
        rewards: {
            perutahs: 550, xp: 460,
            items: [{ id: 'elixir_wisdom', amount: 1 }, { id: 'yamulka_velvet', amount: 1 }],
            unlockMission: "dm_012", unlockPassage: "avos_4_2"
        },
        npcGreeting: "The reward of a mitzvah is a mitzvah — but HOW? Does the divine light literally multiply?",
        completionText: "Each mitzvah IS a link in the divine chain — it literally pulls down more light from above!"
    },

    {
        id: "dm_012", title: "Fire of the Gemara",
        type: "debate", targetScholar: "scholar_reb_chaim_talmud",
        description: "Enter the fire of Talmudic debate! Two hold the garment — who is right?",
        requiredMadreiga: 5, requiredMissions: ["dm_011"],
        objectives: [{ type: "win_debate", scholarId: "scholar_reb_chaim_talmud", wins: 1 }],
        rewards: {
            perutahs: 700, xp: 600,
            items: [{ id: 'scroll_gemara', amount: 1 }, { id: 'hat_beaver', amount: 1 }],
            unlockMission: "dm_013", unlockPassage: "gemara_bava_metzia_1"
        },
        npcGreeting: "Two people each claim the whole garment. The Gemara's answer is mathematical — but what is the DEEPER truth?",
        completionText: "Each soul claims the WHOLE Torah — and they are BOTH right! The Torah is infinite enough for all."
    },

    {
        id: "dm_013", title: "The Entire Torah on One Foot",
        type: "debate", targetScholar: "scholar_reb_chaim_talmud",
        description: "Hillel's golden rule — can ALL Torah really be summarized in one principle?",
        requiredMadreiga: 6, requiredMissions: ["dm_012"],
        objectives: [{ type: "win_debate", scholarId: "scholar_reb_chaim_talmud", wins: 1 },
                     { type: "use_passage", passageId: "gemara_shabbos_31a", times: 1 }],
        rewards: {
            perutahs: 800, xp: 700,
            items: [{ id: 'jacket_shabbos', amount: 1 }, { id: 'matzah', amount: 2 }],
            unlockMission: "dm_014", unlockPassage: "gemara_shabbos_31a"
        },
        npcGreeting: "The convert said 'teach me the whole Torah on one foot.' Hillel didn't refuse — but WHY is that the whole Torah?",
        completionText: "Because all 613 commandments ARE expressions of love — the root IS the branches!"
    },

    {
        id: "dm_014", title: "Who Is The Mighty One?",
        type: "debate", targetScholar: "scholar_reb_shlomo_avos",
        description: "Is inner strength truly greater than physical might? Debate Ben Zoma!",
        requiredMadreiga: 7, requiredMissions: ["dm_013"],
        objectives: [{ type: "win_debate", scholarId: "scholar_reb_shlomo_avos", wins: 1 }],
        rewards: {
            perutahs: 950, xp: 850,
            items: [{ id: 'gartel_silk', amount: 1 }, { id: 'elixir_strength', amount: 1 }],
            unlockMission: "dm_015", unlockPassage: "avos_4_1"
        },
        npcGreeting: "Ben Zoma says the mighty one conquers his evil inclination — but PHYSICALLY conquering enemies seems more mighty! Defend the mishna!",
        completionText: "The Yetzer Hara is the strongest force in existence — conquering IT is the greatest victory!"
    },

    {
        id: "dm_015", title: "Freedom Through Torah",
        type: "debate", targetScholar: "scholar_reb_shlomo_avos",
        description: "Debate the famous reading: Charut (engraved) → Cherut (freedom). How does law = freedom?",
        requiredMadreiga: 8, requiredMissions: ["dm_014"],
        objectives: [{ type: "win_debate", scholarId: "scholar_reb_shlomo_avos", wins: 1 },
                     { type: "use_passage", passageId: "avos_6_2", times: 1 }],
        rewards: {
            perutahs: 1100, xp: 1000,
            items: [{ id: 'shirt_techelet', amount: 1 }, { id: 'jacket_rebbe', amount: 1 }],
            unlockMission: "dm_020", unlockPassage: "avos_6_2"
        },
        npcGreeting: "Laws restrict freedom by definition! How can the MOST law (Torah) lead to the MOST freedom?",
        completionText: "True freedom is freedom from the Yetzer Hara — and Torah is the only proven path!"
    },

    // ─── ADVANCED DEBATES (Madreiga 9–15) ────────────────────────────────────
    {
        id: "dm_020", title: "The Two Souls of the Tanya",
        type: "debate", targetScholar: "scholar_reb_binyamin_tanya",
        description: "Enter the inner world of the Tanya — two souls inhabit every Jew. Debate their nature!",
        requiredMadreiga: 9, requiredMissions: ["dm_015"],
        objectives: [{ type: "win_debate", scholarId: "scholar_reb_binyamin_tanya", wins: 1 }],
        rewards: {
            perutahs: 1400, xp: 1300,
            items: [{ id: 'scroll_tanya', amount: 1 }, { id: 'hat_beaver', amount: 1 }],
            unlockMission: "dm_021", unlockPassage: "tanya_ch1"
        },
        npcGreeting: "The Alter Rebbe says there are literally TWO souls — not metaphor! What is the animal soul ACTUALLY made of?",
        completionText: "Ten Sefirot of the Klipa — it is a real spiritual structure! And we have the power to refine it!"
    },

    {
        id: "dm_021", title: "Literally a Part of G-d",
        type: "debate", targetScholar: "scholar_reb_binyamin_tanya",
        description: "The Alter Rebbe says the divine soul is LITERALLY ('mamash') a part of G-d above. Defend this!",
        requiredMadreiga: 10, requiredMissions: ["dm_020"],
        objectives: [{ type: "win_debate", scholarId: "scholar_reb_binyamin_tanya", wins: 1 },
                     { type: "use_passage", passageId: "tanya_ch2", times: 1 }],
        rewards: {
            perutahs: 1800, xp: 1600,
            items: [{ id: 'jacket_rebbe', amount: 1 }, { id: 'gartel_gold', amount: 1 }],
            unlockMission: "dm_022", unlockPassage: "tanya_ch2"
        },
        npcGreeting: "Critics say 'mamash' is hyperbole! But if it's LITERALLY true... what does that mean for sin? For suffering?",
        completionText: "It means even in the darkest moment, the Atzmus is there — because the soul IS there!"
    },

    {
        id: "dm_022", title: "Every Person is an Entire World",
        type: "debate", targetScholar: "scholar_gaon_avraham",
        description: "The Gemara says saving one life = saving a world. Is this literal or a teaching device?",
        requiredMadreiga: 11, requiredMissions: ["dm_021"],
        objectives: [{ type: "win_debate", scholarId: "scholar_gaon_avraham", wins: 2 }],
        rewards: {
            perutahs: 2200, xp: 2000,
            items: [{ id: 'hat_shtreimel', amount: 1 }, { id: 'potion_revive', amount: 1 }],
            unlockMission: "dm_023", unlockPassage: "gemara_sanhedrin_37a"
        },
        npcGreeting: "Sanhedrin says each person contains an entire world — but clearly they don't. Is the Gemara speaking metaphorically?",
        completionText: "Each soul contains all 600,000 sub-sparks — so saving ANY one saves ALL of them in their root!"
    },

    // ─── MASTER DEBATES (Madreiga 15+) ───────────────────────────────────────
    {
        id: "dm_030", title: "Secrets of Bereishit",
        type: "debate", targetScholar: "scholar_mekubal_shimon",
        description: "Enter the Zohar — debate the secrets of the first word of the Torah!",
        requiredMadreiga: 15, requiredMissions: ["dm_022"],
        objectives: [{ type: "win_debate", scholarId: "scholar_mekubal_shimon", wins: 1 }],
        rewards: {
            perutahs: 4000, xp: 3500,
            items: [{ id: 'scroll_zohar', amount: 1 }, { id: 'jacket_moshiach', amount: 1 }],
            unlockMission: "dm_031", unlockPassage: "zohar_bereishis_1"
        },
        npcGreeting: "The Zohar says Bereishit = Beit-Reishit — 'for the sake of...' For what? For WHO? Can you unravel it?",
        completionText: "For Torah and for Israel — both are called 'reishit' (first/beginning). They are ONE!"
    },

    {
        id: "dm_031", title: "The Hidden Light of Creation",
        type: "debate", targetScholar: "scholar_mekubal_shimon",
        description: "The Or HaGanuz — the hidden light — where is it hidden and why?",
        requiredMadreiga: 18, requiredMissions: ["dm_030"],
        objectives: [{ type: "win_debate", scholarId: "scholar_mekubal_shimon", wins: 1 },
                     { type: "use_passage", passageId: "zohar_shma_1", times: 1 }],
        rewards: {
            perutahs: 6000, xp: 5000,
            items: [{ id: 'flute', amount: 1 }, { id: 'gartel_gold', amount: 1 }, { id: 'hat_shtreimel', amount: 1 }],
            unlockMission: "dm_040", unlockPassage: "zohar_shma_1"
        },
        npcGreeting: "The hidden light was hidden after Adam's sin — but WHERE? The Zohar says 'in the Torah.' What does that mean?",
        completionText: "The hidden light IS the inner dimension of every Torah letter — accessed through Sod learning!"
    },

    {
        id: "dm_040", title: "Shema — The Ultimate Unity",
        type: "debate", targetScholar: "scholar_reb_yisroel_baal",
        description: "The final ultimate debate — the meaning of Divine Unity beyond all comprehension.",
        requiredMadreiga: 20, requiredMissions: ["dm_031"],
        objectives: [{ type: "win_debate", scholarId: "scholar_reb_yisroel_baal", wins: 1 },
                     { type: "use_passage", passageId: "rebbe_pesuk_2", times: 1 }],
        rewards: {
            perutahs: 15000, xp: 12000,
            items: [
                { id: 'scroll_zohar', amount: 1 },
                { id: 'jacket_moshiach', amount: 1 },
                { id: 'hat_shtreimel', amount: 1 },
                { id: 'gartel_gold', amount: 1 },
                { id: 'shoes_gold', amount: 1 },
                { id: 'potion_revive', amount: 3 }
            ],
            specialReward: "unlock_geulah_mode",
            unlockPassage: "rebbe_pesuk_2"
        },
        npcGreeting: "Shema Yisroel — Hashem Echad. But 'one' implies there could be TWO. The Awtsmoos transcends even 'one.' Can you articulate THAT?",
        completionText: "He is not one like a number — He is One like there is NO other existence. Everything else is His speech — still Him!"
    }
];

export const DEBATE_MISSION_BY_ID = Object.fromEntries(DEBATE_MISSIONS.map(m => [m.id, m]));
