
import { HouseGeometry } from './HouseGeometry.js';

/**
 * @constant VillageWorldBlueprint
 * @description
 * B"H
 * The blueprint for the Village Level.
 * Here, the initial void is populated by distinct forms.
 * Houses rise from the ground, each constructed from the exact
 * same divine letters, permuted through the HouseGeometry class.
 * It demonstrates modular creation.
 * 
 * @type {Object}
 */
export const VillageWorldBlueprint = {
    metadata: {
        id: "village_world",
        name: "The First Village",
        author: "Awtsmoos"
    },
    environment: {
        skyColor: "#FFDAB9", // A warm sunset sky
        ambientLight: { color: "#FFFFFF", intensity: 0.5 },
        directionalLight: { color: "#FFA07A", intensity: 1.0, direction: { x: 1, y: 0.5, z: 1 } }
    },
    entities:[
        {
            id: "village_ground_plane",
            type: "Geometry",
            geometry: "Plane",
            dimensions: { width: 500, height: 500 },
            transform: {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: -90, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 }
            },
            material: { color: "#8FBC8F", type: "standard" } // Dark Sea Green
        },
        // Generating a few small houses around a center point
        HouseGeometry.manifest(20, 20, 0),
        HouseGeometry.manifest(-30, 15, 45),
        HouseGeometry.manifest(10, -40, 90),
        HouseGeometry.manifest(-25, -25, 180),
        HouseGeometry.manifest(0, 50, 15)
    ]
};
