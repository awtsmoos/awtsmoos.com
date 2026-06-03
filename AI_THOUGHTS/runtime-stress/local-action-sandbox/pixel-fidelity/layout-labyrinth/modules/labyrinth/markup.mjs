// B"H
import { labyrinthCss } from './styles.mjs';
import { clientScript } from './script.mjs';

/**
 * The labyrinth markup is a city of nested vessels. Each section is small, but
 * the whole map screams: depth, layout, overflow, SVG, WebGL, transforms, UI.
 */
export function html() {
  return `<!doctype html><html><head><style>${labyrinthCss()}</style></head><body><main class="lab"><header class="bar"><b>LAYOUT LABYRINTH</b><span>GRID / FLEX / SVG / WEBGL / OVERFLOW / TRANSFORMS / REAL UI</span></header><section class="panel maze">${levels()}</section><aside class="panel side">${side()}</aside><script>${clientScript()}</script></main></body></html>`;
}

function levels() {
  return [level0(), level1(), level2(), level3(), level4()].join('');
}

function shell(depth, label, body) {
  return `<section class="level"><div class="label">D${depth}<br>${label}</div>${body}</section>`;
}

function level0() {
  return shell(0, 'GRID 3', `<div class="grid3">${cell('l0a')}${cell('l0b')}${cell('l0c')}</div>`);
}

function level1() {
  return shell(1, 'FLEX+GRID', `<div class="flexRow">${cell('l1a')}<div class="cell"><div class="deep">${cell('l1b')}${cell('l1c')}</div></div>${cell('l1d')}</div>`);
}

function level2() {
  return shell(2, 'FR+COL', `<div class="grid4">${cell('l2a')}<div class="cell"><div class="flexCol">${cell('l2b')}${cell('l2c')}</div></div>${cell('l2d')}${cell('l2e')}</div>`);
}

function level3() {
  return shell(3, 'OVERFLOW', `<div class="flexRow overflowRow"><div class="cell clipper"><canvas id="ov0" width="110" height="34"></canvas><div class="slab"></div></div><div class="cell scrollY"><canvas id="ov1" width="110" height="34"></canvas><div class="slab"></div></div><div class="cell scrollX"><canvas id="ov2" width="110" height="34"></canvas><div class="slab"></div></div><div class="cell autoBoth"><canvas id="ov3" width="110" height="34"></canvas><div class="slab"></div></div></div>`);
}

function level4() {
  return shell(4, 'REAL UI', `<div class="realUi"><div class="sidebar"></div><div class="cards"><div></div><div></div><div></div><div></div></div></div>`);
}

function cell(id) {
  return `<div class="cell"><canvas id="${id}" width="110" height="58"></canvas></div>`;
}

function side() {
  return `${webgl()}${svg()}${matrix()}${miniCorpus()}`;
}

function webgl() {
  return `<section class="web"><b>WEBGL STATE CUBE</b><canvas id="labgl" width="260" height="128"></canvas></section>`;
}

function svg() {
  return `<section class="svgbox"><b>SVG TORTURE</b><svg viewBox="0 0 240 100"><rect x="8" y="8" width="224" height="84" fill="#08162a" stroke="#00d9ff" stroke-width="4"/><linearGradient id="g"><stop offset="0" stop-color="red"/><stop offset="1" stop-color="cyan"/></linearGradient><circle cx="44" cy="52" r="19" fill="magenta"/><rect x="76" y="25" width="38" height="48" fill="url(#g)" stroke="white" stroke-width="3"/><path d="M130 82 C142 8 190 8 208 82" fill="none" stroke="yellow" stroke-width="7"/><text x="124" y="55" fill="white" font-size="15">SVG</text></svg></section>`;
}

function matrix() {
  return `<section class="matrix"><div class="r xformA"></div><div class="c xformB"></div><div class="y xformC"></div></section>`;
}

function miniCorpus() {
  return `<section class="level"><div class="label">UI<br>CORPUS</div><div class="grid3">${cell('ui0')}${cell('ui1')}${cell('ui2')}</div></section>`;
}
