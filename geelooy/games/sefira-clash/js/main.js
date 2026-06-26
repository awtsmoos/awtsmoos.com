import { ADVENTURE_MAPS, MAPS } from './data/maps.js';
import { CHARACTERS } from './data/characters.js';
import { createInput } from './controls/input.js';
import { createGameState } from './core/state.js';
import { stepState } from './core/loop.js';
import { mobileProfile, applyMobileProfile } from './platform/mobileProfile.js';
import { draw } from './render/renderer.js';
import { createRenderSurface, presentRenderSurface, resizeRenderSurface } from './render/offscreenSurface.js';
import { readAudioMode, writeAudioMode } from './settings/audioSettings.js';
import { showAdventureGrid, showCardGrid, showCountdown, showInfoPanel, showModeMenu, showSingleStart, showVictory } from './menu/menuViews.js';
import { decorateAdventureMaps, loadAdventureProgress, loadProfile, nextStage, recordAdventureClear, saveProfile, winnerFor } from './session/sessionHelpers.js';

/** B"H — Chapter 312: one main gate, four menu doors, VS intact, Adventure remembered. */
const canvas = document.getElementById('olam'), overlay = document.getElementById('menuOverlay');
const botSelect = document.getElementById('botSelect'), soundSelect = document.getElementById('soundSelect');
const restart = document.getElementById('restart'), debug = document.getElementById('debugToggle'), statusText = document.getElementById('statusText');
const profile = mobileProfile(window); applyMobileProfile(document, profile);
const surface = createRenderSurface(canvas, profile), saved = loadProfile();
const choice = { mode: 'vs', character: CHARACTERS[0], map: MAPS[0], cosmetic: { headwear: saved.headwear || 'kippah', hue: Number(saved.hue || 182), ready: !!saved.ready } };
let state = createMenuState(), countdownTimer = null, runStartedAt = 0;
let adventureProgress = loadAdventureProgress(ADVENTURE_MAPS);
const input = createInput(document, { canvas, getState: () => state });

soundSelect.value = readAudioMode();
soundSelect.onchange = () => writeAudioMode(soundSelect.value);
overlay.addEventListener('click', event => {
  const victory = event.target.closest('[data-victory-action]'); if (victory) return handleVictoryAction(victory.dataset.victoryAction);
  const customize = event.target.closest('[data-customize-action]'); if (customize) return customize.dataset.customizeAction === 'back' ? showCustomizeMenu() : finishCustomize();
  if (event.target.closest('[data-menu-back]')) return showMode();
});

function resize() { resizeRenderSurface(surface, innerWidth, innerHeight, Math.min(devicePixelRatio || 1, profile.dprCap)); }
function createMenuState() { const s = createGameState(MAPS[0], 0, choice.character, choice.cosmetic); s.phase = 'menu'; return s; }
function showCustomizeMenu() {
  clearCountdown(); state = createMenuState(); overlay.classList.remove('hidden'); statusText.textContent = `${profile.label}: customize fighter.`;
  showSingleStart(overlay, { cosmetic: choice.cosmetic, onHue: hue => { choice.cosmetic.hue = hue; saveProfile(choice.cosmetic, false); showCustomizeMenu(); }, onHeadwear: headwear => { choice.cosmetic.headwear = headwear; saveProfile(choice.cosmetic, false); showCustomizeMenu(); } });
}
function finishCustomize() { choice.cosmetic.ready = true; saveProfile(choice.cosmetic, true); showMode(); }
function showMode() {
  clearCountdown(); state = createMenuState(); overlay.classList.remove('hidden'); statusText.textContent = 'Choose VS, Adventure, Settings, or Credits.';
  showModeMenu(overlay, { onPick: handleModePick });
}
function handleModePick(mode) {
  if (mode === 'adventure') return showAdventureMenu();
  if (mode === 'settings') return showSettings();
  if (mode === 'credits') return showCredits();
  return showVsMenu();
}
function showVsMenu() {
  choice.mode = 'vs'; clearCountdown(); overlay.classList.remove('hidden'); statusText.textContent = 'VS Mode: choose arena.';
  showCardGrid(overlay, { title: 'VS Mode', subtitle: profile.mobile ? 'Pick any arena and fight now.' : 'Pick any arena for a brawler match.', items: MAPS, onPick: item => beginCountdown(item, 'vs') });
}
function showSettings() {
  clearCountdown(); overlay.classList.remove('hidden'); statusText.textContent = 'Settings: use the lower control bar.';
  showInfoPanel(overlay, { title: 'Settings', body: 'Use the visible lower controls for sound, bot count, restart, and debug. Adventure progress is saved locally as you clear gates.', detail: `Current sound: ${soundSelect.value}. VS bot count: ${botSelect.value}. Fighter color and headwear are saved after customization.` });
}
function showCredits() {
  clearCountdown(); overlay.classList.remove('hidden'); statusText.textContent = 'Credits.';
  showInfoPanel(overlay, { title: 'Credits', body: 'Sefira Clash expands the existing combat engine instead of replacing it. VS remains a brawler; Adventure becomes a campaign path.', detail: 'B"H — Sparks, Kelipos, handmade gates, and every frame renewed from nothing by the Awtsmoos.' });
}
function showAdventureMenu() {
  choice.mode = 'adventure'; clearCountdown(); overlay.classList.remove('hidden'); statusText.textContent = 'Adventure Mode: clear gates to unlock more.';
  showAdventureGrid(overlay, { items: decorateAdventureMaps(ADVENTURE_MAPS, adventureProgress), onPick: item => beginCountdown(item, 'adventure') });
}
function beginCountdown(map = choice.map, mode = choice.mode) {
  clearCountdown(); choice.map = map; choice.mode = mode;
  const bots = mode === 'adventure' ? (map.adventure?.bots || 1) : Number(botSelect.value || 5);
  state = createGameState(choice.map, bots, choice.character, choice.cosmetic); state.phase = 'countdown'; state.mode = mode; overlay.classList.remove('hidden');
  let count = 3; showCountdown(overlay, count); statusText.textContent = `${choice.map.name}. ${profile.label} ready.`;
  countdownTimer = setInterval(() => { count--; count > 0 ? showCountdown(overlay, count) : launchGo(); }, 600);
}
function launchGo() { clearCountdown(); showCountdown(overlay, 'GO'); setTimeout(startMatch, 280); }
function startMatch() {
  overlay.classList.add('hidden'); state.phase = 'playing'; state.victoryShown = false; runStartedAt = performance.now();
  statusText.textContent = choice.mode === 'adventure' ? 'Adventure: collect sparks, stomp kelipos, clear the gate.' : 'Fight: aim, charge, slam, launch, recover.';
}
function frame() {
  if (state.phase === 'playing') { stepState(state, input.read()); const winner = winnerFor(state); if (winner && !state.victoryShown) enterVictory(winner); }
  draw(surface.ctx, state, canvas.clientWidth || innerWidth, canvas.clientHeight || innerHeight); presentRenderSurface(surface); requestAnimationFrame(frame);
}
function enterVictory(winner) {
  const list = choice.mode === 'adventure' ? ADVENTURE_MAPS : MAPS;
  let victoryRecord = null;
  if (choice.mode === 'adventure' && winner.human) victoryRecord = recordAdventureWin();
  const nextMapValue = nextStage(list, choice.map);
  state.phase = 'victory'; state.victoryShown = true; state.winner = winner.name; overlay.classList.remove('hidden'); overlay.classList.add('victoryOverlay'); statusText.textContent = `${winner.name} wins.`;
  showVictory(overlay, { winner, map: choice.map, nextMap: nextMapValue, mode: choice.mode === 'adventure' ? 'Adventure' : 'VS', best: victoryRecord?.best, stars: victoryRecord?.stars });
}
function recordAdventureWin() {
  const elapsed = Math.max(1000, performance.now() - runStartedAt);
  adventureProgress = recordAdventureClear(adventureProgress, ADVENTURE_MAPS, choice.map, elapsed);
  const record = adventureProgress.records[choice.map.id];
  return { best: record?.bestMs ? formatRecordTime(record.bestMs) : '—', stars: record?.stars || 0 };
}
function handleVictoryAction(action) {
  if (state.phase !== 'victory') return;
  if (action === 'next') { const list = choice.mode === 'adventure' ? ADVENTURE_MAPS : MAPS, map = nextStage(list, choice.map); if (map) beginCountdown(map, choice.mode); }
  else if (action === 'rematch') beginCountdown(choice.map, choice.mode); else if (action === 'menu') showMode();
}
function formatRecordTime(ms) { const total = Math.round(ms / 1000), minutes = Math.floor(total / 60), seconds = String(total % 60).padStart(2, '0'); return `${minutes}:${seconds}`; }
function clearCountdown() { if (countdownTimer) clearInterval(countdownTimer); countdownTimer = null; overlay.classList.remove('victoryOverlay'); }
restart.onclick = showMode;
botSelect.onchange = () => { if (choice.mode === 'vs' && (state.phase === 'playing' || state.phase === 'victory')) beginCountdown(choice.map, 'vs'); };
debug.onclick = () => { if (state) state.debug = !state.debug; };
addEventListener('resize', resize); addEventListener('orientationchange', () => setTimeout(resize, 140));
resize(); choice.cosmetic.ready ? showMode() : showCustomizeMenu(); requestAnimationFrame(frame);
