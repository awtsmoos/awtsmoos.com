// B"H
export function bindViewportState() {
  const set = () => document.documentElement.dataset.homeViewport = innerWidth < 761 ? 'mobile' : 'desktop';
  set();
  addEventListener('resize', set, { passive: true });
}
