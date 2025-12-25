
/**
 * B"H
 * Mivtza Teffilin Shlichus
 */

export default ({
    id: "mivtza_teffilin",
    shaym: "Mivtza Teffilin",
    type: "action", // Special type
    priority: 3, // Sacred
    objective: "Find 5 Jewish souls and help them put on Teffilin.",
    description: "The Rebbe launched the Teffilin campaign in 1967. It draws down the Mochin (Intellect) of the Creator into the world. Go out and find souls who are waiting!",
    
    totalCollectedObjects: 5, // Here "collected" means "people put on"
    collected: 0,
    progressDescription: "Souls Illuminated",
    
    // Rewards
    rewards: [
        { id: "coin_192", className: "Coin", value: 192, name: "Silver Dinar" }
    ],

    // Dialogue with the Mashpia (Giver)
    dialogue: {
        intro: [
            {
                message: "B\"H\nShalom! The world is thirsty for connection. A pair of Teffilin can change everything. Will you take this pair and go out to the street?",
                responses: [
                    {
                        text: "Yes! Give me the Teffilin.",
                        acceptShlichus: "mivtza_teffilin",
                        close: "Hatzlacha! Remember, words coming from the heart enter the heart."
                    },
                    {
                        text: "I'm a bit shy...",
                        message: "Shyness is natural, but the Neshama inside them is waiting for you. Just try one.",
                        nextMessageIndex: 0 // Loop back
                    }
                ]
            }
        ],
        middle: [
            {
                message: "How is the Mivtza going? Have you found 5 people?",
                responses: [
                    { text: "Still working on it.", type: "close" }
                ]
            }
        ],
        finished: [
            {
                message: "Mamash Amazing! You have lit up the world. Here is something for your efforts to give to Tzedakah.",
                responses: [
                    {
                        text: "Boruch Hashem!",
                        completeShlichus: "mivtza_teffilin",
                        close: "Keep it up."
                    }
                ]
            }
        ]
    },

    // When activated, we need to spawn the NPC crowd and give the player Teffilin
    spawnItems: [
        // Give player Teffilin
        {
            id: "player_teffilin",
            className: "Teffilin",
            name: "Kosher Teffilin",
            description: "A pair of Teffilin.",
            on: {
                 // Auto-add to inventory when mission starts
                 collected(obj, player) {
                     // This is handled by the shlichus spawner logic mostly
                 }
            }
        }
    ],
    
    // Custom Logic on Start
    onStart: (sh) => {
         // Add Teffilin to inventory immediately
         sh.olam.player.inventory.addItem({
             id: "player_teffilin_" + Date.now(),
             className: "Teffilin",
             name: "Mivtza Teffilin Set",
             description: "For Mivtza use."
         });
         
         // Spawn Wandering Jews
         // We'll use the 'CustomNpc' class but randomize them
         const personalities = [
             { name: "David the Lawyer", desc: "A busy man in a suit, checking his watch.", receptivity: 0.3 },
             { name: "Yossi the Artist", desc: "Looking at the sky, contemplative.", receptivity: 0.8 },
             { name: "Dan the Tourist", desc: "Holding a map, looks confused.", receptivity: 0.6 },
             { name: "Dr. Levine", desc: "Rushing to a clinic.", receptivity: 0.2 },
             { name: "Levi", desc: "Just hanging out.", receptivity: 0.9 }
         ];

         personalities.forEach((p, i) => {
             const x = (Math.random() - 0.5) * 40;
             const z = (Math.random() - 0.5) * 40;
             
             sh.olam.addObject("CustomNpc", {
                 name: p.name,
                 position: { x: x + 20, y: 0, z: z },
                 itemData: {
                     customData: {
                         name: p.name,
                         description: p.desc,
                         dialogueTree: [
                             {
                                 message: `B"H\n(The soul looks at you) ${p.desc}`,
                                 responses: [
                                     { text: "Excuse me, are you Jewish?", nextMessageIndex: 1 },
                                     { text: "Have a good day.", type: "close" }
                                 ]
                             },
                             {
                                 message: "Yes, I am. Why do you ask?",
                                 responses: [
                                     { text: "Just saying hello.", type: "close" }
                                     // The 'Teffilin' item will inject the Mivtza option here dynamically
                                 ]
                             }
                         ]
                     }
                 },
                 on: {
                     ready(npc) {
                         npc.receptivity = p.receptivity; // Attach custom property for logic
                         npc.randomizeAppearance();
                     }
                 }
             });
         });
    }
});
