
// B"H
import { HUDFormatter } from '../utils/HUDFormatter.js';
import { HUDIndicatorDot } from './HUDIndicatorDot.js';

export class HUDChronology {
  static render(state) {
    const time = state.get('director_time') || 0;
    const isPlaying = state.get('isPlaying') || false;

    return `
      <div class="hud-stat" style="background: rgba(10,10,15,0.7); backdrop-filter: blur(10px); padding: 0.5rem 1rem; border-left: 3px solid var(--accent-primary); border-radius: 4px;">
        <span class="label" style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-muted); display: block; margin-bottom: 4px;">SYSTEM_CHRONOLOGY</span>
        <span class="value" style="font-family: var(--font-mono); font-size: 1rem; color: var(--text-main); font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
          ${HUDIndicatorDot.render(isPlaying)}
          ${HUDFormatter.formatTime(time)}
        </span>
      </div>
    `;
  }
}
