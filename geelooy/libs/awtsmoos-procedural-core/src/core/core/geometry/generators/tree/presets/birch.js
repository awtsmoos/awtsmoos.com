
// B"H
export const BIRCH_PRESETS = [
    {
        name: "Birch Elegant",
        seed: 30631,
        type: "deciduous",
        bark: { type: "birch", tint: 0xffffff },
        branch: {
            levels: 3,
            angle: { 1: 47, 2: 63, 3: 30 },
            children: { 0: 6, 1: 5, 2: 4 },
            force: { direction: { x: 0, y: 1, z: 0 }, strength: 0.02 },
            gnarliness: { 0: 0.05, 1: 0.1, 2: 0.1, 3: 0 },
            length: { 0: 50, 1: 15, 2: 8, 3: 2 },
            radius: { 0: 1.2, 1: 0.5, 2: 0.2, 3: 0.05 },
            sections: { 0: 8, 1: 6, 2: 4, 3: 3 },
            segments: { 0: 8, 1: 6, 2: 4, 3: 3 },
            start: { 1: 0.4, 2: 0.1, 3: 0 },
            taper: { 0: 0.7, 1: 0.5, 2: 0.5, 3: 0.5 },
            twist: { 0: 0, 1: 0.1, 2: 0.1, 3: 0 }
        },
        leaves: { type: "leaf_birch", count: 18, size: 2.5, tint: [1,1,1,1] } 
    }
];
