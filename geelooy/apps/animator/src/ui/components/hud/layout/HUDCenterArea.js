
// B"H
import { HUDMessageText } from '../elements/HUDMessageText.js';

export class HUDCenterArea {
  static render(message) {
    return `
      <div class="hud-center" style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;">
        ${HUDMessageText.render(message)}
      </div>
    `;
  }
}
