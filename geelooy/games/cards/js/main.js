/*B"H*/

import { Renderer } from './engine/renderer.js';
import { BlackjackGame } from './games/blackjack.js';


const mainMenu = document.getElementById('main-menu');
const gameContainer = document.getElementById('game-container');
const canvas = document.getElementById('game-canvas');
const startGameButton = document.getElementById('start-game');
const aiPlayersInput = document.getElementById('ai-players');
const gameButtons = document.querySelectorAll('.game-button');

const ui = {
    playerActions: document.getElementById('player-actions'),
    hitButton: document.getElementById('hit-button'),
    standButton: document.getElementById('stand-button'),
    gameStatus: document.getElementById('game-status')
};

let selectedGame = null;

// ... (initializeMenu remains the same) ...
function initializeMenu() {
    gameButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.disabled) return;
            selectedGame = button.dataset.game;
            gameButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
        });
    });

    startGameButton.addEventListener('click', () => {
        if (selectedGame) {
            const numAIPlayers = parseInt(aiPlayers_input.value);
            beginExperience(selectedGame, numAIPlayers);
        } else {
            alert('A path must be chosen before the journey can begin.');
        }
    });
}


/**
 * The Great Transition. This function now includes the most crucial fix: it ensures
 * the canvas's internal drawing resolution matches its on-screen size. This prevents
 * the stretching and coordinate mismatches that contributed to the chaos.
 * @param {string} gameType - The chosen metaphysical ruleset.
 * @param {number} numAIPlayers - The number of thought-forms to compete against.
 */
function beginExperience(gameType, numAIPlayers) {
    mainMenu.style.display = 'none';
    gameContainer.style.display = 'block';
    
    // *** THE CRITICAL MENDING ***
    // We command the canvas's internal soul (its resolution) to match its
    // physical body (its size on the screen). This prevents distortion.
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const renderer = new Renderer(canvas.getContext('2d'));
    const players = [];
    players.push({ id: 'human', name: 'The Self', hand: [], score: 0, isAI: false, isDealer: false });
    players.push({ id: 'dealer', name: 'The House of Judgment', hand: [], score: 0, isAI: true, isDealer: true });
    for (let i = 0; i < numAIPlayers; i++) {
        players.push({ id: `ai_${i}`, name: `Emanation ${i + 1}`, hand: [], score: 0, isAI: true, isDealer: false });
    }
    
    switch (gameType) {
        case 'blackjack':
            const blackjackGame = new BlackjackGame(players, renderer, ui);
            blackjackGame.start();
            break;
    }
}

initializeMenu();