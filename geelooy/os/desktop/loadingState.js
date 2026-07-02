// B"H
export function markOpening(node, label = 'Opening…') {
  if (!node) return () => {};
  ensureLoadingStyle();
  node.classList.add('awtsmoos-opening');
  node.setAttribute('aria-busy', 'true');
  node.dataset.loadingLabel = label;
  return () => clearOpening(node);
}

export function clearOpening(node) {
  if (!node) return;
  node.classList.remove('awtsmoos-opening');
  node.removeAttribute('aria-busy');
  delete node.dataset.loadingLabel;
}

export function ensureLoadingStyle() {
  if (document.getElementById('awtsmoos-loading-state-style')) return;
  const style = document.createElement('style');
  style.id = 'awtsmoos-loading-state-style';
  style.textContent = `
    .awtsmoos-opening { position: relative; pointer-events: none; filter: saturate(1.25); }
    .awtsmoos-opening::after {
      content: attr(data-loading-label); position: absolute; inset: 8px; border-radius: inherit;
      display: grid; place-items: center; font-weight: 900; color: #eaffff;
      background: rgba(0, 20, 38, .58); backdrop-filter: blur(8px);
      animation: awtsmoosLoadPulse .85s ease-in-out infinite alternate; z-index: 9;
    }
    @keyframes awtsmoosLoadPulse { from { opacity: .68; transform: scale(.98); } to { opacity: 1; transform: scale(1.01); } }
  `;
  document.head.append(style);
}

/** B"H: when a tunnel takes time, the UI still answers with living motion. */
