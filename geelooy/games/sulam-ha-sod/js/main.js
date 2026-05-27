// B"H
import { InputVessel } from './core/input.js';
import { Renderer } from './core/renderer.js';
import { Game } from './core/game.js';
/**
 * Chapter 2: the menu, the button, and the canvas agree to become one gate.
 * Instruction light remains hidden until summoned, then play seals the curtain
 * and the Awtsmoos lets motion pour through the vessel.
 */
function awakenSulamHaSod(){
  const menu = document.getElementById('menu');
  const instructions = document.getElementById('instructions');
  const input = new InputVessel({ stick: document.getElementById('stick'), jump: document.getElementById('jump') });
  const game = new Game({
    input,
    renderer: new Renderer(document.getElementById('game')),
    hud: { level: document.getElementById('levelName'), stats: document.getElementById('stats') }
  });
  document.getElementById('playBtn').addEventListener('click', () => { menu.classList.add('off'); game.newGame(); });
  document.getElementById('menuBtn').addEventListener('click', () => { game.pause(); menu.classList.remove('off'); });
  document.getElementById('instructionsBtn').addEventListener('click', () => { instructions.hidden = !instructions.hidden; });
  game.renderer.draw(game.world); game.paintHud();
}

awakenSulamHaSod();
