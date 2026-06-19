
// B"H
import { HUDTopBar } from './HUDTopBar.js';
import { HUDCenterArea } from './HUDCenterArea.js';

export class HUDContainer {
  static render(state) {
    const message = state.get('hud_message') || '';
    
    return `
      <div class="hud-container" style="pointer-events: none;">
        ${HUDTopBar.render(state)}
        ${message ? HUDCenterArea.render(message) : ''}
      </div>
    `;
  }
}
