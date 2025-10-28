// B"H
// js/data/maps/caverns.js

export const cavernMaps = {
    'mishnah_caverns_1': {
        width: 15,
        baseLayerString: `
🪨🪨🪨🪨🕳️🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
🪨⬜⬜⬜⬜🪨⬜⬜⬜⬜⬜⬜⬜⬜🪨
🪨⬜🪨🪨⬜🪨⬜🪨🪨🪨🪨🪨⬜🪨
🪨⬜🪨👤⬜⬜⬜⬜⬜⬜⬜🪨⬜🪨
🪨⬜🪨🪨🪨🪨⬜🪨🪨🪨🪨⬜🪨🪨
🪨📄⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪
🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨🪨
        `,
        interactables: {
            '4,0': { type: 'door', emoji: '🕳️', targetMap: 'scholar_house', targetX: 3, targetY: 5 },
            '13,5': { type: 'door', emoji: '🚪', targetMap: 'chamber_of_pure_waters', targetX: 1, targetY: 4 },
            '1,5': { type: 'npc', emoji: '📄', id: 'page_foundations_node', dialogue: { start: ["You found a weathered page from the Mishneh Torah! It discusses the Foundation of all Foundations.", {giveItem: "rambam_page_foundations"}, "end"]}}
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
             '0,4': { type: 'door', emoji: '🚪', targetMap: 'mishnah_caverns_1', targetX: 12, targetY: 5 },
             '10,4': { type: 'door', emoji: '🚪', targetMap: 'chesed_springs', targetX: 1, targetY: 3 },
             '5,8': { type: 'npc', emoji: '📄', id: 'page_mikvaot_node', dialogue: { start: ["You found a page detailing Hilchot Mikvaot!", {giveItem: 'rambam_page_mikvaot'}, "end"]}},
             '5,4': { type: 'npc', emoji: '🚰', id: 'drawn_water_elemental_boss', dialogue: { start: ["A concept of invalidation bars the way. It is water, but disconnected from its source. It cannot purify.", {startBattle: [{id: 'drawn_water_elemental', level: 12}]}], battle_win: ["With the concept defeated, the waters of the Mikveh may flow from their true source.", {updateQuest: 'mikvaot_1_pure_waters', objectiveId: 'defeat_drawn_water'}, "end"]}}
        }
    },
};