
// B"H
export const OAK_PRESETS = [
    {
        name: "Oak Majestic",
        seed: 35729,
        type: "deciduous",
        bark: { type: "oak", tint: 0xffffff },
        branch: {
            levels: 3,
            angle: { 1: 54, 2: 58, 3: 32 },
            children: { 0: 5, 1: 4, 2: 3 },
            force: { direction: { x: 0, y: 1, z: 0 }, strength: -0.01 },
            gnarliness: { 0: 0.1, 1: 0.2, 2: 0.3, 3: 0.1 },
            length: { 0: 37, 1: 15, 2: 8, 3: 4 },
            radius: { 0: 2.5, 1: 0.9, 2: 0.4, 3: 0.1 },
            sections: { 0: 10, 1: 8, 2: 6, 3: 4 },
            segments: { 0: 8, 1: 6, 2: 4, 3: 3 },
            start: { 1: 0.3, 2: 0.1, 3: 0.1 },
            taper: { 0: 0.7, 1: 0.6, 2: 0.6, 3: 0.6 },
            twist: { 0: -0.1, 1: 0.1, 2: 0.2, 3: 0 }
        },
        leaves: { type: "leaf_oak", count: 8, size: 4.0, tint: [1,1,1,1] }
    }
];
