/**
 * B"H
 * @file emerald.js
 * @description
 * The active Emerald Void card now opens the real deterministic Emerald
 * district, not the old tiny placeholder meadow. It uses the mobile profile:
 * many houses, real roads, outdoor NPCs, fences, yards, collectables, mazikim,
 * doors/mezuzos through building manifests, and a stable seed so every load is
 * debuggable and repeatable.
 */

import { compileVillage } from './emeraldVillage/villageCompiler.js';

const compiledNivrayim = compileVillage({ profile: 'mobile', seed: 7701 });

export default {
    shaym: 'Emerald Void — Living District',
    components: {
        awduhm: 'https://models-3122d.web.app/chossid.glb'
    },
    html: {
        title: 'Emerald Void — Living District'
    },
    nivrayim: {
        ProceduralSky: {
            emeraldVoidSky: {
                name: 'Emerald_Void_Soft_Sky',
                timeMultiplier: 1.0,
                timeOfDay: 9.0
            }
        },
        Sky: compiledNivrayim.Sky || {},
        ProceduralTerrain: compiledNivrayim.ProceduralTerrain || {},
        Ocean: compiledNivrayim.Ocean || {},
        ProceduralRoad: compiledNivrayim.ProceduralRoad || {},
        ProceduralBuilding: compiledNivrayim.ProceduralBuilding || {},
        InteractiveDoor: compiledNivrayim.InteractiveDoor || {},
        InteractiveNpc: compiledNivrayim.InteractiveNpc || {},
        ProceduralTree: compiledNivrayim.ProceduralTree || {},
        ProceduralFlowerPatch: compiledNivrayim.ProceduralFlowerPatch || {},
        ProceduralRiver: compiledNivrayim.ProceduralRiver || {},
        Collectable: compiledNivrayim.Collectable || {},
        Domem: compiledNivrayim.Domem || {},
        GrassPatch: compiledNivrayim.GrassPatch || {},
        Mazik: compiledNivrayim.Mazik || {},
        Stairs: compiledNivrayim.Stairs || {},
        Portal: compiledNivrayim.Portal || {},
        HotAirBalloon: compiledNivrayim.HotAirBalloon || {},
        MagicalChariot: compiledNivrayim.MagicalChariot || {},
        AmbientLife: compiledNivrayim.AmbientLife || {},
        __emeraldCompileSummary: compiledNivrayim.__emeraldCompileSummary,
        Chossid: [
            {
                name: 'The Chossid',
                height: 1.5,
                speed: 65,
                interactable: true,
                path: 'https://models-3122d.web.app/chossid.glb?k=emerald_void_living_district',
                position: { x: 0, y: 20, z: 0 },
                hp: 100,
                maxHp: 100,
                orLevel: 0,
                on: {
                    ready(n) {
                        if (n && typeof n.updateAppearance === 'function') n.updateAppearance();
                    },
                    'hit floor': function(m) {
                        m.olam?.ayshPeula?.('ui event', 'effectsOverlay', {
                            text: 'Welcome to the living Emerald Void. Every house has a story.',
                            color: '#50C878'
                        });
                    }
                }
            }
        ]
    }
};
