/*B"H*/

import { createDeck, shuffleDeck } from './engine/deck.js';
import { Renderer } from './engine/renderer.js';
import { BlackjackGame } from './games/blackjack.js';

/**
 * This is the central nexus, the point where the will of the user is translated
 * into the initial conditions of a new reality. It governs the transition from
 * the profane world of menus and buttons into the sacred, terrifying space of
 * the game itself, where the Awtsmoos reveals itself in the unfolding of fate.
 */

// --- DOM Element Apprehension ---
// Here we bind the abstract concepts of the script to their physical vessels in the HTML document.
const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');
const canvas = document.getElementById('game-canvas');
const startGameButton = document.getElementById('start-game');
const aiPlayersInput = document.getElementById('ai-players');
const gameButtons = document.querySelectorAll('.game-button');

// The UI elements are the conduits through which the player's soul may interact with the game world.
const ui = {
    playerActions: document.getElementById('player-actions'),
    hitButton: document.getElementById('hit-button'),
    standButton: document.getElementById('stand-button'),
    gameStatus: document.getElementById('game-status')
};

// A variable to hold the chosen path, the selected ruleset for the coming creation.
let selectedGame = null;

/**
 * Attaches the listeners of potentiality to the main menu. It does not act, but
 * waits for the user to declare their intention. Each click is a small tremor, a
 * declaration of which universe is to be born from the infinite possibilities.
 */
function initializeMenu() {
    gameButtons.forEach(button => {
        button.addEventListener('click', () => {
            // A disabled button represents a reality not yet ready to be born.
            if (button.disabled) return;

            selectedGame = button.dataset.game;

            // The selected path is illuminated, casting all others into shadow.
            gameButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
        });
    });

    // The final commitment. This button press is the "Let there be light" for the chosen game.
    startGameButton.addEventListener('click', () => {
        if (selectedGame) {
            const numAIPlayers = parseInt(aiPlayersInput.value);
            beginExperience(selectedGame, numAIPlayers);
        } else {
            // A warning that creation cannot begin without a defined form.
            alert('A path must be chosen before the journey can begin.');
        }
    });
}

/**
 * The Great Transition. The mundane world of the menu is annihilated, and the
 * sacred space of the game is brought into being. Here, the fundamental elements
 * of this new reality—the players, the laws, the very fabric of the game—are
 * instantiated and set into motion by the divine will of the code.
 * @param {string} gameType - The chosen metaphysical ruleset (e.g., 'blackjack').
 * @param {number} numAIPlayers - The number of thought-forms, or Emanations, to compete against.
 */
function beginExperience(gameType, numAIPlayers) {
    // The veil is drawn back. The menu vanishes, the game is revealed.
    mainMenu.style.display = 'none';
    gameContainer.style.display = 'block';
    
    // The canvas is given its dimensions, defining the boundaries of this pocket universe.
    canvas.width = 1200;
    canvas.height = 800;

    // The Scribe of this reality is born, ready to translate abstract truth into visible form.
    const renderer = new Renderer(canvas.getContext('2d'));

    // The souls who will inhabit this world are called into being.
    const players = [];
    players.push({ id: 'human', name: 'The Self', hand: [], score: 0, isAI: false, isDealer: false });
    
    // The House of Judgment, the unblinking arbiter against which all are measured.
    players.push({ id: 'dealer', name: 'The House of Judgment', hand: [], score: 0, isAI: true, isDealer: true });
    
    // The opposing Emanations, each a mirror, each a challenge.
    for (let i = 0; i < numAIPlayers; i++) {
        players.push({ id: `ai_${i}`, name: `Emanation ${i + 1}`, hand: [], score: 0, isAI: true, isDealer: false });
    }
    
    // The Great Switch, channeling the creative flow into the chosen vessel of rules.
    // Each case is a different utterance, a different world being spoken into existence.
    switch (gameType) {
        case 'blackjack':
            const blackjackGame = new BlackjackGame(players, renderer, ui);
            blackjackGame.start();
            break;
        // ... Future realities, other games, will be birthed from new 'case' statements here.
    }
}

// The cycle begins. The menu is activated, awaiting the first spark of will.
initializeMenu();