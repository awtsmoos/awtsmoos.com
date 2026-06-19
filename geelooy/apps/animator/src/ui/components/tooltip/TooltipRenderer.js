// B"H
import { TooltipVNode } from './dom/TooltipVNode.js';

export class TooltipRenderer {
  static render(text) {
    return TooltipVNode.build(text);
  }
}