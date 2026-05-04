
/**
 * B"H
 * @file village.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║  THE EMERALD VILLAGE — COMPLETE WORLD MANIFEST v2                  ║
 * ║                                                                    ║
 * ║  Chapter 55: The Infinite Adventure Manifested                    ║
 * ║                                                                    ║
 * ║  10 fenced properties | 12 roads | 20+ missions | 23 NPCs         ║
 * ║  150+ trees | 10+ bosses | 40+ collectables | ships & vehicles    ║
 * ║  Sky Palaces | Tohu Labyrinth | Kelipos Void | Hidden Temples      ║
 * ║  Fast Travel Mikvahs | Dynamic Day/Night & Shabbos Mode           ║
 * ║  The Great Etz Chayim | Procedural Rivers of Eden                 ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

import { compileVillage } from './emeraldVillage/villageCompiler.js';

const compiledNivrayim = compileVillage();

export default {
    shaym: "The Emerald Village of Living Letters",
    components: {
        awduhm: "https://models-3122d.web.app/chossid.glb"
    },
    nivrayim: {
        /** B"H: The Dome of Heaven */
        ProceduralSky: {
            domeOfHeaven: {
                name: "Emerald_Sky",
                timeMultiplier: 1.5,
                timeOfDay: 8.0
            }
        },

        /** B"H: The Emerald Ground */
        Domem: {
            emeraldGround: {
                name: "Emerald_Village_Ground",
                golem: {
                    guf: { BoxGeometry: [2000, 2, 2000] },
                    toyr: { AwtsmoosGrassMaterial: {} }
                },
                position: { x: 0, y: -1, z: 0 },
                isSolid: true,
                on: {
                    ready(me) {
                        if (me.mesh) me.mesh.frustumCulled = false;
                    }
                }
            },
            ...(compiledNivrayim.Domem || {})
        },

        /** B"H: 12 road segments */
        ProceduralRoad: compiledNivrayim.ProceduralRoad || {},

        /** B"H: Flower patches */
        ProceduralFlowerPatch: compiledNivrayim.ProceduralFlowerPatch || {},

        /** B"H: Procedural Rivers */
        ProceduralRiver: compiledNivrayim.ProceduralRiver || {},

        /** B"H: 30+ collectables */
        Collectable: compiledNivrayim.Collectable || {},

        /** B"H: 150+ trees */
        ProceduralTree: compiledNivrayim.ProceduralTree || {},

        /** B"H: 10 buildings */
        ProceduralBuilding: compiledNivrayim.ProceduralBuilding || {},

        /** B"H: Property gate doors */
        InteractiveDoor: compiledNivrayim.InteractiveDoor || {},

        /** B"H: 12 wandering NPCs */
        InteractiveNpc: compiledNivrayim.InteractiveNpc || {},

        /** B"H: Boss Mazzikim */
        Mazik: compiledNivrayim.Mazik || {},

        /** B"H: Cave Entrance Stairs */
        Stairs: compiledNivrayim.Stairs || {},

        /** B"H: Mikvah Fast Travel Portals */
        Portal: compiledNivrayim.Portal || {},

        /** B"H: The Player */
        Chossid: [
            {
                name: "The Chossid",
                height: 1.5,
                speed: 180,
                interactable: true,
                path: "https://models-3122d.web.app/chossid.glb?k=village_emerald_v5",
                position: { x: 0, y: 40, z: 0 },
                
                // ═══ THE LIGHT SYSTEM (MORALITY) ═══
                orLevel: 0, // Starts at 0 Light
                
                // ═══ COMBAT STATUS ═══
                hp: 100,
                maxHp: 100,
                koach: 50,
                maxKoach: 50,
                xp: 0,
                level: 1,
                basePower: 10,
                baseDefense: 5,
                
                on: {
                    ready(n) {
                        // B"H: silent

                        if (n && typeof n.updateAppearance === "function") {
                            n.updateAppearance();
                        }
                    },
                    "hit floor": function(m) {
                        m.olam.ayshPeula("ui event", "effectsOverlay", {
                            text: "Welcome to the Emerald Village! Seek the Etz Chayim.",
                            color: "#50C878"
                        });
                    },
                    // Dynamic Or System
                    addLight: function(m, amount) {
                        m.orLevel += amount;
                        // B"H: silent

                        if(m.orLevel > 100) {
                            m.olam.ayshPeula("ui event", "effectsOverlay", {
                                text: "You are radiating the Infinite Light!",
                                color: "#ffffff"
                            });
                        }
                    }
                }
            }
        ]
    }
};
