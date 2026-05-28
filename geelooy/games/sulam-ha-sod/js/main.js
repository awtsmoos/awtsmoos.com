// B"H
import { InputVessel } from './core/input.js';
import { Renderer } from './core/renderer.js';
import { Game } from './core/game.js';

/**
 * Awakens Sulam HaSod with plain, forgiving mobile controls.
 *
 * The Awtsmoos makes the hand simple: left, right, jump. Wide hit zones extend
 * upward above the visual buttons so a frantic thumb still becomes clean intent,
 * and the ladder remains about reading traps rather than fighting a joystick.
 */
function awakenSulamHaSod() {
  const menu = document.getElementById('menu');
  const instructions = document.getElementById('instructions');
  const input = new InputVessel({
    left: document.getElementById('leftBtn'),
    right: document.getElementById('rightBtn'),
    jump: document.getElementById('jump')
  });
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
  game.renderer.draw(game.world);
  game.paintHud();
}

awakenSulamHaSod();
