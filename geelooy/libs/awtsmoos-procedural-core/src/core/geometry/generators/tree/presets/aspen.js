
// B"H
export const ASPEN_PRESETS = [
    {
        name: "Aspen Grove",
        seed: 45590,
        type: "deciduous",
        bark: { type: "birch", tint: 0xdddddd }, // Aspen is pale like Birch
        branch: {
            levels: 3,
            angle: { 1: 20, 2: 27, 3: 60 },
            children: { 0: 8, 1: 4, 2: 2 },
            force: { direction: { x: 0, y: 1, z: 0 }, strength: -0.02 },
            gnarliness: { 0: 0.02, 1: 0.1, 2: 0.05, 3: 0.09 },
            length: { 0: 25, 1: 15, 2: 7, 3: 4 },
            radius: { 0: 1.0, 1: 0.5, 2: 0.2, 3: 0.05 },
            sections: { 0: 8, 1: 6, 2: 4, 3: 3 },
            segments: { 0: 8, 1: 5, 2: 4, 3: 3 },
            start: { 1: 0.64, 2: 0.3, 3: 0 },
            taper: { 0: 0.7, 1: 0.7, 2: 0.7, 3: 0.7 },
            twist: { 0: 0.3, 1: -0.04, 2: 0, 3: 0 }
        },
        leaves: { type: "leaf_birch", count: 15, size: 2.0, sizeVariance: 0.7, tint: [1, 0.9, 0.5, 1] } // Using Birch shader for Aspen
    }
];
