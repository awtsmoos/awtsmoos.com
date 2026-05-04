// B"H
/**
 * @module villageCompiler
 * @description THE MASTER COMPILER OF THE EMERALD VILLAGE
 * 
 * "And they shall make for Me a sanctuary, that I may dwell among them." (Shemos 25:8)
 * 
 * Takes pure data modules and compiles them into the engine's nivrayim format.
 * Generates buildings, roads, flora, and populated interiors from the Essence of Data.
 */
import { HousePresets } from '../../../utils/3d/procedural/house/data/HousePresets.js';
import { PROPERTY_LAYOUTS } from './propertyLayouts.js';
import { NPC_MANIFEST, WANDERING_NPCS } from './npcManifest.js';
import { MISSION_MANIFEST } from './missionManifest.js';
import { ROAD_NETWORK } from './roadNetwork.js';
import { VILLAGE_TREES, VILLAGE_FLOWERS, VILLAGE_ROCKS, EXTRA_COLLECTABLES, BOSS_SPAWNS, RANDOM_MAZIK_SPAWNS, ISLAND_PROPERTIES, PRESETS_MIX, MIKVAHS, RIVERS } from './scatteredNature.js';
import { CAVE_SYSTEMS } from './undergroundCaves.js';
import FenceAssembler from '../../../utils/3d/procedural/infrastructure/FenceAssembler.js';

/**
 * @class VillageCompiler
 * @description An empty vessel through which the Awtsmoos manifests the physical world.
 */
class VillageCompiler {
    /**
     * @function compile
     * @description B"H - Orchestrates the entire manifestation of the Emerald Village with 6 holy enhancements.
     * @returns {Object} The complete compiled nivrayim.
     */
    static compile() {
        // B"H: silent

        const nivrayim = {
            ProceduralRoad: {},
            ProceduralBuilding: {},
            ProceduralTree: {},
            Collectable: {},
            ProceduralFlowerPatch: {},
            Domem: {},
            InteractiveNpc: {},
            InteractiveDoor: {},
            Stairs: {},
            Mazik: {},
            Ocean: {},
            Portal: {},
            ProceduralTerrain: {},
            ProceduralRiver: {},
            HotAirBalloon: {},
            MagicalChariot: {},
            Sky: {},
            AmbientLife: {}
        };
        let treeIdx = 0, collectIdx = 0, hedgeIdx = 0, flowerIdx = 0, mazikIdx = 0, rockIdx = 0, ambientIdx = 0;

        const trace = (msg) => { /* B"H: silent */ };

        
        // ═══ ENHANCEMENT 6: SKY METADATA ═══
        nivrayim.Sky = {
            village_sky: {
                dayCycle: true, cycleSpeed: 0.001,
                colors: { day: 0x87ceeb, night: 0x000011, sunset: 0xff4500 }
            }
        };

        // ═══ 0. DYNAMIC URBAN EXPANSION ═══
        const ALL_PROPERTIES = [...PROPERTY_LAYOUTS, ...ISLAND_PROPERTIES];
        const TOTAL_EXTRA_PROPERTIES = 350; 
        const gridRange = 2500;
        for (let i = 0; i < TOTAL_EXTRA_PROPERTIES; i++) {
            const x = (Math.random() - 0.5) * gridRange * 2;
            const z = (Math.random() - 0.5) * gridRange * 2;
            if (Math.abs(x) < 350 && Math.abs(z) < 350) continue;

            const propId = `extra_prop_${i}`;
            const complexPresets = ["TwoBedroom", "TwoStoryWithStairs", "Mansion", "GrandLibrary", "BeisMedrash"];
            let randomPreset;
            
            if (i % 12 === 0) {
                // Every 12th house is a holy skyscraper reaching for the Heavens!
                randomPreset = "generateSkyscraper";
            } else {
                randomPreset = complexPresets[Math.floor(Math.random() * complexPresets.length)];
            }

            const presetArg = randomPreset === "generateSkyscraper" ? 4 + Math.floor(Math.random() * 6) : null;

            ALL_PROPERTIES.push({
                id: propId, name: `Dwelling of the Soul ${i}`, center: { x, z },
                lot: { width: 70, depth: 70 }, housePreset: randomPreset, housePresetArg: presetArg,
                fenceType: i % 3 === 0 ? "stone" : (i % 3 === 1 ? "wood" : "hedge")
            });
        }

        // ═══ 1. ROADS ═══
        const compiledRoads = ROAD_NETWORK.generate(ALL_PROPERTIES);
        compiledRoads.forEach(road => nivrayim.ProceduralRoad[road.id] = road);

        // ═══ 2. BUILDINGS + INTERIORS + FURNITURE ═══
        ALL_PROPERTIES.forEach(prop => {
            let blueprint;
            if (typeof HousePresets[prop.housePreset] === 'function') {
                blueprint = HousePresets[prop.housePreset](prop.housePresetArg);
            } else {
                blueprint = JSON.parse(JSON.stringify(HousePresets[prop.housePreset] || HousePresets.SingleRoom));
            }

            // ═══ ENHANCEMENT 1 & 3: FURNITURE & VERTICALITY ═══
            if (blueprint.rooms) {
                blueprint.rooms.forEach((room, rIdx) => {
                    const roomOffset = room.offset || [0, 0, 0];
                    if (room.furniture) {
                        room.furniture.forEach((f, fIdx) => {
                            const fId = `${prop.id}_room${rIdx}_f${fIdx}`;
                            const worldPos = {
                                x: prop.center.x + roomOffset[0] + f.pos[0],
                                y: (prop.center.y || 0) + roomOffset[1] + (f.pos[1] || 0),
                                z: prop.center.z + roomOffset[2] + f.pos[2]
                            };

                            if (f.type === "stairs") {
                                nivrayim.Stairs[fId] = {
                                    name: "Holy Ascent",
                                    dimensions: { x: 5, y: f.targetY || 10, z: 8 },
                                    position: worldPos,
                                    isSolid: true
                                };
                            } else {
                                // B"H: Mapping furniture types to their spiritual forms
                                const furnitureMeta = {
                                    chair: { color: "#5d4037", scale: [1.2, 1.2, 1.2], interactable: true },
                                    table: { color: "#795548", scale: f.scale || [4, 1, 3] },
                                    bed: { color: "#3e2723", scale: [3, 1, 5] },
                                    bookshelf: { color: "#4e342e", scale: f.scale || [5, 10, 1] },
                                    aron_kodesh: { color: "#ffc107", scale: f.scale || [4, 10, 2] },
                                    bimah: { color: "#8d6e63", scale: f.scale || [6, 2, 6] }
                                };

                                const meta = furnitureMeta[f.type] || { color: "#5d4037", scale: f.scale || [2, 2, 2] };
                                
                                nivrayim.Domem[fId] = {
                                    name: `Sacred ${f.type.charAt(0).toUpperCase() + f.type.slice(1)}`,
                                    golem: { 
                                        guf: { BoxGeometry: meta.scale }, 
                                        toyr: { MeshStandardMaterial: { color: meta.color } } 
                                    },
                                    position: { ...worldPos, y: worldPos.y + (meta.scale[1] / 2) },
                                    isSolid: true,
                                    interactable: meta.interactable || false
                                };

                                // B"H: Special logic for sitting on chairs
                                if (f.type === "chair") {
                                    nivrayim.Domem[fId].onInteraction = (chossid) => {
                                        if (chossid && chossid.mesh) {
                                            // Teleport player slightly above the chair center to "sit"
                                            const sitPos = { x: worldPos.x, y: worldPos.y + 1.2, z: worldPos.z };
                                            chossid.mesh.position.set(sitPos.x, sitPos.y, sitPos.z);
                                            if (chossid.olam) {
                                                chossid.olam.ayshPeula("ui event", "toast", { 
                                                    message: "B\"H - You are resting your soul upon this vessel." 
                                                });
                                            }
                                        }
                                    };
                                }
                            }
                        });
                    }
                });
            }

            // NPC Placement
            const houseNpcs = NPC_MANIFEST.filter(n => n.propertyId === prop.id);
            blueprint.npcs = houseNpcs.map(npc => ({
                id: npc.id, name: npc.name, x: npc.localPos.x, y: npc.localPos.y || 0.1, z: npc.localPos.z,
                dialogues: npc.dialogueTree ? npc.dialogueTree.map(d => d.message) : ["Shalom!"],
                hasShop: npc.hasShop, shopInventory: npc.shopInventory || []
            }));

            nivrayim.ProceduralBuilding[prop.id + "_house"] = {
                name: prop.name, blueprint, position: { x: prop.center.x, y: 0.1, z: prop.center.z },
                isSolid: true, interactable: true,
                // B"H: Special logic for locked houses
                isLocked: prop.id === "extra_prop_5", 
                keyId: prop.id === "extra_prop_5" ? "key_storage" : null
            };


            const fenceNivrayim = FenceAssembler.build({
                width: prop.lot.width, depth: prop.lot.depth, height: 2, type: prop.fenceType || "wood",
                position: { x: prop.center.x, y: 0, z: prop.center.z }
            });
            Object.assign(nivrayim.Domem, fenceNivrayim);
        });

        // ═══ 3. NATURE & RESOURCE NODES (ENHANCEMENT 2) ═══
        VILLAGE_TREES.forEach((tree, i) => {
            nivrayim.ProceduralTree[`wild_tree_${i}`] = {
                name: `Tree_${i}`, preset: tree.preset, position: tree.position, scale: tree.scale || 1,
                interactable: true, harvestable: true, resource: "wood_plank"
            };
        });

        VILLAGE_FLOWERS.forEach((fp, i) => {
            nivrayim.ProceduralFlowerPatch[`wild_flowers_${i}`] = {
                name: `Flowers_${i}`, count: fp.count, radius: fp.radius, flowerType: fp.flowerType, position: fp.position,
                interactable: true, harvestable: true, resource: "flower_petal"
            };
        });

        VILLAGE_ROCKS.forEach((r, i) => {
            nivrayim.Domem[`rock_${rockIdx++}`] = {
                name: r.name || "Sacred Rock",
                golem: { guf: { SphereGeometry: [1.5, 8, 8] }, toyr: { MeshStandardMaterial: { color: r.color || "#888888" } } },
                position: r.position, scale: r.scale,
                isSolid: true, interactable: true, harvestable: true, resource: "stone_chunk"
            };
            
            // ═══ ENHANCEMENT 5: AMBIENT LIFE (BUTTERFLIES) ═══
            if (Math.random() > 0.8) {
                nivrayim.AmbientLife[`butterfly_${ambientIdx++}`] = {
                    type: "butterfly", position: { x: r.position.x + 2, y: 5, z: r.position.z + 2 }, speed: 0.05, range: 10
                };
            }
        });

        // ═══ 4. WANDERING NPCS & PATHING (ENHANCEMENT 4) ═══
        WANDERING_NPCS.forEach(wnpc => {
            nivrayim.InteractiveNpc[wnpc.id] = {
                name: wnpc.name, position: { x: wnpc.position.x, y: 1.5, z: wnpc.position.z },
                dialogues: wnpc.dialogues, interactable: true,
                pathing: { nodes: [[wnpc.position.x + 20, wnpc.position.z], [wnpc.position.x, wnpc.position.z - 20]], loop: true }
            };
        });

        // ═══ 5. MAZIKIM & BOSSES ═══
        const mTypes = [
            { id: "dust", color: 0xc2b280, name: "Dust Mazik" },
            { id: "water", color: 0x00ffff, name: "Water Mazik" },
            { id: "fire", color: 0xff4500, name: "Fire Mazik" },
            { id: "air", color: 0xffffff, name: "Air Mazik" }
        ];

        for (let i = 0; i < 400; i++) {
            const x = (Math.random() - 0.5) * gridRange * 2.5;
            const z = (Math.random() - 0.5) * gridRange * 2.5;
            if (Math.abs(x) < 500 && Math.abs(z) < 500) continue;

            const t = mTypes[i % mTypes.length];
            nivrayim.Mazik[`swarm_${i}`] = {
                name: t.name, position: { x, y: 1.5, z }, color: t.color,
                elementalType: t.id, maxHp: 100, xpValue: 50
            };
        }

        BOSS_SPAWNS.forEach((boss, i) => {
            nivrayim.Mazik[`boss_${i}`] = { ...boss, position: { ...boss.position, y: 1.5 }, elementalType: "void" };
        });


        nivrayim.HotAirBalloon = {
            village_balloon: { 
                name: "The Breath of Life Balloon", 
                position: { x: 80, y: 2, z: 80 },
                color: "#ff5722"
            }
        };

        nivrayim.MagicalChariot = {
            village_chariot: { 
                name: "The Chariot of Fire", 
                position: { x: -80, y: 2, z: -80 }
            }
        };

        // ═══ 6. GROUND & FAST TRAVEL ═══
        nivrayim.ProceduralTerrain = {
            emeraldGround: {
                name: "Emerald Fields",
                width: 6000,
                depth: 6000,
                segments: 128,
                hills: [
                    { x: 0, z: 0, radius: 200, height: 15 },
                    { x: 400, z: -300, radius: 150, height: 25 },
                    { x: -500, z: 200, radius: 300, height: 20 },
                    { x: 800, z: 800, radius: 400, height: 40 }
                ],
                position: { x: 0, y: -0.1, z: 0 }
            }
        };

        MIKVAHS.forEach(m => {
            nivrayim.Portal[m.id] = {
                name: "Mikvah of Purification",
                position: { x: m.position.x, y: 0.5, z: m.position.z },
                target: m.id === "mikvah_village" ? "mikvah_mountain" : "mikvah_village",
                color: 0x00ffff
            };
        });

        // ═══ 7. RIVERS ═══
        RIVERS.forEach(r => {
            nivrayim.ProceduralRiver[r.id] = { ...r, position: { x: 0, y: -0.5, z: 0 } };
        });

        // ═══ 8. WATER & CAVES ═══
        nivrayim.Ocean = { world_ocean: { name: "The Great Sea", size: 6000, y: -1.5, color: 0x003366 } };
        CAVE_SYSTEMS.forEach(cave => {
            nivrayim.ProceduralBuilding[cave.id] = { ...cave, position: { x: cave.center.x, y: cave.depth, z: cave.center.z } };
        });

        return nivrayim;
    }
}

export function compileVillage() {
    return VillageCompiler.compile();
}


