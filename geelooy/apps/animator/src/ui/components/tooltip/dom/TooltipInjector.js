// B"H
import { HTMLGenerator } from '../../../../core/ui/HTMLGenerator.js';
import { TooltipRenderer } from '../TooltipRenderer.js';
import { TooltipState } from '../TooltipState.js';
import { TooltipPositioner } from '../TooltipPositioner.js';

export class TooltipInjector {
  static container = null;

  static ensureVessel() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'awtsmoos-tooltip-mount';
      this.container.className = 'awtsmoos-tooltip-mount hidden';
      document.body.appendChild(this.container);
    }
  }

  static renderAndShow() {
    if (!this.container || !TooltipState.activeText || !TooltipState.activeTarget) return;

    // Render inner content
    const schema = TooltipRenderer.render(TooltipState.activeText);
    this.container.innerHTML = '';
    this.container.appendChild(HTMLGenerator.generate(schema));

    // Show it momentarily to get bounding box calculations
    this.container.classList.remove('hidden');
    this.container.style.opacity = '0';

    // Calculate physical place
    const pos = TooltipPositioner.calculate(TooltipState.activeTarget, this.container);
    
    this.container.style.left = `${pos.x}px`;
    this.container.style.top = `${pos.y}px`;
    
    // Fade in!
    requestAnimationFrame(() => {
      this.container.style.opacity = '1';
    });
  }

  static hide() {
    if (this.container) {
      this.container.style.opacity = '0';
      // Wait for fade transition before hiding from layout
      setTimeout(() => {
        if (!TooltipState.activeTarget) {
          this.container.classList.add('hidden');
        }
      }, 150);
    }
  }
}