// B"H
/** @file emeraldHudCss.js @description Chapter 420: Emerald HUD CSS is assembled from small style scrolls. */
import { HUD_CSS_LAYOUT } from './hudCssLayout.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { HUD_CSS_PANELS } from './hudCssPanels.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { HUD_CSS_RESPONSIVE } from './hudCssResponsive.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { HUD_CSS_TOKENS } from './hudCssTokens.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function installEmeraldHudCss() {
  document.getElementById('emerald-entry-hud-style')?.remove();
  const style = document.createElement('style');
  style.id = 'emerald-entry-hud-style';
  style.textContent = [HUD_CSS_TOKENS, HUD_CSS_LAYOUT, HUD_CSS_PANELS, HUD_CSS_RESPONSIVE].join('\n');
  document.head.appendChild(style);
}
