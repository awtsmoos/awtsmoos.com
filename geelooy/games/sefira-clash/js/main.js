import { MAPS } from './data/maps.js';
import { CHARACTERS } from './data/characters.js';
import { createInput } from './controls/input.js';
import { createGameState } from './core/state.js';
import { stepState } from './core/loop.js';
import { draw } from './render/renderer.js';
import { showCardGrid, showCountdown } from './menu/menuViews.js';

/**
 * B"H
 * Main menu gate.
 *
 * The battle now teaches F/G/H/R as the primary desktop combat keys and keeps
 * the clean sequence: fighter grid, map grid, countdown, match.
 */
const canvas = document.getElementById('olam');
const overlay = document.getElementById('menuOverlay');
const botSelect = document.getElementById('botSelect');
const restart = document.getElementById('restart');
const debug = document.getElementById('debugToggle');
const statusText = document.getElementById('statusText');
const ctx = canvas.getContext('2d');
const input = createInput(document);
const choice = { character: CHARACTERS[0], map: MAPS[0] };
let state = createMenuState();

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, innerWidth * dpr);
  canvas.height = Math.max(1, innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function createMenuState() {
  const menuState = createGameState(MAPS[0], 0, CHARACTERS[0]);
  menuState.phase = 'menu';
  return menuState;
}

function showCharacterMenu() {
  state = createMenuState();
  overlay.classList.remove('hidden');
  statusText.textContent = 'Step 1: choose your fighter.';
  showCardGrid(overlay, {
    title: 'Choose Your Sefirah Warrior',
    subtitle: 'Desktop: A/D move, W or Space jump, F punch, G kick, H grab, Shift shield, R special. Mobile: joystick + labeled buttons.',
    items: CHARACTERS,
    onPick: item => { choice.character = item; showMapMenu(); }
  });
}

function showMapMenu() {
  statusText.textContent = `Step 2: ${choice.character.name} chosen. Choose the arena.`;
  showCardGrid(overlay, {
    title: 'Choose The Arena',
    subtitle: 'After countdown, fight until one side remains. F/G attacks burst Hebrew letters on contact.',
    items: MAPS,
    onPick: item => { choice.map = item; beginCountdown(); }
  });
}

function beginCountdown() {
  state = createGameState(choice.map, Number(botSelect.value || 5), choice.character);
  state.phase = 'countdown';
  let count = 3;
  showCountdown(overlay, count);
  statusText.textContent = `${choice.character.name} enters ${choice.map.name}. Get ready.`;
  const timer = setInterval(() => {
    count -= 1;
    if (count > 0) showCountdown(overlay, count);
    else {
      clearInterval(timer);
      showCountdown(overlay, 'GO');
      setTimeout(startMatch, 320);
    }
  }, 650);
}

function startMatch() {
  overlay.classList.add('hidden');
  state.phase = 'playing';
  statusText.textContent = 'Fight: A/D move · W/Space jump · F punch · G kick · H grab · Shift shield · R special.';
}

function frame() {
  if (state.phase === 'playing') stepState(state, input.read());
  draw(ctx, state, canvas.clientWidth || innerWidth, canvas.clientHeight || innerHeight);
  requestAnimationFrame(frame);
}

restart.onclick = showCharacterMenu;
botSelect.onchange = () => { if (state.phase === 'playing') beginCountdown(); };
debug.onclick = () => { if (state) state.debug = !state.debug; };
addEventListener('resize', resize);
resize();
showCharacterMenu();
requestAnimationFrame(frame);
