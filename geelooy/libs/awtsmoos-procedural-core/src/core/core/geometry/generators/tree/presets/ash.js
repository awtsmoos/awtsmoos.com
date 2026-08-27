
// B"H
export const ASH_PRESETS = [
    {
        name: "Ash Standard",
        seed: 41563,
        type: "deciduous",
        bark: { type: "oak", tint: 0xffffff }, // Ash uses Oak-like bark
        branch: {
            levels: 3,
            angle: { 1: 26, 2: 79, 3: 30 },
            children: { 0: 5, 1: 4, 2: 2 },
            force: { direction: { x: 0, y: 1, z: 0 }, strength: 0.026 },
            gnarliness: { 0: 0, 1: 0.02, 2: -0.41, 3: 0.09 },
            length: { 0: 15, 1: 12, 2: 8, 3: 4 },
            radius: { 0: 1.0, 1: 0.5, 2: 0.2, 3: 0.05 },
            sections: { 0: 8, 1: 6, 2: 4, 3: 3 },
            segments: { 0: 6, 1: 5, 2: 4, 3: 3 },
            start: { 1: 0.19, 2: 0.1, 3: 0.06 },
            taper: { 0: 0.6, 1: 0.5, 2: 0.5, 3: 0.5 },
            twist: { 0: -0.02, 1: -0.01, 2: 0.09, 3: 0 }
        },
        leaves: { type: "leaf_ash", count: 13, size: 1.7, sizeVariance: 0.5, tint: [1,1,1,1] }
    }
];
