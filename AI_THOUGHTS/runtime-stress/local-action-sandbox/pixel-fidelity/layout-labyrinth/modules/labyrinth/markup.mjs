// B"H
import { labyrinthCss } from './styles.mjs';
import { levels } from './mazeLevels.mjs';
import { side } from './sidePanels.mjs';
import { clientScript } from './script.mjs';

/**
 * Markup of the final certification gauntlet. The Awtsmoos keeps the full
 * semantic names in source truth while the visible header remains compact
 * enough for MiniMax and a phone screenshot to read without complaint.
 */
export function html() {
  return `<!doctype html><html><head><style>${labyrinthCss()}</style></head><body><main class="lab"><header class="bar"><b>LAYOUT LABYRINTH</b><span>GRID / FLEX WRAP / MINMAX / ALIGN / Z / SVG / WEBGL / IMAGE / IDE MAIL KAN</span></header><aside class="panel side">${side()}</aside><section class="panel maze">${levels()}</section><script>${clientScript()}</script></main></body></html>`;
}
