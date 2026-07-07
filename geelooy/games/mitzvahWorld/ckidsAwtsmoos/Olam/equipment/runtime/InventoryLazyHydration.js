// B\"H
/** Inventory details hydrate only when seen, but every owned item remains sellable. */
export function createInventoryLazyHydration(items = []) {
  const owned = new Map(items.map(item => [item.id || item.name, { ...item, hydrated: false }]));
  return {
    minimalList() { return [...owned.values()].map(({ id, name, icon, value }) => ({ id, name, icon, value })); },
    hydrate(id, details = {}) {
      const item = owned.get(id);
      if (!item) return null;
      Object.assign(item, details, { hydrated: true });
      return { ...item };
    },
    canSell(id) { return owned.has(id); },
    sellableIds() { return [...owned.keys()]; }
  };
}
