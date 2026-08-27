
// B"H
export class ToastRenderer {
  static render(toasts) {
    return {
      tag: 'div',
      attr: { className: 'toast-stack flex-col gap-2' },
      children: toasts.map(t => ({
        tag: 'div',
        attr: { className: `toast-item glass-panel anim-slide-left type-${t.type}` },
        children: [
          { tag: 'span', attr: { className: 'toast-icon' }, children: this._getIcon(t.type) },
          { tag: 'span', attr: { className: 'toast-msg text-mono text-xs text-bold' }, children: t.message }
        ]
      }))
    };
  }

  static _getIcon(type) {
    const icons = { info: 'ℹ️', success: '✅', warn: '⚠️', error: '☢' };
    return icons[type] || icons.info;
  }
}
