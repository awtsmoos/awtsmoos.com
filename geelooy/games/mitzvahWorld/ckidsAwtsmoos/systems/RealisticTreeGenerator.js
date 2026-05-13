/**
 * B"H
 * @file RealisticTreeGenerator.js
 * @description THE ARBORETUM OF ATZILUS — Diverse Procedural Tree Manifestations
 */

export default class RealisticTreeGenerator {
    /**
     * @function generate
     * @description B"H - Returns a blueprint for different tree types.
     */
    static generate(type = "Oak", seed = 770) {
        const treeData = {
            trunk: { geometry: "CylinderGeometry", args: [0.5, 0.8, 10, 8, 5], material: "bark" },
            leaves: { geometry: "SphereGeometry", args: [4, 16, 12], material: "leaf", offset: { x: 0, y: 7, z: 0 } }
        };

        if (type.includes("Palm")) {
            treeData.trunk.args = [0.4, 0.6, 12, 8, 12]; // Tall, thin trunk
            treeData.leaves = { 
                geometry: "CylinderGeometry", 
                args: [6, 0.1, 0.5, 8, 1], // Flat fronds
                material: "leaf_palm", 
                offset: { x: 0, y: 12, z: 0 } 
            };
        } else if (type.includes("Pine")) {
            treeData.trunk.args = [0.2, 1.0, 14, 6, 4]; // Tapered trunk
            treeData.leaves = { 
                geometry: "ConeGeometry", 
                args: [5, 12, 8], // Conical needles
                material: "leaf_pine", 
                offset: { x: 0, y: 7, z: 0 } 
            };
        } else if (type.includes("Willow")) {
            treeData.trunk.args = [0.8, 1.2, 8, 10, 5];
            treeData.leaves = { 
                geometry: "SphereGeometry", 
                args: [6, 16, 12], 
                material: "leaf_willow", 
                offset: { x: 0, y: 4, z: 0 },
                scale: [1.2, 1.8, 1.2] // Drooping shape
            };
        } else if (type.includes("Bush")) {
            treeData.trunk.args = [0.1, 0.2, 1, 4, 1];
            treeData.leaves = { 
                geometry: "SphereGeometry", 
                args: [2.5, 12, 8], 
                material: "leaf", 
                offset: { x: 0, y: 1, z: 0 } 
            };
        }

        return treeData;
    }
}
