
// B"H
// js/data/bots.js

export const botNames = [
    "Moshe the Scribe", "Yehuda of the Market", "Levi the Watchman", "Aharon the Baker", "Shmuel the Porter",
    "Chaim the Bookbinder", "Dovid the Water Carrier", "Meir the Lantern Keeper", "Nochum the Traveler", "Ezra the Copyist",
    "Baruch the Herbalist", "Pinchas the Smith", "Yosef the Weaver", "Reuven the Messenger", "Shimon the Fisher",
    "Natan the Gatekeeper", "Eliyahu the Wandering Tutor", "Asher the Spice Seller", "Gershon the Stable Hand", "Binyamin the Mapmaker",
    "Mordechai the Clerk", "Avraham the Guestmaster", "Yitzchak the Quiet Scholar", "Yaakov the Road Scout", "Menachem the Medic",
    "Zalman the Candle Maker", "Hershel the Cook", "Aryeh the Guard", "Tzvi the Courier", "Yisroel the Minyan Caller"
];

export const botGuilds = [
    "Beis Midrash", "Market Watch", "Road Wardens", "Candle Guild", "Water Carriers",
    "Scribes' Bench", "Guest House", "Kitchen Crew", "Gatehouse", "Library Circle"
];

export const botDialogues = {
    local: [
        "The north road is muddy after the last rain; step around the broken stones.",
        "The bakery has fresh loaves, but the miller is short on wheat again.",
        "I saw a lantern flicker near the old archway after sunset.",
        "The beis midrash is quiet now; good time to review without noise.",
        "A traveler came through asking for ink and clean parchment.",
        "The guard says the lower path is safer before nightfall.",
        "Someone left a bundle near the well. I hope its owner returns.",
        "The market is calmer today; people are counting every coin.",
        "There is smoke beyond the trees, but it may just be a cooking fire.",
        "I heard a child singing Aleph-Beis by the fountain. Sweet sound."
    ],
    general: [
        "The day feels stretched thin, like something hidden is about to open.",
        "B\"H, another road crossed without trouble.",
        "Keep a little bread in your satchel. The map is bigger than it looks.",
        "Ask before taking from a crate. Some of these courtyards are watched.",
        "If you see a scholar pacing in circles, he probably lost a page."
    ],
    trade: [
        "I can spare clean parchment for someone with wheat or oil.",
        "Looking for ink; paying fair, not desperate.",
        "Copper tools available by the smithy after midday.",
        "I have extra manna dew, but I need a working lamp wick."
    ],
    lfg: [
        "Need one more for a safe walk past the tower road.",
        "Two travelers heading east after Mincha; careful company wanted.",
        "Looking for someone who knows the old gate markings.",
        "I need help carrying supplies to the study hall."
    ]
};

export const botAvatars = ['🧙‍♂️', '🧕', '🤴', '🕵️‍♂️', '👩‍🎓', '👨‍🌾', '👳‍♂️', '👷', '👮', '👼', '🧟', '🧛', '🧞', '🧝', '🤵', '👰'];

export const botTeams = [
    [{id: 'clay_golem', level: 10}, {id: 'dust_mite', level: 12}],
    [{id: 'ember_spirit', level: 25}, {id: 'flaming_sword', level: 24}],
    [{id: 'benevolent_stream', level: 30}, {id: 'white_lion', level: 32}],
    [{id: 'silent_syllogism', level: 40}, {id: 'automaton_guard', level: 42}],
    [{id: 'infinite_light', level: 50}] 
];
