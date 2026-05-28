// B"H
import { LEVELS } from './data/levels.js';
import { InputVessel } from './core/input.js';
import { Renderer } from './core/renderer.js';
import { Game } from './core/game.js';
import { COIN_BREAKDOWN, levelUnlockCost, MARKET_SKINS, walletRows } from './systems/market.js';

/**
 * Awakens Sulam HaSod with a store that reveals the coin soul.
 *
 * The Awtsmoos lets the menu become a ledger of ascent: skins, wallet values,
 * and an expensive next-level unlock all live in one clear market chamber while
 * the level selector still shows exactly what is honestly open.
 */
function awakenSulamHaSod() {
  const ui = collectUi();
  const input = new InputVessel({ left: ui.left, right: ui.right, jump: ui.jump });
  const game = new Game({
    input,
    renderer: new Renderer(ui.canvas),
    hud: ui.hud,
    onProgress: instance => renderMenu(instance, ui),
    onLevelComplete: (done, next) => {
      ui.status.textContent = `Level ${done + 1} complete. Level ${next + 1} unlocked.`;
      ui.menu.classList.remove('off');
    }
  });

  ui.play.addEventListener('click', () => { ui.menu.classList.add('off'); game.newGame(); });
  ui.menuBtn.addEventListener('click', () => { game.pause(); renderMenu(game, ui); ui.menu.classList.remove('off'); });
  ui.instructionsBtn.addEventListener('click', () => { ui.instructions.hidden = !ui.instructions.hidden; });
  ui.levelsTab.addEventListener('click', () => ui.levelGrid.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  ui.shopTab.addEventListener('click', () => ui.shopGrid.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  ui.coinHelp.addEventListener('click', () => { ui.coinModal.hidden = false; });
  ui.coinClose.addEventListener('click', () => { ui.coinModal.hidden = true; });

  ui.levelGrid.addEventListener('click', event => {
    const button = event.target.closest('button[data-level]');
    if (!button || button.disabled) return;
    ui.menu.classList.add('off');
    game.chooseLevel(Number(button.dataset.level));
  });
  ui.shopGrid.addEventListener('click', event => {
    const button = event.target.closest('button[data-skin]');
    if (!button) return;
    const result = game.buyOrEquipSkin(button.dataset.skin);
    ui.status.textContent = result.message;
    renderMenu(game, ui);
  });
  ui.marketUnlock.addEventListener('click', () => {
    const result = game.buyNextLevel();
    ui.status.textContent = result.message;
    renderMenu(game, ui);
  });

  renderMenu(game, ui);
  game.renderer.draw(game.world);
  game.paintHud();
}

function collectUi() {
  return {
    menu: document.getElementById('menu'),
    status: document.getElementById('menuStatus'),
    play: document.getElementById('playBtn'),
    levelsTab: document.getElementById('levelsTab'),
    shopTab: document.getElementById('shopTab'),
    instructionsBtn: document.getElementById('instructionsBtn'),
    instructions: document.getElementById('instructions'),
    levelGrid: document.getElementById('levelGrid'),
    shopGrid: document.getElementById('shopGrid'),
    shopShefa: document.getElementById('shopShefa'),
    marketUnlock: document.getElementById('marketUnlock'),
    marketWallet: document.getElementById('marketWallet'),
    marketNext: document.getElementById('marketNext'),
    coinHelp: document.getElementById('coinHelpBtn'),
    coinModal: document.getElementById('coinModal'),
    coinClose: document.getElementById('coinClose'),
    menuBtn: document.getElementById('menuBtn'),
    canvas: document.getElementById('game'),
    left: document.getElementById('leftBtn'),
    right: document.getElementById('rightBtn'),
    jump: document.getElementById('jump'),
    hud: {
      level: document.getElementById('levelName'),
      stats: document.getElementById('stats'),
      progressFill: document.getElementById('progressFill'),
      progressText: document.getElementById('progressText'),
      difficulty: document.getElementById('difficulty'),
      coinRing: document.getElementById('coinRing'),
      coinText: document.getElementById('coinText'),
      keyBadge: document.getElementById('keyBadge'),
      shefaPills: document.getElementById('shefaPills')
    }
  };
}

function renderMenu(game, ui) {
  const { unlocked, currency, market } = game.progress.state;
  const next = Math.min(LEVELS.length, unlocked + 1);
  const cost = levelUnlockCost(next);
  const affordable = (currency.shefa || 0) >= cost;
  ui.play.textContent = game.index ? `Continue Level ${game.index + 1}` : 'Enter Level 1';
  ui.shopShefa.textContent = `Spendable Shefa ${currency.shefa || 0} · Owned ${(market.owned || []).length}/${MARKET_SKINS.length}`;
  ui.marketWallet.innerHTML = walletRows(currency).map(row => `<span class="walletRow ${row.key}"><i>${row.short}</i><b>${row.count}</b><em>${row.label}</em><small>${row.worth} each · ${row.note}</small></span>`).join('');
  ui.marketNext.textContent = unlocked >= LEVELS.length ? 'All chambers are open.' : `Next paid unlock: Level ${next} · ${cost} Shefa`;
  ui.marketUnlock.disabled = unlocked >= LEVELS.length || !affordable;
  ui.marketUnlock.textContent = unlocked >= LEVELS.length ? 'All levels open' : affordable ? `Unlock Level ${next}` : `Need ${cost} Shefa`;
  renderLevels(game, ui, unlocked);
  renderSkins(ui, currency, market);
}

function renderLevels(game, ui, unlocked) {
  ui.levelGrid.innerHTML = LEVELS.map((level, index) => {
    const open = index < unlocked;
    const current = index === game.index;
    return `<button class="levelCard ${current ? 'current' : ''}" data-level="${index}" ${open ? '' : 'disabled'}><b>${index + 1}</b><span>${level.name.replace(/^\d+ · /, '')}</span><em>${open ? (current ? 'Current' : 'Unlocked') : 'Locked'}</em></button>`;
  }).join('');
}

function renderSkins(ui, currency, market) {
  ui.shopGrid.innerHTML = MARKET_SKINS.map(skin => {
    const owned = (market.owned || ['plain']).includes(skin.id);
    const equipped = market.equipped === skin.id;
    const afford = (currency.shefa || 0) >= skin.cost;
    return `<article class="skinCard ${equipped ? 'equipped' : ''}"><i style="--body:${skin.body};--trim:${skin.trim};--cap:${skin.kippah}"></i><b>${skin.name}</b><span>${skin.note}</span><em>${owned ? 'Owned' : `${skin.cost} Shefa`}</em><button data-skin="${skin.id}" ${!owned && !afford ? 'disabled' : ''}>${equipped ? 'Equipped' : owned ? 'Equip' : 'Buy'}</button></article>`;
  }).join('');
}

awakenSulamHaSod();
