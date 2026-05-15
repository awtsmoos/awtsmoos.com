
// B"H
export const SAKURA_PRESET = { 
    seed: 8888, 
    type: "deciduous", 
    branch: { 
        levels: 4, 
        children: { 0: 5, 1: 6, 2: 14, 3: 25 }, 
        force: { direction: { x: 0, y: 0.3, z: 0 }, strength: 0.03 }, 
        gnarliness: { 0: 0.2, 1: 0.4, 2: 0.5, 3: 0.6 }, 
        length: { 0: 25, 1: 15, 2: 8, 3: 4, 4: 2 }, 
        radius: { 0: 4.0, 1: 1.5, 2: 0.6, 3: 0.2, 4: 0.05 }, 
        sections: { 0: 16, 1: 10, 2: 6, 3: 4, 4: 3 }, 
        segments: { 0: 20, 1: 12, 2: 8, 3: 5, 4: 4 }, 
        start: { 0: 0.1, 1: 0.1, 2: 0.1, 3: 0.1 }, 
        taper: { 0: 0.5, 1: 0.7, 2: 0.85, 3: 0.95, 4: 1.0 }, 
        angle: { 0: 40, 1: 50, 2: 60, 3: 80 } 
    }, 
    leaves: { 
        count: 20, 
        size: 2.2,
        color: [1.0, 0.7, 0.85, 1.0] // Pink
    } 
};
