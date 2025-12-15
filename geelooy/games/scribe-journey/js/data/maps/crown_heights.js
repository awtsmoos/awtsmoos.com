
// B"H
// js/data/maps/crown_heights.js

export const crownHeightsMaps = {
    'kingston_ave': {
        width: 25,
        baseLayerString: `
🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️
🏙️🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🏙️
🏙️🧱🏠⬜🏠⬜🏪⬜🧱🧱🧱🧱🧱🧱🧱🕍🧱🧱🧱🧱🧱🧱🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🚪⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱🚶⬜🚕⬜🚶⬜⬜🚕⬜⬜⬜⬜⬜⬜⬜🚶⬜⬜⬜🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱🏠⬜🏠⬜🏠⬜🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🏙️
🏙️🧱⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🧱🏙️
🏙️🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🏙️
🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️🏙️
        `,
        interactables: {
            '770_entrance': { type: 'door', emoji: '🚪', targetMap: '770_main_hall', targetX: 10, targetY: 10, dialogue: { start: ["(The House of our Rebbe. A place of Torah, Prayer, and Kindness)."] } },
            'pizza_shop': { type: 'npc', emoji: '🏪', shop: true, dialogue: { start: ["Kosher Pizza! Heals body and soul."] } },
            'taxi': { type: 'npc', emoji: '🚕', dialogue: { start: ["Need a ride to the Ohel?", {choices: [{text: "Yes (50p)", action: "ride_ohel"}, {text: "No", next: "end"}]}], ride_ohel: ["Hop in.", {teleport: {map: 'ohel_path', x: 2, y: 13}}] } },
            'exit_to_malkuth': { type: 'door', emoji: '🏙️', targetMap: 'malkuth_village', targetX: 5, targetY: 5 }
        }
    },
    '770_main_hall': {
        width: 20,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱📚📚📚📚📚📚📚📚📚📚📚📚📚📚📚📚📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚⬜👬⬜⬜⬜👬⬜⬜⬜👬⬜⬜⬜👬⬜📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚⬜👬⬜⬜⬜🧔⬜⬜⬜🧔⬜⬜⬜👬⬜📚🧱
🧱📚⬜⬜⬜⬜⬜⬜⬜🧱⬜⬜⬜⬜⬜⬜⬜📚🧱
🧱📚📚📚📚📚📚📚📚🚪📚📚📚📚📚📚📚📚🧱
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'kingston_ave', targetX: 16, targetY: 3 },
            'farbrengen_table': { type: 'npc', emoji: '🧔', dialogue: { start: ["L'chaim! Say a blessing. The joy breaks boundaries."] } },
            'study_group': { type: 'npc', emoji: '👬', dialogue: { start: ["We are studying the daily Rambam. Join us?", {giveItem: 'rambam_page_foundations'}, "Here is a page we found."] } }
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
🌲🧱🧱🧱🧱🧱🚪🧱🧱🧱🧱🧱🧱🌲
🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲🌲
        `,
        interactables: {
            'entrance': { type: 'door', emoji: '🚪', targetMap: 'ohel_structure', targetX: 5, targetY: 5 },
            'taxi_back': { type: 'npc', emoji: '🚕', x: 2, y: 14, dialogue: { start: ["Back to Kingston Ave?", {teleport: {map: 'kingston_ave', x: 5, y: 5}}] } }
        }
    },
    'ohel_structure': {
        width: 10,
        baseLayerString: `
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱🕯️⬜⬜⬜⬜⬜⬜🕯️🧱
🧱⬜⬜⬜📃⬜⬜⬜⬜🧱
🧱⬜⬜⬜🪦⬜⬜⬜⬜🧱
🧱⬜⬜⬜🪦⬜⬜⬜⬜🧱
🧱⬜⬜⬜⬜⬜⬜⬜⬜🧱
🧱🕯️⬜⬜🚪⬜⬜⬜🕯️🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'ohel_path', targetX: 7, targetY: 6 },
            'pan_klali': { 
                type: 'npc', emoji: '📃', 
                dialogue: { 
                    start: ["(You place your request for blessing here).", "May the merit of the Tzaddikim protect you.", {action: 'meditate_ohel'}] 
                } 
            }
        }
    }
};
