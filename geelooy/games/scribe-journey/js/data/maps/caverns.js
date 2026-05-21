// B"H
// js/data/maps/caverns.js

export const cavernMaps = {
    'mishnah_caverns_1': {
        width: 15,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
🪨⬜⬜⬜⬜🪨⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜🪨🪨⬜🪨⬜🪨🪨🪨🪨🪨⬜🪨
🪨⬜🪨⬜⬜⬜⬜⬜⬜⬜⬜🪨⬜🪨
🪨⬜🪨🪨🪨🪨⬜🪨🪨🪨🪨⬜🪨🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
        `,
        interactables: {
            'entrance': { type: 'door', uu: '\ue501', visual: '🕳️', emoji: '🕳️', x: 4, y: 0, targetMap: 'scribe_atheneum_main', targetX: 3, targetY: 5 },
            'to_caverns_2': { type: 'door', uu: '\ue502', visual: '🚪', emoji: '🚪', x: 8, y: 5, targetMap: 'mishnah_caverns_2', targetX: 1, targetY: 3 },
            'to_mikvaot': { type: 'door', uu: '\ue503', visual: '🚪', emoji: '🚪', x: 14, y: 5, targetMap: 'chamber_of_pure_waters', targetX: 1, targetY: 4 },
            'page_foundations': { type: 'npc', uu: '\ue504', visual: '📄', emoji: '📄', x: 1, y: 5, dialogue: { start: ["You found a weathered page from the Mishneh Torah! It discusses the Foundation of all Foundations.", {giveItem: "rambam_page_foundations", setFlag: "found_page_foundations"}, "end"]}}
        }
    },
    'mishnah_caverns_2': {
        width: 15,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
🪨⬜⬜⬜🪨🪨🪨🪨🪨🪨🪨🪨⬜⬜
🪨⬜🪨⬜🪨🕳️🕳️🕳️🕳️🕳️🕳️🪨⬜⬜🪨
🪨🪨⬜🪨🕳️🕳️🕳️🕳️🕳️🪨⬜⬜🪨
🪨🪨🪨⬜🪨🪨🪨🪨🪨🪨🪨🪨⬜⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
        `,
        interactables: {
            'from_caverns_1': { type: 'door', uu: '\ue531', visual: '🚪', emoji: '🚪', x: 0, y: 4, targetMap: 'mishnah_caverns_1', targetX: 8, targetY: 5 },
            'to_caverns_3': { type: 'door', uu: '\ue512', visual: '🚪', emoji: '🚪', x: 14, y: 1, targetMap: 'mishnah_caverns_3', targetX: 1, targetY: 1 },
            'digger_levi': { type: 'npc', uu: '\ue513', visual: '👨‍🔧', emoji: '👨‍🔧', x: 1, y: 5, questGiver: 'nizkei_mamon_2_the_pit', dialogue: {
                start: ["Careful, Scribe! I was just digging here... for treasures, you see. Didn't mean for anyone to get hurt."],
                confront: ["It's true, I dug the pit. I never thought an ox would wander this deep! Please, I can't afford to pay full damages..."],
            }},
             'page_damages': { type: 'npc', uu: '\ue514', visual: '📄', emoji: '📄', x: 9, y: 5, dialogue: { start: ["You found a page from the Mishneh Torah! It details the laws of damages by a pit.", {giveItem: "rambam_page_damages", setFlag: "found_page_damages"}, {updateQuest: 'nizkei_mamon_2_the_pit', objectiveId: 'learn_pit_law'}, "end"]}},
             'shadow_npc': { type: 'npc', uu: '\ue515', visual: '👤', emoji: '👤', x: 6, y: 3, dialogue: {start: ["...What is certainty? What is doubt?... The Rambam builds a fortress of logic, but what of the things that cannot be known? ...Debate me, and see if your foundations hold.", {startBattle: [{id: 'shadow_of_doubt', level: 10}]}]}},
        }
    },
    'mishnah_caverns_3': {
        width: 30,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨⬜🪨
🪨⬜🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜🪨⬜🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
        `,
        interactables: {
            'from_caverns_2': { type: 'door', uu: '\ue521', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'mishnah_caverns_2', targetX: 13, targetY: 2 },
        }
    },
    'chamber_of_pure_waters': {
        width: 11,
        baseLayerString: `
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜🪨🪨🪨🪨🪨🪨🪨⬜🪨
🪨⬜🪨💧💧💧💧💧🪨⬜🪨
⬜🪨💧💧🌊💧🪨⬜
🪨⬜🪨💧💧💧💧💧🪨⬜🪨
🪨⬜🪨🪨🪨🪨🪨🪨🪨⬜🪨
🪨⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
        `,
        interactables: {
             'from_caverns_1': { type: 'door', uu: '\ue531', visual: '🚪', emoji: '🚪', x: 0, y: 4, targetMap: 'mishnah_caverns_1', targetX: 13, targetY: 5 },
             'to_chesed': { type: 'door', uu: '\ue532', visual: '🚪', emoji: '🚪', x: 10, y: 4, targetMap: 'chesed_springs', targetX: 1, targetY: 3 },
             'page_mikvaot': { type: 'npc', uu: '\ue533', visual: '📄', emoji: '📄', x: 5, y: 7, dialogue: { start: ["You found a page detailing Hilchot Mikvaot!", {giveItem: 'rambam_page_mikvaot', setFlag: 'found_page_mikvaot'}, {updateQuest: 'mikvaot_1_pure_waters', objectiveId: 'learn_mikveh_law'}, "end"]}},
             'drawn_water_elemental': { type: 'npc', uu: '\ue534', visual: '🚰', emoji: '🚰', x: 4, y: 4, dialogue: { start: ["A concept of invalidation bars the way. It is water, but disconnected from its source. It cannot purify.", {startBattle: [{id: 'drawn_water_elemental', level: 12}]}], battle_win: ["With the concept defeated, the waters of the Mikveh may flow from their true source.", {updateQuest: 'mikvaot_1_pure_waters', objectiveId: 'defeat_drawn_water'}, "end"]}}
        }
    },
};