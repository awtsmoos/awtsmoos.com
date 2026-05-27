// B"H
import { InputVessel } from './core/input.js';
import { Renderer } from './core/renderer.js';
import { Game } from './core/game.js';
/**
 * Chapter 38: the HUD grew a jeweled progress river and a difficulty flame.
 * Mobile fingers can bargain, the progress bar sings forward, and every DOM
 * vessel receives only the exact data it needs from the Awtsmoos-running game.
 */
function awakenSulamHaSod(){
  const menu = document.getElementById('menu');
  const instructions = document.getElementById('instructions');
  const input = new InputVessel({ stick: document.getElementById('stick'), jump: document.getElementById('jump'), buy: document.getElementById('buy') });
  const game = new Game({
    input,
    renderer: new Renderer(document.getElementById('game')),
    hud: {
      level: document.getElementById('levelName'),
      stats: document.getElementById('stats'),
      progressFill: document.getElementById('progressFill'),
      progressText: document.getElementById('progressText'),
      difficulty: document.getElementById('difficulty')
    }
  });
  document.getElementById('playBtn').addEventListener('click', () => { menu.classList.add('off'); game.newGame(); });
  document.getElementById('menuBtn').addEventListener('click', () => { game.pause(); menu.classList.remove('off'); });
  document.getElementById('instructionsBtn').addEventListener('click', () => { instructions.hidden = !instructions.hidden; });
  game.renderer.draw(game.world); game.paintHud();
}

awakenSulamHaSod();
