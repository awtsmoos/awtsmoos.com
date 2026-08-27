// B"H
import { UndoButton } from './UndoButton.js';

export class HistoryRenderer {
  static render(historyStack, state) {
    const items = historyStack.slice(-10).reverse().map((entry, idx) => ({
      tag: 'div',
      attr: { className: 'history-item flex-space-between' },
      children: [
        { tag: 'span', attr: { className: 'text-mono text-xs' }, children: `Update: ${entry.key}` },
        { tag: 'span', attr: { className: 'text-dim text-8' }, children: `[-${idx + 1}]` }
      ]
    }));

    return {
      tag: 'div',
      attr: { className: 'history-panel flex-col gap-2' },
      children: [
        { tag: 'h4', attr: { className: 'history-title text-uppercase text-bold text-xs' }, children: 'AKASHIC RECORDS (HISTORY)' },
        { tag: 'div', attr: { className: 'history-list flex-col gap-1' }, children: items.length > 0 ? items : [{ tag: 'span', attr: { className: 'text-xs text-dim' }, children: 'The void is empty.' }] },
        UndoButton.render(state)
      ]
    };
  }
}
