
/**
 * @constant EmeraldWorldBlueprint
 * @description
 * B"H
 * The blueprint for the Emerald World.
 * A vast, unbroken plane of pure green, representing the infinite 
 * potential before details are drawn down. It is a single, massive
 * utterance of existence.
 * 
 * @type {Object}
 */
export const EmeraldWorldBlueprint = {
    metadata: {
        id: "emerald_world",
        name: "Default Emerald World",
        author: "Awtsmoos"
    },
    environment: {
        skyColor: "#87CEEB",
        ambientLight: { color: "#FFFFFF", intensity: 0.6 },
        directionalLight: { color: "#FFFFFF", intensity: 0.8, direction: { x: -1, y: 1, z: -1 } }
    },
    entities:[
        {
            id: "infinite_emerald_plane",
            type: "Geometry",
            geometry: "Plane",
            dimensions: { width: 1000, height: 1000 },
            transform: {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: -90, y: 0, z: 0 }, // Lie flat
                scale: { x: 1, y: 1, z: 1 }
            },
            material: { color: "#50C878", type: "standard" } // Emerald Green
        }
    ]
};
