// B"H
export class TooltipVNode {
  static build(text) {
    return {
      tag: 'div',
      attr: { className: 'awtsmoos-tooltip-content' },
      children: [
        { tag: 'span', children: text },
        { tag: 'div', attr: { className: 'awtsmoos-tooltip-arrow' } }
      ]
    };
  }
}