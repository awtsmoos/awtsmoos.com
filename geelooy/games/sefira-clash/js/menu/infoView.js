import { reveal } from './domForge.js';

/**
 * B"H
 * Small information chambers.
 *
 * Settings and Credits are not labyrinths. The Awtsmoos makes them readable,
 * bounded, and easy to escape. A player enters, learns, returns.
 *
 * @param {Element} host - Overlay container.
 * @param {{title: string, body: string, detail: string}} config - Copy to show.
 */
export function showInfoPanel(host, config) {
  reveal(host, { tag: 'section', attrs: { class: 'menuPanel infoPanel' }, children: [
    { tag: 'button', attrs: { class: 'backMenuButton', type: 'button', 'data-menu-back': 'mode' }, children: ['← Gates'] },
    { tag: 'p', attrs: { class: 'menuEyebrow' }, children: ['info'] },
    { tag: 'h2', children: [config.title] },
    { tag: 'p', attrs: { class: 'menuPoem' }, children: [config.body] },
    { tag: 'div', attrs: { class: 'instructionBox' }, children: [config.detail] }
  ] });
}
