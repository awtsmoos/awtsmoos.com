// B"H
/**
 * @module npcManifest
 * @description THE VAST CONGREGATION OF SOULS
 * Property NPCs with shops/missions + massive wandering population.
 */
export const NPC_MANIFEST = [
    { id: "npc_rabbi_levi", name: "Rabbi Levi Yitzchak", propertyId: "property_rabbiLevi",
      localPos: { x: 4, z: 4 }, hasShop: true,
      dialogueTree: [{ message: "B\"H! Welcome, dear soul. The Awtsmoos recreates this village every instant!",
        responses: [{ text: "Tell me about the Awtsmoos.", next: 1 }, { text: "Do you have a mission?", next: 2 }, { text: "Goodbye.", type: "close" }]
      }, { message: "The Awtsmoos is the Essence of all. Every stone, every leaf — letters of His speech, recreated from nothing every instant!",
        responses: [{ text: "Amazing!", type: "close" }]
      }, { message: "The Dust Mazikim are clouding the holy light of Asiyah. Will you refine them?", responses: [{ text: "I will refine them!", action: "acceptMission", missionId: "refining_the_dust" }, { text: "Not now.", type: "close" }] }],
      shopInventory: [
        { id: "challah", name: "Challah Bread", price: 5, className: "Brick", icon: "🍞" },
        { id: "candle_shabbos", name: "Shabbos Candle", price: 8, className: "Brick", icon: "🕯️" },
        { id: "wine_kiddush", name: "Kiddush Wine", price: 12, className: "Brick", icon: "🍷" }
      ] },
    { id: "npc_moshe_merchant", name: "Moshe the Merchant", propertyId: "property_merchantMoshe",
      localPos: { x: 2, z: 2 }, hasShop: true,
      dialogueTree: [{ message: "Shalom aleichem! Welcome to Moshe's General Store!",
        responses: [{ text: "Show me your wares.", action: "openShop" }, { text: "Any advice?", next: 1 }, { text: "Goodbye.", type: "close" }]
      }, { message: "'Who is rich? He who is happy with his lot!' But a good deal never hurts!", responses: [{ text: "Ha!", type: "close" }] }],
      shopInventory: [
        { id: "pickaxe_iron", name: "Iron Pickaxe", price: 15, className: "Pickaxe", icon: "⛏️" },
        { id: "shovel_iron", name: "Iron Shovel", price: 12, className: "Shovel", icon: "🪣" },
        { id: "grappling_hook", name: "Grappling Hook", price: 25, className: "GrapplingHook", icon: "🪝" },
        { id: "fishing_rod", name: "Fishing Rod", price: 10, className: "FishingRod", icon: "🎣" },
        { id: "elemental_staff", name: "Staff of Elements", price: 150, className: "ElementalStaff", icon: "🪄" },
        { id: "blueprint_tool", name: "Blueprint Tool", price: 20, className: "Blueprint", icon: "📜" },
        { id: "book_tehillim", name: "Sefer Tehillim", price: 50, className: "Sefer", icon: "📖" },
        { id: "axe_iron", name: "Iron Axe", price: 20, className: "Axe", icon: "🪓" },
        { id: "time_scepter", name: "Time Scepter", price: 250, className: "TimeScepter", icon: "⏳" },
        { id: "holy_mirror", name: "Holy Mirror", price: 100, className: "HolyMirror", icon: "🪞" },
        { id: "telescope_tool", name: "Telescope", price: 30, className: "Telescope", icon: "🔭" },
        { id: "bread_plain", name: "Plain Bread", price: 3, className: "Brick", icon: "🍞" },
        { id: "wood_plank", name: "Wood Plank", price: 8, className: "Brick", icon: "🪵" },
        { id: "rope_strong", name: "Strong Rope", price: 6, className: "Brick", icon: "🪢" }
      ] },
    { id: "npc_sarah_baker", name: "Sarah the Baker", propertyId: "property_sarahBaker",
      localPos: { x: 3, z: 3 }, hasShop: true,
      dialogueTree: [{ message: "B\"H! The aroma of fresh challah fills the air!",
        responses: [{ text: "Smells wonderful!", next: 1 }, { text: "Need help?", next: 2 }, { text: "Goodbye.", type: "close" }]
      }, { message: "I bake with love and prayer! Every loaf is a vessel for blessing.", responses: [{ text: "Beautiful.", type: "close" }]
      }, { message: "I need 3 wheat bundles for my next batch!", responses: [{ text: "I'm on it!", type: "close" }] }],
      shopInventory: [
        { id: "challah_special", name: "Special Challah", price: 10, className: "Brick", icon: "🍞" },
        { id: "cake_honey", name: "Honey Cake", price: 15, className: "Brick", icon: "🍰" },
        { id: "cookie_rugelach", name: "Rugelach", price: 7, className: "Brick", icon: "🥐" }
      ] },
    { id: "npc_shmuel_scribe", name: "Shmuel the Scribe", propertyId: "property_shmuelScribe",
      localPos: { x: 0, z: 3 }, hasShop: false, shopInventory: [],
      dialogueTree: [{ message: "B\"H. Every letter I write is a universe unto itself.",
        responses: [{ text: "Tell me about the letters.", next: 1 }, { text: "Can I help?", next: 2 }, { text: "Goodbye.", type: "close" }]
      }, { message: "Each Hebrew letter has form, number, and name. Together they create worlds! The Aleph alone contains the entire Torah...",
        responses: [{ text: "Incredible.", type: "close" }]
      }, { message: "I need sacred ink. A bottle fell behind my study.", responses: [{ text: "I'll find it!", type: "close" }] }] },
    { id: "npc_dovid_musician", name: "Dovid the Musician", propertyId: "property_dovid",
      localPos: { x: 5, z: 5 }, hasShop: false, shopInventory: [],
      dialogueTree: [{ message: "B\"H! Music is the language of the soul!",
        responses: [{ text: "Sing something!", next: 1 }, { text: "How can I help?", next: 2 }, { text: "Goodbye.", type: "close" }]
      }, { message: "🎵 'Kol ha'olam kulo, gesher tzar me'od...' 🎵", responses: [{ text: "Beautiful!", type: "close" }]
      }, { message: "My harp string broke! I dropped a gold one in my garden.", responses: [{ text: "I'll search!", type: "close" }] }] },
    { id: "npc_gabbai", name: "The Gabbai", propertyId: "property_synagogue",
      localPos: { x: 3, z: 3 }, hasShop: false, shopInventory: [],
      dialogueTree: [{ message: "B\"H! Welcome to the Beis Medrash — the heart of the village.",
        responses: [{ text: "What can I do?", next: 1 }, { text: "Torah question.", next: 2 }, { text: "Any special missions?", next: 3 }, { text: "Goodbye.", type: "close" }]
      }, { message: "Help build our community! Speak with villagers — they each have needs.", responses: [{ text: "I will!", type: "close" }]
      }, { message: "The world was created with ten utterances. Why not one? To reward the righteous!", responses: [{ text: "Profound!", type: "close" }]
      }, { message: "The Fire Mazikim are burning with unholy rage. Only 'Esh Dos' can refine them. Are you prepared?", responses: [{ text: "I am ready!", action: "acceptMission", missionId: "fire_of_diligence" }, { text: "I need more time.", type: "close" }] }] },
    { id: "npc_blacksmith", name: "Yosef the Blacksmith", propertyId: "property_blacksmith",
      localPos: { x: 3, z: 2 }, hasShop: true,
      dialogueTree: [{ message: "B\"H! The sparks fly from my anvil like sparks of holiness from a Mitzvah!",
        responses: [{ text: "What do you sell?", action: "openShop" }, { text: "Need anything?", next: 1 }, { text: "Goodbye.", type: "close" }]
      }, { message: "I need 5 emerald gems to forge the legendary Sword of Emunah!", responses: [{ text: "I'll collect them!", type: "close" }] }],
      shopInventory: [
        { id: "axe_iron", name: "Iron Axe", price: 20, className: "Tool", icon: "🪓" },
        { id: "axe_golden", name: "Golden Axe", price: 100, className: "Tool", icon: "🪓" },
        { id: "sword_iron", name: "Iron Sword", price: 30, className: "Tool", icon: "⚔️" },
        { id: "shield_wood", name: "Wooden Shield", price: 25, className: "Brick", icon: "🛡️" },
        { id: "armor_leather", name: "Leather Armor", price: 40, className: "Apparel", icon: "🦺" },
        { id: "hoverboard", name: "Magical Hoverboard", price: 500, className: "Hoverboard", icon: "🛹" }
      ] },
    { id: "npc_healer", name: "Miriam the Healer", propertyId: "property_healer",
      localPos: { x: 2, z: 4 }, hasShop: true,
      dialogueTree: [{ message: "B\"H! Come, let me see if you need healing. The body is a vessel for the soul!",
        responses: [{ text: "What do you sell?", action: "openShop" }, { text: "Any missions?", next: 1 }, { text: "Goodbye.", type: "close" }]
      }, { message: "I need 2 olive oils for healing salves. Can you find some?", responses: [{ text: "On my way!", type: "close" }] }],
      shopInventory: [
        { id: "potion_health", name: "Health Potion", price: 10, className: "Brick", icon: "🧪" },
        { id: "potion_speed", name: "Speed Potion", price: 15, className: "Brick", icon: "⚡" },
        { id: "bandage", name: "Holy Bandage", price: 5, className: "Brick", icon: "🩹" },
        { id: "oil_olive", name: "Olive Oil", price: 8, className: "Brick", icon: "🫒" }
      ] },
    { id: "npc_lumber", name: "Baruch the Lumberjack", propertyId: "property_lumberyard",
      localPos: { x: 4, z: 3 }, hasShop: true,
      dialogueTree: [{ message: "B\"H! Nothing like a day chopping trees! Each swing is a Tikkun!",
        responses: [{ text: "Buy/sell wood.", action: "openShop" }, { text: "Tips?", next: 1 }, { text: "Goodbye.", type: "close" }]
      }, { message: "Get an axe from Moshe or Yosef, chop trees, and sell me the planks! I pay well.", responses: [{ text: "Got it!", type: "close" }] }],
      shopInventory: [
        { id: "axe_iron", name: "Iron Axe", price: 18, className: "Tool", icon: "🪓" },
        { id: "wood_plank", name: "Wood Plank (buy)", price: 5, className: "Brick", icon: "🪵" }
      ] },
    { id: "npc_gemDealer", name: "Shlomo the Gem Dealer", propertyId: "property_gemShop",
      localPos: { x: 2, z: 2 }, hasShop: true,
      dialogueTree: [{ message: "B\"H! Gems — each one a condensed letter of the Creator's speech!",
        responses: [{ text: "Show me gems.", action: "openShop" }, { text: "Need anything?", next: 1 }, { text: "Goodbye.", type: "close" }]
      }, { message: "Find me 3 Torah Scroll Fragments from the wilderness. I'll pay handsomely!", responses: [{ text: "I'll hunt for them!", type: "close" }] }],
      shopInventory: [
        { id: "gem_emerald", name: "Emerald", price: 50, className: "Brick", icon: "💎" },
        { id: "gem_ruby", name: "Ruby", price: 75, className: "Brick", icon: "💎" },
        { id: "gem_sapphire", name: "Sapphire", price: 100, className: "Brick", icon: "💎" },
        { id: "cloud_mount", name: "Cloud of Glory Mount", price: 1000, className: "CloudMount", icon: "☁️" }
      ] },
    // ═══ NEW: SKILL TRAINERS ═══
    { id: "npc_trainer_shmuel", name: "Rabbi Shmuel the Trainer", propertyId: "property_synagogue",
      localPos: { x: -2, z: -2 }, hasShop: false,
      dialogueTree: [
        { message: "B\"H! To defeat the Mazzikim, one must use the power of the holy word. Are you ready to learn a passage?",
          responses: [
            { text: "Teach me 'Shema Yisrael'.", action: "learnSkill", skillId: "shema_yisrael" },
            { text: "Teach me 'V'ahavta'.", action: "learnSkill", skillId: "vhafta_es_hashem" },
            { text: "Not yet.", type: "close" }
          ]
        }
      ]
    },
    { id: "npc_trainer_zalman", name: "Rabbi Zalman (Tanya Specialist)", propertyId: "extra_prop_10",
      localPos: { x: 0, z: 0 }, hasShop: false,
      dialogueTree: [
        { message: "B\"H. The Tanya is the 'Torah for the Intermediate.' It reveals the spark within. Have you refined your soul enough for these secrets?",
          responses: [
            { text: "Teach me 'The Tanya Spark'.", action: "learnSkill", skillId: "tanya_chapter_1" },
            { text: "Teach me 'Yechi HaMelech'.", action: "learnSkill", skillId: "yechi_hamelech" },
            { text: "I am still learning.", type: "close" }
          ]
        }
      ]
    }
];


export const WANDERING_NPCS = [
    { id: "w1", name: "Yankel the Wanderer", position: { x: 0, z: 15 },
      dialogues: ["B\"H! Every step is guided by Divine Providence!", "The Baal Shem Tov taught: where your thoughts are, that is where you truly are.", "A Jew must be joyful! Simcha breaks all boundaries!", "Every creation has a spark waiting to be elevated."] },
    { id: "w2", name: "Berel the Scholar", position: { x: 15, z: -10 },
      dialogues: ["B\"H! The Alter Rebbe teaches: the soul is 'truly a part of G-d Above.'", "Bittul means complete nullification before the Infinite!", "Torah is the Will and Wisdom of the Awtsmoos!", "Every mitzvah creates an angel!"] },
    { id: "w3", name: "Zalman the Elder", position: { x: -20, z: 10 },
      dialogues: ["B\"H! The Awtsmoos is everything.", "There is no place devoid of Him!", "The physical world is lowest, yet HERE the Essence is revealed!", "The answers are in your Neshama."] },
    { id: "w4", name: "Mendel the Storyteller", position: { x: 50, z: 30 },
      dialogues: ["B\"H! The Baal Shem Tov once flew on a cloud...", "Stories of Tzaddikim draw down Divine Light!", "The Rebbe: we are the last generation of exile and first of redemption!"] },
    { id: "w5", name: "Chana the Wise", position: { x: -40, z: 45 },
      dialogues: ["B\"H! The strength of a Jewish woman built this village.", "Prayer from the heart shatters all barriers!", "Even the simplest prayer reaches the highest heavens."] },
    { id: "w6", name: "Avrohom the Kind", position: { x: 70, z: -20 },
      dialogues: ["B\"H! Chesed — kindness — is the foundation of the world!", "Welcome every person with a cheerful face!", "The world stands on Torah, service, and acts of kindness."] },
    { id: "w7", name: "Pinchas the Zealot", position: { x: -70, z: -30 },
      dialogues: ["B\"H! Stand strong for what is right!", "The mazzikim in the forest are manifestations of negative traits — defeat them with Mitzvos!", "Never compromise on truth!"] },
    { id: "w8", name: "Naftali the Swift", position: { x: 30, z: -50 },
      dialogues: ["B\"H! Speed in doing Mitzvos shows enthusiasm!", "Run to do a mitzvah, flee from transgression!", "The deer runs swift — be like the deer to do the Creator's will!"] },
    { id: "w9", name: "Shimon the Builder", position: { x: -30, z: -55 },
      dialogues: ["B\"H! Every house we build is a miniature Beis HaMikdash!", "Chop trees, gather wood, and build! The village needs more homes!", "Building is a holy act — you create vessels for the Divine Presence."] },
    { id: "w10", name: "Reuven the Fisherman", position: { x: 100, z: 40 },
      dialogues: ["B\"H! The sea is vast, but the Creator's mercy is vaster!", "Even a fish in the sea is created by the Awtsmoos's speech!", "Patience in fishing, patience in Torah — both yield treasures."] },
    { id: "w11", name: "Eliyahu the Mysterious", position: { x: -100, z: 50 },
      dialogues: ["B\"H! Perhaps I am who you think I am. Perhaps not.", "The hidden tzaddikim sustain the world with 36 souls...", "When Moshiach comes, all flesh will literally SEE the Awtsmoos!"] },
    { id: "w12", name: "Yehuda the Guard", position: { x: 0, z: -70 },
      dialogues: ["B\"H! I patrol the village borders. Watch out for Mazzikim in the forests!", "If you see a boss, make sure you have a sword or staff!", "The darkness tests us so we can find light within!"] },
    { id: "w13", name: "Bezalel the Coder", position: { x: -10, z: -10 },
      dialogues: ["B\"H! I was looking at the source code... we are just JSON data compiled into a 3D matrix!", "The Awtsmoos is the real programmer, refreshing our instance every frame!", "If you see the User, tell them to increase the size of my property in propertyLayouts.js!"] }
];
