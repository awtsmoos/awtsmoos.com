
// B"H
// js/data/maps/gan_eden.js

export const ganEdenMaps = {
    'gan_eden_gate': {
        width: 20,
        baseLayerString: `
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜🌫️🌫️🌫️🌫️🌫️🌫️🌫️⬜⬜⬜🌫️🌫️🌫️🌫️🌫️🌫️🌫️⬜☁️
☁️⬜🌫️🌺⬜🌸⬜🌼🌫️⬜⬜⬜🌫️🌼⬜🌸⬜🌺🌫️⬜☁️
☁️⬜🌫️⬜⬜⬜⬜⬜🌫️⬜⬜⬜🌫️⬜⬜⬜⬜⬜🌫️⬜☁️
☁️⬜🌫️⬜⬜⬜🌫️⬜⬜⬜🌫️⬜⬜⬜🌫️⬜☁️
☁️⬜🌫️⬜⬜⬜⬜⬜🌫️⬜⬜⬜🌫️⬜⬜⬜⬜⬜🌫️⬜☁️
☁️⬜🌫️🌫️🌫️🌫️🌫️🌫️🌫️⬜⬜⬜🌫️🌫️🌫️🌫️🌫️🌫️🌫️⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
        `,
        interactables: {
            'exit': { type: 'door', uu: '\uf606', visual: '🚪', emoji: '🚪', x: 9, y: 9, targetMap: 'malkuth_village', targetX: 15, targetY: 2 },
            'cherub_guard': { 
                type: 'npc', uu: '\uf601', visual: '🗡️', emoji: '🗡️', x: 10, y: 1, 
                dialogue: { 
                    start: ["(The Cherub with the flaming turning sword blocks the way.)", "Only those who have refined their garments (Mitzvot) may enter."],
                    condition: { type: 'hasItem', itemId: 'garment_of_light' },
                    success: ["You wear the Ketonet Or. Enter, righteous one.", {teleport: {map: 'gan_eden_tachton', x: 10, y: 18}}],
                    fail: ["You are naked of Mitzvot. Go back and weave your garment."]
                } 
            },
            'soul_1': { type: 'npc', uu: '\uf602', visual: '🧍‍♂️', emoji: '🧍‍♂️', x: 4, y: 5, dialogue: { start: ["Is this the place? It smells like... Shabbat."] } },
            'soul_2': { type: 'npc', uu: '\uf603', visual: '🧍‍♀️', emoji: '🧍‍♀️', x: 6, y: 5, dialogue: { start: ["I am waiting for the gate to open. They say the Torah you learn creates the key."] } },
            'soul_3': { type: 'npc', uu: '\uf604', visual: '🧍‍♂️', emoji: '🧍‍♂️', x: 14, y: 5, dialogue: { start: ["I learned below; now every word shines here."] } },
            'soul_4': { type: 'npc', uu: '\uf605', visual: '🧍‍♀️', emoji: '🧍‍♀️', x: 16, y: 5, dialogue: { start: ["The garden remembers every mitzvah done in a body."] } }
        }
    },
    'gan_eden_tachton': {
        width: 25,
        baseLayerString: `
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
🌳🍇⬜🍎⬜🍇⬜⬜⬜⬜⬜⬜🍇⬜🍎⬜🍇⬜🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜💧⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🍎⬜⬜⬜⬜⬜💧⬜⬜⬜⬜⬜🍎⬜🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜💧⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🍇⬜⬜⬜⬜⬜⬜💧⬜⬜⬜⬜⬜⬜🍇⬜🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜💧⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🍎⬜🧘⬜⬜🎶⬜⬜💧⬜⬜🎶⬜⬜🧘⬜🍎⬜🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜💧⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🍇⬜🍎⬜🍇⬜⬜⬜💧⬜⬜⬜🍇⬜🍎⬜🍇⬜🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
        `,
        encounters: {
            '🍇': [{ id: 'singing_grass', levelRange: [30, 40], chance: 0.4 }],
            '🍎': [{ id: 'fragrance_of_mitzvah', levelRange: [35, 45], chance: 0.3 }]
        },
        interactables: {
            'exit': { type: 'door', uu: '\uf61c', visual: '🚪', emoji: '🚪', x: 9, y: 10, targetMap: 'gan_eden_gate', targetX: 10, targetY: 8 },
            'fountain': { type: 'door', uu: '\uf611', visual: '⛲', emoji: '⛲', x: 9, y: 1, targetMap: 'gan_eden_elyon', targetX: 10, targetY: 10, condition: {type: 'stat', stat: 'diligence', value: 50}, dialogue: {start: ["Only the diligent may ascend to the Upper Garden."]} },
            'tzaddik_soul': { type: 'npc', uu: '\uf612', visual: '🧘', emoji: '🧘', x: 3, y: 3, dialogue: { start: ["Here, we enjoy the radiance of the Shechinah. It is pleasure without limit."] } },
            'levite_soul': { type: 'npc', uu: '\uf614', visual: '🎶', emoji: '🎶', x: 6, y: 3, dialogue: { start: ["We sing the song of the day forever."] } },
            'tree_life': { type: 'npc', emoji: '🌳', x: 12, y: 1, dialogue: { start: ["(The Tree of Life. Its branches reach into infinity.)", {giveItem: 'fruit_etrog_paradise'}] } },
            'tzaddik_soul_east': { type: 'npc', uu: '\uf613', visual: '🧘', emoji: '🧘', x: 15, y: 3, dialogue: { start: ["The east soul says: delight becomes mission when remembered below."] } },
            'dove_west': { type: 'npc', uu: '\uf616', visual: '🕊️', emoji: '🕊️', x: 3, y: 5, dialogue: { start: ["Peace is not escape; it is harmony after refinement."] } },
            'dove_east': { type: 'npc', uu: '\uf617', visual: '🕊️', emoji: '🕊️', x: 15, y: 5, dialogue: { start: ["A second dove carries the song outward."] } },
            'tzaddik_lower_west': { type: 'npc', uu: '\uf618', visual: '🧘', emoji: '🧘', x: 3, y: 7, dialogue: { start: ["The lower garden receives the deed and reveals its fragrance."] } },
            'levite_lower_west': { type: 'npc', uu: '\uf619', visual: '🎶', emoji: '🎶', x: 6, y: 7, dialogue: { start: ["The lower song rises through action."] } },
            'levite_lower_east': { type: 'npc', uu: '\uf61a', visual: '🎶', emoji: '🎶', x: 12, y: 7, dialogue: { start: ["The east song answers the west song."] } },
            'tzaddik_lower_east': { type: 'npc', uu: '\uf61b', visual: '🧘', emoji: '🧘', x: 15, y: 7, dialogue: { start: ["The body below made this delight possible."] } }
        }
    },
    'gan_eden_elyon': {
        width: 20,
        baseLayerString: `
✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨
✨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜✨
✨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜✨
✨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜✨
✨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜✨
✨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜✨
✨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜✨
✨📚⬜🧠⬜⬜⬜🧖‍♂️⬜⬜⬜🧠⬜⬜⬜📚⬜✨
✨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜✨
✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨
        `,
        encounters: {
            '✨': [
                { id: 'seraph_fire', levelRange: [50, 60], chance: 0.2 },
                { id: 'ofan_wheel', levelRange: [45, 55], chance: 0.2 }
            ]
        },
        interactables: {
            'exit': { type: 'door', uu: '\uf621', visual: '🚪', emoji: '🚪', x: 1, y: 1, targetMap: 'gan_eden_tachton', targetX: 12, targetY: 2 },
            'metatron': { type: 'npc', uu: '\uf62e', visual: '🤴', emoji: '🤴', x: 7, y: 5, dialogue: { start: ["I am the Sar HaPanim. Welcome to the academy on high."] } },
            'academy_head': { type: 'npc', uu: '\uf623', visual: '🧖‍♂️', emoji: '🧖‍♂️', x: 7, y: 3, dialogue: { start: ["Here, we learn the Torah of Atzilut. There are no questions, only seeing."] } },
            'angel_michael': { type: 'npc', uu: '\uf624', visual: '👼', emoji: '👼', x: 3, y: 5, dialogue: { start: ["I offer the souls of the righteous upon the altar."] } },
            'upper_exit': { type: 'door', uu: '\uf622', visual: '🚪', emoji: '🚪', x: 17, y: 1, targetMap: 'gan_eden_tachton', targetX: 12, targetY: 2 },
            'book_upper_west': { type: 'npc', uu: '\uf625', visual: '📚', emoji: '📚', x: 3, y: 1, dialogue: { start: ["Upper Torah is seen here as light."] } },
            'oracle_upper_west': { type: 'npc', uu: '\uf626', visual: '🔮', emoji: '🔮', x: 7, y: 1, dialogue: { start: ["Vision without descent remains incomplete."] } },
            'book_upper_east': { type: 'npc', uu: '\uf627', visual: '📚', emoji: '📚', x: 11, y: 1, dialogue: { start: ["Every book asks to become a deed."] } },
            'oracle_upper_east': { type: 'npc', uu: '\uf628', visual: '🔮', emoji: '🔮', x: 15, y: 1, dialogue: { start: ["A second vision points down into the world."] } },
            'book_midwest': { type: 'npc', uu: '\uf629', visual: '📚', emoji: '📚', x: 1, y: 3, dialogue: { start: ["The academy has shelves for every soul-root."] } },
            'mind_midwest': { type: 'npc', uu: '\uf62a', visual: '🧠', emoji: '🧠', x: 3, y: 3, dialogue: { start: ["Mind above sees what mind below must work for."] } },
            'mind_mideast': { type: 'npc', uu: '\uf62b', visual: '🧠', emoji: '🧠', x: 11, y: 3, dialogue: { start: ["Understanding here is luminous, not abstract."] } },
            'book_mideast': { type: 'npc', uu: '\uf62c', visual: '📚', emoji: '📚', x: 15, y: 3, dialogue: { start: ["The book returns you to mission."] } },
            'oracle_midwest': { type: 'npc', uu: '\uf62d', visual: '🔮', emoji: '🔮', x: 1, y: 5, dialogue: { start: ["A vision of angels conceding to embodied Torah."] } },
            'angel_mideast': { type: 'npc', uu: '\uf62f', visual: '👼', emoji: '👼', x: 11, y: 5, dialogue: { start: ["Another angel says: did I descend to Egypt? No. You did."] } },
            'oracle_mideast': { type: 'npc', uu: '\uf630', visual: '🔮', emoji: '🔮', x: 15, y: 5, dialogue: { start: ["The vision closes only when you return below."] } },
            'lower_exit': { type: 'door', uu: '\uf636', visual: '🚪', emoji: '🚪', x: 9, y: 9, targetMap: 'gan_eden_tachton', targetX: 12, targetY: 2 }
        }
    }
};
