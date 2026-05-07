
import { SageAleph } from './SageAleph.js';
import { PhilosopherLogic } from './PhilosopherLogic.js';
import { LibrarianKeter } from './LibrarianKeter.js';
import { ElderTrainer } from './ElderTrainer.js';
import { RabbiTrainer } from './RabbiTrainer.js';
import { MerchantScribe } from './MerchantScribe.js';
import { MerchantTailor } from './MerchantTailor.js';
import { MysticDialogue } from './MysticDialogue.js';
import { ArtisanDialogue } from './ArtisanDialogue.js';
import { WatchmanDialogue } from './WatchmanDialogue.js';
import { BeggarDialogue } from './wanderers/BeggarDialogue.js';
import { MusicianDialogue } from './wanderers/MusicianDialogue.js';

export const DialogueIndex = {
    'SAGE_ALEPH': SageAleph,
    'PHILOSOPHER_MAIN': PhilosopherLogic,
    'LIBRARIAN_KETER': LibrarianKeter,
    'TRAINER_ELDER': ElderTrainer,
    'RABBI_HEY': RabbiTrainer,
    'MERCHANT_SCRIBE': MerchantScribe,
    'MERCHANT_TAILOR': MerchantTailor,
    'MYSTIC_GIMMEL': MysticDialogue,
    'ARTISAN_DALET': ArtisanDialogue,
    'WATCHMAN_SENTINEL': WatchmanDialogue,
    'GENERAL_STORE_YOD': { 'START': { lines: ["B\"H. Welcome to Yod."], options: [{ label: "Browse", next: 'END' }] } },
    'GARDENER_TET': { 'START': { lines: ["The earth yields its fruit."], options: [{ label: "Amen.", next: 'END' }] } },
    'SHIELD_CHET': { 'START': { lines: ["The wall must hold."], options: [{ label: "Debate", next: 'END', action: 'BATTLE' }] } },
    'KING_MALCHUS': { 'START': { lines: ["You stand before the throne of Malchut."], options: [{ label: "Bow", next: 'END' }] } },
    
    'MERCHANT_BAKER': { 'START': { lines: ["B\"H. I knead the flour of Earth with the water of Torah.", "Fresh bread restores the light of the soul."], options: [{ label: "Smells divine.", next: 'END' }] } },
    'MERCHANT_JEWELER': { 'START': { lines: ["B\"H. I take the raw sparks you've gathered from the Klipot.", "And I polish them into gems of wisdom."], options: [{ label: "A holy trade.", next: 'END' }] } },
    'ROYAL_SCHOLAR': { 'START': { lines: ["B\"H. In the palace, we study the secrets of the Universe.", "The King rules by the word of the Awtsmoos."], options: [{ label: "Profound.", next: 'END' }] } },

    'BEGGAR': BeggarDialogue,
    'MUSICIAN': MusicianDialogue,

    '🌑': { 'START': { lines: ["VOID!"], options: [{ label: "Debate", next: 'END', action: 'BATTLE' }] } },
    '🧱': { 'START': { lines: ["STONE!"], options: [{ label: "Debate", next: 'END', action: 'BATTLE' }] } },
    '🌀': { 'START': { lines: ["WIND!"], options: [{ label: "Debate", next: 'END', action: 'BATTLE' }] } },
    '🔥': { 'START': { lines: ["FIRE!"], options: [{ label: "Debate", next: 'END', action: 'BATTLE' }] } },
    '🐺': { 'START': { lines: ["WOLF!"], options: [{ label: "Debate", next: 'END', action: 'BATTLE' }] } },
    '🐍': { 'START': { lines: ["SNAKE!"], options: [{ label: "Debate", next: 'END', action: 'BATTLE' }] } },
    '🐂': { 'START': { lines: ["OX!"], options: [{ label: "Debate", next: 'END', action: 'BATTLE' }] } },
    '🦁': { 'START': { lines: ["LION!"], options: [{ label: "Debate", next: 'END', action: 'BATTLE' }] } },
    '🦅': { 'START': { lines: ["EAGLE!"], options: [{ label: "Debate", next: 'END', action: 'BATTLE' }] } },
    '🐆': { 'START': { lines: ["PANTHER!"], options: [{ label: "Debate", next: 'END', action: 'BATTLE' }] } },
    '🐲': { 'START': { lines: ["DRAGON!"], options: [{ label: "Debate", next: 'END', action: 'BATTLE' }] } },
    '🦂': { 'START': { lines: ["SCORPION!"], options: [{ label: "Debate", next: 'END', action: 'BATTLE' }] } },
    '🕷': { 'START': { lines: ["SPIDER!"], options: [{ label: "Debate", next: 'END', action: 'BATTLE' }] } },
    
    'GUARDIAN_KLIPAH': { 'START': { lines: ["Shatter!"], options: [{ label: "Debate", next: 'END', action: 'BATTLE' }] } },
    'DEFAULT': { 'START': { lines: ["B\"H."], options: [{ label: "Peace.", next: 'END' }] } }
};
