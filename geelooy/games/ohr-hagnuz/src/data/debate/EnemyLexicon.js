
/**
 * B"H
 * @module EnemyLexicon
 */

const EnemyVoid = { name: 'VOID_ANOMALY', label: 'The Forgetful Void', baseHp: 80, baseXp: 35, sprite: '🌑', bgClass: 'bg-void-anim', accent: '#d500f9', type: 'AIR', alignment: 'KLIPAH' };
const EnemyStone = { name: 'MATERIAL_LIMIT', label: 'The Heavy Stone', baseHp: 120, baseXp: 50, sprite: '🧱', bgClass: 'bg-stone-anim', accent: '#ffab40', type: 'EARTH', alignment: 'KLIPAH' };
const EnemyWind = { name: 'CONFUSION_WIND', label: 'The Tangled Remez', baseHp: 60, baseXp: 40, sprite: '🌀', bgClass: 'bg-wind-anim', accent: '#18ffff', type: 'AIR', alignment: 'KLIPAH' };
const EnemyFire = { name: 'SEVERITY_FIRE', label: 'The Burning Din', baseHp: 90, baseXp: 60, sprite: '🔥', bgClass: 'bg-fire-anim', accent: '#ff1744', type: 'FIRE', alignment: 'KLIPAH' };
const EnemyWater = { name: 'DOUBTFUL_WAVES', label: 'Waves of Cynicism', baseHp: 100, baseXp: 45, sprite: '🌊', bgClass: 'bg-wind-anim', accent: '#00b0ff', type: 'WATER', alignment: 'KLIPAH' };

const EnemyPhilosopher = { name: 'GREEK_LOGIC', label: 'Hellenistic Reason', baseHp: 150, baseXp: 120, sprite: '⚖', bgClass: 'bg-logic-anim', accent: '#536dfe', type: 'EARTH', alignment: 'KLIPAH' };
const EnemyTrainer = { name: 'ELDER_TRAINER', label: 'Strict Teacher', baseHp: 100, baseXp: 80, sprite: '👳', bgClass: 'bg-logic-anim', accent: '#ffffff', type: 'FIRE', alignment: 'NOGAH' };
const EnemySage = { name: 'SAGE_TEST', label: 'Master of Secrets', baseHp: 180, baseXp: 150, sprite: '📜', bgClass: 'bg-fire-anim', accent: '#ffca28', type: 'AIR', alignment: 'NOGAH' };

const EnemyWolf = { name: 'PRIMAL_INSTINCT', label: 'Wolf of Desire', baseHp: 85, baseXp: 45, sprite: '🐺', bgClass: 'bg-wind-anim', accent: '#9e9e9e', type: 'EARTH', alignment: 'NOGAH' };
const EnemySnake = { name: 'CUNNING_DECEIT', label: 'Serpent of Doubt', baseHp: 75, baseXp: 55, sprite: '🐍', bgClass: 'bg-void-anim', accent: '#4caf50', type: 'WATER', alignment: 'KLIPAH' };
const EnemyOx = { name: 'STUBBORN_RIGIDITY', label: 'Ox of Severity', baseHp: 140, baseXp: 65, sprite: '🐂', bgClass: 'bg-stone-anim', accent: '#8d6e63', type: 'EARTH', alignment: 'NOGAH' };
const EnemyLion = { name: 'FIERCE_PRIDE', label: 'Lion of Fire', baseHp: 160, baseXp: 85, sprite: '🦁', bgClass: 'bg-fire-anim', accent: '#ffb300', type: 'FIRE', alignment: 'NOGAH' };
const EnemyEagle = { name: 'ARROGANT_INTELLECT', label: 'Eagle of Air', baseHp: 110, baseXp: 75, sprite: '🦅', bgClass: 'bg-wind-anim', accent: '#d7ccc8', type: 'AIR', alignment: 'NOGAH' };
const EnemyPanther = { name: 'SILENT_STRIKE', label: 'Panther of Shadow', baseHp: 95, baseXp: 60, sprite: '🐆', bgClass: 'bg-void-anim', accent: '#212121', type: 'WATER', alignment: 'NOGAH' };
const EnemyDragon = { name: 'ANCIENT_PRIDE', label: 'Dragon of Gaivah', baseHp: 300, baseXp: 250, sprite: '🐲', bgClass: 'bg-fire-anim', accent: '#ff1744', type: 'FIRE', alignment: 'KLIPAH' };
const EnemyScorpion = { name: 'COLD_JUDGMENT', label: 'Scorpion of Din', baseHp: 120, baseXp: 90, sprite: '🦂', bgClass: 'bg-stone-anim', accent: '#795548', type: 'EARTH', alignment: 'KLIPAH' };

export const EnemyLexicon = {
    '🌑': EnemyVoid, '🧱': EnemyStone, '🌀': EnemyWind, '🔥': EnemyFire, '🌊': EnemyWater,
    '⚖': EnemyPhilosopher, '👳': EnemyTrainer, '📜': EnemySage, '📖': EnemySage, 
    '🪔': EnemySage, '🧔': EnemySage, '✒️': EnemySage, '🧵': EnemySage, '🕯️': EnemySage,
    '🌱': EnemySage, '🛡': EnemySage, '👑': EnemySage, '💂': EnemySage, '🐺': EnemyWolf,
    '🐍': EnemySnake, '🐂': EnemyOx, '🦁': EnemyLion, '🦅': EnemyEagle, '🐆': EnemyPanther,
    '🐲': EnemyDragon, '🦂': EnemyScorpion, '🕷': EnemyScorpion
};

export const resolveEnemy = (id) => EnemyLexicon[id] || EnemyLexicon['🌑'];
