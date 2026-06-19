
// B"H
import { HUDChronology } from '../elements/HUDChronology.js';

export class HUDTopBar {
  static render(state) {
    return `
      <div class="hud-top" style="display: flex; gap: 1rem;">
        ${HUDChronology.render(state)}
      </div>
    `;
  }
}
