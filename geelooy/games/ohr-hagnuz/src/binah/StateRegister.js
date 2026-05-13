
/**
 * B"H
 * @class StateRegister
 * @chapter The Grand Scroll of Cosmic Memory (Binah)
 * @description
 * Understanding (Binah) provides the endless, expansive containers for the flash of Wisdom (Chochmah). 
 * Every atom, every inorganic rock (Aleph Beis Nun - "Even"), is constantly recreated every single instant 
 * from the absolute Nothingness by the 10 Utterances of the Awtsmoos. If those letters were removed, 
 * not only would the rock cease to exist, but time itself would unravel as if nothing had ever been.
 * 
 * Here we record the structural integrity of the Tzaddik's soul, now vastly expanded to hold the 
 * Sefirotic Intellect: Chochmah (Attack/Insight), Binah (Defense/Structure), and Daat (Critical Focus/Knowledge).
 */
export class StateRegister {
    static ActiveRealm = 'OVERWORLD';
    static CurrentMapId = 'Overworld_Main';
    
    // Physical resolution of each tile in pixels
    static Resolution = 64;
    static ResolutionMultiplier = 2;
    static GameSpeedMultiplier = 1;
    
    // The kinetic state of the Tzaddik
    static HeroPos = { 
        cx: 12, cy: 7,    
        dx: 12 * 64,      
        dy: 7 * 64,       
        dir: 'd',         
        moving: false,    
        stepTick: 0       
    };

    static HeroPath =[];
    static PathTarget = null;
    
    // Spiritual Statistics
    static HeroStats = { 
        light: 100, 
        maxLight: 100, 
        level: 1, 
        xp: 0, 
        xpNeeded: 100,
        sparkPoints: 0
    };

    // The Internal Sefirotic Structure (Skill Tree & Base Stats)
    static EtzChaim = {
        CHOCHMAH: 1, // Insight: Increases raw Attack Power & Critical chance
        BINAH: 1,    // Structure: Increases Defense & Max Light Capacity
        DAAT: 1,     // Knowledge/Connection: Increases Accuracy & Armor Penetration
        CHESED: 0,   
        GEVURAH: 0,  
        TIFERET: 0,  
        NETZACH: 0,  
        HOD: 0,      
        YESOD: 0     
    };

    // The Garments and Weapons (Kelim) of the Soul
    static Equipment = {
        garment: 'WHITE_LINEN',
        weapon: 'WEAPON_NONE', // The Kli (Vessel) used to channel the light
        niggun: 'NONE'
    };

    static Inventory = {
        mishnah: ['M_AVOT_1'], 
        kabbalah: [],
        niggunim: ['NIGGUN_SIMCHA'],
        essences: [] 
    };

    static MaterialBag =[];
    static Outfits = { owned: ['WHITE_LINEN'], active: 'WHITE_LINEN' };
    static Weapons = { owned: ['WEAPON_NONE'], active: 'WEAPON_NONE' };
    static Gelt = 18; 
    
    static IsDialogueOpen = false;
    static DialogBankId = null;
    static VisibleText = "";
    static BattleMenuState = 'ROOT';

    static ActiveShlichus =[];
    static CompletedShlichus =[];

    static TimeState = {
        isShabbos: false,
        moonPhase: 1.0, 
        timeOfDay: 'DAY' 
    };

    static Weather = {
        type: 'CLEAR', 
        intensity: 0.0
    };

    static Purity = {
        level: 0, 
        stepsRemaining: 0 
    };

    static Particles =[];
}

window.AwtsmoosIntents = { 
    U: 0, D: 0, L: 0, R: 0, 
    A: 0, B: 0, START: 0, SEL: 0 
};
