// B"H
import { cell } from './mazeLevels.mjs';

/**
 * Side panels: SVG elements are separated so text never hides behind the arch,
 * and transform boxes are labeled with single giant letters only.
 */
export function side() {
  return `${webgl()}${svg()}${imageBitmap()}${matrix()}${miniCorpus()}`;
}

function webgl() {
  return `<section class="web"><b>WEBGL STATE: TEX PROG DRAW FB</b><canvas id="labgl" width="260" height="118"></canvas></section>`;
}

function svg() {
  return `<section class="svgbox"><b>SVG TORTURE</b><svg viewBox="0 0 240 100"><rect x="8" y="8" width="224" height="84" fill="#08162a" stroke="#00d9ff" stroke-width="4"/><linearGradient id="g"><stop offset="0" stop-color="red"/><stop offset="1" stop-color="cyan"/></linearGradient><clipPath id="clip"><rect x="70" y="18" width="58" height="62"/></clipPath><circle cx="42" cy="52" r="18" fill="magenta"/><rect x="74" y="27" width="36" height="44" fill="url(#g)" stroke="white" stroke-width="3"/><path d="M134 80 C148 22 188 22 204 80" fill="none" stroke="yellow" stroke-width="6"/><text x="116" y="48" fill="white" font-size="15">SVG</text></svg></section>`;
}

function imageBitmap() {
  return `<section class="imageChain"><b>IMAGEBITMAP / DRAWIMAGE CHAIN</b><div class="grid3">${cell('im0')}${cell('im1')}${cell('im2')}</div></section>`;
}

function matrix() {
  return `<section class="matrix"><div class="r xformA">R</div><div class="c xformB">S</div><div class="y xformC">M</div></section>`;
}

function miniCorpus() {
  return `<section class="level corpus"><div class="label">UI<br><small>CORPUS</small></div><div class="grid3">${cell('ui0')}${cell('ui1')}${cell('ui2')}</div></section>`;
}
