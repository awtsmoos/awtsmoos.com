// B"H
import { labyrinthCss } from './styles.mjs';
import { levels } from './mazeLevels.mjs';
import { side } from './sidePanels.mjs';
import { clientScript } from './script.mjs';

/**
 * Markup of the final certification gauntlet. The header is shortened so the
 * human and MiniMax eye can start with confidence rather than cramped text.
 */
export function html() {
  return `<!doctype html><html><head><style>${labyrinthCss()}</style></head><body><main class="lab"><header class="bar"><b>LAYOUT LAB</b><span>GRID / WRAP / MINMAX / ALIGN / Z / SVG / WEBGL / IMAGE</span></header><aside class="panel side">${side()}</aside><section class="panel maze">${levels()}</section><script>${clientScript()}</script></main></body></html>`;
}
