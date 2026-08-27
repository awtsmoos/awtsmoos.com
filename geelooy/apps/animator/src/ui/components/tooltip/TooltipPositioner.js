// B"H
/**
 * @class TooltipPositioner
 * @description
 * THE RULER OF SPACE (Kav HaMida).
 * B"H
 * Calculates the exact X and Y coordinates to place the tooltip,
 * ensuring it never clips outside the visible bounds of the browser window.
 */
export class TooltipPositioner {
  static calculate(targetElement, tooltipElement) {
    if (!targetElement || !tooltipElement) return { x: 0, y: 0 };

    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();

    const padding = 10; // Distance from the element
    
    // Default position: Centered above
    let x = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
    let y = targetRect.top - tooltipRect.height - padding;

    // Tzimtzum Constraints (Screen Boundaries)
    const maxW = window.innerWidth;
    const maxH = window.innerHeight;

    // If it hits the left wall
    if (x < padding) x = padding;
    
    // If it hits the right wall
    if (x + tooltipRect.width > maxW - padding) {
      x = maxW - tooltipRect.width - padding;
    }

    // If it hits the roof (top of screen), flip it to below the element!
    if (y < padding) {
      y = targetRect.bottom + padding;
      tooltipElement.classList.add('flipped');
    } else {
      tooltipElement.classList.remove('flipped');
    }

    return { x, y };
  }
}