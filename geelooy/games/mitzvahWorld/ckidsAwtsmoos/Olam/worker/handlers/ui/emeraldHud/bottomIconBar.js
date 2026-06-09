// B"H
/** @file bottomIconBar.js @description Chapter 417: Bottom icon bar like the concept screenshot. */
const ICONS = ['✦', '🗺', '📜', '🎒', '⚙'];
export function bottomIconBar(labels = []) { return `<nav class="ehud-bottom">${labels.map((label, i) => `<div class="ehud-icon"><span>${ICONS[i] || '✦'}<br>${label}</span></div>`).join('')}</nav>`; }
