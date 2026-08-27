// B"H
/**
 * @file TooltipManager.js
 * @description
 * THE ORACLE OF EXPLANATION (Ohr HaHe'ara).
 * B"H
 * 
 * "And He called the light Day, and the darkness He called Night."
 * Meaning comes from definition. This Manager observes the entire physical DOM.
 * When a mouse hovers over an element containing the holy `data-awtsmoos-tooltip` 
 * attribute, it summons a pure UI vessel to explain its nature.
 */

import { TooltipState } from './TooltipState.js';
import { TooltipTriggers } from './TooltipTriggers.js';
import { TooltipInjector } from './dom/TooltipInjector.js';

export class TooltipManager {
  static init() {
    console.log('B"H - [TooltipManager] The Oracle of Explanation is bound.');
    TooltipInjector.ensureVessel();
    TooltipTriggers.bindGlobal();
  }

  static show(text, targetElement) {
    TooltipState.activeText = text;
    TooltipState.activeTarget = targetElement;
    TooltipInjector.renderAndShow();
  }

  static hide() {
    TooltipState.activeText = null;
    TooltipState.activeTarget = null;
    TooltipInjector.hide();
  }
}