// B"H
import { cell } from './mazeLevels.mjs';

/**
 * Side panels: the SVG witness becomes a clear mountain stroke, not a blob.
 * The Awtsmoos separates circle, gradient rectangle, text, and path so each
 * primitive is recognized independently.
 */
export function side() {
  return `${webgl()}${svg()}${imageBitmap()}${matrix()}${miniCorpus()}`;
}

function webgl() {
  return `<section class="web"><b>WEBGL STATE: TEX PROG DRAW FB</b><canvas id="labgl" width="260" height="118"></canvas></section>`;
}

function svg() {
  return `<section class="svgbox"><b>SVG TORTURE</b><svg viewBox="0 0 240 100"><rect x="8" y="8" width="224" height="84" fill="#08162a" stroke="#00d9ff" stroke-width="4"/><linearGradient id="g"><stop offset="0" stop-color="red"/><stop offset="1" stop-color="cyan"/></linearGradient><clipPath id="clip"><rect x="70" y="18" width="58" height="62"/></clipPath><circle cx="42" cy="52" r="18" fill="magenta"/><rect x="76" y="29" width="34" height="40" fill="url(#g)" stroke="white" stroke-width="3"/><path d="M134 78 L164 24 L204 78" fill="none" stroke="yellow" stroke-width="4"/><text x="118" y="48" fill="white" font-size="15">SVG</text></svg></section>`;
}

function imageBitmap() {
  return `<section class="imageChain"><b>IMAGEBITMAP / DRAWIMAGE CHAIN</b><div class="grid3">${cell('im0')}${cell('im1')}${cell('im2')}</div></section>`;
}

function matrix() {
  return `<section class="matrix"><div class="r xformA">R</div><div class="c xformB">S</div><div class="y xformC">M</div></section>`;
}

function miniCorpus() {
  return `<section class="level corpus"><div class="label">UI<br><small>CORPUS</small></div><div class="uiCards"><div><b>IDE</b><span>FILE</span></div><div><b>MAIL</b><span>MSG</span></div><div><b>KAN</b><span>TODO</span></div></div></section>`;
}
