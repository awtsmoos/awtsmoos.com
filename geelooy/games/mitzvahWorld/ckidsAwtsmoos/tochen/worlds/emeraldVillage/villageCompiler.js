// B"H
/**
 * @module villageCompiler
 * @description
 * THE MASTER COMPILER OF THE EMERALD VILLAGE.
 * Deterministic, profile-aware, and data-driven: the same seed produces the
 * same roads, houses, NPCs, trees, collectables, and mazikim on every load.
 */
import { HousePresets } from '../../../utils/3d/procedural/house/data/HousePresets.js';
import { PROPERTY_LAYOUTS } from './propertyLayouts.js';
import { NPC_MANIFEST, WANDERING_NPCS } from './npcManifest.js';
import { ROAD_NETWORK } from './roadNetwork.js';
import { ISLAND_PROPERTIES } from './scatteredNature.js';
import { applyPropertyFeatures } from './PropertyFeatureCompiler.js';
import { VEHICLE_MANIFEST } from './vehicleManifest.js';

const PROFILES = Object.freeze({
    mobile: { extraProperties: 36, wildTrees: 140, mazikim: 32, terrainSegments: 64, terrainSize: 3000, seed: 7701 },
    balanced: { extraProperties: 96, wildTrees: 260, mazikim: 72, terrainSegments: 96, terrainSize: 4200, seed: 7701 },
    desktop: { extraProperties: 180, wildTrees: 520, mazikim: 120, terrainSegments: 128, terrainSize: 5600, seed: 7701 },
    epic: { extraProperties: 300, wildTrees: 1000, mazikim: 200, terrainSegments: 128, terrainSize: 6000, seed: 7701 }
});

function makeRandom(seed = 7701) {
    let s = seed >>> 0;
    return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 0xffffffff;
    };
}

function resolveProfile(options = {}) {
    const base = PROFILES[options.profile] || PROFILES.balanced;
    return { ...base, ...options, seed: Number(options.seed ?? base.seed) };
}

function countBucket(value) {
    return Array.isArray(value) ? value.length : value && typeof value === 'object' ? Object.keys(value).length : 0;
}

function clonePreset(preset) {
    return JSON.parse(JSON.stringify(preset || HousePresets.SingleRoom));
}

function makeNpcDefinition(npc) {
    return {
        id: npc.id,
        name: npc.name,
        x: npc.localPos?.x || 0,
        y: 0.1,
        z: npc.localPos?.z || 0,
        dialogues: npc.dialogueTree ? npc.dialogueTree.map(d => d.message) : ["Shalom!"],
        hasShop: Boolean(npc.hasShop),
        shopInventory: npc.shopInventory || []
    };
}

function makeWandererDefinition(npc) {
    const p = npc.position || { x: 0, z: 0 };
    const text = npc.dialogues || npc.dialog || ["B\\\"H!"];
    return {
        name: npc.name,
        position: { x: p.x || 0, y: p.y || 0, z: p.z || 0 },
        dialogues: text,
        dialog: text,
        interactable: true,
        interactionRange: 4.5,
        canDebate: Boolean(npc.canDebate),
        debateLevel: npc.debateLevel || 0,
        npcId: npc.id,
        markerType: npc.missionId ? 'mission' : (npc.canDebate ? 'debate' : 'dialogue'),
        missionId: npc.missionId || null,
        hasMission: Boolean(npc.missionId),
        hasTorahDebate: Boolean(npc.canDebate),
        debateDeckId: npc.canDebate ? `emerald_${npc.id}_debate` : null,
        hasShop: Boolean(npc.hasShop),
        shopInventory: npc.shopInventory || [],
        isWandering: Boolean(npc.isWandering),
        clothes: npc.clothes || []
    };
}

class VillageCompiler {
    static compile(options = {}) {
        const profile = resolveProfile(options);
        const rand = makeRandom(profile.seed);
        const nivrayim = {
            ProceduralRoad: {}, ProceduralBuilding: {}, ProceduralTree: {}, Collectable: {},
            ProceduralFlowerPatch: {}, Domem: {}, InteractiveNpc: {}, InteractiveDoor: {},
            Stairs: {}, Mazik: {}, Ocean: {}, Portal: {}, ProceduralTerrain: {},
            ProceduralRiver: {}, HotAirBalloon: {}, MagicalChariot: {}, Sky: {}, AmbientLife: {}
        };

        nivrayim.Sky = { village_sky: { dayCycle: true, cycleSpeed: 0.001, colors: { day: 0x87ceeb, night: 0x000011, sunset: 0xff4500 } } };
        Object.assign(nivrayim.HotAirBalloon, VEHICLE_MANIFEST.HotAirBalloon || {});
        Object.assign(nivrayim.MagicalChariot, VEHICLE_MANIFEST.MagicalChariot || {});

        const allProperties = [...PROPERTY_LAYOUTS, ...ISLAND_PROPERTIES];
        const gridRange = profile.terrainSize * 0.42;

        for (let i = 0; i < profile.extraProperties; i++) {
            const x = (rand() - 0.5) * gridRange * 2;
            const z = (rand() - 0.5) * gridRange * 2;
            if (Math.abs(x) < 230 && Math.abs(z) < 230) continue;
            const isTower = i % 9 === 0;
            allProperties.push({
                id: `extra_prop_${i}`,
                name: isTower ? `Emerald Light Tower ${i}` : `Soul Dwelling ${i}`,
                center: { x, z },
                lot: { width: isTower ? 72 : 60, depth: isTower ? 72 : 60 },
                housePreset: isTower ? 'generateSkyscraper' : 'TwoBedroom',
                housePresetArg: isTower ? 3 + Math.floor(rand() * 4) : null
            });
        }

        ROAD_NETWORK.generate(allProperties).forEach(road => {
            nivrayim.ProceduralRoad[road.id] = { ...road, material: 'dirt' };
        });

        allProperties.forEach(prop => {
            const preset = HousePresets[prop.housePreset];
            const blueprint = typeof preset === 'function' ? preset(prop.housePresetArg) : clonePreset(preset);
            blueprint.npcs = NPC_MANIFEST.filter(n => n.propertyId === prop.id).map(makeNpcDefinition);
            blueprint.spawnFurniture = blueprint.spawnFurniture === true;
            blueprint.maxFurniture = Number.isFinite(blueprint.maxFurniture) ? Math.min(blueprint.maxFurniture, 8) : 4;

            nivrayim.ProceduralBuilding[`${prop.id}_house`] = {
                name: prop.name,
                blueprint,
                position: { x: prop.center.x, y: 0.1, z: prop.center.z },
                isSolid: true,
                interactable: true
            };
        });

        applyPropertyFeatures(nivrayim, allProperties);

        WANDERING_NPCS.forEach(npc => {
            nivrayim.InteractiveNpc[npc.id] = makeWandererDefinition(npc);
        });

        const treePresets = ['Oak', 'Palm', 'Pine', 'Willow', 'Bush'];
        for (let i = 0; i < profile.wildTrees; i++) {
            const angle = rand() * Math.PI * 2;
            const dist = 100 + rand() * (profile.terrainSize * 0.38);
            const preset = treePresets[Math.floor(rand() * treePresets.length)];
            nivrayim.ProceduralTree[`tree_${i}`] = {
                name: `Wild_${preset}_${i}`,
                preset,
                position: { x: Math.cos(angle) * dist, y: 0, z: Math.sin(angle) * dist },
                isRealistic: true,
                isSolid: true
            };
        }

        const mTypes = [
            { id: 'dust', color: 0xc2b280, name: 'Dust' },
            { id: 'water', color: 0x00ffff, name: 'Water' },
            { id: 'fire', color: 0xff4500, name: 'Fire' },
            { id: 'air', color: 0xffffff, name: 'Air' }
        ];
        for (let i = 0; i < profile.mazikim; i++) {
            const angle = rand() * Math.PI * 2;
            const dist = 420 + rand() * (profile.terrainSize * 0.22);
            const t = mTypes[i % mTypes.length];
            nivrayim.Mazik[`klipa_${i}`] = {
                name: `${t.name} Kelipa`,
                position: { x: Math.cos(angle) * dist, y: 1.5, z: Math.sin(angle) * dist },
                color: t.color,
                elementalType: t.id,
                maxHp: 100,
                xpValue: 150,
                damage: 25,
                aggroRange: 20
            };
        }

        const grassPatches = allProperties.slice(0, 24).map(prop => ({
            x: prop.center.x,
            z: prop.center.z,
            radius: Math.max(prop.lot?.width || 40, prop.lot?.depth || 40) * 0.75,
            gain: 1
        }));

        nivrayim.ProceduralTerrain = {
            emeraldGround: {
                name: 'Emerald Fields',
                width: profile.terrainSize,
                depth: profile.terrainSize,
                segments: profile.terrainSegments,
                material: 'dirtGrass',
                dirtColor: 0x5d4037,
                grassColor: 0x2e7d32,
                grassPatches,
                position: { x: 0, y: -0.1, z: 0 }
            }
        };
        nivrayim.Ocean = { world_ocean: { name: 'The Great Sea', size: profile.terrainSize, y: -1.5, color: 0x003366 } };
        nivrayim.__emeraldCompileSummary = {
            profile: profile.profile || 'balanced',
            seed: profile.seed,
            properties: allProperties.length,
            buildings: countBucket(nivrayim.ProceduralBuilding),
            outdoorNpc: countBucket(nivrayim.InteractiveNpc),
            roads: countBucket(nivrayim.ProceduralRoad),
            trees: countBucket(nivrayim.ProceduralTree),
            mazikim: countBucket(nivrayim.Mazik),
            domem: countBucket(nivrayim.Domem)
        };

        return nivrayim;
    }
}

export function compileVillage(options = {}) { return VillageCompiler.compile(options); }
export { PROFILES as EMERALD_VILLAGE_PROFILES };
