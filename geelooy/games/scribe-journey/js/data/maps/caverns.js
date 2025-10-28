// B"H
// js/data/maps/caverns.js

export const cavernMaps = {
    'mishnah_caverns_1': {
        width: 15,
        baseLayerString: `
🪨🪨🪨🪨🕳️🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
🪨⬜⬜⬜⬜🪨⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜🪨🪨⬜🪨⬜🪨🪨🪨🪨🪨⬜🪨
🪨⬜🪨⬜⬜⬜⬜⬜⬜⬜⬜🪨⬜🪨
🪨⬜🪨🪨🪨🪨⬜🪨🪨🪨🪨⬜🪨🪨
🪨📄⬜⬜⬜⬜⬜⬜🚪⬜⬜⬜⬜⬜🚪
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
        `,
        interactables: {
            '4,0': { type: 'door', emoji: '🕳️', targetMap: 'scribe_atheneum_main', targetX: 3, targetY: 5 },
            '8,5': { type: 'door', emoji: '🚪', targetMap: 'mishnah_caverns_2', targetX: 1, targetY: 3 },
            '13,5': { type: 'door', emoji: '🚪', targetMap: 'chamber_of_pure_waters', targetX: 1, targetY: 4 },
            '1,5': { type: 'npc', emoji: '📄', id: 'page_foundations_node', dialogue: { start: ["You found a weathered page from the Mishneh Torah! It discusses the Foundation of all Foundations.", {giveItem: "rambam_page_foundations", setFlag: "found_page_foundations"}, "end"]}}
        }
    },
    'mishnah_caverns_2': {
        width: 15,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
🪨⬜⬜⬜🪨🪨🪨🪨🪨🪨🪨🪨⬜⬜🚪
🪨⬜🪨⬜🪨🕳️🕳️🕳️🕳️🕳️🕳️🪨⬜⬜🪨
🪨🚪🪨⬜🪨🕳️👤🕳️🕳️🕳️🕳️🪨⬜⬜🪨
🪨🪨🪨⬜🪨🪨🪨🪨🪨🪨🪨🪨⬜⬜🪨
🪨👨‍🔧⬜⬜⬜⬜⬜⬜⬜📄⬜⬜⬜⬜🪨
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
        `,
        interactables: {
            '1,3': { type: 'door', emoji: '🚪', targetMap: 'mishnah_caverns_1', targetX: 7, targetY: 5 },
            '13,1': { type: 'door', emoji: '🚪', targetMap: 'mishnah_caverns_3', targetX: 1, targetY: 1 },
            '1,5': { type: 'npc', emoji: '👨‍🔧', id: 'digger_levi', questGiver: 'nizkei_mamon_2_the_pit', dialogue: {
                start: ["Careful, Scribe! I was just digging here... for treasures, you see. Didn't mean for anyone to get hurt."],
                confront: ["It's true, I dug the pit. I never thought an ox would wander this deep! Please, I can't afford to pay full damages..."],
            }},
             '9,5': { type: 'npc', emoji: '📄', id: 'page_damages_node', dialogue: { start: ["You found a page from the Mishneh Torah! It details the laws of damages by a pit.", {giveItem: "rambam_page_damages", setFlag: "found_page_damages"}, {updateQuest: 'nizkei_mamon_2_the_pit', objectiveId: 'learn_pit_law'}, "end"]}},
             '6,3': { type: 'npc', emoji: '👤', id: 'shadow_npc', dialogue: {start: ["...What is certainty? What is doubt?... The Rambam builds a fortress of logic, but what of the things that cannot be known? ...Debate me, and see if your foundations hold.", {startBattle: [{id: 'shadow_of_doubt', level: 10}]}]}},
        }
    },
    'mishnah_caverns_3': {
        // This is a vast, empty space for future expansion. A true "insane" map.
        // The parser will handle this large string.
        width: 30,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
🪨🚪⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨⬜🪨
🪨⬜🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜🪨⬜🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
        `,
        interactables: {
            '1,1': { type: 'door', emoji: '🚪', targetMap: 'mishnah_caverns_2', targetX: 13, targetY: 2 },
        }
    },
    'chamber_of_pure_waters': {
        width: 11,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜🪨🪨🪨🪨🪨🪨🪨⬜🪨
🪨⬜🪨💧💧💧💧💧🪨⬜🪨
🚪⬜🪨💧🚰💧🌊💧🪨⬜🚪
🪨⬜🪨💧💧💧💧💧🪨⬜🪨
🪨⬜🪨🪨🪨🪨🪨🪨🪨⬜🪨
🪨⬜⬜⬜⬜📄⬜⬜⬜⬜🪨
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
        `,
        interactables: {
             '0,4': { type: 'door', emoji: '🚪', targetMap: 'mishnah_caverns_1', targetX: 13, targetY: 5 },
             '10,4': { type: 'door', emoji: '🚪', targetMap: 'chesed_springs', targetX: 1, targetY: 3 },
             '5,8': { type: 'npc', emoji: '📄', id: 'page_mikvaot_node', dialogue: { start: ["You found a page detailing Hilchot Mikvaot!", {giveItem: 'rambam_page_mikvaot', setFlag: 'found_page_mikvaot'}, {updateQuest: 'mikvaot_1_pure_waters', objectiveId: 'learn_mikveh_law'}, "end"]}},
             '5,4': { type: 'npc', emoji: '🚰', id: 'drawn_water_elemental_boss', dialogue: { start: ["A concept of invalidation bars the way. It is water, but disconnected from its source. It cannot purify.", {startBattle: [{id: 'drawn_water_elemental', level: 12}]}], battle_win: ["With the concept defeated, the waters of the Mikveh may flow from their true source.", {updateQuest: 'mikvaot_1_pure_waters', objectiveId: 'defeat_drawn_water'}, "end"]}}
        }
    },
};