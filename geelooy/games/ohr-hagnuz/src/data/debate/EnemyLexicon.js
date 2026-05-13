
import { EnemyVoid } from './enemies/EnemyVoid.js';
import { EnemyStone } from './enemies/EnemyStone.js';
import { EnemyWind } from './enemies/EnemyWind.js';
import { EnemyFire } from './enemies/EnemyFire.js';
import { EnemyPhilosopher } from './enemies/EnemyPhilosopher.js';
import { EnemyTrainer } from './enemies/EnemyTrainer.js';
import { EnemySage } from './enemies/EnemySage.js';
import { EnemyWolf } from './enemies/EnemyWolf.js';
import { EnemySnake } from './enemies/EnemySnake.js';
import { EnemyOx } from './enemies/EnemyOx.js';
import { EnemyLion } from './enemies/EnemyLion.js';
import { EnemyEagle } from './enemies/EnemyEagle.js';
import { EnemyPanther } from './enemies/EnemyPanther.js';
import { EnemyDragon } from './enemies/EnemyDragon.js';
import { EnemyScorpion } from './enemies/EnemyScorpion.js';
import { AngelMichael } from './enemies/AngelMichael.js';
import { AngelGabriel } from './enemies/AngelGabriel.js';
import { EnemyAleph } from './enemies/EnemyAleph.js';
import { EnemyMem } from './enemies/EnemyMem.js';
import { EnemyTav } from './enemies/EnemyTav.js';
import { AngelMetatron } from './enemies/kedushah/AngelMetatron.js';
import { EnemySamael } from './enemies/klipot/EnemySamael.js';

// New High-Angels
import { AngelSeraph } from './enemies/kedushah/AngelSeraph.js';
import { AngelChaya } from './enemies/kedushah/AngelChaya.js';

/**
 * B"H
 * @module EnemyLexicon
 */
export const EnemyLexicon = {
    '🌑': EnemyVoid, 
    '🧱': EnemyStone, 
    '🌀': EnemyWind, 
    '🔥': EnemyFire, 
    '⚖': EnemyPhilosopher, 
    '👳': EnemyTrainer, 
    '📜': EnemySage, 
    '📖': EnemySage, 
    '🪔': EnemySage, 
    '🧔': EnemySage, 
    '✒️': EnemySage, 
    '🧵': EnemySage, 
    '🕯️': EnemySage,
    '🌱': EnemySage, 
    '🛡': EnemySage, 
    '👑': EnemySage, 
    '💂': EnemySage, 
    '🐺': EnemyWolf,
    '🐍': EnemySnake, 
    '🐂': EnemyOx, 
    '🦁': EnemyLion, 
    '🦅': EnemyEagle, 
    '🐆': EnemyPanther,
    '🐲': EnemyDragon, 
    '🦂': EnemyScorpion, 
    '🕷': EnemyScorpion,
    
    // Angels & Otiot
    '👼': AngelSeraph,   // Replaced Michael with Seraph mapping for Beriah
    '⚡': AngelChaya,    // Chayot HaKodesh
    '🔥_ANGEL': AngelGabriel,
    'א': EnemyAleph,
    'מ': EnemyMem,
    'ת': EnemyTav,

    // The Ultimates
    '👁️‍🗨️': AngelMetatron,
    '🐉': EnemySamael
};

export const resolveEnemy = (id) => EnemyLexicon[id] || EnemyLexicon['🌑'];
