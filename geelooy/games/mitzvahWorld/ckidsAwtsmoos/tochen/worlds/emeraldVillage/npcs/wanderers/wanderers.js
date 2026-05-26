/**
 * B"H
 * @file wanderers.js
 * @description
 * 🚶 THE WANDERING SOULS — Outdoor Village NPCs 🚶
 * 
 * These NPCs populate the streets and paths of the Emerald Village.
 * Each uses the chossid.glb model with randomized clothes and colors.
 * Some wander, some stand. Some can debate. Some have missions.
 */

export const WANDERERS = [
    // ═══ MISSION GIVERS (Gold ! above head) ═══
    { id: "w1", name: "Yitzchak the Researcher", position: { x: 20, z: 30 },
      isWandering: false, canDebate: false, missionId: "refine_klipa_1",
      clothes: [
        { meshName: "outer-shirt", color: "#336699" },
        { meshName: "pants", color: "#222222" },
        { meshName: "yamulka", color: "#336699" }
      ],
      dialogues: ["B\"H! The northern forest is thick with Ground Kelipos.", "Will you help clear them? I'll reward you handsomely!"] },

    { id: "w2", name: "Chana the Collector", position: { x: -25, z: 40 },
      isWandering: false, canDebate: false, missionId: "collect_perutahs",
      clothes: [
        { meshName: "outer-shirt", color: "#993366" },
        { meshName: "pants", color: "#333333" },
        { meshName: "yamulka", color: "#993366" }
      ],
      dialogues: ["B\"H! We are raising funds for a new Mikvah. Every Perutah counts!", "Collect 1000 Perutahs from battles and I'll give you something special."] },

    { id: "w3", name: "Zalman the Elder", position: { x: 50, z: -50 },
      isWandering: true, canDebate: true, missionId: "debate_elder",
      clothes: [
        { meshName: "jacket", color: "#1a1a2e" },
        { meshName: "outer-shirt", color: "#e6e6e6" },
        { meshName: "pants", color: "#111111" },
        { meshName: "top-hat", color: "#0a0a0a" }
      ],
      dialogues: ["B\"H! I am Zalman the Elder. I challenge you to a Torah debate!", "Only the wisest can defeat me. Do you dare?"] },

    { id: "w4", name: "Rivka the Devout", position: { x: -40, z: -30 },
      isWandering: false, canDebate: false, missionId: "collect_sparks",
      clothes: [
        { meshName: "outer-shirt", color: "#cc9900" },
        { meshName: "pants", color: "#444444" },
        { meshName: "yamulka", color: "#cc9900" }
      ],
      dialogues: ["B\"H! I am gathering holy sparks to build a new Menorah.", "Collect 20 from defeating Kelipos!"] },

    { id: "w5", name: "Baruch the Builder", position: { x: 60, z: 20 },
      isWandering: false, canDebate: false, missionId: "refine_klipa_fire",
      clothes: [
        { meshName: "outer-shirt", color: "#cc4400" },
        { meshName: "pants", color: "#663300" },
        { meshName: "yamulka", color: "#884400" }
      ],
      dialogues: ["B\"H! Fire Kelipos are haunting the forge at night!", "Refine 3 of them and I'll craft you something special."] },

    // ═══ DEBATE SCHOLARS (Challenge-able) ═══
    { id: "w6", name: "Meir the Sharp", position: { x: 30, z: -20 },
      isWandering: true, canDebate: true, debateLevel: 1,
      clothes: [
        { meshName: "outer-shirt", color: "#003366" },
        { meshName: "pants", color: "#1a1a1a" },
        { meshName: "top-hat", color: "#222244" }
      ],
      dialogues: ["B\"H! Want to debate? My Pshat is unshakable!", "I study the Chumash every morning."] },

    { id: "w7", name: "Shimon the Quiet", position: { x: -60, z: 30 },
      isWandering: true, canDebate: true, debateLevel: 2,
      clothes: [
        { meshName: "outer-shirt", color: "#4d4d4d" },
        { meshName: "pants", color: "#262626" },
        { meshName: "yamulka", color: "#666666" }
      ],
      dialogues: ["B\"H! Silence is a fence for wisdom.", "But I'll speak if you challenge me to a debate."] },

    { id: "w8", name: "Yehuda the Bold", position: { x: 70, z: -40 },
      isWandering: true, canDebate: true, debateLevel: 3,
      clothes: [
        { meshName: "jacket", color: "#8b0000" },
        { meshName: "outer-shirt", color: "#ffffff" },
        { meshName: "pants", color: "#1a1a1a" },
        { meshName: "top-hat", color: "#330000" }
      ],
      dialogues: ["B\"H! The Torah is fire! Debate me if you dare!", "My Drush will set your arguments ablaze."] },

    { id: "w9", name: "Naftali the Swift", position: { x: -70, z: -50 },
      isWandering: true, canDebate: true, debateLevel: 2,
      clothes: [
        { meshName: "outer-shirt", color: "#006633" },
        { meshName: "pants", color: "#003322" },
        { meshName: "yamulka", color: "#009944" }
      ],
      dialogues: ["B\"H! A swift deer! I run from argument to argument!", "But catch me and I'll debate you."] },

    { id: "w10", name: "Reuven the Firstborn", position: { x: 40, z: 60 },
      isWandering: true, canDebate: true, debateLevel: 1,
      clothes: [
        { meshName: "outer-shirt", color: "#cc0000" },
        { meshName: "pants", color: "#1a0000" },
        { meshName: "yamulka", color: "#990000" }
      ],
      dialogues: ["B\"H! I was the first to study today!", "Let's see if your Torah is as deep as mine."] },

    // ═══ AMBIENT VILLAGERS (Color + Flavor) ═══
    { id: "w11", name: "Levi the Musician", position: { x: -25, z: 35 },
      isWandering: false, canDebate: false,
      clothes: [
        { meshName: "outer-shirt", color: "#4400aa" },
        { meshName: "pants", color: "#220066" },
        { meshName: "yamulka", color: "#6600cc" }
      ],
      dialogues: ["B\"H! Music elevates the soul!", "When King David played, even the stones danced."] },

    { id: "w12", name: "Devorah the Judge", position: { x: 45, z: -15 },
      isWandering: false, canDebate: false,
      clothes: [
        { meshName: "outer-shirt", color: "#996633" },
        { meshName: "pants", color: "#664422" },
        { meshName: "yamulka", color: "#aa7744" }
      ],
      dialogues: ["B\"H! Justice and mercy — the two pillars.", "The Torah's judgments are sweeter than honey!"] },

    { id: "w13", name: "Bezalel the Coder", position: { x: -10, z: -10 },
      isWandering: true, canDebate: false,
      clothes: [
        { meshName: "outer-shirt", color: "#00cc44" },
        { meshName: "pants", color: "#003311" },
        { meshName: "yamulka", color: "#00aa33" }
      ],
      dialogues: ["B\"H! We are just JSON data compiled into a 3D matrix!", "The Awtsmoos is the real programmer!"] },

    { id: "w14", name: "Rivka the Herbalist Merchant", position: { x: 25, z: 25 },
      isWandering: false, canDebate: false, missionId: "gather_healing_herbs", hasShop: true,
      shopInventory: ["healing_herb", "small_lamp", "simple_bandage"],
      clothes: [
        { meshName: "outer-shirt", color: "#339966" },
        { meshName: "pants", color: "#226644" },
        { meshName: "yamulka", color: "#44aa77" }
      ],
      dialogues: ["B\"H! Every plant contains sparks of holiness.", "The healing herbs grow where the Awtsmoos desires."] },

    { id: "w15", name: "Noach the Builder", position: { x: 60, z: 60 },
      isWandering: true, canDebate: false, missionId: "repair_village_roofs",
      clothes: [
        { meshName: "outer-shirt", color: "#886644" },
        { meshName: "pants", color: "#553322" },
        { meshName: "yamulka", color: "#997755" }
      ],
      dialogues: ["B\"H! I'm building an ark... just in case!", "Preparation is wisdom!"] },

    { id: "w16", name: "Esther the Hidden", position: { x: -60, z: -60 },
      isWandering: false, canDebate: false,
      clothes: [
        { meshName: "outer-shirt", color: "#660066" },
        { meshName: "pants", color: "#330033" },
        { meshName: "yamulka", color: "#880088" }
      ],
      dialogues: ["B\"H! Sometimes the greatest light is concealed.", "In the darkest moment, the redemption arrives!"] },

    { id: "w17", name: "Moshe the Shepherd", position: { x: 80, z: 10 },
      isWandering: true, canDebate: false,
      clothes: [
        { meshName: "outer-shirt", color: "#cc9966" },
        { meshName: "pants", color: "#886644" },
        { meshName: "yamulka", color: "#ddaa77" }
      ],
      dialogues: ["B\"H! A leader must care for every single sheep.", "The smallest creature matters to the Awtsmoos."] },

    { id: "w18", name: "Aharon the Peacemaker", position: { x: -80, z: 15 },
      isWandering: true, canDebate: false,
      clothes: [
        { meshName: "outer-shirt", color: "#ffffff" },
        { meshName: "pants", color: "#eeeeee" },
        { meshName: "top-hat", color: "#ffffff" }
      ],
      dialogues: ["B\"H! Peace between people is the highest mitzvah.", "Love peace, pursue peace!"] },

    { id: "w19", name: "Calev the Brave", position: { x: 90, z: -40 },
      isWandering: true, canDebate: true, debateLevel: 3,
      clothes: [
        { meshName: "jacket", color: "#002244" },
        { meshName: "outer-shirt", color: "#dddddd" },
        { meshName: "pants", color: "#111133" },
        { meshName: "top-hat", color: "#001122" }
      ],
      dialogues: ["B\"H! Courage comes from knowing the Awtsmoos is with you.", "I once fought a Shadow Boss alone!"] },

    { id: "w20", name: "Shlomo the Wise", position: { x: 35, z: 70 },
      isWandering: false, canDebate: true, debateLevel: 4,
      clothes: [
        { meshName: "jacket", color: "#ffd700" },
        { meshName: "outer-shirt", color: "#fffacd" },
        { meshName: "pants", color: "#daa520" },
        { meshName: "top-hat", color: "#b8860b" }
      ],
      dialogues: ["B\"H! Wisdom is the crown of all treasures.", "There are 70 faces to the Torah!"] },

    { id: "w21", name: "Akiva the Optimist", position: { x: 40, z: 80 },
      isWandering: true, canDebate: false,
      clothes: [
        { meshName: "outer-shirt", color: "#ff6600" },
        { meshName: "pants", color: "#cc4400" },
        { meshName: "yamulka", color: "#ff8833" }
      ],
      dialogues: ["B\"H! It's all for the best!", "Smile! You're in a procedural holy world!"] },

    { id: "w22", name: "Gershon the Traveler", position: { x: -50, z: -90 },
      isWandering: true, canDebate: false,
      clothes: [
        { meshName: "outer-shirt", color: "#444466" },
        { meshName: "pants", color: "#333344" },
        { meshName: "yamulka", color: "#555577" }
      ],
      dialogues: ["B\"H! I've seen worlds beyond the horizon.", "Have you visited the Rebbe in the Synagogue yet?"] },

    { id: "w23", name: "Yisroel the Farmer", position: { x: -50, z: -20 },
      isWandering: false, canDebate: false,
      clothes: [
        { meshName: "outer-shirt", color: "#668844" },
        { meshName: "pants", color: "#445522" },
        { meshName: "yamulka", color: "#779955" }
      ],
      dialogues: ["B\"H! The land itself sings the Creator's praise.", "Every seed is a letter of divine speech!"] },

    { id: "w24", name: "Dan the Seeker", position: { x: 20, z: -80 },
      isWandering: true, canDebate: false,
      clothes: [
        { meshName: "outer-shirt", color: "#333333" },
        { meshName: "pants", color: "#1a1a1a" },
        { meshName: "yamulka", color: "#444444" }
      ],
      dialogues: ["B\"H! I seek the hidden caves beneath the village.", "The deeper you go, the stronger the enemies."] },

    { id: "w25", name: "Issachar the Studious", position: { x: 55, z: 50 },
      isWandering: false, canDebate: true, debateLevel: 2,
      clothes: [
        { meshName: "outer-shirt", color: "#2244aa" },
        { meshName: "pants", color: "#112266" },
        { meshName: "top-hat", color: "#1a3388" }
      ],
      dialogues: ["B\"H! I study Torah day and night.", "The letters of the Torah are the building blocks of reality!"] },

    { id: "w26", name: "Joe the Boundary Keeper", position: { x: -15, z: 75 },
      isWandering: false, canDebate: false,
      clothes: [
        { meshName: "outer-shirt", color: "#1f7a7a" },
        { meshName: "pants", color: "#123f3f" },
        { meshName: "yamulka", color: "#2aa6a6" }
      ],
      dialogues: [
        "B\"H! I'm Joe. I watch the renderer boundary so the village keeps breathing.",
        "A world becomes stronger when its features are tested before they shine."
      ] }
];
