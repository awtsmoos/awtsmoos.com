import { forge, reveal } from './domForge.js';
import { colors, hatIcon, headwearOptions } from './menuOptions.js';

/**
 * B"H
 * Fighter customization stays as a single calm chamber before the storm.
 *
 * The Awtsmoos lets the player pick identity once, then the menu stops looping
 * them through decorative confusion. The view is small on purpose: color,
 * headwear, continue. Three acts, one vessel.
 *
 * @param {Element} host - Overlay container.
 * @param {object} config - Cosmetic state and callbacks.
 */
export function showSingleStart(host, config) {
  reveal(host, { tag: 'section', attrs: { class: 'menuPanel customizePanel' }, children: [
    { tag: 'p', attrs: { class: 'menuEyebrow' }, children: ['fighter vessel'] },
    { tag: 'h2', children: ['Your Fighter'] },
    { tag: 'p', attrs: { class: 'menuPoem' }, children: ['Pick the look once. Then the simple gate screen opens.'] },
    preview(config.cosmetic),
    { tag: 'h3', children: ['Color'] },
    { tag: 'div', attrs: { class: 'colorGrid' }, children: colors().map(item => colorOption(item, config.cosmetic.hue, config.onHue)) },
    { tag: 'h3', children: ['Headwear'] },
    { tag: 'div', attrs: { class: 'optionGrid hatGrid' }, children: headwearOptions().map(item => hatOption(item, config.cosmetic.headwear, config.onHeadwear)) },
    { tag: 'button', attrs: { class: 'primaryMenuButton', type: 'button', 'data-customize-action': 'continue' }, children: ['Open Gates'] }
  ] });
}

function preview(cosmetic) {
  return { tag: 'div', attrs: { class: 'fighterPreview', style: `--chosen:${cosmetic.hue}` }, children: [
    { tag: 'span', attrs: { class: `previewHead ${cosmetic.headwear}` }, children: [hatIcon(cosmetic.headwear)] },
    { tag: 'strong', children: ['Sefira Fighter'] },
    { tag: 'small', children: ['Saved for Adventure and VS'] }
  ] };
}

function colorOption(item, active, onPick) {
  return forge({ tag: 'button', attrs: { class: `colorButton ${active === item.hue ? 'active' : ''}`, type: 'button', style: `--h:${item.hue}` }, on: { click: () => onPick(item.hue) }, children: [{ tag: 'span' }, { tag: 'strong', children: [item.label] }] });
}

function hatOption(item, active, onPick) {
  return forge({ tag: 'button', attrs: { class: `optionButton ${active === item.id ? 'active' : ''}`, type: 'button' }, on: { click: () => onPick(item.id) }, children: [{ tag: 'span', children: [item.icon] }, { tag: 'strong', children: [item.label] }] });
}
