/**
 * B"H
 * @constant EmeraldWorldBlueprint
 * @description
 * Registry-facing summary blueprint for the same Emerald Void concept used by
 * the active menu world. This file is intentionally lightweight: the runtime
 * world data lives in ckidsAwtsmoos/tochen/worlds/emerald.js, while this older
 * registry path remains truthful and non-conflicting.
 */
export const EmeraldWorldBlueprint = {
    metadata: {
        id: 'emerald_world',
        name: 'Emerald Void — Living District',
        author: 'Awtsmoos',
        runtimeWorld: 'ckidsAwtsmoos/tochen/worlds/emerald.js',
        profile: 'mobile',
        seed: 7701
    },
    environment: {
        skyColor: '#87CEEB',
        ambientLight: { color: '#FFFFFF', intensity: 0.65 },
        directionalLight: { color: '#FFFFFF', intensity: 0.85, direction: { x: -1, y: 1, z: -1 } }
    },
    promises: {
        manyHouses: true,
        roads: true,
        outdoorNpcs: true,
        clickableNpcRange: true,
        doorsAndMezuzos: true,
        mobileSafeProfile: true,
        deterministicGeneration: true
    },
    entities: [
        {
            id: 'emerald_world_runtime_pointer',
            type: 'RuntimeWorldPointer',
            target: 'ckidsAwtsmoos/tochen/worlds/emerald.js',
            material: { color: '#50C878', type: 'standard' }
        }
    ]
};
