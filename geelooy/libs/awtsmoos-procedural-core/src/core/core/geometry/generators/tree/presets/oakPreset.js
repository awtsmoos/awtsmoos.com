
// B"H
export const OAK_PRESET = { 
    seed: 124, 
    type: "deciduous", 
    branch: { 
        levels: 4, 
        // B"H - INCOMPARABLY MORE TWIGS (Level 3: 12, Level 4: 24)
        children: { 0: 8, 1: 6, 2: 12, 3: 24 }, 
        force: { direction: { x: 0, y: 0.8, z: 0 }, strength: 0.04 }, 
        gnarliness: { 0: 0.1, 1: 0.25, 2: 0.4, 3: 0.6 }, 
        length: { 0: 35, 1: 18, 2: 9, 3: 4, 4: 2 }, 
        radius: { 0: 5.0, 1: 1.8, 2: 0.7, 3: 0.2, 4: 0.05 }, 
        sections: { 0: 16, 1: 10, 2: 6, 3: 4, 4: 3 }, 
        segments: { 0: 24, 1: 14, 2: 8, 3: 6, 4: 4 }, 
        start: { 0: 0.15, 1: 0.1, 2: 0.05, 3: 0.05 }, 
        taper: { 0: 0.5, 1: 0.7, 2: 0.85, 3: 0.95, 4: 1.0 }, 
        angle: { 0: 30, 1: 45, 2: 60, 3: 75 } 
    }, 
    leaves: { 
        count: 12, // Per node colonization
        size: 1.8,
        color: [0.1, 0.6, 0.2, 1.0] // Deep Green Tint
    } 
};
