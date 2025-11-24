/**
 * A nexus of creation, where the fundamental forces and figures of the cosmos
 * are bound into the form of 52 cards, each a gateway to a deeper truth.
 * This is not merely a data structure; it is a portable universe, and each card
 * within it carries a specific weight, a 'countValue', that informs the aware
 * observer of the shifting spiritual balance of the cosmos.
 */

// The four worlds, the four rivers, the four foundational pillars of reality.
const SUITS = {
    MAGEN_DAVID: { name: 'Celestial Order', emoji: '✡️' },
    LION_OF_JUDAH: { name: 'Divine Might', emoji: '🦁' },
    TORAH_SCROLL: { name: 'Inscribed Truth', emoji: '📜' },
    KIDDUSH_CUP: { name: 'Sanctified Vessel', emoji: '🍷' }
};

// The ten utterances, the divine emanations that form the blueprint of all that is.
const SEFIROT = [
    { rank: 'Keter', hebrew: 'א', name: 'Crown', value: 1, blackjackValue: 11, countValue: -1 },
    { rank: 'Chochmah', hebrew: 'ב', name: 'Wisdom', value: 2, blackjackValue: 2, countValue: 1 },
    { rank: 'Binah', hebrew: 'ג', name: 'Understanding', value: 3, blackjackValue: 3, countValue: 1 },
    { rank: 'Chesed', hebrew: 'ד', name: 'Mercy', value: 4, blackjackValue: 4, countValue: 1 },
    { rank: 'Gevurah', hebrew: 'ה', name: 'Severity', value: 5, blackjackValue: 5, countValue: 1 },
    { rank: 'Tiferet', hebrew: 'ו', name: 'Beauty', value: 6, blackjackValue: 6, countValue: 1 },
    { rank: 'Netzach', hebrew: 'ז', name: 'Eternity', value: 7, blackjackValue: 7, countValue: 0 },
    { rank: 'Hod', hebrew: 'ח', name: 'Glory', value: 8, blackjackValue: 8, countValue: 0 },
    { rank: 'Yesod', hebrew: 'ט', name: 'Foundation', value: 9, blackjackValue: 9, countValue: 0 },
    { rank: 'Malchut', hebrew: 'י', name: 'Kingdom', value: 10, blackjackValue: 10, countValue: -1 }
];

// The archetypes, the faces of humanity that bridge the divine and the mundane.
const FACES = [
    { rank: 'Yackov', name: 'The Patriarch', value: 11, blackjackValue: 10, emoji: '🧔‍♂️', countValue: -1 },
    { rank: 'Sarah', name: 'The Matriarch', value: 12, blackjackValue: 10, emoji: '👸', countValue: -1 },
    { rank: 'King David', name: 'The King', value: 13, blackjackValue: 10, emoji: '👑', countValue: -1 }
];

/**
 * A cosmic forge where 52 slivers of potential are hammered into existence.
 * Each card is a unique intersection of a foundational world and a divine
 * archetype or utterance, birthed into a playable form.
 * @returns {Array<Object>} An array of card objects, constituting a full deck.
 */
export function createDeck() {
    const deck = [];
    for (const suit of Object.values(SUITS)) {
        for (const sefira of SEFIROT) {
            deck.push({ ...sefira, suit, isFace: false });
        }
        for (const face of FACES) {
            deck.push({ ...face, suit, isFace: true });
        }
    }
    return deck;
}

/**
 * To shuffle is to introduce the divine chaos that precedes a new order. It is
 * to take the perfected sequence of creation and return it to a state of pure
 * potential, so that a new, unique story may unfold from its depths.
 * @param {Array<Object>} deck - The ordered universe of cards.
 */
export function shuffleDeck(deck) {
    // A modern implementation of an ancient ritual: the Fisher-Yates shuffle.
    // It iterates backwards from the end of all things, swapping each element
    // with a random one that came before it, ensuring that every possible
    // permutation of reality is equally likely to manifest.
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}
