
// B"H
// js/data/gates_features.js

export const gates = [
    // --- MOVEMENT (1-10) ---
    { id: 'gate_1', name: 'Swift Deer', desc: 'Movement Speed x2', type: 'movement', effect: { speedMult: 2 } },
    { id: 'gate_2', name: 'Flying Scroll', desc: 'Movement Speed x5', type: 'movement', effect: { speedMult: 5 } },
    { id: 'gate_3', name: 'Heavy Stone', desc: 'Movement Speed x0.5', type: 'movement', effect: { speedMult: 0.5 } },
    { id: 'gate_4', name: 'Ice Walk', desc: 'Slippery Physics', type: 'movement', effect: { physics: 'ice' } },
    { id: 'gate_5', name: 'Moon Jump', desc: 'Low Gravity (Visual)', type: 'movement', effect: { physics: 'float' } },
    { id: 'gate_6', name: 'Ghost Form', desc: 'Walk Through Walls (Noclip)', type: 'movement', effect: { noclip: true } },
    { id: 'gate_7', name: 'Miriam\'s Well', desc: 'Walk on Water', type: 'movement', effect: { waterWalk: true } },
    { id: 'gate_8', name: 'Confusion', desc: 'Inverted Controls', type: 'movement', effect: { invertControls: true } },
    { id: 'gate_9', name: 'Random Walk', desc: 'Random Input Jitter', type: 'movement', effect: { jitter: true } },
    { id: 'gate_10', name: 'Teleport Step', desc: 'Blink forward', type: 'movement', effect: { blink: true } },

    // --- VISUALS (11-25) ---
    { id: 'gate_11', name: 'Olam HaTohu', desc: 'Invert Colors', type: 'visual', effect: { filter: 'invert(100%)' } },
    { id: 'gate_12', name: 'Ancient Scroll', desc: 'Sepia Tone', type: 'visual', effect: { filter: 'sepia(100%)' } },
    { id: 'gate_13', name: 'Night Vision', desc: 'Green Terminal Mode', type: 'visual', effect: { filter: 'grayscale(100%) sepia(100%) hue-rotate(90deg) saturate(500%) brightness(0.8) contrast(1.2)' } },
    { id: 'gate_14', name: 'Deep Blur', desc: 'Myopia Mode', type: 'visual', effect: { filter: 'blur(2px)' } },
    { id: 'gate_15', name: 'High Contrast', desc: 'Stark Reality', type: 'visual', effect: { filter: 'contrast(200%)' } },
    { id: 'gate_16', name: 'Rainbow World', desc: 'Cycling Hues', type: 'visual', effect: { anim: 'rainbow' } },
    { id: 'gate_17', name: 'Disco Fever', desc: 'Flashing Lights', type: 'visual', effect: { anim: 'disco' } },
    { id: 'gate_18', name: 'Earthquake', desc: 'Constant Screen Shake', type: 'visual', effect: { anim: 'shake' } },
    { id: 'gate_19', name: 'Upside Down', desc: 'Inverted World', type: 'visual', effect: { transform: 'rotate(180deg)' } },
    { id: 'gate_20', name: 'Spin Cycle', desc: 'Rotating World', type: 'visual', effect: { anim: 'spin' } },
    { id: 'gate_21', name: 'Big Head', desc: 'Player 2x Size', type: 'visual', effect: { scale: 2 } },
    { id: 'gate_22', name: 'Tiny Scribe', desc: 'Player 0.5x Size', type: 'visual', effect: { scale: 0.5 } },
    { id: 'gate_23', name: 'Ascii Mode', desc: 'Everything is Text (Already true, but MORE)', type: 'visual', effect: { font: 'monospace' } },
    { id: 'gate_24', name: 'Matrix', desc: 'Falling Code Overlay', type: 'visual', effect: { overlay: 'matrix' } },
    { id: 'gate_25', name: 'Noir', desc: 'Black and White', type: 'visual', effect: { filter: 'grayscale(100%)' } },

    // --- COMBAT (26-40) ---
    { id: 'gate_26', name: 'Gevurah Power', desc: 'One Hit Kill', type: 'combat', effect: { damageMult: 999 } },
    { id: 'gate_27', name: 'Iron Wall', desc: 'Invincibility (God Mode)', type: 'combat', effect: { invulnerable: true } },
    { id: 'gate_28', name: 'Vampire', desc: '100% Lifesteal', type: 'combat', effect: { lifesteal: 1.0 } },
    { id: 'gate_29', name: 'Pacifist', desc: 'Enemies flee instantly', type: 'combat', effect: { autoWin: true } },
    { id: 'gate_30', name: 'Berserk', desc: 'Auto-Attack constantly', type: 'combat', effect: { autoFight: true } },
    { id: 'gate_31', name: 'Glass Cannon', desc: '10x Damage, 1 HP', type: 'combat', effect: { glass: true } },
    { id: 'gate_32', name: 'Infinite Kavanah', desc: 'No Move Costs', type: 'combat', effect: { infiniteResource: true } },
    { id: 'gate_33', name: 'Thorns', desc: 'Reflect Damage', type: 'combat', effect: { reflect: 1.0 } },
    { id: 'gate_34', name: 'Sniper', desc: 'Always Critical Hit', type: 'combat', effect: { critChance: 1.0 } },
    { id: 'gate_35', name: 'Loot Goblin', desc: 'Double Drops', type: 'combat', effect: { dropMult: 2 } },
    
    // --- WORLD (36-45) ---
    { id: 'gate_36', name: 'Time Stop', desc: 'Freeze Day/Night Cycle', type: 'world', effect: { timeStop: true } },
    { id: 'gate_37', name: 'Fast Forward', desc: 'Time x10', type: 'world', effect: { timeSpeed: 10 } },
    { id: 'gate_38', name: 'Midas Touch', desc: 'Gain Money on Step', type: 'world', effect: { goldStep: 10 } },
    { id: 'gate_39', name: 'Repel', desc: 'No Random Encounters', type: 'world', effect: { encounterRate: 0 } },
    { id: 'gate_40', name: 'Attract', desc: 'Constant Encounters', type: 'world', effect: { encounterRate: 5 } },
    { id: 'gate_41', name: 'X-Ray', desc: 'Reveal Map', type: 'world', effect: { reveal: true } },
    { id: 'gate_42', name: 'Magnet', desc: 'Attract Items', type: 'world', effect: { magnet: true } },
    { id: 'gate_43', name: 'Gardener', desc: 'Instant Crop Growth', type: 'world', effect: { instantGrow: true } },
    { id: 'gate_44', name: 'Weather Man', desc: 'Toggle Rain', type: 'world', effect: { weatherControl: true } },
    { id: 'gate_45', name: 'Telekinesis', desc: 'Interact from distance', type: 'world', effect: { range: 5 } },

    // --- FUN/MISC (46-55) ---
    { id: 'gate_46', name: 'Party Pooper', desc: 'Silence all sounds', type: 'misc', effect: { mute: true } },
    { id: 'gate_47', name: 'Confetti', desc: 'Constant Celebration', type: 'misc', effect: { anim: 'confetti' } },
    { id: 'gate_48', name: 'Big Text', desc: 'Giant UI', type: 'misc', effect: { uiScale: 1.5 } },
    { id: 'gate_49', name: 'Small Text', desc: 'Tiny UI', type: 'misc', effect: { uiScale: 0.8 } },
    { id: 'gate_50', name: 'Emoji Swap', desc: 'Randomize Emojis', type: 'misc', effect: { shuffleSprites: true } },
    { id: 'gate_51', name: 'Clone', desc: 'Spawn Doppelgangers', type: 'misc', effect: { clones: true } },
    { id: 'gate_52', name: 'Trail', desc: 'Leave a trail', type: 'misc', effect: { trail: true } },
    { id: 'gate_53', name: 'Retro', desc: 'Pixelate Canvas', type: 'misc', effect: { pixelate: true } },
    { id: 'gate_54', name: 'Chaos', desc: 'Random Effect Every 10s', type: 'misc', effect: { chaosMode: true } },
    { id: 'gate_55', name: 'Ein Sof', desc: 'Unlock All Gates', type: 'misc', effect: { unlockAll: true } }
];

export const gateItems = {};
gates.forEach(g => {
    gateItems[`key_${g.id}`] = {
        id: `key_${g.id}`,
        name: `Key of ${g.name}`,
        desc: `Unlocks Gate: ${g.desc}`,
        type: 'key_item',
        gateId: g.id,
        sellValue: 1000
    };
});
