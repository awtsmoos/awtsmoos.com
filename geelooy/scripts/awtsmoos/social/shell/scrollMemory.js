// B"H
const KEY = 'geelooy-scroll-memory';
/** Stores scroll positions by URL so hybrid server pages feel continuous. */
export function bindScrollMemory(storage = sessionStorage) {
  const read = () => JSON.parse(storage.getItem(KEY) || '{}');
  const write = value => storage.setItem(KEY, JSON.stringify(value));
  const remember = () => {
    const map = read();
    map[location.href] = { x: scrollX, y: scrollY };
    write(map);
  };
  addEventListener('pagehide', remember);
  addEventListener('beforeunload', remember);
  addEventListener('pageshow', () => {
    const saved = read()[location.href];
    if (saved) requestAnimationFrame(() => scrollTo(saved.x, saved.y));
  });
}
