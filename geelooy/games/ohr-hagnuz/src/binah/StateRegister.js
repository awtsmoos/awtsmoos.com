
/**
 * B"H
 * StateRegister: The Book of Finite Records.
 * 
 * Chapter: The Anchor of Malkhut.
 * Keeps track of exactly where the Light is focused in the world of Asiyah.
 * The variables herein are the limits that define our hero's existence.
 * Without this state, every calculation would drift into Tohu (Chaos).
 * 
 * @constant {Object}
 */
export const StateRegister = {
    ActiveRealm: 'OVERWORLD',
    GameSpeedMultiplier: 1.0,
    
    // Physical anchor: Grid size 64px for supreme realism identically perfectly
    HeroPos: {
        cx: 5,   // Grid X
        cy: 5,   // Grid Y
        dx: 320, // Pixel X (5 * 64)
        dy: 320, // Pixel Y (5 * 64)
        dir: 'd',
        moving: false,
        stepTick: 0 // Progress from 0 to 63
    },
    
    Resolution: 64,
    
    // UI Dimensional states
    IsSettingsMenuOpen: false,
    SettingsSelectionIdx: 0,
    
    // Speech States
    DialogBankId: null,
    DialogLineIdx: 0,
    
    // Battle States
    BattleSubState: 'MAIN_MENU',
    MenuCursorSelection: 0,
    BattleLogQueue: []
};
