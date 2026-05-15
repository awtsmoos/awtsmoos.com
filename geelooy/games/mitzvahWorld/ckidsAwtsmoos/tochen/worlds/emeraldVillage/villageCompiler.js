// B"H
/**
 * @module villageCompiler
 * @description THE MASTER COMPILER OF THE EMERALD VILLAGE — Arboretum and Urban Manifestation
 */
import { HousePresets } from '../../../utils/3d/procedural/house/data/HousePresets.js';
import { PROPERTY_LAYOUTS } from './propertyLayouts.js';
import { NPC_MANIFEST, WANDERING_NPCS } from './npcManifest.js';
import { MISSION_MANIFEST } from './missionManifest.js';
import { ROAD_NETWORK } from './roadNetwork.js';
import { VILLAGE_TREES, VILLAGE_FLOWERS, VILLAGE_ROCKS, EXTRA_COLLECTABLES, BOSS_SPAWNS, RANDOM_MAZIK_SPAWNS, ISLAND_PROPERTIES, PRESETS_MIX, MIKVAHS, RIVERS } from './scatteredNature.js';
import { CAVE_SYSTEMS } from './undergroundCaves.js';
import { applyPropertyFeatures } from './PropertyFeatureCompiler.js';
import { VEHICLE_MANIFEST } from './vehicleManifest.js';
import FenceAssembler from '../../../utils/3d/procedural/infrastructure/FenceAssembler.js';
import ChasveiAwtsmoos from '../../../../utils/ChasveiAwtsmoos.js';

class VillageCompiler {
    static compile() {
        const nivrayim = {
            ProceduralRoad: {}, ProceduralBuilding: {}, ProceduralTree: {}, Collectable: {},
            ProceduralFlowerPatch: {}, Domem: {}, InteractiveNpc: {}, InteractiveDoor: {},
            Stairs: {}, Mazik: {}, Ocean: {}, Portal: {}, ProceduralTerrain: {},
            ProceduralRiver: {}, HotAirBalloon: {}, MagicalChariot: {}, Sky: {}, AmbientLife: {}
        };
        let treeIdx = 0, rockIdx = 0;

        // ═══ SKY ═══
        nivrayim.Sky = { village_sky: { dayCycle: true, cycleSpeed: 0.001, colors: { day: 0x87ceeb, night: 0x000011, sunset: 0xff4500 } } };

        // ═══ VEHICLES ═══
        Object.assign(nivrayim.HotAirBalloon, VEHICLE_MANIFEST.HotAirBalloon || {});
        Object.assign(nivrayim.MagicalChariot, VEHICLE_MANIFEST.MagicalChariot || {});

        // ═══ VEHICLES ═══
        Object.assign(nivrayim.HotAirBalloon, VEHICLE_MANIFEST.HotAirBalloon || {});
        Object.assign(nivrayim.MagicalChariot, VEHICLE_MANIFEST.MagicalChariot || {});

        // ═══ PROPERTIES ═══
        const ALL_PROPERTIES = [...PROPERTY_LAYOUTS, ...ISLAND_PROPERTIES];
        // Add extra procedural properties...
        const gridRange = 2500;
        for (let i = 0; i < 300; i++) {
            const x = (Math.random() - 0.5) * gridRange * 2;
            const z = (Math.random() - 0.5) * gridRange * 2;
            if (Math.abs(x) < 300 && Math.abs(z) < 300) continue;
            ALL_PROPERTIES.push({
                id: `extra_prop_${i}`, name: `Soul Dwelling ${i}`, center: { x, z },
                lot: { width: 60, depth: 60 }, housePreset: i % 10 === 0 ? "generateSkyscraper" : "TwoBedroom",
                housePresetArg: i % 10 === 0 ? 3 + Math.floor(Math.random() * 4) : null
            });
        }

        // ═══ ROADS ═══
        const compiledRoads = ROAD_NETWORK.generate(ALL_PROPERTIES);
        compiledRoads.forEach(road => nivrayim.ProceduralRoad[road.id] = { ...road, material: "dirt" });

        // ═══ BUILDINGS ═══
        ALL_PROPERTIES.forEach(prop => {
            let blueprint;
            if (typeof HousePresets[prop.housePreset] === 'function') blueprint = HousePresets[prop.housePreset](prop.housePresetArg);
            else blueprint = JSON.parse(JSON.stringify(HousePresets[prop.housePreset] || HousePresets.SingleRoom));

            const houseNpcs = NPC_MANIFEST.filter(n => n.propertyId === prop.id);
            blueprint.npcs = houseNpcs.map(npc => ({
                id: npc.id, name: npc.name, x: npc.localPos.x, y: 0.1, z: npc.localPos.z,
                dialogues: npc.dialogueTree ? npc.dialogueTree.map(d => d.message) : ["Shalom!"],
                hasShop: npc.hasShop, shopInventory: npc.shopInventory || []
            }));

            nivrayim.ProceduralBuilding[prop.id + "_house"] = {
                name: prop.name, blueprint, position: { x: prop.center.x, y: 0.1, z: prop.center.z },
                isSolid: true, interactable: true
            };
        });

        // ═══ PROPERTY YT�NS, GARDENS, FENCES, GRASS ═══
        applyPropertyFeatures(nivrayim, ALL_PROPERTIES);

        // ═══ NATURE (ARBORETUM VARIETY) ═══
        const treePresets = ["Oak", "Palm", "Pine", "Willow", "Bush"];
        for (let i = 0; i < 1000; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 100 + Math.random() * 2000;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            
            // Check road avoidance (simple dist check)
            let tooClose = false;
            // (Skipping complex road check for performance)

            const preset = treePresets[Math.floor(Math.random() * treePresets.length)];
            nivrayim.ProceduralTree[`tree_${i}`] = {
                name: `Wild_${preset}_${i}`, preset, position: { x, y: 0, z }, 
                isRealistic: true, isSolid: true
            };
        }

        // ═══ MAZIKIM (FOREST) ═══
        const mTypes = [{ id: "dust", color: 0xc2b280, name: "Dust" }, { id: "water", color: 0x00ffff, name: "Water" }, { id: "fire", color: 0xff4500, name: "Fire" }, { id: "air", color: 0xffffff, name: "Air" }];
        for (let i = 0; i < 200; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 500 + Math.random() * 1000;
            const t = mTypes[i % mTypes.length];
            nivrayim.Mazik[`klipa_${i}`] = {
                name: `${t.name} Kelipa`, position: { x: Math.cos(angle) * dist, y: 1.5, z: Math.sin(angle) * dist },
                color: t.color, elementalType: t.id, maxHp: 100, xpValue: 150, damage: 25, aggroRange: 20
            };
        }

        // ═══ TERRAIN ═══
        const grassPatches = ALL_PROPERTIES.slice(0, 16).map(prop => ({
            x: prop.center.x,
            z: prop.center.z,
            radius: Math.max(prop.lot?.width || 40, prop.lot?.depth || 40) * 0.75,
            gain: 1
        }));

        nivrayim.ProceduralTerrain = {
            emeraldGround: {
                name: "Emerald Fields",
                width: 6000,
                depth: 6000,
                segments: 128,
                material: "dirtGrass",
                dirtColor: 0x5d4037,
                grassColor: 0x2e7d32,
                grassPatches,
                position: { x: 0, y: -0.1, z: 0 }
            }
        };
        nivrayim.Ocean = { world_ocean: { name: "The Great Sea", size: 6000, y: -1.5, color: 0x003366 } };

        return nivrayim;
    }
}

export function compileVillage() { return VillageCompiler.compile(); }
