
/**
 * B"H
 * @class StateRegistry
 * @chapter The Memory of the Soul
 * @description
 * Understanding (Binah) provides the structured containers for the light. 
 * This class tracks the progression of the Tzaddik through the grid of Asiyah.
 */
export class StateRegistry {
    static ActiveRealm = 'OVERWORLD';
    static CurrentMapId = 'Overworld_Main';
    
    // Grid Constraints
    static GridWidth = 25;
    static GridHeight = 14;
    static Resolution = 64; 

    // The Kinetic Visage of the Hero
    static HeroPos = { 
        cx: 12, cy: 7,    // Central Grid Coordinate
        dx: 12 * 64,      // Absolute Pixel X
        dy: 7 * 64,       // Absolute Pixel Y
        dir: 'd',         // Orientation (u,d,l,r)
        moving: false,    // Kinetic Arousal
        stepTick: 0       // Progress through the current step (0 to Resolution)
    };

    static GameSpeedMultiplier = 1;

    // The Sacred Inventory
    static Gelt = 50;
    static Inventory = {
        wisdom: ['M_AVOT_1'],
        materials: []
    };

    // Hero stats
    static Stats = {
        light: 100,
        maxLight: 100,
        level: 1,
        xp: 0,
        xpNeeded: 100
    };
}

// Global Intent Buffer
window.AwtsmoosIntents = { U:0, D:0, L:0, R:0, A:0, B:0 };
