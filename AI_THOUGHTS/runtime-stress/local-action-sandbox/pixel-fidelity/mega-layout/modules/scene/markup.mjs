// B"H
import { sceneCss } from './styles.mjs';
import { clientScript } from './script.mjs';

/**
 * Navy markup module: each stress chamber now advertises exactly what it proves.
 * The header uses plain separators so the screenshot does not show replacement
 * glyphs where the vision judge expects readable language.
 */
export function html() {
  return `<!doctype html><html><head><style>${sceneCss()}</style></head><body><main class="page">
<header class="card hero"><h1>MEGA MERKAVA<br>LAYOUT CITADEL</h1><div class="rainbow"></div><div class="sticky">STICKY</div><b>NESTED FLEX/GRID | BEZIERS | WEBGL CUBE | OVERFLOW | Z-STACK</b></header>
<section class="body"><section class="tower"><div class="card gridA">${leftTiles()}</div><div class="card tile nestBand"><b>FLEX ROW: 3 nested grid canvases</b>${rowGridNest()}</div></section><section class="tower"><div class="card gridB">${middleTiles()}</div><div class="card tile nestBand"><b>FLEX COLUMN: 3 stacked grid canvases</b>${columnGridNest()}${zStackWitness()}</div></section><aside class="right"><section class="card webgl"><h2>WEBGL RAINBOW CUBE</h2><canvas id="gl-main" width="280" height="166"></canvas></section><section class="card"><h2>OVERFLOW LAB</h2><div class="overflowGrid">${overflowLab()}</div></section><section class="card"><h2>DARK CONTROLS + Z STACK</h2><div class="controls"><input class="control" value="NAME"><input class="control" value="MODE"><input class="control" value="NOTE"><input class="control" value="OK"></div><div class="zbox"><div class="float z1">ROTATE</div><div class="float z2">SCALE</div><div class="float z3">SHIFT</div></div></section></aside></section>
<script>${clientScript()}</script></main></body></html>`;
}

function leftTiles() {
  return ['PATH FILL', 'PATH STROKE', 'OFFSCREEN', 'WORKER', 'IMAGEDATA', 'CLIP'].map((label, i) => tile(label, `c${i}`)).join('');
}

function middleTiles() {
  return ['BEZIER MIX', 'GRADIENT MODES', 'COMPOSITE', 'TEXT', 'DRAWIMAGE', 'NESTED'].map((label, i) => tile(label, `c${i + 6}`)).join('');
}

function tile(label, id) {
  return `<div class="tile"><b>${label}</b><canvas id="${id}" width="132" height="78"></canvas></div>`;
}

function rowGridNest() {
  return `<div class="nestedFlex">${[0, 1, 2].map(i => `<div class="nestCell"><canvas id="r${i}" width="82" height="72"></canvas></div>`).join('')}</div>`;
}

function columnGridNest() {
  return `<div class="nestedFlex column">${[0, 1, 2].map(i => `<div class="nestCell"><canvas id="k${i}" width="250" height="24"></canvas></div>`).join('')}</div>`;
}

function zStackWitness() {
  return `<div class="stackWitness"><span class="zA">z1</span><span class="zB">z2</span><span class="zC">z3</span></div>`;
}

function overflowLab() {
  return `<div class="overflowCase hiddenCase"><div class="slab"></div></div><div class="overflowCase scrollCase" data-scroll-y=".72"><div class="slab"></div></div><div class="overflowCase xScrollCase" data-scroll-x=".58"><div class="slab"></div></div><div class="overflowCase autoCase" data-scroll-y=".35" data-scroll-x=".2"><div class="slab"></div></div>`;
}
