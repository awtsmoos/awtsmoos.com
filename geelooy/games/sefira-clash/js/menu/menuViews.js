import { forge, reveal } from './domForge.js';

/**
 * B"H
 * Menu, customization, and victory views.
 *
 * Chapter 138: the first customization is mandatory once, then the player is
 * remembered. The hat cabinet opens wide: kippah, black hat, cap, top hat,
 * beanie, crown, helmet, and more visible choices.
 */
export function showSingleStart(host, config) {
  reveal(host, { tag: 'section', attrs: { class: 'menuPanel customizePanel' }, children: [
    { tag: 'h2', children: ['Your Fighter'] },
    { tag: 'p', attrs: { class: 'menuPoem' }, children: ['Choose color and headwear. This same fighter stays with you every match.'] },
    { tag: 'div', attrs: { class: 'fighterPreview', style: `--chosen:${config.cosmetic.hue}` }, children: [
      { tag: 'span', attrs: { class: `previewHead ${config.cosmetic.headwear}` }, children: [hatIcon(config.cosmetic.headwear)] },
      { tag: 'strong', children: ['Sefira Fighter'] },
      { tag: 'small', children: ['Your one consistent arena vessel'] }
    ] },
    { tag: 'h3', children: ['Color'] },
    { tag: 'div', attrs: { class: 'colorGrid' }, children: colors().map(item => colorOption(item, config.cosmetic.hue, config.onHue)) },
    { tag: 'h3', children: ['Headwear'] },
    { tag: 'div', attrs: { class: 'optionGrid hatGrid' }, children: headwearOptions().map(item => option(item, config.cosmetic.headwear, config.onHeadwear)) },
    { tag: 'button', attrs: { class: 'primaryMenuButton', type: 'button', 'data-customize-action': 'continue' }, children: ['Continue to Stage Select'] }
  ] });
}

export function showCardGrid(host, config) {
  reveal(host, { tag: 'section', attrs: { class: 'menuPanel' }, children: [
    { tag: 'h2', children: [config.title] },
    { tag: 'p', attrs: { class: 'menuPoem' }, children: [config.subtitle] },
    { tag: 'div', attrs: { class: 'instructionBox' }, children: ['Move: joystick · Aim while releasing 👊/🦵 · Down on landing slams · Hold to charge'] },
    { tag: 'div', attrs: { class: 'cardGrid' }, children: config.items.map(item => card(item, config.onPick)) }
  ] });
}

export function showCountdown(host, value) {
  reveal(host, { tag: 'section', attrs: { class: 'countdownPanel' }, children: [
    { tag: 'div', attrs: { class: 'countdownNumber' }, children: [String(value)] },
    { tag: 'p', children: ['Charge, aim, slam, stomp, launch.'] }
  ] });
}

export function showVictory(host, config) {
  const humanWon = config.winner?.human;
  reveal(host, { tag: 'section', attrs: { class: `victoryPanel ${humanWon ? 'humanWin' : 'botWin'}` }, children: [
    { tag: 'div', attrs: { class: 'victoryBurst' }, children: ['✦'] },
    { tag: 'p', attrs: { class: 'victoryEyebrow' }, children: [humanWon ? 'Stage Cleared' : 'Defeat Confirmed'] },
    { tag: 'h2', children: [`${config.winner?.name || 'Unknown'} wins`] },
    { tag: 'p', attrs: { class: 'victoryPoem' }, children: [humanWon ? 'The next gate opens.' : 'Return, rematch, or climb anyway.'] },
    { tag: 'div', attrs: { class: 'victoryStats' }, children: [stat('Arena', config.map?.name || 'Unknown'), stat('Next', config.nextMap?.name || 'Final chamber'), stat('Stocks', String(config.winner?.stocks ?? 0))] },
    { tag: 'div', attrs: { class: 'victoryActions' }, children: [action('Next Stage', 'next', !config.nextMap), action('Rematch', 'rematch', false), action('Back to Menu', 'menu', false)] }
  ] });
}

function colors() {
  return [{ hue: 182, label: 'Cyan' }, { hue: 112, label: 'Green' }, { hue: 45, label: 'Gold' }, { hue: 262, label: 'Blue' }, { hue: 314, label: 'Rose' }, { hue: 18, label: 'Ember' }];
}

function headwearOptions() {
  return [
    { id: 'kippah', label: 'Yarmulke', icon: '◓' }, { id: 'blackhat', label: 'Black Hat', icon: '▔' },
    { id: 'tophat', label: 'Top Hat', icon: '🎩' }, { id: 'cap', label: 'Cap', icon: '🧢' },
    { id: 'beanie', label: 'Beanie', icon: '◒' }, { id: 'crown', label: 'Crown', icon: '♛' },
    { id: 'helmet', label: 'Helmet', icon: '⛑' }, { id: 'turban', label: 'Wrap', icon: '◉' }
  ];
}

function colorOption(item, active, onPick) {
  return forge({ tag: 'button', attrs: { class: `colorButton ${active === item.hue ? 'active' : ''}`, type: 'button', style: `--h:${item.hue}` }, on: { click: () => onPick(item.hue) }, children: [{ tag: 'span' }, { tag: 'strong', children: [item.label] }] });
}

function option(item, active, onPick) {
  return forge({ tag: 'button', attrs: { class: `optionButton ${active === item.id ? 'active' : ''}`, type: 'button' }, on: { click: () => onPick(item.id) }, children: [{ tag: 'span', children: [item.icon] }, { tag: 'strong', children: [item.label] }] });
}

export function hatIcon(id) {
  const found = headwearOptions().find(item => item.id === id);
  return found?.icon || '◓';
}

function stat(label, value) { return { tag: 'span', children: [{ tag: 'strong', children: [label] }, { tag: 'em', children: [value] }] }; }
function action(label, kind, disabled) { return { tag: 'button', attrs: { class: `victoryButton ${kind}`, type: 'button', 'data-victory-action': kind, disabled: disabled ? true : null }, children: [label] }; }
function card(item, onPick) { return forge({ tag: 'button', attrs: { class: 'menuCard', type: 'button' }, on: { click: () => onPick(item) }, children: [{ tag: 'span', attrs: { class: 'cardAura', style: `--h:${item.hue || 45}` } }, { tag: 'strong', children: [item.name] }, { tag: 'small', children: [item.role || item.description || 'Generated arena vessel'] }, { tag: 'em', children: ['Select'] }] }); }
