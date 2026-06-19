// B"H
import { TooltipManager } from './TooltipManager.js';
import { TooltipState } from './TooltipState.js';

export class TooltipTriggers {
  static bindGlobal() {
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-awtsmoos-tooltip]');
      if (!target) return;

      const text = target.getAttribute('data-awtsmoos-tooltip');
      if (text) {
        clearTimeout(TooltipState.timeoutId);
        // Delay revelation by 300ms so it doesn't flash erratically
        TooltipState.timeoutId = setTimeout(() => {
          TooltipManager.show(text, target);
        }, 300);
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-awtsmoos-tooltip]');
      if (target) {
        clearTimeout(TooltipState.timeoutId);
        TooltipManager.hide();
      }
    });

    // Hide if scrolling or clicking
    document.addEventListener('mousedown', () => TooltipManager.hide());
    window.addEventListener('scroll', () => TooltipManager.hide(), true);
  }
}