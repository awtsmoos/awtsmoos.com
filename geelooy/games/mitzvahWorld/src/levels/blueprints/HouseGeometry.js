
import { DivineSpeech } from '../../utils/DivineSpeech.js';

/**
 * @class HouseGeometry
 * @description
 * B"H
 * Just as the letters Aleph, Beis, Nun form the word "Even" (Stone),
 * and the Awtsmoos constantly speaks those letters into the stone
 * so it doesn't revert to absolute nothingness—this class generates
 * the data blueprint for a "House". 
 * 
 * It outputs pure JSON that a rendering engine will later interpret
 * to draw walls, a roof, and doors. The data is the soul; the renderer
 * provides the garment.
 */
export class HouseGeometry {
    /**
     * @function manifest
     * @description
     * B"H
     * Generates a structural JSON object representing a house at a given point.
     * 
     * @param {number} x - X coordinate.
     * @param {number} z - Z coordinate.
     * @param {number} rotationY - Rotation in degrees.
     * @returns {Object} JSON entity data.
     */
    static manifest(x, z, rotationY) {
        const houseId = DivineSpeech.utter("house");
        return {
            id: houseId,
            type: "Structure",
            subType: "House",
            transform: {
                position: { x: x, y: 0, z: z },
                rotation: { x: 0, y: rotationY, z: 0 },
                scale: { x: 1, y: 1, z: 1 }
            },
            components:[
                {
                    name: "BaseBox",
                    geometry: "Box",
                    dimensions: { width: 10, height: 8, depth: 10 },
                    positionOffset: { x: 0, y: 4, z: 0 },
                    material: { color: "#C19A6B", type: "diffuse" } // Wood/dirt color
                },
                {
                    name: "RoofCone",
                    geometry: "Cone",
                    dimensions: { radius: 7, height: 5, radialSegments: 4 },
                    positionOffset: { x: 0, y: 10.5, z: 0 },
                    rotationOffset: { x: 0, y: 45, z: 0 }, // Rotate to align square base
                    material: { color: "#8B0000", type: "diffuse" } // Dark red roof
                }
            ]
        };
    }
}
