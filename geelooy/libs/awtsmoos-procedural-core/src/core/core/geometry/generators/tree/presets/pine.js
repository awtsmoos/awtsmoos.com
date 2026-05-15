
// B"H
export const PINE_PRESETS = [
    {
        name: "Pine Classic",
        seed: 11744,
        type: "evergreen",
        bark: { type: "pine", tint: 0xffffff, flatShading: false, textured: true, textureScale: { x: 1, y: 1 } },
        branch: {
            levels: 3,
            angle: { 1: 117, 2: 60, 3: 60 },
            children: { 0: 12, 1: 6, 2: 5 }, // Tuned for performance
            force: { direction: { x: 0, y: 1, z: 0 }, strength: 0 },
            gnarliness: { 0: 0.05, 1: 0.08, 2: 0, 3: 0 },
            length: { 0: 40, 1: 12, 2: 10, 3: 1 },
            radius: { 0: 1.5, 1: 0.5, 2: 0.2, 3: 0.05 },
            sections: { 0: 8, 1: 6, 2: 4, 3: 3 },
            segments: { 0: 8, 1: 6, 2: 4, 3: 3 },
            start: { 1: 0.16, 2: 0.3, 3: 0.3 },
            taper: { 0: 0.7, 1: 0.7, 2: 0.7, 3: 0.7 },
            twist: { 0: 0, 1: 0, 2: 0, 3: 0 }
        },
        leaves: { type: "leaf_pine", billboard: "double", angle: 10, count: 12, start: 0, size: 2.5, sizeVariance: 0.7, tint: [1,1,1,1] }
    },
    {
        name: "Pine Tall",
        seed: 44166,
        type: "evergreen",
        bark: { type: "pine", tint: 0xffffff },
        branch: {
            levels: 3,
            angle: { 1: 110, 2: 60, 3: 60 },
            children: { 0: 15, 1: 5, 2: 4 },
            force: { direction: { x: 0, y: 1, z: 0 }, strength: 0.05 },
            gnarliness: { 0: 0.05, 1: 0.1, 2: 0, 3: 0 },
            length: { 0: 65, 1: 20, 2: 10, 3: 2 },
            radius: { 0: 1.8, 1: 0.6, 2: 0.3, 3: 0.1 },
            sections: { 0: 9, 1: 6, 2: 4, 3: 3 },
            segments: { 0: 10, 1: 6, 2: 4, 3: 3 },
            start: { 1: 0.2, 2: 0.14, 3: 0.3 },
            taper: { 0: 0.7, 1: 0.7, 2: 0.7, 3: 0.7 },
            twist: { 0: 0, 1: 0.1, 2: 0, 3: 0 }
        },
        leaves: { type: "leaf_pine", billboard: "double", angle: 17, count: 15, start: 0.08, size: 3.0, sizeVariance: 0.2, tint: [1,1,1,1] }
    }
];
