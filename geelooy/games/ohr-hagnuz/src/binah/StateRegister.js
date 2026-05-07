
/**
 * B"H
 * @class StateRegister
 * @chapter The Scroll of Records (Binah)
 * @description
 * Understanding (Binah) provides the containers for the Wisdom (Chochmah). 
 * This class holds the persistent memory of Asiyah, tracking the evolution
 * of the soul through the grid.
 */
export class StateRegister {
    static ActiveRealm = 'OVERWORLD';
    static CurrentMapId = 'Overworld_Main';
    
    // Physical resolution of each tile in pixels
    static Resolution = 64;
    static GameSpeedMultiplier = 1;
    
    // The kinetic state of the Tzaddik
    static HeroPos = { 
        cx: 12, cy: 7,    // Grid coordinate (Central road)
        dx: 12 * 64,      // Pixel X
        dy: 7 * 64,       // Pixel Y
        dir: 'd',         // Direction (u,d,l,r)
        moving: false,    // Kinetic arousal
        stepTick: 0       // Progress through the current step (0 to 64)
    };

    // Automated pathing derived from the Finger of God (Providence)
    static HeroPath = [];
    static PathTarget = null;
    
    // Spiritual Statistics
    static HeroStats = { 
        light: 100, 
        maxLight: 100, 
        level: 1, 
        xp: 0, 
        xpNeeded: 100 
    };

    // Inventory of Insights
    static Inventory = {
        mishnah: ['M_AVOT_1'], 
        kabbalah: [],
        niggunim: [],
        essences: [] 
    };

    static Gelt = 18; // The sparks of currency
    
    // UI Interaction states
    static IsDialogueOpen = false;
    static DialogBankId = null;
    static VisibleText = "";
}

// Mortal Intention Input Buffer
window.AwtsmoosIntents = { 
    U: 0, D: 0, L: 0, R: 0, 
    A: 0, B: 0, START: 0, SEL: 0 
};
