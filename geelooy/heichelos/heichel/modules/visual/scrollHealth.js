// B"H
/** Chapter 310: Heichel scroll health reads the river dimensions. */
export function reportHeichelScrollHealth() {
  const report = {
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
    canScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight,
    topBlockers: [...document.querySelectorAll('.modal-root-open, .geelooy-mobile-drawer, .geelooy-bottom-nav')].map(node => ({ tag: node.tagName, className: node.className }))
  };
  window.__awtsmoosHeichelScrollHealth = report;
  return report;
}
