import { forge, reveal } from './domForge.js';

/**
 * B"H
 * Menu, customization, mode choice, adventure grid, and victory views.
 *
 * Chapter 311: Settings and Credits stop masquerading as shortcuts. The menu
 * becomes four honest doors: VS, Adventure, Settings, Credits.
 */
export function showModeMenu(host, config) {
  reveal(host, { tag: 'section', attrs: { class: 'menuPanel modePanel' }, children: [
    { tag: 'h2', children: ['Sefira Clash'] },
    { tag: 'p', attrs: { class: 'menuPoem' }, children: ['Choose a path. VS is instant combat. Adventure is a fifty-gate climb with unlocks, best times, stars, and hidden Sparks.'] },
    { tag: 'div', attrs: { class: 'modeGrid' }, children: [
      modeCard('VS Mode', 'Pick an arena and fight bots right away.', 'vs', 45, config.onPick),
      modeCard('Adventure', 'Clear handcrafted stages one gate at a time.', 'adventure', 182, config.onPick),
      modeCard('Settings', 'Sound, bot count, restart, and debug controls.', 'settings', 262, config.onPick),
      modeCard('Credits', 'A tiny brawler vessel made for the Awtsmoos.', 'credits', 314, config.onPick)
    ] },
    { tag: 'button', attrs: { class: 'backMenuButton', type: 'button', 'data-customize-action': 'back' }, children: ['Change Fighter'] }
  ] });
}

export function showInfoPanel(host, config) {
  reveal(host, { tag: 'section', attrs: { class: 'menuPanel infoPanel' }, children: [
    { tag: 'button', attrs: { class: 'backMenuButton', type: 'button', 'data-menu-back': 'mode' }, children: ['← Modes'] },
    { tag: 'h2', children: [config.title] },
    { tag: 'p', attrs: { class: 'menuPoem' }, children: [config.body] },
    { tag: 'div', attrs: { class: 'instructionBox' }, children: [config.detail] }
  ] });
}

export function showSingleStart(host, config) {
  reveal(host, { tag: 'section', attrs: { class: 'menuPanel customizePanel' }, children: [
    { tag: 'h2', children: ['Your Fighter'] },
    { tag: 'p', attrs: { class: 'menuPoem' }, children: ['Choose color and headwear once. Then the simple mode screen opens.'] },
    { tag: 'div', attrs: { class: 'fighterPreview', style: `--chosen:${config.cosmetic.hue}` }, children: [
      { tag: 'span', attrs: { class: `previewHead ${config.cosmetic.headwear}` }, children: [hatIcon(config.cosmetic.headwear)] },
      { tag: 'strong', children: ['Sefira Fighter'] }, { tag: 'small', children: ['Your consistent arena vessel'] }
    ] },
    { tag: 'h3', children: ['Color'] },
    { tag: 'div', attrs: { class: 'colorGrid' }, children: colors().map(item => colorOption(item, config.cosmetic.hue, config.onHue)) },
    { tag: 'h3', children: ['Headwear'] },
    { tag: 'div', attrs: { class: 'optionGrid hatGrid' }, children: headwearOptions().map(item => option(item, config.cosmetic.headwear, config.onHeadwear)) },
    { tag: 'button', attrs: { class: 'primaryMenuButton', type: 'button', 'data-customize-action': 'continue' }, children: ['Continue'] }
  ] });
}

export function showCardGrid(host, config) {
  reveal(host, { tag: 'section', attrs: { class: 'menuPanel' }, children: [
    { tag: 'button', attrs: { class: 'backMenuButton', type: 'button', 'data-menu-back': 'mode' }, children: ['← Modes'] },
    { tag: 'h2', children: [config.title] }, { tag: 'p', attrs: { class: 'menuPoem' }, children: [config.subtitle] },
    { tag: 'div', attrs: { class: 'instructionBox' }, children: ['Move: joystick · Aim while releasing 👊/🦵 · Down on landing slams · Hold to charge'] },
    { tag: 'div', attrs: { class: 'cardGrid' }, children: config.items.map(item => card(item, config.onPick)) }
  ] });
}

export function showAdventureGrid(host, config) {
  const cleared = config.items.filter(item => item.adventureUi?.cleared).length;
  reveal(host, { tag: 'section', attrs: { class: 'menuPanel adventurePanel' }, children: [
    { tag: 'button', attrs: { class: 'backMenuButton', type: 'button', 'data-menu-back': 'mode' }, children: ['← Modes'] },
    { tag: 'h2', children: ['Adventure'] },
    { tag: 'p', attrs: { class: 'menuPoem' }, children: [`${cleared}/50 gates cleared. Sparks replace mushrooms; Kelipah rivals patrol like shells; stomp, climb, unlock, and master.`] },
    { tag: 'div', attrs: { class: 'levelGrid' }, children: config.items.map(item => levelCard(item, config.onPick)) }
  ] });
}

export function showCountdown(host, value) {
  reveal(host, { tag: 'section', attrs: { class: 'countdownPanel' }, children: [{ tag: 'div', attrs: { class: 'countdownNumber' }, children: [String(value)] }, { tag: 'p', children: ['Charge, aim, slam, stomp, launch.'] }] });
}

export function showVictory(host, config) {
  const humanWon = config.winner?.human;
  reveal(host, { tag: 'section', attrs: { class: `victoryPanel ${humanWon ? 'humanWin' : 'botWin'}` }, children: [
    { tag: 'div', attrs: { class: 'victoryBurst' }, children: ['✦'] }, { tag: 'p', attrs: { class: 'victoryEyebrow' }, children: [humanWon ? 'Stage Cleared' : 'Defeat Confirmed'] },
    { tag: 'h2', children: [`${config.winner?.name || 'Unknown'} wins`] }, { tag: 'p', attrs: { class: 'victoryPoem' }, children: [humanWon ? `Best ${config.best || '—'} · ${config.stars || 0}★` : 'Return, rematch, or climb again.'] },
    { tag: 'div', attrs: { class: 'victoryStats' }, children: [stat('Mode', config.mode || 'VS'), stat('Arena', config.map?.name || 'Unknown'), stat('Next', config.nextMap?.name || 'Final chamber')] },
    { tag: 'div', attrs: { class: 'victoryActions' }, children: [action('Next Stage', 'next', !config.nextMap), action('Rematch', 'rematch', false), action('Modes', 'menu', false)] }
  ] });
}

function modeCard(title, text, kind, hue, onPick) { return forge({ tag: 'button', attrs: { class: 'modeCard', type: 'button' }, on: { click: () => onPick(kind) }, children: [{ tag: 'span', attrs: { class: 'cardAura', style: `--h:${hue}` } }, { tag: 'strong', children: [title] }, { tag: 'small', children: [text] }, { tag: 'em', children: ['Enter'] }] }); }
function levelCard(item, onPick) { const ui = item.adventureUi || {}; return forge({ tag: 'button', attrs: { class: `levelCard ${ui.locked ? 'locked' : ''} ${ui.cleared ? 'cleared' : ''}`, type: 'button', disabled: ui.locked ? true : null }, on: { click: () => !ui.locked && onPick(item) }, children: [{ tag: 'span', attrs: { class: 'cardAura', style: `--h:${item.hue || 45}` } }, { tag: 'strong', children: [`${(ui.index || 0) + 1}. ${item.name}`] }, { tag: 'small', children: [ui.locked ? 'Locked: clear the previous gate.' : item.description] }, { tag: 'div', attrs: { class: 'levelMeta' }, children: [{ tag: 'span', children: [item.difficulty || 'Easy'] }, { tag: 'span', children: [`${item.adventure?.bots || 1} kelipos`] }, { tag: 'span', children: [`${ui.stars || 0}★`] }, { tag: 'span', children: [`Best ${ui.best || '—'}`] }, { tag: 'span', children: [`✦ ${ui.hiddenFound || 0}/${ui.hiddenTotal || 0}`] }] }] }); }
function colors() { return [{ hue: 182, label: 'Cyan' }, { hue: 112, label: 'Green' }, { hue: 45, label: 'Gold' }, { hue: 262, label: 'Blue' }, { hue: 314, label: 'Rose' }, { hue: 18, label: 'Ember' }]; }
function headwearOptions() { return [{ id: 'kippah', label: 'Yarmulke', icon: '◓' }, { id: 'blackhat', label: 'Black Hat', icon: '▔' }, { id: 'tophat', label: 'Top Hat', icon: '🎩' }, { id: 'cap', label: 'Cap', icon: '🧢' }, { id: 'beanie', label: 'Beanie', icon: '◒' }, { id: 'crown', label: 'Crown', icon: '♛' }, { id: 'helmet', label: 'Helmet', icon: '⛑' }, { id: 'turban', label: 'Wrap', icon: '◉' }]; }
function colorOption(item, active, onPick) { return forge({ tag: 'button', attrs: { class: `colorButton ${active === item.hue ? 'active' : ''}`, type: 'button', style: `--h:${item.hue}` }, on: { click: () => onPick(item.hue) }, children: [{ tag: 'span' }, { tag: 'strong', children: [item.label] }] }); }
function option(item, active, onPick) { return forge({ tag: 'button', attrs: { class: `optionButton ${active === item.id ? 'active' : ''}`, type: 'button' }, on: { click: () => onPick(item.id) }, children: [{ tag: 'span', children: [item.icon] }, { tag: 'strong', children: [item.label] }] }); }
export function hatIcon(id) { const found = headwearOptions().find(item => item.id === id); return found?.icon || '◓'; }
function stat(label, value) { return { tag: 'span', children: [{ tag: 'strong', children: [label] }, { tag: 'em', children: [value] }] }; }
function action(label, kind, disabled) { return { tag: 'button', attrs: { class: `victoryButton ${kind}`, type: 'button', 'data-victory-action': kind, disabled: disabled ? true : null }, children: [label] }; }
function card(item, onPick) { return forge({ tag: 'button', attrs: { class: 'menuCard', type: 'button' }, on: { click: () => onPick(item) }, children: [{ tag: 'span', attrs: { class: 'cardAura', style: `--h:${item.hue || 45}` } }, { tag: 'strong', children: [item.name] }, { tag: 'small', children: [item.role || item.description || 'Arena vessel'] }, { tag: 'em', children: ['Select'] }] }); }
