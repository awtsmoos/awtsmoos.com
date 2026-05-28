// B"H
import { LEVELS } from './data/levels.js';
import { InputVessel } from './core/input.js';
import { Renderer } from './core/renderer.js';
import { Game } from './core/game.js';
import { WebcamBubble } from './systems/webcamBubble.js';
import { levelUnlockCost, MARKET_SKINS, walletRows } from './systems/market.js';

/**
 * Awakens Sulam HaSod with market, actions, fullscreen, and webcam bubble.
 *
 * The Awtsmoos gives the player an actions menu, but the camera remains sealed
 * until a click asks for it. The webcam request is video-only, then its buffered
 * circle becomes a small crown above the player rather than a separate feed.
 */
function awakenSulamHaSod() {
  const ui = collectUi();
  const webcam = new WebcamBubble();
  const input = new InputVessel({ left: ui.left, right: ui.right, jump: ui.jump });
  const game = new Game({ input, renderer: new Renderer(ui.canvas, { webcam }), hud: ui.hud,
    onProgress: instance => renderMenu(instance, ui),
    onLevelComplete: (done, next) => {
      ui.status.textContent = `Level ${done + 1} complete. Level ${next + 1} unlocked.`;
      ui.menu.classList.remove('off');
    }
  });

  ui.play.addEventListener('click', () => { ui.menu.classList.add('off'); game.newGame(); });
  ui.menuBtn.addEventListener('click', () => { game.pause(); renderMenu(game, ui); ui.menu.classList.remove('off'); });
  ui.actionsBtn.addEventListener('click', () => toggleActions(ui));
  ui.fullscreenBtn.addEventListener('click', () => requestFullscreen(ui));
  ui.webcamBtn.addEventListener('click', () => toggleWebcam(ui, webcam));
  ui.instructionsBtn.addEventListener('click', () => { ui.instructions.hidden = !ui.instructions.hidden; });
  ui.levelsTab.addEventListener('click', () => ui.levelGrid.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  ui.shopTab.addEventListener('click', () => ui.shopGrid.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  ui.coinHelp.addEventListener('click', () => { ui.coinModal.hidden = false; });
  ui.coinClose.addEventListener('click', () => { ui.coinModal.hidden = true; });
  ui.levelGrid.addEventListener('click', event => chooseLevel(event, game, ui));
  ui.shopGrid.addEventListener('click', event => buySkin(event, game, ui));
  ui.marketUnlock.addEventListener('click', () => buyForbiddenGate(game, ui));
  document.addEventListener('click', event => closeActionsFromOutside(event, ui));
  document.addEventListener('fullscreenchange', () => refreshFullscreenLabel(ui));
  renderMenu(game, ui);
  refreshWebcamLabel(ui, webcam);
  refreshFullscreenLabel(ui);
  game.renderer.draw(game.world);
  game.paintHud();
}

function collectUi() {
  return {
    menu: document.getElementById('menu'), status: document.getElementById('menuStatus'), play: document.getElementById('playBtn'),
    levelsTab: document.getElementById('levelsTab'), shopTab: document.getElementById('shopTab'), instructionsBtn: document.getElementById('instructionsBtn'),
    instructions: document.getElementById('instructions'), levelGrid: document.getElementById('levelGrid'), shopGrid: document.getElementById('shopGrid'),
    shopShefa: document.getElementById('shopShefa'), marketUnlock: document.getElementById('marketUnlock'), marketWallet: document.getElementById('marketWallet'),
    marketNext: document.getElementById('marketNext'), coinHelp: document.getElementById('coinHelpBtn'), coinModal: document.getElementById('coinModal'),
    coinClose: document.getElementById('coinClose'), menuBtn: document.getElementById('menuBtn'), actionsBtn: document.getElementById('actionsBtn'),
    actionsMenu: document.getElementById('actionsMenu'), fullscreenBtn: document.getElementById('fullscreenBtn'), webcamBtn: document.getElementById('webcamBtn'),
    canvas: document.getElementById('game'), left: document.getElementById('leftBtn'), right: document.getElementById('rightBtn'), jump: document.getElementById('jump'),
    hud: { level: document.getElementById('levelName'), stats: document.getElementById('stats'), progressFill: document.getElementById('progressFill'),
      progressText: document.getElementById('progressText'), difficulty: document.getElementById('difficulty'), coinRing: document.getElementById('coinRing'),
      coinText: document.getElementById('coinText'), keyBadge: document.getElementById('keyBadge'), shefaPills: document.getElementById('shefaPills') }
  };
}

function toggleActions(ui) {
  const next = !ui.actionsMenu.hidden;
  ui.actionsMenu.hidden = next;
  ui.actionsBtn.setAttribute('aria-expanded', String(!next));
}

function closeActionsFromOutside(event, ui) {
  if (ui.actionsMenu.hidden) return;
  if (event.target.closest?.('#actionsMenu,#actionsBtn')) return;
  ui.actionsMenu.hidden = true;
  ui.actionsBtn.setAttribute('aria-expanded', 'false');
}

async function requestFullscreen(ui) {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.querySelector('.shell')?.requestFullscreen?.();
  } catch (error) {
    ui.status.textContent = error?.message || 'Fullscreen is unavailable.';
  }
  refreshFullscreenLabel(ui);
}

function refreshFullscreenLabel(ui) {
  ui.fullscreenBtn.textContent = document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen';
}

async function toggleWebcam(ui, webcam) {
  ui.webcamBtn.disabled = true;
  ui.status.textContent = 'Webcam bubble asks for video only…';
  const result = await webcam.toggle();
  ui.status.textContent = result.message;
  refreshWebcamLabel(ui, webcam);
  ui.webcamBtn.disabled = false;
}

function refreshWebcamLabel(ui, webcam) {
  ui.webcamBtn.textContent = webcam.label();
}

function chooseLevel(event, game, ui) {
  const button = event.target.closest('button[data-level]');
  if (!button || button.disabled) return;
  ui.menu.classList.add('off');
  game.chooseLevel(Number(button.dataset.level));
}

function buySkin(event, game, ui) {
  const button = event.target.closest('button[data-skin]');
  if (!button) return;
  const result = game.buyOrEquipSkin(button.dataset.skin);
  ui.status.textContent = result.message;
  renderMenu(game, ui);
}

function buyForbiddenGate(game, ui) {
  const result = game.buyNextLevel();
  ui.status.textContent = result.message;
  renderMenu(game, ui);
}

function renderMenu(game, ui) {
  const { unlocked, currency, market } = game.progress.state;
  const next = Math.min(LEVELS.length, unlocked + 1);
  const cost = levelUnlockCost(next);
  const affordable = (currency.shefa || 0) >= cost;
  ui.play.textContent = game.index ? `Continue Level ${game.index + 1}` : 'Enter Level 1';
  ui.shopShefa.textContent = `Shefa ${currency.shefa || 0} · Items ${(market.owned || []).length}/${MARKET_SKINS.length}`;
  ui.marketWallet.innerHTML = walletRows(currency).map(walletRow).join('');
  ui.marketNext.textContent = unlocked >= LEVELS.length ? 'All chambers are open.' : `Forbidden Gate: Level ${next} · ${cost} Shefa`;
  ui.marketUnlock.disabled = unlocked >= LEVELS.length || !affordable;
  ui.marketUnlock.textContent = unlocked >= LEVELS.length ? 'All gates bribed' : affordable ? `Bribe Level ${next}` : `Need ${cost} Shefa`;
  renderLevels(game, ui, unlocked);
  renderSkins(ui, currency, market);
}

function walletRow(row) {
  const conversion = row.key === 'shefa' ? 'spendable now' : `${row.total} Shefa value`;
  return `<span class="walletRow ${row.key}"><i>${row.short}</i><b>${row.count}</b><em>${row.label}</em><small>${row.worth} each · ${conversion}<br>${row.note}</small></span>`;
}

function renderLevels(game, ui, unlocked) {
  ui.levelGrid.innerHTML = LEVELS.map((level, index) => {
    const open = index < unlocked;
    const current = index === game.index;
    const nextCost = levelUnlockCost(index + 1);
    return `<button class="levelCard ${current ? 'current' : ''}" data-level="${index}" ${open ? '' : 'disabled'}><b>${index + 1}</b><span>${level.name.replace(/^\d+ · /, '')}</span><em>${open ? (current ? 'Current' : 'Unlocked') : `Locked · ${nextCost} Shefa`}</em></button>`;
  }).join('');
}

function renderSkins(ui, currency, market) {
  ui.shopGrid.innerHTML = MARKET_SKINS.map(skin => {
    const owned = (market.owned || ['plain']).includes(skin.id);
    const equipped = market.equipped === skin.id;
    const afford = (currency.shefa || 0) >= skin.cost;
    return `<article class="skinCard ${equipped ? 'equipped' : ''}" data-slot="${skin.slot}"><i style="--body:${skin.body};--trim:${skin.trim};--cap:${skin.kippah}"></i><b>${skin.name}</b><strong>${skin.slot}</strong><span>${skin.note}</span><em>${owned ? 'Owned' : `${skin.cost} Shefa`}</em><button data-skin="${skin.id}" ${!owned && !afford ? 'disabled' : ''}>${equipped ? 'Equipped' : owned ? 'Equip' : 'Buy'}</button></article>`;
  }).join('');
}

awakenSulamHaSod();
