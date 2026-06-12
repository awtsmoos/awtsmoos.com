import { MAPS } from './data/maps.js';
import { CHARACTERS } from './data/characters.js';
import { createInput } from './controls/input.js';
import { createGameState } from './core/state.js';
import { stepState } from './core/loop.js';
import { draw } from './render/renderer.js';
import { createRenderSurface, presentRenderSurface, resizeRenderSurface } from './render/offscreenSurface.js';
import { readAudioMode, writeAudioMode } from './settings/audioSettings.js';
import { showCardGrid, showCountdown, showSingleStart, showVictory } from './menu/menuViews.js';
import { loadProfile, nextStage, saveProfile, winnerFor } from './session/sessionHelpers.js';

/** B"H — Chapter 22: the main gate stays lean while mouse lightning strikes toward the cursor. */
const canvas = document.getElementById('olam');
const overlay = document.getElementById('menuOverlay');
const botSelect = document.getElementById('botSelect');
const soundSelect = document.getElementById('soundSelect');
const restart = document.getElementById('restart');
const debug = document.getElementById('debugToggle');
const statusText = document.getElementById('statusText');
const surface = createRenderSurface(canvas);
const saved = loadProfile();
const choice = { character: CHARACTERS[0], map: MAPS[0], cosmetic: { headwear: saved.headwear || 'kippah', hue: Number(saved.hue || 182), ready: !!saved.ready } };
let state = createMenuState();
const input = createInput(document, { canvas, getState: () => state });
let countdownTimer = null;

soundSelect.value = readAudioMode();
soundSelect.onchange = () => writeAudioMode(soundSelect.value);
overlay.addEventListener('click', event => {
  const victory = event.target.closest('[data-victory-action]');
  if (victory) return handleVictoryAction(victory.dataset.victoryAction);
  const customize = event.target.closest('[data-customize-action]');
  if (customize) return finishCustomize();
});

function resize() {
  const mobile = innerWidth < 820 || innerHeight < 520;
  const dpr = Math.min(devicePixelRatio || 1, mobile ? 1.15 : 1.5);
  resizeRenderSurface(surface, innerWidth, innerHeight, dpr);
}
function createMenuState() {
  const menuState = createGameState(MAPS[0], 0, choice?.character || CHARACTERS[0], choice?.cosmetic || {});
  menuState.phase = 'menu';
  return menuState;
}
function showCustomizeMenu() {
  clearCountdown();
  state = createMenuState();
  overlay.classList.remove('hidden');
  statusText.textContent = 'Customize fighter.';
  showSingleStart(overlay, {
    cosmetic: choice.cosmetic,
    onHue: hue => { choice.cosmetic.hue = hue; saveProfile(choice.cosmetic, false); showCustomizeMenu(); },
    onHeadwear: headwear => { choice.cosmetic.headwear = headwear; saveProfile(choice.cosmetic, false); showCustomizeMenu(); }
  });
}
function finishCustomize() {
  choice.cosmetic.ready = true;
  saveProfile(choice.cosmetic, true);
  showMapMenu();
}
function showMapMenu() {
  clearCountdown();
  overlay.classList.remove('hidden');
  statusText.textContent = 'Choose arena.';
  showCardGrid(overlay, {
    title: 'Choose Arena',
    subtitle: 'Left click punches toward cursor. Right click kicks. Hold keys/buttons to charge.',
    items: MAPS,
    onPick: item => { choice.map = item; beginCountdown(); }
  });
}
function beginCountdown(map = choice.map) {
  clearCountdown();
  choice.map = map;
  state = createGameState(choice.map, Number(botSelect.value || 5), choice.character, choice.cosmetic);
  state.phase = 'countdown';
  overlay.classList.remove('hidden');
  let count = 3;
  showCountdown(overlay, count);
  statusText.textContent = `${choice.map.name}. Get ready.`;
  countdownTimer = setInterval(() => {
    count -= 1;
    if (count > 0) showCountdown(overlay, count);
    else { clearCountdown(); showCountdown(overlay, 'GO'); setTimeout(startMatch, 280); }
  }, 600);
}
function startMatch() {
  overlay.classList.add('hidden');
  state.phase = 'playing';
  state.victoryShown = false;
  statusText.textContent = 'Fight: click-aim, charge, rapid punch, launch, recover.';
}
function frame() {
  if (state.phase === 'playing') {
    stepState(state, input.read());
    const winner = winnerFor(state);
    if (winner && !state.victoryShown) enterVictory(winner);
  }
  draw(surface.ctx, state, canvas.clientWidth || innerWidth, canvas.clientHeight || innerHeight);
  presentRenderSurface(surface);
  requestAnimationFrame(frame);
}
function enterVictory(winner) {
  const nextMap = nextStage(MAPS, choice.map);
  state.phase = 'victory';
  state.victoryShown = true;
  state.winner = winner.name;
  overlay.classList.remove('hidden');
  overlay.classList.add('victoryOverlay');
  statusText.textContent = `${winner.name} wins. Choose next step.`;
  showVictory(overlay, { winner, map: choice.map, nextMap });
}
function handleVictoryAction(action) {
  if (state.phase !== 'victory') return;
  if (action === 'next') {
    const map = nextStage(MAPS, choice.map);
    if (map) beginCountdown(map);
  } else if (action === 'rematch') beginCountdown(choice.map);
  else if (action === 'menu') showMapMenu();
}
function clearCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = null;
  overlay.classList.remove('victoryOverlay');
}

restart.onclick = showCustomizeMenu;
botSelect.onchange = () => { if (state.phase === 'playing' || state.phase === 'victory') beginCountdown(choice.map); };
debug.onclick = () => { if (state) state.debug = !state.debug; };
addEventListener('resize', resize);
resize();
choice.cosmetic.ready ? showMapMenu() : showCustomizeMenu();
requestAnimationFrame(frame);
