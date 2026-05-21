
// B"H
// js/data/maps/crown_heights.js

export const crownHeightsMaps = {
    'kingston_ave': {
        width: 25,
        baseLayerString: `
🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️
🏙️🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🏙️
🏙️🧱⬜⬜⬜🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱⬜⬜⬜🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🏙️
🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️
        `,
        interactables: {
            '770_entrance': { type: 'door', uu: '\uf405', visual: '🚪', emoji: '🚪', x: 15, y: 3, targetMap: '770_main_hall', targetX: 10, targetY: 10, dialogue: { start: ["(The House of our Rebbe. A place of Torah, Prayer, and Kindness)."] } },
            'pizza_shop': { type: 'npc', uu: '\uf403', visual: '🏪', emoji: '🏪', x: 6, y: 2, shop: true, dialogue: { start: ["Kosher Pizza! Heals body and soul."] } },
            'taxi': { type: 'npc', uu: '\uf407', visual: '🚕', emoji: '🚕', x: 4, y: 4, dialogue: { start: ["Need a ride to the Ohel?", {choices: [{text: "Yes (50p)", action: "ride_ohel"}, {text: "No", next: "end"}]}], ride_ohel: ["Hop in.", {teleport: {map: 'ohel_path', x: 2, y: 13}}] } },
            'exit_to_malkuth': { type: 'door', uu: '\uf404', visual: '🏙️', emoji: '🏙️', x: 15, y: 2, targetMap: 'malkuth_village', targetX: 5, targetY: 5 },
            'house_kingston_1': { type: 'npc', uu: '\uf401', visual: '🏠', emoji: '🏠', x: 2, y: 2, dialogue: { start: ["A family prepares a Shabbos table for travelers."] } },
            'house_kingston_2': { type: 'npc', uu: '\uf402', visual: '🏠', emoji: '🏠', x: 4, y: 2, dialogue: { start: ["A mezuzah glows: every doorway can become a mission."] } },
            'pedestrian_west': { type: 'npc', uu: '\uf406', visual: '🚶', emoji: '🚶', x: 2, y: 4, dialogue: { start: ["Kingston carries small errands that become shlichus."] } },
            'pedestrian_center': { type: 'npc', uu: '\uf408', visual: '🚶', emoji: '🚶', x: 6, y: 4, dialogue: { start: ["Ask in 770 where the next road opens."] } },
            'taxi_second': { type: 'npc', uu: '\uf409', visual: '🚕', emoji: '🚕', x: 9, y: 4, dialogue: { start: ["Another taxi, another route — but this one is named."] } },
            'pedestrian_east': { type: 'npc', uu: '\uf40a', visual: '🚶', emoji: '🚶', x: 17, y: 4, dialogue: { start: ["A passerby tells you: level before the next master Rabbi debate."] } },
            'house_kingston_3': { type: 'npc', uu: '\uf40b', visual: '🏠', emoji: '🏠', x: 2, y: 8, dialogue: { start: ["A home becomes a Chabad house when opened outward."] } },
            'house_kingston_4': { type: 'npc', uu: '\uf40c', visual: '🏠', emoji: '🏠', x: 4, y: 8, dialogue: { start: ["The city is made of many small acts of welcome."] } },
            'house_kingston_5': { type: 'npc', uu: '\uf40d', visual: '🏠', emoji: '🏠', x: 6, y: 8, dialogue: { start: ["No house is generic if its mission is named."] } }
        }
    },
    '770_main_hall': {
        width: 20,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱📚📚📚📚📚📚📚📚📚📚📚📚📚📚📚📚📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜🧱⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚📚📚📚📚📚📚📚📚📚📚📚📚📚📚📚🧱
        `,
        interactables: {
            'exit': { type: 'door', uu: '\uf421', visual: '🚪', emoji: '🚪', x: 9, y: 7, targetMap: 'kingston_ave', targetX: 16, targetY: 3 },
            'farbrengen_table': { type: 'npc', uu: '\uf422', visual: '🧔', emoji: '🧔', x: 7, y: 5, dialogue: { start: ["L'chaim! Say a blessing. The joy breaks boundaries."] } },
            'study_group': { type: 'npc', uu: '\uf425', visual: '👬', emoji: '👬', x: 3, y: 3, dialogue: { start: ["We are studying the daily Rambam. Join us?", {giveItem: 'rambam_page_foundations'}, "Here is a page we found."] } },
            'farbrengen_table_east': { type: 'npc', uu: '\uf423', visual: '🧔', emoji: '🧔', x: 11, y: 5, dialogue: { start: ["Another mashpia answers with a different niggun."] } },
            'study_group_midwest': { type: 'npc', uu: '\uf426', visual: '👬', emoji: '👬', x: 7, y: 3, dialogue: { start: ["A chavrusa studies whether action precedes understanding."] } },
            'study_group_mideast': { type: 'npc', uu: '\uf427', visual: '👬', emoji: '👬', x: 11, y: 3, dialogue: { start: ["They are learning the maamar about souls in bodies."] } },
            'study_group_east': { type: 'npc', uu: '\uf428', visual: '👬', emoji: '👬', x: 15, y: 3, dialogue: { start: ["Every table in 770 points outward to shlichus."] } },
            'study_group_lower_west': { type: 'npc', uu: '\uf429', visual: '👬', emoji: '👬', x: 3, y: 5, dialogue: { start: ["The lower table reviews the road graph."] } },
            'study_group_lower_east': { type: 'npc', uu: '\uf42a', visual: '👬', emoji: '👬', x: 15, y: 5, dialogue: { start: ["They remind you: defeat the master Rabbi to open the next road."] } }
        }
    },
    'ohel_path': {
        width: 15,
        baseLayerString: `
🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲
🌲🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🌲
🌲🧱🪦⬜🪦⬜🪦⬜🪦⬜🪦⬜🧱🌲
🌲🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🌲
🌲🧱⬜🪦⬜🪦⬜🪦⬜🪦⬜🪦🧱🌲
🌲🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🌲
🌲🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🌲
🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲
        `,
        interactables: {
            'entrance': { type: 'door', uu: '\uf431', visual: '🚪', emoji: '🚪', x: 6, y: 6, targetMap: 'ohel_structure', targetX: 5, targetY: 5 },
            'taxi_back': { type: 'npc', emoji: '🚕', x: 2, y: 14, dialogue: { start: ["Back to Kingston Ave?", {teleport: {map: 'kingston_ave', x: 5, y: 5}}] } }
        }
    },
    'ohel_structure': {
        width: 10,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜🪦⬜⬜⬜⬜🧱
🧱⬜⬜⬜🪦⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', uu: '\uf441', visual: '🚪', emoji: '🚪', x: 4, y: 6, targetMap: 'ohel_path', targetX: 7, targetY: 6 },
            'pan_klali': { 
                type: 'npc', uu: '\uf443', visual: '📃', emoji: '📃', x: 4, y: 2, 
                dialogue: { 
                    start: ["(You place your request for blessing here).", "May the merit of the Tzaddikim protect you.", {action: 'meditate_ohel'}] 
                } 
            },
            'candle_nw': { type: 'npc', uu: '\uf445', visual: '🕯️', emoji: '🕯️', x: 1, y: 1, dialogue: { start: ["A candle for memory and mission."] } },
            'candle_ne': { type: 'npc', uu: '\uf446', visual: '🕯️', emoji: '🕯️', x: 8, y: 1, dialogue: { start: ["The second candle keeps the request from becoming private only."] } },
            'candle_sw': { type: 'npc', uu: '\uf447', visual: '🕯️', emoji: '🕯️', x: 1, y: 6, dialogue: { start: ["The lower candle returns blessing to action."] } },
            'candle_se': { type: 'npc', uu: '\uf448', visual: '🕯️', emoji: '🕯️', x: 8, y: 6, dialogue: { start: ["A request becomes complete when it becomes shlichus."] } }
        }
    }
};
