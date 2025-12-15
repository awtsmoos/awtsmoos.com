
// B"H
// js/data/maps/gan_eden.js

export const ganEdenMaps = {
    'gan_eden_gate': {
        width: 20,
        baseLayerString: `
☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜🗡️⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️⬜🌫️🌫️🌫️🌫️🌫️🌫️🌫️⬜⬜⬜🌫️🌫️🌫️🌫️🌫️🌫️🌫️⬜☁️
☁️⬜🌫️🌺⬜🌸⬜🌼🌫️⬜⬜⬜🌫️🌼⬜🌸⬜🌺🌫️⬜☁️
☁️⬜🌫️⬜⬜⬜⬜⬜🌫️⬜⬜⬜🌫️⬜⬜⬜⬜⬜🌫️⬜☁️
☁️⬜🌫️⬜🧍‍♂️⬜🧍‍♀️⬜🌫️⬜⬜⬜🌫️⬜🧍‍♂️⬜🧍‍♀️⬜🌫️⬜☁️
☁️⬜🌫️⬜⬜⬜⬜⬜🌫️⬜⬜⬜🌫️⬜⬜⬜⬜⬜🌫️⬜☁️
☁️⬜🌫️🌫️🌫️🌫️🌫️🌫️🌫️⬜⬜⬜🌫️🌫️🌫️🌫️🌫️🌫️🌫️⬜☁️
☁️⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜☁️
☁️☁️☁️☁️☁️☁️☁️☁️☁️🚪☁️☁️☁️☁️☁️☁️☁️☁️☁️☁️
        `,
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'malkuth_village', targetX: 15, targetY: 2 },
            'cherub_guard': { 
                type: 'npc', emoji: '🗡️', 
                dialogue: { 
                    start: ["(The Cherub with the flaming turning sword blocks the way.)", "Only those who have refined their garments (Mitzvot) may enter."],
                    condition: { type: 'hasItem', itemId: 'garment_of_light' },
                    success: ["You wear the Ketonet Or. Enter, righteous one.", {teleport: {map: 'gan_eden_tachton', x: 10, y: 18}}],
                    fail: ["You are naked of Mitzvot. Go back and weave your garment."]
                } 
            },
            'soul_1': { type: 'npc', emoji: '🧍‍♂️', dialogue: { start: ["Is this the place? It smells like... Shabbat."] } },
            'soul_2': { type: 'npc', emoji: '🧍‍♀️', dialogue: { start: ["I am waiting for the gate to open. They say the Torah you learn creates the key."] } }
        }
    },
    'gan_eden_tachton': {
        width: 25,
        baseLayerString: `
🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
🌳🍇⬜🍎⬜🍇⬜⬜⬜⛲⬜⬜⬜🍇⬜🍎⬜🍇⬜🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜💧⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🍎⬜🧘⬜⬜🎶⬜⬜💧⬜⬜🎶⬜⬜🧘⬜🍎⬜🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜💧⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🍇⬜🕊️⬜⬜⬜⬜⬜💧⬜⬜⬜⬜⬜🕊️⬜🍇⬜🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜💧⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🍎⬜🧘⬜⬜🎶⬜⬜💧⬜⬜🎶⬜⬜🧘⬜🍎⬜🌳
🌳⬜⬜⬜⬜⬜⬜⬜⬜💧⬜⬜⬜⬜⬜⬜⬜⬜⬜🌳
🌳🍇⬜🍎⬜🍇⬜⬜⬜💧⬜⬜⬜🍇⬜🍎⬜🍇⬜🌳
🌳🌳🌳🌳🌳🌳🌳🌳🌳🚪🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
        `,
        encounters: {
            '🍇': [{ id: 'singing_grass', levelRange: [30, 40], chance: 0.4 }],
            '🍎': [{ id: 'fragrance_of_mitzvah', levelRange: [35, 45], chance: 0.3 }]
        },
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'gan_eden_gate', targetX: 10, targetY: 8 },
            'fountain': { type: 'door', emoji: '⛲', targetMap: 'gan_eden_elyon', targetX: 10, targetY: 10, condition: {type: 'stat', stat: 'diligence', value: 50}, dialogue: {start: ["Only the diligent may ascend to the Upper Garden."]} },
            'tzaddik_soul': { type: 'npc', emoji: '🧘', dialogue: { start: ["Here, we enjoy the radiance of the Shechinah. It is pleasure without limit."] } },
            'levite_soul': { type: 'npc', emoji: '🎶', dialogue: { start: ["We sing the song of the day forever."] } },
            'tree_life': { type: 'npc', emoji: '🌳', x: 12, y: 1, dialogue: { start: ["(The Tree of Life. Its branches reach into infinity.)", {giveItem: 'fruit_etrog_paradise'}] } }
        }
    },
    'gan_eden_elyon': {
        width: 20,
        baseLayerString: `
✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨
✨🚪⬜📚⬜⬜⬜🔮⬜⬜⬜📚⬜⬜⬜🔮⬜🚪✨
✨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜✨
✨📚⬜🧠⬜⬜⬜🧖‍♂️⬜⬜⬜🧠⬜⬜⬜📚⬜✨
✨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜✨
✨🔮⬜👼⬜⬜⬜🤴⬜⬜⬜👼⬜⬜⬜🔮⬜✨
✨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜✨
✨📚⬜🧠⬜⬜⬜🧖‍♂️⬜⬜⬜🧠⬜⬜⬜📚⬜✨
✨⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜✨
✨✨✨✨✨✨✨✨✨🚪✨✨✨✨✨✨✨✨✨
        `,
        encounters: {
            '✨': [
                { id: 'seraph_fire', levelRange: [50, 60], chance: 0.2 },
                { id: 'ofan_wheel', levelRange: [45, 55], chance: 0.2 }
            ]
        },
        interactables: {
            'exit': { type: 'door', emoji: '🚪', targetMap: 'gan_eden_tachton', targetX: 12, targetY: 2 },
            'metatron': { type: 'npc', emoji: '🤴', dialogue: { start: ["I am the Sar HaPanim. Welcome to the academy on high."] } },
            'academy_head': { type: 'npc', emoji: '🧖‍♂️', dialogue: { start: ["Here, we learn the Torah of Atzilut. There are no questions, only seeing."] } },
            'angel_michael': { type: 'npc', emoji: '👼', dialogue: { start: ["I offer the souls of the righteous upon the altar."] } }
        }
    }
};
